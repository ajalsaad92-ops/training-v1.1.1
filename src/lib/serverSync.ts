const SYNC_INTERVAL = 5000;
const PUSH_DEBOUNCE = 800;

let syncUrl = "";
let isSyncing = false;
let lastServerTs = 0;
let pushTimer: ReturnType<typeof setTimeout> | null = null;
let pullTimer: ReturnType<typeof setInterval> | null = null;
let onRemoteUpdate: ((data: Record<string, unknown>) => void) | null = null;

export function getServerBase(): string {
  const stored = localStorage.getItem("tms_server_url");
  if (stored) return stored;
  return `${window.location.protocol}//${window.location.host}`;
}

export function setServerUrl(url: string) {
  syncUrl = url.replace(/\/+$/, "");
  localStorage.setItem("tms_server_url", syncUrl);
}

export function isServerAvailable(): boolean {
  return !!syncUrl || window.location.protocol === "http:" || window.location.protocol === "https:";
}

export async function pingServer(url?: string): Promise<{ ok: boolean; ts: number }> {
  const base = url || getServerBase();
  try {
    const res = await fetch(`${base}/api/ping`, { signal: AbortSignal.timeout(3000) });
    const json = await res.json();
    return { ok: json.ok, ts: json.ts };
  } catch {
    return { ok: false, ts: 0 };
  }
}

export async function pullFromServer(): Promise<Record<string, unknown> | null> {
  const base = getServerBase();
  try {
    const res = await fetch(`${base}/api/store`, { signal: AbortSignal.timeout(5000) });
    const json = await res.json();
    if (json.ok && json.data && json.ts > lastServerTs) {
      lastServerTs = json.ts;
      return json.data as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

export async function pushToServer(): Promise<boolean> {
  if (isSyncing) return false;
  isSyncing = true;
  const base = getServerBase();
  try {
    const stored = localStorage.getItem("tms_local_store");
    if (!stored) { isSyncing = false; return false; }
    const data = JSON.parse(stored);
    const res = await fetch(`${base}/api/store`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
      signal: AbortSignal.timeout(5000),
    });
    const json = await res.json();
    if (json.ok) lastServerTs = json.ts;
    isSyncing = false;
    return json.ok;
  } catch {
    isSyncing = false;
    return false;
  }
}

export function debouncedPush() {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushToServer();
  }, PUSH_DEBOUNCE);
}

function applyRemoteUpdate(remoteData: Record<string, unknown>) {
  const localRaw = localStorage.getItem("tms_local_store");
  const localData = localRaw ? JSON.parse(localRaw) : {};
  const merged = { ...localData, ...remoteData };
  localStorage.setItem("tms_local_store", JSON.stringify(merged));
  if (onRemoteUpdate) onRemoteUpdate(merged);
}

let serverAvailable = false;

export function getServerAvailable() { return serverAvailable; }

export function startSync(callback?: (data: Record<string, unknown>) => void) {
  syncUrl = getServerBase();
  onRemoteUpdate = callback || null;

  pingServer(syncUrl).then(ping => {
    serverAvailable = ping.ok;
    if (!serverAvailable) return;

    pullFromServer().then(data => {
      if (data) applyRemoteUpdate(data);
    });

    pullTimer = setInterval(async () => {
      const data = await pullFromServer();
      if (data) applyRemoteUpdate(data);
    }, SYNC_INTERVAL);
  });
}

export function stopSync() {
  if (pullTimer) clearInterval(pullTimer);
  if (pushTimer) clearTimeout(pushTimer);
  pullTimer = null;
  pushTimer = null;
}

export async function getServerIPs(): Promise<{ iface: string; address: string }[]> {
  const base = getServerBase();
  try {
    const res = await fetch(`${base}/api/ip`, { signal: AbortSignal.timeout(3000) });
    const json = await res.json();
    return json.ips || [];
  } catch {
    return [];
  }
}
