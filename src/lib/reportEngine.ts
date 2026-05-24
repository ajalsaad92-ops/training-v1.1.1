// Report Engine — defines all data sources, columns, filtering, and KPI aggregation
import { localDb } from "@/lib/localStore";

export type ReportSourceKey =
  | "employees"
  | "courses"
  | "trainees"
  | "curriculum"
  | "tasks"
  | "hr_requests"
  | "correspondence"
  | "audit_log"
  | "notifications"
  | "governorate_training"
  | "followup_records";

export interface ReportColumn {
  key: string;
  label: string;
  // optional formatter (returns string for table/print)
  format?: (val: unknown, row: Record<string, unknown>) => string;
  align?: "right" | "left" | "center";
}

export interface ReportSource {
  key: ReportSourceKey;
  label: string;
  description: string;
  dateField?: string; // used for date filtering
  fetch: () => Record<string, unknown>[];
  columns: ReportColumn[];
  defaultColumns: string[];
}

const fmtDate = (v: unknown) => (v ? String(v).split("T")[0] : "—");
const fmtBool = (v: unknown) => (v ? "نعم" : "لا");

const STATUS_AR: Record<string, string> = {
  // course / task / curriculum
  planned: "مخطط",
  active: "جارية",
  completed: "منتهية",
  pending: "قيد الانتظار",
  in_progress: "قيد التنفيذ",
  review: "قيد المراجعة",
  done: "مكتمل",
  archived: "مؤرشف",
  applied: "مطبق",
  not_applied: "غير مطبق",
  waiting: "قائمة الانتظار",
  passed: "ناجح",
  failed: "غير مجتاز",
  // hr
  approved: "معتمد",
  unit_approved: "اعتمد رئيس الشعبة",
  rejected: "مرفوض",
  not_started: "لم تبدأ",
  // correspondence types
  outgoing_internal: "صادر داخلي",
  outgoing_external: "صادر خارجي",
  incoming_internal: "وارد داخلي",
  incoming_external: "وارد خارجي",
  internal: "داخلي",
  external: "خارجي",
  developmental: "تطويري",
  specialized: "تخصصي",
};

const tr = (v: unknown) => {
  const s = String(v ?? "");
  return STATUS_AR[s] || s || "—";
};

export const REPORT_SOURCES: Record<ReportSourceKey, ReportSource> = {
  employees: {
    key: "employees",
    label: "الموظفون",
    description: "كافة الموظفين والأقسام والمناصب",
    dateField: "created_at",
    fetch: () => localDb.employees.getAll(),
    columns: [
      { key: "name", label: "الاسم" },
      { key: "department", label: "القسم" },
      { key: "section", label: "الشعبة" },
      { key: "position", label: "المنصب" },
      { key: "phone", label: "الهاتف" },
      { key: "work_schedule", label: "نمط الدوام", format: (v) => ({ daily: "يومي", shift_7x7: "وردية 7×7", shift_15x15: "وردية 15×15" } as Record<string, string>)[String(v)] || String(v) },
      { key: "created_at", label: "تاريخ الإضافة", format: fmtDate },
    ],
    defaultColumns: ["name", "department", "position", "phone"],
  },
  courses: {
    key: "courses",
    label: "الدورات التدريبية",
    description: "جميع الدورات الداخلية والخارجية",
    dateField: "start_date",
    fetch: () => localDb.courses.getAll(),
    columns: [
      { key: "code", label: "الرمز" },
      { key: "title", label: "اسم الدورة" },
      { key: "type", label: "النوع", format: tr },
      { key: "training_type", label: "التصنيف", format: tr },
      { key: "venue", label: "المكان" },
      { key: "start_date", label: "البداية", format: fmtDate },
      { key: "end_date", label: "النهاية", format: fmtDate },
      { key: "trainer", label: "المدرب" },
      { key: "supervisor", label: "المشرف" },
      { key: "sponsor", label: "الجهة الراعية" },
      { key: "status", label: "الحالة", format: tr },
      { key: "estimated_budget", label: "الميزانية المقدرة" },
      { key: "actual_cost", label: "التكلفة الفعلية" },
    ],
    defaultColumns: ["code", "title", "type", "start_date", "end_date", "status", "trainer"],
  },
  trainees: {
    key: "trainees",
    label: "المتدربون",
    description: "متدربو جميع الدورات",
    dateField: "created_at",
    fetch: () => {
      const courses = localDb.courses.getAll();
      const trainees = localDb.trainees.getAll();
      return trainees.map((t: Record<string, unknown>) => {
        const c = courses.find((x: Record<string, unknown>) => x.id === t.course_id) || {};
        return { ...t, course_title: c.title || "—", course_code: c.code || "—" };
      });
    },
    columns: [
      { key: "name", label: "اسم المتدرب" },
      { key: "course_code", label: "رمز الدورة" },
      { key: "course_title", label: "الدورة" },
      { key: "status", label: "الحالة", format: tr },
      { key: "certificate_issued", label: "الشهادة", format: fmtBool },
      { key: "created_at", label: "تاريخ التسجيل", format: fmtDate },
    ],
    defaultColumns: ["name", "course_title", "status", "certificate_issued"],
  },
  curriculum: {
    key: "curriculum",
    label: "المناهج",
    description: "حالة وتقدم المناهج التدريبية",
    dateField: "created_at",
    fetch: () => localDb.curriculumItems.getAll(),
    columns: [
      { key: "title", label: "اسم المنهج" },
      { key: "type", label: "النوع", format: tr },
      { key: "executor_type", label: "جهة التنفيذ", format: tr },
      { key: "executor_name", label: "المنفذ" },
      { key: "trainer_name", label: "المدرب" },
      { key: "audience_count", label: "عدد المستهدفين" },
      { key: "hours", label: "الساعات" },
      { key: "current_stage", label: "المرحلة", format: tr },
      { key: "status", label: "الحالة", format: tr },
      { key: "audit_status", label: "حالة التدقيق", format: tr },
      { key: "applied", label: "مطبّق", format: fmtBool },
      { key: "report_uploaded", label: "تقرير", format: fmtBool },
      { key: "presentation_uploaded", label: "عرض", format: fmtBool },
      { key: "hard_copy_printed", label: "مطبوع", format: fmtBool },
      { key: "created_at", label: "أُنشئ", format: fmtDate },
    ],
    defaultColumns: ["title", "type", "current_stage", "status", "executor_name", "hours"],
  },
  tasks: {
    key: "tasks",
    label: "المهام",
    description: "كل المهام الموكّلة والروتينية",
    dateField: "created_at",
    fetch: () => {
      const profiles = localDb.profiles.getAll() as Array<{ id: string; name: string }>;
      const tasks = localDb.tasks.getAll();
      return tasks.map((t: Record<string, unknown>) => {
        const a = profiles.find((p) => p.id === t.assigned_to);
        const b = profiles.find((p) => p.id === t.assigned_by);
        return { ...t, assigned_to_name: a?.name || "—", assigned_by_name: b?.name || "—" };
      });
    },
    columns: [
      { key: "title", label: "المهمة" },
      { key: "unit", label: "الوحدة" },
      { key: "stage", label: "المرحلة", format: tr },
      { key: "status", label: "الحالة", format: tr },
      { key: "assigned_to_name", label: "المسؤول" },
      { key: "assigned_by_name", label: "أوكلت بواسطة" },
      { key: "estimated_hours", label: "الساعات المقدرة" },
      { key: "achievement_points", label: "النقاط" },
      { key: "is_routine", label: "روتينية", format: fmtBool },
      { key: "handed_over", label: "سُلّمت", format: fmtBool },
      { key: "created_at", label: "أُنشئت", format: fmtDate },
    ],
    defaultColumns: ["title", "unit", "stage", "status", "assigned_to_name", "estimated_hours"],
  },
  hr_requests: {
    key: "hr_requests",
    label: "طلبات الموارد البشرية",
    description: "إجازات وواجبات وغيابات",
    dateField: "date",
    fetch: () => localDb.hrRequests.getAll(),
    columns: [
      { key: "employee_name", label: "الموظف" },
      { key: "department", label: "القسم" },
      { key: "type", label: "نوع الطلب" },
      { key: "date", label: "التاريخ", format: fmtDate },
      { key: "approval_status", label: "الحالة العامة", format: tr },
      { key: "unit_head_status", label: "رئيس الشعبة", format: tr },
      { key: "dept_manager_status", label: "مدير القسم", format: tr },
      { key: "notes", label: "ملاحظات" },
    ],
    defaultColumns: ["employee_name", "type", "date", "approval_status"],
  },
  correspondence: {
    key: "correspondence",
    label: "المراسلات",
    description: "الصادر والوارد الداخلي والخارجي",
    dateField: "date",
    fetch: () => localDb.correspondence.getAll(),
    columns: [
      { key: "number", label: "الرقم" },
      { key: "date", label: "التاريخ", format: fmtDate },
      { key: "subject", label: "الموضوع" },
      { key: "from", label: "من" },
      { key: "to", label: "إلى" },
      { key: "type", label: "النوع", format: tr },
      { key: "status", label: "الحالة", format: tr },
      { key: "summary", label: "الملخص" },
    ],
    defaultColumns: ["number", "date", "subject", "from", "to", "status"],
  },
  audit_log: {
    key: "audit_log",
    label: "سجل النشاط",
    description: "سجل العمليات والإجراءات",
    dateField: "timestamp",
    fetch: () => localDb.auditLog.getAll(),
    columns: [
      { key: "timestamp", label: "الوقت", format: (v) => (v ? new Date(String(v)).toLocaleString("ar-SA") : "—") },
      { key: "user_name", label: "المستخدم" },
      { key: "action", label: "الإجراء" },
      { key: "target", label: "المستهدف" },
    ],
    defaultColumns: ["timestamp", "user_name", "action", "target"],
  },
  notifications: {
    key: "notifications",
    label: "الإشعارات",
    description: "الإشعارات الصادرة والمستلمة",
    dateField: "date",
    fetch: () => localDb.notifications.getAll(),
    columns: [
      { key: "date", label: "التاريخ", format: fmtDate },
      { key: "message", label: "الرسالة" },
      { key: "type", label: "النوع" },
      { key: "is_read", label: "مقروءة", format: fmtBool },
    ],
    defaultColumns: ["date", "message", "type", "is_read"],
  },
  governorate_training: {
    key: "governorate_training",
    label: "تدريب المحافظات",
    description: "الدورات التدريبية حسب المحافظة وحالة الالتزام",
    dateField: "planned_start_date",
    fetch: () => localDb.governorateTraining.getAll(),
    columns: [
      { key: "governorate", label: "المحافظة" },
      { key: "course_name", label: "اسم الدورة" },
      { key: "domain", label: "المجال" },
      { key: "course_hours", label: "الساعات" },
      { key: "track", label: "المسار" },
      { key: "nominees_count", label: "المرشحون" },
      { key: "planned_start_date", label: "البدء المخطط", format: fmtDate },
      { key: "planned_end_date", label: "الانتهاء المخطط", format: fmtDate },
      { key: "actual_start_date", label: "البدء الفعلي", format: fmtDate },
      { key: "actual_end_date", label: "الانتهاء الفعلي", format: fmtDate },
      { key: "status", label: "الحالة", format: tr },
      { key: "compliance", label: "الالتزام", format: tr },
      { key: "notes", label: "ملاحظات" },
    ],
    defaultColumns: ["governorate", "course_name", "course_hours", "planned_start_date", "status", "compliance"],
  },
  followup_records: {
    key: "followup_records",
    label: "سجلات المتابعة",
    description: "متابعة التزام المحافظات بالجدول التدريبي",
    dateField: "record_date",
    fetch: () => localDb.followUpRecords.getAll(),
    columns: [
      { key: "governorate", label: "المحافظة" },
      { key: "course_name", label: "الدورة" },
      { key: "record_date", label: "تاريخ التسجيل", format: fmtDate },
      { key: "compliance_status", label: "الالتزام", format: tr },
      { key: "notes", label: "ملاحظات" },
      { key: "recorded_by_name", label: "سجل بواسطة" },
    ],
    defaultColumns: ["governorate", "course_name", "record_date", "compliance_status", "notes"],
  },
};

export const SOURCE_LIST = Object.values(REPORT_SOURCES);

export interface ReportFilter {
  source: ReportSourceKey;
  columns: string[];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export function runReport(filter: ReportFilter) {
  const src = REPORT_SOURCES[filter.source];
  let rows = src.fetch();

  // date filter
  if ((filter.dateFrom || filter.dateTo) && src.dateField) {
    const f = filter.dateFrom ? new Date(filter.dateFrom).getTime() : -Infinity;
    const t = filter.dateTo ? new Date(filter.dateTo + "T23:59:59").getTime() : Infinity;
    rows = rows.filter((r) => {
      const v = r[src.dateField!];
      if (!v) return false;
      const ts = new Date(String(v)).getTime();
      return ts >= f && ts <= t;
    });
  }

  // search filter (across all visible columns)
  if (filter.search) {
    const q = filter.search.toLowerCase();
    rows = rows.filter((r) =>
      filter.columns.some((c) => String(r[c] ?? "").toLowerCase().includes(q))
    );
  }

  return { source: src, rows };
}

export function formatRow(src: ReportSource, row: Record<string, unknown>, columns: string[]): string[] {
  return columns.map((key) => {
    const col = src.columns.find((c) => c.key === key);
    if (!col) return String(row[key] ?? "—");
    const raw = row[key];
    if (col.format) return col.format(raw, row);
    if (raw === null || raw === undefined || raw === "") return "—";
    return String(raw);
  });
}

// ─────────────────────────────────────────────
// KPI / Executive Summary
// ─────────────────────────────────────────────

export interface KPI {
  label: string;
  value: number | string;
  hint?: string;
}

export function computeExecutiveKPIs(): {
  kpis: KPI[];
  byDept: { name: string; value: number }[];
  courseStatus: { name: string; value: number }[];
  taskStatus: { name: string; value: number }[];
  hrStatus: { name: string; value: number }[];
  govCompliance: { name: string; value: number }[];
} {
  const employees = localDb.employees.getAll();
  const courses = localDb.courses.getAll();
  const trainees = localDb.trainees.getAll();
  const curriculum = localDb.curriculumItems.getAll();
  const tasks = localDb.tasks.getAll();
  const hr = localDb.hrRequests.getAll();
  const corr = localDb.correspondence.getAll();

  const completedCourses = courses.filter((c: Record<string, unknown>) => c.status === "completed").length;
  const activeCourses = courses.filter((c: Record<string, unknown>) => c.status === "active").length;
  const totalBudget = courses.reduce((s: number, c: Record<string, unknown>) => s + Number(c.estimated_budget || 0), 0);
  const actualCost = courses.reduce((s: number, c: Record<string, unknown>) => s + Number(c.actual_cost || 0), 0);
  const completedTasks = tasks.filter((t: Record<string, unknown>) => t.status === "completed").length;
  const pendingHR = hr.filter((h: Record<string, unknown>) => h.approval_status === "pending" || h.approval_status === "unit_approved").length;
  const pendingCorr = corr.filter((c: Record<string, unknown>) => c.status === "in_progress").length;
  const certs = trainees.filter((t: Record<string, unknown>) => t.certificate_issued).length;

  const govTraining = localDb.governorateTraining.getAll();
  const govTotal = govTraining.length;
  const govCompleted = govTraining.filter((g: Record<string, unknown>) => g.status === "completed").length;
  const govDelayed = govTraining.filter((g: Record<string, unknown>) => g.compliance === "delayed").length;
  const govComplianceRate = govTotal > 0 ? Math.round(govTraining.filter((g: Record<string, unknown>) => g.compliance === "on_track" || g.compliance === "completed").length / govTotal * 100) : 0;

  const kpis: KPI[] = [
    { label: "إجمالي الموظفين", value: employees.length },
    { label: "الدورات النشطة", value: activeCourses, hint: `إجمالي ${courses.length}` },
    { label: "الدورات المنتهية", value: completedCourses },
    { label: "إجمالي المتدربين", value: trainees.length, hint: `${certs} شهادة صادرة` },
    { label: "إجمالي المناهج", value: curriculum.length, hint: `${curriculum.filter((c: Record<string, unknown>) => c.applied).length} مطبق` },
    { label: "المهام المكتملة", value: completedTasks, hint: `إجمالي ${tasks.length}` },
    { label: "طلبات HR قيد الاعتماد", value: pendingHR },
    { label: "مراسلات قيد التنفيذ", value: pendingCorr },
    { label: "الميزانية المعتمدة (ر.س)", value: totalBudget.toLocaleString("ar-SA") },
    { label: "التكلفة الفعلية (ر.س)", value: actualCost.toLocaleString("ar-SA"), hint: totalBudget > 0 ? `${Math.round((actualCost / totalBudget) * 100)}%` : "" },
    { label: "دورات المحافظات", value: govTotal, hint: `${govCompleted} مكتملة` },
    { label: "محافظات متأخرة", value: govDelayed, hint: `التزام ${govComplianceRate}%` },
  ];

  const byDeptMap: Record<string, number> = {};
  employees.forEach((e: Record<string, unknown>) => {
    const d = String(e.department || "غير محدد");
    byDeptMap[d] = (byDeptMap[d] || 0) + 1;
  });
  const byDept = Object.entries(byDeptMap).map(([name, value]) => ({ name, value }));

  const groupBy = (arr: Record<string, unknown>[], key: string) => {
    const m: Record<string, number> = {};
    arr.forEach((r) => {
      const k = STATUS_AR[String(r[key])] || String(r[key] || "—");
      m[k] = (m[k] || 0) + 1;
    });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  };

  const govComplianceMap: Record<string, number> = {};
  govTraining.forEach((g: Record<string, unknown>) => {
    const gov = String(g.governorate || "غير محدد");
    if (g.compliance === "on_track" || g.compliance === "completed") {
      govComplianceMap[gov] = (govComplianceMap[gov] || 0) + 1;
    }
  });
  const govCompliance = Object.entries(govComplianceMap).map(([name, value]) => ({ name, value }));

  return {
    kpis,
    byDept,
    courseStatus: groupBy(courses, "status"),
    taskStatus: groupBy(tasks, "status"),
    hrStatus: groupBy(hr, "approval_status"),
    govCompliance,
  };
}
