/**
 * appConfig — central MODE HANDLING layer.
 *
 * Single source of truth for whether the app runs in:
 *  - "cloud"  : current behaviour. Data is synced to the cloud database automatically.
 *  - "local"  : offline / LAN mode. A chosen Windows computer runs the local server +
 *               local database + storage. Other devices (phones, computers) connect to it.
 *               No automatic outbound cloud sync happens; sync is manual Cloud -> Local only.
 *
 * This module owns NOTHING about HOW data is moved (that is the sync layer). It only stores
 * configuration and broadcasts changes so the rest of the app can react.
 *
 * Defaults to "cloud" so the existing hosted/cloud behaviour is never broken.
 */

export type AppMode = "cloud" | "local";

/** In local mode a device is either the central server (host machine) or a connecting client. */
export type ServerRole = "server" | "client";

export interface LocalServerConfig {
  /** IP / hostname of the chosen Windows server machine (used by clients). */
  host: string;
  /** Port the local server listens on. */
  port: number;
}

export interface AppConfig {
  mode: AppMode;
  /** Role of THIS device when in local mode. */
  serverRole: ServerRole;
  /** How clients reach the central local server. */
  localServer: LocalServerConfig;
  /** Informational: where the server stores its database/files on the host machine. */
  storagePath: string;
  /** Try to auto-discover the local server on the network before falling back to manual entry. */
  autoDiscover: boolean;
}

const CONFIG_KEY = "tms_app_config";

const DEFAULT_CONFIG: AppConfig = {
  mode: "cloud",
  serverRole: "client",
  localServer: { host: "127.0.0.1", port: 3003 },
  storagePath: "",
  autoDiscover: true,
};

let cache: AppConfig | null = null;

function envMode(): AppMode | null {
  try {
    const m = (import.meta as any)?.env?.VITE_APP_MODE;
    if (m === "local" || m === "cloud") return m;
  } catch { /* noop */ }
  return null;
}

export function getConfig(): AppConfig {
  if (cache) return cache;
  let parsed: Partial<AppConfig> = {};
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) parsed = JSON.parse(raw);
  } catch { /* ignore */ }

  cache = {
    ...DEFAULT_CONFIG,
    ...parsed,
    localServer: { ...DEFAULT_CONFIG.localServer, ...(parsed.localServer || {}) },
  };

  // Environment override always wins (used for forcing a build into a given mode).
  const forced = envMode();
  if (forced) cache.mode = forced;

  return cache;
}

export function setConfig(patch: Partial<AppConfig>): AppConfig {
  const current = getConfig();
  const next: AppConfig = {
    ...current,
    ...patch,
    localServer: { ...current.localServer, ...(patch.localServer || {}) },
  };
  cache = next;
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(next));
  } catch { /* ignore */ }
  try {
    window.dispatchEvent(new CustomEvent("tms_config_changed", { detail: next }));
  } catch { /* noop */ }
  return next;
}

export function getMode(): AppMode {
  return getConfig().mode;
}

export function isLocalMode(): boolean {
  return getMode() === "local";
}

export function isCloudMode(): boolean {
  return getMode() === "cloud";
}

export function isLocalServerHost(): boolean {
  if (typeof window !== "undefined" && (window.location.protocol === "file:" || new URLSearchParams(window.location.search).get("electron") === "1")) {
    return true;
  }
  const c = getConfig();
  return c.mode === "local" && c.serverRole === "server";
}

/** Subscribe to config changes. Returns an unsubscribe function. */
export function onConfigChange(cb: (cfg: AppConfig) => void): () => void {
  const handler = (e: Event) => cb((e as CustomEvent).detail as AppConfig);
  window.addEventListener("tms_config_changed", handler);
  return () => window.removeEventListener("tms_config_changed", handler);
}
