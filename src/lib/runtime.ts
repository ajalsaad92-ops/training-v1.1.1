// runtime.ts — helpers to detect runtime environment and build API URLs
/* ──────────────────────────────────────────────
   Electron detection
   ────────────────────────────────────────────── */
export function isElectronRuntime(): boolean {
  return !!(
    typeof window !== "undefined" &&
    (window as any).electronAPI
  );
}
/* ──────────────────────────────────────────────
   Capacitor (mobile) detection
   ────────────────────────────────────────────── */
export function isCapacitorNative(): boolean {
  try {
    return !!(window as any).Capacitor?.isNativePlatform?.();
  } catch {
    return false;
  }
}
export function isNativePlatform(): boolean {
  return isElectronRuntime() || isCapacitorNative();
}
/* ──────────────────────────────────────────────
   Detect mobile via User-Agent (fallback)
   ────────────────────────────────────────────── */
export function isMobileDevice(): boolean {
  if (isCapacitorNative()) return true;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}
/* ──────────────────────────────────────────────
   ✅ FIX: Single source of truth for the port.
   Must match electron/main.cjs DEFAULT_PORT.
   ────────────────────────────────────────────── */
export const DEFAULT_API_PORT = 3000;
/**
 * Read the port the local Express server actually bound to.
 *  - On Electron: comes from window.electronAPI (set by preload.cjs).
 *  - On browser/mobile: from the user's appConfig.
 */
function resolveLocalPort(): number {
  if (isElectronRuntime()) {
    const p = (window as any).electronAPI?.apiPort;
    if (typeof p === "number" && p > 0) return p;
  }
  try {
    const stored = localStorage.getItem("tms_app_config");
    if (stored) {
      const cfg = JSON.parse(stored);
      const p = cfg?.localServer?.port;
      if (typeof p === "number" && p > 0) return p;
    }
  } catch {}
  return DEFAULT_API_PORT;
}
/* ──────────────────────────────────────────────
   API base URL for fetch calls
   ────────────────────────────────────────────── */
export function getRuntimeApiBaseUrl(): string {
  // 1) On Electron — server is always on localhost at the port preload told us.
  if (isElectronRuntime()) {
    return `http://localhost:${resolveLocalPort()}`;
  }
  // 2) On phone or browser — read from appConfig in localStorage
  try {
    const CONFIG_KEY = "tms_app_config";
    const stored = localStorage.getItem(CONFIG_KEY);
    if (stored) {
      const cfg = JSON.parse(stored);
      if (cfg.mode === "local" && cfg.localServer?.host) {
        const host = cfg.localServer.host;
        // Skip localhost/127.0.0.1 on mobile — those point to the phone itself
        if (isCapacitorNative() && (host === "127.0.0.1" || host === "localhost" || host === "")) {
          return "";
        }
        const port = cfg.localServer.port || DEFAULT_API_PORT;
        const normalized = host.startsWith("http") ? host : `http://${host}`;
        // Don't add port if already present
        return /:\d+$/.test(normalized) ? normalized : `${normalized}:${port}`;
      }
    }
  } catch {
    // Ignore errors — return empty string
  }
  return "";
}
/**
 * ✅ FIX: Ping the local server using an absolute URL.
 * Necessary because the Electron renderer is loaded via file://,
 * where relative fetches to /api/ping do NOT reach the Express server.
 */
export async function pingLocalServer(timeoutMs = 3000): Promise<boolean> {
  const base = getRuntimeApiBaseUrl();
  if (!base) return false;
  try {
    const res = await fetch(`${base}/api/ping`, { signal: AbortSignal.timeout(timeoutMs) });
    const j = await res.json().catch(() => ({ ok: false }));
    return j?.ok === true;
  } catch {
    return false;
  }
}
