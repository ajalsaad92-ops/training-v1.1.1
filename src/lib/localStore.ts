import { debouncedPush, getServerAvailable } from "@/lib/serverSync";
import {
  SEED_EMPLOYEES, SEED_PROFILES, SEED_USER_ACCOUNTS, SEED_CURRICULUM,
  SEED_COURSES, SEED_TRAINEES, SEED_HR, SEED_CORRESPONDENCE, SEED_TASKS,
  SEED_GOV_TRAINING, SEED_FOLLOWUP_RECORDS, SEED_FOLLOWUP_NOTIFS,
  SEED_NOTIFICATIONS, SEED_AUDIT_LOG, SEED_WEEK_SCHEDULES,
} from "@/lib/seedData";

const SEED_VERSION_KEY = "tms_seed_version";
const SEED_VERSION = "2026-05-24-v4";



/* eslint-disable @typescript-eslint/no-explicit-any */
export type Employee = any;
export type Course = any;
export type CourseTrainee = any;
export type HRRequest = any;
export type CurriculumItem = any;
export type CorrespondenceItem = any;
export type AuditEntry = any;
export type Notification = any;
export type Task = any;
export type TaskHandover = any;
export type TaskComment = any;
export type GovernorateTraining = any;
export type FollowUpRecord = any;
export type FollowUpNotification = any;
export type TrainingPlanImport = any;
export type WeekScheduleEntry = any;
export type ArchiveDocument = any;
export type Evaluation = any;
export type ArchiveDocType = any;
export type ArchiveLevel = any;
export type ArchivePart = any;
export type ArchiveSection = any;
export type ArchiveUserPerm = any;
export type ArchiveYear = any;

export interface UserProfile {
  id: string;
  name: string;
  department: string;
  section: string;
  position: string;
  phone: string;
  roles: string[];
  active?: boolean;
}

export interface UserAccount {
  id?: string;
  email: string;
  password: string;
  profile: UserProfile;
}

const STORAGE_KEY = "tms_local_store";

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const now = () => new Date().toISOString();
const today = () => new Date().toISOString().split("T")[0];

const defaultEmployees = SEED_EMPLOYEES;
const defaultCourses = SEED_COURSES;
const defaultTrainees = SEED_TRAINEES;
const defaultHRRequests = SEED_HR;
const defaultCurriculum = SEED_CURRICULUM;
const defaultCorrespondence = SEED_CORRESPONDENCE;
const defaultTasks = SEED_TASKS;
const defaultNotifications = SEED_NOTIFICATIONS;
const defaultAuditLog = SEED_AUDIT_LOG;
const defaultTaskHandovers: TaskHandover[] = [];
const defaultTaskComments: TaskComment[] = [];
const defaultGovernorateTraining = SEED_GOV_TRAINING;
const defaultFollowUpRecords = SEED_FOLLOWUP_RECORDS;
const defaultWeekSchedules = SEED_WEEK_SCHEDULES;
const defaultTrainingPlanImports: TrainingPlanImport[] = [];
const defaultFollowUpNotifications = SEED_FOLLOWUP_NOTIFS;
const defaultProfiles = SEED_PROFILES;
export const defaultUserAccounts = SEED_USER_ACCOUNTS;

const ARCHIVE_DOC_TYPES: ArchiveDocType[] = [
  { id: "1", label: "صادر عام" },
  { id: "2", label: "صادر سري" },
  { id: "3", label: "وارد عام" },
  { id: "4", label: "وارد سري" },
  { id: "5", label: "صادر سري وشخصي" },
  { id: "6", label: "وارد سري وشخصي" },
  { id: "7", label: "صادر سري للغاية" },
  { id: "8", label: "وارد سري للغاية" },
];

const ARCHIVE_LEVELS: ArchiveLevel[] = [
  { id: "1", label: "قسم" },
  { id: "2", label: "شعبة" },
  { id: "3", label: "وحدة/وجبة" },
  { id: "4", label: "صفة" },
];

const ARCHIVE_PARTS: ArchivePart[] = [
  { id: "1", label: "الامانة العامة للعتبة الحسينية المقدسة" },
  { id: "2", label: "مجلس الادارة" },
  { id: "3", label: "مكتب الامانة" },
  { id: "4", label: "الشؤون القانونية" },
  { id: "5", label: "الشؤون الادارية" },
  { id: "6", label: "الشؤون المالية" },
  { id: "7", label: "التدقيق والرقابة" },
  { id: "8", label: "الهدايا والنذور" },
  { id: "9", label: "الشؤون الدينية" },
  { id: "10", label: "العلاقات العامة" },
  { id: "11", label: "الشؤون الفكرية" },
  { id: "12", label: "قسم الاعلام" },
  { id: "13", label: "قسم الاتصالات" },
  { id: "14", label: "المشاريع الهندسية" },
  { id: "15", label: "الشؤون الخدمية الخارجية" },
  { id: "16", label: "حفظ النظام" },
  { id: "17", label: "قسم المضيف" },
  { id: "18", label: "الشؤون الخدمية الداخلية" },
  { id: "19", label: "المخيم الحسيني" },
  { id: "20", label: "بين الحرمين" },
  { id: "21", label: "المشاريع الاستراتيجية" },
  { id: "22", label: "السياحة الدينية" },
  { id: "23", label: "قناة كربلاء الفضائية" },
  { id: "24", label: "قسم الصيانة" },
  { id: "25", label: "قسم المخازن" },
  { id: "26", label: "مكتب نائب الامين العام" },
  { id: "27", label: "قسم الاليات" },
  { id: "28", label: "دار القران الكريم" },
  { id: "29", label: "تطوير الموارد البشرية" },
  { id: "30", label: "التنمية الزراعية" },
  { id: "31", label: "معهد السبط العالي" },
  { id: "32", label: "المواكب والشعائر الحسينية" },
  { id: "33", label: "قسم المتحف" },
  { id: "34", label: "مجمع سيد الشهداء" },
  { id: "35", label: "دار الوارث للطباعة والنشر" },
  { id: "36", label: "شركة خيرات السبطين" },
  { id: "37", label: "الزينة والتشجير" },
  { id: "38", label: "مدينة الامام الحسين(ع)" },
  { id: "39", label: "مدينة الزهراء(ع)" },
  { id: "40", label: "مركز كربلاء للدراسات والبحوث" },
  { id: "41", label: "الشؤون الطبية" },
  { id: "42", label: "قسم النشاطات العامة" },
  { id: "43", label: "مدينة الامام الحسن المجتبى(ع)" },
  { id: "44", label: "مؤسسة علوم نهج البلاغة" },
  { id: "45", label: "مؤسسة الوارث الثقافية" },
  { id: "46", label: "قسم التربية والتعليم" },
  { id: "47", label: "مدينة سيد الاوصياء(ص)" },
  { id: "48", label: "مرآب العطاء الفني" },
  { id: "49", label: "مركز العلامة الحلي(قدس)" },
  { id: "50", label: "مؤسسة الدليل للدراسات والبحوث" },
  { id: "51", label: "قسم التنسيق والتاهيل التربوي" },
  { id: "52", label: "مركز الامام الحسن(ع) للدراسات" },
  { id: "53", label: "مكتب الامينين العامين" },
  { id: "54", label: "قسم الخطابة الحسينية" },
  { id: "55", label: "رعاية وتنمية الطفولة الحسينية" },
];

const ARCHIVE_SECTIONS: ArchiveSection[] = [
  { id: "100", pId: "1", label: "الامانة العامة - قسم التنسيق" },
  { id: "101", pId: "1", label: "الامانة العامة - قسم المتابعة" },
  { id: "200", pId: "2", label: "مجلس الادارة - الامانة" },
  { id: "201", pId: "2", label: "مجلس الادارة - الشؤون القانونية" },
  { id: "300", pId: "3", label: "مكتب الامانة - التنسيق" },
  { id: "301", pId: "3", label: "مكتب الامانة - المتابعة" },
  { id: "302", pId: "3", label: "مكتب الامانة - المراسلات" },
  { id: "303", pId: "3", label: "مكتب الامانة - الارشيف" },
  { id: "304", pId: "3", label: "مكتب الامانة - التقارير" },
  { id: "305", pId: "3", label: "مكتب الامانة - الزيارات" },
  { id: "306", pId: "3", label: "مكتب الامانة - الاستقبال" },
  { id: "307", pId: "3", label: "مكتب الامانة - المصادقات" },
  { id: "308", pId: "3", label: "مكتب الامانة - المؤتمرات" },
  { id: "309", pId: "3", label: "مكتب الامانة - التوجيه" },
  { id: "310", pId: "3", label: "مكتب الامانة - الشكاوى" },
  { id: "311", pId: "3", label: "مكتب الامانة - الدراسات" },
  { id: "312", pId: "3", label: "مكتب الامانة - التخطيط" },
  { id: "313", pId: "3", label: "مكتب الامانة - التقييم" },
  { id: "314", pId: "3", label: "مكتب الامانة - التدقيق" },
  { id: "315", pId: "3", label: "مكتب الامانة - العلاقات" },
  { id: "316", pId: "3", label: "مكتب الامانة - الملفات" },
  { id: "317", pId: "3", label: "مكتب الامانة - المؤتمرات الصحفية" },
  { id: "318", pId: "3", label: "مكتب الامانة - التكليفات" },
  { id: "319", pId: "3", label: "مكتب الامانة - النشر" },
  { id: "400", pId: "4", label: "الشؤون القانونية - الدعاوى" },
  { id: "401", pId: "4", label: "الشؤون القانونية - العقود" },
  { id: "402", pId: "4", label: "الشؤون القانونية - الاستشارات" },
  { id: "500", pId: "5", label: "الشؤون الادارية - شعبة الموظفين" },
  { id: "501", pId: "5", label: "الشؤون الادارية - شعبة الخدمات" },
  { id: "502", pId: "5", label: "الشؤون الادارية - شعبة النقل" },
  { id: "503", pId: "5", label: "الشؤون الادارية - شعبة السكن" },
  { id: "504", pId: "5", label: "الشؤون الادارية - شعبة الامن والسلامة" },
  { id: "600", pId: "6", label: "الشؤون المالية - شعبة الحسابات" },
  { id: "601", pId: "6", label: "الشؤون المالية - شعبة الميزانية" },
  { id: "602", pId: "6", label: "الشؤون المالية - شعبة الرواتب" },
  { id: "603", pId: "6", label: "الشؤون المالية - شعبة المشتريات" },
  { id: "700", pId: "7", label: "التدقيق والرقابة - شعبة التدقيق الداخلي" },
  { id: "701", pId: "7", label: "التدقيق والرقابة - شعبة الرقابة" },
  { id: "800", pId: "8", label: "الهدايا والنذور - شعبة الاستلام" },
  { id: "801", pId: "8", label: "الهدايا والنذور - شعبة التوزيع" },
  { id: "802", pId: "8", label: "الهدايا والنذور - شعبة الحسابات" },
  { id: "900", pId: "9", label: "الشؤون الدينية - شعبة الخطابة" },
  { id: "901", pId: "9", label: "الشؤون الدينية - شعبة الشعائر" },
  { id: "902", pId: "9", label: "الشؤون الدينية - شعبة القراءات" },
  { id: "1000", pId: "10", label: "العلاقات العامة - شعبة الاعلام" },
  { id: "1001", pId: "10", label: "العلاقات العامة - شعبة الزيارات" },
  { id: "1002", pId: "10", label: "العلاقات العامة - شعبة الحملات" },
  { id: "1100", pId: "11", label: "الشؤون الفكرية - شعبة التأليف" },
  { id: "1101", pId: "11", label: "الشؤون الفكرية - شعبة الترجمة" },
  { id: "1102", pId: "11", label: "الشؤون الفكرية - شعبة النشر" },
  { id: "1200", pId: "12", label: "قسم الاعلام - شعبة الانتاج" },
  { id: "1201", pId: "12", label: "قسم الاعلام - شعبة التصوير" },
  { id: "1202", pId: "12", label: "قسم الاعلام - شعبة المونتاج" },
  { id: "1300", pId: "13", label: "قسم الاتصالات - شعبة الشبكات" },
  { id: "1301", pId: "13", label: "قسم الاتصالات - شعبة البرمجة" },
  { id: "1400", pId: "14", label: "المشاريع الهندسية - شعبة التصاميم" },
  { id: "1401", pId: "14", label: "المشاريع الهندسية - شعبة التنفيذ" },
  { id: "1402", pId: "14", label: "المشاريع الهندسية - شعبة المتابعة" },
  { id: "1500", pId: "15", label: "الشؤون الخدمية الخارجية - شعبة التنسيق" },
  { id: "1501", pId: "15", label: "الشؤون الخدمية الخارجية - شعبة المتابعة" },
  { id: "1600", pId: "16", label: "حفظ النظام - شعبة الحراسة" },
  { id: "1601", pId: "16", label: "حفظ النظام - شعبة الدوريات" },
  { id: "1700", pId: "17", label: "قسم المضيف - شعبة الضيافة" },
  { id: "1701", pId: "17", label: "قسم المضيف - شعبة التجهيز" },
  { id: "1800", pId: "18", label: "الشؤون الخدمية الداخلية - شعبة النظافة" },
  { id: "1801", pId: "18", label: "الشؤون الخدمية الداخلية - شعبة الصيانة" },
  { id: "1802", pId: "18", label: "الشؤون الخدمية الداخلية - شعبة التجهيزات" },
  { id: "1900", pId: "19", label: "المخيم الحسيني - شعبة التجهيز" },
  { id: "1901", pId: "19", label: "المخيم الحسيني - شعبة الفعاليات" },
  { id: "2000", pId: "20", label: "بين الحرمين - شعبة التنسيق" },
  { id: "2001", pId: "20", label: "بين الحرمين - شعبة الخدمات" },
  { id: "2100", pId: "21", label: "المشاريع الاستراتيجية - شعبة التخطيط" },
  { id: "2101", pId: "21", label: "المشاريع الاستراتيجية - شعبة التنفيذ" },
  { id: "2200", pId: "22", label: "السياحة الدينية - شعبة التنظيم" },
  { id: "2201", pId: "22", label: "السياحة الدينية - شعبة الارشاد" },
  { id: "2300", pId: "23", label: "قناة كربلاء الفضائية - شعبة البرامج" },
  { id: "2301", pId: "23", label: "قناة كربلاء الفضائية - شعحة الاخبار" },
  { id: "2400", pId: "24", label: "قسم الصيانة - شعحة الكهرباء" },
  { id: "2401", pId: "24", label: "قسم الصيانة - شعبة الميكانيك" },
  { id: "2500", pId: "25", label: "قسم المخازن - شعبة الاستلام" },
  { id: "2501", pId: "25", label: "قسم المخازن - شعبة التوزيع" },
  { id: "2600", pId: "26", label: "مكتب نائب الامين العام - التنسيق" },
  { id: "2601", pId: "26", label: "مكتب نائب الامين العام - المتابعة" },
  { id: "2700", pId: "27", label: "قسم الاليات - شعبة الصيانة" },
  { id: "2701", pId: "27", label: "قسم الاليات - شعبة التشغيل" },
  { id: "2800", pId: "28", label: "دار القران الكريم - شعبة التدريس" },
  { id: "2801", pId: "28", label: "دار القران الكريم - شعبة الحفظ" },
  { id: "2900", pId: "29", label: "تطوير الموارد البشرية - شعبة التدريب" },
  { id: "2901", pId: "29", label: "تطوير الموارد البشرية - شعبة التنمية" },
  { id: "2902", pId: "29", label: "تطوير الموارد البشرية - شعبة التاهيل" },
  { id: "3000", pId: "30", label: "التنمية الزراعية - شعبة الانتاج" },
  { id: "3001", pId: "30", label: "التنمية الزراعية - شعبة التطوير" },
  { id: "3100", pId: "31", label: "معهد السبط العالي - شعبة القبول" },
  { id: "3101", pId: "31", label: "معهد السبط العالي - شعبة التدريس" },
  { id: "3200", pId: "32", label: "المواكب والشعائر الحسينية - شعبة التنظيم" },
  { id: "3201", pId: "32", label: "المواكب والشعائر الحسينية - شعبة التجهيز" },
  { id: "3300", pId: "33", label: "قسم المتحف - شعبة العرض" },
  { id: "3301", pId: "33", label: "قسم المتحف - شعبة الترميم" },
  { id: "3400", pId: "34", label: "مجمع سيد الشهداء - شعبة الادارة" },
  { id: "3401", pId: "34", label: "مجمع سيد الشهداء - شعبة الخدمات" },
  { id: "3500", pId: "35", label: "دار الوارث - شعبة الطباعة" },
  { id: "3501", pId: "35", label: "دار الوارث - شعبة النشر" },
  { id: "3600", pId: "36", label: "شركة خيرات السبطين - شعبة المبيعات" },
  { id: "3601", pId: "36", label: "شركة خيرات السبطين - شعبة الانتاج" },
  { id: "3700", pId: "37", label: "الزينة والتشجير - شعبة التنسيق" },
  { id: "3701", pId: "37", label: "الزينة والتشجير - شعبة التشجير" },
  { id: "3800", pId: "38", label: "مدينة الامام الحسين(ع) - شعبة الادارة" },
  { id: "3801", pId: "38", label: "مدينة الامام الحسين(ع) - شعبة الخدمات" },
  { id: "3900", pId: "39", label: "مدينة الزهراء(ع) - شعبة الادارة" },
  { id: "3901", pId: "39", label: "مدينة الزهراء(ع) - شعبة الخدمات" },
  { id: "4000", pId: "40", label: "مركز كربلاء للدراسات - شعبة البحوث" },
  { id: "4001", pId: "40", label: "مركز كربلاء للدراسات - شعبة النشر" },
  { id: "4100", pId: "41", label: "الشؤون الطبية - شعبة العيادات" },
  { id: "4101", pId: "41", label: "الشؤون الطبية - شعبة الصيدلة" },
  { id: "4200", pId: "42", label: "قسم النشاطات العامة - شعبة التنظيم" },
  { id: "4201", pId: "42", label: "قسم النشاطات العامة - شعبة التجهيز" },
  { id: "4300", pId: "43", label: "مدينة الامام الحسن المجتبى(ع) - شعبة الادارة" },
  { id: "4301", pId: "43", label: "مدينة الامام الحسن المجتبى(ع) - شعبة الخدمات" },
  { id: "4400", pId: "44", label: "مؤسسة علوم نهج البلاغة - شعبة التأليف" },
  { id: "4401", pId: "44", label: "مؤسسة علوم نهج البلاغة - شعبة الترجمة" },
  { id: "4500", pId: "45", label: "مؤسسة الوارث الثقافية - شعبة النشر" },
  { id: "4501", pId: "45", label: "مؤسسة الوارث الثقافية - شعبة الفعاليات" },
  { id: "4600", pId: "46", label: "قسم التربية والتعليم - شعبة المدارس" },
  { id: "4601", pId: "46", label: "قسم التربية والتعليم - شعبة الروضات" },
  { id: "4700", pId: "47", label: "مدينة سيد الاوصياء(ص) - شعبة الادارة" },
  { id: "4701", pId: "47", label: "مدينة سيد الاوصياء(ص) - شعبة الخدمات" },
  { id: "4800", pId: "48", label: "مرآب العطاء الفني - شعبة الانتاج" },
  { id: "4801", pId: "48", label: "مرآب العطاء الفني - شعبة التدريب" },
  { id: "4900", pId: "49", label: "مركز العلامة الحلي(قدس) - شعبة البحوث" },
  { id: "4901", pId: "49", label: "مركز العلامة الحلي(قدس) - شعبة التدريس" },
  { id: "5000", pId: "50", label: "مؤسسة الدليل للدراسات - شعبة البحوث" },
  { id: "5001", pId: "50", label: "مؤسسة الدليل للدراسات - شعبة النشر" },
  { id: "5100", pId: "51", label: "قسم التنسيق والتاهيل التربوي - شعبة التنسيق" },
  { id: "5101", pId: "51", label: "قسم التنسيق والتاهيل التربوي - شعبة التاهيل" },
  { id: "5200", pId: "52", label: "مركز الامام الحسن(ع) للدراسات - شعبة البحوث" },
  { id: "5201", pId: "52", label: "مركز الامام الحسن(ع) للدراسات - شعبة النشر" },
  { id: "5300", pId: "53", label: "مكتب الامينين العامين - التنسيق" },
  { id: "5301", pId: "53", label: "مكتب الامينين العامين - المتابعة" },
  { id: "5400", pId: "54", label: "قسم الخطابة الحسينية - شعبة الخطابة" },
  { id: "5401", pId: "54", label: "قسم الخطابة الحسينية - شعبة التاهيل" },
  { id: "5500", pId: "55", label: "رعاية وتنمية الطفولة الحسينية - شعبة الرعاية" },
  { id: "5501", pId: "55", label: "رعاية وتنمية الطفولة الحسينية - شعبة التنمية" },
];

const ARCHIVE_USER_PERMS: ArchiveUserPerm[] = [
  { id: "0", label: "مالك" },
  { id: "1", label: "مبرمج" },
  { id: "2", label: "مدير" },
  { id: "3", label: "مستخدم" },
  { id: "4", label: "بحث فقط" },
  { id: "5", label: "مشاهدة فقط" },
];

const ARCHIVE_YEARS: ArchiveYear[] = Array.from({ length: 38 }, (_, i) => ({
  id: String(2003 + i),
  label: String(2003 + i),
}));

const ARCHIVE_SAMPLE_DOCUMENTS: ArchiveDocument[] = [
  { id: "arc-1", docType: "1", docYear: "2024", docNum: "ص/2024/001", docDateCH: "2024-01-15", docDateHig: "1445/06/04", docSubj: "تكليف بتجهيز كتب المراسلات الصادرة", docTo: "الشؤون الادارية", docSorse: "مكتب الامانة", storedNum: "أرش/1/2024", stordPlace: "المبنى الرئيسي", folderNum: "F-001", docPath: "", userName: "admin", dateOfAdd: "2024-01-15T10:00:00Z", pId: "3", forCheck: "0" },
  { id: "arc-2", docType: "3", docYear: "2024", docNum: "و/2024/001", docDateCH: "2024-01-20", docDateHig: "1445/06/09", docSubj: "كتاب دورة تدريبية للموظفين الجدد", docTo: "تطوير الموارد البشرية", docSorse: "الشؤون الادارية", storedNum: "أرش/2/2024", stordPlace: "المبنى الرئيسي", folderNum: "F-002", docPath: "", userName: "admin", dateOfAdd: "2024-01-20T09:30:00Z", pId: "5", forCheck: "0" },
  { id: "arc-3", docType: "1", docYear: "2024", docNum: "ص/2024/002", docDateCH: "2024-02-03", docDateHig: "1445/07/22", docSubj: "موافقة على خطة التدريب السنوية", docTo: "مجلس الادارة", docSorse: "تطوير الموارد البشرية", storedNum: "أرش/3/2024", stordPlace: "المبنى الرئيسي", folderNum: "F-003", docPath: "", userName: "admin", dateOfAdd: "2024-02-03T11:00:00Z", pId: "29", forCheck: "0" },
  { id: "arc-4", docType: "2", docYear: "2024", docNum: "ص/س/2024/001", docDateCH: "2024-02-10", docDateHig: "1445/07/29", docSubj: "تقرير سري عن الحالة المالية", docTo: "الشؤون المالية", docSorse: "التدقيق والرقابة", storedNum: "أرش/4/2024", stordPlace: "خزنة السري", folderNum: "F-004", docPath: "", userName: "admin", dateOfAdd: "2024-02-10T14:00:00Z", pId: "7", forCheck: "1" },
  { id: "arc-5", docType: "3", docYear: "2024", docNum: "و/2024/002", docDateCH: "2024-02-18", docDateHig: "1445/08/07", docSubj: "طلب تزويد بمعدات صيانة الحرم", docTo: "قسم الصيانة", docSorse: "الشؤون الخدمية الداخلية", storedNum: "أرش/5/2024", stordPlace: "المبنى الرئيسي", folderNum: "F-005", docPath: "", userName: "admin", dateOfAdd: "2024-02-18T08:45:00Z", pId: "18", forCheck: "0" },
  { id: "arc-6", docType: "1", docYear: "2024", docNum: "ص/2024/003", docDateCH: "2024-03-01", docDateHig: "1445/08/19", docSubj: "اعتماد ميزانية المشاريع الهندسية", docTo: "المشاريع الهندسية", docSorse: "الشؤون المالية", storedNum: "أرش/6/2024", stordPlace: "المبنى الرئيسي", folderNum: "F-006", docPath: "", userName: "admin", dateOfAdd: "2024-03-01T10:30:00Z", pId: "14", forCheck: "0" },
  { id: "arc-7", docType: "4", docYear: "2024", docNum: "و/س/2024/001", docDateCH: "2024-03-05", docDateHig: "1445/08/23", docSubj: "كتاب سري من وزارة الاوقاف", docTo: "الشؤون القانونية", docSorse: "وزارة الاوقاف", storedNum: "أرش/7/2024", stordPlace: "خزنة السري", folderNum: "F-007", docPath: "", userName: "admin", dateOfAdd: "2024-03-05T12:00:00Z", pId: "4", forCheck: "1" },
  { id: "arc-8", docType: "3", docYear: "2023", docNum: "و/2023/050", docDateCH: "2023-12-20", docDateHig: "1445/06/08", docSubj: "تقرير انجاز الفصل الرابع", docTo: "مكتب الامانة", docSorse: "تطوير الموارد البشرية", storedNum: "أرش/8/2023", stordPlace: "المبنى الرئيسي", folderNum: "F-008", docPath: "", userName: "admin", dateOfAdd: "2023-12-20T16:00:00Z", pId: "29", forCheck: "0" },
  { id: "arc-9", docType: "1", docYear: "2023", docNum: "ص/2023/098", docDateCH: "2023-11-15", docDateHig: "1445/05/03", docSubj: "تعيين مشرفين جدد على الدورات", docTo: "تطوير الموارد البشرية", docSorse: "الشؤون الادارية", storedNum: "أرش/9/2023", stordPlace: "المبنى الرئيسي", folderNum: "F-009", docPath: "", userName: "admin", dateOfAdd: "2023-11-15T09:00:00Z", pId: "5", forCheck: "0" },
  { id: "arc-10", docType: "3", docYear: "2023", docNum: "و/2023/045", docDateCH: "2023-10-01", docDateHig: "1445/03/17", docSubj: "دعوة لحضور مؤتمر التعليم العالي", docTo: "معهد السبط العالي", docSorse: "وزارة التعليم العالي", storedNum: "أرش/10/2023", stordPlace: "المبنى الرئيسي", folderNum: "F-010", docPath: "", userName: "admin", dateOfAdd: "2023-10-01T11:30:00Z", pId: "31", forCheck: "0" },
  { id: "arc-11", docType: "1", docYear: "2023", docNum: "ص/2023/075", docDateCH: "2023-09-10", docDateHig: "1445/02/26", docSubj: "موافقة على برنامج الزيارات الدينية", docTo: "السياحة الدينية", docSorse: "مكتب الامانة", storedNum: "أرش/11/2023", stordPlace: "المبنى الرئيسي", folderNum: "F-011", docPath: "", userName: "admin", dateOfAdd: "2023-09-10T13:00:00Z", pId: "22", forCheck: "0" },
  { id: "arc-12", docType: "5", docYear: "2024", docNum: "ص/س/ش/2024/001", docDateCH: "2024-03-15", docDateHig: "1445/09/04", docSubj: "تكليف شخصي بمراجعة الملفات السرية", docTo: "مكتب نائب الامين العام", docSorse: "الامانة العامة", storedNum: "أرش/12/2024", stordPlace: "خزنة السري", folderNum: "F-012", docPath: "", userName: "admin", dateOfAdd: "2024-03-15T15:30:00Z", pId: "1", forCheck: "1" },
  { id: "arc-13", docType: "3", docYear: "2024", docNum: "و/2024/010", docDateCH: "2024-04-02", docDateHig: "1445/09/22", docSubj: "طلب عطاء لاصلاح نظام التبريد", docTo: "قسم الصيانة", docSorse: "الشؤون الخدمية الداخلية", storedNum: "أرش/13/2024", stordPlace: "المبنى الرئيسي", folderNum: "F-013", docPath: "", userName: "admin", dateOfAdd: "2024-04-02T08:00:00Z", pId: "24", forCheck: "0" },
  { id: "arc-14", docType: "1", docYear: "2024", docNum: "ص/2024/010", docDateCH: "2024-04-10", docDateHig: "1445/09/30", docSubj: "ابلاغ ببدء موسم الزيارات", docTo: "بين الحرمين", docSorse: "الشؤون الدينية", storedNum: "أرش/14/2024", stordPlace: "المبنى الرئيسي", folderNum: "F-014", docPath: "", userName: "admin", dateOfAdd: "2024-04-10T10:00:00Z", pId: "9", forCheck: "0" },
  { id: "arc-15", docType: "3", docYear: "2024", docNum: "و/2024/015", docDateCH: "2024-04-20", docDateHig: "1445/10/10", docSubj: "تقرير مالي ربع سنوي", docTo: "الشؤون المالية", docSorse: "الهدايا والنذور", storedNum: "أرش/15/2024", stordPlace: "المبنى الرئيسي", folderNum: "F-015", docPath: "", userName: "admin", dateOfAdd: "2024-04-20T14:30:00Z", pId: "8", forCheck: "0" },
  { id: "arc-16", docType: "1", docYear: "2024", docNum: "ص/2024/012", docDateCH: "2024-05-01", docDateHig: "1445/10/21", docSubj: "خطة تطوير دار القران الكريم", docTo: "دار القران الكريم", docSorse: "مكتب الامانة", storedNum: "أرش/16/2024", stordPlace: "المبنى الرئيسي", folderNum: "F-016", docPath: "", userName: "admin", dateOfAdd: "2024-05-01T09:15:00Z", pId: "28", forCheck: "0" },
  { id: "arc-17", docType: "7", docYear: "2024", docNum: "ص/س/ل/2024/001", docDateCH: "2024-05-10", docDateHig: "1445/10/30", docSubj: "كتاب سري للغاية حول التحقيقات", docTo: "الشؤون القانونية", docSorse: "الامانة العامة", storedNum: "أرش/17/2024", stordPlace: "خزنة السري للغاية", folderNum: "F-017", docPath: "", userName: "admin", dateOfAdd: "2024-05-10T16:00:00Z", pId: "4", forCheck: "1" },
  { id: "arc-18", docType: "3", docYear: "2024", docNum: "و/2024/020", docDateCH: "2024-05-15", docDateHig: "1445/11/05", docSubj: "دعوة للمشاركة بمعرض الكتاب", docTo: "مؤسسة الوارث الثقافية", docSorse: "وزارة الثقافة", storedNum: "أرش/18/2024", stordPlace: "المبنى الرئيسي", folderNum: "F-018", docPath: "", userName: "admin", dateOfAdd: "2024-05-15T11:00:00Z", pId: "45", forCheck: "0" },
  { id: "arc-19", docType: "1", docYear: "2023", docNum: "ص/2023/060", docDateCH: "2023-08-05", docDateHig: "1445/01/18", docSubj: "اعتماد المناهج التدريبية الجديدة", docTo: "تطوير الموارد البشرية", docSorse: "مكتب الامانة", storedNum: "أرش/19/2023", stordPlace: "المبنى الرئيسي", folderNum: "F-019", docPath: "", userName: "admin", dateOfAdd: "2023-08-05T10:00:00Z", pId: "29", forCheck: "0" },
  { id: "arc-20", docType: "3", docYear: "2023", docNum: "و/2023/030", docDateCH: "2023-07-20", docDateHig: "1445/01/03", docSubj: "مخالصة نهائية لمشروع التشجير", docTo: "الزينة والتشجير", docSorse: "المشاريع الهندسية", storedNum: "أرش/20/2023", stordPlace: "المبنى الرئيسي", folderNum: "F-020", docPath: "", userName: "admin", dateOfAdd: "2023-07-20T13:30:00Z", pId: "37", forCheck: "0" },
  { id: "arc-21", docType: "1", docYear: "2023", docNum: "ص/2023/040", docDateCH: "2023-06-15", docDateHig: "1444/11/27", docSubj: "تكليف بتنظيم موكب عاشوراء", docTo: "المواكب والشعائر الحسينية", docSorse: "الشؤون الدينية", storedNum: "أرش/21/2023", stordPlace: "المبنى الرئيسي", folderNum: "F-021", docPath: "", userName: "admin", dateOfAdd: "2023-06-15T15:00:00Z", pId: "32", forCheck: "0" },
  { id: "arc-22", docType: "3", docYear: "2023", docNum: "و/2023/025", docDateCH: "2023-05-10", docDateHig: "1444/10/22", docSubj: "تقرير صيانة المبنى الرئيسي", docTo: "قسم الصيانة", docSorse: "الشؤون الخدمية الداخلية", storedNum: "أرش/22/2023", stordPlace: "المبنى الرئيسي", folderNum: "F-022", docPath: "", userName: "admin", dateOfAdd: "2023-05-10T08:30:00Z", pId: "24", forCheck: "0" },
  { id: "arc-23", docType: "1", docYear: "2023", docNum: "ص/2023/030", docDateCH: "2023-04-22", docDateHig: "1444/10/04", docSubj: "ابلاغ بتوزيع المهام الجديدة", docTo: "حفظ النظام", docSorse: "الشؤون الادارية", storedNum: "أرش/23/2023", stordPlace: "المبنى الرئيسي", folderNum: "F-023", docPath: "", userName: "admin", dateOfAdd: "2023-04-22T10:45:00Z", pId: "16", forCheck: "0" },
  { id: "arc-24", docType: "6", docYear: "2024", docNum: "و/س/ش/2024/001", docDateCH: "2024-06-01", docDateHig: "1445/11/21", docSubj: "كتاب سري شخصي من الامانة", docTo: "مكتب الامينين العامين", docSorse: "الامانة العامة", storedNum: "أرش/24/2024", stordPlace: "خزنة السري", folderNum: "F-024", docPath: "", userName: "admin", dateOfAdd: "2024-06-01T14:00:00Z", pId: "53", forCheck: "1" },
  { id: "arc-25", docType: "1", docYear: "2024", docNum: "ص/2024/015", docDateCH: "2024-06-10", docDateHig: "1445/11/30", docSubj: "ابلاغ بفتح باب القبول في المعهد", docTo: "معهد السبط العالي", docSorse: "الشؤون الفكرية", storedNum: "أرش/25/2024", stordPlace: "المبنى الرئيسي", folderNum: "F-025", docPath: "", userName: "admin", dateOfAdd: "2024-06-10T09:00:00Z", pId: "11", forCheck: "0" },
  { id: "arc-26", docType: "3", docYear: "2022", docNum: "و/2022/080", docDateCH: "2022-11-01", docDateHig: "1444/04/07", docSubj: "طلب تزويد باجهزة حاسوب", docTo: "قسم الاتصالات", docSorse: "تطوير الموارد البشرية", storedNum: "أرش/26/2022", stordPlace: "المبنى الرئيسي", folderNum: "F-026", docPath: "", userName: "admin", dateOfAdd: "2022-11-01T10:00:00Z", pId: "13", forCheck: "0" },
  { id: "arc-27", docType: "1", docYear: "2022", docNum: "ص/2022/120", docDateCH: "2022-10-15", docDateHig: "1444/03/20", docSubj: "ابلاغ بخطة تطوير مدينة الامام الحسين", docTo: "مدينة الامام الحسين(ع)", docSorse: "المشاريع الاستراتيجية", storedNum: "أرش/27/2022", stordPlace: "المبنى الرئيسي", folderNum: "F-027", docPath: "", userName: "admin", dateOfAdd: "2022-10-15T11:30:00Z", pId: "38", forCheck: "0" },
  { id: "arc-28", docType: "8", docYear: "2024", docNum: "و/س/ل/2024/001", docDateCH: "2024-06-20", docDateHig: "1445/12/10", docSubj: "كتاب وارد سري للغاية", docTo: "الامانة العامة", docSorse: "رئاسة الوزراء", storedNum: "أرش/28/2024", stordPlace: "خزنة السري للغاية", folderNum: "F-028", docPath: "", userName: "admin", dateOfAdd: "2024-06-20T16:30:00Z", pId: "1", forCheck: "1" },
  { id: "arc-29", docType: "3", docYear: "2022", docNum: "و/2022/060", docDateCH: "2022-09-01", docDateHig: "1444/01/06", docSubj: "مخالصة مشروع صيانة القبة", docTo: "المشاريع الهندسية", docSorse: "قسم الصيانة", storedNum: "أرش/29/2022", stordPlace: "المبنى الرئيسي", folderNum: "F-029", docPath: "", userName: "admin", dateOfAdd: "2022-09-01T09:00:00Z", pId: "14", forCheck: "0" },
  { id: "arc-30", docType: "1", docYear: "2022", docNum: "ص/2022/100", docDateCH: "2022-08-15", docDateHig: "1443/12/19", docSubj: "ابلاغ بتشكيل لجنة التدقيق", docTo: "التدقيق والرقابة", docSorse: "مجلس الادارة", storedNum: "أرش/30/2022", stordPlace: "المبنى الرئيسي", folderNum: "F-030", docPath: "", userName: "admin", dateOfAdd: "2022-08-15T10:30:00Z", pId: "2", forCheck: "0" },
  { id: "arc-31", docType: "3", docYear: "2024", docNum: "و/2024/025", docDateCH: "2024-07-01", docDateHig: "1445/12/21", docSubj: "طلب تنسيق زيارة وفد ايراني", docTo: "العلاقات العامة", docSorse: "السياحة الدينية", storedNum: "أرش/31/2024", stordPlace: "المبنى الرئيسي", folderNum: "F-031", docPath: "", userName: "admin", dateOfAdd: "2024-07-01T11:00:00Z", pId: "10", forCheck: "0" },
  { id: "arc-32", docType: "1", docYear: "2024", docNum: "ص/2024/020", docDateCH: "2024-07-10", docDateHig: "1446/01/01", docSubj: "تكليف باعداد تقرير الاداء السنوي", docTo: "مركز كربلاء للدراسات والبحوث", docSorse: "مكتب الامانة", storedNum: "أرش/32/2024", stordPlace: "المبنى الرئيسي", folderNum: "F-032", docPath: "", userName: "admin", dateOfAdd: "2024-07-10T09:30:00Z", pId: "40", forCheck: "0" },
  { id: "arc-33", docType: "3", docYear: "2024", docNum: "و/2024/030", docDateCH: "2024-08-01", docDateHig: "1446/01/22", docSubj: "ابلاغ بتخصيص ارض لمشروع زراعي", docTo: "التنمية الزراعية", docSorse: "المشاريع الاستراتيجية", storedNum: "أرش/33/2024", stordPlace: "المبنى الرئيسي", folderNum: "F-033", docPath: "", userName: "admin", dateOfAdd: "2024-08-01T10:00:00Z", pId: "30", forCheck: "0" },
  { id: "arc-34", docType: "2", docYear: "2024", docNum: "ص/س/2024/003", docDateCH: "2024-08-15", docDateHig: "1446/02/05", docSubj: "تقرير سري عن نتائج التحقيق", docTo: "الامانة العامة", docSorse: "التدقيق والرقابة", storedNum: "أرش/34/2024", stordPlace: "خزنة السري", folderNum: "F-034", docPath: "", userName: "admin", dateOfAdd: "2024-08-15T15:00:00Z", pId: "1", forCheck: "1" },
  { id: "arc-35", docType: "1", docYear: "2024", docNum: "ص/2024/025", docDateCH: "2024-09-01", docDateHig: "1446/02/22", docSubj: "ابلاغ بجدول فعاليات محرم", docTo: "المواكب والشعائر الحسينية", docSorse: "الشؤون الدينية", storedNum: "أرش/35/2024", stordPlace: "المبنى الرئيسي", folderNum: "F-035", docPath: "", userName: "admin", dateOfAdd: "2024-09-01T08:00:00Z", pId: "9", forCheck: "0" },
  { id: "arc-36", docType: "3", docYear: "2024", docNum: "و/2024/035", docDateCH: "2024-09-15", docDateHig: "1446/03/06", docSubj: "طلب دعم مالي لمشروع المتحف", docTo: "قسم المتحف", docSorse: "الشؤون المالية", storedNum: "أرش/36/2024", stordPlace: "المبنى الرئيسي", folderNum: "F-036", docPath: "", userName: "admin", dateOfAdd: "2024-09-15T13:00:00Z", pId: "33", forCheck: "0" },
  { id: "arc-37", docType: "1", docYear: "2024", docNum: "ص/2024/030", docDateCH: "2024-10-01", docDateHig: "1446/03/22", docSubj: "موافقة على عقد صيانة المباني", docTo: "قسم الصيانة", docSorse: "الشؤون المالية", storedNum: "أرش/37/2024", stordPlace: "المبنى الرئيسي", folderNum: "F-037", docPath: "", userName: "admin", dateOfAdd: "2024-10-01T10:30:00Z", pId: "6", forCheck: "0" },
  { id: "arc-38", docType: "3", docYear: "2024", docNum: "و/2024/040", docDateCH: "2024-10-15", docDateHig: "1446/04/06", docSubj: "دعوة لحضور مهرجان الطفولة", docTo: "رعاية وتنمية الطفولة الحسينية", docSorse: "قسم النشاطات العامة", storedNum: "أرش/38/2024", stordPlace: "المبنى الرئيسي", folderNum: "F-038", docPath: "", userName: "admin", dateOfAdd: "2024-10-15T11:30:00Z", pId: "55", forCheck: "0" },
  { id: "arc-39", docType: "1", docYear: "2024", docNum: "ص/2024/035", docDateCH: "2024-11-01", docDateHig: "1446/04/23", docSubj: "ابلاغ بنتائج التقييم السنوي", docTo: "تطوير الموارد البشرية", docSorse: "مكتب الامانة", storedNum: "أرش/39/2024", stordPlace: "المبنى الرئيسي", folderNum: "F-039", docPath: "", userName: "admin", dateOfAdd: "2024-11-01T09:00:00Z", pId: "29", forCheck: "0" },
  { id: "arc-40", docType: "4", docYear: "2024", docNum: "و/س/2024/003", docDateCH: "2024-11-10", docDateHig: "1446/05/02", docSubj: "كتاب سري من ديوان الرقابة", docTo: "الشؤون المالية", docSorse: "ديوان الرقابة المالية", storedNum: "أرش/40/2024", stordPlace: "خزنة السري", folderNum: "F-040", docPath: "", userName: "admin", dateOfAdd: "2024-11-10T14:30:00Z", pId: "6", forCheck: "1" },
  { id: "arc-41", docType: "1", docYear: "2024", docNum: "ص/2024/040", docDateCH: "2024-12-01", docDateHig: "1446/05/23", docSubj: "ابلاغ بخطة العام الجديد", docTo: "جميع الاقسام", docSorse: "الامانة العامة", storedNum: "أرش/41/2024", stordPlace: "المبنى الرئيسي", folderNum: "F-041", docPath: "", userName: "admin", dateOfAdd: "2024-12-01T08:00:00Z", pId: "1", forCheck: "0" },
  { id: "arc-42", docType: "3", docYear: "2022", docNum: "و/2022/040", docDateCH: "2022-07-10", docDateHig: "1443/12/11", docSubj: "طلب تعاون مع قناة كربلاء", docTo: "قناة كربلاء الفضائية", docSorse: "قسم الاعلام", storedNum: "أرش/42/2022", stordPlace: "المبنى الرئيسي", folderNum: "F-042", docPath: "", userName: "admin", dateOfAdd: "2022-07-10T10:00:00Z", pId: "23", forCheck: "0" },
  { id: "arc-43", docType: "1", docYear: "2022", docNum: "ص/2022/080", docDateCH: "2022-06-20", docDateHig: "1443/11/30", docSubj: "ابلاغ بتشغيل مرآب العطاء", docTo: "مرآب العطاء الفني", docSorse: "الشؤون الفكرية", storedNum: "أرش/43/2022", stordPlace: "المبنى الرئيسي", folderNum: "F-043", docPath: "", userName: "admin", dateOfAdd: "2022-06-20T09:30:00Z", pId: "48", forCheck: "0" },
  { id: "arc-44", docType: "3", docYear: "2022", docNum: "و/2022/030", docDateCH: "2022-05-15", docDateHig: "1443/10/24", docSubj: "كتاب من وزارة التربية بشأن المدارس", docTo: "قسم التربية والتعليم", docSorse: "وزارة التربية", storedNum: "أرش/44/2022", stordPlace: "المبنى الرئيسي", folderNum: "F-044", docPath: "", userName: "admin", dateOfAdd: "2022-05-15T11:00:00Z", pId: "46", forCheck: "0" },
  { id: "arc-45", docType: "1", docYear: "2022", docNum: "ص/2022/050", docDateCH: "2022-04-01", docDateHig: "1443/09/10", docSubj: "ابلاغ بخطة صيانة المرافق", docTo: "مجمع سيد الشهداء", docSorse: "قسم الصيانة", storedNum: "أرش/45/2022", stordPlace: "المبنى الرئيسي", folderNum: "F-045", docPath: "", userName: "admin", dateOfAdd: "2022-04-01T08:30:00Z", pId: "34", forCheck: "0" },
  { id: "arc-46", docType: "3", docYear: "2023", docNum: "و/2023/010", docDateCH: "2023-02-10", docDateHig: "1444/07/19", docSubj: "كتاب تعاون مع مؤسسة الدليل", docTo: "مؤسسة الدليل للدراسات والبحوث", docSorse: "مركز كربلاء للدراسات", storedNum: "أرش/46/2023", stordPlace: "المبنى الرئيسي", folderNum: "F-046", docPath: "", userName: "admin", dateOfAdd: "2023-02-10T10:00:00Z", pId: "50", forCheck: "0" },
  { id: "arc-47", docType: "1", docYear: "2023", docNum: "ص/2023/015", docDateCH: "2023-03-01", docDateHig: "1444/08/09", docSubj: "تكليف باعداد خطة تنسيق تربوي", docTo: "قسم التنسيق والتاهيل التربوي", docSorse: "مكتب الامانة", storedNum: "أرش/47/2023", stordPlace: "المبنى الرئيسي", folderNum: "F-047", docPath: "", userName: "admin", dateOfAdd: "2023-03-01T09:00:00Z", pId: "51", forCheck: "0" },
  { id: "arc-48", docType: "3", docYear: "2023", docNum: "و/2023/015", docDateCH: "2023-03-20", docDateHig: "1444/08/28", docSubj: "ابلاغ بتأسيس مركز دراسات جديد", docTo: "مركز الامام الحسن(ع) للدراسات", docSorse: "الشؤون الفكرية", storedNum: "أرش/48/2023", stordPlace: "المبنى الرئيسي", folderNum: "F-048", docPath: "", userName: "admin", dateOfAdd: "2023-03-20T14:00:00Z", pId: "52", forCheck: "0" },
  { id: "arc-49", docType: "1", docYear: "2023", docNum: "ص/2023/020", docDateCH: "2023-04-10", docDateHig: "1444/09/18", docSubj: "تكليف بتطوير برنامج الخطابة", docTo: "قسم الخطابة الحسينية", docSorse: "الشؤون الدينية", storedNum: "أرش/49/2023", stordPlace: "المبنى الرئيسي", folderNum: "F-049", docPath: "", userName: "admin", dateOfAdd: "2023-04-10T11:30:00Z", pId: "54", forCheck: "0" },
  { id: "arc-50", docType: "1", docYear: "2025", docNum: "ص/2025/001", docDateCH: "2025-01-05", docDateHig: "1446/06/24", docSubj: "ابلاغ بخطة العمل للعام 2025", docTo: "جميع الاقسام", docSorse: "الامانة العامة", storedNum: "أرش/50/2025", stordPlace: "المبنى الرئيسي", folderNum: "F-050", docPath: "", userName: "admin", dateOfAdd: "2025-01-05T08:00:00Z", pId: "1", forCheck: "0" },
];

const defaultArchiveDocuments = ARCHIVE_SAMPLE_DOCUMENTS;
const defaultArchiveDocTypes = ARCHIVE_DOC_TYPES;
const defaultArchiveLevels = ARCHIVE_LEVELS;
const defaultArchiveParts = ARCHIVE_PARTS;
const defaultArchiveSections = ARCHIVE_SECTIONS;
const defaultArchiveUserPerms = ARCHIVE_USER_PERMS;
const defaultArchiveYears = ARCHIVE_YEARS;

interface StoreData {
  employees: Employee[];
  courses: Course[];
  trainees: CourseTrainee[];
  hrRequests: HRRequest[];
  curriculumItems: CurriculumItem[];
  correspondence: CorrespondenceItem[];
  tasks: Task[];
  taskHandovers: TaskHandover[];
  taskComments: TaskComment[];
  notifications: Notification[];
  auditLog: AuditEntry[];
  profiles: UserProfile[];
  userAccounts: UserAccount[];
  governorateTraining: GovernorateTraining[];
  followUpRecords: FollowUpRecord[];
  followUpNotifications: FollowUpNotification[];
  weekSchedules: WeekScheduleEntry[];
  trainingPlanImports: TrainingPlanImport[];
  archiveDocuments: ArchiveDocument[];
  archiveDocTypes: ArchiveDocType[];
  archiveLevels: ArchiveLevel[];
  archiveParts: ArchivePart[];
  archiveSections: ArchiveSection[];
  archiveUserPerms: ArchiveUserPerm[];
  archiveYears: ArchiveYear[];
  evaluations: Evaluation[];
}

const getDefaultStore = (): StoreData => ({
  employees: defaultEmployees,
  courses: defaultCourses,
  trainees: defaultTrainees,
  hrRequests: defaultHRRequests,
  curriculumItems: defaultCurriculum,
  correspondence: defaultCorrespondence,
  tasks: defaultTasks,
  taskHandovers: defaultTaskHandovers,
  taskComments: defaultTaskComments,
  notifications: defaultNotifications,
  auditLog: defaultAuditLog,
  profiles: defaultProfiles,
  userAccounts: defaultUserAccounts,
  governorateTraining: defaultGovernorateTraining,
  followUpRecords: defaultFollowUpRecords,
  followUpNotifications: defaultFollowUpNotifications,
  weekSchedules: defaultWeekSchedules,
  trainingPlanImports: defaultTrainingPlanImports,
  archiveDocuments: defaultArchiveDocuments,
  archiveDocTypes: defaultArchiveDocTypes,
  archiveLevels: defaultArchiveLevels,
  archiveParts: defaultArchiveParts,
  archiveSections: defaultArchiveSections,
  archiveUserPerms: defaultArchiveUserPerms,
  archiveYears: defaultArchiveYears,
  evaluations: [],
});

let store: StoreData | null = null;

function getStore(): StoreData {
  if (store) return store;
  try {
    const currentVer = localStorage.getItem(SEED_VERSION_KEY);
    if (currentVer !== SEED_VERSION) {
      // Force re-seed with fresh data
      store = getDefaultStore();
      localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
      saveStore();
      return store;
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      store = JSON.parse(saved);
      return store!;
    }
  } catch { /* ignore parse errors */ }
  store = getDefaultStore();
  localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
  saveStore();

  return store;
}

function saveStore() {
  if (!store) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    if (getServerAvailable()) debouncedPush();
    try { window.dispatchEvent(new CustomEvent("tms_store_changed")); } catch { /* noop */ }
  } catch { /* ignore write errors */ }
}


export function invalidateStore() {
  store = null;
}

export function resetStore() {
  store = getDefaultStore();
  saveStore();
}

export function clearAllStoreData() {
  const emptyStore: StoreData = {
    employees: [],
    courses: [],
    trainees: [],
    hrRequests: [],
    curriculumItems: [],
    correspondence: [],
    tasks: [],
    taskHandovers: [],
    taskComments: [],
    notifications: [],
    auditLog: [],
    profiles: defaultUserAccounts.map(a => a.profile),
    userAccounts: defaultUserAccounts,
    governorateTraining: [],
    followUpRecords: [],
    followUpNotifications: [],
    weekSchedules: [],
    trainingPlanImports: [],
    archiveDocuments: [],
    archiveDocTypes: defaultArchiveDocTypes,
    archiveLevels: defaultArchiveLevels,
    archiveParts: defaultArchiveParts,
    archiveSections: defaultArchiveSections,
    archiveUserPerms: [],
    archiveYears: defaultArchiveYears,
    evaluations: [],
  };
  store = emptyStore;
  saveStore();
}

// === CRUD helpers ===
function getAll<T>(key: keyof StoreData): T[] {
  const s = getStore();
  if (!Array.isArray(s[key])) {
    (s as unknown as Record<string, unknown>)[key as string] = [];
    saveStore();
  }
  return s[key] as T[];
}

function insertItem<T extends { id: string }>(key: keyof StoreData, item: Omit<T, "id"> & { id?: string }): T {
  const s = getStore();
  const arr = s[key] as T[];
  const newItem = { ...item, id: item.id || uid() } as T;
  arr.push(newItem);
  saveStore();
  return newItem;
}

function updateItem<T extends { id: string }>(key: keyof StoreData, id: string, updates: Partial<T>): T | null {
  const s = getStore();
  const arr = s[key] as T[];
  const idx = arr.findIndex((item) => item.id === id);
  if (idx === -1) return null;
  arr[idx] = { ...arr[idx], ...updates };
  saveStore();
  return arr[idx];
}

function deleteItem<T extends { id: string }>(key: keyof StoreData, id: string): boolean {
  const s = getStore();
  const arr = s[key] as T[];
  const idx = arr.findIndex((item) => item.id === id);
  if (idx === -1) return false;
  arr.splice(idx, 1);
  saveStore();
  return true;
}

// === Table-specific API ===
export const localDb = {
  employees: {
    getAll: () => getAll<Employee>("employees"),
    insert: (e: Partial<Employee>) => insertItem<Employee>("employees", { created_at: now(), updated_at: now(), ...e } as Employee),
    update: (id: string, u: Partial<Employee>) => updateItem<Employee>("employees", id, { updated_at: now(), ...u } as Partial<Employee>),
    delete: (id: string) => deleteItem<Employee>("employees", id),
  },
  courses: {
    getAll: () => {
      const courses = getAll<Course>("courses");
      const trainees = getAll<CourseTrainee>("trainees");
      return courses.map(c => ({ ...c, trainees: trainees.filter(t => t.course_id === c.id) }));
    },
    insert: (c: Partial<Course>) => insertItem<Course>("courses", { created_at: now(), updated_at: now(), ...c } as Course),
    update: (id: string, u: Partial<Course>) => updateItem<Course>("courses", id, { updated_at: now(), ...u } as Partial<Course>),
    delete: (id: string) => { localDb.trainees.deleteByCourse(id); return deleteItem<Course>("courses", id); },
  },
  trainees: {
    getAll: () => getAll<CourseTrainee>("trainees"),
    insert: (t: Partial<CourseTrainee>) => insertItem<CourseTrainee>("trainees", { created_at: now(), ...t } as CourseTrainee),
    update: (id: string, u: Partial<CourseTrainee>) => updateItem<CourseTrainee>("trainees", id, u),
    deleteByCourse: (courseId: string) => {
      const s = getStore();
      s.trainees = s.trainees.filter(t => t.course_id !== courseId);
      saveStore();
    },
  },
  hrRequests: {
    getAll: () => getAll<HRRequest>("hrRequests"),
    insert: (r: Partial<HRRequest>) => insertItem<HRRequest>("hrRequests", {
      approval_status: "pending", unit_head_status: "pending", unit_head_by: null, unit_head_at: null,
      dept_manager_status: "pending", dept_manager_by: null, dept_manager_at: null,
      created_at: now(), updated_at: now(), ...r,
    } as HRRequest),
    update: (id: string, u: Partial<HRRequest>) => updateItem<HRRequest>("hrRequests", id, { updated_at: now(), ...u } as Partial<HRRequest>),
  },
  curriculumItems: {
    getAll: () => getAll<CurriculumItem>("curriculumItems"),
    insert: (c: Partial<CurriculumItem>) => insertItem<CurriculumItem>("curriculumItems", { created_at: now(), updated_at: now(), ...c } as CurriculumItem),
    update: (id: string, u: Partial<CurriculumItem>) => updateItem<CurriculumItem>("curriculumItems", id, { updated_at: now(), ...u } as Partial<CurriculumItem>),
  },
  correspondence: {
    getAll: () => getAll<CorrespondenceItem>("correspondence"),
    insert: (c: Partial<CorrespondenceItem>) => insertItem<CorrespondenceItem>("correspondence", { created_at: now(), updated_at: now(), ...c } as CorrespondenceItem),
    update: (id: string, u: Partial<CorrespondenceItem>) => updateItem<CorrespondenceItem>("correspondence", id, { updated_at: now(), ...u } as Partial<CorrespondenceItem>),
  },
  tasks: {
    getAll: () => getAll<Task>("tasks"),
    insert: (t: Partial<Task>) => insertItem<Task>("tasks", {
      status: "pending", handed_over: false, achievement_points: 0, is_routine: false,
      created_at: now(), updated_at: now(), ...t,
    } as Task),
    update: (id: string, u: Partial<Task>) => updateItem<Task>("tasks", id, { updated_at: now(), ...u } as Partial<Task>),
  },
  taskHandovers: {
    getAll: () => getAll<TaskHandover>("taskHandovers"),
    insert: (t: Partial<TaskHandover>) => insertItem<TaskHandover>("taskHandovers", { created_at: now(), ...t } as TaskHandover),
    update: (id: string, u: Partial<TaskHandover>) => updateItem<TaskHandover>("taskHandovers", id, u),
  },
  taskComments: {
    getAll: () => getAll<TaskComment>("taskComments"),
    insert: (c: Partial<TaskComment>) => insertItem<TaskComment>("taskComments", { created_at: now(), ...c } as TaskComment),
  },
  notifications: {
    getAll: () => getAll<Notification>("notifications"),
    insert: (n: Partial<Notification>) => insertItem<Notification>("notifications", {
      type: "info", is_read: false, date: today(), created_at: now(), user_id: null, link: null, ...n,
    } as Notification),
    update: (id: string, u: Partial<Notification>) => updateItem<Notification>("notifications", id, u),
  },
  auditLog: {
    getAll: () => getAll<AuditEntry>("auditLog"),
    insert: (e: Partial<AuditEntry>) => insertItem<AuditEntry>("auditLog", { timestamp: now(), ...e } as AuditEntry),
  },
  evaluations: {
    getAll: () => getAll<Evaluation>("evaluations"),
    insert: (e: Partial<Evaluation>) => insertItem<Evaluation>("evaluations", { created_at: now(), ...e } as Evaluation),
  },
  profiles: {
    getAll: () => getAll<UserProfile>("profiles"),
    getById: (id: string) => getAll<UserProfile>("profiles").find(p => p.id === id) || null,
    insert: (p: Partial<UserProfile>) => insertItem<UserProfile>("profiles", p as UserProfile),
    update: (id: string, u: Partial<UserProfile>) => updateItem<UserProfile>("profiles", id, u),
  },
  userAccounts: {
    getAll: () => getAll<UserAccount>("userAccounts"),
    findByEmail: (email: string) => getAll<UserAccount>("userAccounts").find(a => a.email === email) || null,
    insert: (a: UserAccount) => insertItem<UserAccount & { id: string }>("userAccounts", a as UserAccount & { id: string }),
    updateByEmail: (email: string, updates: Partial<UserAccount>) => {
      const s = getStore();
      const idx = s.userAccounts.findIndex(a => a.email === email);
      if (idx === -1) return null;
      s.userAccounts[idx] = { ...s.userAccounts[idx], ...updates };
      saveStore();
      return s.userAccounts[idx];
    },
  },
  governorateTraining: {
    getAll: () => getAll<GovernorateTraining>("governorateTraining"),
    insert: (g: Partial<GovernorateTraining>) => insertItem<GovernorateTraining>("governorateTraining", { created_at: now(), updated_at: now(), ...g } as GovernorateTraining),
    update: (id: string, u: Partial<GovernorateTraining>) => updateItem<GovernorateTraining>("governorateTraining", id, { updated_at: now(), ...u } as Partial<GovernorateTraining>),
    delete: (id: string) => deleteItem<GovernorateTraining>("governorateTraining", id),
  },
  followUpRecords: {
    getAll: () => getAll<FollowUpRecord>("followUpRecords"),
    insert: (r: Partial<FollowUpRecord>) => insertItem<FollowUpRecord>("followUpRecords", { created_at: now(), ...r } as FollowUpRecord),
  },
  followUpNotifications: {
    getAll: () => getAll<FollowUpNotification>("followUpNotifications"),
    insert: (n: Partial<FollowUpNotification>) => insertItem<FollowUpNotification>("followUpNotifications", { created_at: now(), ...n } as FollowUpNotification),
    update: (id: string, u: Partial<FollowUpNotification>) => updateItem<FollowUpNotification>("followUpNotifications", id, u),
    delete: (id: string) => deleteItem<FollowUpNotification>("followUpNotifications", id),
  },
  weekSchedules: {
    getAll: () => getAll<WeekScheduleEntry>("weekSchedules"),
    insert: (w: Partial<WeekScheduleEntry>) => insertItem<WeekScheduleEntry>("weekSchedules", w as WeekScheduleEntry),
    update: (id: string, u: Partial<WeekScheduleEntry>) => updateItem<WeekScheduleEntry>("weekSchedules", id, u),
    delete: (id: string) => deleteItem<WeekScheduleEntry>("weekSchedules", id),
    deleteByGov: (gov: string) => { const s = getStore(); s.weekSchedules = s.weekSchedules.filter(w => w.governorate !== gov); saveStore(); },
  },
  trainingPlanImports: {
    getAll: () => getAll<TrainingPlanImport>("trainingPlanImports"),
    insert: (i: Partial<TrainingPlanImport>) => insertItem<TrainingPlanImport>("trainingPlanImports", i as TrainingPlanImport),
    delete: (id: string) => deleteItem<TrainingPlanImport>("trainingPlanImports", id),
  },
  archiveDocuments: {
    getAll: () => getAll<ArchiveDocument>("archiveDocuments"),
    insert: (d: Partial<ArchiveDocument>) => insertItem<ArchiveDocument>("archiveDocuments", { dateOfAdd: now(), ...d } as ArchiveDocument),
    update: (id: string, u: Partial<ArchiveDocument>) => updateItem<ArchiveDocument>("archiveDocuments", id, u),
    delete: (id: string) => deleteItem<ArchiveDocument>("archiveDocuments", id),
  },
  archiveDocTypes: {
    getAll: () => getAll<ArchiveDocType>("archiveDocTypes"),
  },
  archiveLevels: {
    getAll: () => getAll<ArchiveLevel>("archiveLevels"),
  },
  archiveParts: {
    getAll: () => getAll<ArchivePart>("archiveParts"),
  },
  archiveSections: {
    getAll: () => getAll<ArchiveSection>("archiveSections"),
    getByPartId: (pId: string) => getAll<ArchiveSection>("archiveSections").filter(s => s.pId === pId),
  },
  archiveUserPerms: {
    getAll: () => getAll<ArchiveUserPerm>("archiveUserPerms"),
  },
  archiveYears: {
    getAll: () => getAll<ArchiveYear>("archiveYears"),
  },
};
