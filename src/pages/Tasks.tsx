import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTasks, useTaskHandovers, useEmployees, useTaskComments } from "@/hooks/useSupabaseData";
import { useUserRole } from "@/hooks/useUserRole";
import { fileStore } from "@/lib/fileStore";
import { FileList, FileUploadButton } from "@/components/FileManager";
import { localDb } from "@/lib/localStore";
import { logAction } from "@/lib/auditLog";
import StatusBadge from "@/components/StatusBadge";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import {
  ListTodo, Plus, Loader2, ArrowLeftRight, ArrowUpRight, Eye, Clock, Check, X, MessageSquare, Send,
  LayoutGrid, List as ListIcon, ChevronDown, Trophy, Play, CheckCircle2, Zap, Calendar, Paperclip,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";

const stageLabels: Record<string, string> = {
  writing: "الكتابة",
  new_form: "النموذج الجديد",
  auditing: "التدقيق",
  printing: "الطباعة",
  pdf: "PDF",
  new_ppt: "عرض تقديمي جديد",
  routine: "مهمة اعتيادية",
  done: "منجز",
};

const statusLabels: Record<string, string> = {
  pending: "معلّق",
  in_progress: "قيد التنفيذ",
  completed: "مكتمل",
  review: "بانتظار المراجعة",
  handed_over: "تم التسليم",
  approved: "معتمد",
  proposed: "مقترح بين الشعب",
  rejected: "مرفوض",
};

const curriculumStages = ["writing", "new_form", "auditing", "printing"];
const presentationStages = ["pdf", "new_ppt"];

const unitGradients: Record<string, string> = {
  "الإعداد": "from-blue-500 to-blue-600",
  "المناهج": "from-emerald-500 to-emerald-600",
};

const unitColors: Record<string, string> = {
  "الإعداد": "#3b82f6",
  "المناهج": "#22c55e",
};

const CHART_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

const PIPELINE_STAGES = [
  { key: "writing", label: "الكتابة" },
  { key: "new_form", label: "النموذج الجديد" },
  { key: "auditing", label: "التدقيق" },
  { key: "printing", label: "الطباعة" },
  { key: "_done", label: "منجز" },
];

const FILTER_CHIPS = [
  { key: "all", label: "الكل" },
  { key: "pending", label: "معلق" },
  { key: "proposed", label: "مقترح" },
  { key: "in_progress", label: "قيد التنفيذ" },
  { key: "review", label: "مراجعة" },
  { key: "completed", label: "منجز" },
  { key: "rejected", label: "مرفوض" },
  { key: "الإعداد", label: "الإعداد" },
  { key: "المناهج", label: "المناهج" },
];

const BOARD_COLUMNS = [
  { key: "writing", label: "الكتابة" },
  { key: "new_form", label: "النموذج الجديد" },
  { key: "auditing", label: "التدقيق" },
  { key: "printing", label: "الطباعة" },
  { key: "pdf", label: "PDF" },
  { key: "new_ppt", label: "عرض تقديمي جديد" },
  { key: "routine", label: "اعتيادية" },
  { key: "_done", label: "منجز" },
];

const CircularProgress = ({ value, size = 100, strokeWidth = 8 }: { value: number; size?: number; strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--primary))" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-700" />
      </svg>
      <span className="absolute text-lg font-bold gradient-text">{value}%</span>
    </div>
  );
};

const Tasks = () => {
  const { data: tasks, loading, refetch } = useTasks();
  const { data: employees } = useEmployees();
  const { persona, isManager, isAdmin, isUnitHead, isIndividual, section, userId, userName, canEditTasks, has } = useUserRole();

  const ename = (id: string | null) => id ? (employees.find(e => e.id === id)?.name || id) : "—";
  const [showCreate, setShowCreate] = useState(false);
  const [showHandover, setShowHandover] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", unit: "", stage: "writing", assigned_to: "", estimated_hours: 0, is_routine: false });
  const [handoverForm, setHandoverForm] = useState({ to_user: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [threadText, setThreadText] = useState("");
  const [threadRecipient, setThreadRecipient] = useState("");
  const [isHiddenComment, setIsHiddenComment] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentFileId, setAttachmentFileId] = useState<string | null>(null);
  const [activeChip, setActiveChip] = useState("all");
  const [filterStage, setFilterStage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "board" | "gantt">("list");
  const [statsOpen, setStatsOpen] = useState(false);
  const { data: taskHandovers } = useTaskHandovers(showDetail || undefined);
  const { data: taskComments, refetch: refetchComments } = useTaskComments(showDetail || undefined);

  useEffect(() => {
    const focusId = searchParams.get("focus");
    if (focusId && tasks.some(t => t.id === focusId)) {
      setShowDetail(focusId);
      searchParams.delete("focus");
      setSearchParams(searchParams, { replace: true });
    }
  }, [tasks, searchParams, setSearchParams]);

  useEffect(() => {
    if (showDetail) {
      const task = tasks.find(t => t.id === showDetail);
      if (task && task.assigned_to === userId && !task.viewed_at) {
        localDb.tasks.update(task.id, { viewed_at: new Date().toISOString() });
        refetch();
      }
    }
  }, [showDetail, tasks, userId, refetch]);

  const baseVisibleTasks = tasks.filter(t => {
    if (isManager || isAdmin) return true;
    if (isUnitHead) return t.unit === section || t.assigned_to === userId || has("view_other_units_tasks");
    if (isIndividual) return t.unit === section || t.assigned_to === userId;
    return true;
  });

  const filteredTasks = baseVisibleTasks.filter(t => {
    if (filterStage) {
      if (filterStage === "_done") {
        if (t.status !== "completed" && t.status !== "approved") return false;
      } else if (t.stage !== filterStage) {
        return false;
      }
    }
    if (activeChip !== "all") {
      if (["pending", "in_progress", "review"].includes(activeChip)) {
        if (t.status !== activeChip) return false;
      } else if (activeChip === "completed") {
        if (t.status !== "completed" && t.status !== "approved") return false;
      } else if (activeChip === "الإعداد" || activeChip === "المناهج") {
        if (t.unit !== activeChip) return false;
      }
    }
    return true;
  });

  const taskUnits = [...new Set(baseVisibleTasks.map(t => t.unit).filter(Boolean))];
  const myTasks = filteredTasks.filter(t => t.assigned_to === userId);
  const otherTasks = filteredTasks.filter(t => t.assigned_to !== userId);

  const canEditTask = (task: typeof tasks[0]) => {
    if (isManager || isAdmin) return true;
    if (task.assigned_to === userId && task.status !== "handed_over") return has("edit_task");
    if (task.unit === section && canEditTasks) return true;
    return false;
  };

  const handleCreate = async () => {
    if (!form.title) {
      toast({ title: "خطأ", description: "العنوان مطلوب", variant: "destructive" });
      return;
    }
    setSaving(true);
    const targetUnit = (isManager || isAdmin) ? form.unit : (form.unit || section);
    const isProposalToOtherUnit = !isManager && !isAdmin && isUnitHead && targetUnit && targetUnit !== section;
    const payload: Record<string, unknown> = {
      title: form.title,
      description: form.description + (isProposalToOtherUnit ? `\n\n[مقترح من شعبة ${section}]` : ""),
      unit: targetUnit,
      stage: form.is_routine ? "routine" : form.stage,
      status: isProposalToOtherUnit ? "proposed" : "pending",
      assigned_to: form.assigned_to || null,
      assigned_by: userId,
      created_by: userId,
      estimated_hours: form.estimated_hours,
      is_routine: form.is_routine,
    };
    localDb.tasks.insert(payload);
    await logAction(userName, isProposalToOtherUnit ? "اقتراح مهمة بين الشعب" : "إنشاء مهمة", form.title);
    toast({ title: "تم", description: isProposalToOtherUnit ? "تم رفع مقترح المهمة لرئيس القسم" : "تم إنشاء المهمة" });
    if (isProposalToOtherUnit) {
      const deptManagers = localDb.profiles.getAll().filter((p: any) => p.roles?.includes("dept_manager"));
      deptManagers.forEach((mgr: any) => {
        localDb.notifications.insert({ user_id: mgr.id, message: `مقترح مهمة جديدة من ${section} → ${targetUnit}: ${form.title}`, type: "info", link: "/tasks" });
      });
    } else if (form.assigned_to) {
      localDb.notifications.insert({ user_id: form.assigned_to, message: `مهمة جديدة: ${form.title}`, type: "info", link: "/tasks" });
    }
    setSaving(false);
    setShowCreate(false);
    setForm({ title: "", description: "", unit: "", stage: "writing", assigned_to: "", estimated_hours: 0, is_routine: false });
    refetch();
  };

  const handleHandover = async (taskId: string) => {
    if (!handoverForm.to_user) {
      toast({ title: "خطأ", description: "اختر المستلم", variant: "destructive" });
      return;
    }
    setSaving(true);
    const task = tasks.find(t => t.id === taskId);
    const toEmp = employees.find(e => e.id === handoverForm.to_user);
    
    localDb.taskHandovers.insert({
      task_id: taskId,
      from_user_id: userId,
      from_user_name: userName,
      to_user_id: handoverForm.to_user,
      to_user_name: toEmp?.name || "",
      stage: task?.stage || "",
      notes: handoverForm.notes,
      status: "pending_acceptance"
    });
    
    await logAction(userName, "طلب إحالة مهمة", `${task?.title} → ${toEmp?.name}`);
    toast({ title: "تم", description: "تم إرسال طلب الإحالة للموظف البديل للموافقة" });
    localDb.notifications.insert({ user_id: handoverForm.to_user, message: `طلب إحالة مهمة إليك: ${task?.title || ""}`, type: "info", link: `/tasks?focus=${taskId}` });
    
    setSaving(false);
    setShowHandover(null);
    setHandoverForm({ to_user: "", notes: "" });
    refetch();
  };

  const handleAcceptHandover = async (handoverId: string, accept: boolean) => {
    const handover = taskHandovers.find((h: any) => h.id === handoverId);
    if (!handover) return;
    const task = tasks.find(t => t.id === handover.task_id);
    
    if (accept) {
      localDb.taskHandovers.update(handoverId, { status: "pending_approval" });
      await logAction(userName, "قبول استلام مهمة", task?.title || "");
      toast({ title: "تم", description: "تم قبول المهمة وبانتظار موافقة رئيس الشعبة" });
      
      const unitHeads = employees.filter(e => e.roles?.includes("unit_head") && e.section === task?.unit);
      unitHeads.forEach(head => {
        localDb.notifications.insert({ user_id: head.id, message: `موافقة مطلوبة على إحالة مهمة: ${task?.title || ""}`, type: "info", link: `/tasks?focus=${task?.id}` });
      });
    } else {
      localDb.taskHandovers.update(handoverId, { status: "rejected" });
      await logAction(userName, "رفض استلام مهمة", task?.title || "");
      toast({ title: "تم", description: "تم رفض استلام المهمة" });
      localDb.notifications.insert({ user_id: handover.from_user_id, message: `رفض ${userName} استلام المهمة: ${task?.title || ""}`, type: "warning", link: `/tasks?focus=${task?.id}` });
    }
    refetch();
  };

  const handleApproveHandover = async (handoverId: string, approve: boolean) => {
    const handover = taskHandovers.find((h: any) => h.id === handoverId);
    if (!handover) return;
    const task = tasks.find(t => t.id === handover.task_id);
    
    if (approve) {
      localDb.taskHandovers.update(handoverId, { status: "approved" });
      localDb.tasks.update(handover.task_id, {
        assigned_to: handover.to_user_id,
        previous_owner: handover.from_user_id,
        handed_over: true,
        handed_over_at: new Date().toISOString(),
      });
      await logAction(userName, "موافقة على إحالة مهمة", task?.title || "");
      toast({ title: "تم", description: "تمت الموافقة على نقل المهمة" });
      localDb.notifications.insert({ user_id: handover.to_user_id, message: `تمت الموافقة على نقل المهمة إليك: ${task?.title || ""}`, type: "success", link: `/tasks?focus=${task?.id}` });
      localDb.notifications.insert({ user_id: handover.from_user_id, message: `تمت الموافقة على نقل مهمتك لـ ${handover.to_user_name}`, type: "success", link: `/tasks?focus=${task?.id}` });
    } else {
      localDb.taskHandovers.update(handoverId, { status: "rejected" });
      await logAction(userName, "رفض إحالة مهمة", task?.title || "");
      toast({ title: "تم", description: "تم رفض إحالة المهمة" });
      localDb.notifications.insert({ user_id: handover.from_user_id, message: `رفض رئيس الشعبة إحالة المهمة: ${task?.title || ""}`, type: "warning", link: `/tasks?focus=${task?.id}` });
    }
    refetch();
  };

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    if (newStatus === "approved" && !has("approve_task")) {
      toast({ title: "خطأ", description: "ليس لديك صلاحية اعتماد المهمة", variant: "destructive" });
      return;
    }
    const task = tasks.find(t => t.id === taskId);
    if (newStatus === "completed") {
      if (task) handleMarkCompleted(taskId);
      return;
    }
    localDb.tasks.update(taskId, { status: newStatus });
    await logAction(userName, "تحديث حالة مهمة", `${task?.title} → ${statusLabels[newStatus]}`);
    toast({ title: "تم", description: "تم تحديث الحالة" });
    if (task?.assigned_to && task.assigned_to !== userId) {
      localDb.notifications.insert({ user_id: task.assigned_to, message: `تم تحديث حالة المهمة: ${task.title} → ${statusLabels[newStatus]}`, type: "info", link: `/tasks?focus=${taskId}` });
    }
    refetch();
  };

  const handleMarkCompleted = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    let points = 0;
    if (task?.estimated_hours && task?.created_at) {
      const hoursSpent = (new Date().getTime() - new Date(task.created_at).getTime()) / (1000 * 60 * 60);
      if (hoursSpent <= task.estimated_hours) points = 2; // Bonus points for fast completion
    }
    localDb.tasks.update(taskId, { status: "review", pending_points: points });
    await logAction(userName, "إنهاء مهمة (بانتظار المراجعة)", task?.title || "");
    toast({ title: "تم", description: "تم تحديد المهمة كمكتملة وهي الآن بانتظار مراجعة رئيس الشعبة" });
    const targetId = task?.assigned_by || task?.created_by;
    if (targetId) {
      localDb.notifications.insert({ user_id: targetId, message: `مهمة مكتملة بانتظار المراجعة: ${task?.title || ""}`, type: "info", link: `/tasks?focus=${taskId}` });
    } else {
      const profiles = localDb.profiles.getAll();
      const unitHead = profiles.find((p: any) => p.roles?.includes("unit_head") && p.section === task?.unit);
      localDb.notifications.insert({ user_id: unitHead?.id || null, message: `مهمة مكتملة بانتظار المراجعة: ${task?.title || ""}`, type: "info", link: `/tasks?focus=${taskId}` });
    }
    refetch();
  };

  const handleApproveTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    if (task.created_by === userId || task.assigned_to === userId) {
      toast({ title: "خطأ", description: "لا يمكنك اعتماد مهمة أنشأتها أو أسندت إليك", variant: "destructive" });
      return;
    }
    localDb.tasks.update(taskId, {
      status: "approved",
      achievement_points: (task?.achievement_points || 0) + 1 + (task?.pending_points || 0),
    });
    await logAction(userName, "اعتماد مهمة", task?.title || "");
    toast({ title: "تم", description: "تم اعتماد المهمة وإضافة نقاط الإنجاز" });
    if (task?.assigned_to) {
      localDb.notifications.insert({ user_id: task.assigned_to, message: `تم اعتماد مهمتك: ${task.title} (+${1 + (task?.pending_points || 0)} نقطة)`, type: "info", link: `/tasks?focus=${taskId}` });
    }
    refetch();
  };

  const handleApproveProposal = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    if (!(isManager || isAdmin)) {
      toast({ title: "خطأ", description: "فقط رئيس القسم يمكنه قبول المقترحات", variant: "destructive" });
      return;
    }
    localDb.tasks.update(taskId, { status: "pending" });
    await logAction(userName, "قبول مقترح مهمة", task.title);
    toast({ title: "تم", description: "تم قبول المقترح وتحويل المهمة إلى معلقة" });
    if (task.assigned_to) {
      localDb.notifications.insert({ user_id: task.assigned_to, message: `تم قبول مقترح المهمة: ${task.title}`, type: "info", link: `/tasks?focus=${taskId}` });
    }
    if (task.created_by) {
      localDb.notifications.insert({ user_id: task.created_by, message: `تم قبول مقترح مهمتك: ${task.title}`, type: "info", link: `/tasks?focus=${taskId}` });
    }
    refetch();
  };

  const handleRejectProposal = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    if (!(isManager || isAdmin)) {
      toast({ title: "خطأ", description: "فقط رئيس القسم يمكنه رفض المقترحات", variant: "destructive" });
      return;
    }
    localDb.tasks.update(taskId, { status: "rejected" });
    await logAction(userName, "رفض مقترح مهمة", task.title);
    toast({ title: "تم", description: "تم رفض المقترح" });
    if (task.created_by) {
      localDb.notifications.insert({ user_id: task.created_by, message: `تم رفض مقترح مهمتك: ${task.title}`, type: "warning", link: `/tasks?focus=${taskId}` });
    }
    refetch();
  };

  const handleSendComment = async (taskId: string) => {
    if (!commentText.trim()) {
      toast({ title: "خطأ", description: "اكتب ملاحظة أولاً", variant: "destructive" });
      return;
    }
    const task = tasks.find(t => t.id === taskId);
    localDb.taskComments.insert({
      task_id: taskId,
      author_id: userId,
      author_name: userName,
      message: commentText,
    });
    localDb.tasks.update(taskId, { status: "in_progress" });
    await logAction(userName, "إرجاع مهمة مع ملاحظة", task?.title || "");
    toast({ title: "تم", description: "تم إرجاع المهمة مع الملاحظة" });
    if (task?.assigned_to) {
      localDb.notifications.insert({ user_id: task.assigned_to, message: `ملاحظة على مهمة: ${task.title}`, type: "warning", link: `/tasks?focus=${taskId}` });
    }
    setCommentText("");
    refetchComments();
    refetch();
  };

  const handlePostComment = async (taskId: string) => {
    if (!threadText.trim()) {
      toast({ title: "خطأ", description: "اكتب التعليق أولاً", variant: "destructive" });
      return;
    }
    const task = tasks.find(t => t.id === taskId);
    const recipientId = threadRecipient || (task?.assigned_to === userId ? task?.assigned_by : task?.assigned_to) || null;
    const recipient = employees.find(e => e.id === recipientId);
    localDb.taskComments.insert({
      task_id: taskId,
      author_id: userId,
      author_name: userName,
      recipient_id: recipientId,
      recipient_name: recipient?.name || "",
      message: threadText.trim() + (attachmentFileId ? `\n📎 مرفق (معرّف: ${attachmentFileId})` : ""),
      is_hidden: isHiddenComment,
    });
    if (recipientId) {
      localDb.notifications.insert({
        user_id: recipientId,
        message: `تعليق جديد من ${userName} على مهمة: ${task?.title || ""}`,
        type: "info",
        link: `/tasks?focus=${taskId}`,
      });
    }
    await logAction(userName, "تعليق على مهمة", task?.title || "");
    setThreadText("");
    setThreadRecipient("");
    setIsHiddenComment(false);
    setAttachment(null);
    setAttachmentFileId(null);
    refetchComments();
    toast({ title: "تم", description: isHiddenComment ? "تم إرسال التعليق (مخفي)" : "تم إرسال التعليق" });
  };

  const handleAdvanceStage = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.is_routine) return;
    const allStages = [...curriculumStages, ...presentationStages, "done"];
    const currentIdx = allStages.indexOf(task.stage);
    if (currentIdx < allStages.length - 1) {
      const nextStage = allStages[currentIdx + 1];
      const update: Record<string, unknown> = { stage: nextStage };
      if (nextStage === "done") update.status = "review";
      localDb.tasks.update(taskId, update);
      await logAction(userName, "ترقية مرحلة مهمة", `${task.title}: ${stageLabels[task.stage]} → ${stageLabels[nextStage]}`);
      toast({ title: "تم", description: nextStage === "done" ? "تم إنجاز المهمة — بانتظار المراجعة" : `تم الانتقال إلى مرحلة: ${stageLabels[nextStage]}` });
      refetch();
    }
  };

  const handlePipelineClick = (key: string) => {
    if (filterStage === key) {
      setFilterStage(null);
      setActiveChip("all");
    } else {
      setFilterStage(key);
      setActiveChip("all");
    }
  };

  const handleChipClick = (key: string) => {
    setActiveChip(key);
    setFilterStage(null);
  };

  const getStageProgress = (task: typeof tasks[0]) => {
    if (task.is_routine) return null;
    const allStages = [...curriculumStages, ...presentationStages];
    const idx = allStages.indexOf(task.stage);
    if (idx < 0) return null;
    return Math.round(((idx + 1) / allStages.length) * 100);
  };

  const getPipelineCount = (key: string) => {
    if (key === "_done") return baseVisibleTasks.filter(t => t.status === "completed" || t.status === "approved").length;
    return baseVisibleTasks.filter(t => t.stage === key && t.status !== "completed" && t.status !== "approved").length;
  };

  const renderTaskActions = (task: typeof tasks[0], isMyTask: boolean) => {
    const btns: React.ReactNode[] = [];
    if (isMyTask && isIndividual) {
      if (task.status === "pending" || task.status === "in_progress") {
        if (task.status === "pending") {
          btns.push(<button key="start" onClick={() => handleUpdateStatus(task.id, "in_progress")} className="p-1.5 rounded-md bg-warning/10 text-warning hover:bg-warning/20 text-xs flex items-center gap-1"><Play className="w-3 h-3" />بدء</button>);
        }
        if (!task.is_routine && has("advance_task_stage")) {
          btns.push(<button key="advance" onClick={() => handleAdvanceStage(task.id)} className="p-1.5 rounded-md bg-accent/10 text-accent hover:bg-accent/20 text-xs flex items-center gap-1"><ArrowUpRight className="w-3 h-3" />ترقية</button>);
        }
        btns.push(<button key="done" onClick={() => handleMarkCompleted(task.id)} className="p-1.5 rounded-md bg-success/10 text-success hover:bg-success/20 text-xs flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />إنهاء</button>);
      }
    }
    if (task.status === "proposed" && (isManager || isAdmin)) {
      btns.push(
        <button key="accept_proposal" onClick={() => handleApproveProposal(task.id)} className="p-1.5 rounded-md bg-success/10 text-success hover:bg-success/20 text-xs flex items-center gap-1"><Check className="w-3 h-3" />قبول</button>,
        <button key="reject_proposal" onClick={() => handleRejectProposal(task.id)} className="p-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs flex items-center gap-1"><X className="w-3 h-3" />رفض</button>
      );
    }
    if ((isUnitHead || isManager || isAdmin) && task.status === "review") {
      btns.push(
        <button key="approve" onClick={() => handleApproveTask(task.id)} className="p-1.5 rounded-md bg-success/10 text-success hover:bg-success/20 text-xs flex items-center gap-1"><Check className="w-3 h-3" />اعتماد</button>,
        <button key="comment" onClick={() => setShowDetail(task.id)} className="p-1.5 rounded-md bg-warning/10 text-warning hover:bg-warning/20 text-xs flex items-center gap-1"><MessageSquare className="w-3 h-3" />ملاحظة</button>
      );
    }
    if ((isManager || isAdmin || (isUnitHead && !isIndividual)) && !isMyTask) {
      if (task.status !== "approved" && task.status !== "handed_over" && task.status !== "review") {
        btns.push(<button key="complete" onClick={() => handleUpdateStatus(task.id, "completed")} className="p-1.5 rounded-md bg-success/10 text-success hover:bg-success/20 text-xs">إنهاء</button>);
      }
    }
    if (canEditTask(task) && !["completed", "handed_over", "approved", "review"].includes(task.status)) {
      if (!task.is_routine) btns.push(<button key="advance" onClick={() => handleAdvanceStage(task.id)} className="p-1.5 rounded-md bg-accent/10 text-accent hover:bg-accent/20 text-xs">ترقية</button>);
      btns.push(<button key="handover" onClick={() => setShowHandover(task.id)} className="p-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20" title="تسليم"><ArrowLeftRight className="w-3.5 h-3.5" /></button>);
    }
    btns.push(<button key="view" onClick={() => setShowDetail(task.id)} className="p-1.5 rounded-md bg-muted text-muted-foreground hover:bg-muted/80"><Eye className="w-3.5 h-3.5" /></button>);
    return <div className="flex gap-1 flex-wrap">{btns}</div>;
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const selectedTask = tasks.find(t => t.id === showDetail);

  const completionRate = baseVisibleTasks.length > 0 ? Math.round((baseVisibleTasks.filter(t => t.status === "completed" || t.status === "approved").length / baseVisibleTasks.length) * 100) : 0;

  const unitChartData = taskUnits.map((u: string, i: number) => ({
    name: u,
    value: baseVisibleTasks.filter(t => t.unit === u).length,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const leaderboard = (() => {
    const map: Record<string, number> = {};
    const names: Record<string, string> = {};
    baseVisibleTasks.forEach(t => {
      if (t.assigned_to) {
        map[t.assigned_to] = (map[t.assigned_to] || 0) + (t.achievement_points || 0);
        const emp = employees.find(e => e.id === t.assigned_to);
        if (emp) names[t.assigned_to] = emp.name;
      }
    });
    return Object.entries(map).map(([id, points]) => ({ id, name: names[id] || id, points })).sort((a, b) => b.points - a.points).slice(0, 5);
  })();

  const boardGroups: Record<string, typeof filteredTasks> = {};
  BOARD_COLUMNS.forEach(col => { boardGroups[col.key] = []; });
  filteredTasks.forEach(t => {
    if (t.status === "completed" || t.status === "approved") {
      if (boardGroups["_done"]) boardGroups["_done"].push(t);
    } else if (boardGroups[t.stage]) {
      boardGroups[t.stage].push(t);
    }
  });

  const allStagesForTimeline = [...curriculumStages, ...presentationStages];

  const renderTaskCard = (task: typeof tasks[0], isMyTask: boolean, index: number, compact = false) => {
    const gradient = unitGradients[task.unit] || "from-slate-400 to-slate-500";
    const progress = getStageProgress(task);
    const initials = ename(task.assigned_to).split(" ").map((w: string) => w[0]).join("").slice(0, 2);
    return (
      <div key={task.id} className={`bg-card border border-border rounded-xl overflow-hidden card-hover animate-slide-up ${compact ? "" : "animate-bounce-in"}`} style={{ animationDelay: `${index * 50}ms` }}>
        <div className={`h-1.5 bg-gradient-to-l ${gradient}`} />
        <div className={compact ? "p-3" : "p-4"}>
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-foreground truncate">{task.title}</h3>
              {task.is_routine && <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded mr-1">اعتيادية</span>}
            </div>
            {(task.achievement_points || 0) > 0 && (
              <Badge variant="secondary" className="text-[10px] gap-0.5 shrink-0"><Zap className="w-2.5 h-2.5 text-warning" />{task.achievement_points}</Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="w-6 h-6">
              <AvatarFallback className="text-[8px] bg-primary/10 text-primary">{initials}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate">{ename(task.assigned_to)}</span>
            <span className="mr-auto text-[10px] text-muted-foreground">{task.unit}</span>
          </div>
          {progress !== null && !compact && (
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-muted-foreground">{stageLabels[task.stage]}</span>
                <span className="text-[10px] text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          )}
          <div className="flex items-center justify-between gap-2">
            <StatusBadge status={statusLabels[task.status] || task.status} variant={task.status === "review" ? "warning" : task.status === "approved" ? "success" : undefined} />
            <div className="flex gap-0.5">{renderTaskActions(task, isMyTask)}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in">
      <PageHeader title="إدارة المهام" subtitle="إنشاء المهام وتتبع التسليم والمراحل" icon={ListTodo} sections={[
        { id: "search_filter", label: "البحث والفلترة" },
        { id: "tasks_list", label: "قائمة المهام" },
      ]} exportData={() => ({
        filename: "tasks",
        rows: baseVisibleTasks.map(t => ({ العنوان: t.title, الوحدة: t.unit, المرحلة: stageLabels[t.stage] || t.stage, الحالة: statusLabels[t.status] || t.status, المسند_إلى: ename(t.assigned_to), الأولوية: t.achievement_points || 0, روتيني: t.is_routine ? "نعم" : "لا" }))
      })} actions={canEditTasks ? (
        <Button size="sm" className="gap-1.5" onClick={() => setShowCreate(true)}><Plus className="w-3.5 h-3.5" />مهمة جديدة</Button>
      ) : null} />

      <div className="glass rounded-xl p-3 animate-slide-up">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {PIPELINE_STAGES.map((stage, i) => {
            const count = getPipelineCount(stage.key);
            const isActive = filterStage === stage.key;
            return (
              <div key={stage.key} className="flex items-center animate-slide-up" style={{ animationDelay: `${i * 75}ms` }}>
                <button
                  onClick={() => handlePipelineClick(stage.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    isActive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "bg-muted/60 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {stage.label}
                  <span className={`text-[10px] min-w-[20px] text-center px-1.5 py-0.5 rounded-full font-bold ${
                    isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary"
                  }`}>{count}</span>
                </button>
                {i < PIPELINE_STAGES.length - 1 && <div className="w-6 h-0.5 bg-border rounded-full shrink-0 mx-0.5" />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap no-print">
        <div className="flex gap-1.5 flex-wrap">
          {FILTER_CHIPS.map(chip => (
            <button
              key={chip.key}
              onClick={() => handleChipClick(chip.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeChip === chip.key && !filterStage
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
        <div className="flex bg-muted rounded-lg p-0.5 gap-0.5">
          <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}><ListIcon className="w-4 h-4" /></button>
          <button onClick={() => setViewMode("board")} className={`p-1.5 rounded-md transition-all ${viewMode === "board" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}><LayoutGrid className="w-4 h-4" /></button>
          <button onClick={() => setViewMode("gantt")} className={`p-1.5 rounded-md transition-all ${viewMode === "gantt" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}><Calendar className="w-4 h-4" /></button>
        </div>
      </div>

      <div data-print-section="tasks_list" className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3">
        <div className="bg-card border border-border rounded-xl p-4 text-center animate-slide-up delay-75">
          <p className="text-2xl font-bold text-primary animate-count-up">{baseVisibleTasks.length}</p>
          <p className="text-xs text-muted-foreground">إجمالي المهام</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center animate-slide-up delay-100">
          <p className="text-2xl font-bold text-success animate-count-up">{baseVisibleTasks.filter(t => t.status === "completed" || t.status === "approved").length}</p>
          <p className="text-xs text-muted-foreground">مكتملة / معتمدة</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center animate-slide-up delay-150">
          <p className="text-2xl font-bold text-warning animate-count-up">{baseVisibleTasks.filter(t => t.status === "in_progress").length}</p>
          <p className="text-xs text-muted-foreground">قيد التنفيذ</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center animate-slide-up delay-200">
          <p className="text-2xl font-bold text-accent animate-count-up">{baseVisibleTasks.filter(t => t.status === "review").length}</p>
          <p className="text-xs text-muted-foreground">بانتظار المراجعة</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center animate-slide-up delay-300">
          <p className="text-2xl font-bold text-muted-foreground animate-count-up">{baseVisibleTasks.filter(t => t.is_routine).length}</p>
          <p className="text-xs text-muted-foreground">اعتيادية</p>
        </div>
      </div>

      {viewMode === "list" ? (
        <div className="tab-content-enter space-y-5">
          {myTasks.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-foreground mb-3 gradient-text">مهامي</h2>
              <div className="grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
                {myTasks.map((task, i) => renderTaskCard(task, true, i))}
              </div>
            </div>
          )}
          {!isIndividual && (
            <div>
              <h2 className="text-sm font-bold text-foreground mb-3">{myTasks.length > 0 ? "مهام أخرى" : "جميع المهام"}</h2>
              <div className="grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
                {(myTasks.length > 0 ? otherTasks : filteredTasks).length > 0 ?
                  (myTasks.length > 0 ? otherTasks : filteredTasks).map((task, i) => renderTaskCard(task, false, i))
                : (
                  <div className="col-span-full bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">لا توجد مهام</div>
                )}
              </div>
            </div>
          )}
          {isIndividual && myTasks.length === 0 && (
            <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">لا توجد مهام مسندة إليك</div>
          )}
        </div>
      ) : viewMode === "board" ? (
        <div className="tab-content-enter flex gap-4 overflow-x-auto no-scrollbar pb-4">
          {BOARD_COLUMNS.map(col => {
            const colTasks = boardGroups[col.key] || [];
            return (
              <div key={col.key} className="min-w-[260px] flex-1 max-w-[320px]">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-sm font-bold text-foreground">{col.label}</h3>
                  <Badge variant="secondary" className="text-[10px]">{colTasks.length}</Badge>
                </div>
                <div className="space-y-3 min-h-[120px] bg-muted/20 rounded-xl p-2">
                  {colTasks.length > 0 ? colTasks.map((task, i) => renderTaskCard(task, task.assigned_to === userId, i, true))
                  : <div className="text-center text-xs text-muted-foreground py-6">لا توجد مهام</div>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="tab-content-enter space-y-4">
          <h2 className="text-sm font-bold text-foreground gradient-text">مخطط تقدم المهام (جانت)</h2>
          <div className="bg-card border border-border rounded-xl p-5 overflow-x-auto">
            <div className="min-w-[600px] space-y-4">
              {filteredTasks.length > 0 ? filteredTasks.map(t => {
                const progress = t.status === "completed" || t.status === "approved" ? 100 : (getStageProgress(t) || 10);
                return (
                  <div key={t.id} className="flex items-center gap-4">
                    <div className="w-48 shrink-0">
                      <p className="text-xs font-bold text-foreground truncate">{t.title}</p>
                      <p className="text-[10px] text-muted-foreground">{ename(t.assigned_to)}</p>
                    </div>
                    <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden relative group">
                       <div className="h-full bg-primary/20 absolute right-0 transition-all duration-500" style={{ width: '100%' }} />
                       <div className={`h-full absolute right-0 transition-all duration-1000 flex items-center justify-start pr-2 ${t.status === "completed" || t.status === "approved" ? "bg-success" : "bg-primary"}`} style={{ width: `${Math.max(5, progress)}%` }}>
                          <span className="text-[9px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">{progress}%</span>
                       </div>
                    </div>
                    <div className="w-24 shrink-0 text-left">
                      <p className="text-[10px] font-bold text-foreground">{stageLabels[t.stage] || t.stage}</p>
                      <p className="text-[9px] text-muted-foreground">{statusLabels[t.status] || t.status}</p>
                    </div>
                  </div>
                )
              }) : <div className="text-center py-8 text-muted-foreground">لا توجد مهام مطابقة</div>}
            </div>
          </div>
        </div>
      )}

      <Collapsible open={statsOpen} onOpenChange={setStatsOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between py-2.5 px-4 glass rounded-xl hover:bg-muted/50 transition-all no-print">
            <span className="text-sm font-bold text-foreground flex items-center gap-2"><Trophy className="w-4 h-4 text-warning" />الإحصائيات</span>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${statsOpen ? "rotate-180" : ""}`} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="tab-content-enter grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 mt-3">
            <div className="bg-card border border-border rounded-xl p-5 flex flex-col items-center">
              <h4 className="text-xs font-bold text-muted-foreground mb-3">نسبة الإنجاز</h4>
              <CircularProgress value={completionRate} size={110} strokeWidth={9} />
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <h4 className="text-xs font-bold text-muted-foreground mb-3">المهام حسب الوحدة</h4>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={unitChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} innerRadius={35} strokeWidth={0}>
                    {unitChartData.map((entry: { color: string }, i: number) => <Cell key={i} fill={entry.color || CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-3 justify-center mt-2 flex-wrap">
                {unitChartData.map((entry: { name: string; color: string }) => (
                  <span key={entry.name} className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />{entry.name}</span>
                ))}
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <h4 className="text-xs font-bold text-muted-foreground mb-3 flex items-center gap-1"><Trophy className="w-3 h-3 text-warning" />لوحة المتصدرين</h4>
              <div className="space-y-2.5">
                {leaderboard.length > 0 ? leaderboard.map((entry, i) => (
                  <div key={entry.id} className="flex items-center gap-2.5 animate-slide-up" style={{ animationDelay: `${i * 75}ms` }}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      i === 0 ? "bg-warning/20 text-warning" : i === 1 ? "bg-muted text-muted-foreground" : "bg-muted/50 text-muted-foreground"
                    }`}>{i + 1}</span>
                    <span className="text-xs text-foreground flex-1 truncate">{entry.name}</span>
                    <span className="text-xs font-bold text-primary">{entry.points}</span>
                  </div>
                )) : <p className="text-xs text-muted-foreground text-center py-4">لا توجد نقاط إنجاز بعد</p>}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader><DialogTitle>مهمة جديدة</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>العنوان</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>الوصف</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} /></div>
            <div className="flex items-center gap-2">
              <Checkbox checked={form.is_routine} onCheckedChange={(c) => setForm({ ...form, is_routine: !!c })} id="is_routine" />
              <Label htmlFor="is_routine">مهمة اعتيادية (لا تمر بمراحل المناهج/العروض)</Label>
            </div>
            {(isManager || isAdmin || isUnitHead) && (
              <div>
                <Label>الشعبة {(!isManager && !isAdmin) && <span className="text-[10px] text-muted-foreground">(اختيار شعبة غير شعبتك يجعل المهمة مقترحاً لرئيس القسم)</span>}</Label>
                <Select value={form.unit} onValueChange={v => setForm({ ...form, unit: v })}>
                  <SelectTrigger><SelectValue placeholder={section ? `شعبتك: ${section}` : "اختر الشعبة"} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="الإعداد">شعبة الإعداد</SelectItem>
                    <SelectItem value="المناهج">شعبة المناهج</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {!form.is_routine && (
              <div>
                <Label>المرحلة</Label>
                <Select value={form.stage} onValueChange={v => setForm({ ...form, stage: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(stageLabels).filter(([k]) => k !== "routine").map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />الوقت المقدر (ساعات)</Label>
              <Input type="number" value={form.estimated_hours} onChange={e => setForm({ ...form, estimated_hours: Number(e.target.value) })} />
            </div>
            <div>
              <Label>تعيين إلى</Label>
              <Select value={form.assigned_to} onValueChange={v => setForm({ ...form, assigned_to: v })}>
                <SelectTrigger><SelectValue placeholder="اختر الموظف" /></SelectTrigger>
                <SelectContent>
                  {employees
                    .filter(e => (isManager || isAdmin) || e.section === section)
                    .map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreate} disabled={saving} className="w-full">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "إنشاء"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!showHandover} onOpenChange={() => setShowHandover(null)}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader><DialogTitle>تسليم المهمة</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {showHandover && (
              <div className="bg-muted/30 rounded-lg px-3 py-2 text-sm">
                <span className="text-muted-foreground">المعيّن حالياً: </span>
                <span className="font-bold text-foreground">{ename(tasks.find(t => t.id === showHandover)?.assigned_to || null)}</span>
              </div>
            )}
            <div>
              <Label>تسليم إلى</Label>
              <Select value={handoverForm.to_user} onValueChange={v => setHandoverForm({ ...handoverForm, to_user: v })}>
                <SelectTrigger><SelectValue placeholder="اختر المستلم" /></SelectTrigger>
                <SelectContent>
                  {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>ملاحظات</Label><Textarea value={handoverForm.notes} onChange={e => setHandoverForm({ ...handoverForm, notes: e.target.value })} rows={2} /></div>
            <Button onClick={() => showHandover && handleHandover(showHandover)} disabled={saving} className="w-full">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "تسليم"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!showDetail} onOpenChange={() => { setShowDetail(null); setCommentText(""); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto" dir="rtl">
          <DialogHeader><DialogTitle>تفاصيل المهمة</DialogTitle></DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-foreground">{selectedTask.title}</h3>
                  {selectedTask.is_routine && <Badge variant="secondary" className="text-[10px] mt-1">اعتيادية</Badge>}
                </div>
                <StatusBadge status={statusLabels[selectedTask.status] || selectedTask.status} variant={selectedTask.status === "approved" ? "success" : selectedTask.status === "review" ? "warning" : undefined} />
              </div>

              <div className="flex items-center gap-3 bg-muted/30 rounded-xl px-3 py-2.5">
                <Avatar className="w-9 h-9">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">{ename(selectedTask.assigned_to).split(" ").map((w: string) => w[0]).join("").slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{ename(selectedTask.assigned_to)}</p>
                  <p className="text-[10px] text-muted-foreground">{selectedTask.unit} · {selectedTask.estimated_hours ? `${selectedTask.estimated_hours} س` : "-"}</p>
                  {selectedTask.viewed_at && (
                    <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      شوهد: {new Date(selectedTask.viewed_at).toLocaleString("ar-IQ", { dateStyle: "short", timeStyle: "short" })}
                    </p>
                  )}
                </div>
                {(selectedTask.achievement_points || 0) > 0 && (
                  <Badge variant="secondary" className="gap-0.5"><Zap className="w-3 h-3 text-warning" />{selectedTask.achievement_points}</Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div><p className="text-[10px] text-muted-foreground">أنشأها</p><p className="text-foreground text-xs">{ename(selectedTask.created_by)}</p></div>
                <div><p className="text-[10px] text-muted-foreground">أسندها</p><p className="text-foreground text-xs">{ename(selectedTask.assigned_by)}</p></div>
                <div><p className="text-[10px] text-muted-foreground">المرحلة</p><StatusBadge status={stageLabels[selectedTask.stage] || selectedTask.stage} variant="info" /></div>
                <div><p className="text-[10px] text-muted-foreground">التسليم</p><p className="text-foreground text-xs">{selectedTask.handed_over ? "نعم" : "لا"}</p></div>
                {selectedTask.previous_owner && <div><p className="text-[10px] text-muted-foreground">المالك السابق</p><p className="text-warning text-xs">{ename(selectedTask.previous_owner)}</p></div>}
              </div>

              {selectedTask.description && (
                <div className="bg-muted/20 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground mb-1">الوصف</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{selectedTask.description}</p>
                </div>
              )}

              <div className="border-t border-border pt-3">
                <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5"><Paperclip className="w-3.5 h-3.5 text-primary" />المرفقات</p>
                <FileList entityKey={`task_${selectedTask.id}`} showDelete={canEditTask(selectedTask)} />
                <FileUploadButton entityKey={`task_${selectedTask.id}`} onUpload={() => refetch()} label="إرفاق ملف" />
              </div>

              {!selectedTask.is_routine && (
                <div className="border-t border-border pt-3">
                  <p className="text-xs font-bold text-foreground mb-3">مسار المهمة</p>
                  <div className="space-y-0">
                    {allStagesForTimeline.map((s, i) => {
                      const isCurrent = selectedTask.stage === s;
                      const currentIdx = allStagesForTimeline.indexOf(selectedTask.stage);
                      const isPast = currentIdx > i;
                      return (
                        <div key={s} className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-3.5 h-3.5 rounded-full shrink-0 border-2 transition-all ${
                              isCurrent ? "bg-primary border-primary animate-glow-pulse scale-125" :
                              isPast ? "bg-success border-success" :
                              "bg-muted border-muted-foreground/30"
                            }`} />
                            {i < allStagesForTimeline.length - 1 && (
                              <div className={`w-0.5 h-5 ${isPast ? "bg-success" : "bg-muted-foreground/20"}`} />
                            )}
                          </div>
                          <span className={`text-xs pb-1 ${isCurrent ? "font-bold text-primary" : isPast ? "text-success" : "text-muted-foreground"}`}>
                            {stageLabels[s]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {taskHandovers.filter((h: { task_id: string }) => h.task_id === selectedTask.id).length > 0 && (
                <div className="border-t border-border pt-3">
                  <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5"><ArrowLeftRight className="w-3.5 h-3.5 text-accent" />سجل الإحالات</p>
                  <div className="space-y-2">
                    {taskHandovers.filter((h: { task_id: string }) => h.task_id === selectedTask.id).map((h: any) => (
                      <div key={h.id} className="bg-muted/30 rounded-lg p-2.5 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-foreground">{h.from_user_name} ← {h.to_user_name}</span>
                          <span className="text-muted-foreground shrink-0">{new Date(h.created_at).toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" })}</span>
                        </div>
                        {h.stage && <span className="badge-info mt-1 inline-block">{stageLabels[h.stage] || h.stage}</span>}
                        {h.notes && <p className="text-muted-foreground mt-1">{h.notes}</p>}
                        
                        <div className="mt-2 flex items-center justify-between">
                          <Badge variant={h.status === "approved" ? "default" : h.status === "rejected" ? "destructive" : "secondary"}>
                            {h.status === "pending_acceptance" ? "بانتظار موافقة المستلم" : h.status === "pending_approval" ? "بانتظار موافقة المسؤول" : h.status === "approved" ? "تمت الإحالة" : h.status === "rejected" ? "مرفوضة" : "غير معروف"}
                          </Badge>
                          
                          {h.status === "pending_acceptance" && h.to_user_id === userId && (
                            <div className="flex gap-1">
                              <Button size="sm" onClick={() => handleAcceptHandover(h.id, true)} className="h-6 text-[10px] px-2 bg-success text-success-foreground hover:bg-success/90">قبول</Button>
                              <Button size="sm" onClick={() => handleAcceptHandover(h.id, false)} variant="destructive" className="h-6 text-[10px] px-2">رفض</Button>
                            </div>
                          )}
                          
                          {h.status === "pending_approval" && (isUnitHead || isManager || isAdmin) && selectedTask.unit === section && (
                            <div className="flex gap-1">
                              <Button size="sm" onClick={() => handleApproveHandover(h.id, true)} className="h-6 text-[10px] px-2 bg-success text-success-foreground hover:bg-success/90">اعتماد الإحالة</Button>
                              <Button size="sm" onClick={() => handleApproveHandover(h.id, false)} variant="destructive" className="h-6 text-[10px] px-2">رفض الإحالة</Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(isUnitHead || isManager || isAdmin) && selectedTask.status === "review" && (
                <div className="border-t border-border pt-3 space-y-3">
                  <p className="text-xs font-bold text-foreground flex items-center gap-2"><MessageSquare className="w-4 h-4 text-warning" />مراجعة المهمة</p>
                  <div className="flex gap-2">
                    <Button size="sm" className="gap-1" onClick={() => handleApproveTask(selectedTask.id)}><Check className="w-3.5 h-3.5" />اعتماد</Button>
                  </div>
                  <div className="space-y-2">
                    <Label>ملاحظة / تعليق (يرجع المهمة للتنفيذ)</Label>
                    <Textarea value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="أضف ملاحظة للموظف..." rows={2} />
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => handleSendComment(selectedTask.id)} disabled={!commentText.trim()}><Send className="w-3.5 h-3.5" />إرسال الملاحظة</Button>
                  </div>
                </div>
              )}

              <div className="border-t border-border pt-3 flex gap-2 flex-wrap no-print">
                {(() => {
                  const actions: React.ReactNode[] = [];
                  if (selectedTask.assigned_to === userId && isIndividual) {
                    if (selectedTask.status === "pending") actions.push(<Button key="start" size="sm" variant="outline" className="gap-1" onClick={() => handleUpdateStatus(selectedTask.id, "in_progress")}><Play className="w-3.5 h-3.5" />بدء</Button>);
                    if (selectedTask.status === "pending" || selectedTask.status === "in_progress") actions.push(<Button key="done" size="sm" className="gap-1" onClick={() => handleMarkCompleted(selectedTask.id)}><CheckCircle2 className="w-3.5 h-3.5" />إنهاء</Button>);
                  }
                  if (canEditTask(selectedTask) && !["completed", "handed_over", "approved", "review"].includes(selectedTask.status)) {
                    if (!selectedTask.is_routine) actions.push(<Button key="advance" size="sm" variant="outline" className="gap-1" onClick={() => handleAdvanceStage(selectedTask.id)}><Zap className="w-3.5 h-3.5" />ترقية</Button>);
                    actions.push(<Button key="handover" size="sm" variant="outline" className="gap-1" onClick={() => setShowHandover(selectedTask.id)}><ArrowLeftRight className="w-3.5 h-3.5" />تسليم</Button>);
                  }
                  return actions;
                })()}
              </div>

              {(() => {
                const canSeeThread =
                  isManager || isAdmin || isUnitHead ||
                  selectedTask.assigned_to === userId ||
                  selectedTask.assigned_by === userId ||
                  selectedTask.created_by === userId;
                if (!canSeeThread) return null;
                const visibleComments = taskComments.filter((c: any) => {
                  if (c.is_hidden && !isManager && !isAdmin && !isUnitHead) return false;
                  return isManager || isAdmin || isUnitHead || c.author_id === userId || c.recipient_id === userId;
                });
                const canPost = selectedTask.assigned_to === userId || selectedTask.assigned_by === userId || isManager || isAdmin || isUnitHead;
                return (
                  <div className="border-t border-border pt-3 space-y-3">
                    <p className="text-xs font-bold text-foreground flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary" />التعليقات ({visibleComments.length})
                    </p>
                    <div className="space-y-2 flex-1 overflow-y-auto pr-1">
                      {visibleComments.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-2">لا توجد تعليقات بعد</p>
                      ) : visibleComments.map((c: { id: string; author_id: string; author_name: string; recipient_name?: string; message: string; created_at: string; is_hidden?: boolean }) => {
                        const mine = c.author_id === userId;
                        return (
                          <div key={c.id} className={`rounded-lg p-2.5 text-sm animate-slide-up ${mine ? "bg-primary/10 border border-primary/20" : "bg-muted/40 border border-border"}`}>
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-xs font-bold text-foreground">{c.author_name}{c.recipient_name ? ` ← ${c.recipient_name}` : ""}</span>
                              <span className="text-[10px] text-muted-foreground">{new Date(c.created_at).toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" })}</span>
                            </div>
                            <p className="text-foreground whitespace-pre-wrap text-xs">{c.message}</p>
                            {c.is_hidden && <Badge variant="destructive" className="text-[8px] mt-1 p-0 px-1">مخفي</Badge>}
                          </div>
                        );
                      })}
                    </div>
                    {canPost && (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Select value={threadRecipient} onValueChange={setThreadRecipient}>
                            <SelectTrigger className="text-xs"><SelectValue placeholder="موجّه إلى (اختياري)" /></SelectTrigger>
                            <SelectContent>
                              {employees
                                .filter(e => e.id !== userId && (e.id === selectedTask.assigned_to || e.id === selectedTask.assigned_by || e.id === selectedTask.created_by))
                                .map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="relative">
                          <Textarea value={threadText} onChange={e => setThreadText(e.target.value)} placeholder="اكتب تعليقاً..." rows={2} className="pb-10" />
                          <div className="absolute bottom-2 right-2 flex items-center gap-2">
                             <label className="cursor-pointer p-1.5 bg-muted rounded-md hover:bg-muted/80 transition-colors" title="إرفاق ملف">
                                <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />
                                <input type="file" className="hidden" onChange={async e => {
                                  const f = e.target.files?.[0] || null;
                                  setAttachment(f);
                                  if (f) {
                                    const stored = await fileStore.save(`task_comment_${showDetail}`, f, userId);
                                    setAttachmentFileId(stored.id);
                                  }
                                }} />
                             </label>
                             {attachment && <span className="text-[10px] text-primary truncate max-w-[150px]">{attachment.name}</span>}
                          </div>
                        </div>
                        {(isManager || isAdmin || isUnitHead) && (
                          <div className="flex items-center gap-2 mb-1">
                            <Checkbox checked={isHiddenComment} onCheckedChange={(c) => setIsHiddenComment(!!c)} id="hidden_comment" />
                            <Label htmlFor="hidden_comment" className="text-xs text-muted-foreground">تعليق مخفي (لا يراه الموظف)</Label>
                          </div>
                        )}
                        <Button size="sm" className="gap-1 w-full" onClick={() => handlePostComment(selectedTask.id)} disabled={!threadText.trim()}><Send className="w-3.5 h-3.5" />إرسال التعليق</Button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tasks;


