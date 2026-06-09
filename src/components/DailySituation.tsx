import { useState, useMemo } from "react";
import { useHRRequests, useEmployees, type HRRequest, type Employee } from "@/hooks/useSupabaseData";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { localDb } from "@/lib/localStore";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import StatusBadge from "@/components/StatusBadge";
import {
  Users, Clock, FileText, UserX, Filter, Plus, Check, X, Undo2, Loader2, Briefcase,
} from "lucide-react";

const MONTHLY_LEAVE_DAYS = 3;
const MONTHLY_TIME_HOURS = 7;

const scheduleLabels: Record<string, string> = {
  daily: "يومي",
  shift_7x7: "وجبات 7×7",
  shift_15x15: "وجبات 15×15",
};

const statusLabels: Record<string, string> = {
  pending: "معلّق",
  unit_approved: "موافقة رئيس الشعبة",
  approved: "موافق عليه",
  rejected: "مرفوض",
};

const typeOptions = [
  { value: "إجازة اعتيادية", label: "إجازة اعتيادية" },
  { value: "إجازة مرضية", label: "إجازة مرضية" },
  { value: "إجازة طارئة", label: "إجازة طارئة" },
  { value: "خروجية", label: "خروجية (زمنية)" },
  { value: "غياب", label: "غياب" },
];

interface DailySituationProps {
  embedded?: boolean; // true when in Dashboard
}

const DailySituation = ({ embedded = false }: DailySituationProps) => {
  const { data: requests, loading: reqLoading, refetch } = useHRRequests();
  const { data: employees, loading: empLoading } = useEmployees();
  const { user } = useAuth();
  const { isIndividual, isUnitHead, isManager, isAdmin, section, has, userId } = useUserRole();

  // Approval permissions (must match HR page gating)
  const canUnitApprove = isUnitHead && !isManager && !isAdmin && has("approve_hr_unit");
  const canDeptApprove = (isManager || isAdmin) && has("approve_hr_dept");
  const canApprove = canUnitApprove || canDeptApprove;
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "individual" | "group">("all");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [form, setForm] = useState({ employee_name: "", department: "", type: "إجازة اعتيادية", date: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const loading = reqLoading || empLoading;

  // Current month
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const today = now.toISOString().split("T")[0];

  // Filter employees by group
  const filteredEmployees = useMemo(() => {
    // Exclude department managers from HR stats (مدير القسم لا يُحسب ضمن إحصائيات الحضور)
    let emps = employees.filter(e => {
      const pos = (e.position || "").toLowerCase();
      return !(pos.includes("مدير القسم") || pos.includes("dept manager") || pos.includes("department manager"));
    });
    if (filterMode === "individual" && selectedEmployee) {
      emps = emps.filter(e => e.id === selectedEmployee);
    } else if (filterMode === "group" && selectedGroup !== "all") {
      emps = emps.filter(e => e.work_schedule === selectedGroup);
    }
    return emps;
  }, [employees, filterMode, selectedEmployee, selectedGroup]);

  const filteredEmployeeNames = useMemo(() => new Set(filteredEmployees.map(e => e.name)), [filteredEmployees]);

  // This month's requests for filtered employees
  const monthRequests = useMemo(() => {
    return requests.filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && filteredEmployeeNames.has(r.employee_name);
    });
  }, [requests, currentMonth, currentYear, filteredEmployeeNames]);

  // Stats
  const approvedLeaves = monthRequests.filter(r => r.type.includes("إجازة") && r.approval_status === "approved");
  const timePerms = monthRequests.filter(r => r.type === "خروجية" && r.approval_status === "approved");
  const onDuty = monthRequests.filter(r => r.type === "واجب" && r.approval_status === "approved");
  const absentees = monthRequests.filter(r => r.type === "غياب" && r.date === today);
  const pendingRequests = monthRequests.filter(r => r.approval_status === "pending" || r.approval_status === "unit_approved");

  // Default: everyone is present today unless they are on approved leave/duty/time-off or marked absent today
  const awayToday = new Set(
    monthRequests
      .filter(r => r.date === today && (r.approval_status === "approved" || r.type === "غياب"))
      .map(r => r.employee_name)
  );
  const presentTodayCount = filteredEmployees.filter(e => !awayToday.has(e.name)).length;

  // Leave usage per employee
  const leaveUsage = useMemo(() => {
    const map: Record<string, number> = {};
    approvedLeaves.forEach(r => {
      map[r.employee_name] = (map[r.employee_name] || 0) + 1;
    });
    return map;
  }, [approvedLeaves]);

  // Time usage per employee (count hours - each خروجية = 1 hour)
  const timeUsage = useMemo(() => {
    const map: Record<string, number> = {};
    timePerms.forEach(r => {
      map[r.employee_name] = (map[r.employee_name] || 0) + 1;
    });
    return map;
  }, [timePerms]);

  // Employee schedule breakdown
  const dailyCount = filteredEmployees.filter(e => e.work_schedule === "daily").length;
  const shift7Count = filteredEmployees.filter(e => e.work_schedule === "shift_7x7").length;
  const shift15Count = filteredEmployees.filter(e => e.work_schedule === "shift_15x15").length;

  // Handlers
  const handleApprove = async (id: string, level: "unit" | "dept") => {
    const req = requests.find(r => r.id === id);
    if (req?.created_by === userId) { toast({ title: "خطأ", description: "لا يمكنك الموافقة على طلبك", variant: "destructive" }); return; }
    if (level === "unit") {
      if (!canUnitApprove) return;
      localDb.hrRequests.update(id, { approval_status: "unit_approved", unit_head_status: "approved", unit_head_by: userId, unit_head_at: new Date().toISOString() });
      toast({ title: "تم", description: "تمت موافقة رئيس الشعبة" });
    } else {
      if (!canDeptApprove) return;
      localDb.hrRequests.update(id, { approval_status: "approved", dept_manager_status: "approved", dept_manager_by: userId, dept_manager_at: new Date().toISOString() });
      toast({ title: "تم", description: "تمت الموافقة النهائية" });
    }
    refetch();
  };

  const handleReject = async (id: string) => {
    const req = requests.find(r => r.id === id);
    if (req?.created_by === userId) { toast({ title: "خطأ", description: "لا يمكنك رفض طلبك", variant: "destructive" }); return; }
    if (!canApprove) return;
    const patch: Record<string, unknown> = { approval_status: "rejected" };
    if (canDeptApprove) { patch.dept_manager_status = "rejected"; patch.dept_manager_by = userId; patch.dept_manager_at = new Date().toISOString(); }
    else { patch.unit_head_status = "rejected"; patch.unit_head_by = userId; patch.unit_head_at = new Date().toISOString(); }
    localDb.hrRequests.update(id, patch);
    toast({ title: "تم", description: "تم رفض الطلب" });
    refetch();
  };

  const handleUndo = async (id: string) => {
    if (!canDeptApprove || !has("undo_hr_decision")) return;
    localDb.hrRequests.update(id, { approval_status: "pending", unit_head_status: "pending", unit_head_by: null, unit_head_at: null, dept_manager_status: "pending", dept_manager_by: null, dept_manager_at: null });
    toast({ title: "تم", description: "تم التراجع عن القرار وإعادة الطلب للمعلّق" });
    refetch();
  };

  const handleManagerOverride = async (id: string) => {
    const req = requests.find(r => r.id === id);
    if (req?.created_by === userId) { toast({ title: "خطأ", description: "لا يمكنك الموافقة على طلبك", variant: "destructive" }); return; }
    if (!canDeptApprove) return;
    localDb.hrRequests.update(id, { approval_status: "approved", unit_head_status: "approved", unit_head_by: userId, unit_head_at: new Date().toISOString(), dept_manager_status: "approved", dept_manager_by: userId, dept_manager_at: new Date().toISOString() });
    toast({ title: "تم", description: "تمت الموافقة النهائية (صلاحية المدير)" });
    refetch();
  };

  const handleNewRequest = async () => {
    if (!form.employee_name || !form.date) {
      toast({ title: "خطأ", description: "يرجى تعبئة جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }
    if (isIndividual && form.type === "غياب") {
      toast({ title: "خطأ", description: "لا يمكنك تسجيل غياب لنفسك", variant: "destructive" });
      setSaving(false); return;
    }
    setSaving(true);
    const isOwnRequest = form.employee_name === user?.name;
    const isSubmitterManager = (isManager || isAdmin);
    const insertPayload: Record<string, unknown> = {
      employee_name: form.employee_name,
      department: form.department,
      type: form.type,
      date: form.date,
      notes: form.notes,
      created_by: user?.id,
    };
    if (isSubmitterManager && !isOwnRequest) {
      insertPayload.unit_head_status = "approved";
      insertPayload.unit_head_by = user?.id;
      insertPayload.unit_head_at = new Date().toISOString();
      insertPayload.approval_status = "unit_approved";
    } else {
      insertPayload.approval_status = "pending";
    }
    localDb.hrRequests.insert(insertPayload);
    toast({ title: "تم", description: "تم تقديم الطلب بنجاح" });
    setSaving(false);
    setShowNewRequest(false);
    setForm({ employee_name: "", department: "", type: "إجازة اعتيادية", date: "", notes: "" });
    refetch();
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const renderRequestActions = (req: HRRequest) => (
    <div className="flex gap-1 flex-wrap no-print">
      {req.approval_status === "pending" && (
        <>
          <button onClick={() => handleApprove(req.id, "unit")} className="p-1.5 rounded-md bg-success/10 text-success hover:bg-success/20 transition-colors" title="موافقة رئيس الشعبة"><Check className="w-3.5 h-3.5" /></button>
          <button onClick={() => handleReject(req.id)} className="p-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors" title="رفض"><X className="w-3.5 h-3.5" /></button>
          <button onClick={() => handleManagerOverride(req.id)} className="p-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors" title="موافقة مباشرة (مدير)"><Check className="w-3.5 h-3.5" strokeWidth={3} /></button>
        </>
      )}
      {req.approval_status === "unit_approved" && (
        <>
          <button onClick={() => handleApprove(req.id, "dept")} className="p-1.5 rounded-md bg-success/10 text-success hover:bg-success/20 transition-colors" title="موافقة نهائية"><Check className="w-3.5 h-3.5" /></button>
          <button onClick={() => handleReject(req.id)} className="p-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors" title="رفض"><X className="w-3.5 h-3.5" /></button>
        </>
      )}
      {(req.approval_status === "approved" || req.approval_status === "rejected") && (
        <button onClick={() => handleUndo(req.id)} className="p-1.5 rounded-md bg-warning/10 text-warning hover:bg-warning/20 transition-colors" title="تراجع"><Undo2 className="w-3.5 h-3.5" /></button>
      )}
    </div>
  );

  return (
    <div className={embedded ? "space-y-2" : "space-y-5"}>
      {/* Header */}
      <div className={`flex items-center ${embedded ? "justify-between" : "flex-col text-center space-y-1"}`}>
        <div className={embedded ? "" : "text-center"}>
          <h2 className={`font-bold text-primary ${embedded ? "text-sm" : "text-lg md:text-xl"}`}>الموقف اليومي</h2>
          {!embedded && <p className="text-xs text-muted-foreground">
            {now.toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>}
        </div>
        {embedded && (
          <div className="flex gap-1.5 no-print">
            <Button variant="outline" size="sm" className="gap-1 h-7 text-xs px-2" onClick={() => {
              setForm({ employee_name: isIndividual ? (user?.name || "") : "", department: "", type: "إجازة اعتيادية", date: today, notes: "" });
              setShowNewRequest(true);
            }}>
              <Plus className="w-3 h-3" />طلب
            </Button>
          </div>
        )}
      </div>

      {/* Filter & Print Buttons - only show in full mode */}
      {!embedded && (
        <div className="flex justify-center gap-2 flex-wrap no-print">
          <Select value={filterMode} onValueChange={(v: string) => { setFilterMode(v as "all" | "individual" | "group"); setSelectedEmployee(""); setSelectedGroup("all"); }}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="individual">فلترة حسب الفرد</SelectItem>
              <SelectItem value="group">فلترة حسب المجموعة</SelectItem>
            </SelectContent>
          </Select>

          {filterMode === "individual" && (
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="w-48"><SelectValue placeholder="اختر الموظف" /></SelectTrigger>
              <SelectContent>
                {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}

          {filterMode === "group" && (
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="daily">يومي</SelectItem>
                <SelectItem value="shift_7x7">وجبات 7×7</SelectItem>
                <SelectItem value="shift_15x15">وجبات 15×15</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Button variant="outline" size="sm" className="gap-1" onClick={() => {
            setForm({ employee_name: isIndividual ? (user?.name || "") : "", department: "", type: "إجازة اعتيادية", date: today, notes: "" });
            setShowNewRequest(true);
          }}>
            <Plus className="w-4 h-4" />طلب جديد
          </Button>
        </div>
      )}

      {/* 5-Card Grid */}
      <div data-print-section="daily_stats" className={`grid grid-cols-5 ${embedded ? "gap-2" : "grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3"}`}>
        {/* الحضور الكلي */}
        <div
          className={`bg-card border border-border rounded-lg text-center cursor-pointer hover:shadow-md transition-shadow ${embedded ? "p-2" : "rounded-xl p-4"}`}
          onClick={() => setActiveDialog("attendance")}
        >
          <h3 className={`font-bold text-foreground ${embedded ? "text-[10px] mb-0.5" : "text-xs mb-1"}`}>الحاضرون اليوم</h3>
          <p className={`font-bold text-success ${embedded ? "text-xl" : "text-3xl"}`}>{presentTodayCount} <span className="text-xs text-muted-foreground font-normal">/ {filteredEmployees.length}</span></p>
          <p className="text-[10px] text-muted-foreground mt-0.5">يومي: {dailyCount} | وجبات: {shift7Count + shift15Count}</p>
        </div>

        {/* عدد المجازين */}
        <div className={`bg-card border border-border rounded-lg text-center cursor-pointer hover:shadow-md transition-shadow ${embedded ? "p-2" : "rounded-xl p-4"}`} onClick={() => setActiveDialog("leaves")}>
          <h3 className={`font-bold text-foreground ${embedded ? "text-[10px] mb-0.5" : "text-xs mb-1"}`}>المجازين</h3>
          {!embedded && <Users className="w-6 h-6 text-primary mx-auto" />}
          <p className={`font-bold text-primary ${embedded ? "text-xl" : "text-2xl"}`}>{approvedLeaves.length}</p>
        </div>

        {/* الزمنيات */}
        <div className={`bg-card border border-border rounded-lg text-center cursor-pointer hover:shadow-md transition-shadow ${embedded ? "p-2" : "rounded-xl p-4"}`} onClick={() => setActiveDialog("timePerms")}>
          <h3 className={`font-bold text-foreground ${embedded ? "text-[10px] mb-0.5" : "text-xs mb-1"}`}>الزمنيات</h3>
          {!embedded && <Clock className="w-6 h-6 text-primary mx-auto" />}
          <p className={`font-bold text-primary ${embedded ? "text-xl" : "text-2xl"}`}>{timePerms.length}</p>
        </div>

        {/* عدد الواجبات */}
        <div className={`bg-card border border-border rounded-lg text-center cursor-pointer hover:shadow-md transition-shadow ${embedded ? "p-2" : "rounded-xl p-4"}`} onClick={() => setActiveDialog("duties")}>
          <h3 className={`font-bold text-foreground ${embedded ? "text-[10px] mb-0.5" : "text-xs mb-1"}`}>الواجبات</h3>
          {!embedded && <Briefcase className="w-6 h-6 text-primary mx-auto" />}
          <p className={`font-bold text-primary ${embedded ? "text-xl" : "text-2xl"}`}>{onDuty.length}</p>
        </div>

        {/* عدد الغيابات */}
        <div className={`bg-card border border-border rounded-lg text-center cursor-pointer hover:shadow-md transition-shadow ${embedded ? "p-2" : "rounded-xl p-4"}`} onClick={() => setActiveDialog("absences")}>
          <h3 className={`font-bold text-foreground ${embedded ? "text-[10px] mb-0.5" : "text-xs mb-1"}`}>الغيابات</h3>
          {!embedded && <UserX className="w-6 h-6 text-destructive mx-auto" />}
          <p className={`font-bold ${embedded ? "text-xl" : "text-2xl"} text-destructive`}>{absentees.length}</p>
        </div>
      </div>

      {/* Pending Requests Table - hide in embedded mode */}
      {!embedded && pendingRequests.length > 0 && (
        <div data-print-section="pending_requests" className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 bg-warning/5 border-b border-border">
            <h3 className="text-sm font-bold text-foreground">طلبات بانتظار الإجراء ({pendingRequests.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>الموظف</th><th>النوع</th><th>التاريخ</th><th>الحالة</th><th className="no-print">إجراءات</th></tr></thead>
              <tbody>
                {pendingRequests.map(req => (
                  <tr key={req.id}>
                    <td className="font-medium text-foreground">{req.employee_name}</td>
                    <td><StatusBadge status={req.type} variant="info" /></td>
                    <td className="text-muted-foreground">{req.date}</td>
                    <td><StatusBadge status={statusLabels[req.approval_status] || req.approval_status} /></td>
                    <td>{renderRequestActions(req)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recently processed requests with undo - hide in embedded mode */}
      {!embedded && monthRequests.filter(r => r.approval_status === "approved" || r.approval_status === "rejected").length > 0 && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 bg-muted/50 border-b border-border">
            <h3 className="text-sm font-bold text-foreground">طلبات تم معالجتها (مع إمكانية التراجع)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>الموظف</th><th>النوع</th><th>التاريخ</th><th>الحالة</th><th className="no-print">تراجع</th></tr></thead>
              <tbody>
                {monthRequests.filter(r => r.approval_status === "approved" || r.approval_status === "rejected").slice(0, 10).map(req => (
                  <tr key={req.id}>
                    <td className="font-medium text-foreground">{req.employee_name}</td>
                    <td><StatusBadge status={req.type} variant="info" /></td>
                    <td className="text-muted-foreground">{req.date}</td>
                    <td><StatusBadge status={statusLabels[req.approval_status] || req.approval_status} /></td>
                    <td>{renderRequestActions(req)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== DIALOGS ===== */}

      {/* Attendance Dialog */}
      <Dialog open={activeDialog === "attendance"} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>الحضور الكلي - تفصيل</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-primary/10 rounded-lg p-3">
                <p className="text-2xl font-bold text-primary">{dailyCount}</p>
                <p className="text-xs text-muted-foreground">يومي</p>
              </div>
              <div className="bg-accent/10 rounded-lg p-3">
                <p className="text-2xl font-bold text-accent">{shift7Count}</p>
                <p className="text-xs text-muted-foreground">وجبات 7×7</p>
              </div>
              <div className="bg-warning/10 rounded-lg p-3">
                <p className="text-2xl font-bold text-warning">{shift15Count}</p>
                <p className="text-xs text-muted-foreground">وجبات 15×15</p>
              </div>
            </div>
            <table className="data-table">
              <thead><tr><th>الاسم</th><th>القسم</th><th>النظام</th></tr></thead>
              <tbody>
                {filteredEmployees.map(e => (
                  <tr key={e.id}>
                    <td className="font-medium text-foreground">{e.name}</td>
                    <td className="text-muted-foreground">{e.department}</td>
                    <td><span className="badge-info">{scheduleLabels[e.work_schedule] || e.work_schedule}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Leaves Dialog */}
      <Dialog open={activeDialog === "leaves"} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>المجازين - تفصيل الإجازات ({MONTHLY_LEAVE_DAYS} أيام/شهر)</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {filteredEmployees.filter(e => e.work_schedule === "daily").map(e => {
              const used = leaveUsage[e.name] || 0;
              const remaining = Math.max(MONTHLY_LEAVE_DAYS - used, 0);
              const exhausted = remaining === 0;
              return (
                <div key={e.id} className={`flex items-center justify-between rounded-lg px-3 py-2 ${exhausted ? "bg-destructive/10" : "bg-card border border-border"}`}>
                  <div>
                    <p className="text-sm font-medium text-foreground">{e.name}</p>
                    <p className="text-[10px] text-muted-foreground">{e.department}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-foreground">مستخدم: {used} / {MONTHLY_LEAVE_DAYS}</p>
                    <p className={`text-xs ${exhausted ? "text-destructive font-bold" : "text-success"}`}>
                      {exhausted ? "استنفذ الرصيد" : `متبقي: ${remaining} يوم`}
                    </p>
                  </div>
                </div>
              );
            })}
            {filteredEmployees.filter(e => e.work_schedule === "daily").length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">لا يوجد موظفين يوميين</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Time Permissions Dialog */}
      <Dialog open={activeDialog === "timePerms"} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>الزمنيات - تفصيل ({MONTHLY_TIME_HOURS} ساعات/شهر)</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {filteredEmployees.map(e => {
              const used = timeUsage[e.name] || 0;
              const remaining = Math.max(MONTHLY_TIME_HOURS - used, 0);
              const exhausted = remaining === 0;
              return (
                <div key={e.id} className={`flex items-center justify-between rounded-lg px-3 py-2 ${exhausted ? "bg-destructive/10" : "bg-card border border-border"}`}>
                  <div>
                    <p className="text-sm font-medium text-foreground">{e.name}</p>
                    <p className="text-[10px] text-muted-foreground">{scheduleLabels[e.work_schedule]}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-foreground">مستخدم: {used} / {MONTHLY_TIME_HOURS} ساعات</p>
                    <p className={`text-xs ${exhausted ? "text-destructive font-bold" : "text-success"}`}>
                      {exhausted ? "استنفذ الرصيد" : `متبقي: ${remaining} ساعة`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Duties Dialog */}
      <Dialog open={activeDialog === "duties"} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>الواجبات (الواجبات)</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {onDuty.length > 0 ? onDuty.map(r => (
              <div key={r.id} className="flex items-center justify-between bg-card border border-border rounded-lg px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-foreground">{r.employee_name}</p>
                  <p className="text-xs text-muted-foreground">{r.notes}</p>
                </div>
                <p className="text-xs text-muted-foreground">{r.date}</p>
              </div>
            )) : <p className="text-sm text-muted-foreground text-center py-4">لا توجد واجبات</p>}
          </div>
        </DialogContent>
      </Dialog>

      {/* Absences Dialog */}
      <Dialog open={activeDialog === "absences"} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>الغيابات - اليوم</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {absentees.length > 0 ? absentees.map(r => {
              const emp = employees.find(e => e.name === r.employee_name);
              return (
                <div key={r.id} className="flex items-center justify-between bg-destructive/5 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.employee_name}</p>
                    <p className="text-xs text-muted-foreground">{r.department}</p>
                  </div>
                  <span className="badge-info">{scheduleLabels[emp?.work_schedule || "daily"]}</span>
                </div>
              );
            }) : <p className="text-sm text-muted-foreground text-center py-4">لا يوجد غيابات لهذا اليوم</p>}
            {/* Show breakdown by schedule */}
            {absentees.length > 0 && (
              <div className="border-t border-border pt-3 mt-3">
                <p className="text-xs font-bold text-foreground mb-2">حسب النظام:</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {["daily", "shift_7x7", "shift_15x15"].map(sched => {
                    const count = absentees.filter(r => {
                      const emp = employees.find(e => e.name === r.employee_name);
                      return emp?.work_schedule === sched;
                    }).length;
                    return (
                      <div key={sched} className="bg-muted rounded-lg p-2">
                        <p className="text-lg font-bold text-foreground">{count}</p>
                        <p className="text-[10px] text-muted-foreground">{scheduleLabels[sched]}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* New Request Dialog */}
      <Dialog open={showNewRequest} onOpenChange={setShowNewRequest}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>طلب إجازة / زمنية / واجب</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>اسم الموظف</Label>
              {isIndividual ? (
                <Input value={user?.name || ""} disabled onChange={() => {}} />
              ) : (
                <Select value={form.employee_name} onValueChange={(v) => {
                  const emp = employees.find(e => e.name === v);
                  setForm({ ...form, employee_name: v, department: emp?.department || "" });
                }}>
                  <SelectTrigger><SelectValue placeholder="اختر الموظف" /></SelectTrigger>
                  <SelectContent>
                    {employees
                      .filter(e => {
                        if (isUnitHead && !isManager && !isAdmin) return e.section === section;
                        return true;
                      })
                      .map(e => <SelectItem key={e.id} value={e.name}>{e.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div>
              <Label>النوع</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {typeOptions.filter(t => !isIndividual || t.value !== "غياب").map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>التاريخ</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            <div><Label>ملاحظات</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
            <Button onClick={handleNewRequest} disabled={saving} className="w-full">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "تقديم الطلب"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DailySituation;

