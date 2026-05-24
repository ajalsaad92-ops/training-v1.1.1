import { useEffect, useState } from "react";

export const useErrorMonitorCount = () => {
  const [counts, setCounts] = useState({ errorCount: 0, warnCount: 0, total: 0 });
  useEffect(() => {
    const h = (e: Event) => setCounts((e as CustomEvent).detail);
    window.addEventListener("error-monitor-count", h);
    return () => window.removeEventListener("error-monitor-count", h);
  }, []);
  return counts;
};

export const openErrorMonitor = () => {
  window.dispatchEvent(new CustomEvent("toggle-error-monitor", { detail: { visible: true } }));
};
