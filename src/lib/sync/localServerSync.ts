/**
 * localServerSync — CONNECTION + LOCAL STORAGE adapter for Local/Offline mode.
 *
 * Responsibilities:
 * - Resolve the base URL of the central local server (the chosen Windows host).
 * - Persist the shared store to the local server.
 * - Pull the shared store from the local server.
 * - Register a heartbeat so the server can monitor connected devices.
 * - List connected devices (server-side admin view).
 * - Best-effort auto-discovery of the server on the LAN.
 *
 * FIX #4: discoverServer() now scans 192.168.x.x / 10.x.x.x LAN ranges.
 * FIX #8: getLocalServerBaseUrl() falls back to tms_laptop_ip when host is 127.0.0.1.
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

/**
 * Build the base URL used to reach the local server from THIS device.
 *
 * FIX #8: When appConfig.localServer.host is still the default "127.0.0.1" (phone never
 * configured it), fall back to the legacy localStorage key "tms_laptop_ip" before giving up.
 * This ensures phones that used older app versions still connect correctly.
 */
export function getLocalServerBaseUrl(): string {
  if (isElectronRuntime()) return getRuntimeApiBaseUrl();

  // When this device IS the host, talk to local server via same origin / localhost.
  if (isLocalServerHost()) {
    if (
      typeof window !== "undefined" &&
      window.location?.origin &&
      !window.location.origin.startsWith("http://localhost:8080")
    ) {
      return window.location.origin;
    }
    const { port } = getConfig().localServer;
    return `http://localhost:${port}`;
  }

  const { host, port } = getConfig().localServer;

  // FIX #8: If host is still the default "127.0.0.1" or empty, try legacy key.
  let effectiveHost = host;
  if ((!host || host === "127.0.0.1") && typeof localStorage !== "undefined") {
    const savedIp = localStorage.getItem("tms_laptop_ip");
    if (savedIp) effectiveHost = savedIp;
  }

  if (!effectiveHost || effectiveHost === "127.0.0.1") return "";
  const normalized = effectiveHost.startsWith("http") ? effectiveHost : `http://${effectiveHost}`;
  return /:\d+$/.test(normalized) ? normalized : `${normalized}:${port}`;
}

export function getLocalServerAvailable(): boolean {
  return serverAvailable;
}

async function fetchJson(
  path: string,
  init?: RequestInit,
  timeoutMs = 5000
): Promise<any> {
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
    const j = await fetchJson("/api/store", {
      method: "PUT",
      body: JSON.stringify({ data: JSON.parse(raw) }),
    });
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
    const j = await fetchJson(`/api/devices/${deviceId}/block`, {
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

// ─── LAN Discovery ───────────────────────────────────────────────────────────

/**
 * Probe a single candidate host. Returns the host string if server is found.
 * Uses /api/discover (lightweight endpoint that returns { ok, role: "server" }).
 */
async function probeCandidate(host: string, port: number): Promise<string | null> {
  try {
    const base = host.startsWith("http") ? host : `http://${host}:${port}`;
    const res = await fetch(`${base}/api/discover`, { signal: AbortSignal.timeout(1200) });
    const j = await res.json();
    if (j?.ok && j?.role === "server") return host;
  } catch { /* try next */ }
  return null;
}

/**
 * Scan a batch of candidates in parallel.
 * FIX #4: Called with LAN subnet ranges so we actually find the laptop on WiFi.
 */
async function scanParallel(
  candidates: string[],
  port: number,
  batchSize = 40
): Promise<string | null> {
  for (let i = 0; i < candidates.length; i += batchSize) {
    const batch = candidates.slice(i, i + batchSize);
    const results = await Promise.allSettled(batch.map(c => probeCandidate(c, port)));
    for (const r of results) {
      if (r.status === "fulfilled" && r.value) return r.value;
    }
  }
  return null;
}

/**
 * Generate LAN IP candidates for the most common private subnets.
 * FIX #4: Covers 192.168.0–5.x (home/office), 10.0.0–1.x (corporate).
 */
function generateLanCandidates(): string[] {
  const ips: string[] = [];
  // 192.168.0.x – 192.168.5.x  (most home routers are in this range)
  for (let sub = 0; sub <= 5; sub++) {
    for (let h = 1; h <= 254; h++) ips.push(`192.168.${sub}.${h}`);
  }
  // 10.0.0.x, 10.0.1.x (common corporate / VPN subnets)
  for (let h = 1; h <= 254; h++) {
    ips.push(`10.0.0.${h}`);
    ips.push(`10.0.1.${h}`);
  }
  return ips;
}

/**
 * Best-effort discovery of the local server on the LAN.
 *
 * FIX #4: Phase 2 now scans 192.168.x.x / 10.x.x.x ranges in parallel batches,
 *   so the function actually finds the laptop on a home/office WiFi network.
 *   Previously only checked localhost/127.0.0.1 — which never works on mobile.
 *
 * @returns the host string of the first responding server, or null.
 */
export async function discoverServer(extraCandidates: string[] = []): Promise<string | null> {
  const { host, port } = getConfig().localServer;

  // Phase 1: Quick candidates — check saved/known addresses first for instant connection.
  const quickSet = new Set<string>([
    host,
    typeof window !== "undefined" ? window.location.hostname : "",
    "localhost",
    "127.0.0.1",
    ...extraCandidates,
  ]);

  // Include legacy localStorage IP if present.
  if (typeof localStorage !== "undefined") {
    const legacy = localStorage.getItem("tms_laptop_ip");
    if (legacy) quickSet.add(legacy);
  }

  for (const c of quickSet) {
    if (!c) continue;
    const found = await probeCandidate(c, port);
    if (found) return found;
  }

  // Phase 2: Full LAN scan — 192.168.x.x / 10.x.x.x in parallel batches.
  // FIX #4: This is the critical step that was previously missing.
  const lanCandidates = generateLanCandidates();
  const lanFound = await scanParallel(lanCandidates, port);
  if (lanFound) return lanFound;

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

  // Heartbeat every 10 s so the server's "connected devices" view stays current.
  heartbeatTimer = setInterval(() => { sendHeartbeat(); }, 10_000);

  // Poll for changes every 5 s. Keeps clients in sync with the host.
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
