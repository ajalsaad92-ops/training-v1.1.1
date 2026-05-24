import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  REPORT_SOURCES,
  SOURCE_LIST,
  runReport,
  formatRow,
  computeExecutiveKPIs,
  type ReportSourceKey,
} from "@/lib/reportEngine";
import { printReport, downloadHtml, exportPdf, type PrintTemplate } from "@/lib/printReport";
import { scheduleStore, type ScheduleFrequency, type ScheduledReport } from "@/lib/scheduledReports";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  BarChart3, Printer, Download, FileSpreadsheet, FileText, Calendar, Clock,
  Trash2, Plus, Search, Sparkles, Layers, TrendingUp, TrendingDown,
  Users, BookOpen, ClipboardList, GraduationCap, FileCheck,
  Shield, Activity, DollarSign, MapPin, AlertTriangle, CheckCircle2,
  ChevronRight, ChevronLeft, Eye, Mail, FolderArchive,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, CartesianGrid,
} from "recharts";

const COLORS = ["#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#6366f1"];

const GRADIENTS = [
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-violet-500 to-purple-500",
  "from-fuchsia-500 to-pink-500",
  "from-teal-500 to-cyan-500",
  "from-indigo-500 to-blue-500",
  "from-red-500 to-rose-500",
  "from-green-500 to-emerald-500",
  "from-sky-500 to-blue-500",
  "from-purple-500 to-violet-500",
];

const KPI_ICONS = [Users, GraduationCap, CheckCircle2, BookOpen, Shield, ClipboardList, Activity, FileCheck, DollarSign, DollarSign, MapPin, AlertTriangle];

const AnimatedNumber = ({ value, duration = 800 }: { value: number | string; duration?: number }) => {
  const [display, setDisplay] = useState(typeof value === "number" ? 0 : value);
  useEffect(() => {
    if (typeof value !== "number") { setDisplay(value); return; }
    const startTime = performance.now();
    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * (value as number)));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, duration]);
  return <span>{display}</span>;
};

const sourceIcons: Record<string, React.ElementType> = {
  employees: Users,
  courses: GraduationCap,
  trainees: BookOpen,
  curriculum: BookOpen,
  tasks: ClipboardList,
  hr_requests: Users,
  correspondence: Mail,
  audit_log: Activity,
  notifications: Activity,
  governorate_training: MapPin,
  followup_records: ClipboardList,
};

const freqLabels: Record<string, string> = { daily: "يومي", weekly: "أسبوعي", monthly: "شهري" };
const freqColors: Record<string, string> = { daily: "bg-emerald-500 text-white", weekly: "bg-blue-500 text-white", monthly: "bg-purple-500 text-white" };

const BUILDER_STEPS = ["مصدر البيانات", "الأعمدة", "الفلاتر", "المعاينة"];

const Reports = () => {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const [source, setSource] = useState<ReportSourceKey>("courses");
  const [columns, setColumns] = useState<string[]>(REPORT_SOURCES.courses.defaultColumns);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");
  const [template, setTemplate] = useState<PrintTemplate>("official");
  const [schedules, setSchedules] = useState<ScheduledReport[]>(scheduleStore.getAll());
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [schedName, setSchedName] = useState("");
  const [schedFreq, setSchedFreq] = useState<ScheduleFrequency>("weekly");
  const [builderStep, setBuilderStep] = useState(0);
  const [previewPage, setPreviewPage] = useState(1);
  const previewPageSize = 25;
  const refreshRef = useRef(0);

  useEffect(() => { setColumns(REPORT_SOURCES[source].defaultColumns); }, [source]);

  useEffect(() => {
    const runId = params.get("run");
    if (runId) {
      const item = scheduleStore.getAll().find((s) => s.id === runId);
      if (item) {
        setSource(item.source);
        setColumns(item.columns);
        setTemplate(item.template);
        toast({ title: "تم تحميل تقرير مجدوّل", description: item.name });
      }
    }
  }, [params]);

  const { source: src, rows } = useMemo(
    () => runReport({ source, columns, dateFrom, dateTo, search }),
    [source, columns, dateFrom, dateTo, search, refreshRef.current]
  );

  const exec = useMemo(() => computeExecutiveKPIs(), []);

  const toggleCol = (k: string) =>
    setColumns((c) => (c.includes(k) ? c.filter((x) => x !== k) : [...c, k]));

  const reportTitle = `تقرير ${src.label}`;

  const handlePrint = () => {
    if (rows.length === 0) return toast({ title: "لا توجد بيانات للطباعة", variant: "destructive" });
    printReport({
      template, title: reportTitle, source: src, rows, columns, dateFrom, dateTo,
      preparedBy: user?.name || "—",
    });
  };

  const handleExportExcel = () => {
    if (rows.length === 0) return toast({ title: "لا توجد بيانات", variant: "destructive" });
    const cols = columns.map((k) => src.columns.find((c) => c.key === k)!).filter(Boolean);
    const data = [cols.map((c) => c.label), ...rows.map((r) => formatRow(src, r, columns))];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, src.label.slice(0, 28));
    XLSX.writeFile(wb, `${reportTitle}.xlsx`);
    toast({ title: "تم التصدير", description: `${rows.length} سجل` });
  };

  const handleExportPDF = async () => {
    if (rows.length === 0) return toast({ title: "لا توجد بيانات", variant: "destructive" });
    try {
      await exportPdf({
        template, title: reportTitle, source: src, rows, columns, dateFrom, dateTo,
        preparedBy: user?.name || "—",
      });
      toast({ title: "تم إنشاء PDF", description: `${rows.length} سجل` });
    } catch (e) {
      toast({ title: "تعذر إنشاء PDF", description: String(e), variant: "destructive" });
    }
  };

  const handleAddSchedule = () => {
    if (!schedName.trim()) return toast({ title: "أدخل اسماً للجدولة", variant: "destructive" });
    const item = scheduleStore.add({
      name: schedName.trim(), source, columns, template, frequency: schedFreq, enabled: true,
    });
    setSchedules(scheduleStore.getAll());
    setSchedName("");
    setScheduleOpen(false);
    toast({ title: "تمت الجدولة", description: `${item.name} — ${schedFreq}` });
  };

  const removeSchedule = (id: string) => {
    scheduleStore.remove(id);
    setSchedules(scheduleStore.getAll());
  };

  const toggleSchedule = (id: string, enabled: boolean) => {
    scheduleStore.update(id, { enabled });
    setSchedules(scheduleStore.getAll());
  };

  const totalPreviewPages = Math.max(1, Math.ceil(rows.length / previewPageSize));
  const paginatedRows = rows.slice((previewPage - 1) * previewPageSize, previewPage * previewPageSize);

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <div className="no-print">
        <h1 className="page-header flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-primary" />
          مركز التقارير الذكي
        </h1>
        <p className="page-subtitle">نظام شامل لتوليد التقارير عن كل ما يحدث في النظام مع طباعة احترافية وجدولة تلقائية</p>
      </div>

      <Tabs defaultValue="builder" className="no-print">
        <TabsList className="grid grid-cols-3 w-full md:w-auto">
          <TabsTrigger value="builder" className="gap-2"><Layers className="w-4 h-4" />منشئ التقارير</TabsTrigger>
          <TabsTrigger value="executive" className="gap-2"><Sparkles className="w-4 h-4" />لوحة تنفيذية</TabsTrigger>
          <TabsTrigger value="scheduled" className="gap-2"><Calendar className="w-4 h-4" />الجدولة التلقائية</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-4 mt-4 tab-content-enter">
          <div className="flex items-center gap-1 mb-2" dir="rtl">
            {BUILDER_STEPS.map((step, i) => (
              <div key={i} className="flex items-center gap-1">
                <button
                  onClick={() => setBuilderStep(i)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                    i === builderStep ? "bg-primary text-primary-foreground shadow-md" : i < builderStep ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-white/20">{i + 1}</span>
                  <span className="hidden sm:inline">{step}</span>
                </button>
                {i < BUILDER_STEPS.length - 1 && <div className={`w-6 h-0.5 rounded transition-colors duration-300 ${i < builderStep ? "bg-primary" : "bg-muted"}`} />}
              </div>
            ))}
          </div>

          {builderStep === 0 && (
            <div className="bg-card rounded-xl border border-border p-5 animate-slide-up">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">١</span>
                <p className="text-sm font-bold text-foreground">اختر مصدر البيانات</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {SOURCE_LIST.map((s) => {
                  const Icon = sourceIcons[s.key] || FileText;
                  const isSelected = source === s.key;
                  return (
                    <button key={s.key} onClick={() => { setSource(s.key); setBuilderStep(1); }}
                      className={`p-4 rounded-xl border-2 text-right transition-all duration-300 card-hover group ${isSelected ? "border-primary bg-primary/10 shadow-lg shadow-primary/10" : "border-border bg-background hover:border-primary/40"}`}>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-all duration-300 ${isSelected ? "bg-primary text-primary-foreground scale-110" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="font-bold text-sm text-foreground">{s.label}</div>
                      <div className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{s.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {builderStep === 1 && (
            <div className="bg-card rounded-xl border border-border p-5 animate-slide-up">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">٢</span>
                <p className="text-sm font-bold text-foreground">اختر الأعمدة المطلوبة ({columns.length}/{src.columns.length})</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {src.columns.map((c) => {
                  const isActive = columns.includes(c.key);
                  return (
                    <button key={c.key} onClick={() => toggleCol(c.key)}
                      className={`relative px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-300 border overflow-hidden ${isActive ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted hover:border-border"}`}>
                      {isActive && <span className="absolute top-1 left-1 w-2 h-2 rounded-full bg-white/60 animate-bounce-in" />}
                      {c.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                <Button size="sm" variant="outline" onClick={() => setColumns(src.columns.map((c) => c.key))}>تحديد الكل</Button>
                <Button size="sm" variant="outline" onClick={() => setColumns(src.defaultColumns)}>الافتراضي</Button>
                <div className="flex-1" />
                <Button size="sm" onClick={() => setBuilderStep(2)}>التالي ←</Button>
              </div>
            </div>
          )}

          {builderStep === 2 && (
            <div className="bg-card rounded-xl border border-border p-5 space-y-4 animate-slide-up">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">٣</span>
                <p className="text-sm font-bold text-foreground">فلترة وبحث</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">من تاريخ</label>
                  <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">إلى تاريخ</label>
                  <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">بحث في النتائج</label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="كلمة مفتاحية..." className="pr-9" />
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-border space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">قالب الطباعة:</span>
                  <div className="flex gap-1">
                    <button onClick={() => setTemplate("official")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${template === "official" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>رسمي</button>
                    <button onClick={() => setTemplate("executive")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${template === "executive" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>تنفيذي</button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 card-hover hover:bg-emerald-500/20">
                    <FileSpreadsheet className="w-4 h-4" />Excel
                  </button>
                  <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 card-hover hover:bg-red-500/20">
                    <FileText className="w-4 h-4" />PDF
                  </button>
                  <button onClick={() => downloadHtml({ template, title: reportTitle, source: src, rows, columns, dateFrom, dateTo, preparedBy: user?.name || "—" })} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 card-hover hover:bg-blue-500/20">
                    <Download className="w-4 h-4" />HTML
                  </button>
                  <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20 card-hover hover:bg-gray-500/20">
                    <Printer className="w-4 h-4" />طباعة
                  </button>
                  <button onClick={() => setScheduleOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium bg-primary/10 text-primary border border-primary/20 card-hover hover:bg-primary/20">
                    <Clock className="w-4 h-4" />جدولة
                  </button>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button size="sm" onClick={() => { setPreviewPage(1); setBuilderStep(3); }}>معاينة النتائج ←</Button>
              </div>
            </div>
          )}

          {builderStep === 3 && (
            <div className="bg-card rounded-xl border border-border overflow-hidden animate-slide-up">
              <div className="p-3 border-b border-border flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">٤</span>
                  <span className="font-semibold text-sm">{src.label} ({rows.length} سجل)</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setBuilderStep(2)}>تعديل الفلاتر</Button>
                  <Button size="sm" variant="ghost" onClick={() => { refreshRef.current++; setSchedules(scheduleStore.getAll()); }}>تحديث</Button>
                </div>
              </div>
              <div className="overflow-x-auto max-h-[500px]">
                <table className="data-table text-sm">
                  <thead>
                    <tr>
                      <th className="w-12">#</th>
                      {columns.map((k) => {
                        const c = src.columns.find((x) => x.key === k);
                        return <th key={k}>{c?.label || k}</th>;
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRows.length === 0 ? (
                      <tr><td colSpan={columns.length + 1} className="text-center py-8 text-muted-foreground">لا توجد نتائج مطابقة</td></tr>
                    ) : (
                      paginatedRows.map((r, i) => (
                        <tr key={i} className="animate-fade-in" style={{ animationDelay: `${(i % 10) * 20}ms` }}>
                          <td className="text-muted-foreground">{(previewPage - 1) * previewPageSize + i + 1}</td>
                          {formatRow(src, r, columns).map((v, j) => <td key={j}>{v}</td>)}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {totalPreviewPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">صفحة {previewPage} من {totalPreviewPages} ({rows.length} سجل)</span>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" disabled={previewPage <= 1} onClick={() => setPreviewPage(p => p - 1)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    {Array.from({ length: Math.min(5, totalPreviewPages) }, (_, i) => {
                      let page: number;
                      if (totalPreviewPages <= 5) page = i + 1;
                      else if (previewPage <= 3) page = i + 1;
                      else if (previewPage >= totalPreviewPages - 2) page = totalPreviewPages - 4 + i;
                      else page = previewPage - 2 + i;
                      return (
                        <Button key={page} variant={previewPage === page ? "default" : "outline"} size="sm" onClick={() => setPreviewPage(page)} className="w-8 h-8 p-0 text-xs">
                          {page}
                        </Button>
                      );
                    })}
                    <Button variant="outline" size="sm" disabled={previewPage >= totalPreviewPages} onClick={() => setPreviewPage(p => p + 1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="executive" className="space-y-4 mt-4 tab-content-enter">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {exec.kpis.map((k, i) => {
              const Icon = KPI_ICONS[i % KPI_ICONS.length];
              const trend = k.hint?.includes("إجمالي") ? "up" : k.hint?.includes("متأخ") ? "down" : null;
              return (
                <div key={i}
                  className={`relative overflow-hidden rounded-xl p-4 bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} text-white shadow-md card-hover animate-slide-up`}
                  style={{ animationDelay: `${i * 75}ms` }}>
                  <div className="absolute top-0 left-0 w-16 h-16 rounded-full bg-white/10 -translate-x-4 -translate-y-4" />
                  <div className="relative flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon className="w-4 h-4 text-white/80" />
                        <p className="text-[10px] font-medium text-white/80">{k.label}</p>
                      </div>
                      <p className="text-2xl font-bold">
                        <AnimatedNumber value={k.value} />
                      </p>
                      {k.hint && (
                        <div className="flex items-center gap-1 mt-1">
                          {trend === "up" && <TrendingUp className="w-3 h-3 text-white/70" />}
                          {trend === "down" && <TrendingDown className="w-3 h-3 text-white/70" />}
                          <span className="text-[10px] text-white/70">{k.hint}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="حالات الدورات" data={exec.courseStatus} type="pie" index={0} />
            <ChartCard title="حالات المهام" data={exec.taskStatus} type="bar" index={1} />
            <ChartCard title="الموظفون حسب القسم" data={exec.byDept} type="bar" index={2} />
            <ChartCard title="طلبات HR" data={exec.hrStatus} type="pie" index={3} />
            <ChartCard title="التزام المحافظات" data={exec.govCompliance} type="bar" index={4} perBarColor />
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4 mt-4 tab-content-enter">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-bold text-foreground">التقارير المجدوّلة</p>
                <p className="text-xs text-muted-foreground mt-1">يتم إنشاء إشعار داخل التطبيق عند حلول موعد كل تقرير</p>
              </div>
              <Button size="sm" onClick={() => setScheduleOpen(true)} className="gap-2"><Plus className="w-4 h-4" />جدولة جديدة</Button>
            </div>
            {schedules.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">لا توجد جدولة بعد</p>
                <p className="text-xs text-muted-foreground mt-1">اضغط "جدولة جديدة" لإعداد تقرير تلقائي</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {schedules.map((s, idx) => {
                  const SrcIcon = sourceIcons[s.source] || FileText;
                  return (
                    <div key={s.id} className={`relative rounded-xl border p-4 transition-all duration-300 card-hover animate-slide-up ${s.enabled ? "border-border bg-card" : "border-border/50 bg-muted/30 opacity-70"}`} style={{ animationDelay: `${idx * 75}ms` }}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                            <SrcIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">{s.name}</p>
                            <p className="text-[10px] text-muted-foreground">{REPORT_SOURCES[s.source].label}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${freqColors[s.frequency]}`}>
                          {freqLabels[s.frequency]}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-3">
                        <span>قالب: {s.template === "official" ? "رسمي" : "تنفيذي"}</span>
                        <span>{s.columns.length} أعمدة</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-border pt-3">
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {s.lastRunAt ? `آخر: ${new Date(s.lastRunAt).toLocaleDateString("ar-SA")}` : "لم يُشغّل"}
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch dir="ltr" checked={s.enabled} onCheckedChange={(checked) => toggleSchedule(s.id, checked)} className="scale-75" />
                          <button onClick={() => removeSchedule(s.id)} className="p-1 rounded text-destructive hover:bg-destructive/10 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>جدولة تقرير تلقائي</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">اسم التقرير</label>
              <Input value={schedName} onChange={(e) => setSchedName(e.target.value)} placeholder="مثال: تقرير الدورات الأسبوعي" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">التكرار</label>
              <Select value={schedFreq} onValueChange={(v) => setSchedFreq(v as ScheduleFrequency)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">يومي</SelectItem>
                  <SelectItem value="weekly">أسبوعي</SelectItem>
                  <SelectItem value="monthly">شهري</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-xs text-muted-foreground bg-muted/40 p-3 rounded-lg">
              سيتم استخدام المصدر «{src.label}»، الأعمدة المختارة ({columns.length})، والقالب «{template === "official" ? "الرسمي" : "التنفيذي"}»
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleOpen(false)}>إلغاء</Button>
            <Button onClick={handleAddSchedule}>حفظ الجدولة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ChartCard = ({ title, data, type, index, perBarColor }: { title: string; data: { name: string; value: number }[]; type: "bar" | "pie"; index: number; perBarColor?: boolean }) => {
  const gradientId = `chartGrad${index}`;
  return (
    <div className="bg-card border border-border rounded-xl p-4 card-hover animate-slide-up" style={{ animationDelay: `${(index + 5) * 75}ms` }}>
      <p className="font-bold text-sm mb-3 text-foreground">{title}</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {type === "bar" ? (
            <BarChart data={data}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={1} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: "12px", fontSize: 12, direction: "rtl" }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} fill={perBarColor ? undefined : `url(#${gradientId})`}>
                {perBarColor ? data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />) : null}
              </Bar>
            </BarChart>
          ) : (
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" outerRadius={80} label={{ fontSize: 11 }}>
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: "12px", fontSize: 12, direction: "rtl" }} />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Reports;
