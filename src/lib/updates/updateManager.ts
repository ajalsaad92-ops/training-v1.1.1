/**
 * updateManager — MANUAL, SELECTIVE update system for the Local/Offline version.
 *
 * The cloud version keeps evolving in Lovable (new pages, UI, logic, schema...). The local
 * desktop version must NOT update automatically. Instead the user explicitly:
 *   1. Checks for updates (compares the installed manifest with the cloud manifest).
 *   2. Sees the available update CATEGORIES.
 *   3. Selects only the categories they want.
 *   4. Applies the selected updates.
 *
 * Each app build ships a /version.json manifest. The installed manifest is recorded on first
 * run. "Check for updates" fetches the manifest from the cloud (published) URL and diffs it.
 *
 * Notes on what "applying" means per category:
 *   - data / schema : pulled via the manual Cloud -> Local sync (data is moved into the local DB).
 *   - ui / pages / logic / full : these live in the compiled bundle. Applying them records the
 *     intent and tells the operator to install the new desktop build (the bundle can only be
 *     replaced by a real install, never silently). This keeps the local version reproducible.
 */

import { manualPullFromCloud } from "@/lib/sync/syncManager";

export type UpdateCategoryId = "data" | "schema" | "ui" | "pages" | "logic" | "full";

export interface UpdateCategory {
  id: UpdateCategoryId;
  label: string;
  /** True when the update can be applied in-place (data movement), false when it needs a rebuild. */
  inPlace: boolean;
  installedVersion: string;
  availableVersion: string;
  hasUpdate: boolean;
}

export interface VersionManifest {
  version: string;
  released: string;
  categories: Record<string, { version: string; label: string }>;
}

const INSTALLED_KEY = "tms_installed_manifest";

const CATEGORY_META: Record<UpdateCategoryId, { label: string; inPlace: boolean }> = {
  data: { label: "البيانات", inPlace: true },
  schema: { label: "هيكل قاعدة البيانات", inPlace: true },
  ui: { label: "الواجهة والتصميم", inPlace: false },
  pages: { label: "الصفحات والمكوّنات", inPlace: false },
  logic: { label: "منطق التطبيق والأكواد", inPlace: false },
  full: { label: "تحديث كامل للتطبيق", inPlace: false },
};

async function fetchManifest(url: string): Promise<VersionManifest | null> {
  try {
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    return (await res.json()) as VersionManifest;
  } catch {
    return null;
  }
}

/** The manifest bundled with the currently running build. */
export async function getBundledManifest(): Promise<VersionManifest | null> {
  return fetchManifest("/version.json");
}

/** The manifest recorded at install time (falls back to the bundled one on first run). */
export async function getInstalledManifest(): Promise<VersionManifest | null> {
  try {
    const raw = localStorage.getItem(INSTALLED_KEY);
    if (raw) return JSON.parse(raw) as VersionManifest;
  } catch { /* ignore */ }
  const bundled = await getBundledManifest();
  if (bundled) localStorage.setItem(INSTALLED_KEY, JSON.stringify(bundled));
  return bundled;
}

/**
 * Check the cloud (published) version against the installed one.
 * `cloudManifestUrl` defaults to the published app's /version.json.
 */
export async function checkForUpdates(cloudManifestUrl?: string): Promise<{
  available: boolean;
  cloudVersion: string;
  installedVersion: string;
  categories: UpdateCategory[];
}> {
  const installed = await getInstalledManifest();
  const url = cloudManifestUrl || "https://arabic-tms-hub.lovable.app/version.json";
  const cloud = await fetchManifest(url);

  const cats: UpdateCategory[] = (Object.keys(CATEGORY_META) as UpdateCategoryId[]).map((id) => {
    const meta = CATEGORY_META[id];
    const installedVersion = installed?.categories?.[id]?.version || "0.0.0";
    const availableVersion = cloud?.categories?.[id]?.version || installedVersion;
    return {
      id,
      label: meta.label,
      inPlace: meta.inPlace,
      installedVersion,
      availableVersion,
      hasUpdate: availableVersion !== installedVersion,
    };
  });

  return {
    available: !!cloud && cats.some((c) => c.hasUpdate),
    cloudVersion: cloud?.version || "—",
    installedVersion: installed?.version || "—",
    categories: cats,
  };
}

export interface ApplyResult {
  ok: boolean;
  applied: UpdateCategoryId[];
  needsRebuild: UpdateCategoryId[];
  message: string;
}

/** Apply only the selected update categories. */
export async function applyUpdates(selected: UpdateCategoryId[], cloudManifestUrl?: string): Promise<ApplyResult> {
  const applied: UpdateCategoryId[] = [];
  const needsRebuild: UpdateCategoryId[] = [];

  const wantsData = selected.includes("data") || selected.includes("schema") || selected.includes("full");
  if (wantsData) {
    const res = await manualPullFromCloud();
    if (res.ok) {
      if (selected.includes("data")) applied.push("data");
      if (selected.includes("schema")) applied.push("schema");
    }
  }

  for (const id of selected) {
    if (!CATEGORY_META[id].inPlace) needsRebuild.push(id);
  }

  // Record the newly installed versions for the categories we could apply in place.
  try {
    const url = cloudManifestUrl || "https://arabic-tms-hub.lovable.app/version.json";
    const cloud = await fetchManifest(url);
    const installed = (await getInstalledManifest()) || { version: "0.0.0", released: "", categories: {} };
    if (cloud) {
      for (const id of applied) {
        installed.categories[id] = cloud.categories[id];
      }
      localStorage.setItem(INSTALLED_KEY, JSON.stringify(installed));
    }
  } catch { /* ignore */ }

  const parts: string[] = [];
  if (applied.length) parts.push(`تم تطبيق: ${applied.map((c) => CATEGORY_META[c].label).join("، ")}`);
  if (needsRebuild.length) parts.push(`يتطلب تثبيت نسخة جديدة: ${needsRebuild.map((c) => CATEGORY_META[c].label).join("، ")}`);

  return {
    ok: applied.length > 0 || needsRebuild.length > 0,
    applied,
    needsRebuild,
    message: parts.join(" — ") || "لم يتم اختيار أي تحديث",
  };
}
