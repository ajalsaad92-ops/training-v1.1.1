// appConfig.ts — Application configuration (cloud vs local mode)

import { isCapacitorNative, isElectronRuntime, isMobileDevice } from "@/lib/runtime";

export type AppMode = "cloud" | "local";

export interface LocalServerConfig {
  host: string;
  port: number;
  autoSync: boolean;
}

export interface AppConfig {
  mode: AppMode;
  localServer: LocalServerConfig;
  lastUpdated: string;
}

const CONFIG_KEY = "tms_app_config";
const DEFAULT_PORT = 3000;

/**
 * تحديد الوضع الافتراضي بناءً على المنصة
 */
export function getDefaultMode(): AppMode {
  if (isElectronRuntime() || isCapacitorNative() || isMobileDevice()) {
    return "local";
  }
  const host = window.location.hostname;
  const isHosted = /lovable\.(app|dev)$|lovableproject\.com$|vercel\.app$|netlify\.app$/i.test(host);
  if (isHosted) return "cloud";
  return "cloud";
}

function getDefaultConfig(): AppConfig {
  return {
    mode: getDefaultMode(),
    localServer: {
      host: isElectronRuntime() ? "127.0.0.1" : "",
      port: DEFAULT_PORT,
      autoSync: true,
    },
    lastUpdated: new Date().toISOString(),
  };
}

export function getConfig(): AppConfig {
  const defaults = getDefaultConfig();
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...defaults,
        ...parsed,
        localServer: {
          ...defaults.localServer,
          ...(parsed.localServer || {}),
        },
      };
    }
  } catch (e) {
    console.warn("[appConfig] Failed to read config:", e);
  }
  return defaults;
}

export function setConfig(partial: Partial<AppConfig>): AppConfig {
  const current = getConfig();
  const updated: AppConfig = {
    ...current,
    ...partial,
    localServer: {
      ...current.localServer,
      ...(partial.localServer || {}),
    },
    lastUpdated: new Date().toISOString(),
  };
  localStorage.setItem(CONFIG_KEY, JSON.stringify(updated));
  try {
    window.dispatchEvent(new CustomEvent("tms-config-changed", { detail: updated }));
  } catch { /* noop */ }
  return updated;
}

export function resetConfig(): void {
  localStorage.removeItem(CONFIG_KEY);
}

export function isLocalMode(): boolean {
  return getConfig().mode === "local";
}

export function isCloudMode(): boolean {
  return getConfig().mode === "cloud";
}
