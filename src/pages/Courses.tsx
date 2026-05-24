import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useCourses, useEmployees, type Course } from "@/hooks/useSupabaseData";
import { localDb } from "@/lib/localStore";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { logAction } from "@/lib/auditLog";
import { courseSchema } from "@/lib/validation";
import StatusBadge from "@/components/StatusBadge";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, MapPin, Calendar, User, Eye, DollarSign, Award, QrCode, Plus, Search, Loader2, Pencil, Trash2, ClipboardList, PlayCircle, CheckCircle, Users, TrendingUp, ChevronLeft, UserMinus, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { QRCodeSVG } from "qrcode.react";

const courseStatusLabels: Record<string, string> = { active: "نشطة", completed: "منتهية", planned: "مخططة" };

const statusConfig: Record<string, { color: string; bg: string; border: string; icon: React.ElementType }> = {
  planned: { color: "text-blue-600", bg: "bg-blue-500", border: "border-blue-400", icon: ClipboardList },
  active: { color: "text-emerald-600", bg: "bg-emerald-500", border: "border-emerald-400", icon: PlayCircle },
  completed: { color: "text-gray-500", bg: "bg-gray-500", border: "border-gray-400", icon: CheckCircle },
};

const emptyCourse = { title: "", code: "", type: "internal", training_type: "developmental", venue: "", start_date: "", end_date: "", trainer: "", supervisor: "", sponsor: "", status: "planned", estimated_budget: 0, actual_cost: 0 };

const Courses = () => {
  const { user } = useAuth();
  const { has } = useUserRole();
  const { data: courses, loading, refetch } = useCourses();
  const { data: employees } = useEmployees();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showCertificate, setShowCertificate] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [form, setForm] = useState(emptyCourse);
  const [saving, setSaving] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [qrData, setQrData] = useState<{url: string, title: string, roleName: string} | null>(null);

  // Barcode Hub State
  const [showBarcodeHub, setShowBarcodeHub] = useState(false);
  const [hubForm, setHubForm] = useState({ courseId: "", courseName: "", trainerName: "", supervisorName: "", extraInfo: "" });
  const [hubQrs, setHubQrs] = useState<any[]>([]);

  useEffect(() => {
    const focusId = searchParams.get("focus");
    if (focusId) {
      const found = courses.find(c => c.id === focusId);
      if (found) {
        setSelectedCourse(found);
        searchParams.delete("focus");
        setSearchParams(searchParams, { replace: true });
      }
    }
  }, [courses, searchParams, setSearchParams]);

  const filtered = courses.filter((c) => {
    const matchSearch = c.title.includes(search) || c.code.includes(search);
    const matchType = filterType === "all" || c.status === filterType;
    return matchSearch && matchType;
  });

  const lifecycleData = useMemo(() => [
    { key: "planned", label: "مخططة", count: courses.filter(c => c.status === "planned").length },
    { key: "active", label: "نشطة", count: courses.filter(c => c.status === "active").length },
    { key: "completed", label: "منتهية", count: courses.filter(c => c.status === "completed").length },
  ], [courses]);

  const totalTrainees = useMemo(() => courses.reduce((sum, c) => sum + (c.trainees?.length || 0), 0), [courses]);
  const completionRate = useMemo(() => {
    if (courses.length === 0) return 0;
    return Math.round((courses.filter(c => c.status === "completed").length / courses.length) * 100);
  }, [courses]);
  const totalBudget = useMemo(() => courses.reduce((sum, c) => sum + (c.estimated_budget || 0), 0), [courses]);
  const totalActual = useMemo(() => courses.reduce((sum, c) => sum + (c.actual_cost || 0), 0), [courses]);

  const statusPieData = useMemo(() => [
    { name: "مخططة", value: courses.filter(c => c.status === "planned").length, color: "#3b82f6" },
    { name: "نشطة", value: courses.filter(c => c.status === "active").length, color: "#10b981" },
    { name: "منتهية", value: courses.filter(c => c.status === "completed").length, color: "#6b7280" },
  ], [courses]);

  const openCreate = () => { setEditingCourse(null); setForm(emptyCourse); setShowForm(true); };
  const openEdit = (course: Course) => {
    setEditingCourse(course);
    setForm({ title: course.title, code: course.code, type: course.type, training_type: course.training_type, venue: course.venue, start_date: course.start_date || "", end_date: course.end_date || "", trainer: course.trainer, supervisor: course.supervisor, sponsor: course.sponsor, status: course.status, estimated_budget: course.estimated_budget, actual_cost: course.actual_cost });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!has(editingCourse ? "edit_course" : "add_course")) {
      toast({ title: "خطأ", description: "ليس لديك صلاحية حفظ دورة", variant: "destructive" });
      return;
    }
    const result = courseSchema.safeParse(form);
    if (!result.success) {
      toast({ title: "خطأ", description: result.error.errors[0].message, variant: "destructive" });
      return;
    }
    const validated = result.data;
    setSaving(true);
    try {
      if (editingCourse) {
        localDb.courses.update(editingCourse.id, validated);
        await logAction(user?.name || "مستخدم", "تعديل دورة", validated.title);
        toast({ title: "تم", description: "تم تحديث الدورة" });
      } else {
        localDb.courses.insert(validated);
        await logAction(user?.name || "مستخدم", "إضافة دورة", validated.title);
        toast({ title: "تم", description: "تم إنشاء الدورة بنجاح" });
      }
      setShowForm(false);
      setForm(emptyCourse);
      await refetch();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Error saving course:", err);
      toast({ title: "خطأ", description: message || "حدث خطأ أثناء الحفظ", variant: "destructive" });
    }
    setSaving(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!has("delete_course")) {
      toast({ title: "خطأ", description: "ليس لديك صلاحية حذف دورة", variant: "destructive" });
      return;
    }
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    localDb.courses.delete(id);
    await logAction(user?.name || "مستخدم", "حذف دورة", title);
    toast({ title: "تم", description: "تم حذف الدورة" });
    refetch();
  };

  const handleTraineeStatusChange = async (traineeId: string, traineeName: string, newStatus: string) => {
    if (!has("update_trainee_status")) {
      toast({ title: "خطأ", description: "ليس لديك صلاحية تحديث حالة المتدرب", variant: "destructive" });
      return;
    }
    const trainee = (selectedCourse?.trainees || []).find(t => t.id === traineeId);
    if (trainee?.employee_id === user?.id) {
      toast({ title: "خطأ", description: "لا يمكنك تغيير حالتك بنفسك", variant: "destructive" });
      return;
    }
    localDb.trainees.update(traineeId, { status: newStatus });
    await logAction(user?.name || "مستخدم", "تحديث حالة متدرب", traineeName);
    toast({ title: "تم", description: "تم تحديث حالة المتدرب" });
    if (selectedCourse) {
      setSelectedCourse({
        ...selectedCourse,
        trainees: (selectedCourse.trainees || []).map((t) => t.id === traineeId ? { ...t, status: newStatus } : t),
      });
    }
    refetch();
  };

  const handleAddTrainee = async () => {
    if (!has("add_course")) {
      toast({ title: "خطأ", description: "ليس لديك صلاحية إضافة متدرب", variant: "destructive" });
      return;
    }
    if (!selectedCourse) return;
    const name = prompt("اسم المتدرب:");
    if (!name?.trim()) return;
    const emp = employees.find((e: any) => e.name === name.trim());
    const traineeId = localDb.trainees.insert({
      name: name.trim(),
      course_id: selectedCourse.id,
      employee_id: emp?.id || null,
      status: "waiting",
    });
    if (selectedCourse) {
      setSelectedCourse({
        ...selectedCourse,
        trainees: [...(selectedCourse.trainees || []), { id: traineeId, name: name.trim(), employee_id: emp?.id || null, status: "waiting", course_id: selectedCourse.id }],
      });
    }
    await logAction(user?.name || "مستخدم", "إضافة متدرب", `${name.trim()} → ${selectedCourse.title}`);
    toast({ title: "تم", description: "تمت إضافة المتدرب" });
    refetch();
  };

  const handleRemoveTrainee = async (traineeId: string, traineeName: string) => {
    if (!has("delete_course")) {
      toast({ title: "خطأ", description: "ليس لديك صلاحية حذف متدرب", variant: "destructive" });
      return;
    }
    if (!confirm(`حذف المتدرب ${traineeName}؟`)) return;
    localDb.trainees.delete(traineeId);
    if (selectedCourse) {
      setSelectedCourse({
        ...selectedCourse,
        trainees: (selectedCourse.trainees || []).filter((t: any) => t.id !== traineeId),
      });
    }
    await logAction(user?.name || "مستخدم", "حذف متدرب", `${traineeName}`);
    toast({ title: "تم", description: "تم حذف المتدرب" });
    refetch();
  };

  const getCourseCompletionPercent = (course: Course) => {
    if (course.status === "completed") return 100;
    if (course.status === "planned") return 10;
    if (course.start_date && course.end_date) {
      const start = new Date(course.start_date).getTime();
      const end = new Date(course.end_date).getTime();
      const now = Date.now();
      if (end <= start) return 50;
      const pct = Math.round(((now - start) / (end - start)) * 100);
      return Math.max(0, Math.min(100, pct));
    }
    return 50;
  };

  const getBudgetPercent = (course: Course) => {
    if (!course.estimated_budget || course.estimated_budget === 0) return 0;
    return Math.min(100, Math.round((course.actual_cost / course.estimated_budget) * 100));
  };

  const downloadQR = (svgId: string, filename: string) => {
    const svg = document.getElementById(svgId) as unknown as SVGSVGElement;
    if (!svg) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    const xml = new XMLSerializer().serializeToString(svg);
    const svg64 = btoa(unescape(encodeURIComponent(xml)));
    img.src = "data:image/svg+xml;base64," + svg64;
    img.onload = () => {
      canvas.width = svg.clientWidth || 200;
      canvas.height = svg.clientHeight || 200;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const a = document.createElement("a");
        a.download = `${filename}.png`;
        a.href = canvas.toDataURL("image/png");
        a.click();
      }
    };
  };

  const handleGenerateHubQrs = () => {
    if (!hubForm.courseName) return toast({ title: "خطأ", description: "يجب إدخال اسم الدورة", variant: "destructive" });
    const cId = hubForm.courseId || ("custom-" + Date.now());
    const baseUrl = window.location.origin;
    const qrs = [
      { role: "trainee", title: "تقييم المتدرب للمدرب", filename: `باركود_متدرب_${hubForm.courseName.replace(/\s+/g, "_")}` },
      { role: "trainer", title: "تقييم المدرب للمتدرب", filename: `باركود_مدرب_${hubForm.courseName.replace(/\s+/g, "_")}` },
      { role: "supervisor", title: "تقييم المشرف", filename: `باركود_مشرف_${hubForm.courseName.replace(/\s+/g, "_")}` }
    ].map(t => {
      const url = new URL(`${baseUrl}/survey/${cId}/${t.role}`);
      url.searchParams.set("name", hubForm.courseName);
      if (hubForm.trainerName) url.searchParams.set("trainer", hubForm.trainerName);
      if (hubForm.supervisorName) url.searchParams.set("supervisor", hubForm.supervisorName);
      if (hubForm.extraInfo) url.searchParams.set("extraInfo", hubForm.extraInfo);
      return { ...t, url: url.toString(), id: `qr-${t.role}-${Date.now()}` };
    });
    setHubQrs(qrs);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <PageHeader title="التنفيذ التدريبي" subtitle="إدارة الدورات التدريبية والمتدربين" icon={GraduationCap} sections={[
        { id: "search_filter", label: "البحث والفلترة" },
        { id: "courses_list", label: "قائمة الدورات" },
      ]} exportData={() => ({
        filename: "courses",
        rows: filtered.map(c => ({ العنوان: c.title, الكود: c.code, النوع: c.type === "internal" ? "داخلي" : "خارجي", الحالة: courseStatusLabels[c.status] || c.status, البداية: c.start_date, النهاية: c.end_date, المدرب: c.trainer || "", الميزانية: c.estimated_budget, التكلفة: c.actual_cost }))
      })} />

      <div className="glass rounded-2xl p-4 md:p-5 border border-border animate-slide-up">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-bold gradient-text">مركز التنفيذ التدريبي</h2>
            <p className="text-xs text-muted-foreground mt-1">تخطيط وتنفيذ ومتابعة الدورات التدريبية</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-2 border-primary text-primary hover:bg-primary/10" onClick={() => {
              setShowBarcodeHub(true);
              setHubForm({ courseId: "", courseName: "", trainerName: "", supervisorName: "", extraInfo: "" });
              setHubQrs([]);
            }}>
              <QrCode className="w-4 h-4" />إنشاء باركود
            </Button>
            {has("add_course") && <Button size="sm" className="gap-2" onClick={openCreate}><Plus className="w-4 h-4" />دورة جديدة</Button>}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
          {lifecycleData.map((item, idx) => {
            const cfg = statusConfig[item.key];
            const IconComp = cfg?.icon || GraduationCap;
            return (
              <div key={item.key} className={`flex items-center gap-1 animate-slide-up delay-${(idx + 1) * 75}`}>
                {idx > 0 && <ChevronLeft className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />}
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${cfg?.border || "border-border"} ${cfg?.bg || "bg-muted"}/10 text-xs font-medium ${cfg?.color || "text-foreground"} transition-all hover:shadow-sm cursor-pointer`} onClick={() => setFilterType(filterType === item.key ? "all" : item.key)}>
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  <span className={`inline-flex items-center justify-center min-w-[20px] h-5 rounded-full ${cfg?.bg || "bg-muted"} text-white text-[10px] font-bold px-1.5`}>{item.count}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3">
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3 card-hover animate-slide-up delay-75">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center"><PlayCircle className="w-5 h-5 text-emerald-600" /></div>
          <div><p className="text-2xl font-bold text-foreground">{courses.filter(c => c.status === "active").length}</p><p className="text-xs text-muted-foreground">دورات نشطة</p></div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3 card-hover animate-slide-up delay-100">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="w-5 h-5 text-primary" /></div>
          <div><p className="text-2xl font-bold text-foreground">{totalTrainees}</p><p className="text-xs text-muted-foreground">إجمالي المتدربين</p></div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3 card-hover animate-slide-up delay-150">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-accent" /></div>
          <div><p className="text-2xl font-bold text-foreground">{completionRate}%</p><p className="text-xs text-muted-foreground">نسبة الإنجاز</p></div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3 card-hover animate-slide-up delay-200">
          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center"><DollarSign className="w-5 h-5 text-warning" /></div>
          <div><p className="text-2xl font-bold text-foreground">{totalBudget > 0 ? Math.round((totalActual / totalBudget) * 100) : 0}%</p><p className="text-xs text-muted-foreground">استهلاك الميزانية</p></div>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
        <div className="md:col-span-2 bg-card rounded-xl border border-border p-4">
          <h4 className="text-sm font-bold text-foreground mb-3">الدورات حسب الحالة</h4>
          {courses.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={lifecycleData}>
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {lifecycleData.map((entry) => (
                    <Cell key={entry.key} fill={entry.key === "planned" ? "#3b82f6" : entry.key === "active" ? "#10b981" : "#6b7280"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-xs text-muted-foreground text-center py-8">لا توجد بيانات</p>}
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <h4 className="text-sm font-bold text-foreground mb-3">توزيع الحالات</h4>
          {courses.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={35} outerRadius={50} paddingAngle={3} dataKey="value">
                    {statusPieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1 mt-2">
                {statusPieData.map(d => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <span className="text-muted-foreground flex-1">{d.name}</span>
                    <span className="font-bold text-foreground">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <p className="text-xs text-muted-foreground text-center py-8">لا توجد بيانات</p>}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center no-print">
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث..." className="ps-9" />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {["all", "active", "planned", "completed"].map((s) => (
            <button key={s} onClick={() => setFilterType(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${filterType === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              {s === "all" ? "الكل" : courseStatusLabels[s]}
            </button>
          ))}
        </div>
      </div>

      <div data-print-section="courses_list" className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 print-content">
        {filtered.length > 0 ? filtered.map((course) => {
          const cfg = statusConfig[course.status] || statusConfig.planned;
          const IconComp = cfg.icon;
          const budgetPct = getBudgetPercent(course);
          const completionPct = getCourseCompletionPercent(course);
          const isExpanded = expandedId === course.id;
          return (
            <div key={course.id} className={`bg-card rounded-xl border border-border overflow-hidden card-hover animate-fade-in ${isExpanded ? "md:col-span-2 xl:col-span-2" : ""}`}>
              <div className={`h-1.5 ${cfg.bg}`} />
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-foreground truncate">{course.title}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="badge-info text-[10px] px-1.5 py-0.5">{course.code}</span>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${cfg.bg}/10 ${cfg.color} border ${cfg.border}`}>
                        <IconComp className="w-3 h-3" />{courseStatusLabels[course.status] || course.status}
                      </span>
                      <span className="badge-neutral text-[10px] px-1.5 py-0.5">{course.type === "internal" ? "داخلي" : "خارجي"}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground mt-2">
                  <div className="flex items-center gap-2"><MapPin className="w-3 h-3 flex-shrink-0" /><span className="truncate">{course.venue}</span></div>
                  <div className="flex items-center gap-2"><Calendar className="w-3 h-3 flex-shrink-0" /><span>{course.start_date} → {course.end_date}</span></div>
                  <div className="flex items-center gap-2"><User className="w-3 h-3 flex-shrink-0" /><span className="truncate">المدرب: {course.trainer}</span></div>
                </div>

                <div className="mt-3 space-y-2">
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-0.5">
                      <span>الإنجاز</span><span>{completionPct}%</span>
                    </div>
                    <Progress value={completionPct} className="h-1.5" />
                  </div>
                  {course.estimated_budget > 0 && (
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-0.5">
                        <span>الميزانية</span><span>{budgetPct}%</span>
                      </div>
                      <Progress value={budgetPct} className="h-1.5" />
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-0.5">
                        <span>التقديرية: {course.estimated_budget.toLocaleString()} ر.س</span>
                        <span>الفعلية: {course.actual_cost.toLocaleString()} ر.س</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-border gap-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{(course.trainees || []).length} متدرب</span>
                  </div>
                  <div className="flex gap-1 no-print">
                    <Button variant="ghost" size="sm" className="gap-1 text-primary h-8 px-2" onClick={() => setExpandedId(isExpanded ? null : course.id)}><Eye className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="sm" className="gap-1 text-primary h-8 px-2" onClick={() => setSelectedCourse(course)}><GraduationCap className="w-3.5 h-3.5" /></Button>
                    {has("edit_course") && <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground h-8 px-2" onClick={() => openEdit(course)}><Pencil className="w-3.5 h-3.5" /></Button>}
                    {has("delete_course") && <Button variant="ghost" size="sm" className="gap-1 text-destructive h-8 px-2" onClick={() => handleDelete(course.id, course.title)}><Trash2 className="w-3.5 h-3.5" /></Button>}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-border space-y-3 text-xs animate-fade-in">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-muted/30 rounded-lg p-2"><p className="text-muted-foreground text-[10px]">المشرف</p><p className="font-semibold text-foreground text-xs">{course.supervisor || "-"}</p></div>
                      <div className="bg-muted/30 rounded-lg p-2"><p className="text-muted-foreground text-[10px]">الجهة الراعية</p><p className="font-semibold text-foreground text-xs">{course.sponsor || "-"}</p></div>
                      <div className="bg-muted/30 rounded-lg p-2"><p className="text-muted-foreground text-[10px]">نوع التدريب</p><p className="font-semibold text-foreground text-xs">{course.training_type === "developmental" ? "تطويري" : "تخصصي"}</p></div>
                      <div className="bg-muted/30 rounded-lg p-2">
                        <p className="text-muted-foreground text-[10px]">الملخص المالي</p>
                        <p className="font-semibold text-foreground text-xs">
                          {course.estimated_budget.toLocaleString()} / {course.actual_cost.toLocaleString()} ر.س
                        </p>
                      </div>
                    </div>
                    {(course.trainees || []).length > 0 && (
                      <div>
                        <p className="text-muted-foreground text-[10px] mb-1.5">المتدربون</p>
                        <div className="flex flex-wrap gap-1">
                          {(course.trainees || []).slice(0, 5).map(t => (
                            <span key={t.id} className={`text-[10px] px-1.5 py-0.5 rounded-full border ${t.status === "passed" ? "bg-success/10 border-success/20 text-success" : t.status === "failed" ? "bg-destructive/10 border-destructive/20 text-destructive" : "bg-muted border-border text-muted-foreground"}`}>{t.name}</span>
                          ))}
                          {(course.trainees || []).length > 5 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">+{(course.trainees || []).length - 5}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        }) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">لا توجد دورات</div>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto" dir="rtl">
          <DialogHeader><DialogTitle>{editingCourse ? "تعديل الدورة" : "دورة جديدة"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="border border-border rounded-lg p-3 space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><GraduationCap className="w-4 h-4 text-primary" />المعلومات الأساسية</h3>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3">
                <div><Label>العنوان</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div><Label>الرمز</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
                <div><Label>المكان</Label><Input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} /></div>
                <div><Label>الجهة الراعية</Label><Input value={form.sponsor} onChange={(e) => setForm({ ...form, sponsor: e.target.value })} /></div>
              </div>
            </div>

            <div className="border border-border rounded-lg p-3 space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Calendar className="w-4 h-4 text-teal-500" />الجدول الزمني</h3>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>تاريخ البدء</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
                <div><Label>تاريخ الانتهاء</Label><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
              </div>
            </div>

            <div className="border border-border rounded-lg p-3 space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><User className="w-4 h-4 text-amber-500" />الكادر</h3>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>المدرب</Label><Input value={form.trainer} onChange={(e) => setForm({ ...form, trainer: e.target.value })} /></div>
                <div><Label>المشرف</Label><Input value={form.supervisor} onChange={(e) => setForm({ ...form, supervisor: e.target.value })} /></div>
              </div>
            </div>

            <div className="border border-border rounded-lg p-3 space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><DollarSign className="w-4 h-4 text-warning" />المالية والحالة</h3>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>الميزانية التقديرية</Label><Input type="number" value={form.estimated_budget} onChange={(e) => setForm({ ...form, estimated_budget: Number(e.target.value) })} /></div>
                <div><Label>التكلفة الفعلية</Label><Input type="number" value={form.actual_cost} onChange={(e) => setForm({ ...form, actual_cost: Number(e.target.value) })} /></div>
                <div>
                  <Label>النوع</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="internal">داخلي</SelectItem><SelectItem value="external">خارجي</SelectItem></SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>الحالة</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="planned">مخططة</SelectItem><SelectItem value="active">نشطة</SelectItem><SelectItem value="completed">منتهية</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingCourse ? "تحديث" : "إنشاء"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" dir="rtl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><GraduationCap className="w-5 h-5 text-primary" />{selectedCourse?.title}</DialogTitle></DialogHeader>
          {selectedCourse && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["الرمز", selectedCourse.code],
                  ["النوع", `${selectedCourse.type === "internal" ? "داخلي" : "خارجي"} - ${selectedCourse.training_type === "developmental" ? "تطويري" : "تخصصي"}`],
                  ["المكان", selectedCourse.venue],
                  ["التاريخ", `${selectedCourse.start_date} - ${selectedCourse.end_date}`],
                  ["المدرب", selectedCourse.trainer],
                  ["المشرف", selectedCourse.supervisor],
                ].map(([label, value]) => (
                  <div key={label} className="bg-muted/50 rounded-lg p-3"><p className="text-muted-foreground text-xs">{label}</p><p className="font-semibold text-foreground text-sm">{value}</p></div>
                ))}
              </div>
              <div className="bg-muted/30 rounded-xl p-4 border border-border">
                <h4 className="font-bold text-foreground mb-3 flex items-center gap-2"><DollarSign className="w-4 h-4 text-accent" />البيانات المالية</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-muted-foreground">الميزانية</p><p className="text-lg font-bold text-foreground">{selectedCourse.estimated_budget.toLocaleString()} ر.س</p></div>
                  <div><p className="text-muted-foreground">الفعلية</p><p className="text-lg font-bold text-foreground">{selectedCourse.actual_cost.toLocaleString()} ر.س</p></div>
                </div>
                {selectedCourse.estimated_budget > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>استهلاك الميزانية</span>
                      <span>{Math.round((selectedCourse.actual_cost / selectedCourse.estimated_budget) * 100)}%</span>
                    </div>
                    <Progress value={Math.min(100, Math.round((selectedCourse.actual_cost / selectedCourse.estimated_budget) * 100))} className="h-2" />
                  </div>
                )}
              </div>
              
              <div className="bg-muted/30 rounded-xl p-4 border border-border">
                <h4 className="font-bold text-foreground mb-3 flex items-center gap-2"><QrCode className="w-4 h-4 text-primary" />استمارات التقييم (باركود)</h4>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => {
                    const url = new URL(`${window.location.origin}/survey/${selectedCourse.id}/trainee`);
                    url.searchParams.set("name", selectedCourse.title || "");
                    url.searchParams.set("date", selectedCourse.start_date || "");
                    setQrData({ url: url.toString(), title: selectedCourse.title, roleName: "المتدرب يقيم المدرب" });
                  }}>تقييم المتدرب للمدرب</Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    const url = new URL(`${window.location.origin}/survey/${selectedCourse.id}/trainer`);
                    url.searchParams.set("name", selectedCourse.title || "");
                    url.searchParams.set("date", selectedCourse.start_date || "");
                    setQrData({ url: url.toString(), title: selectedCourse.title, roleName: "المدرب يقيم المتدرب" });
                  }}>تقييم المدرب للمتدرب</Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    const url = new URL(`${window.location.origin}/survey/${selectedCourse.id}/supervisor`);
                    url.searchParams.set("name", selectedCourse.title || "");
                    url.searchParams.set("date", selectedCourse.start_date || "");
                    setQrData({ url: url.toString(), title: selectedCourse.title, roleName: "المشرف يقيم الدورة" });
                  }}>تقييم المشرف</Button>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-foreground mb-3 flex items-center gap-2"><User className="w-4 h-4 text-primary" />المتدربون ({(selectedCourse.trainees || []).length})
                  {has("add_course") && <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1 mr-auto" onClick={handleAddTrainee}><UserPlus className="w-3 h-3" />إضافة</Button>}
                </h4>
                {(selectedCourse.trainees || []).length > 0 ? (
                  <div className="space-y-2">
                    {(selectedCourse.trainees || []).map((trainee) => (
                      <div key={trainee.id} className="flex items-center justify-between bg-muted/30 rounded-lg p-3 border border-border">
                        <p className="font-medium text-foreground text-sm">{trainee.name}</p>
                        <div className="flex items-center gap-2">
                          {has("update_trainee_status") ? (
                            <Select value={trainee.status} onValueChange={(v) => handleTraineeStatusChange(trainee.id, trainee.name, v)}>
                              <SelectTrigger className="h-7 w-[120px] text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="passed">اجتاز</SelectItem>
                                <SelectItem value="failed">لم يجتز</SelectItem>
                                <SelectItem value="waiting">قيد الانتظار</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <StatusBadge status={trainee.status === "passed" ? "اجتاز" : trainee.status === "failed" ? "لم يجتز" : "قيد الانتظار"} />
                          )}
                          {trainee.status === "passed" && (
                            <button onClick={() => setShowCertificate(trainee.name)} className="p-1.5 rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-colors"><Award className="w-3.5 h-3.5" /></button>
                          )}
                          {has("delete_course") && (
                            <button onClick={() => handleRemoveTrainee(trainee.id, trainee.name)} className="p-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors" title="حذف"><UserMinus className="w-3.5 h-3.5" /></button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">لم يتم إضافة متدربين بعد</p>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!showCertificate} onOpenChange={() => setShowCertificate(null)}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader><DialogTitle>معاينة الشهادة</DialogTitle></DialogHeader>
          <div className="border-2 border-primary/20 rounded-xl p-8 text-center space-y-4 bg-gradient-to-b from-primary/5 to-transparent">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto"><Award className="w-8 h-8 text-primary" /></div>
            <h3 className="text-xl font-bold text-foreground">شهادة إتمام تدريب</h3>
            <p className="text-muted-foreground">يُشهد بأن</p>
            <p className="text-2xl font-bold text-primary">{showCertificate}</p>
            <p className="text-muted-foreground">قد أتم بنجاح دورة</p>
            <p className="text-lg font-bold text-foreground">{selectedCourse?.title}</p>
            <div className="pt-4 flex justify-center"><div className="w-24 h-24 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center"><QrCode className="w-12 h-12 text-muted-foreground/40" /></div></div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!qrData} onOpenChange={() => setQrData(null)}>
        <DialogContent className="max-w-sm flex flex-col items-center justify-center p-6" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-center">استمارة: {qrData?.roleName}</DialogTitle>
          </DialogHeader>
          <p className="text-sm font-bold text-primary mb-4">{qrData?.title}</p>
          {qrData && (
            <div className="bg-white p-4 rounded-xl border border-border shadow-sm mb-4">
              <QRCodeSVG value={qrData.url} size={200} level="M" />
            </div>
          )}
          <p className="text-xs text-muted-foreground text-center">امسح الباركود للوصول إلى الاستمارة والمشاركة في التقييم عبر الشبكة.</p>
        </DialogContent>
      </Dialog>

      <Dialog open={showBarcodeHub} onOpenChange={setShowBarcodeHub}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><QrCode className="w-5 h-5 text-primary" />إعداد وإنشاء باركود التقييم</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="bg-muted/30 p-4 rounded-xl border border-border space-y-4">
              <div>
                <Label>اختر دورة موجودة (أو أدخل يدوياً)</Label>
                <Select value={hubForm.courseId} onValueChange={(v) => {
                  const c = courses.find(x => x.id === v);
                  if (c) {
                    setHubForm({ ...hubForm, courseId: c.id, courseName: c.title, trainerName: c.trainer || "", supervisorName: c.supervisor || "" });
                  }
                }}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="اختر دورة مسجلة..." /></SelectTrigger>
                  <SelectContent>
                    {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3">
                <div>
                  <Label>اسم الدورة</Label>
                  <Input className="mt-1" value={hubForm.courseName} onChange={e => setHubForm({...hubForm, courseName: e.target.value})} placeholder="أدخل اسم الدورة..." />
                </div>
                <div>
                  <Label>اسم المدرب</Label>
                  <Input className="mt-1" value={hubForm.trainerName} onChange={e => setHubForm({...hubForm, trainerName: e.target.value})} placeholder="أدخل اسم المدرب..." />
                </div>
                <div>
                  <Label>اسم المشرف</Label>
                  <Input className="mt-1" value={hubForm.supervisorName} onChange={e => setHubForm({...hubForm, supervisorName: e.target.value})} placeholder="أدخل اسم المشرف..." />
                </div>
              </div>
              <div>
                <Label>معلومات خاصة / تعليمات للاستمارة</Label>
                <Textarea className="mt-1 resize-none" rows={2} value={hubForm.extraInfo} onChange={e => setHubForm({...hubForm, extraInfo: e.target.value})} placeholder="سيتم عرض هذه التعليمات للمقيمين أعلى الاستمارة..." />
              </div>
              <Button onClick={handleGenerateHubQrs} className="w-full gap-2 mt-2"><QrCode className="w-4 h-4" />إنشاء واعتماد</Button>
            </div>

            {hubQrs.length > 0 && (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 pt-4 border-t border-border">
                {hubQrs.map((qr) => (
                  <div key={qr.id} className="bg-card border border-border p-4 rounded-xl flex flex-col items-center text-center shadow-sm">
                    <h3 className="font-bold text-sm text-foreground mb-3">{qr.title}</h3>
                    <div className="bg-white p-2 rounded-lg border border-border mb-3 inline-block">
                      <QRCodeSVG id={qr.id} value={qr.url} size={150} level="M" />
                    </div>
                    <Button variant="outline" size="sm" className="w-full gap-2 mt-auto" onClick={() => downloadQR(qr.id, qr.filename)}>
                      تصدير كصورة
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Courses;

