// Notification alerts: sound + vibration + system (OS) notification.
// Works while the app/tab is open or backgrounded. NOTE: delivering alerts
// when the device is fully locked / app closed requires native push (FCM via
// Capacitor) which needs a Firebase server key — see notes in chat.

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    if (!audioCtx) {
      const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
    }
    if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
    return audioCtx;
  } catch {
    return null;
  }
}

/** Generates a short two-tone chime via the Web Audio API (no asset needed). */
export function playNotificationSound() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  const tones = [
    { freq: 880, start: 0, dur: 0.18 },
    { freq: 1318, start: 0.16, dur: 0.22 },
  ];
  for (const t of tones) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = t.freq;
    gain.gain.setValueAtTime(0.0001, now + t.start);
    gain.gain.exponentialRampToValueAtTime(0.25, now + t.start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + t.start + t.dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + t.start);
    osc.stop(now + t.start + t.dur + 0.02);
  }
}

/** Vibrates the device (mobile). No-op on unsupported devices. */
export function vibrate(pattern: number | number[] = [200, 100, 200]) {
  try {
    if ("vibrate" in navigator) navigator.vibrate(pattern);
  } catch {
    /* ignore */
  }
}

/** Asks the user for OS notification permission (call after a user gesture). */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;
    const res = await Notification.requestPermission();
    return res === "granted";
  } catch {
    return false;
  }
}

let lastSystemNotif = 0;

/** Shows an OS-level notification (visible even when the tab is backgrounded). */
export function showSystemNotification(title: string, body: string, onClick?: () => void) {
  try {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    // throttle to avoid spamming if many arrive at once
    const now = Date.now();
    if (now - lastSystemNotif < 800) return;
    lastSystemNotif = now;
    const n = new Notification(title, {
      body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: "tms-notification",
      // @ts-expect-error - non-standard but widely supported for re-alerting
      renotify: true,
      silent: false,
    });
    if (onClick) {
      n.onclick = () => {
        window.focus();
        onClick();
        n.close();
      };
    }
  } catch {
    /* ignore */
  }
}

/** Full alert: sound + vibration + system notification. */
export function alertUser(title: string, body: string, onClick?: () => void) {
  playNotificationSound();
  vibrate();
  showSystemNotification(title, body, onClick);
}
