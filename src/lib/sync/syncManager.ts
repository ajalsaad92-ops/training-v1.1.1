// syncManager.ts — Coordinates sync between cloud (Supabase) and local (Express) modes

import { getConfig, isLocalMode } from "@/lib/appConfig";
import {
  startLocalSync,
  stopLocalSync,
  pushToLocalServer,
  pullFromLocalServer,
  pingLocalServer,
} from "@/lib/sync/localServerSync";
import { localDb } from "@/lib/localStore";

export type SyncStatus = "idle" | "syncing" | "connected" | "disconnected" | "error" | "standalone";

interface SyncManagerState {
  status: SyncStatus;
  lastSync: string | null;
  error: string | null;
}

let state: SyncManagerState = {
  status: "idle",
  lastSync: null,
  error: null,
};

let statusListeners: Array<(s: SyncManagerState) => void> = [];

function notify() {
  statusListeners.forEach((fn) => fn({ ...state }));
}

export function onSyncStatusChange(fn: (s: SyncManagerState) => void): () => void {
  statusListeners.push(fn);
  return () => {
    statusListeners = statusListeners.filter((f) => f !== fn);
  };
}

export function getSyncStatus(): SyncManagerState {
  return { ...state };
}

export async function initSync(onDataReceived?: (data: Record<string, unknown>) => void): Promise<void> {
  const config = getConfig();

  if (config.mode === "local") {
    const host = config.localServer?.host;
    if (!host || host === "" ||
        ((host === "127.0.0.1" || host === "localhost") &&
         typeof window !== "undefined" && (window as any).Capacitor?.isNativePlatform?.())) {
      state.status = "disconnected";
      state.error = "No server address configured.";
      notify();
      return;
    }

    state.status = "syncing";
    notify();

    const alive = await pingLocalServer();
    if (alive) {
      state.status = "connected";
      state.lastSync = new Date().toISOString();
      notify();
      startLocalSync((data) => {
        state.lastSync = new Date().toISOString();
        notify();
        const local = localDb.getAll();
        const merged = { ...local, ...data };
        localDb.setAll(merged);
        onDataReceived?.(merged);
      });
    } else {
      state.status = "disconnected";
      state.error = `Local server not reachable at ${host}`;
      notify();
    }
  } else {
    state.status = "connected";
    notify();
  }
}

export async function reinitSyncManager(onDataReceived?: (data: Record<string, unknown>) => void): Promise<void> {
  teardownSync();
  await initSync(onDataReceived);
}

export function teardownSync(): void {
  stopLocalSync();
  state = { status: "idle", lastSync: null, error: null };
  notify();
}

export async function forcePush(): Promise<boolean> {
  if (isLocalMode()) {
    const data = localDb.getAll();
    const success = await pushToLocalServer(data);
    if (success) {
      state.lastSync = new Date().toISOString();
      notify();
    }
    return success;
  }
  return true;
}

export async function forcePull(): Promise<Record<string, unknown> | null> {
  if (isLocalMode()) {
    const data = await pullFromLocalServer();
    if (data) {
      state.lastSync = new Date().toISOString();
      localDb.setAll(data);
      notify();
    }
    return data;
  }
  return null;
}

export function setStandaloneMode(): void {
  stopLocalSync();
  state = { status: "standalone", lastSync: null, error: null };
  notify();
}

export async function persistChanged(): Promise<void> {
  if (isLocalMode()) {
    await forcePush();
  }
  // In cloud mode, persistence is handled automatically
}

export async function manualPullFromCloud(): Promise<{ ok: boolean; message: string }> {
  try {
    state.status = "syncing";
    notify();

    const data = await forcePull();
    
    if (data) {
      state.status = "connected";
      state.lastSync = new Date().toISOString();
      notify();
      return {
        ok: true,
        message: "تم تحديث البيانات من السحابة بنجاح",
      };
    } else {
      state.status = "disconnected";
      return {
        ok: false,
        message: "فشل في سحب البيانات من السحابة",
      };
    }
  } catch (error) {
    state.status = "error";
    state.error = error instanceof Error ? error.message : "Unknown error";
    notify();
    return {
      ok: false,
      message: state.error,
    };
  }
}
