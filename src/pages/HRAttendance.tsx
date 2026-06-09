import DailySituation from "@/components/DailySituation";
import WeeklyShiftScheduler from "@/components/WeeklyShiftScheduler";
import { useHRRequests, useEmployees, type HRRequest } from "@/hooks/useSupabaseData";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";
import { localDb } from "@/lib/localStore";
import { logAction } from "@/lib/auditLog";
import StatusBadge from "@/components/StatusBadge";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Users, Search, Check, X, Eye, Loader2, Undo2, CalendarPlus, MessageSquare, Send, ChevronDown, ChevronUp, EyeOff, UserCheck, Briefcase, Clock, AlertCircle } from "lucide-react";

type HistoryEntry = {
  id: string;
  action: string;
  kind: "approval" | "rejection" | "undo" | "opinion_request" | "opinion" | "comment" | "cancel" | "create" | "override";
  by_id: string;
  by_name: string;
  reason?: string;
  text?: string;
  hidden_from_employee?: boolean;
  at: string;
};
const newHistoryId = () => `h_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const statusLabels: Record<string, string> = {
  pending: "معلّق",
  unit_approved: "موافقة رئيس الشعبة",
  approved: "موافق عليه",
  rejected: "مرفوض",
  cancelled: "ملغى",
};

const typeConfig: Record<string, { border: string; icon: typeof AlertCircle; iconColor: string; bg: string }> = {
  "إجازة اعتيادية": { border: "border-s-blue-500", icon: CalendarPlus, iconColor: "text-blue-500", bg: "bg-blue-500/10" },
  "إجازة مرضية": { border: "border-s-red-500", icon: AlertCircle, iconColor: "text-red-500", bg: "bg-red-500/10" },
  "إجازة طارئة": { border: "border-s-orange-500", icon: AlertCircle, iconColor: "text-orange-500", bg: "bg-orange-500/10" },
  "خروجية": { border: "border-s-purple-500", icon: Clock, iconColor: "text-purple-500", bg: "bg-purple-500/10" },
  "واجب": { border: "border-s-emerald-500", icon: Briefcase, iconColor: "text-emerald-500", bg: "bg-emerald-500/10" },
  "غياب": { border: "border-s-gray-500", icon: X, iconColor: "text-gray-500", bg: "bg-gray-500/10" },
};

const getTypeConfig = (type: string) => typeConfig[type] || { border: "border-s-primary", icon: AlertCircle, iconColor: "text-primary", bg: "bg-primary/10" };

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return parts[0][0] + parts[1][0];
  return parts[0]?.[0] || "؟";
};

const HRAttendance = () => {
  const { data: requests, loading, refetch } = useHRRequests();
  const { data: allEmployees } = useEmployees();
  
  // Filter out the general manager from HR tracking
  const employees = useMemo(() => allEmployees.filter(e => e.position !== "مدير القسم" && e.position !== "مدير النظام (Admin)"), [allEmployees]);
  
  const { canApproveRequests, canUnitApprove, isManager, isDeptManager, isUnitHead, isAdmin, userName, userId, isIndividual, has, persona } = useUserRole();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<HRRequest | null>(null);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ employee_name: "", type: "إجازة اعتيادية", date: "", end_date: "", notes: "", department: "", hours: "1" });
  const [leaveSaving, setLeaveSaving] = useState(false);
  const [opinionDraft, setOpinionDraft] = useState<Record<string, string>>({});
  const [topCollapsed, setTopCollapsed] = useState(false);
  const [undoTarget, setUndoTarget] = useState<{ id: string; level: "unit" | "dept" } | null>(null);
  const [undoReason, setUndoReason] = useState("");
  const [commentDraft, setCommentDraft] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  // Deep-link: open a specific request dialog when arriving from a notification (/hr?req=ID)
  useEffect(() => {
    const reqId = searchParams.get("req");
    if (!reqId || loading) return;
    const found = requests.find(r => r.id === reqId);
    if (found) {
      setSelectedRequest(found);
      const next = new URLSearchParams(searchParams);
      next.delete("req");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, requests, loading, setSearchParams]);



  const today = new Date().toISOString().split("T")[0];

  const stats = useMemo(() => {
    const todayReqs = requests.filter(r => r.date === today);
    const awayNames = new Set(
      todayReqs.filter(r => r.approval_status === "approved" || r.type === "غياب").map(r => r.employee_name)
    );
    const leaveNames = new Set(
      todayReqs.filter(r => r.type.includes("إجازة") && r.approval_status === "approved").map(r => r.employee_name)
    );
    const dutyNames = new Set(
      todayReqs.filter(r => r.type === "واجب" && r.approval_status === "approved").map(r => r.employee_name)
    );
    const presentCount = employees.filter(e => !awayNames.has(e.name)).length;
    const leaveCount = leaveNames.size;
    const dutyCount = dutyNames.size;
    const pendingCount = requests.filter(r => r.approval_status === "pending" || r.approval_status === "unit_approved").length;
    return { presentCount, leaveCount, dutyCount, pendingCount, awayNames, leaveNames, dutyNames };
  }, [requests, employees, today]);

  const employeeStatuses = useMemo(() => {
    return employees.map(emp => {
      if (stats.awayNames.has(emp.name)) {
        if (stats.leaveNames.has(emp.name)) return { ...emp, dayStatus: "leave" as const };
        if (stats.dutyNames.has(emp.name)) return { ...emp, dayStatus: "duty" as const };
        return { ...emp, dayStatus: "absent" as const };
      }
      return { ...emp, dayStatus: "present" as const };
    });
  }, [employees, stats]);

  // Generate 14 days lookahead
  const next14Days = useMemo(() => {
    const days = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push(d.toISOString().split("T")[0]);
    }
    return days;
  }, []);

  const currentEmpSection = employees.find(e => e.id === userId)?.section;

  // Filter requests for calendar
  const calendarRequests = useMemo(() => {
    return requests.filter(r => 
      r.type.includes("إجازة") && 
      ["unit_approved", "approved"].includes(r.approval_status) &&
      next14Days.includes(r.date)
    );
  }, [requests, next14Days]);

  const appendHistory = (req: HRRequest, entry: Omit<HistoryEntry, "id" | "at" | "by_id" | "by_name">) => {
    const prev: HistoryEntry[] = Array.isArray(req?.history) ? req.history : [];
    const next: HistoryEntry[] = [...prev, { id: newHistoryId(), at: new Date().toISOString(), by_id: userId, by_name: userName, ...entry }];
    return next;
  };
  const toggleHistoryHidden = (req: HRRequest, hid: string) => {
    const list: HistoryEntry[] = Array.isArray(req?.history) ? req.history : [];
    const next = list.map(h => h.id === hid ? { ...h, hidden_from_employee: !h.hidden_from_employee } : h);
    localDb.hrRequests.update(req.id, { history: next });
    setSelectedRequest({ ...req, history: next });
    refetch();
  };

  const isPrepAbsent = useMemo(() => {
    const head = allEmployees.find(e => (e.roles?.includes("unit_head") || e.roles?.includes("prep_unit_head")) && (e.section.includes("داد") || e.section.includes("تدريب") || e.section.includes("عداد")));
    return head ? stats.awayNames.has(head.name) : false;
  }, [allEmployees, stats.awayNames]);

  const isCurrAbsent = useMemo(() => {
    const head = allEmployees.find(e => (e.roles?.includes("unit_head") || e.roles?.includes("curriculum_unit_head")) && (e.section.includes("ناهج") || e.section.includes("مناهج")));
    return head ? stats.awayNames.has(head.name) : false;
  }, [allEmployees, stats.awayNames]);

  const filtered = requests.filter((r) => {
    const matchSearch = r.employee_name.includes(search) || r.type.includes(search);
    const matchStatus = filterStatus === "all" || r.approval_status === filterStatus;
    
    let matchVisibility = false;
    if (isAdmin || isManager) {
      matchVisibility = true;
    } else if (isUnitHead) {
      const emp = allEmployees.find(e => e.name === r.employee_name);
      const reqSection = emp?.section || "";
      if (reqSection === currentEmpSection) matchVisibility = true;
      else if (persona === "prep_unit_head" && isCurrAbsent) matchVisibility = true;
      else if (persona === "curriculum_unit_head" && isPrepAbsent) matchVisibility = true;
      
      if (r.created_by === userId) matchVisibility = true;
    } else {
      matchVisibility = (r.created_by === userId);
    }

    return matchSearch && matchStatus && matchVisibility;
  });

  const handleUnitApprove = async (id: string) => {
    const req = requests.find(r => r.id === id);
    if (!req) return;
    if (req.created_by === userId) {
      toast({ title: "خطأ", description: "لا يمكنك الموافقة على طلبك", variant: "destructive" });
      return;
    }
    const history = appendHistory(req, { kind: "approval", action: "موافقة رئيس الشعبة" });
    localDb.hrRequests.update(id, {
      approval_status: "unit_approved",
      unit_head_status: "approved",
      unit_head_by: userId,
      unit_head_at: new Date().toISOString(),
      history,
    });
    if (req?.created_by) localDb.notifications.insert({ user_id: req.created_by, message: `وافق رئيس الشعبة على طلبك (${req.type})`, type: "info", link: "/hr" });
    await logAction(userName, "موافقة رئيس شعبة", `طلب ${id}`);
    toast({ title: "تم", description: "تمت موافقة رئيس الشعبة" });
    refetch();
  };

  const handleUnitReject = async (id: string, reason?: string) => {
    const req = requests.find(r => r.id === id);
    if (!req) return;
    if (req.created_by === userId) {
      toast({ title: "خطأ", description: "لا يمكنك رفض طلبك", variant: "destructive" });
      return;
    }
    const history = appendHistory(req, { kind: "rejection", action: "رفض رئيس الشعبة", reason });
    localDb.hrRequests.update(id, {
      approval_status: "rejected",
      unit_head_status: "rejected",
      unit_head_by: userId,
      unit_head_at: new Date().toISOString(),
      history,
    });
    if (req?.created_by) localDb.notifications.insert({ user_id: req.created_by, message: `رفض رئيس الشعبة طلبك (${req.type})${reason ? " — " + reason : ""}`, type: "warning", link: "/hr" });
    await logAction(userName, "رفض رئيس شعبة", `طلب ${id}`);
    toast({ title: "تم", description: "تم رفض الطلب" });
    refetch();
  };

  const handleDeptApprove = async (id: string) => {
    const req = requests.find(r => r.id === id);
    if (!req) return;
    if (req.created_by === userId) {
      toast({ title: "خطأ", description: "لا يمكنك الموافقة على طلبك", variant: "destructive" });
      return;
    }
    const history = appendHistory(req, { kind: "approval", action: "موافقة نهائية من مدير القسم" });
    localDb.hrRequests.update(id, {
      approval_status: "approved",
      dept_manager_status: "approved",
      dept_manager_by: userId,
      dept_manager_at: new Date().toISOString(),
      history,
    });
    if (req?.created_by) localDb.notifications.insert({ user_id: req.created_by, message: `تمت الموافقة النهائية على طلبك (${req.type})`, type: "info", link: "/hr" });
    await logAction(userName, "موافقة نهائية", `طلب ${id}`);
    toast({ title: "تم", description: "تمت الموافقة النهائية" });
    refetch();
  };

  const handleDeptReject = async (id: string, reason?: string) => {
    const req = requests.find(r => r.id === id);
    if (!req) return;
    if (req.created_by === userId) {
      toast({ title: "خطأ", description: "لا يمكنك رفض طلبك", variant: "destructive" });
      return;
    }
    const history = appendHistory(req, { kind: "rejection", action: "رفض مدير القسم", reason });
    localDb.hrRequests.update(id, {
      approval_status: "rejected",
      dept_manager_status: "rejected",
      dept_manager_by: userId,
      dept_manager_at: new Date().toISOString(),
      history,
    });
    if (req?.created_by) localDb.notifications.insert({ user_id: req.created_by, message: `رفض مدير القسم طلبك (${req.type})${reason ? " — " + reason : ""}`, type: "warning", link: "/hr" });
    await logAction(userName, "رفض مدير القسم", `طلب ${id}`);
    toast({ title: "تم", description: "تم رفض الطلب" });
    refetch();
  };

  const handleManagerOverride = async (id: string) => {
    const req = requests.find(r => r.id === id);
    if (!req) return;
    if (req.employee_name === userName) {
      toast({ title: "خطأ", description: "لا يمكنك الموافقة على طلبك الخاص", variant: "destructive" });
      return;
    }
    const history = appendHistory(req, { kind: "override", action: "موافقة مباشرة من مدير القسم" });
    localDb.hrRequests.update(id, {
      approval_status: "approved",
      unit_head_status: "approved",
      unit_head_by: userId,
      unit_head_at: new Date().toISOString(),
      dept_manager_status: "approved",
      dept_manager_by: userId,
      dept_manager_at: new Date().toISOString(),
      history,
    });
    if (req?.created_by) localDb.notifications.insert({ user_id: req.created_by, message: `تمت الموافقة على طلبك مباشرة من مدير القسم (${req.type})`, type: "info", link: "/hr" });
    const emp = allEmployees.find(e => e.name === req.employee_name);
    const sectionHeads = allEmployees.filter(e => (e.roles?.includes("unit_head") || e.roles?.includes("curriculum_unit_head") || e.roles?.includes("prep_unit_head")) && e.section === emp?.section && e.id !== userId);
    sectionHeads.forEach(head => {
      localDb.notifications.insert({ user_id: head.id, message: `تمت الموافقة المباشرة من مدير القسم على طلب ${req.employee_name} (${req.type})`, type: "info", link: "/hr" });
    });
    await logAction(userName, "موافقة مباشرة (مدير)", `طلب ${id}`);
    toast({ title: "تم", description: "تمت الموافقة النهائية (صلاحية المدير)" });
    refetch();
  };

  const performUndo = async () => {
    if (!undoTarget) return;
    const reason = undoReason.trim();
    if (!reason) { toast({ title: "خطأ", description: "سبب التراجع مطلوب", variant: "destructive" }); return; }
    const req = requests.find(r => r.id === undoTarget.id);
    if (!req) return;
    const history = appendHistory(req, {
      kind: "undo",
      action: undoTarget.level === "unit" ? "تراجع رئيس الشعبة" : "تراجع مدير القسم",
      reason,
    });
    const reset: Record<string, unknown> = {
      approval_status: "pending",
      unit_head_status: "pending",
      unit_head_by: null,
      unit_head_at: null,
      history,
    };
    if (undoTarget.level === "dept") {
      reset.approval_status = "unit_approved";
      reset.dept_manager_status = "pending";
      reset.dept_manager_by = null;
      reset.dept_manager_at = null;
    }
    localDb.hrRequests.update(undoTarget.id, reset);
    if (req?.created_by) localDb.notifications.insert({ user_id: req.created_by, message: `تم التراجع عن قرار سابق على طلبك (${req.type}) — السبب: ${reason}`, type: "warning", link: "/hr" });
    await logAction(userName, "تراجع عن قرار", `طلب ${undoTarget.id} — ${reason}`);
    toast({ title: "تم", description: "تم تسجيل التراجع وسببه" });
    setUndoTarget(null);
    setUndoReason("");
    refetch();
  };

  const handleCancel = async (id: string) => {
    const req = requests.find(r => r.id === id);
    if (!req) return;
    if (!["pending", "unit_approved"].includes(req.approval_status)) {
      toast({ title: "خطأ", description: "لا يمكن إلغاء طلب تمت الموافقة النهائية عليه", variant: "destructive" });
      return;
    }
    const history = appendHistory(req, { kind: "cancel", action: "إلغاء الطلب من قبل المنتسب" });
    localDb.hrRequests.update(id, { approval_status: "cancelled", history });
    await logAction(userName, "إلغاء طلب", `طلب ${id}`);
    toast({ title: "تم", description: "تم إلغاء الطلب" });
    refetch();
  };

  const handleSubmitLeave = async () => {
    if (!leaveForm.employee_name || !leaveForm.date) {
      toast({ title: "خطأ", description: "اسم الموظف والتاريخ مطلوبان", variant: "destructive" });
      return;
    }
    setLeaveSaving(true);

    if (isIndividual && leaveForm.type === "غياب") {
      toast({ title: "خطأ", description: "لا يمكنك تسجيل غياب لنفسك", variant: "destructive" });
      setLeaveSaving(false); return;
    }

    if (new Date(leaveForm.date) < new Date(today)) {
      toast({ title: "خطأ", description: "لا يمكن تقديم إجازة بأثر رجعي", variant: "destructive" });
      setLeaveSaving(false); return;
    }

    if (leaveForm.type === "خروجية") {
      const thisMonth = leaveForm.date.slice(0, 7);
      const monthTimeOffs = requests.filter(r => r.employee_name === leaveForm.employee_name && r.type === "خروجية" && r.date.startsWith(thisMonth) && ["pending", "unit_approved", "approved"].includes(r.approval_status));
      const totalHours = monthTimeOffs.reduce((sum, r) => sum + (parseInt(r.hours || "1") || 1), 0);
      if (totalHours + parseInt(leaveForm.hours) > 7) {
        toast({ title: "تجاوز الحد المسموح", description: `لقد استنفذ الموظف رصيد الإجازات الزمنية لهذا الشهر (تم استخدام ${totalHours} من أصل 7 ساعات).`, variant: "destructive" });
        setLeaveSaving(false); return;
      }
    }

    const currentEmp = allEmployees.find(e => e.name === leaveForm.employee_name);
    const empSection = currentEmp?.section;

    if (leaveForm.type === "إجازة اعتيادية") {
      const existing = requests.filter(r =>
        r.employee_name === leaveForm.employee_name &&
        r.type === "إجازة اعتيادية" &&
        r.date === leaveForm.date &&
        ["pending", "unit_approved", "approved"].includes(r.approval_status)
      );
      if (existing.length > 0) {
        toast({ title: "خطأ", description: "يوجد طلب إجازة اعتيادية لنفس الموظف في نفس التاريخ (معلّق أو مقبول)", variant: "destructive" });
        setLeaveSaving(false);
        return;
      }
      
      // Section Conflict Validation
      if (empSection) {
        const sectionMates = allEmployees.filter(e => e.section === empSection && e.name !== leaveForm.employee_name).map(e => e.name);
        const sectionOnLeave = requests.find(r => 
          sectionMates.includes(r.employee_name) &&
          r.type === "إجازة اعتيادية" &&
          r.date === leaveForm.date &&
          ["pending", "unit_approved", "approved"].includes(r.approval_status)
        );
        
        if (sectionOnLeave && !isUnitHead && !isManager && !isAdmin) {
          toast({ title: "يوجد تعارض", description: `الموظف ${sectionOnLeave.employee_name} من نفس الشعبة مجاز اعتيادي في هذا اليوم. لا يمكن تقديم الطلب إلا من قبل مسؤول الشعبة كاستثناء.`, variant: "destructive" });
          setLeaveSaving(false);
          return;
        } else if (sectionOnLeave) {
          toast({ title: "ملاحظة تعارض", description: `تم تجاوز التعارض لوجود صلاحية. (${sectionOnLeave.employee_name} مجاز)` });
        }
      }
    }

    const isSubmitterManager = (isDeptManager || isAdmin) && has("manager_override_hr");
    const isOwnRequest = leaveForm.employee_name === userName;
    const dates: string[] = [];
    if (leaveForm.end_date && leaveForm.end_date !== leaveForm.date) {
      const start = new Date(leaveForm.date);
      const end = new Date(leaveForm.end_date);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(d.toISOString().split("T")[0]);
      }
    } else {
      dates.push(leaveForm.date);
    }
    for (const dateStr of dates) {
      const insertPayload: Record<string, unknown> = {
        employee_name: leaveForm.employee_name,
        type: leaveForm.type,
        date: dateStr,
        notes: leaveForm.notes,
        department: leaveForm.department,
        hours: leaveForm.type === "خروجية" ? leaveForm.hours : null,
        created_by: userId,
      };
      if (isSubmitterManager && !isOwnRequest) {
        insertPayload.unit_head_status = "approved";
        insertPayload.unit_head_by = userId;
        insertPayload.unit_head_at = new Date().toISOString();
        insertPayload.approval_status = "unit_approved";
      }
      localDb.hrRequests.insert(insertPayload);
      if (!isSubmitterManager) {
        const emp = employees.find(e => e.name === leaveForm.employee_name);
        const empSec = emp?.section || "";
        const s2u = (s: string) => s.includes("ناهج") ? "المناهج" : s.includes("داد") || s.includes("تدريب") ? "الإعداد" : s;
        const unitHead = localDb.profiles.getAll().find((p: any) => p.roles?.some((r: string) => r.includes("unit_head")) && s2u(p.section || "") === s2u(empSec));
        if (unitHead) {
          localDb.notifications.insert({ user_id: unitHead.id, message: `طلب جديد: ${leaveForm.employee_name} (${leaveForm.type})`, type: "info", link: "/hr" });
        }
      }
    }
    await logAction(userName, "رفع طلب إجازة", `${leaveForm.employee_name} (${dates.length > 1 ? `${dates.length} أيام` : leaveForm.date})`);
    toast({ title: "تم", description: `تم رفع طلب الإجازة بنجاح${dates.length > 1 ? ` (${dates.length} أيام)` : ""}` });
    setShowLeaveForm(false);
    setLeaveForm({ employee_name: "", type: "إجازة اعتيادية", date: "", end_date: "", notes: "", department: "", hours: "1" });
    refetch();
    setLeaveSaving(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const ROUTINE_TYPES = ["إجازة اعتيادية", "خروجية"];
  const unitApprovalCountThisMonth = (employee_name: string) => {
    const now = new Date();
    return requests.filter(r =>
      r.employee_name === employee_name &&
      ROUTINE_TYPES.includes(r.type) &&
      r.unit_head_status === "approved" &&
      r.unit_head_by === userId &&
      (new Date(r.unit_head_at || r.date)).getMonth() === now.getMonth() &&
      (new Date(r.unit_head_at || r.date)).getFullYear() === now.getFullYear()
    ).length;
  };

  const handleRequestOpinion = async (id: string) => {
    const req = requests.find(r => r.id === id);
    if (!req) return;
    const history = appendHistory(req, { kind: "opinion_request", action: "طلب بيان رأي" });
    localDb.hrRequests.update(id, { opinion_requested: true, opinion_requested_by: userId, opinion_requested_at: new Date().toISOString(), history });
    if (req?.created_by) localDb.notifications.insert({ user_id: req.created_by, message: `طُلب بيان رأي على طلبك (${req.type})`, type: "info", link: "/hr" });
    const emp = employees.find(e => e.name === req.employee_name);
    const empSec = emp?.section || "";
    const s2u = (s: string) => s.includes("ناهج") ? "المناهج" : s.includes("داد") || s.includes("تدريب") ? "الإعداد" : s;
    const unitHead = localDb.profiles.getAll().find((p: any) => p.roles?.some((r: string) => r.includes("unit_head")) && s2u(p.section || "") === s2u(empSec));
    if (unitHead) {
      localDb.notifications.insert({ user_id: unitHead.id, message: `مطلوب بيان رأيك بخصوص طلب إجازة: ${req.employee_name}`, type: "warning", link: "/hr" });
    }
    await logAction(userName, "طلب بيان رأي", `طلب ${id}`);
    toast({ title: "تم", description: "تم إرسال طلب بيان الرأي إلى مسؤول الشعبة" });
    refetch();
  };
  const handleSubmitOpinion = async (id: string) => {
    const txt = (opinionDraft[id] || "").trim();
    if (!txt) { toast({ title: "خطأ", description: "اكتب بيان الرأي أولاً", variant: "destructive" }); return; }
    const req = requests.find(r => r.id === id);
    if (!req) return;
    const history = appendHistory(req, { kind: "opinion", action: "بيان رأي رئيس الشعبة", text: txt });
    localDb.hrRequests.update(id, { unit_opinion: txt, unit_opinion_by: userId, unit_opinion_at: new Date().toISOString(), history });
    await logAction(userName, "تقديم بيان رأي", `طلب ${id}`);
    setOpinionDraft(s => ({ ...s, [id]: "" }));
    toast({ title: "تم", description: "تم تسجيل بيان الرأي" });
    refetch();
  };

  const handleAddComment = async (req: HRRequest, hidden: boolean) => {
    const txt = commentDraft.trim();
    if (!txt) { toast({ title: "خطأ", description: "اكتب التعليق أولاً", variant: "destructive" }); return; }
    const history = appendHistory(req, { kind: "comment", action: "تعليق", text: txt, hidden_from_employee: hidden });
    localDb.hrRequests.update(req.id, { history });
    if (!hidden && req.created_by) localDb.notifications.insert({ user_id: req.created_by, message: `تعليق جديد على طلبك (${req.type})`, type: "info", link: "/hr" });
    await logAction(userName, "إضافة تعليق", `طلب ${req.id}`);
    setCommentDraft("");
    setSelectedRequest({ ...req, history });
    toast({ title: "تم", description: hidden ? "تم حفظ التعليق (مخفي عن المنتسب)" : "تم حفظ التعليق" });
    refetch();
  };

  const renderApprovalFlow = (req: HRRequest) => {
    const steps = [
      { done: true, rejected: false, label: "تقديم" },
      { done: req.unit_head_status === "approved", rejected: req.unit_head_status === "rejected", label: "الشعبة" },
      { done: req.dept_manager_status === "approved", rejected: req.dept_manager_status === "rejected", label: "القسم" },
    ];
    return (
      <div className="flex items-center gap-0.5">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-0.5">
            <div
              className={`w-2.5 h-2.5 rounded-full transition-colors ${step.done ? "bg-success" : step.rejected ? "bg-destructive" : "bg-muted-foreground/30"}`}
              title={step.label}
            />
            {i < steps.length - 1 && <div className={`w-3 h-0.5 ${step.done ? "bg-success/40" : "bg-muted-foreground/15"}`} />}
          </div>
        ))}
      </div>
    );
  };

  const renderActions = (req: HRRequest) => {
    const btns: React.ReactNode[] = [];

    if (isIndividual && req.created_by === userId && (req.approval_status === "pending" || req.approval_status === "unit_approved") && has("cancel_own_request")) {
      btns.push(
        <button key="cancel" onClick={() => handleCancel(req.id)} className="p-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors" title="إلغاء الطلب"><X className="w-3.5 h-3.5" /></button>
      );
    }

    const isRequester = req.created_by === userId;
    const isRoutine = ROUTINE_TYPES.includes(req.type);
    const overUnitCap = isRoutine && unitApprovalCountThisMonth(req.employee_name) >= 3;
    if (isUnitHead && !isManager && !isAdmin && !isRequester && has("approve_hr_unit")) {
      const managerVetoed = req.dept_manager_status === "rejected";
      if (!managerVetoed && req.approval_status === "pending" && !overUnitCap) {
        btns.push(
          <button key="ua" onClick={() => handleUnitApprove(req.id)} className="p-1.5 rounded-md bg-success/10 text-success hover:bg-success/20 transition-colors" title="موافقة رئيس الشعبة"><Check className="w-3.5 h-3.5" /></button>,
          <button key="ur" onClick={() => handleUnitReject(req.id)} className="p-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors" title="رفض"><X className="w-3.5 h-3.5" /></button>
        );
      }
      if (overUnitCap && req.approval_status === "pending") {
        btns.push(<span key="cap" className="text-[10px] text-warning bg-warning/10 rounded px-1.5 py-0.5">بلغ السقف (3) — يتطلب موافقة المدير</span>);
      }
      if (!managerVetoed && req.unit_head_status === "approved" && req.dept_manager_status === "pending") {
        btns.push(
          <button key="uu" onClick={() => { setUndoTarget({ id: req.id, level: "unit" }); setUndoReason(""); }} className="p-1.5 rounded-md bg-warning/10 text-warning hover:bg-warning/20 transition-colors" title="تراجع"><Undo2 className="w-3.5 h-3.5" /></button>
        );
      }
      if (req.opinion_requested && !req.unit_opinion) {
        btns.push(
          <div key="op" className="flex items-center gap-1">
            <input
              type="text"
              placeholder="بيان رأيك..."
              value={opinionDraft[req.id] || ""}
              onChange={(e) => setOpinionDraft(s => ({ ...s, [req.id]: e.target.value }))}
              className="text-xs border border-warning/40 rounded px-2 py-1 w-32 bg-background"
            />
            <button onClick={() => handleSubmitOpinion(req.id)} className="p-1.5 rounded-md bg-warning/10 text-warning hover:bg-warning/20 transition-colors" title="إرسال بيان الرأي"><Send className="w-3.5 h-3.5" /></button>
          </div>
        );
      }
    }

    if ((isDeptManager || isAdmin) && !isRequester && has("approve_hr_dept")) {
      if (req.approval_status === "pending") {
        btns.push(
          <button key="mo" onClick={() => handleManagerOverride(req.id)} className="p-1.5 rounded-md bg-success/10 text-success hover:bg-success/20 transition-colors" title="موافقة مباشرة"><Check className="w-3.5 h-3.5" strokeWidth={3} /></button>,
          <button key="mr" onClick={() => handleDeptReject(req.id)} className="p-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors" title="رفض"><X className="w-3.5 h-3.5" /></button>
        );
      }
      if (req.approval_status === "unit_approved") {
        btns.push(
          <button key="da" onClick={() => handleDeptApprove(req.id)} className="p-1.5 rounded-md bg-success/10 text-success hover:bg-success/20 transition-colors" title="موافقة نهائية"><Check className="w-3.5 h-3.5" /></button>,
          <button key="dr" onClick={() => handleDeptReject(req.id)} className="p-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors" title="رفض"><X className="w-3.5 h-3.5" /></button>
        );
      }
      if (req.approval_status === "rejected" && req.unit_head_status === "rejected" && req.dept_manager_status === "pending") {
        btns.push(
          <button key="override" onClick={() => handleManagerOverride(req.id)} className="p-1.5 rounded-md bg-success/10 text-success hover:bg-success/20 transition-colors" title="تجاوز رفض رئيس الشعبة"><Check className="w-3.5 h-3.5" strokeWidth={3} /></button>
        );
      }
      if (!req.opinion_requested && (req.approval_status === "pending" || req.approval_status === "unit_approved")) {
        btns.push(
          <button key="op" onClick={() => handleRequestOpinion(req.id)} className="p-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors" title="طلب بيان رأي من مسؤول الشعبة"><MessageSquare className="w-3.5 h-3.5" /></button>
        );
      }
      if (req.approval_status === "approved" || (req.approval_status === "rejected" && req.dept_manager_status === "rejected")) {
        if (has("undo_hr_decision")) {
          btns.push(
            <button key="du" onClick={() => { setUndoTarget({ id: req.id, level: "dept" }); setUndoReason(""); }} className="p-1.5 rounded-md bg-warning/10 text-warning hover:bg-warning/20 transition-colors" title="تراجع"><Undo2 className="w-3.5 h-3.5" /></button>
          );
        }
      }
    }

    btns.push(
      <button key="det" onClick={() => setSelectedRequest(req)} className="p-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors" title="متابعة حالة الطلب"><Eye className="w-3.5 h-3.5" /></button>
    );

    return <div className="flex gap-1 flex-wrap">{btns}</div>;
  };

  const statCards = [
    { label: "حاضرون اليوم", value: stats.presentCount, icon: UserCheck, gradient: "from-emerald-500/8 to-green-500/5", iconBg: "bg-emerald-500/15", iconColor: "text-emerald-600 dark:text-emerald-400", delay: "delay-75" },
    { label: "مجازون اليوم", value: stats.leaveCount, icon: Clock, gradient: "from-amber-500/8 to-orange-500/5", iconBg: "bg-amber-500/15", iconColor: "text-amber-600 dark:text-amber-400", delay: "delay-100" },
    { label: "على واجب", value: stats.dutyCount, icon: Briefcase, gradient: "from-blue-500/8 to-sky-500/5", iconBg: "bg-blue-500/15", iconColor: "text-blue-600 dark:text-blue-400", delay: "delay-150" },
    { label: "طلبات معلقة", value: stats.pendingCount, icon: AlertCircle, gradient: "from-red-500/8 to-rose-500/5", iconBg: "bg-red-500/15", iconColor: "text-red-600 dark:text-red-400", delay: "delay-200", pulse: true },
  ];

  const statusDayColor: Record<string, string> = {
    present: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 ring-emerald-500/30",
    leave: "bg-amber-500/20 text-amber-700 dark:text-amber-300 ring-amber-500/30",
    duty: "bg-blue-500/20 text-blue-700 dark:text-blue-300 ring-blue-500/30",
    absent: "bg-red-500/20 text-red-700 dark:text-red-300 ring-red-500/30",
  };
  const statusDayLabel: Record<string, string> = { present: "حاضر", leave: "إجازة", duty: "واجب", absent: "غائب" };



  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <PageHeader title="الموارد البشرية" subtitle="سجل الطلبات والموقف اليومي" icon={Users} sections={[
        { id: "daily_situation", label: "الموقف اليومي" },
        { id: "requests_table", label: "سجل الطلبات" },
      ]} exportData={() => ({
        filename: "hr-requests",
        rows: filtered.map(r => ({ الاسم: r.employee_name, القسم: r.department, النوع: r.type, التاريخ: r.date, الحالة: statusLabels[r.approval_status] || r.approval_status, ملاحظات: r.notes || "" }))
      })} />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3">
        {statCards.map((card) => (
          <Card key={card.label} className={`animate-slide-up ${card.delay} bg-gradient-to-bl ${card.gradient} border-border/50 overflow-hidden`}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0 ${card.pulse ? "animate-pulse-red" : ""}`}>
                <card.icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-3xl font-bold text-foreground animate-count-up">{card.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>



      <div className="bg-card rounded-xl border border-border overflow-hidden no-print">
        <div className="px-4 py-3 border-b border-border bg-muted/20">
          <h3 className="font-semibold text-sm flex items-center gap-2"><CalendarPlus className="w-4 h-4 text-primary" />تقويم الإجازات (14 يوماً القادمة)</h3>
          <p className="text-[10px] text-muted-foreground mt-1">يظهر المجازون من نفس القسم لتجنب التعارض (الموافقة الاستثنائية للتعارض تتطلب صلاحية مسؤول شعبة)</p>
        </div>
        <div className="p-3 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 min-w-max pb-2">
            {next14Days.map((date) => {
              const dateObj = new Date(date);
              const dayName = new Intl.DateTimeFormat("ar-SA", { weekday: "short" }).format(dateObj);
              const dayNum = dateObj.getDate();
              
              const onLeave = calendarRequests.filter(r => r.date === date);
              
              const onLeaveSection = onLeave.filter(r => {
                const emp = employees.find(e => e.name === r.employee_name);
                return !isIndividual || emp?.section === currentEmpSection;
              });

              return (
                <div key={date} className={`w-24 shrink-0 rounded-lg border p-2 flex flex-col items-center ${date === today ? "border-primary bg-primary/5" : "border-border bg-muted/10"} ${onLeaveSection.length > 0 ? "border-amber-200 bg-amber-500/5" : ""}`}>
                  <p className="text-[10px] text-muted-foreground font-medium">{dayName}</p>
                  <p className={`text-lg font-bold ${date === today ? "text-primary" : "text-foreground"}`}>{dayNum}</p>
                  <div className="mt-2 w-full space-y-1">
                    {onLeaveSection.length > 0 ? onLeaveSection.map((r, i) => (
                      <div key={i} className="text-[9px] bg-amber-500/10 text-amber-700 dark:text-amber-300 rounded px-1 py-0.5 text-center truncate" title={r.employee_name}>
                        {r.employee_name.split(" ")[0]}
                      </div>
                    )) : (
                      <div className="text-[9px] text-center text-muted-foreground/50 py-1">—</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div data-print-section="daily_situation" className="bg-card rounded-xl border border-border overflow-hidden no-print-toggle">
        <button
          type="button"
          onClick={() => setTopCollapsed(c => !c)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold bg-muted/40 hover:bg-muted transition-colors no-print"
        >
          <span className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" />الموقف اليومي</span>
          {topCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
        <div className={topCollapsed ? "hidden" : "p-2 animate-fade-in space-y-4"}>
          <DailySituation />

          <div className="border-t border-border pt-3">
            <p className="text-xs font-semibold text-muted-foreground mb-2">حضور الموظفين اليوم</p>
            <div className="flex flex-wrap gap-2">
              {employeeStatuses.map(emp => (
                <div
                  key={emp.id}
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 ring-1 text-[11px] font-medium ${statusDayColor[emp.dayStatus]}`}
                  title={`${emp.name} — ${statusDayLabel[emp.dayStatus]}`}
                >
                  <div className={`w-2 h-2 rounded-full ${emp.dayStatus === "present" ? "bg-emerald-500" : emp.dayStatus === "leave" ? "bg-amber-500" : emp.dayStatus === "duty" ? "bg-blue-500" : "bg-red-500"}`} />
                  {emp.name}
                </div>
              ))}
            </div>
          </div>

          {has("change_attendance") && (
            <div className="border-t border-border pt-3">
              <WeeklyShiftScheduler />
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border no-print" />

      <div className="flex items-center justify-between flex-wrap gap-3 no-print">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث بالاسم أو النوع..." className="ps-9" />
        </div>
        <Button size="sm" className="gap-2 animate-scale-in" onClick={() => {
          setLeaveForm({ employee_name: isIndividual ? userName : "", type: "إجازة اعتيادية", date: new Date().toISOString().split("T")[0], end_date: "", notes: "", department: "", hours: "1" });
          setShowLeaveForm(true);
        }}>
          <CalendarPlus className="w-4 h-4" />رفع طلب إجازة
        </Button>
      </div>

      <Tabs value={filterStatus} onValueChange={setFilterStatus} dir="rtl" className="no-print">
        <TabsList className="flex-wrap h-auto gap-1 bg-muted/50 p-1">
          {["all", "pending", "unit_approved", "approved", "rejected", "cancelled"].map((s) => (
            <TabsTrigger key={s} value={s} className="text-xs px-3 py-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md">
              {s === "all" ? "الكل" : statusLabels[s]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div key={filterStatus} data-print-section="requests_table" className="tab-content-enter space-y-3">
        {filtered.length > 0 ? filtered.map((req, idx) => {
          const cfg = getTypeConfig(req.type);
          const TypeIcon = cfg.icon;
          return (
            <Card
              key={req.id}
              className={`card-hover animate-slide-up ${idx < 8 ? `delay-${Math.min(idx * 75, 300)}` : ""} border-s-4 ${cfg.border} bg-card overflow-hidden`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {getInitials(req.employee_name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground text-sm">{req.employee_name}</span>
                      <Badge variant="secondary" className={`${cfg.bg} ${cfg.iconColor} border-0 text-[10px] gap-1`}>
                        <TypeIcon className="w-3 h-3" />{req.type}
                      </Badge>
                      <StatusBadge status={statusLabels[req.approval_status] || req.approval_status} />
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{req.department}</span>
                      <span className="flex items-center gap-1"><CalendarPlus className="w-3 h-3" />{req.date}</span>
                    </div>

                    {req.notes && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{req.notes}</p>
                    )}

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {renderApprovalFlow(req)}
                        <span className="text-[10px] text-muted-foreground">
                          {req.unit_head_status === "approved" ? "✓ شعبة" : req.unit_head_status === "rejected" ? "✕ شعبة" : ""}
                          {req.dept_manager_status === "approved" ? " ✓ قسم" : req.dept_manager_status === "rejected" ? " ✕ قسم" : ""}
                        </span>
                      </div>
                      <div className="no-print">{renderActions(req)}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        }) : (
          <div className="text-center py-12 text-muted-foreground animate-fade-in">
            <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">لا توجد طلبات</p>
          </div>
        )}
      </div>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto" dir="rtl">
          <DialogHeader><DialogTitle>متابعة حالة الطلب</DialogTitle></DialogHeader>
          {selectedRequest && (() => {
            const req = requests.find(r => r.id === selectedRequest.id) || selectedRequest;
            const isOwner = req.created_by === userId && !isManager && !isAdmin && !isUnitHead;
            const canManage = isManager || isAdmin || (isUnitHead && req.created_by !== userId);
            const history: HistoryEntry[] = Array.isArray(req.history) ? req.history : [];
            const visibleHistory = canManage ? history : history.filter(h => !h.hidden_from_employee);
            const cfg = getTypeConfig(req.type);
            const TypeIcon = cfg.icon;
            return (
              <div className="space-y-4 animate-scale-in">
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">{getInitials(req.employee_name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-foreground">{req.employee_name}</p>
                    <p className="text-xs text-muted-foreground">{req.department}</p>
                  </div>
                  <Badge variant="secondary" className={`${cfg.bg} ${cfg.iconColor} border-0 gap-1`}>
                    <TypeIcon className="w-3 h-3" />{req.type}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-muted/30 rounded-lg p-2.5"><p className="text-[10px] text-muted-foreground mb-0.5">التاريخ</p><p className="font-medium text-foreground">{req.date}</p></div>
                  <div className="bg-muted/30 rounded-lg p-2.5"><p className="text-[10px] text-muted-foreground mb-0.5">الحالة</p><StatusBadge status={statusLabels[req.approval_status] || req.approval_status} /></div>
                  {req.notes && <div className="col-span-2 bg-muted/30 rounded-lg p-2.5"><p className="text-[10px] text-muted-foreground mb-0.5">ملاحظات المنتسب</p><p className="text-foreground">{req.notes}</p></div>}
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-sm font-semibold text-foreground mb-3">مسار الموافقة</p>
                  <div className="space-y-3">
                    {[
                      { label: "تقديم الطلب", done: true },
                      { label: "مراجعة رئيس الشعبة", done: req.unit_head_status === "approved", rejected: req.unit_head_status === "rejected", date: req.unit_head_at },
                      { label: "موافقة رئيس القسم", done: req.dept_manager_status === "approved", rejected: req.dept_manager_status === "rejected", date: req.dept_manager_at },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step.done ? "bg-success text-success-foreground" : step.rejected ? "bg-destructive text-destructive-foreground" : "bg-muted text-muted-foreground"}`}>
                          {step.done ? "✓" : step.rejected ? "✕" : i + 1}
                        </div>
                        <div className="flex-1">
                          <span className={`text-sm ${step.done ? "text-foreground font-medium" : "text-muted-foreground"}`}>{step.label}</span>
                          {step.date && <p className="text-[10px] text-muted-foreground">{new Date(step.date).toLocaleString("ar-SA")}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-sm font-semibold text-foreground mb-3">سجل الأحداث</p>
                  {visibleHistory.length === 0 ? (
                    <p className="text-xs text-muted-foreground">لا توجد إجراءات مسجلة بعد.</p>
                  ) : (
                    <ul className="space-y-2">
                      {visibleHistory.slice().reverse().map(h => (
                        <li key={h.id} className={`rounded-lg border p-2.5 text-xs animate-fade-in ${h.hidden_from_employee ? "border-warning/40 bg-warning/5" : "border-border bg-muted/30"}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-foreground">{h.action}</p>
                              <p className="text-[10px] text-muted-foreground">{h.by_name} · {new Date(h.at).toLocaleString("ar-SA")}</p>
                              {h.reason && <p className="mt-1 text-foreground"><span className="text-muted-foreground">السبب: </span>{h.reason}</p>}
                              {h.text && <p className="mt-1 text-foreground whitespace-pre-wrap">{h.text}</p>}
                              {h.hidden_from_employee && <p className="mt-1 text-[10px] text-warning flex items-center gap-1"><EyeOff className="w-3 h-3" />مخفي عن المنتسب</p>}
                            </div>
                            {canManage && (
                              <button
                                onClick={() => toggleHistoryHidden(req, h.id)}
                                className="p-1 rounded-md hover:bg-background transition-colors"
                                title={h.hidden_from_employee ? "إظهار للمنتسب" : "إخفاء عن المنتسب"}
                              >
                                {h.hidden_from_employee ? <Eye className="w-3.5 h-3.5 text-primary" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {canManage && (
                  <div className="border-t border-border pt-4 space-y-2">
                    <Label className="text-sm font-semibold">إضافة تعليق / بيان رأي</Label>
                    <Textarea value={commentDraft} onChange={(e) => setCommentDraft(e.target.value)} placeholder="اكتب تعليقاً يُسجَّل في تاريخ الطلب..." rows={2} />
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => handleAddComment(req, true)} className="gap-1"><EyeOff className="w-3.5 h-3.5" />حفظ (مخفي)</Button>
                      <Button size="sm" onClick={() => handleAddComment(req, false)} className="gap-1"><Send className="w-3.5 h-3.5" />حفظ ومشاركة</Button>
                    </div>
                  </div>
                )}

                {isOwner && (
                  <p className="text-[11px] text-muted-foreground border-t border-border pt-2">
                    قد لا يظهر هنا بعض الإجراءات الداخلية بين رؤساء الشعب ومدير القسم.
                  </p>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      <Dialog open={!!undoTarget} onOpenChange={(o) => { if (!o) { setUndoTarget(null); setUndoReason(""); } }}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Undo2 className="w-5 h-5 text-warning" />التراجع عن القرار</DialogTitle>
            <DialogDescription>سيُسجَّل سبب التراجع ضمن تاريخ الطلب ويُعاد الطلب إلى الحالة المعلّقة.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>سبب التراجع <span className="text-destructive">*</span></Label>
            <Textarea value={undoReason} onChange={(e) => setUndoReason(e.target.value)} placeholder="اذكر السبب الموجب للتراجع" rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setUndoTarget(null); setUndoReason(""); }}>إلغاء</Button>
            <Button onClick={performUndo}>تسجيل التراجع</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showLeaveForm} onOpenChange={setShowLeaveForm}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><CalendarPlus className="w-5 h-5 text-primary" />رفع طلب إجازة</DialogTitle>
            <DialogDescription>سيتم إرسال الطلب لمسؤول الشعبة ورئيس القسم للموافقة</DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            <div className="space-y-3 p-3 rounded-xl bg-muted/30 border border-border">
              <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />بيانات الموظف</p>
              <div>
                <Label>اسم الموظف</Label>
                {isIndividual ? (
                  <Input value={leaveForm.employee_name} disabled />
                ) : (
                  <Select value={leaveForm.employee_name} onValueChange={(v) => {
                    const emp = employees.find(e => e.name === v);
                    setLeaveForm({ ...leaveForm, employee_name: v, department: emp?.department || "" });
                  }}>
                    <SelectTrigger><SelectValue placeholder="اختر الموظف" /></SelectTrigger>
                    <SelectContent>
                      {employees
                        .filter(e => {
                          if (isUnitHead && !isManager && !isAdmin) return e.section === currentEmpSection;
                          return true;
                        })
                        .map(emp => (
                          <SelectItem key={emp.id} value={emp.name}>{emp.name}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="space-y-3 p-3 rounded-xl bg-muted/30 border border-border">
              <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5"><CalendarPlus className="w-3.5 h-3.5" />تفاصيل الطلب</p>
              <div>
                <Label>نوع الطلب</Label>
                <Select value={leaveForm.type} onValueChange={(v) => setLeaveForm({ ...leaveForm, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="إجازة اعتيادية">إجازة اعتيادية</SelectItem>
                    <SelectItem value="إجازة مرضية">إجازة مرضية</SelectItem>
                    <SelectItem value="إجازة طارئة">إجازة طارئة</SelectItem>
                    <SelectItem value="خروجية">خروجية</SelectItem>
                    <SelectItem value="واجب">واجب</SelectItem>
                    {!isIndividual && <SelectItem value="غياب">غياب</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>تاريخ البداية</Label>
                <Input type="date" value={leaveForm.date} onChange={(e) => setLeaveForm({ ...leaveForm, date: e.target.value })} />
              </div>
              {leaveForm.type !== "خروجية" && (
                <div>
                  <Label>تاريخ النهاية (اختياري)</Label>
                  <Input type="date" value={leaveForm.end_date} min={leaveForm.date} onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })} />
                  {leaveForm.end_date && leaveForm.end_date !== leaveForm.date && (
                    <p className="text-[10px] text-primary mt-1">
                      {Math.ceil((new Date(leaveForm.end_date).getTime() - new Date(leaveForm.date).getTime()) / (1000 * 60 * 60 * 24)) + 1} يوم
                    </p>
                  )}
                </div>
              )}
              {leaveForm.type === "خروجية" && (
                <div>
                  <Label>عدد الساعات</Label>
                  <Select value={leaveForm.hours} onValueChange={(v) => setLeaveForm({ ...leaveForm, hours: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7].map(h => (
                        <SelectItem key={h} value={h.toString()}>{h} ساعة</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label>ملاحظات</Label>
                <Textarea value={leaveForm.notes} onChange={(e) => setLeaveForm({ ...leaveForm, notes: e.target.value })} placeholder="سبب الطلب أو ملاحظات إضافية" />
              </div>
            </div>

            <Button onClick={handleSubmitLeave} disabled={leaveSaving} className="w-full gap-2">
              {leaveSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              رفع الطلب
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HRAttendance;

