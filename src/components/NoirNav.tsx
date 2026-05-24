import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useNotifications } from "@/hooks/useSupabaseData";
import { localDb } from "@/lib/localStore";
import {
  LayoutDashboard, Users, BookOpen, GraduationCap, ClipboardCheck,
  BarChart3, Settings, Shield, ListTodo, FileText, Bell, LogOut, Crown,
  FolderArchive, CalendarDays,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const allNavItems = [
  { title: "لوحة القيادة", path: "/", icon: LayoutDashboard, perm: "view_dashboard" },
  { title: "الموارد البشرية", path: "/hr", icon: Users, perm: "view_hr" },
  { title: "المهام", path: "/tasks", icon: ListTodo, perm: "view_tasks" },
  { title: "المناهج والعروض", path: "/curriculum", icon: BookOpen, perm: "view_curriculum" },
  { title: "الأرشيف الإداري", path: "/archive", icon: FolderArchive, perm: "view_archive" },
  { title: "التنفيذ التدريبي", path: "/courses", icon: GraduationCap, perm: "view_courses" },
  { title: "الخطة التدريبية", path: "/training-plan", icon: CalendarDays, perm: "view_training_plan" },
  { title: "التقييم والمتابعة", path: "/evaluation", icon: ClipboardCheck, perm: "view_evaluation" },
  { title: "التقارير", path: "/reports", icon: BarChart3, perm: "view_reports" },
  { title: "سجل النشاط", path: "/activity-log", icon: FileText, perm: "view_activity_log" },
];

const NoirNav = () => {
  const { user, logout } = useAuth();
  const { has } = useUserRole();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: notifications, refetch } = useNotifications();
  const unread = notifications.filter(n => !n.is_read).length;
  const [notifOpen, setNotifOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setNotifOpen(false); };
    if (notifOpen) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [notifOpen]);

  const navItems = allNavItems.filter(i => has(i.perm));

  return (
    <>
      {/* Editorial top bar */}
      <header className="noir-topbar sticky top-0 z-40 px-6 py-4 flex items-center justify-between border-b border-amber-200/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full noir-gold-grad flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Crown className="w-4 h-4 text-black" />
          </div>
          <div>
            <h1 className="noir-display text-base font-bold tracking-wide leading-none">Tadreeb</h1>
            <p className="text-[10px] text-amber-200/50 tracking-[0.3em] uppercase mt-0.5">Édition Noire</p>
          </div>
        </div>

        <div className="hidden md:block text-center">
          <p className="text-[10px] uppercase tracking-[0.4em] text-amber-200/40">Maison du Savoir</p>
          <p className="noir-display text-xs text-amber-100/80 mt-0.5">{user?.name}</p>
        </div>

        <div className="flex items-center gap-2">
          <div ref={ref} className="relative">
            <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2.5 rounded-full border border-amber-200/15 hover:border-amber-200/40 hover:bg-amber-200/5 transition-all">
              <Bell className="w-4 h-4 text-amber-100/80" />
              {unread > 0 && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
            </button>
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md animate-fade-in" onClick={() => setNotifOpen(false)} />
                <div className="fixed md:absolute top-16 md:top-12 right-3 md:right-0 left-3 md:left-auto md:w-80 max-h-[70vh] bg-neutral-950 border border-amber-200/20 rounded-2xl shadow-2xl shadow-amber-500/10 overflow-hidden z-50 animate-slide-down" dir="rtl">
                  <div className="px-5 py-3 border-b border-amber-200/10 noir-display text-xs uppercase tracking-[0.3em] text-amber-200/70">Notifications ({unread})</div>
                  <div className="max-h-[60vh] overflow-y-auto">
                    {notifications.length ? notifications.slice(0, 8).map(n => (
                      <button key={n.id} onClick={() => {
                        if (!n.is_read) { localDb.notifications.update(n.id, { is_read: true }); refetch(); }
                        setNotifOpen(false);
                        if (n.link) navigate(n.link);
                      }} className={`w-full text-right px-5 py-3 border-b border-amber-200/5 hover:bg-amber-200/5 transition-colors ${!n.is_read ? "bg-amber-200/[0.03]" : ""}`}>
                        <p className="text-xs text-amber-50/90">{n.message}</p>
                        <p className="text-[9px] text-amber-200/40 mt-1 tracking-wider">{n.date}</p>
                      </button>
                    )) : <div className="py-6 text-center text-amber-200/40 text-xs italic">— silence —</div>}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Floating bottom dock */}
      <nav className="noir-dock fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 px-2.5 py-2 rounded-full border border-amber-200/15 backdrop-blur-2xl shadow-2xl shadow-black/60 max-w-[95vw] overflow-x-auto no-scrollbar">
        {navItems.map(item => {
          const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
          return (
            <NavLink key={item.path} to={item.path} title={item.title}
              className={`group relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-full transition-all duration-500 shrink-0
                ${isActive
                  ? "noir-gold-grad text-black shadow-lg shadow-amber-500/30 scale-110"
                  : "text-amber-100/60 hover:text-amber-100 hover:bg-amber-200/10"}`}>
              <item.icon className="w-4 h-4" />
              <span className={`text-[9px] tracking-wider ${isActive ? "font-bold" : ""}`}>{item.title}</span>
            </NavLink>
          );
        })}
        <div className="w-px h-8 bg-amber-200/15 mx-1" />
        <NavLink to="/settings" title="الإعدادات"
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-all
            ${location.pathname === "/settings" ? "noir-gold-grad text-black" : "text-amber-100/60 hover:text-amber-100 hover:bg-amber-200/10"}`}>
          <Settings className="w-4 h-4" />
        </NavLink>
        <button onClick={logout} title="خروج" className="flex items-center justify-center w-10 h-10 rounded-full text-amber-100/60 hover:text-rose-300 hover:bg-rose-500/10 transition-all">
          <LogOut className="w-4 h-4" />
        </button>
      </nav>
    </>
  );
};

export default NoirNav;
