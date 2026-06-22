/**
 * notificationSettings — central control for ALL in-app notifications/alerts.
 *
 * Controls whether notifications are enabled at all, and which channels fire
 * (sound, vibration, OS/system notification). Read by `notify.ts` before every alert.
 */

export interface NotificationSettings {
  /** Master switch — when false, no alerts fire at all. */
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  /** OS / system notifications (visible while the tab is backgrounded). */
  system: boolean;
}

const KEY = "tms_notification_settings";

const DEFAULTS: NotificationSettings = {
  enabled: true,
  sound: true,
  vibration: true,
  system: true,
};

let cache: NotificationSettings | null = null;

export function getNotificationSettings(): NotificationSettings {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch {
    cache = { ...DEFAULTS };
  }
  return cache;
}

export function setNotificationSettings(patch: Partial<NotificationSettings>): NotificationSettings {
  const next = { ...getNotificationSettings(), ...patch };
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("tms_notification_settings_changed", { detail: next }));
  } catch { /* ignore */ }
  return next;
}
