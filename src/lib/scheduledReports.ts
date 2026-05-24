// Scheduled reports — runs while app is open, creates in-app notifications when due
import { localDb } from "@/lib/localStore";
import type { ReportSourceKey } from "@/lib/reportEngine";

export type ScheduleFrequency = "daily" | "weekly" | "monthly";

export interface ScheduledReport {
  id: string;
  name: string;
  source: ReportSourceKey;
  columns: string[];
  template: "official" | "executive";
  frequency: ScheduleFrequency;
  enabled: boolean;
  lastRunAt?: string;
  createdAt: string;
}

const KEY = "tms_scheduled_reports";

export const scheduleStore = {
  getAll(): ScheduledReport[] {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {
      return [];
    }
  },
  save(items: ScheduledReport[]) {
    localStorage.setItem(KEY, JSON.stringify(items));
  },
  add(item: Omit<ScheduledReport, "id" | "createdAt">): ScheduledReport {
    const all = scheduleStore.getAll();
    const newItem: ScheduledReport = { ...item, id: `sch-${Date.now()}`, createdAt: new Date().toISOString() };
    all.push(newItem);
    scheduleStore.save(all);
    return newItem;
  },
  update(id: string, patch: Partial<ScheduledReport>) {
    const all = scheduleStore.getAll();
    const idx = all.findIndex((s) => s.id === id);
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...patch };
      scheduleStore.save(all);
    }
  },
  remove(id: string) {
    scheduleStore.save(scheduleStore.getAll().filter((s) => s.id !== id));
  },
};

function isDue(item: ScheduledReport, nowMs: number): boolean {
  if (!item.enabled) return false;
  if (!item.lastRunAt) return true;
  const last = new Date(item.lastRunAt).getTime();
  const diff = nowMs - last;
  if (item.frequency === "daily") return diff >= 24 * 60 * 60 * 1000;
  if (item.frequency === "weekly") return diff >= 7 * 24 * 60 * 60 * 1000;
  if (item.frequency === "monthly") return diff >= 30 * 24 * 60 * 60 * 1000;
  return false;
}

export function tickScheduledReports(): number {
  const items = scheduleStore.getAll();
  const now = Date.now();
  let triggered = 0;
  items.forEach((item) => {
    if (isDue(item, now)) {
      const freqAr = ({ daily: "اليومي", weekly: "الأسبوعي", monthly: "الشهري" } as const)[item.frequency];
      localDb.notifications.insert({
        user_id: null,
        message: `جاهز للتوليد: التقرير ${freqAr} «${item.name}»`,
        type: "info",
        is_read: false,
        date: new Date().toISOString().split("T")[0],
        link: `/reports?run=${item.id}`,
      });
      scheduleStore.update(item.id, { lastRunAt: new Date().toISOString() });
      triggered++;
    }
  });
  return triggered;
}

let started = false;
export function startScheduler() {
  if (started) return;
  started = true;
  // run on start, then every 5 minutes
  tickScheduledReports();
  setInterval(tickScheduledReports, 5 * 60 * 1000);
}
