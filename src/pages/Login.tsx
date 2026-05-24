import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { defaultUserAccounts } from "@/lib/localStore";
import { Shield, LogIn, Eye, EyeOff, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const roleLabels: Record<string, string> = {
  admin: "مدير النظام",
  dept_manager: "مدير القسم",
  unit_head: "رئيس شعبة",
  trainer: "مدرب",
  supervisor: "مشرف",
  individual: "مستخدم عادي",
  super_user: "مستخدم متميز",
  training_admin: "مسؤول تدريب",
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login, signup, user, loading } = useAuth();
  const navigate = useNavigate();

  if (user && !loading) {
    navigate("/", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (isSignup && !name) {
      setError("الرجاء إدخال الاسم");
      return;
    }

    setSubmitting(true);
    const result = isSignup
      ? await signup(email, password, name)
      : await login(email, password);

    if (!result.success) {
      setError(result.error || "حدث خطأ أثناء المصادقة");
    } else {
      navigate("/", { replace: true });
    }
    setSubmitting(false);
  };

  const quickLogin = async (email: string, password: string) => {
    setSubmitting(true);
    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || "حدث خطأ");
    } else {
      navigate("/", { replace: true });
    }
    setSubmitting(false);
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

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive text-center">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full gap-2" size="lg" disabled={submitting}>
              {isSignup ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
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
              {defaultUserAccounts.slice(0, 6).map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => quickLogin(acc.email, acc.password)}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 text-right hover:bg-white/20 transition-colors"
                >
                  <p className="text-sm font-bold text-white truncate">{acc.profile.name}</p>
                  <p className="text-[10px] text-white/60">{acc.profile.roles.map(r => roleLabels[r] || r).join(" · ")}</p>
                  <p className="text-[10px] text-white/40 mt-1" dir="ltr">{acc.email}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
