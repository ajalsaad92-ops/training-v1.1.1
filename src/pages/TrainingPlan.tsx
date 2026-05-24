import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import IraqMap, { type GovStats } from "@/components/IraqMap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { localDb } from "@/lib/localStore";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { CalendarDays, BarChart3, Plus, Search, FileSpreadsheet, MapPin, ChevronLeft, ChevronRight, Pencil, Trash2, Clock, ExternalLink, BookOpen, CheckCircle2, AlertTriangle, TrendingUp, Upload, LayoutGrid, Target } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface GovernorateTraining {
  id: string; governorate: string; course_name: string; domain: string;
  course_hours: number; track: string; nominees_count: number;
  planned_start_date: string; planned_end_date: string;
  actual_start_date: string | null; actual_end_date: string | null;
  status: string; compliance: string; notes: string;
  created_by: string | null; created_at: string; updated_at: string;
}
interface WeekSchedule {
  id: string; governorate: string; week: number;
  start_date: string; end_date: string; label: string;
}

const statusLabels = { planned: "مخططة", in_progress: "قيد التنفيذ", completed: "مكتملة", delayed: "متأخرة" };
const statusColors = { planned: "neutral", in_progress: "info", completed: "success", delayed: "warning" };
const complianceLabels = { on_track: "ملتزم", delayed: "متأخر", completed: "مكتمل", not_started: "لم يبدأ" };
const complianceColors = { on_track: "success", delayed: "warning", completed: "success", not_started: "neutral" };
const trackLabels = { "المسار الأول": "المسار الأول / القاعة A", "المسار الثاني": "المسار الثاني / القاعة B" };
const emptyGovForm = { governorate: "", course_name: "", domain: "", course_hours: 0, track: "المسار الأول", nominees_count: 0, planned_start_date: "", planned_end_date: "", actual_start_date: "", actual_end_date: "", status: "planned", compliance: "not_started", notes: "" };
const emptyWeekForm = { governorate: "", week: 1, start_date: "", end_date: "", label: "" };
const ALL_19_GOVERNORATES = ["دهوك","نينوى","أربيل","السليمانية","حلبجة","كركوك","صلاح الدين","ديالى","الأنبار","بغداد","واسط","بابل","كربلاء","النجف","القادسية","ميسان","المثنى","ذي قار","البصرة"];

const ARABIC_DAYS = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];

const PIE_COLORS = ["#94a3b8", "#3b82f6", "#22c55e", "#f59e0b"];

const getEntityColor = (entityName: string, opacity: number = 0.15) => {
  if (!entityName) return "transparent";
  let hash = 0;
  for (let i = 0; i < entityName.length; i++) {
    hash = entityName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsla(${hue}, 70%, 50%, ${opacity})`;
};

function AnimatedNumber({ value, duration = 800 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (value - start) * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, duration]);
  return <>{display}</>;
}

function CircularProgress({ value, size = 80, strokeWidth = 6, color = "hsl(var(--primary))" }: { value: number; size?: number; strokeWidth?: number; color?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease-out" }} />
    </svg>
  );
}

function MonthCalendar({ trainings, weekSchedules, calMonth, setCalMonth }: {
  trainings: GovernorateTraining[];
  weekSchedules: WeekSchedule[];
  calMonth: Date;
  setCalMonth: (d: Date) => void;
}) {
  const year = calMonth.getFullYear();
  const month = calMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const weeks: (Date | null)[][] = [];
  let current: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) {
    current.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    current.push(new Date(year, month, d));
    if (current.length === 7) {
      weeks.push(current);
      current = [];
    }
  }
  if (current.length > 0) {
    while (current.length < 7) current.push(null);
    weeks.push(current);
  }

  const dateStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

  const coursesOnDay = (day: Date) => {
    const ds = dateStr(day);
    return trainings.filter(t => {
      const s = t.planned_start_date || t.actual_start_date;
      const e = t.planned_end_date || t.actual_end_date;
      return s && e && ds >= s && ds <= e;
    });
  };

  const weekOnDay = (day: Date) => {
    const ds = dateStr(day);
    return weekSchedules.find(w => ds >= w.start_date && ds <= w.end_date);
  };

  const statusDotColor: Record<string, string> = {
    planned: "bg-slate-400",
    in_progress: "bg-blue-400",
    completed: "bg-green-400",
    delayed: "bg-amber-400",
  };

  const monthName = calMonth.toLocaleDateString("ar-SA", { year: "numeric", month: "long" });

  return (
    <Card className="border border-border/50 overflow-hidden">
      <div className="bg-gradient-to-l from-primary/5 to-accent/5 px-4 py-2.5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setCalMonth(new Date(year, month - 1, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <span className="font-bold text-sm gradient-text">{monthName}</span>
          <Button variant="ghost" size="sm" onClick={() => setCalMonth(new Date(year, month + 1, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="p-3">
        <div className="grid grid-cols-7 gap-0 text-center text-[10px] mb-1">
          {ARABIC_DAYS.map(d => <div key={d} className="font-semibold text-muted-foreground py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-0">
          {weeks.flatMap((week, wi) =>
            week.map((day, di) => {
              if (!day) {
                const prevDay = prevMonthDays - startDow + di + 1;
                return <div key={`${wi}-${di}`} className="h-16 border border-border/20 p-0.5 text-muted-foreground/20 text-[9px]">{prevDay}</div>;
              }
              const courses = coursesOnDay(day);
              const wk = weekOnDay(day);
              const isToday = dateStr(day) === new Date().toISOString().split("T")[0];
              return (
                <div key={`${wi}-${di}`} className={`h-16 border border-border/20 p-0.5 relative transition-colors ${wk ? "bg-primary/5" : "hover:bg-muted/30"}`}>
                  <span className={`text-[10px] ${isToday ? "bg-primary text-primary-foreground rounded-full w-4 h-4 inline-flex items-center justify-center font-bold" : ""}`}>
                    {day.getDate()}
                  </span>
                  {courses.length > 0 && (
                    <div className="flex flex-wrap gap-px mt-0.5">
                      {courses.slice(0, 4).map((c, ci) => (
                        <span key={ci} className={`w-1.5 h-1.5 rounded-full ${statusDotColor[c.status] || "bg-slate-300"}`} title={c.course_name} />
                      ))}
                      {courses.length > 4 && <span className="text-[7px] text-muted-foreground">+{courses.length-4}</span>}
                    </div>
                  )}
                  {courses.length > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-card/90 border-t border-border/30 px-1 py-0.5 text-[8px] hidden group-hover:block max-h-20 overflow-y-auto">
                      {courses.map((c, ci) => (
                        <div key={ci} className="truncate">{c.course_name}</div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </Card>
  );
}

export default function TrainingPlan() {
  const navigate = useNavigate();
  const { has } = useUserRole();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedGov, setSelectedGov] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterGov, setFilterGov] = useState<string | null>(null);
  const [govTrainings, setGovTrainings] = useState<GovernorateTraining[]>([]);
  const [weekSchedules, setWeekSchedules] = useState<WeekSchedule[]>([]);
  const [showGovForm, setShowGovForm] = useState(false);
  const [editingGov, setEditingGov] = useState<GovernorateTraining | null>(null);
  const [govForm, setGovForm] = useState(emptyGovForm);
  const [showWeekForm, setShowWeekForm] = useState(false);
  const [editingWeek, setEditingWeek] = useState<WeekSchedule | null>(null);
  const [weekForm, setWeekForm] = useState(emptyWeekForm);
  const [calMonth, setCalMonth] = useState(new Date());
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const excelRef = useRef<HTMLInputElement>(null);
  const govExcelRef = useRef<HTMLInputElement>(null);

  const refreshData = useCallback(() => {
    setGovTrainings(localDb.governorateTraining.getAll() as GovernorateTraining[]);
    setWeekSchedules(localDb.weekSchedules.getAll() as WeekSchedule[]);
  }, []);

  useEffect(() => { refreshData(); }, [refreshData]);

  const governorates = useMemo(() => [...new Set(govTrainings.map(g => g.governorate))].sort(), [govTrainings]);

  const mapStats = useMemo(() => {
    const stats: Record<string, GovStats> = {};
    for (const t of govTrainings) {
      if (!stats[t.governorate]) {
        stats[t.governorate] = { totalCourses: 0, completed: 0, inProgress: 0, delayed: 0, complianceRate: 0 };
      }
      stats[t.governorate].totalCourses++;
      if (t.status === "completed") stats[t.governorate].completed++;
      if (t.status === "in_progress") stats[t.governorate].inProgress++;
      if (t.status === "delayed") stats[t.governorate].delayed++;
    }
    for (const g of Object.keys(stats)) {
      const s = stats[g];
      const onTrack = govTrainings.filter(t => t.governorate === g && (t.compliance === "on_track" || t.compliance === "completed")).length;
      s.complianceRate = s.totalCourses > 0 ? Math.round((onTrack / s.totalCourses) * 100) : 0;
    }
    return stats;
  }, [govTrainings]);

  const filteredTrainings = useMemo(() => {
    let list = govTrainings;
    const govFilter = selectedGov || filterGov;
    if (govFilter) list = list.filter(t => t.governorate === govFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.course_name.toLowerCase().includes(q) ||
        t.governorate.toLowerCase().includes(q) ||
        t.domain.toLowerCase().includes(q)
      );
    }
    return list;
  }, [govTrainings, selectedGov, filterGov, search]);

  const stats = useMemo(() => {
    const total = filteredTrainings.length;
    const completed = filteredTrainings.filter(t => t.status === "completed").length;
    const inProgress = filteredTrainings.filter(t => t.status === "in_progress").length;
    const delayed = filteredTrainings.filter(t => t.status === "delayed").length;
    const totalHours = filteredTrainings.reduce((s, t) => s + (t.course_hours || 0), 0);
    const compliant = filteredTrainings.filter(t => t.compliance === "on_track" || t.compliance === "completed").length;
    const complianceRate = total > 0 ? Math.round((compliant / total) * 100) : 0;
    return { total, completed, inProgress, delayed, totalHours, complianceRate };
  }, [filteredTrainings]);

  const selectedGovTrainings = useMemo(() =>
    selectedGov ? govTrainings.filter(t => t.governorate === selectedGov) : [],
    [selectedGov, govTrainings]
  );

  const selectedGovWeeks = useMemo(() =>
    selectedGov ? weekSchedules.filter(w => w.governorate === selectedGov).sort((a, b) => a.week - b.week) : [],
    [selectedGov, weekSchedules]
  );

  const selectedGovStats = useMemo(() => {
    if (!selectedGov) return null;
    const total = selectedGovTrainings.length;
    const completed = selectedGovTrainings.filter(t => t.status === "completed").length;
    const inProgress = selectedGovTrainings.filter(t => t.status === "in_progress").length;
    const delayed = selectedGovTrainings.filter(t => t.status === "delayed").length;
    const compliant = selectedGovTrainings.filter(t => t.compliance === "on_track" || t.compliance === "completed").length;
    const complianceRate = total > 0 ? Math.round((compliant / total) * 100) : 0;
    return { total, completed, inProgress, delayed, complianceRate };
  }, [selectedGov, selectedGovTrainings]);

  const statusDistribution = useMemo(() => [
    { name: "مخططة", value: filteredTrainings.filter(t => t.status === "planned").length, color: PIE_COLORS[0] },
    { name: "قيد التنفيذ", value: filteredTrainings.filter(t => t.status === "in_progress").length, color: PIE_COLORS[1] },
    { name: "مكتملة", value: filteredTrainings.filter(t => t.status === "completed").length, color: PIE_COLORS[2] },
    { name: "متأخرة", value: filteredTrainings.filter(t => t.status === "delayed").length, color: PIE_COLORS[3] },
  ], [filteredTrainings]);

  const topGovChart = useMemo(() => {
    const govMap: Record<string, number> = {};
    for (const t of govTrainings) {
      govMap[t.governorate] = (govMap[t.governorate] || 0) + 1;
    }
    return Object.entries(govMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));
  }, [govTrainings]);

  const upcomingCourses = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return govTrainings
      .filter(t => t.planned_start_date >= today && t.status === "planned")
      .sort((a, b) => a.planned_start_date.localeCompare(b.planned_start_date))
      .slice(0, 5);
  }, [govTrainings]);

  const openAddGov = () => {
    setEditingGov(null);
    setGovForm(emptyGovForm);
    setShowGovForm(true);
  };

  const openEditGov = (t: GovernorateTraining) => {
    setEditingGov(t);
    setGovForm({
      governorate: t.governorate,
      course_name: t.course_name,
      domain: t.domain,
      course_hours: t.course_hours,
      track: t.track,
      nominees_count: t.nominees_count,
      planned_start_date: t.planned_start_date,
      planned_end_date: t.planned_end_date,
      actual_start_date: t.actual_start_date || "",
      actual_end_date: t.actual_end_date || "",
      status: t.status,
      compliance: t.compliance,
      notes: t.notes || "",
    });
    setShowGovForm(true);
  };

  const saveGov = () => {
    const data = {
      ...govForm,
      course_hours: Number(govForm.course_hours) || 0,
      nominees_count: Number(govForm.nominees_count) || 0,
      actual_start_date: govForm.actual_start_date || null,
      actual_end_date: govForm.actual_end_date || null,
      created_by: user?.id || null,
    };
    if (editingGov) {
      localDb.governorateTraining.update(editingGov.id, data);
    } else {
      localDb.governorateTraining.insert(data);
    }
    refreshData();
    setShowGovForm(false);
    toast({ title: editingGov ? "تم تحديث البيانات" : "تم إضافة البيانات" });
  };

  const deleteGov = (id: string) => {
    localDb.governorateTraining.delete(id);
    refreshData();
    toast({ title: "تم حذف البيانات" });
  };

  const openAddWeek = () => {
    setEditingWeek(null);
    setWeekForm({ ...emptyWeekForm, governorate: selectedGov || "" });
    setShowWeekForm(true);
  };

  const openEditWeek = (w: WeekSchedule) => {
    setEditingWeek(w);
    setWeekForm({ governorate: w.governorate, week: w.week, start_date: w.start_date, end_date: w.end_date, label: w.label });
    setShowWeekForm(true);
  };

  const saveWeek = () => {
    const data = { ...weekForm, week: Number(weekForm.week) || 1 };
    if (editingWeek) {
      localDb.weekSchedules.update(editingWeek.id, data);
    } else {
      localDb.weekSchedules.insert(data);
    }
    refreshData();
    setShowWeekForm(false);
    toast({ title: editingWeek ? "تم تحديث الأسبوع" : "تم إضافة الأسبوع" });
  };

  const deleteWeek = (id: string) => {
    localDb.weekSchedules.delete(id);
    refreshData();
    toast({ title: "تم حذف الأسبوع" });
  };

  const mapColumnToField = (header: string, value: unknown): [string, unknown] | null => {
    const h = String(header).trim();
    const v = value;
    if (["اسم الدورة","الدورة","course_name"].includes(h)) return ["course_name", v];
    if (["المحافظة","governorate"].includes(h)) return ["governorate", v];
    if (["المجال","domain"].includes(h)) return ["domain", v];
    if (["الساعات","hours","course_hours"].includes(h)) return ["course_hours", Number(v) || 0];
    if (["المسار","track"].includes(h)) return ["track", v];
    if (["المرشحون","عدد المرشحين","nominees","nominees_count"].includes(h)) return ["nominees_count", Number(v) || 0];
    if (["تاريخ البدء","planned_start","start_date"].includes(h)) return ["planned_start_date", parseExcelDate(v)];
    if (["تاريخ الانتهاء","planned_end","end_date"].includes(h)) return ["planned_end_date", parseExcelDate(v)];
    if (["الحالة","status"].includes(h)) return ["status", mapStatusValue(String(v))];
    if (["الالتزام","compliance"].includes(h)) return ["compliance", mapComplianceValue(String(v))];
    if (["ملاحظات","notes"].includes(h)) return ["notes", v];
    return null;
  };

  const parseExcelDate = (v: unknown): string => {
    if (!v) return "";
    if (typeof v === "number") {
      const d = new Date((v - 25569) * 86400 * 1000);
      return d.toISOString().split("T")[0];
    }
    const s = String(v).trim();
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
    return s;
  };

  const mapStatusValue = (s: string): string => {
    const map: Record<string, string> = { "مخططة": "planned", "قيد التنفيذ": "in_progress", "مكتملة": "completed", "متأخرة": "delayed", planned: "planned", in_progress: "in_progress", completed: "completed", delayed: "delayed" };
    return map[s] || s;
  };

  const mapComplianceValue = (s: string): string => {
    const map: Record<string, string> = { "ملتزم": "on_track", "متأخر": "delayed", "مكتمل": "completed", "لم يبدأ": "not_started", on_track: "on_track", delayed: "delayed", completed: "completed", not_started: "not_started" };
    return map[s] || s;
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>, mode: "full_plan" | "gov_only") => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    setImportProgress(0);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: "array" });
      let totalImported = 0;

      if (mode === "full_plan") {
        const sheetNames = wb.SheetNames;
        localDb.trainingPlanImports.insert({ filename: file.name, sheet_count: sheetNames.length, imported_at: new Date().toISOString() });
        const totalSheets = sheetNames.length;
        for (let si = 0; si < sheetNames.length; si++) {
          const ws = wb.Sheets[sheetNames[si]];
          const rows = XLSX.utils.sheet_to_json(ws);
          for (const row of rows) {
            const record: Record<string, unknown> = {};
            for (const [header, value] of Object.entries(row as Record<string, unknown>)) {
              const mapped = mapColumnToField(header, value);
              if (mapped) record[mapped[0]] = mapped[1];
            }
            if (record.course_name || record.governorate) {
              localDb.governorateTraining.insert({
                ...emptyGovForm,
                ...record,
                created_by: user?.id || null,
              });
              totalImported++;
            }
          }
          setImportProgress(Math.round(((si + 1) / totalSheets) * 100));
        }
      } else {
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws);
        const totalRows = rows.length;
        for (let ri = 0; ri < rows.length; ri++) {
          const row = rows[ri];
          const record: Record<string, unknown> = {};
          for (const [header, value] of Object.entries(row as Record<string, unknown>)) {
            const mapped = mapColumnToField(header, value);
            if (mapped) record[mapped[0]] = mapped[1];
          }
          if (record.course_name || record.governorate) {
            localDb.governorateTraining.insert({
              ...emptyGovForm,
              ...record,
              created_by: user?.id || null,
            });
            totalImported++;
          }
          setImportProgress(Math.round(((ri + 1) / totalRows) * 100));
        }
      }

      refreshData();
      setIsImporting(false);
      setImportProgress(100);
      toast({ title: `تم استيراد ${totalImported} سجل` });
      setTimeout(() => setImportProgress(0), 2000);
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  const exportData = () => {
    const rows = filteredTrainings.map(t => ({
      "المحافظة": t.governorate,
      "اسم الدورة": t.course_name,
      "المجال": t.domain,
      "الساعات": t.course_hours,
      "المسار": trackLabels[t.track as keyof typeof trackLabels] || t.track,
      "عدد المرشحين": t.nominees_count,
      "تاريخ البدء": t.planned_start_date,
      "تاريخ الانتهاء": t.planned_end_date,
      "تاريخ البدء الفعلي": t.actual_start_date || "",
      "تاريخ الانتهاء الفعلي": t.actual_end_date || "",
      "الحالة": statusLabels[t.status as keyof typeof statusLabels] || t.status,
      "الالتزام": complianceLabels[t.compliance as keyof typeof complianceLabels] || t.compliance,
      "ملاحظات": t.notes,
    }));
    return { rows, filename: "خطة_التدريب_المحافظات", sheetName: "البيانات" };
  };

  const handleGovClick = (name: string) => {
    setSelectedGov(name);
    setFilterGov(null);
  };

  const handleStatCardClick = (statusFilter: string | null) => {
    if (!selectedGov) return;
    if (statusFilter) {
      setFilterGov(selectedGov);
      setSearch("");
      setActiveTab("dashboard");
    }
  };

  const weekSchedulesByGov = useMemo(() => {
    const grouped: Record<string, WeekSchedule[]> = {};
    for (const w of weekSchedules) {
      if (!grouped[w.governorate]) grouped[w.governorate] = [];
      grouped[w.governorate].push(w);
    }
    for (const g of Object.keys(grouped)) {
      grouped[g].sort((a, b) => a.week - b.week);
    }
    return grouped;
  }, [weekSchedules]);

  const statusFilterRef = useRef<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const displayTrainings = useMemo(() => {
    let list = filteredTrainings;
    if (statusFilter) {
      list = list.filter(t => t.status === statusFilter);
    }
    return list;
  }, [filteredTrainings, statusFilter]);

  const summaryCards = [
    { icon: BookOpen, label: "دورات مخططة", value: stats.total, gradient: "from-blue-500/10 to-blue-600/5", iconBg: "bg-blue-500/15 text-blue-600", delay: "" },
    { icon: CheckCircle2, label: "مكتملة", value: stats.completed, gradient: "from-green-500/10 to-green-600/5", iconBg: "bg-green-500/15 text-green-600", delay: "delay-75" },
    { icon: AlertTriangle, label: "متأخرة", value: stats.delayed, gradient: "from-amber-500/10 to-amber-600/5", iconBg: "bg-amber-500/15 text-amber-600", delay: "delay-150" },
    { icon: TrendingUp, label: "نسبة الالتزام", value: stats.complianceRate, gradient: "from-purple-500/10 to-purple-600/5", iconBg: "bg-purple-500/15 text-purple-600", delay: "delay-200", isPercent: true },
  ];

  return (
    <div className="space-y-3">
      <PageHeader
        title="مركز الخطة التدريبية الممتدة"
        subtitle="إدارة ومتابعة الدورات التدريبية السنوية في 19 محافظة — من التخطيط وحتى التنفيذ والالتزام"
        icon={CalendarDays}
        sections={[{ id: "map_view", label: "خارطة المحافظات" }, { id: "data_content", label: "محتوى البيانات" }]}
        exportData={exportData}
      />

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSelectedGov(null); setFilterGov(null); setStatusFilter(null); }}>
        <TabsList className="mb-3">
          <TabsTrigger value="dashboard" className="gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" />لوحة القيادة
          </TabsTrigger>
          <TabsTrigger value="entry" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />الإدخال
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" data-print-section="map_view" className="tab-content-enter">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {summaryCards.map((card) => (
              <Card key={card.label} className={`card-hover animate-slide-up ${card.delay} bg-gradient-to-br ${card.gradient} border-border/50 overflow-hidden`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
                      <p className="text-3xl font-bold">
                        <AnimatedNumber value={card.value} />
                        {card.isPercent && <span className="text-lg mr-0.5">%</span>}
                      </p>
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                      <card.icon className="w-5 h-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {!selectedGov && (
            <div className="glass rounded-xl p-3 mb-4 flex flex-wrap items-center justify-center gap-4 text-sm animate-slide-up delay-300">
              <div className="flex items-center gap-1.5 font-bold text-primary">
                <MapPin className="w-4 h-4" />العراق
              </div>
              <span className="text-muted-foreground">|</span>
              <span>19 محافظة</span>
              <span className="text-muted-foreground">|</span>
              <span><AnimatedNumber value={stats.total} /> دورة مخططة</span>
              <span className="text-muted-foreground">|</span>
              <span className="text-green-600"><AnimatedNumber value={stats.completed} /> مكتملة</span>
              <span className="text-muted-foreground">|</span>
              <span className="text-amber-600"><AnimatedNumber value={stats.delayed} /> متأخرة</span>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 min-w-0">
              <IraqMap stats={mapStats} onGovernorateClick={handleGovClick} selectedGovernorate={selectedGov} />
            </div>

            {!selectedGov && (
              <div className="lg:w-80 space-y-4 animate-slide-up delay-200">
                <Card className="border-border/50 overflow-hidden">
                  <div className="bg-gradient-to-l from-primary/5 to-accent/5 px-4 py-2.5 border-b border-border/50">
                    <h3 className="font-bold text-sm flex items-center gap-2"><Target className="w-4 h-4 text-primary" />توزيع الحالات</h3>
                  </div>
                  <CardContent className="p-4">
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                            {statusDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 mt-2">
                      {statusDistribution.map((d) => (
                        <div key={d.name} className="flex items-center gap-1.5 text-xs">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                          <span>{d.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 overflow-hidden">
                  <div className="bg-gradient-to-l from-accent/5 to-primary/5 px-4 py-2.5 border-b border-border/50">
                    <h3 className="font-bold text-sm flex items-center gap-2"><BarChart3 className="w-4 h-4 text-accent" />أكثر المحافظات</h3>
                  </div>
                  <CardContent className="p-4">
                    <div className="h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topGovChart} layout="vertical" margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" hide />
                          <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 10 }} />
                          <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={14} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {upcomingCourses.length > 0 && (
                  <Card className="border-border/50 overflow-hidden">
                    <div className="bg-gradient-to-l from-green-500/5 to-blue-500/5 px-4 py-2.5 border-b border-border/50">
                      <h3 className="font-bold text-sm flex items-center gap-2"><Clock className="w-4 h-4 text-green-600" />دورات قادمة</h3>
                    </div>
                    <CardContent className="p-3 space-y-2">
                      {upcomingCourses.map(c => (
                        <div key={c.id} className="flex items-center justify-between text-xs bg-primary/5 rounded-lg px-3 py-2 card-hover">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{c.course_name}</p>
                            <p className="text-muted-foreground">{c.governorate} • {c.planned_start_date}</p>
                          </div>
                          <StatusBadge status={statusLabels[c.status as keyof typeof statusLabels] || c.status} variant={statusColors[c.status as keyof typeof statusColors] as any} />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {selectedGov && selectedGovStats && (
            <div className="mt-4 space-y-4 animate-slide-up">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { setSelectedGov(null); setFilterGov(null); setStatusFilter(null); }}>
                  <ChevronRight className="w-4 h-4" />رجوع للخارطة
                </Button>
                <span className="font-bold text-xl gradient-text flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />{selectedGov}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className={`cursor-pointer card-hover animate-slide-up bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-border/50 ${statusFilter === null ? "ring-2 ring-primary/30" : ""}`} onClick={() => setStatusFilter(null)}>
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold"><AnimatedNumber value={selectedGovStats.total} /></p>
                    <p className="text-xs text-muted-foreground mt-1">إجمالي الدورات</p>
                  </CardContent>
                </Card>
                <Card className={`cursor-pointer card-hover animate-slide-up delay-75 bg-gradient-to-br from-green-500/10 to-green-600/5 border-border/50 ${statusFilter === "completed" ? "ring-2 ring-green-400/30" : ""}`} onClick={() => setStatusFilter(statusFilter === "completed" ? null : "completed")}>
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-green-600"><AnimatedNumber value={selectedGovStats.completed} /></p>
                    <p className="text-xs text-muted-foreground mt-1">مكتملة</p>
                  </CardContent>
                </Card>
                <Card className={`cursor-pointer card-hover animate-slide-up delay-150 bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-border/50 ${statusFilter === "delayed" ? "ring-2 ring-amber-400/30" : ""}`} onClick={() => setStatusFilter(statusFilter === "delayed" ? null : "delayed")}>
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-amber-600"><AnimatedNumber value={selectedGovStats.delayed} /></p>
                    <p className="text-xs text-muted-foreground mt-1">متأخرة</p>
                  </CardContent>
                </Card>
                <Card className="animate-slide-up delay-200 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-border/50">
                  <CardContent className="p-4 flex items-center justify-center">
                    <div className="relative">
                      <CircularProgress value={selectedGovStats.complianceRate} size={60} strokeWidth={5} color="hsl(var(--primary))" />
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{selectedGovStats.complianceRate}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mr-2">نسبة الالتزام</p>
                  </CardContent>
                </Card>
              </div>

              {selectedGovWeeks.length > 0 && (
                <Card className="border-border/50 overflow-hidden">
                  <div className="bg-gradient-to-l from-primary/5 to-accent/5 px-4 py-2.5 border-b border-border/50">
                    <h3 className="font-bold text-sm flex items-center gap-2"><Clock className="w-4 h-4 text-primary" />جدول الأسابيع</h3>
                  </div>
                  <CardContent className="p-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                      {selectedGovWeeks.map(w => (
                        <div key={w.id} className="bg-primary/5 border border-primary/10 rounded-lg p-2 text-center card-hover">
                          <p className="font-bold text-xs text-primary">الأسبوع {w.week}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{w.label}</p>
                          <p className="text-[9px] text-muted-foreground">{w.start_date}</p>
                          <p className="text-[9px] text-muted-foreground">{w.end_date}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <MonthCalendar
                trainings={selectedGovTrainings}
                weekSchedules={selectedGovWeeks}
                calMonth={calMonth}
                setCalMonth={setCalMonth}
              />

              <Card className="border-border/50 overflow-hidden">
                <div className="bg-gradient-to-l from-primary/5 to-accent/5 px-4 py-2.5 border-b border-border/50 flex items-center justify-between">
                  <h3 className="font-bold text-sm flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" />جدول الدورات</h3>
                  <Button size="sm" className="gap-1.5 animate-bounce-in" onClick={() => navigate(`/courses?search=${encodeURIComponent(selectedGov)}`)}>
                    <ExternalLink className="w-3.5 h-3.5" />الانتقال للتنفيذ
                  </Button>
                </div>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>الدورة</th>
                          <th>المجال</th>
                          <th className="text-center">المسار</th>
                          <th className="text-center">الساعات</th>
                          <th className="text-center">المرشحون</th>
                          <th className="text-center">تاريخ البدء</th>
                          <th className="text-center">تاريخ الانتهاء</th>
                          <th className="text-center">الحالة</th>
                          <th className="text-center">الالتزام</th>
                          <th className="text-center"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {(statusFilter ? selectedGovTrainings.filter(t => t.status === statusFilter) : selectedGovTrainings).map(t => (
                          <tr key={t.id} style={{ backgroundColor: getEntityColor(t.domain, 0.15), WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }} className="border-b border-border/50 hover:opacity-90">
                            <td className="font-medium">{t.course_name}</td>
                            <td>{t.domain}</td>
                            <td className="text-center">{trackLabels[t.track as keyof typeof trackLabels] || t.track}</td>
                            <td className="text-center">{t.course_hours}</td>
                            <td className="text-center">{t.nominees_count}</td>
                            <td className="text-center">{t.planned_start_date}</td>
                            <td className="text-center">{t.planned_end_date}</td>
                            <td className="text-center"><StatusBadge status={statusLabels[t.status as keyof typeof statusLabels] || t.status} variant={statusColors[t.status as keyof typeof statusColors] as any} /></td>
                            <td className="text-center"><StatusBadge status={complianceLabels[t.compliance as keyof typeof complianceLabels] || t.compliance} variant={complianceColors[t.compliance as keyof typeof complianceColors] as any} /></td>
                            <td className="text-center">
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => navigate(`/courses?search=${encodeURIComponent(t.course_name)}`)}>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {!selectedGov && (
            <div className="mt-4 space-y-4" data-print-section="data_content">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute right-2 top-2.5 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="بحث..." value={search} onChange={e => setSearch(e.target.value)} className="pr-8" />
                </div>
                <Select value={filterGov || "__all__"} onValueChange={v => setFilterGov(v === "__all__" ? null : v)}>
                  <SelectTrigger className="w-[160px]"><SelectValue placeholder="المحافظة" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">الكل</SelectItem>
                    {governorates.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <Card className="border-border/50 overflow-hidden">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>المحافظة</th>
                          <th>الدورة</th>
                          <th>المجال</th>
                          <th className="text-center">المسار</th>
                          <th className="text-center">الساعات</th>
                          <th className="text-center">المرشحون</th>
                          <th className="text-center">تاريخ البدء</th>
                          <th className="text-center">تاريخ الانتهاء</th>
                          <th className="text-center">الحالة</th>
                          <th className="text-center">الالتزام</th>
                          <th className="text-center"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTrainings.map(t => (
                          <tr key={t.id} className={`${t.status === "delayed" ? "bg-amber-500/5 border-r-amber-500" : t.status === "completed" ? "bg-green-500/5 border-r-green-500" : "border-r-transparent"}`}>
                            <td className="font-medium">{t.governorate}</td>
                            <td>{t.course_name}</td>
                            <td>{t.domain}</td>
                            <td className="text-center">{trackLabels[t.track as keyof typeof trackLabels] || t.track}</td>
                            <td className="text-center">{t.course_hours}</td>
                            <td className="text-center">{t.nominees_count}</td>
                            <td className="text-center">{t.planned_start_date}</td>
                            <td className="text-center">{t.planned_end_date}</td>
                            <td className="text-center"><StatusBadge status={statusLabels[t.status as keyof typeof statusLabels] || t.status} variant={statusColors[t.status as keyof typeof statusColors] as any} /></td>
                            <td className="text-center"><StatusBadge status={complianceLabels[t.compliance as keyof typeof complianceLabels] || t.compliance} variant={complianceColors[t.compliance as keyof typeof complianceColors] as any} /></td>
                            <td className="text-center">
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => navigate(`/courses?search=${encodeURIComponent(t.course_name)}`)}>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredTrainings.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>لا توجد بيانات</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="entry" data-print-section="data_content" className="tab-content-enter">
          <div className="space-y-4">
            {has("import_training_plan") && (
              <Card className="border-border/50 overflow-hidden animate-slide-up">
                <div className="bg-gradient-to-l from-blue-500/5 to-primary/5 px-4 py-2.5 border-b border-border/50">
                  <h3 className="font-bold text-sm flex items-center gap-2"><FileSpreadsheet className="w-4 h-4 text-primary" />استيراد من Excel</h3>
                </div>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer card-hover transition-all ${isImporting ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/30 hover:bg-primary/5"}`}
                      onClick={() => excelRef.current?.click()}
                    >
                      <Upload className={`w-10 h-10 mx-auto mb-3 ${isImporting ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
                      <p className="font-semibold text-sm">استيراد خطة تدريبية كاملة</p>
                      <p className="text-xs text-muted-foreground mt-1">ملف Excel يحتوي جميع الأوراق</p>
                      <input ref={excelRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={e => handleImportExcel(e, "full_plan")} />
                    </div>
                    <div
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer card-hover transition-all ${isImporting ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/30 hover:bg-primary/5"}`}
                      onClick={() => govExcelRef.current?.click()}
                    >
                      <FileSpreadsheet className={`w-10 h-10 mx-auto mb-3 ${isImporting ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
                      <p className="font-semibold text-sm">استيراد بيانات محافظة</p>
                      <p className="text-xs text-muted-foreground mt-1">ملف Excel بورقة واحدة</p>
                      <input ref={govExcelRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={e => handleImportExcel(e, "gov_only")} />
                    </div>
                  </div>
                  {importProgress > 0 && (
                    <div className="mt-4 animate-slide-up">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{isImporting ? "جارٍ الاستيراد..." : "تم الاستيراد"}</span>
                        <span className="font-bold text-primary">{importProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${importProgress}%` }} />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {has("add_governorate_training") && (
              <Button className="gap-1.5 animate-bounce-in" onClick={openAddGov}>
                <Plus className="w-4 h-4" />إضافة بيانات محافظة
              </Button>
            )}

            <Card className="border-border/50 overflow-hidden animate-slide-up delay-100">
              <div className="bg-gradient-to-l from-primary/5 to-accent/5 px-4 py-2.5 border-b border-border/50">
                <h3 className="font-bold text-sm flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" />بيانات الدورات</h3>
              </div>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>المحافظة</th>
                        <th>الدورة</th>
                        <th>المجال</th>
                        <th className="text-center">المسار</th>
                        <th className="text-center">الساعات</th>
                        <th className="text-center">المرشحون</th>
                        <th className="text-center">تاريخ البدء</th>
                        <th className="text-center">تاريخ الانتهاء</th>
                        <th className="text-center">الحالة</th>
                        <th className="text-center">الالتزام</th>
                        {has("edit_governorate_training") && <th className="text-center">إجراءات</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {govTrainings.map(t => (
                        <tr key={t.id} className={`${t.status === "delayed" ? "bg-amber-500/5 border-r-amber-500" : t.status === "completed" ? "bg-green-500/5 border-r-green-500" : "border-r-transparent"}`}>
                          <td className="font-medium">{t.governorate}</td>
                          <td>{t.course_name}</td>
                          <td>{t.domain}</td>
                          <td className="text-center">{trackLabels[t.track as keyof typeof trackLabels] || t.track}</td>
                          <td className="text-center">{t.course_hours}</td>
                          <td className="text-center">{t.nominees_count}</td>
                          <td className="text-center">{t.planned_start_date}</td>
                          <td className="text-center">{t.planned_end_date}</td>
                          <td className="text-center"><StatusBadge status={statusLabels[t.status as keyof typeof statusLabels] || t.status} variant={statusColors[t.status as keyof typeof statusColors] as any} /></td>
                          <td className="text-center"><StatusBadge status={complianceLabels[t.compliance as keyof typeof complianceLabels] || t.compliance} variant={complianceColors[t.compliance as keyof typeof complianceColors] as any} /></td>
                          {has("edit_governorate_training") && (
                            <td className="text-center">
                              <div className="flex justify-center gap-1">
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => openEditGov(t)}>
                                  <Pencil className="w-3.5 h-3.5" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={() => deleteGov(t.id)}>
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {govTrainings.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>لا توجد بيانات</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 overflow-hidden animate-slide-up delay-200">
              <div className="bg-gradient-to-l from-accent/5 to-primary/5 px-4 py-2.5 border-b border-border/50 flex items-center justify-between">
                <h3 className="font-bold text-sm flex items-center gap-2"><CalendarDays className="w-4 h-4 text-accent" />جدول الأسابيع</h3>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={openAddWeek}>
                  <Plus className="w-3.5 h-3.5" />إضافة أسبوع
                </Button>
              </div>
              <CardContent className="p-4">
                {Object.keys(weekSchedulesByGov).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <LayoutGrid className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p>لا توجد جداول أسابيع</p>
                  </div>
                )}

                {Object.entries(weekSchedulesByGov).map(([gov, weeks]) => (
                  <div key={gov} className="mb-4 animate-slide-up">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary" />{gov}
                    </h4>
                    <div className="grid grid-cols-7 gap-1">
                      {weeks.map(w => {
                        const startDate = new Date(w.start_date);
                        const startDay = startDate.getDay();
                        const cells = [];
                        for (let d = 0; d < 7; d++) {
                          const isWeekDay = d >= startDay && d < startDay + 7;
                          cells.push(
                            <div key={`${w.id}-${d}`} className={`h-10 rounded-md flex items-center justify-center text-[10px] transition-colors ${isWeekDay ? "bg-primary/15 text-primary font-semibold border border-primary/20" : "bg-muted/30 text-muted-foreground/40"}`}>
                              {isWeekDay ? w.week : ""}
                            </div>
                          );
                        }
                        return cells;
                      }).flat()}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {weeks.map(w => (
                        <div key={w.id} className="flex items-center gap-1.5 bg-primary/5 border border-primary/10 rounded-lg px-2 py-1 text-[10px] card-hover">
                          <span className="font-semibold text-primary">W{w.week}</span>
                          <span className="text-muted-foreground">{w.start_date} — {w.end_date}</span>
                          {w.label && <span className="text-muted-foreground">({w.label})</span>}
                          <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => openEditWeek(w)}>
                            <Pencil className="w-2.5 h-2.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-4 w-4 p-0 text-destructive" onClick={() => deleteWeek(w.id)}>
                            <Trash2 className="w-2.5 h-2.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showGovForm} onOpenChange={setShowGovForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="gradient-text text-lg">{editingGov ? "تعديل بيانات المحافظة" : "إضافة بيانات محافظة"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1"><MapPin className="w-3 h-3 text-primary" />المحافظة</Label>
              <Input value={govForm.governorate} onChange={e => setGovForm({ ...govForm, governorate: e.target.value })} className={govForm.governorate ? "border-green-500/30" : "border-destructive/30"} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1"><BookOpen className="w-3 h-3 text-primary" />اسم الدورة</Label>
              <Input value={govForm.course_name} onChange={e => setGovForm({ ...govForm, course_name: e.target.value })} className={govForm.course_name ? "border-green-500/30" : "border-destructive/30"} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">المجال</Label>
              <Input value={govForm.domain} onChange={e => setGovForm({ ...govForm, domain: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">الساعات</Label>
              <Input type="number" value={govForm.course_hours} onChange={e => setGovForm({ ...govForm, course_hours: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">المسار</Label>
              <Select value={govForm.track} onValueChange={v => setGovForm({ ...govForm, track: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="المسار الأول">المسار الأول / القاعة A</SelectItem>
                  <SelectItem value="المسار الثاني">المسار الثاني / القاعة B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">عدد المرشحين</Label>
              <Input type="number" value={govForm.nominees_count} onChange={e => setGovForm({ ...govForm, nominees_count: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1"><CalendarDays className="w-3 h-3 text-primary" />تاريخ البدء المخطط</Label>
              <Input type="date" value={govForm.planned_start_date} onChange={e => setGovForm({ ...govForm, planned_start_date: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1"><CalendarDays className="w-3 h-3 text-primary" />تاريخ الانتهاء المخطط</Label>
              <Input type="date" value={govForm.planned_end_date} onChange={e => setGovForm({ ...govForm, planned_end_date: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">تاريخ البدء الفعلي</Label>
              <Input type="date" value={govForm.actual_start_date} onChange={e => setGovForm({ ...govForm, actual_start_date: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">تاريخ الانتهاء الفعلي</Label>
              <Input type="date" value={govForm.actual_end_date} onChange={e => setGovForm({ ...govForm, actual_end_date: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">الحالة</Label>
              <Select value={govForm.status} onValueChange={v => setGovForm({ ...govForm, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">مخططة</SelectItem>
                  <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                  <SelectItem value="completed">مكتملة</SelectItem>
                  <SelectItem value="delayed">متأخرة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">الالتزام</Label>
              <Select value={govForm.compliance} onValueChange={v => setGovForm({ ...govForm, compliance: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">لم يبدأ</SelectItem>
                  <SelectItem value="on_track">ملتزم</SelectItem>
                  <SelectItem value="delayed">متأخر</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-xs">ملاحظات</Label>
              <Textarea value={govForm.notes} onChange={e => setGovForm({ ...govForm, notes: e.target.value })} rows={2} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowGovForm(false)}>إلغاء</Button>
            <Button onClick={saveGov} disabled={!govForm.governorate || !govForm.course_name}>{editingGov ? "تحديث" : "إضافة"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showWeekForm} onOpenChange={setShowWeekForm}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="gradient-text">{editingWeek ? "تعديل الأسبوع" : "إضافة أسبوع"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1"><MapPin className="w-3 h-3 text-primary" />المحافظة</Label>
              <Select value={weekForm.governorate} onValueChange={v => setWeekForm({ ...weekForm, governorate: v })}>
                <SelectTrigger><SelectValue placeholder="اختر المحافظة" /></SelectTrigger>
                <SelectContent>
                  {ALL_19_GOVERNORATES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">رقم الأسبوع</Label>
              <Input type="number" value={weekForm.week} onChange={e => setWeekForm({ ...weekForm, week: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1"><CalendarDays className="w-3 h-3 text-primary" />تاريخ البدء</Label>
              <Input type="date" value={weekForm.start_date} onChange={e => setWeekForm({ ...weekForm, start_date: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1"><CalendarDays className="w-3 h-3 text-primary" />تاريخ الانتهاء</Label>
              <Input type="date" value={weekForm.end_date} onChange={e => setWeekForm({ ...weekForm, end_date: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">الوصف</Label>
              <Input value={weekForm.label} onChange={e => setWeekForm({ ...weekForm, label: e.target.value })} placeholder="الأسبوع الأول" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowWeekForm(false)}>إلغاء</Button>
            <Button onClick={saveWeek}>{editingWeek ? "تحديث" : "إضافة"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
