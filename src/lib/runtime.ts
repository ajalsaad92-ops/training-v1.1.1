/** Runtime helpers shared by the web app and the packaged Electron app. */

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

/** Empty string means “same origin” for normal Lovable/web hosting. */
export function getRuntimeApiBaseUrl(): string {
  return isElectronRuntime() ? `http://localhost:${getElectronApiPort()}` : "";
}