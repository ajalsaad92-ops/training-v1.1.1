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
   API base URL for fetch calls
   ────────────────────────────────────────────── */
const DEFAULT_PORT = 3000;

export function getRuntimeApiBaseUrl(): string {
  // 1) On Electron — server is always on localhost
  if (isElectronRuntime()) {
    return `http://localhost:${DEFAULT_PORT}`;
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
        const port = cfg.localServer.port || DEFAULT_PORT;
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
