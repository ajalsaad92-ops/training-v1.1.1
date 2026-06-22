import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { defaultUserAccounts } from "@/lib/localStore";
import { Shield, LogIn, Eye, EyeOff, UserPlus, Loader2, Server, HardDrive, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import ConnectionSetup from "@/components/ConnectionSetup";
import { getConfig } from "@/lib/appConfig";
import { prepareLoginConnection, startCentralServer } from "@/lib/connection";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [connectStage, setConnectStage] = useState("");

  // Server-setup dialog (shown when this desktop device must start the central server).
  const [serverSetupOpen, setServerSetupOpen] = useState(false);
  const [setupPort, setSetupPort] = useState(() => getConfig().localServer.port || 3000);
  const [setupPath, setSetupPath] = useState(() => getConfig().storagePath || "");
  const [startingServer, setStartingServer] = useState(false);
  const pendingAuth = useState<null | (() => Promise<void>)>(null);

  const { login, signup, user, loading } = useAuth();
  const navigate = useNavigate();

  if (user && !loading) {
    navigate("/", { replace: true });
    return null;
  }

  const doAuth = async (fn: () => Promise<{ success: boolean; error?: string }>) => {
    const result = await fn();
    if (!result.success) {
      setError(result.error || "حدث خطأ أثناء المصادقة");
    } else {
      navigate("/", { replace: true });
    }
  };

  /** Runs the connection check, then the provided auth action. */
  const withConnection = async (authFn: () => Promise<{ success: boolean; error?: string }>) => {
    setError("");
    setSubmitting(true);
    setConnectStage("جارٍ التحقق من الخادم...");
    try {
      const status = await prepareLoginConnection();
      if (status === "need-server") {
        // Desktop with no running server → open the server setup wizard.
        setConnectStage("");
        setSubmitting(false);
        pendingAuth[1](() => doAuth(authFn));
        setServerSetupOpen(true);
        return;
      }
      if (status === "no-server") {
        setConnectStage("");
        setSubmitting(false);
        setError("لم يُعثر على خادم محلي. استخدم لوحة الاتصال بالأعلى (بحث تلقائي أو اتصال يدوي) ثم سجّل الدخول.");
        return;
      }
      // connected / is-server / cloud → proceed.
      setConnectStage("");
      await doAuth(authFn);
    } finally {
      setSubmitting(false);
      setConnectStage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignup && !name) { setError("الرجاء إدخال الاسم"); return; }
    await withConnection(() => (isSignup ? signup(email, password, name) : login(email, password)));
  };

  const quickLogin = async (qEmail: string, qPassword: string) => {
    await withConnection(() => login(qEmail, qPassword));
  };

  const confirmStartServer = async () => {
    setStartingServer(true);
    const ok = await startCentralServer({ port: setupPort, storagePath: setupPath });
    setStartingServer(false);
    if (!ok) {
      toast({ title: "تعذّر تشغيل الخادم", description: "تأكد من تشغيل نسخة سطح المكتب", variant: "destructive" });
      return;
    }
    toast({ title: "تم تشغيل الخادم المحلي", description: "سيتم تسجيل الدخول الآن" });
    setServerSetupOpen(false);
    const run = pendingAuth[0];
    if (run) await run();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/90 via-primary to-primary/80 p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 border border-primary-foreground/20">
            <Shield className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-primary-foreground">نظام التدريب والإدارة الذكي</h1>
          <p className="text-primary-foreground/70 text-sm mt-2">مركز القيادة والتحكم</p>
        </div>

        {/* Connection / server setup — sits ABOVE the login form */}
        <ConnectionSetup />

        <div className="bg-card rounded-2xl shadow-2xl p-8 border border-border">
          <h2 className="text-xl font-bold text-foreground mb-6 text-center">
            {isSignup ? "إنشاء حساب جديد" : "تسجيل الدخول"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignup && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">الاسم الكامل</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="أدخل الاسم الكامل" className="text-right" />
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">البريد الإلكتروني</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="أدخل البريد الإلكتروني" className="text-right" autoFocus />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">كلمة المرور</label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="أدخل كلمة المرور" className="text-right pe-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute start-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {connectStage && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-sm text-primary text-center flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />{connectStage}
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive text-center">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full gap-2" size="lg" disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : isSignup ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              {submitting ? "جاري المعالجة..." : isSignup ? "إنشاء حساب" : "دخول"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button onClick={() => { setIsSignup(!isSignup); setError(""); }} className="text-sm text-primary hover:underline">
              {isSignup ? "لديك حساب بالفعل؟ تسجيل الدخول" : "ليس لديك حساب؟ إنشاء حساب جديد"}
            </button>
          </div>
        </div>

        {/* Quick Login Cards */}
        {!isSignup && (
          <div className="mt-6">
            <p className="text-primary-foreground/60 text-xs text-center mb-3">دخول سريع بحساب جاهز (تجريبي)</p>
            <div className="grid grid-cols-2 gap-2">
              {defaultUserAccounts.filter(acc => !acc.profile.roles.includes("admin")).map((acc) => {
                const sectionLabel = acc.profile.section.startsWith("شعبة المناهج") ? "شعبة المناهج" : acc.profile.section.startsWith("شعبة الإعداد") ? "شعبة الإعداد" : acc.profile.position;
                return (
                  <button
                    key={acc.email}
                    onClick={() => quickLogin(acc.email, acc.password)}
                    disabled={submitting}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 text-right hover:bg-white/20 transition-colors disabled:opacity-50"
                  >
                    <p className="text-sm font-bold text-white truncate">{acc.profile.name}</p>
                    <p className="text-[10px] text-white/60">{sectionLabel}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ===== Server setup dialog (desktop, when no server is running) ===== */}
      <Dialog open={serverSetupOpen} onOpenChange={setServerSetupOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="flex items-center gap-2"><Server className="w-5 h-5 text-primary" />تشغيل الخادم المحلي</DialogTitle>
            <DialogDescription>لم يُعثر على خادم مفتوح. اضبط الخادم المركزي لهذا الجهاز ثم ابدأ التشغيل لتسجيل الدخول.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-[11px] flex items-center gap-1.5"><HardDrive className="w-3.5 h-3.5" />مكان حفظ البيانات</Label>
              <Input dir="ltr" value={setupPath} placeholder="C:\\TMS\\data" onChange={(e) => setSetupPath(e.target.value)} className="h-9 text-sm" />
              <p className="text-[10px] text-muted-foreground">يُحفظ ولا حاجة لإدخاله في كل مرة.</p>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px]">منفذ البث (Port)</Label>
              <Input dir="ltr" type="number" value={setupPort} onChange={(e) => setSetupPort(Number(e.target.value) || 3000)} className="h-9 text-sm" />
              <p className="text-[10px] text-muted-foreground">سيبثّ الخادم على عناوين الشبكة المحلية لهذا الجهاز وفق هذا المنفذ.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setServerSetupOpen(false)}>إلغاء</Button>
            <Button className="gap-1.5" onClick={confirmStartServer} disabled={startingServer}>
              {startingServer ? <Loader2 className="w-4 h-4 animate-spin" /> : <Radio className="w-4 h-4" />}بدء الخادم وتسجيل الدخول
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
