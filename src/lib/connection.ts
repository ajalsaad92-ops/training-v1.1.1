// connection.ts — Connection management for phone ↔ laptop

import { getConfig, setConfig } from "@/lib/appConfig";
import { isCapacitorNative, isElectronRuntime, isMobileDevice } from "@/lib/runtime";
import { pingLocalServer, discoverServer } from "@/lib/sync/localServerSync";

export type ConnectionStatus = "connected" | "disconnected" | "searching" | "connecting" | "standalone";

interface ConnectionState {
  status: ConnectionStatus;
  serverIp: string | null;
  lastChecked: string | null;
}

let connState: ConnectionState = {
  status: "disconnected",
  serverIp: null,
  lastChecked: null,
};

let listeners: Array<(s: ConnectionState) => void> = [];

function notifyConnection() {
  listeners.forEach((fn) => fn({ ...connState }));
}

export function onConnectionChange(fn: (s: ConnectionState) => void): () => void {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((f) => f !== fn);
  };
}

export function getConnectionStatus(): ConnectionState {
  return { ...connState };
}

export async function autoConnect(): Promise<boolean> {
  if (isElectronRuntime()) {
    connState = { status: "connected", serverIp: "localhost", lastChecked: new Date().toISOString() };
    notifyConnection();
    return true;
  }

  connState.status = "searching";
  notifyConnection();

  const config = getConfig();
  if (config.localServer.host &&
      config.localServer.host !== "127.0.0.1" &&
      config.localServer.host !== "localhost" &&
      config.localServer.host !== "") {
    connState.status = "connecting";
    notifyConnection();
    const alive = await pingLocalServer();
    if (alive) {
      connState = { status: "connected", serverIp: config.localServer.host, lastChecked: new Date().toISOString() };
      notifyConnection();
      return true;
    }
  }

  const found = await discoverServer();
  if (found) {
    setConfig({ mode: "local", localServer: { ...config.localServer, host: found } });
    connState = { status: "connected", serverIp: found, lastChecked: new Date().toISOString() };
    notifyConnection();
    return true;
  }

  if (isCapacitorNative() || isMobileDevice()) {
    connState = { status: "standalone", serverIp: null, lastChecked: new Date().toISOString() };
    notifyConnection();
    return false;
  }

  connState = { status: "disconnected", serverIp: null, lastChecked: new Date().toISOString() };
  notifyConnection();
  return false;
}

export async function connectToServer(ip: string): Promise<boolean> {
  const cleanIp = ip.trim();
  const base = cleanIp.startsWith("http") ? cleanIp : `http://${cleanIp}`;
  const port = getConfig().localServer.port || 3000;
  const hasPort = base.indexOf(":", base.indexOf("://") + 3) > -1;
  const url = hasPort ? base : `${base}:${port}`;

  try {
    const res = await fetch(`${url}/api/ping`, { signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    if (data.ok) {
      setConfig({ mode: "local", localServer: { host: cleanIp, port, autoSync: true } });
      connState = { status: "connected", serverIp: cleanIp, lastChecked: new Date().toISOString() };
      notifyConnection();
      return true;
    }
  } catch { /* fail */ }

  connState = { status: "disconnected", serverIp: null, lastChecked: new Date().toISOString() };
  notifyConnection();
  return false;
}

export function enableStandaloneMode(): void {
  connState = { status: "standalone", serverIp: null, lastChecked: new Date().toISOString() };
  notifyConnection();
}

export function isStandalone(): boolean {
  return connState.status === "standalone";
}

export function disconnect(): void {
  connState = { status: "disconnected", serverIp: null, lastChecked: new Date().toISOString() };
  notifyConnection();
}

/**
 * Prepares the connection for login.
 * - If connected or can auto-connect → "connected"
 * - If Electron (desktop) but no server → "need-server"
 * - If mobile but no server → "no-server"
 */
export async function prepareLoginConnection(): Promise<"connected" | "need-server" | "no-server"> {
  const connected = await autoConnect();

  if (connected) {
    return "connected";
  }

  // If Electron runtime (desktop), user needs to start server
  if (isElectronRuntime()) {
    return "need-server";
  }

  // Mobile/Capacitor standalone mode
  if (isCapacitorNative() || isMobileDevice()) {
    enableStandaloneMode();
    return "connected";
  }

  // No server found and not desktop
  return "no-server";
}

/**
 * Starts the central server on desktop (Electron).
 * Invokes IPC to spawn the server process with given options.
 */
export async function startCentralServer(options: {
  port: number;
  storagePath: string;
}): Promise<boolean> {
  if (!isElectronRuntime()) {
    console.warn("startCentralServer: not running on Electron");
    return false;
  }

  try {
    // Dynamically require electron to avoid issues in non-Electron environments
    const { ipcRenderer } = await import("electron");
    const success = await ipcRenderer.invoke("start-central-server", options);

    if (success) {
      connState = {
        status: "connected",
        serverIp: "localhost",
        lastChecked: new Date().toISOString(),
      };
      notifyConnection();
      setConfig({
        mode: "local",
        localServer: {
          host: "localhost",
          port: options.port,
          autoSync: true,
        },
      });
    }

    return success;
  } catch (error) {
    console.error("Failed to start central server:", error);
    return false;
  }
}
