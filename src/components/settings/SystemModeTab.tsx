import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import {
  Cloud, HardDrive, Server, Smartphone, RefreshCw, Wifi, WifiOff, Loader2,
  DownloadCloud, CheckCircle2, Search, ShieldOff, ShieldCheck, MonitorSmartphone, Save,
  Copy, Check, Network,
} from "lucide-react";
import {
  getConfig, setConfig, type AppMode, type ServerRole,
} from "@/lib/appConfig";
import { reinitSync, manualPullFromCloud } from "@/lib/sync/syncManager";
import {
  pingLocalServer, discoverServer, getConnectedDevices, setDeviceBlocked,
  getServerNetworkInfo, type ConnectedDevice, type ServerNetworkInfo,
} from "@/lib/sync/localServerSync";
import { getDeviceName, setDeviceName } from "@/lib/deviceIdentity";
import { checkForUpdates, applyUpdates, type UpdateCategory, type UpdateCategoryId } from "@/lib/updates/updateManager";

const SectionCard = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) => (
  <div className="bg-card rounded-lg border border-border p-4 space-y-3">
    <h3 className="font-bold text-sm text-foreground flex items-center gap-2"><Icon className="w-4 h-4 text-primary" />{title}</h3>
    {children}
  </div>
);

const SystemModeTab = () => {
  const [cfg, setCfg] = useState(() => getConfig());
  const [deviceName, setDevName] = useState(() => getDeviceName());
  const [testing, setTesting] = useState(false);
  const [serverStatus, setServerStatus] = useState<"unknown" | "online" | "offline">("unknown");
  const [discovering, setDiscovering] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const isLocal = cfg.mode === "local";

  const applyConfig = (patch: Partial<typeof cfg>) => {
    const next = setConfig(patch);
    setCfg({ ...next });
  };

  const switchMode = (mode: AppMode) => {
    applyConfig({ mode });
    reinitSync();
    toast({ title: mode === "local" ? "تم التحويل إلى الوضع المحلي" : "تم التحويل إلى الوضع السحابي" });
  };

  const switchRole = (serverRole: ServerRole) => {
    applyConfig({ serverRole });
    reinitSync();
  };

  const testConnection = async () => {
    setTesting(true);
    setServerStatus("unknown");
    const ok = await pingLocalServer();
    setServerStatus(ok ? "online" : "offline");
    setTesting(false);
    toast({
      title: ok ? "الخادم المحلي متصل" : "تعذّر الوصول إلى الخادم المحلي",
      variant: ok ? "default" : "destructive",
    });
  };

  const runDiscovery = async () => {
    setDiscovering(true);
    const host = await discoverServer();
    setDiscovering(false);
    if (host) {
      applyConfig({ localServer: { ...cfg.localServer, host } });
      toast({ title: "تم العثور على الخادم", description: host });
      setServerStatus("online");
    } else {
      toast({ title: "لم يتم العثور على خادم محلي", description: "أدخل عنوان IP يدوياً", variant: "destructive" });
    }
  };

  const runManualSync = async () => {
    setSyncing(true);
    const res = await manualPullFromCloud();
    setSyncing(false);
    toast({ title: res.ok ? "تمت المزامنة" : "فشلت المزامنة", description: res.message, variant: res.ok ? "default" : "destructive" });
  };

  const saveDeviceName = () => {
    setDeviceName(deviceName);
    toast({ title: "تم حفظ اسم الجهاز" });
  };

  return (
    <div className="space-y-4">
      {/* ===== MODE ===== */}
      <SectionCard title="وضع التشغيل" icon={cfg.mode === "cloud" ? Cloud : HardDrive}>
        <p className="text-xs text-muted-foreground">اختر طريقة عمل التطبيق. الوضع السحابي هو الافتراضي ويبقي السلوك الحالي كما هو.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button onClick={() => switchMode("cloud")}
            className={`text-right rounded-lg border p-3 transition-all ${cfg.mode === "cloud" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-muted/40"}`}>
            <div className="flex items-center gap-2 mb-1"><Cloud className="w-4 h-4 text-primary" /><span className="text-xs font-bold">الوضع السحابي</span></div>
            <p className="text-[10px] text-muted-foreground">مزامنة تلقائية فورية مع قاعدة البيانات السحابية (السلوك الحالي).</p>
          </button>
          <button onClick={() => switchMode("local")}
            className={`text-right rounded-lg border p-3 transition-all ${cfg.mode === "local" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-muted/40"}`}>
            <div className="flex items-center gap-2 mb-1"><HardDrive className="w-4 h-4 text-primary" /><span className="text-xs font-bold">الوضع المحلي / دون إنترنت</span></div>
            <p className="text-[10px] text-muted-foreground">يعمل دون إنترنت. تُحفظ البيانات على الخادم المحلي فقط. المزامنة يدوية (سحابة ← محلي).</p>
          </button>
        </div>
      </SectionCard>

      {isLocal && (
        <>
          {/* ===== SERVER ROLE & CONNECTION ===== */}
          <SectionCard title="دور الجهاز والاتصال بالخادم المحلي" icon={Server}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={() => switchRole("server")}
                className={`text-right rounded-lg border p-3 transition-all ${cfg.serverRole === "server" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-muted/40"}`}>
                <div className="flex items-center gap-2 mb-1"><Server className="w-4 h-4 text-primary" /><span className="text-xs font-bold">هذا الجهاز هو الخادم</span></div>
                <p className="text-[10px] text-muted-foreground">حاسوب Windows مركزي: الخادم + قاعدة البيانات + مكان التخزين.</p>
              </button>
              <button onClick={() => switchRole("client")}
                className={`text-right rounded-lg border p-3 transition-all ${cfg.serverRole === "client" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-muted/40"}`}>
                <div className="flex items-center gap-2 mb-1"><Smartphone className="w-4 h-4 text-primary" /><span className="text-xs font-bold">هذا الجهاز عميل</span></div>
                <p className="text-[10px] text-muted-foreground">هاتف أو حاسوب يتصل بالخادم المركزي على نفس الشبكة.</p>
              </button>
            </div>

            {cfg.serverRole === "client" && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-2">
                  <div className="space-y-1">
                    <Label className="text-[11px]">عنوان IP للخادم</Label>
                    <Input dir="ltr" value={cfg.localServer.host} placeholder="192.168.1.10"
                      onChange={(e) => applyConfig({ localServer: { ...cfg.localServer, host: e.target.value } })}
                      className="h-8 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">المنفذ</Label>
                    <Input dir="ltr" type="number" value={cfg.localServer.port}
                      onChange={(e) => applyConfig({ localServer: { ...cfg.localServer, port: Number(e.target.value) || 3000 } })}
                      className="h-8 text-xs" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={testConnection} disabled={testing}>
                    {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}اختبار الاتصال
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={runDiscovery} disabled={discovering}>
                    {discovering ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}بحث تلقائي
                  </Button>
                  {serverStatus !== "unknown" && (
                    <span className={`text-[11px] flex items-center gap-1 ${serverStatus === "online" ? "text-green-600" : "text-destructive"}`}>
                      {serverStatus === "online" ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                      {serverStatus === "online" ? "متصل" : "غير متصل"}
                    </span>
                  )}
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={cfg.autoDiscover} onCheckedChange={(v) => applyConfig({ autoDiscover: !!v })} />
                  <span className="text-[11px] text-muted-foreground">محاولة البحث التلقائي عن الخادم عند بدء التشغيل</span>
                </label>
              </div>
            )}

            {cfg.serverRole === "server" && (
              <div className="space-y-3 pt-1">
                <ServerConnectionInfo port={cfg.localServer.port} />
                <div className="space-y-1">
                  <Label className="text-[11px]">مسار التخزين المحلي على الخادم (اختياري)</Label>
                  <Input dir="ltr" value={cfg.storagePath} placeholder="C:\\TMS\\data"
                    onChange={(e) => applyConfig({ storagePath: e.target.value })} className="h-8 text-xs" />
                  <p className="text-[10px] text-muted-foreground">يُستخدم في نسخة سطح المكتب لتحديد مكان قاعدة البيانات والملفات.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 pt-1">
              <div className="space-y-1">
                <Label className="text-[11px]">اسم هذا الجهاز (يظهر للمسؤول)</Label>
                <Input value={deviceName} onChange={(e) => setDevName(e.target.value)} className="h-8 text-xs" />
              </div>
              <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs self-end" onClick={saveDeviceName}>
                <Save className="w-3.5 h-3.5" />حفظ
              </Button>
            </div>
          </SectionCard>

          {/* ===== MANUAL SYNC ===== */}
          <SectionCard title="المزامنة اليدوية (سحابة ← محلي)" icon={DownloadCloud}>
            <p className="text-xs text-muted-foreground">يسحب البيانات من السحابة إلى النسخة المحلية فقط. لا يرفع أي بيانات محلية إلى السحابة.</p>
            <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={runManualSync} disabled={syncing}>
              {syncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <DownloadCloud className="w-3.5 h-3.5" />}سحب من السحابة الآن
            </Button>
          </SectionCard>

          {/* ===== DEVICE MONITOR (server only) ===== */}
          {cfg.serverRole === "server" && <DeviceMonitor />}
        </>
      )}

      {/* ===== MANUAL UPDATES ===== */}
      <UpdatesPanel />
    </div>
  );
};

// ===== Connected devices monitor =====
const DeviceMonitor = () => {
  const [devices, setDevices] = useState<ConnectedDevice[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setDevices(await getConnectedDevices());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 10_000);
    return () => clearInterval(t);
  }, [refresh]);

  const toggleBlock = async (d: ConnectedDevice) => {
    const ok = await setDeviceBlocked(d.id, !d.blocked);
    if (ok) { toast({ title: !d.blocked ? "تم حظر الجهاز" : "تم رفع الحظر" }); refresh(); }
    else toast({ title: "تعذّر تنفيذ الإجراء", variant: "destructive" });
  };

  return (
    <SectionCard title="الأجهزة المتصلة" icon={MonitorSmartphone}>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">الأجهزة المتصلة بهذا الخادم المركزي.</p>
        <Button size="sm" variant="ghost" className="h-7 gap-1 text-[11px]" onClick={refresh} disabled={loading}>
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}تحديث
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px] text-right">
          <thead className="bg-muted/50"><tr>
            <th className="p-2">الجهاز</th><th className="p-2">النوع</th><th className="p-2">IP</th>
            <th className="p-2">الحالة</th><th className="p-2">آخر ظهور</th><th className="p-2">إجراء</th>
          </tr></thead>
          <tbody>
            {devices.length ? devices.map((d) => (
              <tr key={d.id} className="border-t border-border/50">
                <td className="p-2 font-medium">{d.name}</td>
                <td className="p-2 text-muted-foreground">{d.type}</td>
                <td className="p-2 text-muted-foreground" dir="ltr">{d.ip}</td>
                <td className="p-2">
                  <span className={`inline-flex items-center gap-1 ${d.online ? "text-green-600" : "text-muted-foreground"}`}>
                    {d.online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                    {d.online ? "متصل" : "غير متصل"}
                  </span>
                </td>
                <td className="p-2 text-muted-foreground">{d.lastSeen ? new Date(d.lastSeen).toLocaleString("ar-SA") : "—"}</td>
                <td className="p-2">
                  <Button size="sm" variant="ghost" className="h-6 gap-1 text-[10px]" onClick={() => toggleBlock(d)}>
                    {d.blocked ? <ShieldCheck className="w-3 h-3 text-green-600" /> : <ShieldOff className="w-3 h-3 text-destructive" />}
                    {d.blocked ? "رفع الحظر" : "حظر"}
                  </Button>
                </td>
              </tr>
            )) : <tr><td colSpan={6} className="text-center py-6 text-muted-foreground">لا توجد أجهزة متصلة (يتطلب تشغيل خادم سطح المكتب)</td></tr>}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
};

// ===== Manual selective updates =====
const UpdatesPanel = () => {
  const [checking, setChecking] = useState(false);
  const [applying, setApplying] = useState(false);
  const [result, setResult] = useState<{ cloudVersion: string; installedVersion: string; categories: UpdateCategory[] } | null>(null);
  const [selected, setSelected] = useState<Set<UpdateCategoryId>>(new Set());

  const check = async () => {
    setChecking(true);
    const r = await checkForUpdates();
    setResult(r);
    setSelected(new Set(r.categories.filter((c) => c.hasUpdate).map((c) => c.id)));
    setChecking(false);
    toast({ title: r.available ? "تتوفر تحديثات" : "النسخة المحلية محدّثة", description: `السحابة: ${r.cloudVersion} • المثبّت: ${r.installedVersion}` });
  };

  const toggle = (id: UpdateCategoryId) => {
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const apply = async () => {
    setApplying(true);
    const r = await applyUpdates(Array.from(selected));
    setApplying(false);
    toast({ title: r.ok ? "تم تطبيق التحديثات المختارة" : "لا شيء لتطبيقه", description: r.message, variant: r.ok ? "default" : "destructive" });
    check();
  };

  return (
    <SectionCard title="التحديثات اليدوية" icon={DownloadCloud}>
      <p className="text-xs text-muted-foreground">تحقّق يدوياً من التحديثات واختر فئات التحديث التي تريد تطبيقها فقط. لا يتم التحديث تلقائياً.</p>
      <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={check} disabled={checking}>
        {checking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}التحقق من التحديثات
      </Button>

      {result && (
        <div className="space-y-2 pt-1">
          <div className="space-y-1">
            {result.categories.map((c) => (
              <label key={c.id} className={`flex items-center justify-between rounded-lg border p-2 cursor-pointer ${c.hasUpdate ? "border-primary/30 bg-primary/5" : "border-border opacity-60"}`}>
                <div className="flex items-center gap-2">
                  <Checkbox checked={selected.has(c.id)} disabled={!c.hasUpdate} onCheckedChange={() => toggle(c.id)} />
                  <span className="text-xs font-medium">{c.label}</span>
                  {!c.inPlace && <span className="text-[9px] bg-warning/10 text-warning rounded px-1">يتطلب تثبيت نسخة</span>}
                </div>
                <span className="text-[10px] text-muted-foreground" dir="ltr">
                  {c.hasUpdate ? `${c.installedVersion} → ${c.availableVersion}` : <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />}
                </span>
              </label>
            ))}
          </div>
          <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={apply} disabled={applying || selected.size === 0}>
            {applying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <DownloadCloud className="w-3.5 h-3.5" />}تطبيق المختار ({selected.size})
          </Button>
        </div>
      )}
    </SectionCard>
  );
};

export default SystemModeTab;
