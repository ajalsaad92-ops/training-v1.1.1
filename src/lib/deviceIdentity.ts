/**
 * deviceIdentity — stable identity for THIS device.
 *
 * Used by the connection layer so the central local server can list and monitor
 * connected devices (phones / computers) on the LAN.
 */

export type DeviceType = "mobile" | "tablet" | "desktop";

const DEVICE_ID_KEY = "tms_device_id";
const DEVICE_NAME_KEY = "tms_device_name";

function detectType(): DeviceType {
  const ua = navigator.userAgent;
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  if (/Android|iPhone|iPod|Mobile/i.test(ua)) return "mobile";
  return "desktop";
}

function detectPlatformName(): string {
  const ua = navigator.userAgent;
  if (/Windows/i.test(ua)) return "Windows";
  if (/Android/i.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  if (/Macintosh|Mac OS/i.test(ua)) return "macOS";
  if (/Linux/i.test(ua)) return "Linux";
  return "جهاز";
}

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = `dev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function getDeviceName(): string {
  const saved = localStorage.getItem(DEVICE_NAME_KEY);
  if (saved) return saved;
  return `${detectPlatformName()} • ${detectType() === "mobile" ? "هاتف" : detectType() === "tablet" ? "لوحي" : "حاسوب"}`;
}

export function setDeviceName(name: string) {
  localStorage.setItem(DEVICE_NAME_KEY, name);
}

export function getDeviceType(): DeviceType {
  return detectType();
}

export interface DeviceIdentity {
  id: string;
  name: string;
  type: DeviceType;
  platform: string;
  userAgent: string;
}

export function getDeviceIdentity(): DeviceIdentity {
  return {
    id: getDeviceId(),
    name: getDeviceName(),
    type: getDeviceType(),
    platform: detectPlatformName(),
    userAgent: navigator.userAgent,
  };
}
