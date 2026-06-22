/** Runtime helpers shared by the web app and the packaged Electron app.
 *  Also handles Capacitor (mobile) runtime detection.
 *  FIX #1: getRuntimeApiBaseUrl() now reads from appConfig on mobile.
 */
import { getConfig } from "@/lib/appConfig";

const ELECTRON_PORT_QUERY = "tmsApiPort";
const ELECTRON_PORT_STORAGE = "tms_electron_api_port";

export function isElectronRuntime(): boolean {
  if (typeof window === "undefined") return import.meta.env.MODE === "electron";
  return (
    import.meta.env.MODE === "electron" ||
    window.location.protocol === "file:" ||
    new URLSearchParams(window.location.search).get("electron") === "1"
  );
}

/** True when running inside a Capacitor native shell (Android / iOS). */
export function isNativePlatform(): boolean {
  if (typeof window === "undefined") return false;
  const cap = (window as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return !!cap?.isNativePlatform?.();
}

export function getElectronApiPort(): number {
  if (typeof window === "undefined") return 3000;
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get(ELECTRON_PORT_QUERY);
  if (fromQuery && /^\d+$/.test(fromQuery)) {
    localStorage.setItem(ELECTRON_PORT_STORAGE, fromQuery);
    return Number(fromQuery);
  }
  const saved = localStorage.getItem(ELECTRON_PORT_STORAGE);
  return saved && /^\d+$/.test(saved) ? Number(saved) : 3000;
}

/**
 * Returns the base URL of the API server for the current runtime.
 *  • Electron  → http://localhost:<port>
 *  • Capacitor → reads host/port from appConfig  (FIX #1)
 *  • Web/cloud → "" (same-origin)
 */
export function getRuntimeApiBaseUrl(): string {
  if (isElectronRuntime()) return `http://localhost:${getElectronApiPort()}`;

  // On mobile (Capacitor native): use the server address saved in appConfig.
  if (isNativePlatform()) {
    const cfg = getConfig();
    if (cfg.mode === "local" && cfg.localServer?.host) {
      const { host, port } = cfg.localServer;
      const normalized = host.startsWith("http") ? host : `http://${host}`;
      return /:\d+$/.test(normalized) ? normalized : `${normalized}:${port}`;
    }
    // Legacy fallback key written by older ConnectScreen versions.
    if (typeof localStorage !== "undefined") {
      const savedIp = localStorage.getItem("tms_laptop_ip");
      if (savedIp) {
        const port = getConfig().localServer?.port || 3003;
        const normalized = savedIp.startsWith("http") ? savedIp : `http://${savedIp}`;
        return /:\d+$/.test(normalized) ? normalized : `${normalized}:${port}`;
      }
    }
  }

  return "";
}
