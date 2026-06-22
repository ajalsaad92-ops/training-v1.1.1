import { useState, useEffect } from "react";
import { Wifi, WifiOff, Loader2, Monitor, Smartphone, RefreshCw, Search, CheckCircle } from "lucide-react";
import { setConfig } from "@/lib/appConfig";
import { discoverServer, reinitSync } from "@/lib/sync/localServerSync";

interface ConnectScreenProps {
  onConnect?: () => void;
}

const ConnectScreen = ({ onConnect }: ConnectScreenProps = {}) => {
  const [ip, setIp] = useState("");
  const [error, setError] = useState("");
  const [testing, setTesting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [discovering, setDiscovering] = useState(false);

  // عند فتح الشاشة — جرب الاكتشاف التلقائي
  useEffect(() => {
    const tryAutoDiscover = async () => {
      setDiscovering(true);
      try {
        const found = await discoverServer();
        if (found && found !== "localhost" && found !== "127.0.0.1") {
          setIp(found);
          await doConnect(found);
        }
      } catch {
        // تجاهل
      }
      setDiscovering(false);
    };
    tryAutoDiscover();
  }, []);

  const doConnect = async (targetIp: string) => {
    const trimmed = targetIp.trim();
    if (!trimmed) {
      setError("يرجى إدخال عنوان IP الخاص بالحاسوب");
      return;
    }
    setTesting(true);
    setError("");
    setSuccess(false);

    const base = trimmed.startsWith("http") ? trimmed : `http://${trimmed}`;
    const hasPort = base.indexOf(":", base.indexOf("://") + 3) > -1;
    const url = hasPort ? base : `${base}:3000`;

    try {
      const res = await fetch(`${url}/api/ping`, { signal: AbortSignal.timeout(5000) });
      const data = await res.json();
      if (data.ok) {
        // ✅ حفظ العنوان في appConfig (وليس في مفتاح خاطئ!)
        setConfig({
          mode: "local",
          localServer: {
            host: trimmed,
            port: 3000,
            autoSync: true,
          },
        });

        // ✅ إعادة تهيئة المزامنة مع العنوان الجديد
        reinitSync((syncData) => {
          console.log("[ConnectScreen] Sync data received after connect");
          const localRaw = localStorage.getItem("tms_local_store");
          const localData = localRaw ? JSON.parse(localRaw) : {};
          const merged = { ...localData, ...syncData };
          localStorage.setItem("tms_local_store", JSON.stringify(merged));
          try { window.dispatchEvent(new CustomEvent("tms_store_changed")); } catch { /* noop */ }
        });

        setSuccess(true);

        // ✅ إبلاغ التطبيق بنجاح الاتصال — بدون window.location.href!
        setTimeout(() => {
          if (onConnect) {
            onConnect();
          } else {
            window.dispatchEvent(new CustomEvent("tms-config-changed"));
          }
        }, 800);
      } else {
        setError("الخادم استجب لكن بشكل غير صحيح");
      }
    } catch {
      setError("تعذر الاتصال بالخادم. تأكد من أن الحاسوب والهاتف على نفس شبكة WiFi وأن الخادم يعمل");
    }
    setTesting(false);
  };

  const handleConnect = () => doConnect(ip);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleConnect();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/50 p-4" dir="rtl">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-3">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Monitor className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">نظام التدريب</h1>
          <p className="text-muted-foreground text-base">الاتصال بالخادم على الحاسوب</p>
        </div>

        <div className="bg-card border rounded-2xl p-6 space-y-5 text-right shadow-sm">
          <div className="flex items-center gap-3 bg-muted/50 rounded-xl p-3">
            <Smartphone className="w-5 h-5 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">هذا الجهاز (الهاتف)</span>
          </div>

          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center gap-1">
              <div className="w-px h-8 bg-border"></div>
              <Wifi className={`w-6 h-6 ${success ? "text-green-500" : error ? "text-destructive" : "text-muted-foreground"}`} />
              <div className="w-px h-8 bg-border"></div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-muted/50 rounded-xl p-3">
            <Monitor className="w-5 h-5 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">الحاسوب (الخادم)</span>
          </div>

          {discovering && (
            <div className="flex items-center gap-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl p-3">
              <Search className="w-4 h-4 shrink-0 animate-pulse" />
              <span className="text-xs">جارٍ البحث التلقائي عن الخادم على الشبكة...</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">عنوان IP للحاسوب</label>
            <input
              autoFocus
              value={ip}
              onChange={e => { setIp(e.target.value); setError(""); setSuccess(false); }}
              onKeyDown={handleKeyDown}
              placeholder="مثال: 192.168.1.100"
              dir="ltr"
              className="w-full px-4 py-3 rounded-xl border bg-background text-foreground text-sm text-center placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
            <p className="text-xs text-muted-foreground">أدخل عنوان IP المحلي للحاسوب على نفس شبكة WiFi</p>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-destructive/10 text-destructive rounded-xl p-3">
              <WifiOff className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="text-xs">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 bg-green-500/10 text-green-600 rounded-xl p-3">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span className="text-xs font-medium">تم الاتصال بنجاح! جارٍ تحميل البيانات...</span>
            </div>
          )}

          <button
            onClick={handleConnect}
            disabled={testing || discovering || !ip.trim()}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-primary/90 transition"
          >
            {testing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                جارٍ الاتصال...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                اتصال
              </>
            )}
          </button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>تأكد من تشغيل نظام التدريب على الحاسوب أولاً</p>
          <p>يجب أن يكون الجهازان على نفس شبكة WiFi</p>
        </div>
      </div>
    </div>
  );
};

export default ConnectScreen;
