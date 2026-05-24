import { useState, useEffect, useCallback, useRef } from "react";
import { Bug, X, Copy, Trash2, ChevronUp, ChevronDown } from "lucide-react";

interface ErrorEntry {
  id: string;
  timestamp: string;
  message: string;
  source?: string;
  stack?: string;
  type: "error" | "warning" | "unhandled_promise";
}

const MAX_ERRORS = 50;
let addErrorExternal: ((entry: Omit<ErrorEntry, "id" | "timestamp">) => void) | null = null;

export const captureError = (message: string, source?: string, stack?: string, type: ErrorEntry["type"] = "error") => {
  if (addErrorExternal) addErrorExternal({ message, source, stack, type });
};

const ErrorMonitor = () => {
  const [errors, setErrors] = useState<ErrorEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const isOpenRef = useRef(false);
  isOpenRef.current = isOpen;

  const addError = useCallback((entry: Omit<ErrorEntry, "id" | "timestamp">) => {
    setErrors(prev => {
      const newEntry: ErrorEntry = {
        ...entry,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toLocaleTimeString("ar-SA", { hour12: false }) + "." + String(Date.now() % 1000).padStart(3, "0"),
      };
      return [newEntry, ...prev].slice(0, MAX_ERRORS);
    });
  }, []);

  useEffect(() => {
    addErrorExternal = addError;

    const handleToggle = (e: Event) => {
      setIsOpen((e as CustomEvent).detail.visible);
    };
    window.addEventListener("toggle-error-monitor", handleToggle);

    const originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      const message = args.map(a => {
        if (a instanceof Error) return `${a.message}\n${a.stack || ""}`;
        if (typeof a === "object" && a !== null) { try { return JSON.stringify(a); } catch { return String(a); } }
        return String(a);
      }).join(" ");
      addError({ message, type: "error" });
      originalConsoleError.apply(console, args);
    };

    const originalConsoleWarn = console.warn;
    console.warn = (...args: unknown[]) => {
      const message = args.map(a => String(a)).join(" ");
      addError({ message, type: "warning" });
      originalConsoleWarn.apply(console, args);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      addError({
        message: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined,
        type: "unhandled_promise",
      });
    };

    const handleWindowError = (event: ErrorEvent) => {
      addError({
        message: event.message,
        source: `${event.filename}:${event.lineno}:${event.colno}`,
        stack: event.error?.stack,
        type: "error",
      });
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleWindowError);

    return () => {
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("error", handleWindowError);
      window.removeEventListener("toggle-error-monitor", handleToggle);
      addErrorExternal = null;
    };
  }, [addError]);

  const handleCopy = () => {
    const text = errors.map(e =>
      `[${e.timestamp}] [${e.type.toUpperCase()}] ${e.message}${e.source ? `\n  Source: ${e.source}` : ""}${e.stack ? `\n  Stack: ${e.stack}` : ""}`
    ).join("\n\n");
    navigator.clipboard.writeText(text);
  };

  const errorCount = errors.filter(e => e.type === "error" || e.type === "unhandled_promise").length;
  const warnCount = errors.filter(e => e.type === "warning").length;

  // Broadcast counts so other components (e.g. notifications) can show a badge
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("error-monitor-count", {
      detail: { errorCount, warnCount, total: errorCount + warnCount },
    }));
  }, [errorCount, warnCount]);

  // No floating button — opened only via Settings or notifications dropdown
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] font-mono text-xs no-print" dir="ltr">
      <div
        className="flex items-center justify-between px-3 py-1.5 bg-gray-900 text-gray-100 border-t border-red-500/50 cursor-pointer select-none"
        onClick={() => setIsOpen(false)}
      >
        <div className="flex items-center gap-2">
          <Bug className="w-4 h-4 text-red-400" />
          <span className="font-bold text-red-400">Error Monitor</span>
          {errorCount > 0 && <span className="bg-red-500/30 text-red-300 px-1.5 py-0.5 rounded text-[10px] font-bold">{errorCount} errors</span>}
          {warnCount > 0 && <span className="bg-yellow-500/30 text-yellow-300 px-1.5 py-0.5 rounded text-[10px] font-bold">{warnCount} warnings</span>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); handleCopy(); }} className="p-0.5 hover:bg-white/10 rounded flex items-center gap-1 text-[10px]"><Copy className="w-3 h-3" />Copy</button>
          <button onClick={(e) => { e.stopPropagation(); setErrors([]); }} className="p-0.5 hover:bg-white/10 rounded flex items-center gap-1 text-[10px]"><Trash2 className="w-3 h-3" />Clear</button>
          <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="p-0.5 hover:bg-white/10 rounded"><X className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      <div className="bg-gray-950 text-gray-200 max-h-60 overflow-y-auto border-t border-gray-700">
        {errors.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No errors</div>
        ) : (
          errors.map(entry => (
            <div
              key={entry.id}
              className={`px-3 py-1.5 border-b border-gray-800/50 hover:bg-gray-800/30 ${
                entry.type === "error" || entry.type === "unhandled_promise" ? "border-l-2 border-l-red-500" : "border-l-2 border-l-yellow-500"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-1 py-0.5 rounded font-bold ${
                  entry.type === "error" ? "bg-red-500/20 text-red-400" :
                  entry.type === "unhandled_promise" ? "bg-orange-500/20 text-orange-400" :
                  "bg-yellow-500/20 text-yellow-400"
                }`}>{entry.type.replace("_", " ").toUpperCase()}</span>
                <span className="text-gray-500 text-[10px]">{entry.timestamp}</span>
              </div>
              <p className="text-gray-200 mt-0.5 break-all leading-relaxed">{entry.message}</p>
              {entry.source && <p className="text-gray-500 mt-0.5 text-[10px]">{entry.source}</p>}
              {entry.stack && (
                <details className="mt-1">
                  <summary className="text-gray-500 cursor-pointer hover:text-gray-300 text-[10px]">Stack</summary>
                  <pre className="text-gray-500 mt-0.5 text-[10px] whitespace-pre-wrap break-all max-h-20 overflow-y-auto">{entry.stack}</pre>
                </details>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ErrorMonitor;
