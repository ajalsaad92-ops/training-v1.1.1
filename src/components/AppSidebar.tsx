import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import {
  LayoutDashboard, Users, BookOpen, GraduationCap, ClipboardCheck,
  BarChart3, Settings, ChevronRight, ChevronLeft, Sun, Moon,
  Shield, ListTodo, FileText, CalendarDays, FolderArchive, LogOut,
} from "lucide-react";

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

interface AppSidebarProps {
  onNavigate?: () => void;
}

const personaLabels: Record<string, string> = {
  admin: "مدير النظام",
  dept_manager: "مدير القسم",
  prep_unit_head: "مسؤول شعبة الإعداد",
  curriculum_unit_head: "مسؤول شعبة المناهج",
  curriculum_individual: "موظف مناهج",
  prep_individual: "موظف إعداد",
  individual: "مستخدم",
};

const AppSidebar = ({ onNavigate }: AppSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem("tms_theme") === "dark");
  const { user, logout } = useAuth();
  const { persona, has } = useUserRole();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("tms_theme", dark ? "dark" : "light");
  }, [dark]);

  const navItems = allNavItems.filter(item => has(item.perm));

  return (
    <aside className={`h-screen bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 ease-in-out ${collapsed ? "w-[56px] lg:w-[68px]" : "w-52 sm:w-56 lg:w-64"} border-l border-sidebar-border overflow-hidden`}>
      <div className="p-3 border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 text-primary-foreground">
            <Shield className="w-4 h-4" />
          </div>
          {!collapsed && (
            <div className="min-w-0 animate-fade-in">
              <h1 className="font-bold text-xs truncate">نظام التدريب</h1>
              <p className="text-[10px] text-muted-foreground truncate">الإدارة الذكية</p>
            </div>
          )}
        </div>
      </div>

      {!collapsed && user && (
        <div className="px-3 py-2 border-b border-sidebar-border shrink-0 animate-fade-in">
          <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
          <p className="text-[10px] text-muted-foreground truncate">{personaLabels[persona]}</p>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-2 px-1.5 space-y-0.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={`flex items-center gap-2 px-2 py-2 rounded-lg text-xs transition-all duration-200 group relative ${
                isActive
                  ? "bg-primary/10 text-primary font-semibold before:absolute before:right-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-5 before:bg-primary before:rounded-l"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              }`}
              title={collapsed ? item.title : undefined}
            >
              <item.icon className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isActive ? "text-primary scale-110" : "group-hover:scale-105"}`} />
              {!collapsed && <span className="truncate animate-fade-in">{item.title}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-2 space-y-0.5 shrink-0">
        <button onClick={() => setDark(!dark)} className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-sidebar-accent w-full transition-colors duration-200">
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {!collapsed && <span className="animate-fade-in">{dark ? "الوضع النهاري" : "الوضع الليلي"}</span>}
        </button>
        <NavLink
          to="/settings"
          onClick={onNavigate}
          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all duration-200 w-full ${
            location.pathname === "/settings"
              ? "bg-primary/10 text-primary font-semibold"
              : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
          }`}
          title={collapsed ? "الإعدادات" : undefined}
        >
          <Settings className={`w-4 h-4 flex-shrink-0 ${location.pathname === "/settings" ? "text-primary animate-spin-once" : ""}`} />
          {!collapsed && <span className="animate-fade-in">الإعدادات</span>}
        </NavLink>
        <button onClick={() => setCollapsed(!collapsed)} className="hidden md:flex items-center justify-center w-full py-1.5 hover:bg-sidebar-accent rounded-lg transition-colors duration-200">
          {collapsed ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
