/**
 * connection — login-time connection orchestration for Local/Offline mode.
 *
 * Behaviour (requested):
 *  - The LOGIN button first checks whether a local server is already running.
 *      - If found  -> connect automatically as a CLIENT, then sign in normally.
 *      - If not, and this device CAN be the central server (the desktop app) -> ask the
 *        user to start the server (storage path + IP/port), then sign in.
 *      - On the phone (client only) -> never create a server; search/connect to the one
 *        central machine, then sign in.
 */

import { getConfig, setConfig } from "@/lib/appConfig";
import { isElectronRuntime } from "@/lib/runtime";
import { reinitSync } from "@/lib/sync/syncManager";
import { discoverServer, pingLocalServer } from "@/lib/sync/localServerSync";

/** True on a real phone (Capacitor native) or a mobile browser that is not the desktop app. */
export function isMobileRuntime(): boolean {
  if (typeof window === "undefined") return false;
  const cap = (window as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  if (cap?.isNativePlatform?.()) return true;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) && !isElectronRuntime();
}

/** Only the desktop (Electron) app may host the single central server. */
export function canHostServer(): boolean {
  return isElectronRuntime();
}

export type LoginConnectionStatus =
  | "connected"    // a local server is reachable; ready to sign in
  | "is-server"    // this device IS the central server; ready to sign in
  | "need-server"  // desktop with no server yet -> prompt to start it
  | "no-server"    // client (phone/other) found no server -> search/connect manually
  | "cloud";       // cloud mode -> sign in normally

export async function prepareLoginConnection(): Promise<LoginConnectionStatus> {
  const cfg = getConfig();

  // Pure cloud mode on a normal browser: nothing to connect to.
  if (cfg.mode === "cloud" && !isElectronRuntime() && !isMobileRuntime()) {
    return "cloud";
  }

  // The central server machine = the desktop (Electron) app. Its server is already running.
  if (isElectronRuntime()) {
    if (cfg.mode !== "local" || cfg.serverRole !== "server") {
      setConfig({ mode: "local", serverRole: "server" });
      reinitSync();
    }
    const ok = await pingLocalServer();
    return ok ? "is-server" : "need-server";
  }

  // Client devices (phone / other laptop): discover the central server on the LAN.
  const host = await discoverServer();
  if (host) {
    setConfig({ mode: "local", serverRole: "client", localServer: { ...cfg.localServer, host } });
    reinitSync();
    if (await pingLocalServer()) return "connected";
  }

  // Fall back to a previously saved host.
  if (cfg.localServer.host) {
    setConfig({ mode: "local", serverRole: "client" });
    reinitSync();
    if (await pingLocalServer()) return "connected";
  }

  // No server reachable: switch this device into local-client so the connection panel shows.
  setConfig({ mode: "local", serverRole: "client" });
  return "no-server";
}

/** Start the central server on this (desktop) device using the chosen storage path + port. */
export async function startCentralServer(opts: { port: number; storagePath: string }): Promise<boolean> {
  setConfig({
    mode: "local",
    serverRole: "server",
    storagePath: opts.storagePath,
    localServer: { ...getConfig().localServer, port: opts.port },
  });
  reinitSync();
  // The desktop main process already serves the API; confirm it is reachable.
  return pingLocalServer();
}
