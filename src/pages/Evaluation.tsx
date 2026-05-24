import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCourses } from "@/hooks/useSupabaseData";
import { localDb } from "@/lib/localStore";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import StatusBadge from "@/components/StatusBadge";
import PageHeader from "@/components/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, Star, Users, UserCheck, Bell, Clock, ChevronDown, ChevronUp, Loader2, Plus, Trash2, ExternalLink, TrendingUp, MapPin, Target, BarChart3, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid } from "recharts";
import { QRCodeSVG } from "qrcode.react";

interface FollowUpRecord {
  id: string; governorate_training_id: string; governorate: string; course_name: string;
  record_date: string; compliance_status: string; notes: string;
  recorded_by: string; recorded_by_name: string; created_at: string;
}
interface FollowUpNotification {
  id: string; governorate: string; assigned_to: string; assigned_to_name: string;
  assigned_by: string; assigned_by_name: string; frequency: string;
  active: boolean; notes: string; created_at: string;
}

const complianceLabels: Record<string, string> = { on_track: "ملتزم", delayed: "متأخر", completed: "مكتمل", not_started: "لم يبدأ" };
const complianceColors: Record<string, string> = { on_track: "success", delayed: "warning", completed: "success", not_started: "neutral" };
const complianceDots: Record<string, string> = { on_track: "🟢", delayed: "🟡", completed: "🟢", not_started: "⬜" };
const frequencyLabels: Record<string, string> = { daily: "يومي", weekly: "أسبوعي", biweekly: "نصف شهري", monthly: "شهري" };

const emptyFollowUpForm = { governorate: "", course_name: "", record_date: new Date().toISOString().split("T")[0], compliance_status: "on_track", notes: "" };
const emptyNotifForm = { governorate: "", assigned_to: "", frequency: "weekly", notes: "" };

const ALL_19_GOVERNORATES = ["دهوك","نينوى","أربيل","السليمانية","حلبجة","كركوك","صلاح الدين","ديالى","الأنبار","بغداد","واسط","بابل","كربلاء","النجف","القادسية","ميسان","المثنى","ذي قار","البصرة"];

const GEO_LAYOUT: string[][] = [
  ["دهوك","نينوى","أربيل","السليمانية","حلبجة"],
  ["كركوك","صلاح الدين","ديالى","الأنبار","بغداد"],
  ["واسط","بابل","كربلاء","النجف","القادسية"],
  ["ميسان","المثنى","ذي قار","البصرة"],
];

const EVAL_GRADIENTS = [
  "from-blue-500 via-indigo-500 to-violet-600",
  "from-emerald-500 via-teal-500 to-cyan-600",
  "from-amber-500 via-orange-500 to-rose-500",
];

const EVAL_ICONS_BG = [
  "bg-blue-500/20",
  "bg-emerald-500/20",
  "bg-amber-500/20",
];

const PIE_COLORS = ["#22c55e","#f59e0b","#ef4444","#94a3b8"];
const BAR_COLORS = ["#3b82f6","#22c55e","#f59e0b","#94a3b8","#8b5cf6","#ec4899","#14b8a6"];

function AnimatedNumber({ value, duration = 800 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
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
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease-out" }} />
      </svg>
      <span className="absolute text-sm font-bold text-foreground">{Math.round(value)}%</span>
    </div>
  );
}

const Evaluation = () => {
  const { data: courses, loading } = useCourses();
  const { has, isManager, userId, userName } = useUserRole();
  const navigate = useNavigate();
  const [expandedType, setExpandedType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("evaluation");

  const [followUpRecords, setFollowUpRecords] = useState<FollowUpRecord[]>([]);
  const [followUpNotifs, setFollowUpNotifs] = useState<FollowUpNotification[]>([]);
  const [governorates, setGovernorates] = useState<string[]>([]);
  const [profiles, setProfiles] = useState<{ id: string; name: string }[]>([]);
  const [govCourses, setGovCourses] = useState<{ id: string; governorate: string; course_name: string }[]>([]);

  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [followUpForm, setFollowUpForm] = useState(emptyFollowUpForm);
  const [showNotifForm, setShowNotifForm] = useState(false);
  const [notifForm, setNotifForm] = useState(emptyNotifForm);
  const [qrData, setQrData] = useState<{url: string, title: string, roleName: string} | null>(null);

  const refreshData = useCallback(() => {
    setFollowUpRecords(localDb.followUpRecords.getAll());
    setFollowUpNotifs(localDb.followUpNotifications.getAll());
    const gt = localDb.governorateTraining.getAll() as Array<{ id: string; governorate: string; course_name: string }>;
    setGovCourses(gt);
    setGovernorates([...new Set(gt.map(g => g.governorate))].sort((a, b) => a.localeCompare(b, "ar")));
    setProfiles(localDb.profiles.getAll());
  }, []);

  useEffect(() => { refreshData(); }, [refreshData]);

  const coursesForGov = useMemo(() =>
    !followUpForm.governorate ? [] : govCourses.filter(c => c.governorate === followUpForm.governorate),
    [govCourses, followUpForm.governorate]);

  const govComplianceMap = useMemo(() => {
    const map: Record<string, string> = {};
    const allGov = localDb.governorateTraining.getAll() as Array<{ id: string; governorate: string; compliance: string }>;
    for (const g of allGov) {
      if (!map[g.governorate] || g.compliance === "delayed") {
        map[g.governorate] = g.compliance || "not_started";
      }
    }
    return map;
  }, [followUpRecords]);

  const barChartData = useMemo(() => {
    const counts: Record<string, { on_track: number; delayed: number; completed: number; not_started: number }> = {};
    const allGov = localDb.governorateTraining.getAll() as Array<{ id: string; governorate: string; compliance: string }>;
    for (const g of allGov) {
      if (!counts[g.governorate]) counts[g.governorate] = { on_track: 0, delayed: 0, completed: 0, not_started: 0 };
      const key = (g.compliance || "not_started") as keyof typeof counts[string];
      if (key in counts[g.governorate]) counts[g.governorate][key]++;
    }
    return Object.entries(counts).map(([gov, c]) => ({ name: gov, ملتزم: c.on_track, متأخر: c.delayed, مكتمل: c.completed, "لم يبدأ": c.not_started }));
  }, [followUpRecords]);

  const pieChartData = useMemo(() => {
    const freq: Record<string, number> = {};
    followUpNotifs.forEach(n => { const label = frequencyLabels[n.frequency] || n.frequency; freq[label] = (freq[label] || 0) + 1; });
    return Object.entries(freq).map(([name, value]) => ({ name, value }));
  }, [followUpNotifs]);

  const areaChartData = useMemo(() => {
    const byDate: Record<string, { ملتزم: number; متأخر: number }> = {};
    followUpRecords.forEach(r => {
      const d = r.record_date;
      if (!byDate[d]) byDate[d] = { ملتزم: 0, متأخر: 0 };
      if (r.compliance_status === "on_track" || r.compliance_status === "completed") byDate[d].ملتزم++;
      if (r.compliance_status === "delayed") byDate[d].متأخر++;
    });
    return Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b)).map(([date, c]) => ({ date, ...c }));
  }, [followUpRecords]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const completedCourses = courses.filter((c) => c.status === "completed");
  const followUpNeeded = completedCourses.filter((c) => {
    if (!c.end_date) return false;
    const endDate = new Date(c.end_date);
    const now = new Date();
    const diff = (now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 30;
  });

  const totalTrainees = courses.reduce((sum, c) => sum + (c.trainees?.length || 0), 0);
  const evaluationTypes = [
    { id: "trainee_evaluates_trainer", title: "تقييم المتدرب للمدرب", icon: Star, description: "يقوم المتدرب بتقييم أداء المدرب ومحتوى الدورة", count: totalTrainees || 1, completed: Math.round((totalTrainees || 1) * 0.6) },
    { id: "trainer_evaluates_trainee", title: "تقييم المدرب للمتدرب", icon: UserCheck, description: "يقوم المدرب بتقييم أداء المتدرب ومستوى تحصيله", count: totalTrainees || 1, completed: Math.round((totalTrainees || 1) * 0.75) },
    { id: "supervisor_evaluation", title: "تقييم المشرف", icon: Users, description: "يقوم المشرف بتقييم سير العملية التدريبية بشكل عام", count: courses.length || 1, completed: Math.round((courses.length || 1) * 0.7) },
  ];

  const handleSaveFollowUp = () => {
    if (!followUpForm.governorate || !followUpForm.course_name) {
      toast({ title: "خطأ", description: "يرجى اختيار المحافظة والدورة", variant: "destructive" });
      return;
    }
    const matching = govCourses.find(c => c.governorate === followUpForm.governorate && c.course_name === followUpForm.course_name);
    localDb.followUpRecords.insert({
      governorate_training_id: matching?.id || "",
      governorate: followUpForm.governorate,
      course_name: followUpForm.course_name,
      record_date: followUpForm.record_date,
      compliance_status: followUpForm.compliance_status,
      notes: followUpForm.notes,
      recorded_by: userId,
      recorded_by_name: userName,
    });
    if (matching) localDb.governorateTraining.update(matching.id, { compliance: followUpForm.compliance_status });

    const assigned = followUpNotifs.filter(n => n.governorate === followUpForm.governorate && n.active);
    for (const nf of assigned) {
      localDb.notifications.insert({
        user_id: nf.assigned_to,
        message: `متابعة ${followUpForm.governorate}: ${complianceLabels[followUpForm.compliance_status]} — ${followUpForm.course_name}`,
        type: followUpForm.compliance_status === "delayed" ? "warning" : "info",
        link: "/training-plan",
      });
    }
    toast({ title: "تم", description: "تم تسجيل المتابعة" });
    setShowFollowUpForm(false);
    setFollowUpForm(emptyFollowUpForm);
    refreshData();
  };

  const handleSaveNotif = () => {
    const u = profiles.find(p => p.id === notifForm.assigned_to);
    if (!notifForm.governorate || !notifForm.assigned_to) {
      toast({ title: "خطأ", description: "يرجى اختيار المحافظة والمستخدم", variant: "destructive" });
      return;
    }
    localDb.followUpNotifications.insert({
      governorate: notifForm.governorate,
      assigned_to: notifForm.assigned_to,
      assigned_to_name: u?.name || "",
      assigned_by: userId,
      assigned_by_name: userName,
      frequency: notifForm.frequency,
      active: true,
      notes: notifForm.notes,
    });
    toast({ title: "تم", description: "تم إعداد إشعار المتابعة" });
    setShowNotifForm(false);
    setNotifForm(emptyNotifForm);
    refreshData();
  };

  const handleDeleteNotif = (id: string) => {
    localDb.followUpNotifications.delete(id);
    toast({ title: "تم", description: "تم حذف إعداد الإشعار" });
    refreshData();
  };

  const handleToggleNotif = (id: string, active: boolean) => {
    localDb.followUpNotifications.update(id, { active: !active });
    refreshData();
  };

  const tabItems = [
    { value: "evaluation", label: "التقييم", icon: ClipboardCheck },
    { value: "followup", label: "متابعة المحافظات", icon: Bell },
  ] as const;

  const getGovStatus = (gov: string) => govComplianceMap[gov] || "not_started";
  const statusRingClass = (status: string) => {
    if (status === "on_track" || status === "completed") return "ring-2 ring-emerald-400/60";
    if (status === "delayed") return "ring-2 ring-amber-400/60";
    return "ring-2 ring-muted/40";
  };

  const lastFollowUpForGov = (gov: string) => {
    const recs = followUpRecords.filter(r => r.governorate === gov);
    if (!recs.length) return null;
    return recs.sort((a, b) => b.record_date.localeCompare(a.record_date))[0];
  };

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <div className="text-center mb-2">
        <h1 className="text-2xl md:text-3xl font-extrabold gradient-text">مركز التقييم والمتابعة</h1>
        <p className="text-sm text-muted-foreground mt-1">نماذج التقييم ومتابعة أثر التدريب ومدى التزام المحافظات بالخطط التدريبية</p>
      </div>

      <PageHeader title="التقييم والمتابعة" subtitle="نماذج التقييم ومتابعة أثر التدريب والمحافظات" icon={ClipboardCheck} sections={[
        { id: "tabs_nav", label: "التبويبات" },
        { id: "evaluation_types", label: "أنواع التقييم" },
        { id: "follow_up", label: "المتابعة" },
      ]} exportData={() => ({
        filename: "evaluation",
        rows: activeTab === "followup"
          ? followUpRecords.map(r => ({ المحافظة: r.governorate, "اسم الدورة": r.course_name, "تاريخ التسجيل": r.record_date, "حالة الالتزام": complianceLabels[r.compliance_status] || r.compliance_status, ملاحظات: r.notes, "سجل بواسطة": r.recorded_by_name }))
          : courses.map(c => ({ الدورة: c.title, المدرب: c.trainer || "", الحالة: c.status, المتدربون: c.trainees?.length || 0, البداية: c.start_date, النهاية: c.end_date }))
      })} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted/50 p-1.5 no-print">
          {tabItems.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-3 py-1.5">
              <tab.icon className="w-3.5 h-3.5" /><span className="whitespace-nowrap">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="evaluation" className="mt-4 tab-content-enter">
          <div data-print-section="evaluation_types" className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
            {evaluationTypes.map((et, idx) => {
              const pct = et.count > 0 ? Math.round((et.completed / et.count) * 100) : 0;
              const gradIdx = idx % EVAL_GRADIENTS.length;
              return (
                <div
                  key={et.id}
                  className={`animate-slide-up delay-${idx * 150 + 75} card-hover bg-card rounded-2xl border border-border overflow-hidden cursor-pointer`}
                  onClick={() => setExpandedType(expandedType === et.id ? null : et.id)}
                >
                  <div className={`bg-gradient-to-l ${EVAL_GRADIENTS[gradIdx]} px-5 pt-5 pb-8 relative overflow-hidden`}>
                    <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3" />
                    <div className="relative flex items-center justify-between">
                      <div className={`${EVAL_ICONS_BG[gradIdx]} w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-sm`}>
                        <et.icon className="w-7 h-7 text-white" />
                      </div>
                      <ChevronDown className={`w-5 h-5 text-white/70 transition-transform ${expandedType === et.id ? "rotate-180" : ""}`} />
                    </div>
                  </div>
                  <div className="px-5 -mt-4 relative">
                    <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
                      <h3 className="font-bold text-base text-foreground">{et.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{et.description}</p>
                      <div className="flex items-center justify-between mt-4">
                        <div>
                          <div className="text-2xl font-extrabold text-foreground animate-count-up">
                            <AnimatedNumber value={et.completed} />
                          </div>
                          <div className="text-xs text-muted-foreground">من أصل <AnimatedNumber value={et.count} /></div>
                        </div>
                        <CircularProgress value={pct} size={64} strokeWidth={5} color={pct >= 70 ? "hsl(var(--success))" : pct >= 40 ? "hsl(var(--warning))" : "hsl(var(--destructive))"} />
                      </div>
                      <div className="mt-3 w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-l ${EVAL_GRADIENTS[gradIdx]} transition-all duration-700`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                  {expandedType === et.id && (
                    <div className="px-5 pb-4 pt-1 space-y-2 animate-slide-down">
                      {completedCourses.length > 0 ? completedCourses.map((c) => (
                        <div key={c.id} className="flex items-center justify-between bg-muted/30 rounded-lg p-2.5 hover:bg-muted/50 transition-colors">
                          <span className="text-sm text-foreground">{c.title}</span>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="h-7 text-[10px] px-2" onClick={(e) => {
                              e.stopPropagation();
                              const role = et.id === "trainee_evaluates_trainer" ? "trainee" : et.id === "trainer_evaluates_trainee" ? "trainer" : "supervisor";
                              const roleName = et.id === "trainee_evaluates_trainer" ? "المتدرب" : et.id === "trainer_evaluates_trainee" ? "المدرب" : "المشرف";
                              const url = new URL(`${window.location.origin}/survey/${c.id}/${role}`);
                              url.searchParams.set("name", c.title || "");
                              url.searchParams.set("date", c.start_date || "");
                              setQrData({ url: url.toString(), title: c.title, roleName });
                            }}>عرض الباركود</Button>
                            <StatusBadge status="مكتمل" variant="success" />
                          </div>
                        </div>
                      )) : <p className="text-sm text-muted-foreground">لا توجد دورات مكتملة</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div data-print-section="follow_up" className="mt-6 animate-slide-up delay-300">
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="bg-gradient-to-l from-amber-500/10 via-orange-500/10 to-rose-500/10 px-5 py-4 border-b border-border">
                <h2 className="font-bold text-foreground flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-warning/20 flex items-center justify-center"><Clock className="w-5 h-5 text-warning" /></div>
                  تتبع أثر التدريب
                </h2>
                <p className="text-xs text-muted-foreground mt-1.5 mr-11">الدورات التي مضى عليها 30 يوماً بعد الانتهاء ويجب متابعة أثرها التدريبي</p>
              </div>
              <div className="p-5">
                {followUpNeeded.length > 0 ? (
                  <div className="relative">
                    <div className="absolute right-[19px] top-3 bottom-3 w-0.5 bg-warning/20" />
                    <div className="space-y-4">
                      {followUpNeeded.map((c, idx) => (
                        <div key={c.id} className={`animate-slide-up delay-${idx * 100 + 75} relative flex gap-4 items-start`}>
                          <div className="relative z-10 w-10 h-10 rounded-full bg-warning/15 border-2 border-warning/40 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-warning">{idx + 1}</span>
                          </div>
                          <div className="flex-1 bg-warning/5 border border-warning/20 rounded-xl p-4 hover:border-warning/40 transition-colors">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-foreground">{c.title}</p>
                              <StatusBadge status="يحتاج متابعة" variant="warning" />
                            </div>
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />انتهت: {c.end_date}</span>
                              <span className="flex items-center gap-1"><UserCheck className="w-3 h-3" />ناجح: {(c.trainees || []).filter((t) => t.status === "passed").length}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                      <Target className="w-8 h-8 text-success/40" />
                    </div>
                    <p className="font-medium">لا توجد دورات تحتاج متابعة حالياً</p>
                    <p className="text-xs mt-1">جميع الدورات المكتملة في فترة المتابعة</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="followup" className="mt-4 tab-content-enter">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3 no-print">
              {has("record_followup") && (
                <Button size="sm" className="gap-2 bg-gradient-to-l from-primary to-primary/80" onClick={() => { setFollowUpForm(emptyFollowUpForm); setShowFollowUpForm(true); }}>
                  <Plus className="w-4 h-4" />تسجيل متابعة</Button>
              )}
              {has("manage_followup") && (
                <Button variant="outline" size="sm" className="gap-2" onClick={() => { setNotifForm(emptyNotifForm); setShowNotifForm(true); }}>
                  <Bell className="w-4 h-4" />إعداد إشعار متابعة</Button>
              )}
            </div>

            <div className="animate-slide-up delay-75">
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="bg-gradient-to-l from-primary/5 via-accent/5 to-primary/5 px-5 py-4 border-b border-border">
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center"><MapPin className="w-5 h-5 text-primary" /></div>
                    خريطة التزام المحافظات
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 mr-11">الحالة الحالية لالتزام المحافظات بالخطط التدريبية</p>
                </div>
                <div className="p-5">
                  <div className="space-y-3">
                    {GEO_LAYOUT.map((row, rowIdx) => (
                      <div key={rowIdx} className="flex flex-wrap gap-2.5 justify-center">
                        {row.map((gov, govIdx) => {
                          const status = getGovStatus(gov);
                          const lastRec = lastFollowUpForGov(gov);
                          return (
                            <div
                              key={gov}
                              className={`animate-slide-up delay-${(rowIdx * 5 + govIdx) * 50 + 75} group w-[100px] bg-card rounded-xl border border-border p-2.5 text-center card-hover cursor-pointer ${statusRingClass(status)}`}
                              onClick={() => navigate(`/training-plan?gov=${encodeURIComponent(gov)}`)}
                            >
                              <div className="text-lg mb-0.5">{complianceDots[status]}</div>
                              <div className="text-[11px] font-bold text-foreground leading-tight truncate" title={gov}>{gov}</div>
                              <div className="text-[9px] text-muted-foreground mt-0.5">
                                {lastRec ? lastRec.record_date.slice(5) : "—"}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center gap-5 mt-4 pt-3 border-t border-border">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">🟢 ملتزم</span>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">🟡 متأخر</span>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">⬜ لم يبدأ</span>
                  </div>
                </div>
              </div>
            </div>

            {barChartData.length > 0 && (
              <div className="animate-slide-up delay-150">
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  <div className="px-5 py-3 border-b border-border">
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary" />الالتزام حسب المحافظة</h3>
                  </div>
                  <div className="p-4 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barChartData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis dataKey="name" type="category" width={70} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                        <RechartsTooltip contentStyle={{ fontSize: 11, direction: "rtl" }} />
                        <Bar dataKey="ملتزم" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="متأخر" stackId="a" fill="#f59e0b" />
                        <Bar dataKey="مكتمل" stackId="a" fill="#3b82f6" />
                        <Bar dataKey="لم يبدأ" stackId="a" fill="#94a3b8" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
              {pieChartData.length > 0 && (
                <div className="animate-slide-up delay-200">
                  <div className="bg-card rounded-2xl border border-border overflow-hidden h-full">
                    <div className="px-5 py-3 border-b border-border">
                      <h3 className="font-bold text-sm text-foreground flex items-center gap-2"><Activity className="w-4 h-4 text-primary" />تكرار المتابعة</h3>
                    </div>
                    <div className="p-4 h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`}>
                            {pieChartData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                          </Pie>
                          <RechartsTooltip contentStyle={{ fontSize: 11, direction: "rtl" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {areaChartData.length > 0 && (
                <div className="animate-slide-up delay-300">
                  <div className="bg-card rounded-2xl border border-border overflow-hidden h-full">
                    <div className="px-5 py-3 border-b border-border">
                      <h3 className="font-bold text-sm text-foreground flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" />اتجاه الالتزام</h3>
                    </div>
                    <div className="p-4 h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={areaChartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="date" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                          <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                          <RechartsTooltip contentStyle={{ fontSize: 11, direction: "rtl" }} />
                          <Area type="monotone" dataKey="ملتزم" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} strokeWidth={2} />
                          <Area type="monotone" dataKey="متأخر" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="animate-slide-up delay-200">
              <Card>
                <div className="bg-primary/5 px-5 py-3 border-b border-border">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2"><Clock className="w-4 h-4 text-primary" />سجلات المتابعة</h3>
                </div>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs data-table">
                      <thead>
                        <tr className="border-b border-border/50 bg-muted/20">
                          <th className="px-3 py-2 text-start font-semibold text-foreground">المحافظة</th>
                          <th className="px-3 py-2 text-start font-semibold text-foreground">الدورة</th>
                          <th className="px-3 py-2 text-center font-semibold text-foreground whitespace-nowrap">تاريخ التسجيل</th>
                          <th className="px-3 py-2 text-center font-semibold text-foreground">الالتزام</th>
                          <th className="px-3 py-2 text-start font-semibold text-foreground">ملاحظات</th>
                          <th className="px-3 py-2 text-start font-semibold text-foreground">سجل بواسطة</th>
                          <th className="px-3 py-2 text-center font-semibold text-foreground">الخطة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {followUpRecords.length > 0 ? followUpRecords.map(r => (
                          <tr key={r.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                            <td className="px-3 py-1.5 font-medium text-foreground">
                              <span className="flex items-center gap-1.5">{complianceDots[r.compliance_status]} {r.governorate}</span>
                            </td>
                            <td className="px-3 py-1.5 text-foreground">{r.course_name}</td>
                            <td className="px-3 py-1.5 text-center whitespace-nowrap">{r.record_date}</td>
                            <td className="px-3 py-1.5 text-center"><StatusBadge status={complianceLabels[r.compliance_status] || r.compliance_status} variant={complianceColors[r.compliance_status] as "success" | "warning" | "info" | "neutral"} /></td>
                            <td className="px-3 py-1.5 text-muted-foreground " title={r.notes}>{r.notes}</td>
                            <td className="px-3 py-1.5 text-muted-foreground">{r.recorded_by_name}</td>
                            <td className="px-3 py-1.5 text-center">
                              <button onClick={() => navigate(`/training-plan?gov=${encodeURIComponent(r.governorate)}`)} className="text-primary hover:text-primary/80"><ExternalLink className="w-3.5 h-3.5" /></button></td>
                          </tr>
                        )) : <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">لا توجد سجلات متابعة</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {isManager && (
              <div className="animate-slide-up delay-300">
                <Card>
                  <div className="bg-warning/5 px-5 py-3 border-b border-border">
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-2"><Bell className="w-4 h-4 text-warning" />إعدادات إشعارات المتابعة</h3>
                  </div>
                  <CardContent className="p-4">
                    {followUpNotifs.length > 0 ? (
                      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3">
                        {followUpNotifs.map(n => (
                          <div key={n.id} className="bg-card rounded-xl border border-border p-4 flex items-start justify-between gap-3 card-hover">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="text-[10px]">{n.governorate}</Badge>
                                <Badge variant="secondary" className="text-[10px]">{frequencyLabels[n.frequency] || n.frequency}</Badge>
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarFallback className="text-[10px]">{n.assigned_to_name?.charAt(0) || "?"}</AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-foreground font-medium truncate">{n.assigned_to_name}</span>
                              </div>
                              {n.notes && <p className="text-[10px] text-muted-foreground mt-1.5 truncate" title={n.notes}>{n.notes}</p>}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Switch checked={n.active} onCheckedChange={() => handleToggleNotif(n.id, n.active)} />
                              <button onClick={() => handleDeleteNotif(n.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center py-6 text-sm text-muted-foreground">لا توجد إعدادات إشعارات</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {!isManager && (
              <div className="animate-slide-up delay-300">
                <Card>
                  <div className="bg-info/5 px-5 py-3 border-b border-border">
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-2"><Bell className="w-4 h-4 text-info" />مهام المتابعة المسندة إليّ</h3>
                  </div>
                  <CardContent className="p-4">
                    {(() => {
                      const mine = followUpNotifs.filter(n => n.assigned_to === userId && n.active);
                      return mine.length > 0 ? (
                        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3">
                          {mine.map(n => (
                            <div key={n.id} className="bg-card rounded-xl border border-border p-4 card-hover">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="text-[10px]">{n.governorate}</Badge>
                                <Badge variant="secondary" className="text-[10px]">{frequencyLabels[n.frequency] || n.frequency}</Badge>
                                <span className="badge-info text-[10px]">نشط</span>
                              </div>
                              {n.notes && <p className="text-[10px] text-muted-foreground mt-2 truncate" title={n.notes}>{n.notes}</p>}
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-center py-6 text-sm text-muted-foreground">لا توجد مهام متابعة مسندة إليك</p>;
                    })()}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <Dialog open={showFollowUpForm} onOpenChange={setShowFollowUpForm}>
            <DialogContent className="max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-primary" />تسجيل متابعة</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div><Label className="text-xs">المحافظة</Label>
                  <Select value={followUpForm.governorate} onValueChange={v => setFollowUpForm({ ...followUpForm, governorate: v, course_name: "" })}>
                    <SelectTrigger className="mt-1 text-xs"><SelectValue placeholder="اختر المحافظة" /></SelectTrigger>
                    <SelectContent>{governorates.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select></div>
                <div><Label className="text-xs">الدورة</Label>
                  <Select value={followUpForm.course_name} onValueChange={v => setFollowUpForm({ ...followUpForm, course_name: v })} disabled={!followUpForm.governorate}>
                    <SelectTrigger className="mt-1 text-xs"><SelectValue placeholder="اختر الدورة" /></SelectTrigger>
                    <SelectContent>{coursesForGov.map(c => <SelectItem key={c.id} value={c.course_name}>{c.course_name}</SelectItem>)}</SelectContent></Select></div>
                <div><Label className="text-xs">تاريخ التسجيل</Label>
                  <Input type="date" value={followUpForm.record_date} onChange={e => setFollowUpForm({ ...followUpForm, record_date: e.target.value })} className="mt-1 text-xs" /></div>
                <div><Label className="text-xs">حالة الالتزام</Label>
                  <Select value={followUpForm.compliance_status} onValueChange={v => setFollowUpForm({ ...followUpForm, compliance_status: v })}>
                    <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="on_track">ملتزم</SelectItem>
                      <SelectItem value="delayed">متأخر</SelectItem>
                      <SelectItem value="completed">مكتمل</SelectItem>
                      <SelectItem value="not_started">لم يبدأ</SelectItem>
                    </SelectContent></Select></div>
                <div><Label className="text-xs">ملاحظات</Label>
                  <Textarea value={followUpForm.notes} onChange={e => setFollowUpForm({ ...followUpForm, notes: e.target.value })} className="mt-1 text-xs" rows={2} /></div>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={() => setShowFollowUpForm(false)}>إلغاء</Button>
                <Button size="sm" onClick={handleSaveFollowUp} disabled={!followUpForm.governorate || !followUpForm.course_name}>تسجيل</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={!!qrData} onOpenChange={() => setQrData(null)}>
            <DialogContent className="max-w-sm flex flex-col items-center justify-center p-6" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-center">استمارة تقييم {qrData?.roleName}</DialogTitle>
              </DialogHeader>
              <p className="text-sm font-bold text-primary mb-4">{qrData?.title}</p>
              {qrData && (
                <div className="bg-white p-4 rounded-xl border border-border shadow-sm mb-4">
                  <QRCodeSVG value={qrData.url} size={200} level="M" />
                </div>
              )}
              <p className="text-xs text-muted-foreground text-center">امسح الباركود باستخدام كاميرا الهاتف للوصول إلى الاستمارة والمشاركة في التقييم من خلال الشبكة المحلية.</p>
            </DialogContent>
          </Dialog>

          <Dialog open={showNotifForm} onOpenChange={setShowNotifForm}>
            <DialogContent className="max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Bell className="w-5 h-5 text-primary" />إعداد إشعار متابعة</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div><Label className="text-xs">المحافظة</Label>
                  {governorates.length > 0 ? (
                    <Select value={notifForm.governorate} onValueChange={v => setNotifForm({ ...notifForm, governorate: v })}>
                      <SelectTrigger className="mt-1 text-xs"><SelectValue placeholder="اختر المحافظة" /></SelectTrigger>
                      <SelectContent>{governorates.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select>
                  ) : <Input value={notifForm.governorate} onChange={e => setNotifForm({ ...notifForm, governorate: e.target.value })} className="mt-1 text-xs" placeholder="أدخل اسم المحافظة" />}</div>
                <div><Label className="text-xs">المستخدم المكلف</Label>
                  <Select value={notifForm.assigned_to} onValueChange={v => setNotifForm({ ...notifForm, assigned_to: v })}>
                    <SelectTrigger className="mt-1 text-xs"><SelectValue placeholder="اختر المستخدم" /></SelectTrigger>
                    <SelectContent>{profiles.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
                <div><Label className="text-xs">التكرار</Label>
                  <Select value={notifForm.frequency} onValueChange={v => setNotifForm({ ...notifForm, frequency: v })}>
                    <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">يومي</SelectItem>
                      <SelectItem value="weekly">أسبوعي</SelectItem>
                      <SelectItem value="biweekly">نصف شهري</SelectItem>
                      <SelectItem value="monthly">شهري</SelectItem>
                    </SelectContent></Select></div>
                <div><Label className="text-xs">ملاحظات</Label>
                  <Textarea value={notifForm.notes} onChange={e => setNotifForm({ ...notifForm, notes: e.target.value })} className="mt-1 text-xs" rows={2} /></div>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={() => setShowNotifForm(false)}>إلغاء</Button>
                <Button size="sm" onClick={handleSaveNotif} disabled={!notifForm.governorate || !notifForm.assigned_to}>حفظ</Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Evaluation;


