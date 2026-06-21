import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useSupabaseData";
import { useUITheme } from "@/contexts/UIThemeContext";
import { localDb } from "@/lib/localStore";
import AppSidebar from "@/components/AppSidebar";
import TopNav from "@/components/TopNav";
import NoirNav from "@/components/NoirNav";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { useErrorMonitorCount, openErrorMonitor } from "@/hooks/useErrorMonitor";
import { Loader2, Menu, X, Bell, Check, Info, AlertTriangle, Bug, Send } from "lucide-react";
import { useState, useRef, useEffect, Component } from "react";
import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { logAction } from "@/lib/auditLog";
import { alertUser, requestNotificationPermission } from "@/lib/notify";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return (
      <div className="flex items-center justify-center min-h-[40vh] p-8" dir="rtl">
        <div className="text-center bg-card border border-border rounded-xl p-6 max-w-md">
          <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-3" />
          <h2 className="text-lg font-bold text-foreground mb-2">حدث خطأ غير متوقع</h2>
          <p className="text-sm text-muted-foreground mb-4">يرجى تحديث الصفحة أو المحاولة لاحقاً</p>
          <Button onClick={() => { this.setState({ hasError: false }); window.location.reload(); }} variant="outline">تحديث الصفحة</Button>
        </div>
      </div>
    );
    return this.props.children;
  }
}

const Layout = () => {
  const { user, loading, originalUserId, revertImpersonation } = useAuth();
  const { theme } = useUITheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { data: notifications, refetch: refetchNotifications } = useNotifications();
  const notifRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const errMon = useErrorMonitorCount();

  // Ask for OS notification permission once after login.
  useEffect(() => {
    if (user) requestNotificationPermission();
  }, [user]);

  // Alert (sound + vibration + system notification) on newly arrived notifications.
  const seenNotifIds = useRef<Set<string> | null>(null);
  useEffect(() => {
    const unread = notifications.filter((n) => !n.is_read);
    // First run: remember existing unread without alerting (avoid alert spam on load).
    if (seenNotifIds.current === null) {
      seenNotifIds.current = new Set(unread.map((n) => n.id));
      return;
    }
    const fresh = unread.filter((n) => !seenNotifIds.current!.has(n.id));
    if (fresh.length > 0) {
      const first = fresh[0];
      alertUser("إشعار جديد", first.message || "لديك إشعار جديد", () => {
        if (first.link) navigate(first.link);
      });
      fresh.forEach((n) => seenNotifIds.current!.add(n.id));
    }
  }, [notifications, navigate]);

  const [unjustifiedAbsence, setUnjustifiedAbsence] = useState<any>(null);
  const [justification, setJustification] = useState("");

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [notifOpen]);

  useEffect(() => {
    if (user) {
      const requests = localDb.hrRequests.getAll();
      const absence = requests.find(r => r.employee_name === user.name && r.type === "غياب" && (!r.notes || r.notes.trim() === ""));
      if (absence) setUnjustifiedAbsence(absence);
    }
  }, [user]);

  const handleJustifyAbsence = async () => {
    if (!justification.trim()) {
      toast({ title: "خطأ", description: "يجب كتابة سبب الغياب", variant: "destructive" });
      return;
    }
    if (unjustifiedAbsence) {
      localDb.hrRequests.update(unjustifiedAbsence.id, { notes: justification });
      
      const empSection = user?.section || "غير محدد";
      const unitHeads = localDb.profiles.getAll().filter(p => (p.roles?.includes("unit_head") || p.roles?.includes("curriculum_unit_head") || p.roles?.includes("prep_unit_head")) && p.section === empSection);
      unitHeads.forEach(head => {
        localDb.notifications.insert({ user_id: head.id, message: `قدم ${user?.name} تبريراً لغيابه يوم ${unjustifiedAbsence.date}`, type: "info", link: "/hr" });
      });
      const managers = localDb.profiles.getAll().filter(p => p.roles?.includes("dept_manager"));
      managers.forEach(mgr => {
        localDb.notifications.insert({ user_id: mgr.id, message: `قدم ${user?.name} تبريراً لغيابه يوم ${unjustifiedAbsence.date}`, type: "info", link: "/hr" });
      });

      await logAction(user?.name || "مجهول", "تبرير غياب", `تبرير لغياب يوم ${unjustifiedAbsence.date}`);
      toast({ title: "تم", description: "تم إرسال تبرير الغياب بنجاح" });
      setUnjustifiedAbsence(null);
      setJustification("");
    }
  };

  const markAllRead = () => {
    notifications.filter((n) => !n.is_read).forEach((n) => localDb.notifications.update(n.id, { is_read: true }));
    refetchNotifications();
  };

  const openNotification = (n: { id: string; is_read?: boolean; link?: string | null }) => {
    if (!n.is_read) { localDb.notifications.update(n.id, { is_read: true }); refetchNotifications(); }
    setNotifOpen(false); setMobileMenuOpen(false);
    if (n.link) navigate(n.link);
  };

  const notifIcon = (type: string) => type === "warning"
    ? <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
    : <Info className="w-4 h-4 text-primary shrink-0" />;

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  // === Aurora theme: top navigation ===
  if (theme === "aurora") {
    return (
      <div className="min-h-screen w-full aurora-bg flex flex-col relative">
        {originalUserId && (
          <div className="bg-destructive text-destructive-foreground text-xs font-bold py-1.5 px-4 flex justify-between items-center z-[100] sticky top-0 shadow-md">
            <span>أنت الآن تتصفح بحساب: {user?.name} (وضع الانتحال)</span>
            <button onClick={revertImpersonation} className="bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded transition-colors">العودة لحسابك</button>
          </div>
        )}
        <TopNav />
        <main className="flex-1 min-w-0 relative animate-fade-in">
          <ErrorBoundary><Outlet /></ErrorBoundary>
        </main>
        <ThemeSwitcher />
        
        <Dialog open={!!unjustifiedAbsence} onOpenChange={() => {}}>
          <DialogContent className="max-w-md sm:rounded-2xl" dir="rtl" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="w-5 h-5" />تبرير غياب مطلوب</DialogTitle>
              <DialogDescription className="text-sm">
                لقد تم تسجيلك غائباً في يوم {unjustifiedAbsence?.date}. يرجى تقديم تبرير للغياب لتتمكن من استخدام النظام.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <Textarea value={justification} onChange={(e) => setJustification(e.target.value)} placeholder="أدخل سبب الغياب هنا بوضوح..." rows={4} className="resize-none" />
            </div>
            <DialogFooter>
              <Button onClick={handleJustifyAbsence} className="w-full gap-2"><Send className="w-4 h-4" />إرسال التبرير للموافقة</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // === Noir theme: editorial top + floating dock ===
  if (theme === "noir") {
    return (
      <div className="min-h-screen w-full noir-bg flex flex-col relative">
        {originalUserId && (
          <div className="bg-destructive text-destructive-foreground text-xs font-bold py-1.5 px-4 flex justify-between items-center z-[100] sticky top-0 shadow-md">
            <span>أنت الآن تتصفح بحساب: {user?.name} (وضع الانتحال)</span>
            <button onClick={revertImpersonation} className="bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded transition-colors">العودة لحسابك</button>
          </div>
        )}
        <NoirNav />
        <main className="flex-1 min-w-0 relative animate-fade-in pb-28">
          <ErrorBoundary><Outlet /></ErrorBoundary>
        </main>
        <ThemeSwitcher />

        <Dialog open={!!unjustifiedAbsence} onOpenChange={() => {}}>
          <DialogContent className="max-w-md sm:rounded-2xl" dir="rtl" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="w-5 h-5" />تبرير غياب مطلوب</DialogTitle>
              <DialogDescription className="text-sm">
                لقد تم تسجيلك غائباً في يوم {unjustifiedAbsence?.date}. يرجى تقديم تبرير للغياب لتتمكن من استخدام النظام.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <Textarea value={justification} onChange={(e) => setJustification(e.target.value)} placeholder="أدخل سبب الغياب هنا بوضوح..." rows={4} className="resize-none" />
            </div>
            <DialogFooter>
              <Button onClick={handleJustifyAbsence} className="w-full gap-2"><Send className="w-4 h-4" />إرسال التبرير للموافقة</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // === Classic theme: original sidebar ===
  return (
    <div className="flex h-screen w-full overflow-hidden flex-col relative">
      {originalUserId && (
        <div className="bg-destructive text-destructive-foreground text-xs font-bold py-1.5 px-4 flex justify-between items-center z-[100] w-full shadow-md shrink-0">
          <span>أنت الآن تتصفح بحساب: {user?.name} (وضع الانتحال)</span>
          <button onClick={revertImpersonation} className="bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded transition-colors">العودة لحسابك</button>
        </div>
      )}
      <div className="flex flex-1 overflow-hidden relative">
      <div className="fixed top-0 left-0 right-0 z-50 bg-sidebar text-sidebar-foreground flex items-center justify-between px-4 py-3 md:hidden" ref={notifRef}>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1 order-3">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <h1 className="font-bold text-sm text-sidebar-accent-foreground order-2">نظام التدريب</h1>
        <button onClick={(e) => { e.stopPropagation(); setNotifOpen(!notifOpen); }} className="relative p-1 order-1">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">{unreadCount}</span>}
        </button>
        {notifOpen && (
          <div className="absolute top-full right-2 left-2 mt-1 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-slide-down md:hidden" dir="rtl">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30">
              <span className="text-sm font-bold text-foreground">الإشعارات ({unreadCount})</span>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-primary hover:underline flex items-center gap-1"><Check className="w-3 h-3" />تعليم الكل</button>
              )}
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {errMon.total > 0 && (
                <button type="button" onClick={() => { setNotifOpen(false); openErrorMonitor(); }}
                  className="w-full text-right flex items-start gap-3 px-4 py-3 border-b border-border/50 bg-destructive/5 hover:bg-destructive/10">
                  <Bug className={`w-4 h-4 shrink-0 mt-0.5 ${errMon.errorCount > 0 ? "text-destructive" : "text-warning"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">مراقب الأخطاء — {errMon.errorCount} خطأ، {errMon.warnCount} تحذير</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">انقر للفتح</p>
                  </div>
                </button>
              )}
              {notifications.length > 0 ? notifications.map(n => (
                <button key={n.id} type="button" onClick={() => openNotification(n)}
                  className={`w-full text-right flex items-start gap-3 px-4 py-3 border-b border-border/50 hover:bg-muted/40 ${!n.is_read ? "bg-primary/5" : ""}`}>
                  {notifIcon(n.type)}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!n.is_read ? "font-semibold text-foreground" : "text-foreground"}`}>{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{n.date}</p>
                  </div>
                  {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                </button>
              )) : (errMon.total === 0 && <div className="py-8 text-center text-muted-foreground text-sm">لا توجد إشعارات</div>)}
            </div>
          </div>
        )}
      </div>

      {mobileMenuOpen && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileMenuOpen(false)} />}

      <div className={`fixed inset-y-0 right-0 z-40 transform transition-transform duration-300 ease-in-out md:relative md:transform-none ${mobileMenuOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}`}>
        <AppSidebar onNavigate={() => setMobileMenuOpen(false)} />
      </div>

      <main className="flex-1 min-w-0 overflow-y-auto relative flex flex-col pt-12 md:pt-0">
        <div className="hidden md:block fixed top-3 left-3 z-50" ref={notifRef}>
          <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 rounded-lg bg-card border border-border hover:shadow-md transition-shadow">
            <Bell className="w-5 h-5 text-foreground" />
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold animate-pulse">{unreadCount}</span>}
          </button>

          {notifOpen && (
            <div className="absolute top-12 end-0 w-80 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 animate-slide-down" dir="rtl">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30">
                <span className="text-sm font-bold text-foreground">الإشعارات ({unreadCount} غير مقروءة)</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-primary hover:underline flex items-center gap-1"><Check className="w-3 h-3" />تعليم الكل كمقروء</button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto">
                {errMon.total > 0 && (
                  <button type="button" onClick={() => { setNotifOpen(false); openErrorMonitor(); }}
                    className="w-full text-right flex items-start gap-3 px-4 py-3 border-b border-border/50 bg-destructive/5 hover:bg-destructive/10 transition-colors">
                    <Bug className={`w-4 h-4 shrink-0 mt-0.5 ${errMon.errorCount > 0 ? "text-destructive" : "text-warning"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">مراقب الأخطاء — {errMon.errorCount} خطأ، {errMon.warnCount} تحذير</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">انقر للفتح</p>
                    </div>
                  </button>
                )}
                {notifications.length > 0 ? notifications.map(n => (
                  <button key={n.id} type="button" onClick={() => openNotification(n)}
                    className={`w-full text-right flex items-start gap-3 px-4 py-3 border-b border-border/50 hover:bg-muted/40 transition-colors ${!n.is_read ? "bg-primary/5" : ""} ${n.link ? "cursor-pointer" : "cursor-default"}`}>
                    {notifIcon(n.type)}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!n.is_read ? "font-semibold text-foreground" : "text-foreground"}`}>{n.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{n.date}</p>
                    </div>
                    {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                  </button>
                )) : (errMon.total === 0 && <div className="py-8 text-center text-muted-foreground text-sm">لا توجد إشعارات</div>)}
              </div>
            </div>
          )}
        </div>

        <ErrorBoundary><Outlet /></ErrorBoundary>
      </main>
      <ThemeSwitcher />
      </div>

      <Dialog open={!!unjustifiedAbsence} onOpenChange={() => {}}>
        <DialogContent className="max-w-md sm:rounded-2xl" dir="rtl" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="w-5 h-5" />تبرير غياب مطلوب</DialogTitle>
            <DialogDescription className="text-sm">
              لقد تم تسجيلك غائباً في يوم {unjustifiedAbsence?.date}. يرجى تقديم تبرير للغياب لتتمكن من استخدام النظام.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Textarea value={justification} onChange={(e) => setJustification(e.target.value)} placeholder="أدخل سبب الغياب هنا بوضوح..." rows={4} className="resize-none" />
          </div>
          <DialogFooter>
            <Button onClick={handleJustifyAbsence} className="w-full gap-2"><Send className="w-4 h-4" />إرسال التبرير للموافقة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Layout;

