// localServerSync.ts — Sync with local Express server (Electron or LAN)

import { getConfig } from "@/lib/appConfig";
import { getRuntimeApiBaseUrl, isCapacitorNative } from "@/lib/runtime";

const DEFAULT_PORT = 3000;

/* ──────────────────────────────────────────────
   Base URL for local server
   ────────────────────────────────────────────── */
export function getLocalServerBaseUrl(): string {
  const runtimeUrl = getRuntimeApiBaseUrl();
  if (runtimeUrl) return runtimeUrl;

  const cfg = getConfig();
  const { host, port } = cfg.localServer;

  if (!host || (isCapacitorNative() && (host === "127.0.0.1" || host === "localhost"))) {
    const legacyIp = localStorage.getItem("tms_laptop_ip");
    if (legacyIp) {
      const normalized = legacyIp.startsWith("http") ? legacyIp : `http://${legacyIp}`;
      return /:\d+$/.test(normalized) ? normalized : `${normalized}:${port || DEFAULT_PORT}`;
    }
    return "";
  }

  const normalized = host.startsWith("http") ? host : `http://${host}`;
  return /:\d+$/.test(normalized) ? normalized : `${normalized}:${port || DEFAULT_PORT}`;
}

/* ──────────────────────────────────────────────
   Ping / Health check
   ────────────────────────────────────────────── */
export async function pingLocalServer(customUrl?: string): Promise<boolean> {
  try {
    const baseUrl = customUrl || getLocalServerBaseUrl();
    if (!baseUrl) return false;
    const res = await fetch(`${baseUrl}/api/ping`, {
      signal: AbortSignal.timeout(3000),
    });
    const data = await res.json();
    return data.ok === true;
  } catch {
    return false;
  }
}

/* ──────────────────────────────────────────────
   Data push / pull — compatible with electron/main.js
   endpoint: /api/store (GET + PUT)
   ────────────────────────────────────────────── */
export async function pushToLocalServer(data: Record<string, unknown>): Promise<boolean> {
  try {
    const baseUrl = getLocalServerBaseUrl();
    if (!baseUrl) return false;
    const res = await fetch(`${baseUrl}/api/store`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });
    const result = await res.json();
    return result.ok === true;
  } catch {
    return false;
  }
}

export async function pullFromLocalServer(): Promise<Record<string, unknown> | null> {
  try {
    const baseUrl = getLocalServerBaseUrl();
    if (!baseUrl) return null;
    const res = await fetch(`${baseUrl}/api/store`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const result = await res.json();
    if (result.ok && result.data) {
      return result.data;
    }
    return null;
  } catch {
    return null;
  }
}

/* ──────────────────────────────────────────────
   Auto-discover server on LAN
   ────────────────────────────────────────────── */
function buildCandidateList(): string[] {
  const candidates: string[] = [];

  const cfg = getConfig();
  if (cfg.localServer.host &&
      cfg.localServer.host !== "127.0.0.1" &&
      cfg.localServer.host !== "localhost" &&
      cfg.localServer.host !== "") {
    candidates.push(cfg.localServer.host);
  }

  const legacyIp = localStorage.getItem("tms_laptop_ip");
  if (legacyIp && !candidates.includes(legacyIp)) {
    candidates.push(legacyIp);
  }

  if (!isCapacitorNative()) {
    candidates.push("localhost", "127.0.0.1");
  }

  const commonPrefixes = [
    "192.168.1", "192.168.0", "192.168.43", "192.168.137",
    "10.0.0", "10.0.1", "172.16.0",
  ];

  for (const prefix of commonPrefixes) {
    for (let i = 1; i <= 15; i++) {
      const addr = `${prefix}.${i}`;
      if (!candidates.includes(addr)) candidates.push(addr);
    }
    for (const suffix of [100, 101, 102, 150, 200, 254]) {
      const addr = `${prefix}.${suffix}`;
      if (!candidates.includes(addr)) candidates.push(addr);
    }
  }

  return candidates;
}

export async function discoverServer(): Promise<string | null> {
  const candidates = buildCandidateList();
  const port = getConfig().localServer.port || DEFAULT_PORT;
  const BATCH_SIZE = 15;

  for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
    const batch = candidates.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map(async (host) => {
        const url = host.startsWith("http") ? host : `http://${host}:${port}`;
        const pingUrl = /:\d+$/.test(url) ? url : `${url}:${port}`;
        const res = await fetch(`${pingUrl}/api/ping`, {
          signal: AbortSignal.timeout(1500),
        });
        const data = await res.json();
        if (data.ok) return host;
        throw new Error("not ok");
      })
    );
    for (const result of results) {
      if (result.status === "fulfilled" && result.value) {
        return result.value;
      }
    }
  }
  return null;
}

/* ──────────────────────────────────────────────
   Sync orchestration
   ────────────────────────────────────────────── */
let syncInterval: ReturnType<typeof setInterval> | null = null;

export function startLocalSync(
  pullCallback: (data: Record<string, unknown>) => void,
  intervalMs = 5000
): void {
  stopLocalSync();
  const doSync = async () => {
    const data = await pullFromLocalServer();
    if (data) pullCallback(data);
  };
  doSync();
  syncInterval = setInterval(doSync, intervalMs);
}

export function stopLocalSync(): void {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}

export function reinitSync(pullCallback: (data: Record<string, unknown>) => void): void {
  stopLocalSync();
  startLocalSync(pullCallback);
}
