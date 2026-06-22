/**
 * backup — FULL application backup / restore.
 *
 * A backup captures EVERYTHING the app stores locally so it can be restored on any device:
 *  - the entire data store (employees, courses, HR, curriculum, tasks, archive, ... )
 *  - custom permission overrides
 *  - notification settings
 *  - connection / app config
 */

import { invalidateStore } from "@/lib/localStore";

const STORE_KEY = "tms_local_store";
const PERMS_KEY = "tms_custom_permissions";
const NOTIF_KEY = "tms_notification_settings";
const CONFIG_KEY = "tms_app_config";

export interface FullBackup {
  __tmsBackup: true;
  version: number;
  exportDate: string;
  store: unknown;
  customPermissions: unknown;
  notificationSettings: unknown;
  appConfig: unknown;
}

/** Build a complete backup object from all persisted application data. */
export function buildFullBackup(): FullBackup {
  const read = (k: string) => {
    try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; }
  };
  return {
    __tmsBackup: true,
    version: 2,
    exportDate: new Date().toISOString(),
    store: read(STORE_KEY),
    customPermissions: read(PERMS_KEY),
    notificationSettings: read(NOTIF_KEY),
    appConfig: read(CONFIG_KEY),
  };
}

/** Download the full backup as a JSON file. */
export function downloadFullBackup() {
  const data = buildFullBackup();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tms-backup-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export interface RestoreResult { ok: boolean; message: string; }

/** Restore a backup file (supports both the new full format and the older store-only format). */
export function restoreFromBackup(parsed: unknown): RestoreResult {
  try {
    const write = (k: string, v: unknown) => { if (v != null) localStorage.setItem(k, JSON.stringify(v)); };
    const obj = parsed as Record<string, unknown>;

    if (obj && obj.__tmsBackup) {
      // New full backup format.
      write(STORE_KEY, obj.store);
      write(PERMS_KEY, obj.customPermissions);
      write(NOTIF_KEY, obj.notificationSettings);
      write(CONFIG_KEY, obj.appConfig);
    } else if (obj && (obj.exportDate || obj.employees)) {
      // Legacy: the whole object IS the store (or close to it).
      localStorage.setItem(STORE_KEY, JSON.stringify(obj));
    } else {
      return { ok: false, message: "ملف النسخة الاحتياطية غير صالح" };
    }
    invalidateStore();
    return { ok: true, message: "تمت استعادة جميع البيانات بنجاح" };
  } catch {
    return { ok: false, message: "تعذّرت قراءة ملف النسخة الاحتياطية" };
  }
}
