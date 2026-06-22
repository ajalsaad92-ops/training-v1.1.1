import { useState, useEffect, useCallback } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  Server, HardDrive, Cloud, Wifi, WifiOff, Loader2, Search, RefreshCw,
  Network, Copy, Check, Lock, Radio, Smartphone, PlugZap,
} from "lucide-react";
import { getConfig, setConfig, type AppMode, type ServerRole } from "@/lib/appConfig";
import { reinitSync } from "@/lib/sync/syncManager";
import {
  pingLocalServer, discoverServer, getServerNetworkInfo, type ServerNetworkInfo,
} from "@/lib/sync/localServerSync";

/** Password required to switch the app into the (internet) cloud mode. */
const CLOUD_PASSWORD = "7ayatyMais";

/**
 * ConnectionSetup — the connection control shown ABOVE the login form.
 *
 * Behaviour requested by the user:
 *  1) "فتح الخادم المحلي" button sits above the login.
 *  2) Switching to the cloud mode requires the password 7ayatyMais.
 *  3) Once this device is a local server, the button is replaced by the connection address;
 *     on client devices it is replaced by a clear "اتصال" panel.
 *  4) Choosing "خادم" opens a window to configure the local server then "بدء الخادم" broadcasts it.
 *  5) From another laptop on the same network: "اتصال تلقائي" or "اتصال يدوي".
 */
const ConnectionSetup = () => {
  const [cfg, setCfg] = useState(() => getConfig());
  const [open, setOpen] = useState(false);

  const apply = (patch: Parameters<typeof setConfig>[0]) => {
    const next = setConfig(patch);
    setCfg({ ...next });
  };

  const isLocalServer = cfg.mode === "local" && cfg.serverRole === "server";
  const isLocalClient = cfg.mode === "local" && cfg.serverRole === "client";

  return (
    <div className="mb-6">
      {isLocalServer ? (
        <ServerRunningCard port={cfg.localServer.port} onConfigure={() => setOpen(true)} />
      ) : isLocalClient ? (
        <ClientConnectCard cfg={cfg} apply={apply} onConfigure={() => setOpen(true)} />
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/25 text-primary-foreground font-medium text-sm hover:bg-primary-foreground/20 transition"
        >
          <Server className="w-4 h-4" />
          فتح الخادم المحلي
        </button>
      )}

      <SetupDialog open={open} onOpenChange={setOpen} cfg={cfg} apply={apply} />
    </div>
  );
};

/* ===================== Server is running (host device) ===================== */
const ServerRunningCard = ({ port, onConfigure }: { port: number; onConfigure: () => void }) => (
  <div className="rounded-xl border border-primary-foreground/25 bg-primary-foreground/10 backdrop-blur-sm p-4 space-y-3 text-primary-foreground">
    <div className="flex items-center gap-2 text-sm font-bold">
      <Radio className="w-4 h-4 text-green-300 animate-pulse" />
      الخادم المحلي يعمل على هذا الجهاز
    </div>
    <ServerAddresses port={port} />
    <Button variant="outline" size="sm" className="w-full h-8 gap-1.5 text-xs bg-transparent" onClick={onConfigure}>
      <RefreshCw className="w-3.5 h-3.5" />
      إعدادات الخادم
    </Button>
  </div>
);

/* ===================== Client connect panel ("كلمة اتصال") ===================== */
const ClientConnectCard = ({
  cfg, apply, onConfigure,
}: {
  cfg: ReturnType<typeof getConfig>;
  apply: (patch: Parameters<typeof setConfig>[0]) => void;
  onConfigure: () => void;
}) => {
  const [busy, setBusy] = useState<null | "auto" | "manual">(null);
  const [status, setStatus] = useState<"unknown" | "online" | "offline">("unknown");

  const autoConnect = async () => {
    setBusy("auto");
    setStatus("unknown");
    const host = await discoverServer();
    if (host) {
      apply({ localServer: { ...cfg.localServer, host } });
      const ok = await pingLocalServer();
      setStatus(ok ? "online" : "offline");
      if (ok) { reinitSync(); toast({ title: "تم الاتصال بالخادم تلقائياً", description: host }); }
    } else {
      setStatus("offline");
      toast({ title: "لم يُعثر على خادم محلي", description: "استخدم الاتصال اليدوي وأدخل عنوان IP", variant: "destructive" });
    }
    setBusy(null);
  };

  const manualConnect = async () => {
    if (!cfg.localServer.host.trim()) { onConfigure(); return; }
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
        <span className="flex items-center gap-2 text-sm font-bold"><PlugZap className="w-4 h-4" />الاتصال بالخادم المحلي</span>
        {status !== "unknown" && (
          <span className={`text-[11px] flex items-center gap-1 ${status === "online" ? "text-green-300" : "text-red-300"}`}>
            {status === "online" ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {status === "online" ? "متصل" : "غير متصل"}
          </span>
        )}
      </div>
      {cfg.localServer.host && (
        <p className="text-[11px] text-primary-foreground/70" dir="ltr">{cfg.localServer.host}:{cfg.localServer.port}</p>
      )}
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
      <button onClick={onConfigure} className="text-[11px] underline text-primary-foreground/80 hover:text-primary-foreground">
        تغيير عنوان الخادم أو الوضع
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

  const activePort = info?.port || port || 3000;
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
          {loading ? "جارٍ قراءة عناوين الشبكة..." : "يظهر العنوان عند تشغيل نسخة سطح المكتب كخادم."}
        </p>
      )}
    </div>
  );
};

/* ===================== Setup dialog ===================== */
type Step = "choose" | "server" | "client" | "cloud";

const SetupDialog = ({
  open, onOpenChange, cfg, apply,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  cfg: ReturnType<typeof getConfig>;
  apply: (patch: Parameters<typeof setConfig>[0]) => void;
}) => {
  const [step, setStep] = useState<Step>("choose");
  const [pwd, setPwd] = useState("");
  const [pwdErr, setPwdErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) { setStep("choose"); setPwd(""); setPwdErr(""); }
  }, [open]);

  const startServer = () => {
    apply({ mode: "local", serverRole: "server" });
    reinitSync();
    toast({ title: "تم بدء الخادم المحلي", description: "يبث الخادم الآن وفق الإعدادات المحددة" });
    onOpenChange(false);
  };

  const connectClient = async (auto: boolean) => {
    apply({ mode: "local", serverRole: "client" });
    setBusy(true);
    if (auto) {
      const host = await discoverServer();
      if (host) apply({ localServer: { ...cfg.localServer, host } });
    }
    reinitSync();
    const ok = await pingLocalServer();
    setBusy(false);
    if (ok) { toast({ title: "تم الاتصال بالخادم المحلي" }); onOpenChange(false); }
    else toast({ title: auto ? "لم يُعثر على خادم" : "تعذّر الاتصال", description: "تحقق من العنوان والشبكة", variant: "destructive" });
  };

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
          <DialogTitle>إعداد الاتصال</DialogTitle>
          <DialogDescription>اختر طريقة تشغيل التطبيق على هذا الجهاز.</DialogDescription>
        </DialogHeader>

        {step === "choose" && (
          <div className="space-y-2">
            <ChoiceButton icon={Server} title="تشغيل كخادم محلي" desc="هذا الجهاز يبث البيانات لبقية الأجهزة على الشبكة." onClick={() => setStep("server")} />
            <ChoiceButton icon={Smartphone} title="الاتصال بخادم محلي" desc="جهاز عميل يتصل بخادم على نفس شبكة WiFi." onClick={() => setStep("client")} />
            <ChoiceButton icon={Cloud} title="الوضع السحابي" desc="مزامنة عبر الإنترنت — يتطلب كلمة سر." onClick={() => setStep("cloud")} />
          </div>
        )}

        {step === "server" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[11px]">المنفذ</Label>
                <Input dir="ltr" type="number" value={cfg.localServer.port}
                  onChange={(e) => apply({ localServer: { ...cfg.localServer, port: Number(e.target.value) || 3000 } })}
                  className="h-9 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">مسار التخزين (اختياري)</Label>
                <Input dir="ltr" value={cfg.storagePath} placeholder="C:\TMS\data"
                  onChange={(e) => apply({ storagePath: e.target.value })} className="h-9 text-sm" />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5" />تُحفظ البيانات محلياً على هذا الجهاز وتُبَثّ للأجهزة المتصلة.
            </p>
            <div className="flex gap-2">
              <Button className="flex-1 gap-1.5" onClick={startServer}><Radio className="w-4 h-4" />بدء الخادم</Button>
              <Button variant="outline" onClick={() => setStep("choose")}>رجوع</Button>
            </div>
          </div>
        )}

        {step === "client" && (
          <div className="space-y-3">
            <div className="grid grid-cols-[1fr_100px] gap-2">
              <div className="space-y-1">
                <Label className="text-[11px]">عنوان IP للخادم</Label>
                <Input dir="ltr" value={cfg.localServer.host} placeholder="192.168.1.10"
                  onChange={(e) => apply({ localServer: { ...cfg.localServer, host: e.target.value } })}
                  className="h-9 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">المنفذ</Label>
                <Input dir="ltr" type="number" value={cfg.localServer.port}
                  onChange={(e) => apply({ localServer: { ...cfg.localServer, port: Number(e.target.value) || 3000 } })}
                  className="h-9 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button className="gap-1.5" onClick={() => connectClient(true)} disabled={busy}>
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}اتصال تلقائي
              </Button>
              <Button variant="outline" className="gap-1.5" onClick={() => connectClient(false)} disabled={busy}>
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}اتصال يدوي
              </Button>
            </div>
            <Button variant="ghost" size="sm" className="w-full" onClick={() => setStep("choose")}>رجوع</Button>
          </div>
        )}

        {step === "cloud" && (
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
              <Button variant="outline" onClick={() => setStep("choose")}>رجوع</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const ChoiceButton = ({ icon: Icon, title, desc, onClick }: { icon: React.ElementType; title: string; desc: string; onClick: () => void }) => (
  <button onClick={onClick} className="w-full text-right rounded-lg border border-border p-3 hover:bg-muted/50 transition flex items-start gap-3">
    <Icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
    <span className="space-y-0.5">
      <span className="block text-sm font-bold text-foreground">{title}</span>
      <span className="block text-[11px] text-muted-foreground">{desc}</span>
    </span>
  </button>
);

export default ConnectionSetup;
