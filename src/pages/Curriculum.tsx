import { useState, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useCurriculumItems, useEmployees, CurriculumItem } from "@/hooks/useSupabaseData";
import { useUserRole } from "@/hooks/useUserRole";
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
import { Progress } from "@/components/ui/progress";
import { BookOpen, Upload, FileText, Presentation, CheckCircle2, XCircle, Plus, Loader2, Pencil, FileSpreadsheet, ChevronLeft, LayoutGrid, Table2, GitBranch, Pen, FileSearch, Printer, CircleCheckBig, Eye, Lock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const emptyForm = {
  title: "", goals: "", target_audience: "", count: 1, training_style: "نظري",
  type: "developmental", status: "not_applied",
  printed: false, form_type: "new", ppt_type: "new",
  executor_type: "internal", executor_name: "", hours: 0,
  applied: false, location: "", trainer_name: "", audience_count: 0,
  audit_status: "not_started", hard_copy_printed: false,
  privacy_level: "public",
};

const auditStatusLabels: Record<string, string> = {
  done: "منجز", in_progress: "قيد التنفيذ", not_started: "لم يبدأ",
};

const stageConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  writing: { label: "كتابة", icon: Pen, color: "text-blue-600", bg: "bg-blue-500", border: "border-blue-400" },
  new_form: { label: "نموذج جديد", icon: FileText, color: "text-purple-600", bg: "bg-purple-500", border: "border-purple-400" },
  auditing: { label: "تدقيق", icon: FileSearch, color: "text-amber-600", bg: "bg-amber-500", border: "border-amber-400" },
  printing: { label: "طباعة", icon: Printer, color: "text-teal-600", bg: "bg-teal-500", border: "border-teal-400" },
  done: { label: "منجز", icon: CircleCheckBig, color: "text-emerald-600", bg: "bg-emerald-500", border: "border-emerald-400" },
};

const pptStages = [
  { key: "not_done", label: "غير منجز" },
  { key: "pdf", label: "PDF" },
  { key: "ppt", label: "بوربوينت" },
  { key: "done", label: "منجز" },
];

const curriculumStages = [
  { key: "writing", label: "كتابة" },
  { key: "new_form", label: "نموذج جديد" },
  { key: "auditing", label: "تدقيق" },
  { key: "printing", label: "طباعة" },
  { key: "done", label: "منجز" },
];

const computeCurriculumStage = (item: CurriculumItem): string => {
  if (item.printed || item.hard_copy_printed) return "done";
  if (item.audit_status === "done" || item.audit_status === "approved") return "printing";
  const writtenInNew = item.form_type === "new" && (
    !!item.goals?.trim() || !!item.target_audience?.trim() ||
    (item.hours || 0) > 0 || !!item.trainer_name?.trim()
  );
  if (item.form_type === "new" && (item.audit_status === "in_progress" || writtenInNew)) return "auditing";
  if (item.form_type === "new") return "new_form";
  return "writing";
};

const computePptStage = (item: CurriculumItem): string => {
  const curDone = computeCurriculumStage(item) === "done";
  if (curDone && item.presentation_uploaded) return "done";
  if (item.presentation_uploaded) return "ppt";
  if (item.file_url && item.file_type === "pdf") return "pdf";
  return "not_done";
};

const isItemIncomplete = (item: CurriculumItem): boolean => {
  return !item.goals || !item.target_audience || !item.trainer_name || item.hours === 0;
};

const getCompletionPercent = (item: CurriculumItem): number => {
  let filled = 0;
  const total = 8;
  if (item.title?.trim()) filled++;
  if (item.goals?.trim()) filled++;
  if (item.target_audience?.trim()) filled++;
  if (item.trainer_name?.trim()) filled++;
  if ((item.hours || 0) > 0) filled++;
  if (item.audit_status && item.audit_status !== "not_started") filled++;
  if (item.report_uploaded) filled++;
  if (item.presentation_uploaded) filled++;
  return Math.round((filled / total) * 100);
};

const Curriculum = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "all";
  const initialStage = searchParams.get("stage") || "";
  const initialPptStage = searchParams.get("ppt_stage") || "";
  const dashboardFilter = searchParams.get("filter") || "";
  const { data: items, loading, refetch } = useCurriculumItems();
  const { data: employees } = useEmployees();
  const { canEditCurriculum, userName, isIndividual, has } = useUserRole();
  const [viewMode, setViewMode] = useState<"all" | "curriculum" | "ppt">(
    initialPptStage ? "ppt" : initialStage ? "curriculum" : initialTab === "ppt" ? "ppt" : initialTab === "curriculum" ? "curriculum" : "all"
  );
  const [displayMode, setDisplayMode] = useState<"grid" | "table" | "pipeline">("grid");
  const [filterTab, setFilterTab] = useState(dashboardFilter === "missing_report" ? "incomplete" : dashboardFilter === "missing_ppt" ? "incomplete" : "all");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<CurriculumItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);
  const [selectedStage, setSelectedStage] = useState<string | null>(initialStage || initialPptStage || null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(true);

  const filtered = items.filter((i) => {
    if (i.privacy_level === "private" && isIndividual) return false;
    if (viewMode === "ppt" && !i.presentation_uploaded && i.ppt_type === "new") { }
    if (filterTab === "all") return true;
    if (filterTab === "completed") return i.status === "applied" && i.report_uploaded;
    if (filterTab === "incomplete") return i.status === "applied" && !i.report_uploaded;
    if (filterTab === "not_applied") return i.status === "not_applied";
    return true;
  });

  const filteredByStage = useMemo(() => {
    if (!selectedStage) return filtered;
    if (viewMode === "curriculum") return filtered.filter(i => computeCurriculumStage(i) === selectedStage);
    if (viewMode === "ppt") return filtered.filter(i => computePptStage(i) === selectedStage);
    return filtered;
  }, [filtered, selectedStage, viewMode]);

  const getCompletionStatus = (item: typeof items[0]) => {
    if (isItemIncomplete(item)) return { label: "ناقص - بيانات مفقودة", variant: "danger" as const };
    const stage = computeCurriculumStage(item);
    if (stage === "done" && item.presentation_uploaded) return { label: "مكتمل", variant: "success" as const };
    if (stage === "done") return { label: "منهج منجز - عرض ناقص", variant: "warning" as const };
    if (item.status === "applied" && !item.report_uploaded) return { label: "ناقص - بدون تقرير", variant: "danger" as const };
    return { label: curriculumStages.find(s => s.key === stage)?.label || "قيد العمل", variant: "neutral" as const };
  };

  const openCreate = () => { setEditingItem(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (item: CurriculumItem) => {
    setEditingItem(item);
    setForm({
      title: item.title, goals: item.goals, target_audience: item.target_audience,
      count: item.count, training_style: item.training_style, type: item.type, status: item.status,
      printed: item.printed || false, form_type: item.form_type || "new", ppt_type: item.ppt_type || "new",
      executor_type: item.executor_type || "internal", executor_name: item.executor_name || "",
      hours: item.hours || 0, applied: item.applied || false,
      location: item.location || "", trainer_name: item.trainer_name || "",
      audience_count: item.audience_count || 0, audit_status: item.audit_status || "not_started",
      hard_copy_printed: item.hard_copy_printed || false,
      privacy_level: item.privacy_level || "public",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: "خطأ", description: "العنوان مطلوب", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload: Record<string, unknown> = {
      title: form.title, goals: form.goals, target_audience: form.target_audience,
      count: form.count, training_style: form.training_style, type: form.type, status: form.status,
      printed: form.printed, form_type: form.form_type, ppt_type: form.ppt_type,
      executor_type: form.executor_type, executor_name: form.executor_name, hours: form.hours,
      applied: form.applied, location: form.location, trainer_name: form.trainer_name,
      audience_count: form.audience_count, audit_status: form.audit_status,
      hard_copy_printed: form.hard_copy_printed,
      privacy_level: form.privacy_level,
    };
    if (editingItem) {
      localDb.curriculumItems.update(editingItem.id, payload);
      await logAction(userName, "تعديل منهج", form.title);
      toast({ title: "تم", description: "تم تحديث المنهج" });
    } else {
      localDb.curriculumItems.insert(payload);
      await logAction(userName, "إنشاء منهج", form.title);
      toast({ title: "تم", description: "تم إنشاء المنهج" });
    }
    setSaving(false);
    setShowForm(false);
    refetch();
  };

  const handleFileUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "pptx", "ppt"].includes(ext || "")) {
      toast({ title: "خطأ", description: "يُسمح فقط بملفات PDF أو PPT", variant: "destructive" });
      return;
    }
    localDb.curriculumItems.update(id, {
      file_url: `local://${file.name}`,
      file_type: ext === "pdf" ? "pdf" : "ppt",
      report_uploaded: true,
    });
    await logAction(userName, "رفع ملف منهج", `${id}`);
    toast({ title: "تم", description: "تم رفع الملف بنجاح" });
    setUploadingFile(null);
    refetch();
  };

  const handleUploadPresentation = async (id: string) => {
    localDb.curriculumItems.update(id, { presentation_uploaded: true });
    await logAction(userName, "رفع عرض تقديمي", `${id}`);
    toast({ title: "تم", description: "تم رفع العرض التقديمي" });
    refetch();
  };

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
        let imported = 0;
        const errors: string[] = [];
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const payload: Record<string, unknown> = {
            title: row["العنوان"] || row["title"] || "",
            printed: row["مطبوع"] === "نعم" || row["printed"] === "Yes",
            form_type: row["الفورمة"] === "قديمة" || row["form_type"] === "old" ? "old" : "new",
            ppt_type: row["البوربوينت"] === "قديم" || row["ppt_type"] === "old" ? "old" : "new",
            target_audience: row["الفئات المستهدفة"] || row["target_audience"] || "",
            goals: row["الأهداف"] || row["goals"] || "",
            executor_type: row["الجهة المنفذة"] === "خارجية" || row["executor_type"] === "external" ? "external" : "internal",
            executor_name: row["اسم المنفذ"] || row["executor_name"] || "",
            hours: Number(row["الساعات"] || row["hours"] || 0),
            applied: row["التطبيق"] === "مطبق" || row["applied"] === "Yes",
            status: (row["التطبيق"] === "مطبق" || row["applied"] === "Yes") ? "applied" : "not_applied",
            location: row["المكان"] || row["location"] || "",
            trainer_name: row["المدرب"] || row["trainer_name"] || "",
            audience_count: Number(row["عدد الفئة المستهدفة"] || row["audience_count"] || 0),
            audit_status: row["التدقيق"] === "تم" ? "done" : row["التدقيق"] === "جاري" ? "in_progress" : "not_started",
            hard_copy_printed: row["نسخة مطبوعة"] === "نعم" || row["hard_copy_printed"] === "Yes",
            count: Number(row["العدد"] || row["count"] || 1),
            training_style: row["أسلوب التدريب"] || row["training_style"] || "نظري",
            type: row["النوع"] === "تخصصي" || row["type"] === "specialized" ? "specialized" : "developmental",
          };
          if (!payload.title || !String(payload.title).trim()) continue;
          localDb.curriculumItems.insert(payload);
          imported++;
        }
        await logAction(userName, "استيراد من Excel", `${imported} منهج`);
        if (errors.length > 0) {
          toast({ title: "تحذير", description: `تم استيراد ${imported} منهج، فشل ${errors.length} صف: ${errors[0]}`, variant: "destructive" });
        } else {
          toast({ title: "تم", description: `تم استيراد ${imported} منهج من Excel` });
        }
        refetch();
      } catch (err: unknown) {
        console.error("Excel import error:", err);
        toast({ title: "خطأ", description: `فشل قراءة ملف Excel: ${err instanceof Error ? err.message : "خطأ غير معروف"}`, variant: "destructive" });
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  const getItemsByStage = (stage: string) => {
    if (["writing", "new_form", "auditing", "printing", "done"].includes(stage) && viewMode === "curriculum") {
      return items.filter(i => computeCurriculumStage(i) === stage);
    }
    if (["not_done", "pdf", "ppt", "done"].includes(stage) && viewMode === "ppt") {
      return items.filter(i => computePptStage(i) === stage);
    }
    return items.filter(i => i.current_stage === stage);
  };

  const formCompletionPercent = useMemo(() => {
    let filled = 0;
    const total = 7;
    if (form.title?.trim()) filled++;
    if (form.goals?.trim()) filled++;
    if (form.target_audience?.trim()) filled++;
    if (form.trainer_name?.trim()) filled++;
    if ((form.hours || 0) > 0) filled++;
    if (form.audit_status && form.audit_status !== "not_started") filled++;
    if (form.applied) filled++;
    return Math.round((filled / total) * 100);
  }, [form]);

  const stageChartData = useMemo(() => {
    return curriculumStages.map(s => ({
      name: s.label,
      value: items.filter(i => computeCurriculumStage(i) === s.key).length,
      key: s.key,
    }));
  }, [items]);

  const completionPieData = useMemo(() => {
    const completed = items.filter(i => computeCurriculumStage(i) === "done" && i.presentation_uploaded).length;
    const incomplete = items.length - completed;
    return [
      { name: "مكتمل", value: completed, color: "hsl(142, 71%, 40%)" },
      { name: "غير مكتمل", value: incomplete, color: "hsl(38, 92%, 50%)" },
    ];
  }, [items]);

  const PIE_COLORS = ["hsl(142, 71%, 40%)", "hsl(38, 92%, 50%)"];

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const pipelineStages = viewMode === "ppt" ? pptStages : curriculumStages;

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <PageHeader title="المناهج والعروض" subtitle="إدارة المناهج التدريبية والعروض التقديمية" icon={BookOpen} sections={[
        { id: "stats_cards", label: "الإحصائيات" },
        { id: "curriculum_list", label: "قائمة المناهج" },
        { id: "stage_view", label: "عرض المراحل" },
      ]} exportData={() => ({
        filename: "curriculum",
        rows: filtered.map(c => ({ العنوان: c.title, الأهداف: c.goals || "", الفئة: c.target_audience || "", المدرب: c.trainer_name || "", الساعات: c.hours || 0, المكان: c.location || "", المرحلة: computeCurriculumStage(c), التقرير: c.report_uploaded ? "نعم" : "لا", العرض: c.presentation_uploaded ? "نعم" : "لا" }))
      })} />

      <div className="glass rounded-2xl p-4 md:p-5 border border-border animate-slide-up">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-bold gradient-text">ورشة المناهج</h2>
            <p className="text-xs text-muted-foreground mt-1">تتبع مراحل المناهج من الكتابة حتى الإنجاز</p>
          </div>
          <div className="flex items-center gap-2 no-print flex-wrap">
            <input type="file" ref={excelInputRef} accept=".xlsx,.xls" className="hidden" onChange={handleExcelImport} />
            {!isIndividual && has("import_curriculum_excel") && (
              <Button variant="outline" size="sm" className="gap-2" onClick={() => excelInputRef.current?.click()}>
                <FileSpreadsheet className="w-4 h-4" />استيراد
              </Button>
            )}
            <Button variant="outline" size="sm" className="gap-2" onClick={() => {
              const { rows, filename } = {
                filename: "curriculum",
                rows: filtered.map(c => ({ العنوان: c.title, الأهداف: c.goals || "", الفئة: c.target_audience || "", المدرب: c.trainer_name || "", الساعات: c.hours || 0, المكان: c.location || "", المرحلة: computeCurriculumStage(c), التقرير: c.report_uploaded ? "نعم" : "لا", العرض: c.presentation_uploaded ? "نعم" : "لا" }))
              };
              if (!rows.length) return;
              const ws = XLSX.utils.json_to_sheet(rows);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
              XLSX.writeFile(wb, `${filename}.xlsx`);
            }}>
              <Upload className="w-4 h-4" />تصدير
            </Button>
            {canEditCurriculum && has("add_curriculum") && <Button size="sm" className="gap-2" onClick={openCreate}><Plus className="w-4 h-4" />منهج جديد</Button>}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
          {curriculumStages.map((stage, idx) => {
            const cfg = stageConfig[stage.key];
            const count = items.filter(i => computeCurriculumStage(i) === stage.key).length;
            const IconComp = cfg?.icon || BookOpen;
            return (
              <div key={stage.key} className={`flex items-center gap-1 animate-slide-up delay-${(idx + 1) * 75}`}>
                {idx > 0 && <ChevronLeft className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />}
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${cfg?.border || "border-border"} ${cfg?.bg || "bg-muted"}/10 text-xs font-medium ${cfg?.color || "text-foreground"} transition-all hover:shadow-sm`}>
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{stage.label}</span>
                  <span className={`inline-flex items-center justify-center min-w-[20px] h-5 rounded-full ${cfg?.bg || "bg-muted"} text-white text-[10px] font-bold px-1.5`}>{count}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3 no-print">
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "all" as const, label: "إدخال البيانات" },
            { key: "curriculum" as const, label: "مراحل المناهج" },
            { key: "ppt" as const, label: "مراحل العروض" },
          ].map(t => (
            <button key={t.key} onClick={() => { setViewMode(t.key); setSelectedStage(null); }}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${viewMode === t.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              {t.label}
            </button>
          ))}
        </div>
        {viewMode === "all" && (
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {[
              { key: "grid" as const, icon: LayoutGrid },
              { key: "table" as const, icon: Table2 },
              { key: "pipeline" as const, icon: GitBranch },
            ].map(m => (
              <button key={m.key} onClick={() => setDisplayMode(m.key)}
                className={`p-2 rounded-md transition-colors ${displayMode === m.key ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                <m.icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        )}
      </div>

      {viewMode === "all" && (
        <button onClick={() => setShowStats(!showStats)} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors no-print">
          <Eye className="w-4 h-4" />
          {showStats ? "إخفاء الإحصائيات" : "عرض الإحصائيات"}
        </button>
      )}

      {viewMode === "all" && showStats && (
        <div data-print-section="stats_cards" className="space-y-4 animate-slide-up">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3 card-hover">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-success" /></div>
              <div><p className="text-2xl font-bold text-foreground">{items.filter(i => i.status === "applied" && i.report_uploaded).length}</p><p className="text-xs text-muted-foreground">مناهج مكتملة</p></div>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3 card-hover">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center"><XCircle className="w-5 h-5 text-destructive" /></div>
              <div><p className="text-2xl font-bold text-foreground">{items.filter(i => i.status === "applied" && !i.report_uploaded).length}</p><p className="text-xs text-muted-foreground">ناقصة</p></div>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3 card-hover">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center"><BookOpen className="w-5 h-5 text-muted-foreground" /></div>
              <div><p className="text-2xl font-bold text-foreground">{items.filter(i => i.status === "not_applied").length}</p><p className="text-xs text-muted-foreground">غير مطبقة</p></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card rounded-xl border border-border p-4">
              <h4 className="text-sm font-bold text-foreground mb-3">المناهج حسب المرحلة</h4>
              {items.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={stageChartData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {stageChartData.map((entry) => (
                        <Cell key={entry.key} fill={
                          entry.key === "writing" ? "#3b82f6" :
                          entry.key === "new_form" ? "#8b5cf6" :
                          entry.key === "auditing" ? "#f59e0b" :
                          entry.key === "printing" ? "#14b8a6" :
                          "#10b981"
                        } />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-xs text-muted-foreground text-center py-8">لا توجد بيانات</p>}
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <h4 className="text-sm font-bold text-foreground mb-3">نسبة الإكمال</h4>
              {items.length > 0 ? (
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={completionPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={3} dataKey="value">
                        {completionPieData.map((entry, i) => (
                          <Cell key={entry.name} fill={PIE_COLORS[i]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : <p className="text-xs text-muted-foreground text-center py-8">لا توجد بيانات</p>}
              <div className="flex items-center justify-center gap-4 mt-2">
                {completionPieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                    <span className="text-muted-foreground">{d.name}: {d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {(viewMode === "curriculum" || viewMode === "ppt") && (
        <div data-print-section="stage_view" className="space-y-4">
          <div className="flex gap-2 flex-wrap justify-center">
            {pipelineStages.map((stage, i, arr) => {
              const count = getItemsByStage(stage.key).length;
              const isSelected = selectedStage === stage.key;
              const cfg = stageConfig[stage.key];
              const IconComp = cfg?.icon || FileText;
              return (
                <div key={stage.key} className={`flex items-center gap-2 animate-slide-up delay-${(i + 1) * 75}`}>
                  <button
                    onClick={() => setSelectedStage(isSelected ? null : stage.key)}
                    className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl border-2 transition-all cursor-pointer ${isSelected ? "border-primary bg-primary/10 shadow-lg" : "border-border bg-card hover:border-primary/50 hover:shadow-md"}`}
                  >
                    <IconComp className={`w-5 h-5 ${cfg?.color || "text-muted-foreground"}`} />
                    <span className="text-2xl font-bold text-primary">{count}</span>
                    <span className="text-xs font-medium text-foreground">{stage.label}</span>
                  </button>
                  {i < arr.length - 1 && <ChevronLeft className="w-5 h-5 text-muted-foreground" />}
                </div>
              );
            })}
          </div>

          {selectedStage && (
            <div className="bg-card border border-border rounded-xl p-4 animate-fade-in">
              <h3 className="text-sm font-bold text-foreground mb-3">
                {pipelineStages.find(s => s.key === selectedStage)?.label} ({getItemsByStage(selectedStage).length})
              </h3>
              <div className="space-y-2">
                {getItemsByStage(selectedStage).length > 0 ? getItemsByStage(selectedStage).map(item => {
                  const stage = computeCurriculumStage(item);
                  const cfg = stageConfig[stage];
                  const pct = getCompletionPercent(item);
                  return (
                    <div key={item.id} className="flex items-center justify-between bg-primary/5 rounded-lg px-3 py-2 card-hover cursor-pointer" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                      <div className="flex items-center gap-2 min-w-0">
                        {cfg && <div className={`w-1 h-8 rounded-full ${cfg.bg} flex-shrink-0`} />}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                          <p className="text-[10px] text-muted-foreground">{item.executor_type === "internal" ? "داخلي" : "خارجي"} - {item.hours} ساعة</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-16">
                          <Progress value={pct} className="h-1.5" />
                        </div>
                        <span className="text-[10px] text-muted-foreground">{pct}%</span>
                        {canEditCurriculum && (
                          <button onClick={(e) => { e.stopPropagation(); openEdit(item); }} className="p-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20"><Pencil className="w-3.5 h-3.5" /></button>
                        )}
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-sm text-muted-foreground text-center py-4">لا توجد عناصر في هذه المرحلة</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {viewMode === "all" && (
        <>
          <div className="flex gap-2 flex-wrap no-print">
            {[
              { key: "all", label: "الكل" },
              { key: "completed", label: "مكتملة" },
              { key: "incomplete", label: "ناقصة" },
              { key: "not_applied", label: "غير مطبقة" },
            ].map(t => (
              <button key={t.key} onClick={() => setFilterTab(t.key)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterTab === t.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{t.label}</button>
            ))}
          </div>

          {displayMode === "grid" && (
            <div data-print-section="curriculum_list" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredByStage.length > 0 ? filteredByStage.map(item => {
                const stage = computeCurriculumStage(item);
                const cfg = stageConfig[stage];
                const pct = getCompletionPercent(item);
                const completion = getCompletionStatus(item);
                const isExpanded = expandedId === item.id;
                const IconComp = cfg?.icon || BookOpen;
                return (
                  <div key={item.id} className={`bg-card rounded-xl border border-border overflow-hidden card-hover animate-fade-in ${isExpanded ? "row-span-2" : ""}`}>
                    <div className={`h-1.5 ${cfg?.bg || "bg-muted"}`} />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-foreground text-sm truncate flex items-center gap-2">
                            {item.privacy_level === "private" && <span title="سري/خاص"><Lock className="w-3.5 h-3.5 text-warning" /></span>}
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-1">
                            {item.target_audience && <span className="badge-info text-[10px] px-1.5 py-0.5 truncate max-w-[120px]">{item.target_audience}</span>}
                            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${cfg?.bg || "bg-muted"}/10 ${cfg?.color || "text-muted-foreground"} border ${cfg?.border || "border-border"}`}>
                              <IconComp className="w-3 h-3" />{cfg?.label || stage}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 no-print flex-shrink-0">
                          {item.report_uploaded ? <CheckCircle2 className="w-4 h-4 text-success" /> : <XCircle className="w-4 h-4 text-muted-foreground/40" />}
                          {item.presentation_uploaded ? <Presentation className="w-4 h-4 text-success" /> : <Presentation className="w-4 h-4 text-muted-foreground/40" />}
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                          <span>الإنجاز</span>
                          <span>{pct}%</span>
                        </div>
                        <Progress value={pct} className="h-1.5" />
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-border gap-2">
                        <StatusBadge status={completion.label} variant={completion.variant} />
                        <div className="flex gap-1 no-print">
                          <button onClick={() => setExpandedId(isExpanded ? null : item.id)} className="p-1.5 rounded-md bg-muted text-muted-foreground hover:bg-muted/80"><Eye className="w-3.5 h-3.5" /></button>
                          {canEditCurriculum && <button onClick={() => openEdit(item)} className="p-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20"><Pencil className="w-3.5 h-3.5" /></button>}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-border space-y-2 text-xs animate-fade-in">
                          <div className="grid grid-cols-2 gap-2">
                            <div><span className="text-muted-foreground">الأهداف:</span> <span className="text-foreground">{item.goals || "-"}</span></div>
                            <div><span className="text-muted-foreground">المدرب:</span> <span className="text-foreground">{item.trainer_name || "-"}</span></div>
                            <div><span className="text-muted-foreground">المنفذ:</span> <span className="text-foreground">{item.executor_type === "internal" ? "داخلي" : "خارجي"}{item.executor_name ? ` - ${item.executor_name}` : ""}</span></div>
                            <div><span className="text-muted-foreground">الساعات:</span> <span className="text-foreground">{item.hours}</span></div>
                            <div><span className="text-muted-foreground">التدقيق:</span> <StatusBadge status={auditStatusLabels[item.audit_status] || item.audit_status} variant={item.audit_status === "done" ? "success" : item.audit_status === "in_progress" ? "warning" : "neutral"} /></div>
                            <div><span className="text-muted-foreground">المكان:</span> <span className="text-foreground">{item.location || "-"}</span></div>
                          </div>
                          <div className="flex items-center gap-3 pt-1">
                            {item.report_uploaded ? (
                              <div className="flex items-center gap-1 text-success text-xs">
                                <FileText className="w-3.5 h-3.5" />تقرير مرفوع
                                {item.file_url && <a href={item.file_url} target="_blank" className="text-primary hover:underline mr-1">عرض</a>}
                              </div>
                            ) : item.audit_status !== "not_started" ? (
                              <div className="no-print">
                                <input type="file" ref={fileInputRef} accept=".pdf,.ppt,.pptx" className="hidden" onChange={(e) => handleFileUpload(item.id, e)} />
                                <button onClick={() => { setUploadingFile(item.id); fileInputRef.current?.click(); }} className="flex items-center gap-1 text-xs text-primary hover:underline"><Upload className="w-3.5 h-3.5" />{item.audit_status === "done" ? "النسخة النهائية" : "مسودة"}</button>
                              </div>
                            ) : null}
                            {item.presentation_uploaded ? (
                              <div className="flex items-center gap-1 text-success text-xs"><Presentation className="w-3.5 h-3.5" />عرض مرفوع</div>
                            ) : (
                              <button onClick={() => handleUploadPresentation(item.id)} className="flex items-center gap-1 text-xs text-primary hover:underline no-print"><Upload className="w-3.5 h-3.5" />رفع عرض</button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }) : (
                <div className="col-span-full text-center py-12 text-muted-foreground">لا توجد مناهج</div>
              )}
            </div>
          )}

          {displayMode === "table" && (
            <div data-print-section="curriculum_list" className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead><tr>
                    <th>العنوان</th><th>مطبوع</th><th>الفورمة</th><th>PPT</th><th>المنفذ</th><th>الساعات</th><th>التطبيق</th><th>التدقيق</th><th>التقرير</th><th>العرض</th><th>مطبوع ورقي</th><th>الاكتمال</th>{canEditCurriculum && <th className="no-print">تعديل</th>}
                  </tr></thead>
                  <tbody>
                    {filteredByStage.length > 0 ? filteredByStage.map(item => {
                      const completion = getCompletionStatus(item);
                      return (
                        <tr key={item.id}>
                          <td className="font-medium text-foreground">{item.title}</td>
                          <td>{item.printed ? "نعم" : "لا"}</td>
                          <td>{item.form_type === "new" ? "جديدة" : "قديمة"}</td>
                          <td>{item.ppt_type === "new" ? "جديد" : "قديم"}</td>
                          <td className="text-muted-foreground">{item.executor_type === "internal" ? "داخلي" : "خارجي"}{item.executor_name ? ` - ${item.executor_name}` : ""}</td>
                          <td className="text-center">{item.hours}</td>
                          <td><StatusBadge status={item.applied ? "مطبق" : "غير مطبق"} variant={item.applied ? "success" : "neutral"} /></td>
                          <td><StatusBadge status={auditStatusLabels[item.audit_status] || item.audit_status} variant={item.audit_status === "done" ? "success" : item.audit_status === "in_progress" ? "warning" : "neutral"} /></td>
                          <td>
                            {item.report_uploaded ? (
                              <div className="flex items-center gap-1 text-success text-xs">
                                <FileText className="w-3.5 h-3.5" />مرفوع
                                {item.file_url && <a href={item.file_url} target="_blank" className="text-primary hover:underline mr-1">عرض</a>}
                              </div>
                            ) : (
                              item.audit_status !== "not_started" ? (
                                <div className="no-print">
                                  <input type="file" ref={fileInputRef} accept=".pdf,.ppt,.pptx" className="hidden" onChange={(e) => handleFileUpload(item.id, e)} />
                                  <button onClick={() => { setUploadingFile(item.id); fileInputRef.current?.click(); }} className="flex items-center gap-1 text-xs text-primary hover:underline"><Upload className="w-3.5 h-3.5" />{item.audit_status === "done" ? "النسخة النهائية" : "مسودة"}</button>
                                </div>
                              ) : <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </td>
                          <td>{item.presentation_uploaded ? <div className="flex items-center gap-1 text-success text-xs"><Presentation className="w-3.5 h-3.5" />مرفوع</div> : <span className="no-print"><button onClick={() => handleUploadPresentation(item.id)} className="flex items-center gap-1 text-xs text-primary hover:underline"><Upload className="w-3.5 h-3.5" />رفع</button></span>}</td>
                          <td>{item.hard_copy_printed ? "نعم" : "لا"}</td>
                          <td><StatusBadge status={completion.label} variant={completion.variant} /></td>
                          {canEditCurriculum && <td className="no-print"><button onClick={() => openEdit(item)} className="p-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20"><Pencil className="w-3.5 h-3.5" /></button></td>}
                        </tr>
                      );
                    }) : (
                      <tr><td colSpan={canEditCurriculum ? 13 : 12} className="text-center py-8 text-muted-foreground">لا توجد مناهج</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {displayMode === "pipeline" && (
            <div data-print-section="curriculum_list" className="space-y-4">
              {curriculumStages.map(stage => {
                const cfg = stageConfig[stage.key];
                const stageItems = filteredByStage.filter(i => computeCurriculumStage(i) === stage.key);
                const IconComp = cfg?.icon || BookOpen;
                if (stageItems.length === 0) return null;
                return (
                  <div key={stage.key} className="animate-slide-up">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 rounded-lg ${cfg?.bg || "bg-muted"}/10 flex items-center justify-center`}>
                        <IconComp className={`w-4 h-4 ${cfg?.color || "text-muted-foreground"}`} />
                      </div>
                      <span className="text-sm font-bold text-foreground">{cfg?.label || stage.label}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg?.bg || "bg-muted"} text-white`}>{stageItems.length}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 ms-4 border-s-2 border-dashed ps-4" style={{ borderColor: cfg?.bg ? `var(--tw-gradient-stops, currentColor)` : undefined }}>
                      {stageItems.map(item => {
                        const pct = getCompletionPercent(item);
                        return (
                          <div key={item.id} className="bg-card rounded-xl border border-border p-3 card-hover">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-foreground truncate">{item.title}</span>
                              <div className="flex items-center gap-1">
                                {item.report_uploaded ? <CheckCircle2 className="w-3.5 h-3.5 text-success" /> : <XCircle className="w-3.5 h-3.5 text-muted-foreground/30" />}
                                {item.presentation_uploaded ? <Presentation className="w-3.5 h-3.5 text-success" /> : <Presentation className="w-3.5 h-3.5 text-muted-foreground/30" />}
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-[10px] text-muted-foreground">{item.hours} ساعة</span>
                              <div className="w-12"><Progress value={pct} className="h-1" /></div>
                            </div>
                            {canEditCurriculum && (
                              <button onClick={() => openEdit(item)} className="mt-2 p-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 no-print"><Pencil className="w-3 h-3" /></button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {filteredByStage.length === 0 && <div className="text-center py-12 text-muted-foreground">لا توجد مناهج</div>}
            </div>
          )}
        </>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" dir="rtl">
          <DialogHeader><DialogTitle>{editingItem ? "تعديل المنهج" : "إدخال منهج / عرض جديد"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
              <span className="text-xs text-muted-foreground">نسبة إكمال البيانات</span>
              <div className="flex items-center gap-2">
                <Progress value={formCompletionPercent} className="w-24 h-1.5" />
                <span className="text-xs font-bold text-primary">{formCompletionPercent}%</span>
              </div>
            </div>

            <div className="border border-border rounded-lg p-3 space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Pen className="w-4 h-4 text-blue-500" />المعلومات الأساسية</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><Label>العنوان</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div className="col-span-2"><Label>الأهداف (مختصرة)</Label><Input value={form.goals} onChange={(e) => setForm({ ...form, goals: e.target.value })} /></div>
                <div><Label>الفئات المستهدفة</Label><Input value={form.target_audience} onChange={(e) => setForm({ ...form, target_audience: e.target.value })} /></div>
                <div><Label>عدد الساعات</Label><Input type="number" value={form.hours} onChange={(e) => setForm({ ...form, hours: Number(e.target.value) })} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center gap-2">
                  <Checkbox checked={form.printed} onCheckedChange={(c) => setForm({ ...form, printed: !!c })} id="printed" />
                  <Label htmlFor="printed">مطبوع (نعم/لا)</Label>
                </div>
                <div>
                  <Label>السرية</Label>
                  <Select value={form.privacy_level} onValueChange={(v) => setForm({ ...form, privacy_level: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="public">عام</SelectItem><SelectItem value="private">خاص/سري</SelectItem></SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>الفورمة</Label>
                  <Select value={form.form_type} onValueChange={(v) => setForm({ ...form, form_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="new">جديدة</SelectItem><SelectItem value="old">قديمة</SelectItem></SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>البوربوينت</Label>
                  <Select value={form.ppt_type} onValueChange={(v) => setForm({ ...form, ppt_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="new">جديد</SelectItem><SelectItem value="old">قديم</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>الجهة المنفذة</Label>
                  <Select value={form.executor_type} onValueChange={(v) => setForm({ ...form, executor_type: v, executor_name: "" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="internal">داخلية</SelectItem><SelectItem value="external">خارجية</SelectItem></SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{form.executor_type === "internal" ? "الأعداد (اختر من النظام)" : "اسم الشخص (خارجي)"}</Label>
                  {form.executor_type === "internal" ? (
                    <Select value={form.executor_name} onValueChange={(v) => setForm({ ...form, executor_name: v })}>
                      <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                      <SelectContent>
                        {employees.map(e => <SelectItem key={e.id} value={e.name}>{e.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={form.executor_name} onChange={(e) => setForm({ ...form, executor_name: e.target.value })} />
                  )}
                </div>
              </div>
            </div>

            <div className="border border-border rounded-lg p-3 space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><BookOpen className="w-4 h-4 text-teal-500" />التطبيق</h3>
              <div className="flex items-center gap-2">
                <Checkbox checked={form.applied} onCheckedChange={(c) => setForm({ ...form, applied: !!c, status: c ? "applied" : "not_applied" })} id="applied" />
                <Label htmlFor="applied">مطبق / غير مطبق</Label>
              </div>
              {form.applied && (
                <div className="grid grid-cols-3 gap-3">
                  <div><Label>المكان</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
                  <div><Label>اسم المدرب</Label><Input value={form.trainer_name} onChange={(e) => setForm({ ...form, trainer_name: e.target.value })} /></div>
                  <div><Label>عدد الفئة المستهدفة</Label><Input type="number" value={form.audience_count} onChange={(e) => setForm({ ...form, audience_count: Number(e.target.value) })} /></div>
                </div>
              )}
            </div>

            <div className="border border-border rounded-lg p-3 space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><FileSearch className="w-4 h-4 text-amber-500" />التدقيق والملفات</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>التدقيق</Label>
                  <Select value={form.audit_status} onValueChange={(v) => setForm({ ...form, audit_status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="done">تم</SelectItem>
                      <SelectItem value="in_progress">جاري</SelectItem>
                      <SelectItem value="not_started">لم يتم</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>أسلوب التدريب</Label>
                  <Select value={form.training_style} onValueChange={(v) => setForm({ ...form, training_style: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="نظري">نظري</SelectItem><SelectItem value="عملي">عملي</SelectItem><SelectItem value="نظري وعملي">نظري وعملي</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={form.hard_copy_printed} onCheckedChange={(c) => setForm({ ...form, hard_copy_printed: !!c })} id="hardcopy" />
                <Label htmlFor="hardcopy">مطبوع (نعم/لا) - نسخة ورقية</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                {form.audit_status === "done" ? "يمكن رفع النسخة النهائية من المنهاج المدقق (PDF/PPT)" :
                 form.audit_status === "in_progress" ? "يمكن رفع المسودة (PDF/PPT)" :
                 "لا يتوفر زر لرفع المنهاج المدقق"}
              </p>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingItem ? "تحديث" : "إنشاء"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Curriculum;
