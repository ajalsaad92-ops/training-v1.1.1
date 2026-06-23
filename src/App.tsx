import { useEffect, useState } from "react";

type ServerStatus = "starting" | "running" | "error";

export default function App() {
  const [status, setStatus] = useState<ServerStatus>("starting");
  const [time, setTime] = useState<string>(new Date().toLocaleTimeString());

  useEffect(() => {
    // Simulate server boot
    const t = setTimeout(() => setStatus("running"), 800);
    const clock = setInterval(
      () => setTime(new Date().toLocaleTimeString()),
      1000
    );
    return () => {
      clearTimeout(t);
      clearInterval(clock);
    };
  }, []);

  const dot =
    status === "running"
      ? "bg-emerald-500"
      : status === "starting"
      ? "bg-amber-500 animate-pulse"
      : "bg-rose-500";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl shadow-indigo-100 ring-1 ring-slate-200">
        <div className="mb-6 flex items-center gap-3">
          <span className={`h-3 w-3 rounded-full ${dot}`} />
          <h1 className="text-xl font-semibold text-slate-900">
            Training v1.1.1 — Server Status
          </h1>
        </div>

        <div className="space-y-2 text-sm">
          <Row label="Status" value={status.toUpperCase()} />
          <Row label="Server Time" value={time} />
          <Row label="Port" value="5173" />
          <Row label="Host" value="0.0.0.0" />
        </div>

        <button
          onClick={() => setStatus((s) => (s === "running" ? "starting" : "running"))}
          className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 active:scale-[0.99] transition"
        >
          Toggle Status
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between rounded-md bg-slate-50 px-3 py-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-mono text-slate-900">{value}</span>
    </div>
  );
}
