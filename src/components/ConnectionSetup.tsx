import { useState, useEffect, useCallback } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  Cloud, Wifi, WifiOff, Loader2, Search, RefreshCw,
  Network, Copy, Check, Lock, Radio, PlugZap,
} from "lucide-react";
import { getConfig, setConfig } from "@/lib/appConfig";
import { isElectronRuntime } from "@/lib/runtime";
import { reinitSync } from "@/lib/sync/syncManager";
import {
  pingLocalServer, discoverServer, getServerNetworkInfo, type ServerNetworkInfo,
} from "@/lib/sync/localServerSync";

/** Password required to switch the app into the (internet) cloud mode. */
const CLOUD_PASSWORD = "7ayatyMais";

/**
 * ConnectionSetup — connection control shown ABOVE the login form.
 *
 * There is NO manual "start server" action anymore. The central server is the
 * installed desktop app itself: once installed and running it IS the server
 * automatically. Client devices (phones / other laptops) only connect to it.
 */
const ConnectionSetup = () => {
  const [cfg, setCfg] = useState(() => getConfig());
  const [cloudOpen, setCloudOpen] = useState(false);

  // The installed desktop app is always the central server.
  const isServer = isElectronRuntime();

  const apply = (patch: Parameters<typeof setConfig>[0]) => {
    const next = setConfig(patch);
    setCfg({ ...next });
  };

  return (
    <div className="mb-6">
      {isServer ? (
        <ServerRunningCard port={cfg.localServer.port} />
      ) : (
        <ClientConnectCard cfg={cfg} apply={apply} onCloud={() => setCloudOpen(true)} />
      )}

      <CloudDialog open={cloudOpen} onOpenChange={setCloudOpen} apply={apply} />
    </div>
  );
};

/* ===================== Server is running (desktop host) ===================== */
const ServerRunningCard = ({ port }: { port: number }) => (
  <div className="rounded-xl border border-primary-foreground/25 bg-primary-foreground/10 backdrop-blur-sm p-4 space-y-3 text-primary-foreground">
    <div className="flex items-center gap-2 text-sm font-bold">
      <Radio className="w-4 h-4 text-green-300 animate-pulse" />
      هذا الجهاز هو الخادم الرئيسي — يعمل تلقائياً
    </div>
    <ServerAddresses port={port} />
  </div>
);

/* ===================== Client connect panel ===================== */
const ClientConnectCard = ({
  cfg, apply, onCloud,
}: {
  cfg: ReturnType<typeof getConfig>;
  apply: (patch: Parameters<typeof setConfig>[0]) => void;
  onCloud: () => void;
}) => {
  const [busy, setBusy] = useState<null | "auto" | "manual">(null);
  const [status, setStatus] = useState<"unknown" | "online" | "offline">("unknown");
  const [manualHost, setManualHost] = useState(cfg.localServer.host || "");

  const autoConnect = async () => {
    setBusy("auto");
    setStatus("unknown");
    const host = await discoverServer();
    if (host) {
      apply({ mode: "local", serverRole: "client", localServer: { ...cfg.localServer, host } });
      const ok = await pingLocalServer();
      setStatus(ok ? "online" : "offline");
      setManualHost(host);
      if (ok) { reinitSync(); toast({ title: "تم الاتصال بالخادم تلقائياً", description: host }); }
    } else {
      setStatus("offline");
      toast({ title: "لم يُعثر على خادم محلي", description: "أدخل عنوان IP يدوياً ثم اضغط اتصال", variant: "destructive" });
    }
    setBusy(null);
  };

  const manualConnect = async () => {
    const host = manualHost.trim();
    if (!host) { toast({ title: "أدخل عنوان IP للخادم", variant: "destructive" }); return; }
    apply({ mode: "local", serverRole: "client", localServer: { ...cfg.localServer, host } });
    setBusy("manual");
    setStatus("unknown");
    const ok = await pingLocalServer();
    setStatus(ok ? "online" : "offline");
    if (ok) { reinitSync(); toast({ title: "تم الاتصال بالخادم" }); }
    else toast({ title: "تعذّر الاتصال", description: "تحقق من عنوان IP والشبكة", variant: "destructive" });
    setBusy(null);
  };

  return (
    <div className="rounded-xl border border-primary-foreground/25 bg-primary-foreground/10 backdrop-blur-sm p-4 space-y-3 text-primary-foreground">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-bold"><PlugZap className="w-4 h-4" />الاتصال بالخادم الرئيسي</span>
        {status !== "unknown" && (
          <span className={`text-[11px] flex items-center gap-1 ${status === "online" ? "text-green-300" : "text-red-300"}`}>
            {status === "online" ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {status === "online" ? "متصل" : "غير متصل"}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button size="sm" className="h-9 gap-1.5 text-xs" onClick={autoConnect} disabled={!!busy}>
          {busy === "auto" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
          اتصال تلقائي
        </Button>
        <Button size="sm" variant="outline" className="h-9 gap-1.5 text-xs bg-transparent" onClick={manualConnect} disabled={!!busy}>
          {busy === "manual" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          اتصال يدوي
        </Button>
      </div>

      <div className="space-y-1">
        <Label className="text-[11px] text-primary-foreground/80">عنوان IP للخادم (للاتصال اليدوي)</Label>
        <Input
          dir="ltr"
          value={manualHost}
          placeholder="مثال: 192.168.1.10"
          onChange={(e) => setManualHost(e.target.value)}
          className="h-9 text-sm bg-primary-foreground/10 border-primary-foreground/25 text-primary-foreground placeholder:text-primary-foreground/40"
        />
      </div>

      <button onClick={onCloud} className="text-[11px] underline text-primary-foreground/80 hover:text-primary-foreground flex items-center gap-1">
        <Cloud className="w-3.5 h-3.5" />التحويل إلى الوضع السحابي
      </button>
    </div>
  );
};

/* ===================== Server LAN addresses ===================== */
const ServerAddresses = ({ port }: { port: number }) => {
  const [info, setInfo] = useState<ServerNetworkInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setInfo(await getServerNetworkInfo());
    setLoading(false);
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  const activePort = info?.port || port || 3003;
  const addresses = (info?.ips || []).map((ip) => `${ip.address}:${activePort}`);

  const copy = async (t: string) => {
    try { await navigator.clipboard.writeText(t); setCopied(t); setTimeout(() => setCopied(null), 1500); } catch { /* noop */ }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] flex items-center gap-1.5"><Network className="w-3.5 h-3.5" />عنوان الاتصال للأجهزة الأخرى</span>
        <button onClick={refresh} className="text-[10px] flex items-center gap-1 opacity-80 hover:opacity-100">
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}تحديث
        </button>
      </div>
      {addresses.length ? addresses.map((addr) => (
        <div key={addr} className="flex items-center justify-between gap-2 rounded-md bg-primary-foreground/10 px-2.5 py-1.5">
          <span className="text-xs font-mono" dir="ltr">{addr}</span>
          <button onClick={() => copy(addr)} className="text-[10px] flex items-center gap-1 opacity-80 hover:opacity-100">
            {copied === addr ? <Check className="w-3 h-3 text-green-300" /> : <Copy className="w-3 h-3" />}{copied === addr ? "تم" : "نسخ"}
          </button>
        </div>
      )) : (
        <p className="text-[10px] text-primary-foreground/70">
          {loading ? "جارٍ قراءة عناوين الشبكة..." : "يظهر العنوان تلقائياً عند تشغيل نسخة سطح المكتب."}
        </p>
      )}
    </div>
  );
};

/* ===================== Cloud switch dialog (password protected) ===================== */
const CloudDialog = ({
  open, onOpenChange, apply,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  apply: (patch: Parameters<typeof setConfig>[0]) => void;
}) => {
  const [pwd, setPwd] = useState("");
  const [pwdErr, setPwdErr] = useState("");

  useEffect(() => {
    if (open) { setPwd(""); setPwdErr(""); }
  }, [open]);

  const confirmCloud = () => {
    if (pwd !== CLOUD_PASSWORD) { setPwdErr("كلمة السر غير صحيحة"); return; }
    apply({ mode: "cloud" });
    reinitSync();
    toast({ title: "تم التحويل إلى الوضع السحابي" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle>الوضع السحابي</DialogTitle>
          <DialogDescription>مزامنة عبر الإنترنت — يتطلب كلمة سر.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-[11px] flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" />كلمة سر الوضع السحابي</Label>
            <Input type="password" dir="ltr" value={pwd} autoFocus
              onChange={(e) => { setPwd(e.target.value); setPwdErr(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") confirmCloud(); }}
              className="h-9 text-sm" />
            {pwdErr && <p className="text-[11px] text-destructive">{pwdErr}</p>}
          </div>
          <div className="flex gap-2">
            <Button className="flex-1 gap-1.5" onClick={confirmCloud}><Cloud className="w-4 h-4" />تأكيد</Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectionSetup;
