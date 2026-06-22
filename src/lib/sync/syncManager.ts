/**
 * syncManager — SYNCHRONIZATION ORCHESTRATION layer.
 *
 * The one place that decides, based on the current MODE, how data is persisted and synced:
 *
 *  CLOUD MODE  -> behaves exactly like before: automatic, real-time cloud sync (supabaseSync).
 *  LOCAL MODE  -> NO automatic cloud sync. Data is persisted to the central local server
 *                 (localServerSync). Cloud -> Local sync is MANUAL only and never the reverse.
 *
 * Public surface:
 *  - initSync()            : called once on boot (from main.tsx).
 *  - persistChanged()      : called by the data layer whenever the store is saved.
 *  - reinitSync()          : re-evaluate mode (after the user switches modes in Settings).
 *  - manualPullFromCloud() : the ONLY allowed cloud interaction in local mode (Cloud -> Local).
 */

import { getMode } from "@/lib/appConfig";
import * as cloud from "@/lib/supabaseSync";
import * as local from "@/lib/sync/localServerSync";

const STORAGE_KEY = "tms_local_store";
let started = false;

/** Initialise sync for the active mode. Idempotent per mode. */
export function initSync() {
  const mode = getMode();
  if (mode === "local") {
    // Make sure cloud auto-sync is OFF, then start local-server sync.
    try { cloud.stopSync(); } catch { /* noop */ }
    local.startLocalSync();
  } else {
    // Cloud mode: original behaviour — real-time cloud sync.
    try { local.stopLocalSync(); } catch { /* noop */ }
    cloud.startSync();
  }
  started = true;
}

/** Re-evaluate the mode and restart the appropriate sync engine. */
export function reinitSync() {
  try { cloud.stopSync(); } catch { /* noop */ }
  try { local.stopLocalSync(); } catch { /* noop */ }
  started = false;
  initSync();
}

/**
 * Routed persistence hook. Called by the data layer after each save.
 *  - Cloud mode: push to the cloud (only when the cloud is reachable).
 *  - Local mode: push to the central local server. NEVER pushes to the cloud.
 */
export function persistChanged() {
  if (!started) return;
  if (getMode() === "local") {
    local.debouncedLocalPush();
  } else if (cloud.getServerAvailable()) {
    cloud.debouncedPush();
  }
}

export interface ManualSyncResult {
  ok: boolean;
  message: string;
}

/**
 * MANUAL Cloud -> Local sync (the only permitted direction in local mode).
 * Pulls the cloud snapshot, merges it into the local store, and persists it to the
 * local server. Does NOT push anything back to the cloud.
 */
export async function manualPullFromCloud(): Promise<ManualSyncResult> {
  try {
    const remote = await cloud.pullFromSupabase();
    if (!remote) {
      return { ok: false, message: "لا توجد بيانات جديدة في السحابة أو تعذّر الوصول إليها" };
    }
    const localRaw = localStorage.getItem(STORAGE_KEY);
    const localData = localRaw ? JSON.parse(localRaw) : {};
    const merged = { ...localData, ...remote };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));

    // Reflect the pulled data in the UI immediately.
    window.dispatchEvent(new CustomEvent("tms_remote_update"));
    window.dispatchEvent(new CustomEvent("tms_store_changed"));

    // Persist the pulled snapshot to the central local server (if we are in local mode).
    if (getMode() === "local") {
      await local.pushToLocalServer();
    }
    return { ok: true, message: "تم سحب البيانات من السحابة إلى النسخة المحلية بنجاح" };
  } catch {
    return { ok: false, message: "فشلت عملية السحب من السحابة" };
  }
}
