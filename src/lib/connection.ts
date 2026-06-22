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
