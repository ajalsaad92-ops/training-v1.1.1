import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useNotifications } from "@/hooks/useSupabaseData";
import { localDb } from "@/lib/localStore";
import {
  LayoutDashboard, Users, BookOpen, GraduationCap, ClipboardCheck,
  BarChart3, Settings, Shield, ListTodo, FileText, Bell, LogOut, Sparkles, Menu, X,
  FolderArchive,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const allNavItems = [
  { title: "لوحة القيادة", path: "/", icon: LayoutDashboard, perm: "view_dashboard" },
  { title: "الموارد", path: "/hr", icon: Users, perm: "view_hr" },
  { title: "الموظفين", path: "/employees", icon: Shield, perm: "view_employees" },
  { title: "المهام", path: "/tasks", icon: ListTodo, perm: "view_tasks" },
  { title: "المناهج", path: "/curriculum", icon: BookOpen, perm: "view_curriculum" },
  { title: "الأرشيف الإداري", path: "/archive", icon: FolderArchive, perm: "view_archive" },
  { title: "التنفيذ", path: "/courses", icon: GraduationCap, perm: "view_courses" },
  { title: "التقييم", path: "/evaluation", icon: ClipboardCheck, perm: "view_evaluation" },
  { title: "التقارير", path: "/reports", icon: BarChart3, perm: "view_reports" },
  { title: "السجل", path: "/activity-log", icon: FileText, perm: "view_activity_log" },
];

const TopNav = () => {
  const { user, logout } = useAuth();
  const { has } = useUserRole();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: notifications, refetch } = useNotifications();
  const unread = notifications.filter(n => !n.is_read).length;
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setNotifOpen(false); };
    if (notifOpen) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [notifOpen]);

  const navItems = allNavItems.filter(i => has(i.perm));

  return (
    <header className="aurora-topnav sticky top-0 z-50 w-full">
      <div className="aurora-glass border-b border-white/10 px-4 lg:px-8 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl aurora-logo-grad flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-extrabold text-sm aurora-title-grad leading-tight">نظام التدريب</h1>
            <p className="text-[10px] text-white/60 leading-tight">تجربة أورورا</p>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center overflow-x-auto no-scrollbar">
          {navItems.map(item => {
            const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
            return (
              <NavLink key={item.path} to={item.path}
                className={`relative px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300 whitespace-nowrap flex items-center gap-1.5
                  ${isActive
                    ? "text-white aurora-pill-active shadow-lg shadow-fuchsia-500/20"
                    : "text-white/70 hover:text-white hover:bg-white/10"}`}>
                <item.icon className="w-3.5 h-3.5" />
                <span>{item.title}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 ml-auto lg:ml-0">
          <div ref={ref} className="relative">
            <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all">
              <Bell className="w-4 h-4" />
              {unread > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-fuchsia-500 text-white text-[9px] flex items-center justify-center font-bold animate-pulse">{unread}</span>}
            </button>
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md animate-fade-in" onClick={() => setNotifOpen(false)} />
                <div className="fixed md:absolute top-16 md:top-12 right-3 md:right-0 left-3 md:left-auto md:w-80 max-h-[70vh] aurora-glass border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-50 animate-slide-down" dir="rtl">
                  <div className="px-4 py-2.5 border-b border-white/10 text-xs font-bold text-white">الإشعارات ({unread})</div>
                  <div className="max-h-[60vh] overflow-y-auto">
                    {notifications.length ? notifications.slice(0, 8).map(n => (
                      <button key={n.id} onClick={() => {
                        if (!n.is_read) { localDb.notifications.update(n.id, { is_read: true }); refetch(); }
                        setNotifOpen(false);
                        if (n.link) navigate(n.link);
                      }} className={`w-full text-right px-4 py-2.5 border-b border-white/5 hover:bg-white/10 transition-colors ${!n.is_read ? "bg-white/5" : ""}`}>
                        <p className="text-xs text-white">{n.message}</p>
                        <p className="text-[9px] text-white/50 mt-0.5">{n.date}</p>
                      </button>
                    )) : <div className="py-6 text-center text-white/50 text-xs">لا توجد إشعارات</div>}
                  </div>
                </div>
              </>
            )}
          </div>

          <NavLink to="/settings" className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all hidden sm:flex">
            <Settings className="w-4 h-4" />
          </NavLink>

          <button onClick={logout} className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/30 text-white transition-all hidden sm:flex">
            <LogOut className="w-4 h-4" />
          </button>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-xl bg-white/10 text-white">
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden aurora-glass border-b border-white/10 px-3 py-3 grid grid-cols-2 gap-2 animate-slide-down">
          {navItems.map(item => (
            <NavLink key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${isActive ? "aurora-pill-active text-white" : "text-white/80 hover:bg-white/10"}`}>
              <item.icon className="w-3.5 h-3.5" /><span>{item.title}</span>
            </NavLink>
          ))}
          <NavLink to="/settings" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-white/80 hover:bg-white/10">
            <Settings className="w-3.5 h-3.5" />الإعدادات
          </NavLink>
          <button onClick={logout} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-300 hover:bg-rose-500/20">
            <LogOut className="w-3.5 h-3.5" />خروج
          </button>
        </div>
      )}
    </header>
  );
};

export default TopNav;
