/**
 * localServerSync — CONNECTION + LOCAL STORAGE adapter for Local/Offline mode.
 *
 * Responsibilities:
 *  - Resolve the base URL of the central local server (the chosen Windows host).
 *  - Persist the shared store to the local server (so all clients share one source of truth
 *    that lives on the host machine, NOT on each client device).
 *  - Pull the shared store from the local server.
 *  - Register a heartbeat so the server can monitor connected devices.
 *  - List connected devices (server-side admin view).
 *  - Best-effort auto-discovery of the server on the LAN, with manual IP/port fallback.
 *
 * This adapter NEVER talks to the cloud. Cloud access lives in supabaseSync.ts.
 */

import { getConfig, isLocalServerHost } from "@/lib/appConfig";
import { getDeviceIdentity } from "@/lib/deviceIdentity";
import { getRuntimeApiBaseUrl, isElectronRuntime } from "@/lib/runtime";

const STORAGE_KEY = "tms_local_store";
const PUSH_DEBOUNCE = 800;

let pushTimer: ReturnType<typeof setTimeout> | null = null;
let isPushing = false;
let serverAvailable = false;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let onRemote: ((data: Record<string, unknown>) => void) | null = null;
let lastLocalTs = 0;

export interface ConnectedDevice {
  id: string;
  name: string;
  type: string;
  ip: string;
  online: boolean;
  blocked?: boolean;
  lastSeen: string;
  firstSeen?: string;
}

/** Build the base URL used to reach the local server from THIS device. */
export function getLocalServerBaseUrl(): string {
  if (isElectronRuntime()) return getRuntimeApiBaseUrl();

  // When this device IS the host, the server is reachable on the same origin / localhost.
  if (isLocalServerHost()) {
    if (typeof window !== "undefined" && window.location?.origin && !window.location.origin.startsWith("http://localhost:8080")) {
      return window.location.origin;
    }
    const { port } = getConfig().localServer;
    return `http://localhost:${port}`;
  }
  const { host, port } = getConfig().localServer;
  if (!host) return "";
  const normalized = host.startsWith("http") ? host : `http://${host}`;
  // Append port only when the host string does not already contain one.
  return /:\d+$/.test(normalized) ? normalized : `${normalized}:${port}`;
}

export function getLocalServerAvailable(): boolean {
  return serverAvailable;
}

async function fetchJson(path: string, init?: RequestInit, timeoutMs = 5000): Promise<any> {
  const base = getLocalServerBaseUrl();
  if (!base) throw new Error("no_server");
  const res = await fetch(base + path, {
    ...init,
    signal: AbortSignal.timeout(timeoutMs),
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  return res.json();
}

/** Ping the local server and cache availability. */
export async function pingLocalServer(): Promise<boolean> {
  try {
    const j = await fetchJson("/api/ping", undefined, 4000);
    serverAvailable = j?.ok === true;
  } catch {
    serverAvailable = false;
  }
  return serverAvailable;
}

/** Pull the shared store from the local server into localStorage. */
export async function pullFromLocalServer(): Promise<Record<string, unknown> | null> {
  try {
    const j = await fetchJson("/api/store");
    if (j?.ok && j.data) return j.data as Record<string, unknown>;
    return null;
  } catch {
    return null;
  }
}

/** Push the current localStorage store to the local server. */
export async function pushToLocalServer(): Promise<boolean> {
  if (isPushing) return false;
  isPushing = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) { isPushing = false; return false; }
    const j = await fetchJson("/api/store", { method: "PUT", body: JSON.stringify({ data: JSON.parse(raw) }) });
    isPushing = false;
    return j?.ok === true;
  } catch {
    isPushing = false;
    return false;
  }
}

export function debouncedLocalPush() {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => { pushToLocalServer(); }, PUSH_DEBOUNCE);
}

function applyRemote(data: Record<string, unknown>) {
  try {
    const localRaw = localStorage.getItem(STORAGE_KEY);
    const local = localRaw ? JSON.parse(localRaw) : {};
    const merged = { ...local, ...data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent("tms_remote_update"));
    window.dispatchEvent(new CustomEvent("tms_store_changed"));
    if (onRemote) onRemote(merged);
  } catch { /* noop */ }
}

/** Register / refresh this device with the server so it can be monitored. */
export async function sendHeartbeat(): Promise<boolean> {
  try {
    const id = getDeviceIdentity();
    const j = await fetchJson("/api/heartbeat", {
      method: "POST",
      body: JSON.stringify({ id: id.id, name: id.name, type: id.type, platform: id.platform }),
    }, 4000);
    return j?.ok === true;
  } catch {
    return false;
  }
}

/** Admin: list devices the server currently knows about. */
export async function getConnectedDevices(): Promise<ConnectedDevice[]> {
  try {
    const j = await fetchJson("/api/devices");
    return Array.isArray(j?.devices) ? j.devices : [];
  } catch {
    return [];
  }
}

/** Admin: block / unblock a client device. */
export async function setDeviceBlocked(deviceId: string, blocked: boolean): Promise<boolean> {
  try {
    const j = await fetchJson(`/api/devices/${encodeURIComponent(deviceId)}/block`, {
      method: "POST",
      body: JSON.stringify({ blocked }),
    });
    return j?.ok === true;
  } catch {
    return false;
  }
}

export interface ServerNetworkInfo {
  ips: { iface: string; address: string }[];
  port: number;
}

/**
 * Ask the server which LAN addresses it is reachable on. Used on the SERVER device to
 * show clients exactly what to type, and to build copy-paste / QR connection links.
 */
export async function getServerNetworkInfo(): Promise<ServerNetworkInfo | null> {
  try {
    const j = await fetchJson("/api/ip", undefined, 4000);
    if (j?.ok) {
      return {
        ips: Array.isArray(j.ips) ? j.ips : [],
        port: typeof j.port === "number" ? j.port : getConfig().localServer.port,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Best-effort discovery of the local server on the LAN.
 * Browsers cannot enumerate LAN IPs, so we probe likely candidates:
 *  - the saved host, the current page host, localhost, and common gateways.
 * Returns the host string of the first responding server, or null.
 */
export async function discoverServer(extraCandidates: string[] = []): Promise<string | null> {
  const { host, port } = getConfig().localServer;
  const candidates = Array.from(new Set([
    host,
    typeof window !== "undefined" ? window.location.hostname : "",
    "localhost",
    "127.0.0.1",
    ...extraCandidates,
  ].filter(Boolean)));

  for (const c of candidates) {
    try {
      const base = c.startsWith("http") ? c : `http://${c}:${port}`;
      const res = await fetch(base + "/api/discover", { signal: AbortSignal.timeout(2500) });
      const j = await res.json();
      if (j?.ok && j?.role === "server") return c;
    } catch { /* try next */ }
  }
  return null;
}

/** Start local-mode background sync: heartbeat + periodic pull from the server. */
export function startLocalSync(callback?: (data: Record<string, unknown>) => void) {
  onRemote = callback || null;
  stopLocalSync();

  const boot = async () => {
    await pingLocalServer();
    if (serverAvailable) {
      const data = await pullFromLocalServer();
      if (data) applyRemote(data);
      await sendHeartbeat();
    }
  };
  boot();

  // Heartbeat every 10s so the server's "connected devices" view stays current.
  heartbeatTimer = setInterval(() => { sendHeartbeat(); }, 10_000);

  // Poll the server for changes every 5s (LAN, cheap). Keeps clients in sync with the host.
  pollTimer = setInterval(async () => {
    if (!serverAvailable) { await pingLocalServer(); return; }
    const data = await pullFromLocalServer();
    if (data) {
      const ts = (data as any)?.__ts || 0;
      if (ts && ts <= lastLocalTs) return;
      lastLocalTs = ts || Date.now();
      applyRemote(data);
    }
  }, 5_000);
}

export function stopLocalSync() {
  if (heartbeatTimer) { clearInterval(heartbeatTimer); heartbeatTimer = null; }
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
  if (pushTimer) { clearTimeout(pushTimer); pushTimer = null; }
}
