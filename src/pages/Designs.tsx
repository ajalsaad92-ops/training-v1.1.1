import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useCourses, useCurriculumItems, useTasks, useHRRequests, useEmployees } from "@/hooks/useSupabaseData";
import { localDb } from "@/lib/localStore";
import {
  Palette, Star, BookOpen, Users, BarChart3, ClipboardList, Mail, CalendarPlus, ListChecks, ChevronLeft, Loader2,
  FolderArchive, BookX, AlertTriangle, Bell, Shield, GraduationCap, Eye,
} from "lucide-react";
import {
  getItemsWithEmptyFields, countByStage, countByPptStage,
  stageLabels, stageColors, pptStageLabels, pptStageColors,
  type CurriculumStage, type PptStage,
} from "@/lib/curriculumHelpers";

const StarRating = ({ rating, max = 7 }: { rating: number; max?: number }) => (
  <div className="flex gap-0.5 justify-center" dir="ltr">
    {Array.from({ length: max }).map((_, i) => (
      <Star key={i} className={`w-3 h-3 ${i < rating ? "fill-warning text-warning" : "fill-muted text-muted"}`} />
    ))}
  </div>
);

const designThemes = [
  { id: "classic", label: "التصميم الكلاسيكي", sublabel: "3 أعمدة + تقييمات + تنبيهات", role: "مدير / مدير قسم", icon: BarChart3, gradient: "from-primary/20 via-primary/10 to-accent/20", border: "border-primary/40", swatch: ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--warning))"], glow: "shadow-primary/20" },
  { id: "stages", label: "تصميم مراحل المناهج والعروض", sublabel: "مراحل تفاعلية + شريط التقدم", role: "رئيس شعبة المناهج", icon: BookOpen, gradient: "from-accent/20 via-accent/10 to-success/20", border: "border-accent/40", swatch: ["hsl(var(--accent))", "hsl(var(--success))", "hsl(var(--warning))"], glow: "shadow-accent/20" },
  { id: "individual", label: "تصميم اللوحة الشخصية", sublabel: "إجازات + غيابات + مهام", role: "مستخدم عادي", icon: Shield, gradient: "from-success/20 via-success/10 to-primary/20", border: "border-success/40", swatch: ["hsl(var(--success))", "hsl(var(--primary))", "hsl(var(--warning))"], glow: "shadow-success/20" },
  { id: "notifications", label: "تصميم الإشعارات والتنبيهات", sublabel: "موافقات + وثائق + مهام", role: "جميع الأدوار", icon: Bell, gradient: "from-warning/20 via-warning/10 to-destructive/20", border: "border-warning/40", swatch: ["hsl(var(--warning))", "hsl(var(--destructive))", "hsl(var(--primary))"], glow: "shadow-warning/20" },
];

const alertIcons: Record<string, React.ElementType> = {
  "كتب غير منجزة": BookX,
  "وثائق قيد المراجعة": FolderArchive,
  "طلبات معلقة": ClipboardList,
  "مهام الإعداد": ListChecks,
};

const alertGradients: Record<string, string> = {
  "كتب غير منجزة": "from-destructive/10 to-destructive/5",
  "وثائق قيد المراجعة": "from-accent/10 to-accent/5",
  "طلبات معلقة": "from-warning/10 to-warning/5",
  "مهام الإعداد": "from-primary/10 to-primary/5",
};

const alertIconColors: Record<string, string> = {
  "كتب غير منجزة": "text-destructive",
  "وثائق قيد المراجعة": "text-accent",
  "طلبات معلقة": "text-warning",
  "مهام الإعداد": "text-primary",
};

const Designs = () => {
  const { user } = useAuth();
  const { persona } = useUserRole();
  const { data: courses, loading: cl } = useCourses();
  const { data: curriculumItems } = useCurriculumItems();
  const archiveDocs = localDb.archiveDocuments.getAll();
  const { data: tasks } = useTasks();
  const { data: hrRequests } = useHRRequests();
  const { data: employees } = useEmployees();
  const navigate = useNavigate();
  const [selectedDesign, setSelectedDesign] = useState<string | null>(null);

  const loading = cl;
  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const totalCourses = courses.length;
  const externalCourses = courses.filter(c => c.type === "external").length;
  const internalCourses = totalCourses - externalCourses;
  const totalTrainees = courses.reduce((sum, c) => sum + (c.trainees?.length || 0), 0);
  const completedCourses = courses.filter(c => c.status === "completed").length;
  const activeCourses = courses.filter(c => c.status === "active").length;
  const plannedCourses = courses.filter(c => c.status === "planned").length;
  const avgAchievement = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;
  const trainedStaffPercent = employees.length > 0 ? Math.min(Math.round((totalTrainees / employees.length) * 100), 100) : 0;

  const missingReports = curriculumItems.filter(c => c.status === "applied" && !c.report_uploaded);
  const pendingArchiveDocs = archiveDocs.filter(d => d.forCheck === "1");
  const pendingHR = hrRequests.filter(r => r.approval_status === "pending").length;
  const unitApprovedHR = hrRequests.filter(r => r.approval_status === "unit_approved").length;

  const currStageCounts = countByStage(curriculumItems);
  const pptStageCounts = countByPptStage(curriculumItems);

  const ratingItems = [
    { label: "التدريب", rating: 6 },
    { label: "المدربين", rating: 6 },
    { label: "المشرفين", rating: 5 },
    { label: "المتدربين", rating: 5 },
  ];

  const alertItems = [
    { label: "كتب غير منجزة", count: missingReports.length, link: "/curriculum?filter=missing_report" },
    { label: "وثائق قيد المراجعة", count: pendingArchiveDocs.length, link: "/archive" },
    { label: "طلبات معلقة", count: pendingHR + unitApprovedHR, link: "/hr?filter=pending" },
    { label: "مهام الإعداد", count: tasks.filter(t => t.unit === "الإعداد" && t.status !== "completed").length, link: "/tasks" },
  ];

  const navPreviewItems = [
    { label: "لوحة القيادة", path: "/", icon: BarChart3 },
    { label: "الأرشيف الإداري", path: "/archive", icon: FolderArchive },
    { label: "المناهج", path: "/curriculum", icon: BookOpen },
    { label: "التنفيذ", path: "/courses", icon: GraduationCap },
    { label: "التقييم", path: "/evaluation", icon: ClipboardList },
  ];

  const statCards = [
    { label: "عدد الدورات", value: totalCourses, sub: `خارجية: ${externalCourses} / داخلية: ${internalCourses}`, color: "text-primary", icon: GraduationCap },
    { label: "الكوادر المدربة", value: totalTrainees, sub: "", color: "text-primary", icon: Users },
    { label: "نسبة الكوادر", value: `${trainedStaffPercent}%`, sub: "", color: "text-primary", icon: Eye },
    { label: "نسبة الإنجاز", value: `${avgAchievement}%`, sub: "", color: "text-accent", icon: Star },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-header flex items-center gap-2"><Palette className="w-7 h-7 text-primary" />معرض التصاميم</h1>
          <p className="page-subtitle">نماذج لوحات القيادة المتاحة — اضغط للتبديل بين التصاميم</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {designThemes.map((theme, idx) => {
          const isSelected = selectedDesign === theme.id;
          const ThemeIcon = theme.icon;
          return (
            <div
              key={theme.id}
              className={`relative group rounded-2xl border-2 transition-all duration-500 cursor-pointer overflow-hidden animate-slide-up ${isSelected ? `${theme.border} shadow-lg ${theme.glow}` : "border-border/50 hover:border-border"} ${isSelected ? "ring-2 ring-offset-2 ring-offset-background" : ""}`}
              style={{ animationDelay: `${idx * 75}ms` }}
              onClick={() => setSelectedDesign(isSelected ? null : theme.id)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-60 group-hover:opacity-80 transition-opacity duration-500`} />
              <div className="absolute inset-0 glass opacity-0 group-hover:opacity-60 transition-opacity duration-500" />

              <div className="relative p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.gradient} border ${theme.border} flex items-center justify-center animate-bounce-in`}>
                      <ThemeIcon className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-foreground">{theme.label}</h2>
                      <p className="text-[10px] text-muted-foreground">{theme.sublabel}</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isSelected ? "border-primary bg-primary scale-110 animate-bounce-in" : "border-muted-foreground/40 group-hover:border-muted-foreground"}`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r ${theme.gradient} border ${theme.border} font-medium`}>{theme.role}</span>
                  <div className="flex gap-1 mr-auto">
                    {theme.swatch.map((color, i) => (
                      <div key={i} className="w-3 h-3 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>

                <div className="flex gap-1.5">
                  {navPreviewItems.slice(0, 5).map(item => (
                    <div key={item.path} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-background/40 border border-border/30 text-[10px] text-muted-foreground">
                      <item.icon className="w-2.5 h-2.5" />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedDesign === "classic" && (
        <div className="border-2 border-primary/30 rounded-2xl p-5 space-y-4 glass animate-slide-up">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">معاينة التصميم الكلاسيكي</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-3 space-y-2">
              {alertItems.map((item, i) => {
                const AlertIcon = alertIcons[item.label] || AlertTriangle;
                return (
                  <button key={i} onClick={() => navigate(item.link)} className={`w-full flex items-center gap-2.5 rounded-xl p-3 bg-gradient-to-r ${alertGradients[item.label]} border border-border/30 hover:shadow-md hover:scale-[1.02] transition-all duration-300 animate-slide-up`} style={{ animationDelay: `${i * 75}ms` }}>
                    <div className={`w-8 h-8 rounded-lg ${alertIconColors[item.label]} bg-background/60 flex items-center justify-center shrink-0`}>
                      <AlertIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-xs font-semibold text-foreground">{item.label}</p>
                      <p className="text-lg font-bold text-foreground">{item.count}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="lg:col-span-6">
              <div className="grid grid-cols-2 gap-3">
                {statCards.map((card, i) => (
                  <div key={i} className="bg-card/80 border border-border/30 rounded-xl p-4 text-center glass hover:shadow-md hover:scale-[1.02] transition-all duration-300 animate-slide-up" style={{ animationDelay: `${(i + 2) * 75}ms` }}>
                    <card.icon className={`w-5 h-5 ${card.color} mx-auto mb-1.5`} />
                    <p className="text-[10px] text-muted-foreground mb-0.5">{card.label}</p>
                    <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                    {card.sub && <p className="text-[10px] text-muted-foreground mt-0.5">{card.sub}</p>}
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-3 space-y-2">
              {ratingItems.map((item, i) => (
                <div key={i} className="bg-card/80 border border-border/30 rounded-xl p-3 text-center glass hover:shadow-md hover:scale-[1.02] transition-all duration-300 animate-slide-up" style={{ animationDelay: `${(i + 6) * 75}ms` }}>
                  <p className="text-xs font-semibold text-foreground mb-1.5">{item.label}</p>
                  <StarRating rating={item.rating} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedDesign === "stages" && (
        <div className="border-2 border-accent/30 rounded-2xl p-5 space-y-4 glass animate-slide-up">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-bold text-foreground">معاينة تصميم مراحل المناهج والعروض</h3>
          </div>
          <div className="bg-card/80 border border-border/30 rounded-xl p-4 glass animate-slide-up delay-75">
            <h4 className="text-xs font-bold text-foreground mb-3 flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" />المناهج حسب المراحل</h4>
            <div className="grid grid-cols-5 gap-2">
              {(["writing", "new_form", "auditing", "printing", "done"] as CurriculumStage[]).map(s => (
                <div key={s} className={`rounded-xl p-3 text-center ${stageColors[s]} hover:scale-105 transition-transform duration-300 animate-slide-up`}>
                  <p className="text-lg font-bold">{currStageCounts[s]}</p>
                  <p className="text-[10px]">{stageLabels[s]}</p>
                </div>
              ))}
            </div>
            {curriculumItems.length > 0 && (
              <div className="mt-3 h-2.5 rounded-full bg-muted overflow-hidden flex glass">
                {(["writing", "new_form", "auditing", "printing", "done"] as CurriculumStage[]).map(s => {
                  const pct = (currStageCounts[s] / curriculumItems.length) * 100;
                  const barColors: Record<CurriculumStage, string> = { writing: "bg-muted-foreground/40", new_form: "bg-primary", auditing: "bg-warning", printing: "bg-accent", done: "bg-success" };
                  return pct > 0 ? <div key={s} className={`${barColors[s]} h-full transition-all duration-700`} style={{ width: `${pct}%` }} /> : null;
                })}
              </div>
            )}
          </div>
          <div className="bg-card/80 border border-border/30 rounded-xl p-4 glass animate-slide-up delay-150">
            <h4 className="text-xs font-bold text-foreground mb-3 flex items-center gap-2"><ClipboardList className="w-4 h-4 text-accent" />العروض حسب المراحل</h4>
            <div className="grid grid-cols-4 gap-2">
              {(["not_done", "pdf", "ppt", "done"] as PptStage[]).map(s => (
                <div key={s} className={`rounded-xl p-3 text-center ${pptStageColors[s]} hover:scale-105 transition-transform duration-300 animate-slide-up`}>
                  <p className="text-lg font-bold">{pptStageCounts[s]}</p>
                  <p className="text-[10px]">{pptStageLabels[s]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedDesign === "individual" && (
        <div className="border-2 border-success/30 rounded-2xl p-5 space-y-4 glass animate-slide-up">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-success" />
            <h3 className="text-sm font-bold text-foreground">معاينة تصميم اللوحة الشخصية</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "إجازات الشهر", value: "0", sub: "المتبقي: 3", color: "text-primary", icon: CalendarPlus, gradient: "from-primary/10 to-primary/5" },
              { label: "غيابات", value: "0", sub: "", color: "text-destructive", icon: AlertTriangle, gradient: "from-destructive/10 to-destructive/5" },
              { label: "خروجيات", value: "0", sub: "المتبقي: 7 ساعة", color: "text-warning", icon: Mail, gradient: "from-warning/10 to-warning/5" },
            ].map((card, i) => (
              <div key={i} className={`bg-gradient-to-br ${card.gradient} border border-border/30 rounded-xl p-4 text-center glass hover:shadow-md hover:scale-[1.02] transition-all duration-300 animate-slide-up`} style={{ animationDelay: `${i * 75}ms` }}>
                <card.icon className={`w-5 h-5 ${card.color} mx-auto mb-1.5`} />
                <p className="text-[10px] text-muted-foreground">{card.label}</p>
                <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                {card.sub && <p className="text-[10px] text-muted-foreground">{card.sub}</p>}
              </div>
            ))}
          </div>
          <div className="bg-card/80 border border-border/30 rounded-xl p-4 glass animate-slide-up delay-150">
            <h4 className="text-xs font-bold text-foreground mb-3 flex items-center gap-2"><ListChecks className="w-4 h-4 text-primary" />مهامي المسندة</h4>
            <p className="text-sm text-muted-foreground text-center py-4">لا توجد مهام نشطة</p>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: "مهامي", value: "0", color: "text-primary", icon: ListChecks },
              { label: "مكتملة", value: "0", color: "text-success", icon: Star },
              { label: "قيد التنفيذ", value: "0", color: "text-warning", icon: Eye },
              { label: "معلّقة", value: "0", color: "text-muted-foreground", icon: AlertTriangle },
              { label: "نقاط الإنجاز", value: "0", color: "text-accent", icon: Star },
            ].map((card, i) => (
              <div key={i} className="bg-card/80 border border-border/30 rounded-xl p-3 text-center glass hover:shadow-md hover:scale-[1.02] transition-all duration-300 animate-slide-up" style={{ animationDelay: `${(i + 3) * 75}ms` }}>
                <card.icon className={`w-4 h-4 ${card.color} mx-auto mb-1`} />
                <p className="text-[10px] text-muted-foreground">{card.label}</p>
                <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedDesign === "notifications" && (
        <div className="border-2 border-warning/30 rounded-2xl p-5 space-y-4 glass animate-slide-up">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-4 h-4 text-warning" />
            <h3 className="text-sm font-bold text-foreground">معاينة تصميم الإشعارات والتنبيهات</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="bg-card/80 border border-border/30 rounded-xl p-4 glass animate-slide-up delay-75">
              <h4 className="text-xs font-bold text-foreground mb-3 flex items-center gap-2"><CalendarPlus className="w-4 h-4 text-warning" />إشعارات الموافقات ({pendingHR + unitApprovedHR})</h4>
              <div className="space-y-2">
                {hrRequests.filter(r => ["pending", "unit_approved"].includes(r.approval_status)).slice(0, 4).map(r => (
                  <div key={r.id} className="flex items-center justify-between bg-warning/5 border border-warning/10 rounded-lg px-3 py-2.5 hover:shadow-sm transition-all">
                    <div className="flex-1"><span className="text-sm font-medium">{r.employee_name}</span><span className="text-xs text-muted-foreground mr-2">— {r.type}</span></div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${r.approval_status === "unit_approved" ? "bg-success/10 text-success border border-success/20" : "bg-warning/10 text-warning border border-warning/20"}`}>
                      {r.approval_status === "unit_approved" ? "✓ رئيس الشعبة" : "معلّق"}
                    </span>
                  </div>
                ))}
                {hrRequests.filter(r => ["pending", "unit_approved"].includes(r.approval_status)).length === 0 && <p className="text-sm text-muted-foreground text-center">لا توجد إشعارات</p>}
              </div>
            </div>
            <div className="bg-card/80 border border-border/30 rounded-xl p-4 glass animate-slide-up delay-150">
              <h4 className="text-xs font-bold text-foreground mb-3 flex items-center gap-2"><FolderArchive className="w-4 h-4 text-accent" />إشعارات الوثائق ({pendingArchiveDocs.length})</h4>
              <div className="space-y-2">
                {pendingArchiveDocs.slice(0, 4).map(c => (
                  <div key={c.id} className="flex items-center justify-between bg-accent/5 border border-accent/10 rounded-lg px-3 py-2.5 hover:shadow-sm transition-all">
                    <span className="text-sm">{c.docSubj}</span>
                    <span className="text-[10px] text-muted-foreground">{c.docDateCH}</span>
                  </div>
                ))}
                {pendingArchiveDocs.length === 0 && <p className="text-sm text-muted-foreground text-center">لا توجد وثائق معلقة</p>}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 animate-slide-up delay-200">
            {alertItems.map((item, i) => {
              const AlertIcon = alertIcons[item.label] || AlertTriangle;
              return (
                <button key={i} onClick={() => navigate(item.link)} className={`flex items-center gap-2 rounded-xl p-3 bg-gradient-to-r ${alertGradients[item.label]} border border-border/30 hover:shadow-md hover:scale-[1.02] transition-all duration-300`}>
                  <AlertIcon className={`w-4 h-4 ${alertIconColors[item.label]} shrink-0`} />
                  <div className="text-right flex-1">
                    <p className="text-[10px] text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-bold text-foreground">{item.count}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Designs;
