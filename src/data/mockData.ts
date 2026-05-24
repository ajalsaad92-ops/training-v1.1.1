export interface Employee {
  id: string;
  name: string;
  department: string;
  section: string;
  position: string;
  phone: string;
}

export interface Course {
  id: string;
  title: string;
  code: string;
  type: "internal" | "external";
  trainingType: "developmental" | "specialized";
  venue: string;
  startDate: string;
  endDate: string;
  trainer: string;
  supervisor: string;
  sponsor: string;
  status: "active" | "completed" | "planned";
  estimatedBudget: number;
  actualCost: number;
  trainees: Trainee[];
}

export interface Trainee {
  id: string;
  employeeId: string;
  name: string;
  status: "passed" | "failed" | "waiting";
  certificateIssued: boolean;
}

export interface HRRequest {
  id: string;
  employeeName: string;
  department: string;
  type: string;
  date: string;
  approvalStatus: "pending" | "unit_approved" | "approved" | "rejected";
  notes: string;
}

export interface CurriculumItem {
  id: string;
  title: string;
  goals: string;
  targetAudience: string;
  count: number;
  trainingStyle: string;
  type: "developmental" | "specialized";
  status: "applied" | "not_applied";
  reportUploaded: boolean;
  presentationUploaded: boolean;
}

export interface CorrespondenceItem {
  id: string;
  number: string;
  date: string;
  subject: string;
  from: string;
  to: string;
  type: "outgoing_internal" | "outgoing_external" | "incoming_internal" | "incoming_external";
  status: "done" | "in_progress" | "archived";
  summary: string;
}

export interface AuditEntry {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  message: string;
  type: "warning" | "info" | "danger";
  date: string;
  user_id?: string | null;
  is_read?: boolean;
  created_at?: string;
}

export const employees: Employee[] = [
  { id: "1", name: "أحمد محمد العلي", department: "التدريب والتطوير", section: "المناهج", position: "مدرب أول", phone: "0501234567" },
  { id: "2", name: "فاطمة حسن الأمير", department: "التدريب والتطوير", section: "الإعداد", position: "مشرف تدريب", phone: "0507654321" },
  { id: "3", name: "خالد عبدالله السعيد", department: "الموارد البشرية", section: "شؤون الموظفين", position: "رئيس قسم", phone: "0509876543" },
  { id: "4", name: "نورة سعد المالكي", department: "التدريب والتطوير", section: "التنفيذ", position: "منسق تدريب", phone: "0502345678" },
  { id: "5", name: "محمد علي الزهراني", department: "التدريب والتطوير", section: "المناهج", position: "مدرب", phone: "0503456789" },
  { id: "6", name: "سارة يوسف القحطاني", department: "الإدارة العامة", section: "الأرشيف", position: "إداري", phone: "0504567890" },
  { id: "7", name: "عبدالرحمن فهد الشمري", department: "التدريب والتطوير", section: "التقييم", position: "مقيّم", phone: "0505678901" },
  { id: "8", name: "هند ماجد العتيبي", department: "المالية", section: "الميزانية", position: "محاسب", phone: "0506789012" },
];

export const courses: Course[] = [
  {
    id: "1", title: "إدارة المشاريع الاحترافية", code: "PMP-001", type: "internal", trainingType: "developmental",
    venue: "قاعة التدريب الرئيسية", startDate: "2026-02-20", endDate: "2026-02-25",
    trainer: "أحمد محمد العلي", supervisor: "فاطمة حسن الأمير", sponsor: "وزارة التعليم",
    status: "active", estimatedBudget: 50000, actualCost: 42000,
    trainees: [
      { id: "t1", employeeId: "3", name: "خالد عبدالله السعيد", status: "waiting", certificateIssued: false },
      { id: "t2", employeeId: "4", name: "نورة سعد المالكي", status: "waiting", certificateIssued: false },
    ],
  },
  {
    id: "2", title: "الأمن السيبراني المتقدم", code: "CS-002", type: "external", trainingType: "specialized",
    venue: "مركز التدريب التقني", startDate: "2026-03-01", endDate: "2026-03-05",
    trainer: "محمد علي الزهراني", supervisor: "أحمد محمد العلي", sponsor: "الهيئة الوطنية",
    status: "planned", estimatedBudget: 75000, actualCost: 0,
    trainees: [
      { id: "t3", employeeId: "6", name: "سارة يوسف القحطاني", status: "waiting", certificateIssued: false },
    ],
  },
  {
    id: "3", title: "مهارات القيادة والإدارة", code: "LD-003", type: "internal", trainingType: "developmental",
    venue: "القاعة الذكية", startDate: "2026-01-10", endDate: "2026-01-15",
    trainer: "فاطمة حسن الأمير", supervisor: "خالد عبدالله السعيد", sponsor: "داخلي",
    status: "completed", estimatedBudget: 30000, actualCost: 28500,
    trainees: [
      { id: "t4", employeeId: "7", name: "عبدالرحمن فهد الشمري", status: "passed", certificateIssued: true },
      { id: "t5", employeeId: "8", name: "هند ماجد العتيبي", status: "passed", certificateIssued: true },
      { id: "t6", employeeId: "5", name: "محمد علي الزهراني", status: "failed", certificateIssued: false },
    ],
  },
  {
    id: "4", title: "تحليل البيانات وذكاء الأعمال", code: "DA-004", type: "external", trainingType: "specialized",
    venue: "أكاديمية البيانات", startDate: "2026-03-15", endDate: "2026-03-20",
    trainer: "خبير خارجي", supervisor: "فاطمة حسن الأمير", sponsor: "صندوق التنمية",
    status: "planned", estimatedBudget: 90000, actualCost: 0,
    trainees: [],
  },
  {
    id: "5", title: "خدمة العملاء المتميزة", code: "CS-005", type: "internal", trainingType: "developmental",
    venue: "قاعة التدريب ب", startDate: "2026-02-18", endDate: "2026-02-19",
    trainer: "نورة سعد المالكي", supervisor: "أحمد محمد العلي", sponsor: "داخلي",
    status: "active", estimatedBudget: 15000, actualCost: 12000,
    trainees: [
      { id: "t7", employeeId: "1", name: "أحمد محمد العلي", status: "waiting", certificateIssued: false },
    ],
  },
];

export const hrRequests: HRRequest[] = [
  { id: "1", employeeName: "أحمد محمد العلي", department: "التدريب", type: "إجازة اعتيادية", date: "2026-02-15", approvalStatus: "pending", notes: "إجازة لمدة 3 أيام" },
  { id: "2", employeeName: "فاطمة حسن الأمير", department: "التدريب", type: "واجب", date: "2026-02-14", approvalStatus: "unit_approved", notes: "زيارة ميدانية" },
  { id: "3", employeeName: "خالد عبدالله السعيد", department: "الموارد البشرية", type: "إجازة مرضية", date: "2026-02-13", approvalStatus: "approved", notes: "تقرير طبي مرفق" },
  { id: "4", employeeName: "نورة سعد المالكي", department: "التدريب", type: "خروجية", date: "2026-02-15", approvalStatus: "pending", notes: "مراجعة جهة حكومية" },
  { id: "5", employeeName: "محمد علي الزهراني", department: "التدريب", type: "إضافي", date: "2026-02-12", approvalStatus: "rejected", notes: "عمل إضافي يوم الخميس" },
  { id: "6", employeeName: "سارة يوسف القحطاني", department: "الإدارة", type: "غياب", date: "2026-02-11", approvalStatus: "approved", notes: "غياب بدون عذر" },
];

export const curriculumItems: CurriculumItem[] = [
  { id: "1", title: "منهج إدارة المشاريع", goals: "تأهيل المتدربين لاختبار PMP", targetAudience: "مدراء المشاريع", count: 25, trainingStyle: "ورشة عمل", type: "developmental", status: "applied", reportUploaded: true, presentationUploaded: true },
  { id: "2", title: "منهج الأمن السيبراني", goals: "رفع الوعي الأمني", targetAudience: "جميع الموظفين", count: 50, trainingStyle: "محاضرة", type: "specialized", status: "applied", reportUploaded: false, presentationUploaded: true },
  { id: "3", title: "منهج القيادة", goals: "تطوير المهارات القيادية", targetAudience: "رؤساء الأقسام", count: 15, trainingStyle: "تدريب تفاعلي", type: "developmental", status: "not_applied", reportUploaded: false, presentationUploaded: false },
  { id: "4", title: "منهج تحليل البيانات", goals: "إتقان أدوات التحليل", targetAudience: "المحللون", count: 20, trainingStyle: "ورشة عملية", type: "specialized", status: "applied", reportUploaded: true, presentationUploaded: true },
];

export const correspondenceItems: CorrespondenceItem[] = [
  { id: "1", number: "ص/2026/001", date: "2026-02-10", subject: "طلب تنسيق برنامج تدريبي", from: "إدارة التدريب", to: "وزارة التعليم", type: "outgoing_external", status: "in_progress", summary: "التنسيق لعقد برنامج تدريبي مشترك" },
  { id: "2", number: "و/2026/015", date: "2026-02-08", subject: "الموافقة على الميزانية التدريبية", from: "الإدارة المالية", to: "إدارة التدريب", type: "incoming_internal", status: "done", summary: "تمت الموافقة على ميزانية الربع الأول" },
  { id: "3", number: "ص/2026/002", date: "2026-02-12", subject: "دعوة لحضور ملتقى تدريبي", from: "إدارة التدريب", to: "فروع المحافظات", type: "outgoing_internal", status: "in_progress", summary: "دعوة لحضور الملتقى السنوي" },
  { id: "4", number: "و/2026/020", date: "2026-02-05", subject: "تقرير إنجاز سنوي", from: "الجهة الرقابية", to: "إدارة التدريب", type: "incoming_external", status: "archived", summary: "طلب تقديم تقرير الإنجاز السنوي" },
  { id: "5", number: "ص/2026/003", date: "2026-02-14", subject: "متابعة شهادات التدريب", from: "شعبة التنفيذ", to: "شعبة المناهج", type: "outgoing_internal", status: "in_progress", summary: "متابعة إصدار شهادات الدورة المنتهية" },
];

export const auditLog: AuditEntry[] = [
  { id: "1", user: "أحمد محمد العلي", action: "تعديل حالة الدورة", target: "إدارة المشاريع الاحترافية", timestamp: "2026-02-15 09:30" },
  { id: "2", user: "فاطمة حسن الأمير", action: "إضافة متدرب", target: "الأمن السيبراني المتقدم", timestamp: "2026-02-14 14:15" },
  { id: "3", user: "خالد عبدالله السعيد", action: "الموافقة على إجازة", target: "طلب إجازة - نورة المالكي", timestamp: "2026-02-14 11:00" },
  { id: "4", user: "النظام", action: "إشعار تلقائي", target: "دورة تبدأ خلال 7 أيام", timestamp: "2026-02-13 08:00" },
  { id: "5", user: "سارة القحطاني", action: "رفع مراسلة", target: "ص/2026/003", timestamp: "2026-02-14 16:45" },
];

export const notifications: Notification[] = [
  { id: "1", message: "دورة 'إدارة المشاريع' تبدأ خلال 5 أيام", type: "warning", date: "2026-02-15" },
  { id: "2", message: "دورة 'خدمة العملاء' تبدأ خلال 3 أيام", type: "warning", date: "2026-02-15" },
  { id: "3", message: "3 مراسلات قيد الإجراء تحتاج متابعة", type: "danger", date: "2026-02-15" },
  { id: "4", message: "تمت الموافقة على ميزانية الربع الأول", type: "info", date: "2026-02-14" },
  { id: "5", message: "متابعة أثر تدريبي مطلوبة لدورة 'القيادة والإدارة'", type: "danger", date: "2026-02-15" },
];

export const departmentStats = [
  { name: "المناهج", achievement: 85, budget: 120000, actual: 98000 },
  { name: "الإعداد", achievement: 72, budget: 80000, actual: 65000 },
  { name: "التنفيذ", achievement: 68, budget: 150000, actual: 110000 },
  { name: "التقييم", achievement: 90, budget: 40000, actual: 35000 },
];

export const currentUser = {
  id: "admin",
  name: "أحمد محمد العلي",
  role: "مدير النظام",
  department: "التدريب والتطوير",
  roles: ["admin", "trainer"],
};
