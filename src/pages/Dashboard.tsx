import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useCurriculumItems, useNotifications, useTasks, useHRRequests, useCourses, useEmployees } from "@/hooks/useSupabaseData";
import PageHeader from "@/components/PageHeader";
import {
  Loader2, BookX, ListChecks,
  BookOpen, Presentation, Award, FileText, CalendarPlus, Check, X, Star,
  Mail, ClipboardList, AlertCircle, Users as UsersIcon, FolderArchive,
  TrendingUp, Clock, Activity, Printer, UserCheck, UserX,
  Briefcase, Timer, Eye, LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { localDb } from "@/lib/localStore";
import StatusBadge from "@/components/StatusBadge";
import {
  hasEmptyFields, countByStage, countByPptStage,
  stageLabels, stageColors, pptStageLabels, pptStageColors,
  type CurriculumStage, type PptStage, computeStage,
} from "@/lib/curriculumHelpers";

const CircularProgress = ({ value, size = 90, strokeWidth = 7 }: { value: number; size?: number; strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--primary))" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-700" />
      </svg>
      <span className="absolute text-sm font-bold text-foreground">{value}%</span>
    </div>
  );
};

const MiniBar = ({ value, max, color, label }: { value: number; max: number; color: string; label: string }) => (
  <div className="flex items-center gap-2 text-[11px]">
    <span className="w-14 text-muted-foreground truncate">{label}</span>
    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }} />
    </div>
    <span className="w-4 text-right font-bold text-foreground">{value}</span>
  </div>
);

const SectionHeader = ({ icon: Icon, title, action }: { icon: React.ElementType; title: string; action?: React.ReactNode }) => (
  <div className="flex items-center justify-between mb-2">
    <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5"><Icon className="w-3.5 h-3.5 text-primary" />{title}</h3>
    {action && <span className="no-print">{action}</span>}
  </div>
);

const PersonRow = ({ name, detail, status, onClick }: { name: string; detail: string; status: "leave" | "absent" | "duty" | "timeoff"; onClick?: () => void }) => {
  const statusConfig = {
    leave: { icon: CalendarPlus, color: "text-warning", bg: "bg-warning/10" },
    absent: { icon: UserX, color: "text-destructive", bg: "bg-destructive/10" },
    duty: { icon: Briefcase, color: "text-accent", bg: "bg-accent/10" },
    timeoff: { icon: Timer, color: "text-primary", bg: "bg-primary/10" },
  };
  const cfg = statusConfig[status];
  const Icon = cfg.icon;
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-2 ${cfg.bg} rounded-lg px-3 py-1.5 hover:shadow-sm transition-all text-right`}>
      <Icon className={`w-3.5 h-3.5 ${cfg.color} shrink-0`} />
      <span className="text-xs font-medium text-foreground flex-1 truncate">{name}</span>
      <span className="text-[10px] text-muted-foreground shrink-0">{detail}</span>
    </button>
  );
};

const MONTHLY_LEAVE = 3;
const MONTHLY_TIME_HOURS = 7;

// ============ MANAGER DASHBOARD ============
const ManagerDashboard = () => {
  const navigate = useNavigate();
  const { has, userId, userName } = useUserRole();
  const { data: employees } = useEmployees();
  const { data: courses } = useCourses();
  const { data: hrRequests, refetch: refetchHR } = useHRRequests();
  const { data: tasks } = useTasks();
  const { data: curriculumItems } = useCurriculumItems();
  const archiveDocs = localDb.archiveDocuments.getAll();
  const { data: notifications } = useNotifications();

  const activeCourses = courses.filter(c => c.status === "active");
  const plannedCourses = courses.filter(c => c.status === "planned");
  const completedCourses = courses.filter(c => c.status === "completed");
  const pendingHR = hrRequests.filter(r => r.approval_status === "pending" || r.approval_status === "unit_approved");
  const approvedHR = hrRequests.filter(r => r.approval_status === "approved");
  const rejectedHR = hrRequests.filter(r => r.approval_status === "rejected");
  const pendingTasks = tasks.filter(t => t.status !== "completed");
  const completedTasks = tasks.filter(t => t.status === "completed");
  const totalCur = curriculumItems.length;
  const missingReports = curriculumItems.filter(c => !c.report_uploaded).length;
  const missingPPT = curriculumItems.filter(c => !c.presentation_uploaded).length;
  const corrInProgress = archiveDocs.filter(d => d.forCheck === "1").length;
  const courseCompletionRate = courses.length > 0 ? Math.round((completedCourses.length / courses.length) * 100) : 0;

  const stageCounts = countByStage(curriculumItems);
  const pptCounts = countByPptStage(curriculumItems);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const todayStr = now.toISOString().split("T")[0];

  const monthApproved = hrRequests.filter(r => {
    const d = new Date(r.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear && r.approval_status === "approved";
  });

  const onLeave = monthApproved.filter(r => r.type.includes("إجازة"));
  const onTimeOff = monthApproved.filter(r => r.type === "خروجية");
  const onDuty = monthApproved.filter(r => r.type === "واجب");
  const absentToday = hrRequests.filter(r => r.type === "غياب" && r.date === todayStr && r.approval_status === "approved");

  const leaveUsage: Record<string, number> = {};
  onLeave.forEach(r => { leaveUsage[r.employee_name] = (leaveUsage[r.employee_name] || 0) + 1; });
  const timeUsage: Record<string, number> = {};
  onTimeOff.forEach(r => { timeUsage[r.employee_name] = (timeUsage[r.employee_name] || 0) + 1; });

  const dailyCount = employees.filter(e => e.work_schedule === "daily").length;
  const shiftCount = employees.filter(e => e.work_schedule !== "daily").length;

  const makeHistory = (req: typeof hrRequests[0], kind: string, action: string) => {
    const prev: any[] = Array.isArray(req?.history) ? req.history : [];
    return [...prev, { id: `h_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, at: new Date().toISOString(), by_id: userId, by_name: userName, kind, action }];
  };

  const handleHRAction = (id: string, action: "approve" | "reject") => {
    const req = hrRequests.find(r => r.id === id);
    const history = makeHistory(req, action === "approve" ? "approval" : "rejection", action === "approve" ? "موافقة نهائية من مدير القسم" : "رفض مدير القسم");
    if (action === "approve") {
      localDb.hrRequests.update(id, { approval_status: "approved", dept_manager_status: "approved", dept_manager_by: userId, dept_manager_at: new Date().toISOString(), history });
    } else {
      localDb.hrRequests.update(id, { approval_status: "rejected", dept_manager_status: "rejected", dept_manager_by: userId, dept_manager_at: new Date().toISOString(), history });
    }
    toast({ title: action === "approve" ? "تمت الموافقة" : "تم الرفض" });
    refetchHR();
  };

  const navigateToPerson = (name: string) => {
    const emp = employees.find(e => e.name === name);
    if (emp) { navigate("/employees"); }
  };

  return (
    <div className="space-y-4">
      {/* ROW 1: الموقف اليومي (Attendance) */}
      <div data-print-section="attendance" className="bg-card border border-border rounded-xl p-4">
        <SectionHeader icon={UsersIcon} title="الموقف اليومي" action={<Button variant="link" size="sm" className="h-auto p-0 text-[10px]" onClick={() => navigate("/hr")}>عرض الكل</Button>} />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3">
          {/* الحاضرون */}
          <div className="bg-success/5 border border-success/20 rounded-lg p-3 cursor-pointer hover:shadow-sm transition-all" onClick={() => navigate("/hr")}>
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="w-4 h-4 text-success" />
              <span className="text-xs font-bold text-success">الحاضرون</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{employees.length - onLeave.length - absentToday.length}</p>
            <p className="text-[10px] text-muted-foreground">يومي: {dailyCount} | وجبات: {shiftCount}</p>
          </div>

          {/* المجازون */}
          <div className="bg-warning/5 border border-warning/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <CalendarPlus className="w-4 h-4 text-warning" />
              <span className="text-xs font-bold text-warning">المجازون ({onLeave.length})</span>
            </div>
            <div className="space-y-1 flex-1 overflow-y-auto">
              {onLeave.length === 0 ? <p className="text-[10px] text-muted-foreground">لا يوجد مجازين</p> :
                Object.entries(leaveUsage).map(([name, days]) => (
                  <PersonRow key={name} name={name} detail={`${days}/${MONTHLY_LEAVE} يوم`} status="leave" onClick={() => navigateToPerson(name)} />
                ))
              }
            </div>
          </div>

          {/* الزمنيات */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Timer className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-primary">الزمنيات ({onTimeOff.length})</span>
            </div>
            <div className="space-y-1 flex-1 overflow-y-auto">
              {onTimeOff.length === 0 ? <p className="text-[10px] text-muted-foreground">لا يوجد زمنيات</p> :
                Object.entries(timeUsage).map(([name, hrs]) => (
                  <PersonRow key={name} name={name} detail={`${hrs}/${MONTHLY_TIME_HOURS} ساعة`} status="timeoff" onClick={() => navigateToPerson(name)} />
                ))
              }
            </div>
          </div>

          {/* الغائبون + الواجبات */}
          <div className="space-y-2">
            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-2 cursor-pointer hover:shadow-sm transition-all" onClick={() => navigate("/hr")}>
              <div className="flex items-center gap-1.5"><UserX className="w-3.5 h-3.5 text-destructive" /><span className="text-[11px] font-bold text-destructive">الغائبون ({absentToday.length})</span></div>
              {absentToday.slice(0, 2).map(r => <p key={r.id} className="text-[10px] text-foreground mr-5">{r.employee_name}</p>)}
            </div>
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-2 cursor-pointer hover:shadow-sm transition-all" onClick={() => navigate("/hr")}>
              <div className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-accent" /><span className="text-[11px] font-bold text-accent">الواجبات ({onDuty.length})</span></div>
              {onDuty.slice(0, 2).map(r => <p key={r.id} className="text-[10px] text-foreground mr-5">{r.employee_name}</p>)}
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2: طلبات معلقة + المهام */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3">
        <div data-print-section="pending_requests" className="bg-card border border-border rounded-xl p-4">
          <SectionHeader icon={ClipboardList} title={`طلبات معلقة (${pendingHR.length})`} action={<Button variant="link" size="sm" className="h-auto p-0 text-[10px]" onClick={() => navigate("/hr")}>عرض الكل</Button>} />
          {pendingHR.length === 0 ? <p className="text-xs text-muted-foreground text-center py-4">لا توجد طلبات</p> : (
            <div className="space-y-1.5 flex-1 overflow-y-auto">
              {pendingHR.map(req => (
                <div key={req.id} className="flex items-center justify-between bg-muted/20 rounded-lg px-3 py-2">
                  <div className="min-w-0 flex-1"><p className="text-xs font-medium truncate">{req.employee_name}</p><p className="text-[10px] text-muted-foreground">{req.type} — {req.date}</p></div>
                   <div className="flex gap-1 shrink-0 no-print">
                     {has("approve_hr_dept") && <button onClick={() => handleHRAction(req.id, "approve")} className="p-1 rounded bg-success/10 text-success hover:bg-success/20" title="موافقة"><Check className="w-3 h-3" /></button>}
                     {has("reject_hr") && <button onClick={() => handleHRAction(req.id, "reject")} className="p-1 rounded bg-destructive/10 text-destructive hover:bg-destructive/20" title="رفض"><X className="w-3 h-3" /></button>}
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div data-print-section="tasks" className="bg-card border border-border rounded-xl p-4">
          <SectionHeader icon={ListChecks} title={`المهام (${tasks.length})`} action={<Button variant="link" size="sm" className="h-auto p-0 text-[10px]" onClick={() => navigate("/tasks")}>عرض الكل</Button>} />
          <div className="space-y-1.5 flex-1 overflow-y-auto">
            {tasks.slice(0, 6).map(t => (
              <div key={t.id} className="flex items-center justify-between bg-muted/20 rounded-lg px-3 py-2 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => navigate("/tasks")}>
                <div className="min-w-0 flex-1"><p className="text-xs font-medium truncate">{t.title}</p><p className="text-[10px] text-muted-foreground">{t.unit}</p></div>
                <StatusBadge status={t.status === "completed" ? "منجز" : t.status === "in_progress" ? "قيد التنفيذ" : t.status === "review" ? "مراجعة" : "معلق"} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ROW 3: تنبيهات + مراحل المنهاج + نسبة الإنجاز */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3">
        <div data-print-section="alerts" className="bg-card border border-border rounded-xl p-4 space-y-2">
          <p className="text-xs font-bold text-foreground flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5 text-warning" />تنبيهات</p>
          {missingReports > 0 && <div className="flex items-center gap-2 bg-destructive/10 rounded-lg px-3 py-2 cursor-pointer hover:shadow-sm transition-all" onClick={() => navigate("/curriculum?filter=missing_report")}><BookX className="w-4 h-4 text-destructive shrink-0" /><span className="text-xs">{missingReports} منهج بدون تقرير</span></div>}
          {missingPPT > 0 && <div className="flex items-center gap-2 bg-warning/10 rounded-lg px-3 py-2 cursor-pointer hover:shadow-sm transition-all" onClick={() => navigate("/curriculum?filter=missing_ppt")}><Presentation className="w-4 h-4 text-warning shrink-0" /><span className="text-xs">{missingPPT} منهج بدون عرض</span></div>}
          {pendingHR.length > 0 && <div className="flex items-center gap-2 bg-primary/10 rounded-lg px-3 py-2 cursor-pointer hover:shadow-sm transition-all" onClick={() => navigate("/hr?filter=pending")}><ClipboardList className="w-4 h-4 text-primary shrink-0" /><span className="text-xs">{pendingHR.length} طلب إجازة معلق</span></div>}
          {corrInProgress > 0 && <div className="flex items-center gap-2 bg-accent/10 rounded-lg px-3 py-2 cursor-pointer hover:shadow-sm transition-all" onClick={() => navigate("/archive")}><FolderArchive className="w-4 h-4 text-accent shrink-0" /><span className="text-xs">{corrInProgress} وثيقة قيد المراجعة</span></div>}
          {missingReports === 0 && missingPPT === 0 && pendingHR.length === 0 && corrInProgress === 0 && (
            <div className="flex items-center gap-2 bg-success/10 rounded-lg px-3 py-2"><Check className="w-4 h-4 text-success shrink-0" /><span className="text-xs">لا توجد تنبيهات</span></div>
          )}
          <div className="border-t border-border pt-2 mt-1">
            <p className="text-[10px] font-bold text-muted-foreground mb-1">آخر الإشعارات</p>
            {notifications.slice(0, 2).map(n => (
              <div key={n.id} className="flex items-start gap-1.5 py-0.5"><Activity className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" /><span className="text-[10px] text-foreground">{n.message}</span></div>
            ))}
          </div>
        </div>

        <div data-print-section="curriculum_stages" className="bg-card border border-border rounded-xl p-4 space-y-3 cursor-pointer hover:shadow-sm transition-all" onClick={() => navigate("/curriculum")}>
          <p className="text-xs font-bold text-foreground">مراحل المناهج</p>
          <div className="space-y-1.5">
            {(Object.keys(stageCounts) as CurriculumStage[]).map(s => (
              <MiniBar key={s} value={stageCounts[s]} max={totalCur || 1} color={stageColors[s].split(" ")[0]} label={stageLabels[s]} />
            ))}
          </div>
          <div className="border-t border-border pt-2">
            <p className="text-[10px] font-bold text-muted-foreground mb-1">مراحل العروض</p>
            <div className="space-y-1.5">
              {(Object.keys(pptCounts) as PptStage[]).map(s => (
                <MiniBar key={s} value={pptCounts[s]} max={totalCur || 1} color={pptStageColors[s].split(" ")[0]} label={pptStageLabels[s]} />
              ))}
            </div>
          </div>
        </div>

        <div data-print-section="achievement" className="bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-3 cursor-pointer hover:shadow-sm transition-all" onClick={() => navigate("/courses")}>
          <p className="text-xs font-bold text-foreground">نسبة إنجاز الدورات</p>
          <CircularProgress value={courseCompletionRate} size={100} strokeWidth={8} />
          <div className="w-full space-y-1.5">
            <MiniBar value={activeCourses.length} max={courses.length || 1} color="bg-primary" label="نشطة" />
            <MiniBar value={plannedCourses.length} max={courses.length || 1} color="bg-warning" label="مخططة" />
            <MiniBar value={completedCourses.length} max={courses.length || 1} color="bg-success" label="منجزة" />
          </div>
        </div>
      </div>

    </div>
  );
};

// ============ PREP DASHBOARD ============
const PrepDashboard = () => {
  const navigate = useNavigate();
  const { has, userId, userName } = useUserRole();
  const { data: employees } = useEmployees();
  const { data: hrRequests, refetch: refetchHR } = useHRRequests();
  const { data: tasks } = useTasks();
  const { data: courses } = useCourses();

  const pendingHR = hrRequests.filter(r => r.approval_status === "pending" || r.approval_status === "unit_approved");
  const myTasks = tasks.filter(t => t.status !== "completed");
  const completedTasks = tasks.filter(t => t.status === "completed");
  const activeCourses = courses.filter(c => c.status === "active").length;
  const trainees = courses.reduce((sum, c) => sum + (c.trainees?.length || 0), 0);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const todayStr = now.toISOString().split("T")[0];

  const monthApproved = hrRequests.filter(r => {
    const d = new Date(r.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear && r.approval_status === "approved";
  });
  const onLeave = monthApproved.filter(r => r.type.includes("إجازة"));
  const onTimeOff = monthApproved.filter(r => r.type === "خروجية");
  const absentToday = hrRequests.filter(r => r.type === "غياب" && r.date === todayStr && r.approval_status === "approved");
  const onDuty = monthApproved.filter(r => r.type === "واجب");

  const leaveUsage: Record<string, number> = {};
  onLeave.forEach(r => { leaveUsage[r.employee_name] = (leaveUsage[r.employee_name] || 0) + 1; });
  const timeUsage: Record<string, number> = {};
  onTimeOff.forEach(r => { timeUsage[r.employee_name] = (timeUsage[r.employee_name] || 0) + 1; });

  const makeHistory = (req: typeof hrRequests[0], kind: string, action: string) => {
    const prev: any[] = Array.isArray(req?.history) ? req.history : [];
    return [...prev, { id: `h_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, at: new Date().toISOString(), by_id: userId, by_name: userName, kind, action }];
  };

  const handleUnitApprove = (id: string) => {
    const req = hrRequests.find(r => r.id === id);
    const history = makeHistory(req, "approval", "موافقة رئيس الشعبة");
    localDb.hrRequests.update(id, { approval_status: "unit_approved", unit_head_status: "approved", unit_head_by: userId, unit_head_at: new Date().toISOString(), history });
    toast({ title: "موافقة رئيس الشعبة" });
    refetchHR();
  };
  const handleReject = (id: string) => {
    const req = hrRequests.find(r => r.id === id);
    const history = makeHistory(req, "rejection", "رفض رئيس الشعبة");
    localDb.hrRequests.update(id, { approval_status: "rejected", unit_head_status: "rejected", unit_head_by: userId, unit_head_at: new Date().toISOString(), history });
    toast({ title: "تم الرفض" });
    refetchHR();
  };

  return (
    <div className="space-y-4">
      {/* ROW 1: الموقف اليومي */}
      <div data-print-section="attendance" className="bg-card border border-border rounded-xl p-4">
        <SectionHeader icon={UsersIcon} title="الموقف اليومي" action={<Button variant="link" size="sm" className="h-auto p-0 text-[10px]" onClick={() => navigate("/hr")}>عرض الكل</Button>} />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3">
          <div className="bg-success/5 border border-success/20 rounded-lg p-3 cursor-pointer hover:shadow-sm transition-all" onClick={() => navigate("/hr")}>
            <div className="flex items-center gap-2 mb-1"><UserCheck className="w-4 h-4 text-success" /><span className="text-xs font-bold text-success">الحاضرون</span></div>
            <p className="text-2xl font-bold">{employees.length - onLeave.length - absentToday.length}</p>
          </div>
          <div className="bg-warning/5 border border-warning/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1"><CalendarPlus className="w-4 h-4 text-warning" /><span className="text-xs font-bold text-warning">المجازون ({onLeave.length})</span></div>
            <div className="space-y-0.5 max-h-16 overflow-y-auto">
              {onLeave.length === 0 ? <p className="text-[10px] text-muted-foreground">لا يوجد</p> :
                Object.entries(leaveUsage).map(([name, days]) => <PersonRow key={name} name={name} detail={`${days}/${MONTHLY_LEAVE}`} status="leave" onClick={() => navigate("/hr")} />)}
            </div>
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1"><Timer className="w-4 h-4 text-primary" /><span className="text-xs font-bold text-primary">الزمنيات ({onTimeOff.length})</span></div>
            <div className="space-y-0.5 max-h-16 overflow-y-auto">
              {onTimeOff.length === 0 ? <p className="text-[10px] text-muted-foreground">لا يوجد</p> :
                Object.entries(timeUsage).map(([name, hrs]) => <PersonRow key={name} name={name} detail={`${hrs}/${MONTHLY_TIME_HOURS}س`} status="timeoff" onClick={() => navigate("/hr")} />)}
            </div>
          </div>
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 cursor-pointer hover:shadow-sm transition-all" onClick={() => navigate("/hr")}>
            <div className="flex items-center gap-2 mb-1"><UserX className="w-4 h-4 text-destructive" /><span className="text-xs font-bold text-destructive">الغائبون ({absentToday.length})</span></div>
            {absentToday.slice(0, 2).map(r => <p key={r.id} className="text-[10px]">{r.employee_name}</p>)}
            {absentToday.length === 0 && <p className="text-[10px] text-muted-foreground">لا يوجد</p>}
          </div>
        </div>
      </div>

      {/* ROW 2: طلبات معلقة */}
      <div data-print-section="pending_requests" className="bg-card border border-border rounded-xl p-4">
        <SectionHeader icon={ClipboardList} title={`طلبات بانتظار إجراءك (${pendingHR.length})`} action={<Button variant="link" size="sm" className="h-auto p-0 text-[10px]" onClick={() => navigate("/hr")}>عرض الكل</Button>} />
        {pendingHR.length === 0 ? <p className="text-xs text-muted-foreground text-center py-4">لا توجد طلبات</p> : (
          <div className="space-y-1.5 flex-1 overflow-y-auto">
            {pendingHR.map(req => (
              <div key={req.id} className="flex items-center justify-between bg-muted/20 rounded-lg px-3 py-2">
                <div className="min-w-0 flex-1"><p className="text-xs font-medium">{req.employee_name}</p><p className="text-[10px] text-muted-foreground">{req.type} — {req.date}</p></div>
                <div className="flex gap-1 shrink-0 no-print">
                  {has("approve_hr_unit") && <button onClick={() => handleUnitApprove(req.id)} className="p-1 rounded bg-success/10 text-success hover:bg-success/20"><Check className="w-3 h-3" /></button>}
                  {has("reject_hr") && <button onClick={() => handleReject(req.id)} className="p-1 rounded bg-destructive/10 text-destructive hover:bg-destructive/20"><X className="w-3 h-3" /></button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ROW 3: المهام */}
      <div data-print-section="tasks" className="bg-card border border-border rounded-xl p-4">
        <SectionHeader icon={ListChecks} title={`مهامي (${myTasks.length})`} action={<Button variant="link" size="sm" className="h-auto p-0 text-[10px]" onClick={() => navigate("/tasks")}>عرض الكل</Button>} />
        <div className="space-y-1.5 flex-1 overflow-y-auto">
          {myTasks.slice(0, 5).map(t => (
            <div key={t.id} className="flex items-center justify-between bg-muted/20 rounded-lg px-3 py-2 cursor-pointer hover:bg-muted/30" onClick={() => navigate("/tasks")}>
              <div className="min-w-0 flex-1"><p className="text-xs font-medium truncate">{t.title}</p><p className="text-[10px] text-muted-foreground">{t.unit} | {t.stage}</p></div>
              <StatusBadge status={t.status === "in_progress" ? "قيد التنفيذ" : t.status === "review" ? "مراجعة" : "معلق"} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============ CURRICULUM DASHBOARD ============
const CurriculumDashboard = () => {
  const navigate = useNavigate();
  const { data: curriculumItems } = useCurriculumItems();
  const { data: tasks } = useTasks();
  const stageCounts = countByStage(curriculumItems);
  const pptCounts = countByPptStage(curriculumItems);
  const totalCur = curriculumItems.length;
  const missingReports = curriculumItems.filter(c => !c.report_uploaded).length;
  const missingPPT = curriculumItems.filter(c => !c.presentation_uploaded).length;
  const incompleteFields = curriculumItems.filter(c => hasEmptyFields(c).length > 0);
  const curTasks = tasks.filter(t => t.status !== "completed");

  return (
    <div className="space-y-4">
      <div data-print-section="curriculum_stages" className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3">
        <div className="bg-card border border-border rounded-xl p-3 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate("/curriculum")}><div className="flex items-center gap-2 mb-1"><FileText className="w-4 h-4 text-primary" /><span className="text-xs font-bold">إجمالي المناهج</span></div><p className="text-2xl font-bold">{totalCur}</p></div>
        <div className="bg-card border border-border rounded-xl p-3 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate("/curriculum")}><div className="flex items-center gap-2 mb-1"><BookX className="w-4 h-4 text-destructive" /><span className="text-xs font-bold">تقارير مفقودة</span></div><p className="text-2xl font-bold text-destructive">{missingReports}</p></div>
        <div className="bg-card border border-border rounded-xl p-3 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate("/curriculum")}><div className="flex items-center gap-2 mb-1"><Presentation className="w-4 h-4 text-warning" /><span className="text-xs font-bold">عروض مفقودة</span></div><p className="text-2xl font-bold text-warning">{missingPPT}</p></div>
        <div className="bg-card border border-border rounded-xl p-3 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate("/curriculum")}><div className="flex items-center gap-2 mb-1"><AlertCircle className="w-4 h-4 text-destructive" /><span className="text-xs font-bold">نقص بيانات</span></div><p className="text-2xl font-bold text-destructive">{incompleteFields.length}</p></div>
      </div>

      <div data-print-section="achievement" className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3">
        <div className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:shadow-sm transition-all" onClick={() => navigate("/curriculum")}>
          <p className="text-xs font-bold text-foreground mb-3">مراحل المناهج</p>
          <div className="space-y-2">{(Object.keys(stageCounts) as CurriculumStage[]).map(s => <MiniBar key={s} value={stageCounts[s]} max={totalCur || 1} color={stageColors[s].split(" ")[0]} label={stageLabels[s]} />)}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:shadow-sm transition-all" onClick={() => navigate("/curriculum")}>
          <p className="text-xs font-bold text-foreground mb-3">مراحل العروض</p>
          <div className="space-y-2">{(Object.keys(pptCounts) as PptStage[]).map(s => <MiniBar key={s} value={pptCounts[s]} max={totalCur || 1} color={pptStageColors[s].split(" ")[0]} label={pptStageLabels[s]} />)}</div>
        </div>
      </div>

      <div data-print-section="alerts" className="bg-card border border-border rounded-xl p-4">
        <SectionHeader icon={ListChecks} title={`المهام (${curTasks.length})`} action={<Button variant="link" size="sm" className="h-auto p-0 text-[10px]" onClick={() => navigate("/tasks")}>عرض الكل</Button>} />
        <div className="space-y-1.5 flex-1 overflow-y-auto">
          {curTasks.slice(0, 5).map(t => (
            <div key={t.id} className="flex items-center justify-between bg-muted/20 rounded-lg px-3 py-2 cursor-pointer hover:bg-muted/30" onClick={() => navigate("/tasks")}>
              <div className="min-w-0 flex-1"><p className="text-xs font-medium truncate">{t.title}</p></div>
              <StatusBadge status={t.status === "in_progress" ? "قيد التنفيذ" : t.status === "review" ? "مراجعة" : "معلق"} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============ INDIVIDUAL DASHBOARD ============
const IndividualDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: hrRequests } = useHRRequests();
  const { data: tasks } = useTasks();
  const { data: courses } = useCourses();
  const employees = localDb.employees.getAll();
  const emp = employees.find(e => e.id === user?.id);

  const myHR = hrRequests.filter(r => emp && r.employee_name === emp.name);
  const myPendingHR = myHR.filter(r => r.approval_status === "pending" || r.approval_status === "unit_approved");
  const myApprovedHR = myHR.filter(r => r.approval_status === "approved");
  const myTasks = tasks.filter(t => t.assigned_to === user?.id);
  const myPendingTasks = myTasks.filter(t => t.status !== "completed");
  const myCompletedTasks = myTasks.filter(t => t.status === "completed");
  const myTrainings = courses.filter(c => c.trainees?.some(t => t.employee_id === user?.id));
  const usedLeaves = myApprovedHR.filter(r => r.type.includes("إجازة")).length;
  const remainingLeaves = Math.max(MONTHLY_LEAVE - usedLeaves, 0);
  const usedTime = myApprovedHR.filter(r => r.type === "خروجية").length;

  return (
    <div className="space-y-4">
      {/* ROW 1: الموقف الشخصي */}
      <div data-print-section="attendance" className="bg-card border border-border rounded-xl p-4">
        <SectionHeader icon={UsersIcon} title="موقفي" />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3">
          <div className={`border rounded-lg p-3 cursor-pointer hover:shadow-sm transition-all ${remainingLeaves === 0 ? "bg-destructive/5 border-destructive/20" : "bg-success/5 border-success/20"}`} onClick={() => navigate("/hr")}>
            <div className="flex items-center gap-2 mb-1"><CalendarPlus className="w-4 h-4 text-warning" /><span className="text-xs font-bold text-warning">رصيد الإجازات</span></div>
            <p className="text-2xl font-bold">{remainingLeaves}/{MONTHLY_LEAVE}</p>
            <p className="text-[10px] text-muted-foreground">مستخدم: {usedLeaves} يوم</p>
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 cursor-pointer hover:shadow-sm transition-all" onClick={() => navigate("/hr")}>
            <div className="flex items-center gap-2 mb-1"><Timer className="w-4 h-4 text-primary" /><span className="text-xs font-bold text-primary">الزمنيات</span></div>
            <p className="text-2xl font-bold">{MONTHLY_TIME_HOURS - usedTime}/{MONTHLY_TIME_HOURS}</p>
            <p className="text-[10px] text-muted-foreground">مستخدم: {usedTime} ساعة</p>
          </div>
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 cursor-pointer hover:shadow-sm transition-all" onClick={() => navigate("/courses")}>
            <div className="flex items-center gap-2 mb-1"><BookOpen className="w-4 h-4 text-accent" /><span className="text-xs font-bold text-accent">دوراتي</span></div>
            <p className="text-2xl font-bold">{myTrainings.length}</p>
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 cursor-pointer hover:shadow-sm transition-all" onClick={() => navigate("/tasks")}>
            <div className="flex items-center gap-2 mb-1"><ListChecks className="w-4 h-4 text-primary" /><span className="text-xs font-bold text-primary">مهامي المعلقة</span></div>
            <p className="text-2xl font-bold">{myPendingTasks.length}</p>
            <p className="text-[10px] text-muted-foreground">{myCompletedTasks.length} منجزة</p>
          </div>
        </div>
      </div>

      {/* ROW 2: طلباتي + مهامي */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3">
        <div data-print-section="pending_requests" className="bg-card border border-border rounded-xl p-4">
          <SectionHeader icon={ClipboardList} title={`طلباتي (${myHR.length})`} action={<Button variant="link" size="sm" className="h-auto p-0 text-[10px]" onClick={() => navigate("/hr")}>عرض الكل</Button>} />
          {myHR.length === 0 ? <p className="text-xs text-muted-foreground text-center py-4">لا توجد طلبات</p> : (
            <div className="space-y-1.5 flex-1 overflow-y-auto">
              {myHR.map(r => (
                <div key={r.id} className="flex items-center justify-between bg-muted/20 rounded-lg px-3 py-2 cursor-pointer hover:bg-muted/30" onClick={() => navigate("/hr")}>
                  <div className="min-w-0 flex-1"><p className="text-xs font-medium">{r.type}</p><p className="text-[10px] text-muted-foreground">{r.date}</p></div>
                  <StatusBadge status={r.approval_status === "approved" ? "موافق" : r.approval_status === "rejected" ? "مرفوض" : r.approval_status === "unit_approved" ? "موافقة رئيس" : "معلق"} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div data-print-section="tasks" className="bg-card border border-border rounded-xl p-4">
          <SectionHeader icon={ListChecks} title={`مهامي (${myTasks.length})`} action={<Button variant="link" size="sm" className="h-auto p-0 text-[10px]" onClick={() => navigate("/tasks")}>عرض الكل</Button>} />
          {myTasks.length === 0 ? <p className="text-xs text-muted-foreground text-center py-4">لا توجد مهام</p> : (
            <div className="space-y-1.5 flex-1 overflow-y-auto">
              {myTasks.map(t => (
                <div key={t.id} className="flex items-center justify-between bg-muted/20 rounded-lg px-3 py-2 cursor-pointer hover:bg-muted/30" onClick={() => navigate("/tasks")}>
                  <div className="min-w-0 flex-1"><p className="text-xs font-medium truncate">{t.title}</p><p className="text-[10px] text-muted-foreground">{t.description}</p></div>
                  <StatusBadge status={t.status === "completed" ? "منجز" : t.status === "in_progress" ? "قيد التنفيذ" : "معلق"} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ROW 3: دوراتي */}
      <div data-print-section="curriculum_quick" className="bg-card border border-border rounded-xl p-4">
        <SectionHeader icon={BookOpen} title="دوراتي التدريبية" action={<Button variant="link" size="sm" className="h-auto p-0 text-[10px]" onClick={() => navigate("/courses")}>عرض الكل</Button>} />
        {myTrainings.length === 0 ? <p className="text-xs text-muted-foreground text-center py-4">لا توجد دورات</p> : (
          <div className="space-y-1.5">
            {myTrainings.map(c => (
              <div key={c.id} className="flex items-center justify-between bg-muted/20 rounded-lg px-3 py-2 cursor-pointer hover:bg-muted/30" onClick={() => navigate("/courses")}>
                <div className="min-w-0 flex-1"><p className="text-xs font-medium truncate">{c.title}</p><p className="text-[10px] text-muted-foreground">{c.start_date} → {c.end_date}</p></div>
                <StatusBadge status={c.status === "active" ? "نشطة" : c.status === "completed" ? "منجزة" : "مخططة"} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============ MAIN DASHBOARD ============
const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { persona, has } = useUserRole();

  if (authLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!user) return <div className="flex flex-col items-center justify-center py-20 gap-3"><AlertCircle className="w-12 h-12 text-muted-foreground" /><p className="text-sm text-muted-foreground">يرجى تسجيل الدخول</p></div>;

  const getDashboardSections = (): { id: string; label: string }[] => {
    const sections: { id: string; label: string }[] = [];
    if (has("view_attendance_section")) sections.push({ id: "attendance", label: "الموقف اليومي" });
    if (has("view_pending_requests_section")) sections.push({ id: "pending_requests", label: "الطلبات المعلقة" });
    if (has("view_tasks_section")) sections.push({ id: "tasks", label: "المهام" });
    if (has("view_alerts_section")) sections.push({ id: "alerts", label: "التنبيهات" });
    if (has("view_curriculum_stages_section")) sections.push({ id: "curriculum_stages", label: "مراحل المنهاج" });
    if (has("view_achievement_section")) sections.push({ id: "achievement", label: "نسبة الإنجاز" });
    if (has("view_curriculum_quick_section")) sections.push({ id: "curriculum_quick", label: "المناهج نظرة سريعة" });
    return sections;
  };

  const dashboardSections = getDashboardSections();

  return (
    <div className="h-full flex flex-col p-2 md:p-3 overflow-hidden">
      <PageHeader title="لوحة التحكم" subtitle={`مرحباً ${user.name} — ${user.position}`} icon={LayoutDashboard} sections={dashboardSections} />
      <div className="flex-1 overflow-y-auto min-h-0">
        {persona === "admin" || persona === "dept_manager" ? <ManagerDashboard />
          : persona === "prep_unit_head" || persona === "unit_head" ? <PrepDashboard />
          : persona === "curriculum_unit_head" ? <CurriculumDashboard />
          : <IndividualDashboard />}
      </div>
    </div>
  );
};

export default Dashboard;


