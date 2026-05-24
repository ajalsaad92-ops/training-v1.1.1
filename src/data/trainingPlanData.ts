// Auto-generated from Excel

export interface WeeklyPlanRow {
  week: number;
  track1_name: string;
  track1_hours: number;
  track1_days: number;
  track1_status: string;
  track2_name: string;
  track2_hours: number;
  track2_days: number;
  track2_status: string;
  note: string;
}

export interface CourseHoursRow {
  id: number;
  domain: string;
  name: string;
  hours: number;
  days_needed: number;
  weeks_needed: number;
  start_week: number;
  end_week: number;
  track: string;
  nominees_count: number;
  nominees_ratio: number;
  basis: string;
}

export interface ParticipantByCourseRow {
  domain: string;
  course_name: string;
  course_hours: number;
  name: string;
  seq: number;
}

export interface CoursesPerParticipantRow {
  id: number;
  name: string;
  course_count: number;
  total_hours: number;
  courses: string;
}

export interface TopCourseRow {
  course: string;
  count: number;
  ratio: number;
}

export interface CorrectionRow {
  id: number;
  name: string;
  corrected_hours: number;
  corrected_days: number;
  note: string;
}

export const weeklyPlanData: WeeklyPlanRow[] = [
  {
    "week": 1,
    "track1_name": "دورة تقنية SMART",
    "track1_hours": 10,
    "track1_days": 4,
    "track1_status": "تنفيذ كامل",
    "track2_name": "دورة إعداد التقارير",
    "track2_hours": 10,
    "track2_days": 4,
    "track2_status": "تنفيذ كامل",
    "note": "لا تتجاوز المحاضرات 3 ساعات يومياً لكل دورة. ويجوز استمرار الدورة للأسبوع الثاني أو الثالث عند زيادة ساعاتها، مع بقاء الحد الأقصى دورتين فعالتين في الأسبوع."
  },
  {
    "week": 2,
    "track1_name": "دورة المخاطبات الإدارية",
    "track1_hours": 5,
    "track1_days": 2,
    "track1_status": "تنفيذ كامل",
    "track2_name": "دورة أخلاقيات العمل",
    "track2_hours": 9,
    "track2_days": 3,
    "track2_status": "تنفيذ كامل",
    "note": "لا تتجاوز المحاضرات 3 ساعات يومياً لكل دورة. ويجوز استمرار الدورة للأسبوع الثاني أو الثالث عند زيادة ساعاتها، مع بقاء الحد الأقصى دورتين فعالتين في الأسبوع."
  },
  {
    "week": 3,
    "track1_name": "دورة الحفظ والأرشفة",
    "track1_hours": 6,
    "track1_days": 2,
    "track1_status": "تنفيذ كامل",
    "track2_name": "دورة الإدارة الإلكترونية / الوورد",
    "track2_hours": 15,
    "track2_days": 5,
    "track2_status": "تنفيذ كامل",
    "note": "لا تتجاوز المحاضرات 3 ساعات يومياً لكل دورة. ويجوز استمرار الدورة للأسبوع الثاني أو الثالث عند زيادة ساعاتها، مع بقاء الحد الأقصى دورتين فعالتين في الأسبوع."
  },
  {
    "week": 4,
    "track1_name": "دورة الإدارة الإلكترونية / Power Point",
    "track1_hours": 15,
    "track1_days": 5,
    "track1_status": "تنفيذ كامل",
    "track2_name": "دورة برنامج الإكسل",
    "track2_hours": 15,
    "track2_days": 5,
    "track2_status": "تنفيذ كامل",
    "note": "لا تتجاوز المحاضرات 3 ساعات يومياً لكل دورة. ويجوز استمرار الدورة للأسبوع الثاني أو الثالث عند زيادة ساعاتها، مع بقاء الحد الأقصى دورتين فعالتين في الأسبوع."
  },
  {
    "week": 5,
    "track1_name": "دورة التخطيط الاستراتيجي",
    "track1_hours": 15,
    "track1_days": 5,
    "track1_status": "بدء الدورة",
    "track2_name": "دورة أسس القيادة",
    "track2_hours": 15,
    "track2_days": 5,
    "track2_status": "بدء الدورة",
    "note": "لا تتجاوز المحاضرات 3 ساعات يومياً لكل دورة. ويجوز استمرار الدورة للأسبوع الثاني أو الثالث عند زيادة ساعاتها، مع بقاء الحد الأقصى دورتين فعالتين في الأسبوع."
  },
  {
    "week": 6,
    "track1_name": "دورة التخطيط الاستراتيجي",
    "track1_hours": 6,
    "track1_days": 2,
    "track1_status": "اختتام الدورة",
    "track2_name": "دورة أسس القيادة",
    "track2_hours": 6,
    "track2_days": 2,
    "track2_status": "اختتام الدورة",
    "note": "لا تتجاوز المحاضرات 3 ساعات يومياً لكل دورة. ويجوز استمرار الدورة للأسبوع الثاني أو الثالث عند زيادة ساعاتها، مع بقاء الحد الأقصى دورتين فعالتين في الأسبوع."
  },
  {
    "week": 7,
    "track1_name": "دورة القيادة الإشرافية",
    "track1_hours": 15,
    "track1_days": 5,
    "track1_status": "بدء الدورة",
    "track2_name": "دورة الالتزام والانضباط",
    "track2_hours": 10,
    "track2_days": 4,
    "track2_status": "تنفيذ كامل",
    "note": "لا تتجاوز المحاضرات 3 ساعات يومياً لكل دورة. ويجوز استمرار الدورة للأسبوع الثاني أو الثالث عند زيادة ساعاتها، مع بقاء الحد الأقصى دورتين فعالتين في الأسبوع."
  },
  {
    "week": 8,
    "track1_name": "دورة القيادة الإشرافية",
    "track1_hours": 15,
    "track1_days": 5,
    "track1_status": "استمرار",
    "track2_name": "دورة مهارات الحماية الشخصية والمنشآت",
    "track2_hours": 14,
    "track2_days": 5,
    "track2_status": "تنفيذ كامل",
    "note": "لا تتجاوز المحاضرات 3 ساعات يومياً لكل دورة. ويجوز استمرار الدورة للأسبوع الثاني أو الثالث عند زيادة ساعاتها، مع بقاء الحد الأقصى دورتين فعالتين في الأسبوع."
  },
  {
    "week": 9,
    "track1_name": "دورة القيادة الإشرافية",
    "track1_hours": 10,
    "track1_days": 4,
    "track1_status": "اختتام الدورة",
    "track2_name": "دورة ضمان أمن المبنى",
    "track2_hours": 14,
    "track2_days": 5,
    "track2_status": "تنفيذ كامل",
    "note": "لا تتجاوز المحاضرات 3 ساعات يومياً لكل دورة. ويجوز استمرار الدورة للأسبوع الثاني أو الثالث عند زيادة ساعاتها، مع بقاء الحد الأقصى دورتين فعالتين في الأسبوع."
  },
  {
    "week": 10,
    "track1_name": "دورة مهارات التعامل مع المخاطر والتهديدات",
    "track1_hours": 14,
    "track1_days": 5,
    "track1_status": "تنفيذ كامل",
    "track2_name": "دورة إدارة الأزمات",
    "track2_hours": 14,
    "track2_days": 5,
    "track2_status": "تنفيذ كامل",
    "note": "لا تتجاوز المحاضرات 3 ساعات يومياً لكل دورة. ويجوز استمرار الدورة للأسبوع الثاني أو الثالث عند زيادة ساعاتها، مع بقاء الحد الأقصى دورتين فعالتين في الأسبوع."
  },
  {
    "week": 11,
    "track1_name": "دورة الحماية السرية",
    "track1_hours": 6,
    "track1_days": 2,
    "track1_status": "تنفيذ كامل",
    "track2_name": "دورة التعامل مع المظاهرات",
    "track2_hours": 6,
    "track2_days": 2,
    "track2_status": "تنفيذ كامل",
    "note": "لا تتجاوز المحاضرات 3 ساعات يومياً لكل دورة. ويجوز استمرار الدورة للأسبوع الثاني أو الثالث عند زيادة ساعاتها، مع بقاء الحد الأقصى دورتين فعالتين في الأسبوع."
  },
  {
    "week": 12,
    "track1_name": "دورة السلامة المهنية",
    "track1_hours": 6,
    "track1_days": 2,
    "track1_status": "تنفيذ كامل",
    "track2_name": "دورة الإسعافات الأولية",
    "track2_hours": 6,
    "track2_days": 2,
    "track2_status": "تنفيذ كامل",
    "note": "لا تتجاوز المحاضرات 3 ساعات يومياً لكل دورة. ويجوز استمرار الدورة للأسبوع الثاني أو الثالث عند زيادة ساعاتها، مع بقاء الحد الأقصى دورتين فعالتين في الأسبوع."
  },
  {
    "week": 13,
    "track1_name": "دورة السيطرة المخزنية",
    "track1_hours": 14,
    "track1_days": 5,
    "track1_status": "تنفيذ كامل",
    "track2_name": "دورة إدارة وصيانة الآليات والمركبات",
    "track2_hours": 14,
    "track2_days": 5,
    "track2_status": "تنفيذ كامل",
    "note": "لا تتجاوز المحاضرات 3 ساعات يومياً لكل دورة. ويجوز استمرار الدورة للأسبوع الثاني أو الثالث عند زيادة ساعاتها، مع بقاء الحد الأقصى دورتين فعالتين في الأسبوع."
  },
  {
    "week": 14,
    "track1_name": "دورة الإشراف على المشاريع الهندسية والبنى التحتية",
    "track1_hours": 6,
    "track1_days": 2,
    "track1_status": "تنفيذ كامل",
    "track2_name": "دورة العمل التطوعي",
    "track2_hours": 15,
    "track2_days": 5,
    "track2_status": "تنفيذ كامل",
    "note": "لا تتجاوز المحاضرات 3 ساعات يومياً لكل دورة. ويجوز استمرار الدورة للأسبوع الثاني أو الثالث عند زيادة ساعاتها، مع بقاء الحد الأقصى دورتين فعالتين في الأسبوع."
  },
  {
    "week": 15,
    "track1_name": "دورة التشوه الإعلامي",
    "track1_hours": 6,
    "track1_days": 2,
    "track1_status": "تنفيذ كامل",
    "track2_name": "دورة الولاء المؤسسي",
    "track2_hours": 6,
    "track2_days": 2,
    "track2_status": "تنفيذ كامل",
    "note": "لا تتجاوز المحاضرات 3 ساعات يومياً لكل دورة. ويجوز استمرار الدورة للأسبوع الثاني أو الثالث عند زيادة ساعاتها، مع بقاء الحد الأقصى دورتين فعالتين في الأسبوع."
  },
  {
    "week": 16,
    "track1_name": "دورة العلاقات العامة",
    "track1_hours": 6,
    "track1_days": 2,
    "track1_status": "تنفيذ كامل",
    "track2_name": "دورة إدارة الفعاليات والمهرجانات",
    "track2_hours": 6,
    "track2_days": 2,
    "track2_status": "تنفيذ كامل",
    "note": "لا تتجاوز المحاضرات 3 ساعات يومياً لكل دورة. ويجوز استمرار الدورة للأسبوع الثاني أو الثالث عند زيادة ساعاتها، مع بقاء الحد الأقصى دورتين فعالتين في الأسبوع."
  },
  {
    "week": 17,
    "track1_name": "دورة الاستقطاب وبناء الشبكات",
    "track1_hours": 15,
    "track1_days": 5,
    "track1_status": "بدء الدورة",
    "track2_name": "دورة العمل الفرقي",
    "track2_hours": 6,
    "track2_days": 2,
    "track2_status": "تنفيذ كامل",
    "note": "لا تتجاوز المحاضرات 3 ساعات يومياً لكل دورة. ويجوز استمرار الدورة للأسبوع الثاني أو الثالث عند زيادة ساعاتها، مع بقاء الحد الأقصى دورتين فعالتين في الأسبوع."
  },
  {
    "week": 18,
    "track1_name": "دورة الاستقطاب وبناء الشبكات",
    "track1_hours": 3,
    "track1_days": 1,
    "track1_status": "اختتام الدورة",
    "track2_name": "دورة الإشراف التدريبي",
    "track2_hours": 6,
    "track2_days": 2,
    "track2_status": "تنفيذ كامل",
    "note": "لا تتجاوز المحاضرات 3 ساعات يومياً لكل دورة. ويجوز استمرار الدورة للأسبوع الثاني أو الثالث عند زيادة ساعاتها، مع بقاء الحد الأقصى دورتين فعالتين في الأسبوع."
  },
  {
    "week": 19,
    "track1_name": "دورة دراسة المدن",
    "track1_hours": 14,
    "track1_days": 5,
    "track1_status": "تنفيذ كامل",
    "track2_name": "دورة إدارة الوقت وتنظيم الأولويات",
    "track2_hours": 6,
    "track2_days": 2,
    "track2_status": "تنفيذ كامل",
    "note": "لا تتجاوز المحاضرات 3 ساعات يومياً لكل دورة. ويجوز استمرار الدورة للأسبوع الثاني أو الثالث عند زيادة ساعاتها، مع بقاء الحد الأقصى دورتين فعالتين في الأسبوع."
  },
  {
    "week": 20,
    "track1_name": "",
    "track1_hours": 0,
    "track1_days": 0,
    "track1_status": "",
    "track2_name": "دورة إعداد المدربين (TOT)",
    "track2_hours": 15,
    "track2_days": 5,
    "track2_status": "بدء الدورة",
    "note": "لا تتجاوز المحاضرات 3 ساعات يومياً لكل دورة. ويجوز استمرار الدورة للأسبوع الثاني أو الثالث عند زيادة ساعاتها، مع بقاء الحد الأقصى دورتين فعالتين في الأسبوع."
  },
  {
    "week": 21,
    "track1_name": "",
    "track1_hours": 0,
    "track1_days": 0,
    "track1_status": "",
    "track2_name": "دورة إعداد المدربين (TOT)",
    "track2_hours": 15,
    "track2_days": 5,
    "track2_status": "استمرار",
    "note": "لا تتجاوز المحاضرات 3 ساعات يومياً لكل دورة. ويجوز استمرار الدورة للأسبوع الثاني أو الثالث عند زيادة ساعاتها، مع بقاء الحد الأقصى دورتين فعالتين في الأسبوع."
  },
  {
    "week": 22,
    "track1_name": "",
    "track1_hours": 0,
    "track1_days": 0,
    "track1_status": "",
    "track2_name": "دورة إعداد المدربين (TOT)",
    "track2_hours": 10,
    "track2_days": 4,
    "track2_status": "اختتام الدورة",
    "note": "لا تتجاوز المحاضرات 3 ساعات يومياً لكل دورة. ويجوز استمرار الدورة للأسبوع الثاني أو الثالث عند زيادة ساعاتها، مع بقاء الحد الأقصى دورتين فعالتين في الأسبوع."
  }
];

export const coursesHoursData: CourseHoursRow[] = [
  {
    "id": 1,
    "domain": "الدورات الإدارية",
    "name": "دورة تقنية SMART",
    "hours": 10,
    "days_needed": 4,
    "weeks_needed": 1,
    "start_week": 1,
    "end_week": 1,
    "track": "المسار الأول",
    "nominees_count": 36,
    "nominees_ratio": 0.5625,
    "basis": "اختيار المنتسبين ذوي احتياج أساسيات الحاسوب/الإنترنت والذكاء الاصطناعي."
  },
  {
    "id": 2,
    "domain": "الدورات الإدارية",
    "name": "دورة إعداد التقارير",
    "hours": 10,
    "days_needed": 4,
    "weeks_needed": 1,
    "start_week": 1,
    "end_week": 1,
    "track": "المسار الثاني",
    "nominees_count": 17,
    "nominees_ratio": 0.265625,
    "basis": "للعاملين بالتوثيق والمتابعة وإعداد العروض والتقارير."
  },
  {
    "id": 3,
    "domain": "الدورات الإدارية",
    "name": "دورة المخاطبات الإدارية",
    "hours": 5,
    "days_needed": 2,
    "weeks_needed": 1,
    "start_week": 2,
    "end_week": 2,
    "track": "المسار الأول",
    "nominees_count": 21,
    "nominees_ratio": 0.328125,
    "basis": "لمنتسبي الصادر والوارد، السكرتارية، والمخاطبات الرسمية."
  },
  {
    "id": 4,
    "domain": "الدورات الإدارية",
    "name": "دورة أخلاقيات العمل",
    "hours": 9,
    "days_needed": 3,
    "weeks_needed": 1,
    "start_week": 2,
    "end_week": 2,
    "track": "المسار الثاني",
    "nominees_count": 34,
    "nominees_ratio": 0.53125,
    "basis": "لمن لديهم تقييم متوسط/ضعيف في الأداء أو التواصل أو إدارة الوقت أو السلوك/التعاون."
  },
  {
    "id": 5,
    "domain": "الدورات الإدارية",
    "name": "دورة الحفظ والأرشفة",
    "hours": 6,
    "days_needed": 2,
    "weeks_needed": 1,
    "start_week": 3,
    "end_week": 3,
    "track": "المسار الأول",
    "nominees_count": 21,
    "nominees_ratio": 0.328125,
    "basis": "لمنتسبي الأرشفة والصادر والوارد."
  },
  {
    "id": 6,
    "domain": "الدورات التقنية",
    "name": "دورة الإدارة الإلكترونية / الوورد",
    "hours": 15,
    "days_needed": 5,
    "weeks_needed": 1,
    "start_week": 3,
    "end_week": 3,
    "track": "المسار الثاني",
    "nominees_count": 37,
    "nominees_ratio": 0.578125,
    "basis": "لمن تقييم الوورد لديهم متوسط أو ضعيف أو طبيعة عملهم كتب رسمية."
  },
  {
    "id": 7,
    "domain": "الدورات التقنية",
    "name": "دورة الإدارة الإلكترونية / Power Point",
    "hours": 15,
    "days_needed": 5,
    "weeks_needed": 1,
    "start_week": 4,
    "end_week": 4,
    "track": "المسار الأول",
    "nominees_count": 43,
    "nominees_ratio": 0.671875,
    "basis": "لمن يحتاجون إعداد عروض وتقديم تقارير مرئية."
  },
  {
    "id": 8,
    "domain": "الدورات التقنية",
    "name": "دورة برنامج الإكسل",
    "hours": 15,
    "days_needed": 5,
    "weeks_needed": 1,
    "start_week": 4,
    "end_week": 4,
    "track": "المسار الثاني",
    "nominees_count": 41,
    "nominees_ratio": 0.640625,
    "basis": "لمن يحتاجون الجداول والتقارير والمتابعة."
  },
  {
    "id": 9,
    "domain": "دورات القيادة والإشراف",
    "name": "دورة التخطيط الاستراتيجي",
    "hours": 21,
    "days_needed": 7,
    "weeks_needed": 2,
    "start_week": 5,
    "end_week": 6,
    "track": "المسار الأول",
    "nominees_count": 14,
    "nominees_ratio": 0.21875,
    "basis": "للمسؤولين والمشرفين وأصحاب مهام الإدارة والمتابعة."
  },
  {
    "id": 10,
    "domain": "دورات القيادة والإشراف",
    "name": "دورة أسس القيادة",
    "hours": 21,
    "days_needed": 7,
    "weeks_needed": 2,
    "start_week": 5,
    "end_week": 6,
    "track": "المسار الثاني",
    "nominees_count": 14,
    "nominees_ratio": 0.21875,
    "basis": "للمسؤولين والمشرفين ومكاتب الإدارة."
  },
  {
    "id": 11,
    "domain": "دورات القيادة والإشراف",
    "name": "دورة القيادة الإشرافية",
    "hours": 40,
    "days_needed": 14,
    "weeks_needed": 3,
    "start_week": 7,
    "end_week": 9,
    "track": "المسار الأول",
    "nominees_count": 14,
    "nominees_ratio": 0.21875,
    "basis": "رقم الساعات الظاهر بالصورة مقروء 40 ساعة؛ يراجع عند الحاجة."
  },
  {
    "id": 12,
    "domain": "دورات القيادة والإشراف",
    "name": "دورة الالتزام والانضباط",
    "hours": 10,
    "days_needed": 4,
    "weeks_needed": 1,
    "start_week": 7,
    "end_week": 7,
    "track": "المسار الثاني",
    "nominees_count": 34,
    "nominees_ratio": 0.53125,
    "basis": "لمن لديهم احتياج سلوكي/انضباطي أو تقييم متوسط/ضعيف."
  },
  {
    "id": 13,
    "domain": "الدورات الأمنية والوقائية",
    "name": "دورة مهارات الحماية الشخصية والمنشآت",
    "hours": 14,
    "days_needed": 5,
    "weeks_needed": 1,
    "start_week": 8,
    "end_week": 8,
    "track": "المسار الثاني",
    "nominees_count": 26,
    "nominees_ratio": 0.40625,
    "basis": "لشعبة الأمن والاستعلامات والتعامل مع المراجعين."
  },
  {
    "id": 14,
    "domain": "الدورات الأمنية والوقائية",
    "name": "دورة ضمان أمن المبنى",
    "hours": 14,
    "days_needed": 5,
    "weeks_needed": 1,
    "start_week": 9,
    "end_week": 9,
    "track": "المسار الثاني",
    "nominees_count": 26,
    "nominees_ratio": 0.40625,
    "basis": "لمنتسبي الأمن والحراسة والاستعلامات."
  },
  {
    "id": 15,
    "domain": "الدورات الأمنية والوقائية",
    "name": "دورة مهارات التعامل مع المخاطر والتهديدات",
    "hours": 14,
    "days_needed": 5,
    "weeks_needed": 1,
    "start_week": 10,
    "end_week": 10,
    "track": "المسار الأول",
    "nominees_count": 26,
    "nominees_ratio": 0.40625,
    "basis": "لمنتسبي الأمن والسلامة والمراقبة."
  },
  {
    "id": 16,
    "domain": "الدورات الأمنية والوقائية",
    "name": "دورة إدارة الأزمات",
    "hours": 14,
    "days_needed": 5,
    "weeks_needed": 1,
    "start_week": 10,
    "end_week": 10,
    "track": "المسار الثاني",
    "nominees_count": 26,
    "nominees_ratio": 0.40625,
    "basis": "لمنتسبي الأمن والمسؤولين المناوبين والواجهات الخدمية."
  },
  {
    "id": 17,
    "domain": "الدورات الأمنية والوقائية",
    "name": "دورة الحماية السرية",
    "hours": 6,
    "days_needed": 2,
    "weeks_needed": 1,
    "start_week": 11,
    "end_week": 11,
    "track": "المسار الأول",
    "nominees_count": 26,
    "nominees_ratio": 0.40625,
    "basis": "لمنتسبي الأمن ومن يتعاملون مع بيانات أو مواقف حساسة."
  },
  {
    "id": 18,
    "domain": "الدورات الأمنية والوقائية",
    "name": "دورة التعامل مع المظاهرات",
    "hours": 6,
    "days_needed": 2,
    "weeks_needed": 1,
    "start_week": 11,
    "end_week": 11,
    "track": "المسار الثاني",
    "nominees_count": 26,
    "nominees_ratio": 0.40625,
    "basis": "لشعبة الأمن والاستعلامات ومهام الواجهة."
  },
  {
    "id": 19,
    "domain": "دورات الصحة والسلامة",
    "name": "دورة السلامة المهنية",
    "hours": 6,
    "days_needed": 2,
    "weeks_needed": 1,
    "start_week": 12,
    "end_week": 12,
    "track": "المسار الأول",
    "nominees_count": 37,
    "nominees_ratio": 0.578125,
    "basis": "لمنتسبي الأمن والسلامة والمخازن والتجهيزات."
  },
  {
    "id": 20,
    "domain": "دورات الصحة والسلامة",
    "name": "دورة الإسعافات الأولية",
    "hours": 6,
    "days_needed": 2,
    "weeks_needed": 1,
    "start_week": 12,
    "end_week": 12,
    "track": "المسار الثاني",
    "nominees_count": 37,
    "nominees_ratio": 0.578125,
    "basis": "لمنتسبي الأمن والاستعلامات ومن لديهم تماس مع المراجعين."
  },
  {
    "id": 21,
    "domain": "الدورات اللوجستية",
    "name": "دورة السيطرة المخزنية",
    "hours": 14,
    "days_needed": 5,
    "weeks_needed": 1,
    "start_week": 13,
    "end_week": 13,
    "track": "المسار الأول",
    "nominees_count": 12,
    "nominees_ratio": 0.1875,
    "basis": "لمنتسبي المخازن واللوجستيات والتجهيزات."
  },
  {
    "id": 22,
    "domain": "الدورات اللوجستية",
    "name": "دورة إدارة وصيانة الآليات والمركبات",
    "hours": 14,
    "days_needed": 5,
    "weeks_needed": 1,
    "start_week": 13,
    "end_week": 13,
    "track": "المسار الثاني",
    "nominees_count": 3,
    "nominees_ratio": 0.046875,
    "basis": "للسائقين أو من تظهر مهامهم مرتبطة بالمركبات؛ العدد قليل حسب البيانات."
  },
  {
    "id": 23,
    "domain": "الدورات اللوجستية",
    "name": "دورة الإشراف على المشاريع الهندسية والبنى التحتية",
    "hours": 6,
    "days_needed": 2,
    "weeks_needed": 1,
    "start_week": 14,
    "end_week": 14,
    "track": "المسار الأول",
    "nominees_count": 1,
    "nominees_ratio": 0.015625,
    "basis": "لمن لديه مهام هندسية أو إشراف على إعمار/مشاريع."
  },
  {
    "id": 24,
    "domain": "الدورات المجتمعية والفكرية",
    "name": "دورة العمل التطوعي",
    "hours": 15,
    "days_needed": 5,
    "weeks_needed": 1,
    "start_week": 14,
    "end_week": 14,
    "track": "المسار الثاني",
    "nominees_count": 44,
    "nominees_ratio": 0.6875,
    "basis": "لمنتسبي العلاقات وخدمة المستفيدين والتواصل مع المراجعين."
  },
  {
    "id": 25,
    "domain": "الدورات المجتمعية والفكرية",
    "name": "دورة التشوه الإعلامي",
    "hours": 6,
    "days_needed": 2,
    "weeks_needed": 1,
    "start_week": 15,
    "end_week": 15,
    "track": "المسار الأول",
    "nominees_count": 4,
    "nominees_ratio": 0.0625,
    "basis": "لمنتسبي الإعلام والبناء الفكري وصناعة المحتوى."
  },
  {
    "id": 26,
    "domain": "الدورات المجتمعية والفكرية",
    "name": "دورة الولاء المؤسسي",
    "hours": 6,
    "days_needed": 2,
    "weeks_needed": 1,
    "start_week": 15,
    "end_week": 15,
    "track": "المسار الثاني",
    "nominees_count": 34,
    "nominees_ratio": 0.53125,
    "basis": "للمنتسبين ذوي احتياج الانضباط والسلوك والعمل المؤسسي."
  },
  {
    "id": 27,
    "domain": "الدورات المجتمعية والفكرية",
    "name": "دورة العلاقات العامة",
    "hours": 6,
    "days_needed": 2,
    "weeks_needed": 1,
    "start_week": 16,
    "end_week": 16,
    "track": "المسار الأول",
    "nominees_count": 44,
    "nominees_ratio": 0.6875,
    "basis": "للعلاقات، خدمة المراجعين، ومكتب المدير."
  },
  {
    "id": 28,
    "domain": "الدورات المجتمعية والفكرية",
    "name": "دورة إدارة الفعاليات والمهرجانات",
    "hours": 6,
    "days_needed": 2,
    "weeks_needed": 1,
    "start_week": 16,
    "end_week": 16,
    "track": "المسار الثاني",
    "nominees_count": 14,
    "nominees_ratio": 0.21875,
    "basis": "للتشريفات والإعلام والبناء الفكري ومن يشاركون بالأنشطة."
  },
  {
    "id": 29,
    "domain": "دورات الموارد البشرية",
    "name": "دورة الاستقطاب وبناء الشبكات",
    "hours": 18,
    "days_needed": 6,
    "weeks_needed": 2,
    "start_week": 17,
    "end_week": 18,
    "track": "المسار الأول",
    "nominees_count": 25,
    "nominees_ratio": 0.390625,
    "basis": "للشؤون الإدارية والموارد البشرية ومكاتب الإدارة."
  },
  {
    "id": 30,
    "domain": "دورات الموارد البشرية",
    "name": "دورة العمل الفرقي",
    "hours": 6,
    "days_needed": 2,
    "weeks_needed": 1,
    "start_week": 17,
    "end_week": 17,
    "track": "المسار الثاني",
    "nominees_count": 11,
    "nominees_ratio": 0.171875,
    "basis": "لمن لديهم احتياج تواصل/استقبال أو عمل جماعي."
  },
  {
    "id": 31,
    "domain": "دورات الموارد البشرية",
    "name": "دورة الإشراف التدريبي",
    "hours": 6,
    "days_needed": 2,
    "weeks_needed": 1,
    "start_week": 18,
    "end_week": 18,
    "track": "المسار الثاني",
    "nominees_count": 18,
    "nominees_ratio": 0.28125,
    "basis": "للمسؤولين ومن يمكن اعتمادهم كنقاط تدريب داخلية."
  },
  {
    "id": 32,
    "domain": "دورات التخطيط والمعلومات",
    "name": "دورة دراسة المدن",
    "hours": 14,
    "days_needed": 5,
    "weeks_needed": 1,
    "start_week": 19,
    "end_week": 19,
    "track": "المسار الأول",
    "nominees_count": 16,
    "nominees_ratio": 0.25,
    "basis": "للمتابعة الميدانية والتوثيق وخدمة المستفيدين."
  },
  {
    "id": 33,
    "domain": "دورات التخطيط والمعلومات",
    "name": "دورة إدارة الوقت وتنظيم الأولويات",
    "hours": 6,
    "days_needed": 2,
    "weeks_needed": 1,
    "start_week": 19,
    "end_week": 19,
    "track": "المسار الثاني",
    "nominees_count": 11,
    "nominees_ratio": 0.171875,
    "basis": "لمن تقييم إدارة الوقت لديهم متوسط/ضعيف أو لديهم احتياج مباشر."
  },
  {
    "id": 34,
    "domain": "دورات التخطيط والمعلومات",
    "name": "دورة إعداد المدربين (TOT)",
    "hours": 40,
    "days_needed": 14,
    "weeks_needed": 3,
    "start_week": 20,
    "end_week": 22,
    "track": "المسار الثاني",
    "nominees_count": 18,
    "nominees_ratio": 0.28125,
    "basis": "للمسؤولين والمشرفين والمرشحين لنقل المعرفة داخل المكتب."
  }
];

export const participantsByCourseData: ParticipantByCourseRow[] = [
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة تقنية SMART",
    "course_hours": 10,
    "name": "مصطفى عيدان هادي حسين",
    "seq": 1
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة تقنية SMART",
    "course_hours": 10,
    "name": "رضا علي هاني هادي",
    "seq": 2
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة تقنية SMART",
    "course_hours": 10,
    "name": "علي حسين عبد ابراهيم احمد",
    "seq": 3
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة تقنية SMART",
    "course_hours": 10,
    "name": "احمد جاسم ابو الشون كاظم",
    "seq": 4
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة تقنية SMART",
    "course_hours": 10,
    "name": "كرار سعد محمد علي",
    "seq": 5
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة تقنية SMART",
    "course_hours": 10,
    "name": "علي محمد حاتم شعلان",
    "seq": 6
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة تقنية SMART",
    "course_hours": 10,
    "name": "محمد سعود حمزة عباس",
    "seq": 7
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة تقنية SMART",
    "course_hours": 10,
    "name": "علي حيدر كاظم عباس",
    "seq": 8
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة تقنية SMART",
    "course_hours": 10,
    "name": "رشا حسن شاكر سعيد",
    "seq": 9
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة تقنية SMART",
    "course_hours": 10,
    "name": "حسن عبد صكر حسين المنصوري",
    "seq": 10
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة تقنية SMART",
    "course_hours": 10,
    "name": "نشوان حسين علي عبد المرشدي",
    "seq": 11
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة تقنية SMART",
    "course_hours": 10,
    "name": "عقيل كاظم مراد كاظم",
    "seq": 12
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة تقنية SMART",
    "course_hours": 10,
    "name": "علي طعمة جابر",
    "seq": 13
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة تقنية SMART",
    "course_hours": 10,
    "name": "احمد حسين عبد الحمزة احمد",
    "seq": 14
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة تقنية SMART",
    "course_hours": 10,
    "name": "علي حسين كزار راهي",
    "seq": 15
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة تقنية SMART",
    "course_hours": 10,
    "name": "سجاد رحمن جمعة جابر",
    "seq": 16
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة تقنية SMART",
    "course_hours": 10,
    "name": "عبد الحسن شعلان ساهي مشهد",
    "seq": 17
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة تقنية SMART",
    "course_hours": 10,
    "name": "علي سلطان قاسم لازم",
    "seq": 18
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة تقنية SMART",
    "course_hours": 10,
    "name": "حسنين نعمة عجيل حسين",
    "seq": 19
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة تقنية SMART",
    "course_hours": 10,
    "name": "علي عبد الحسين موزان",
    "seq": 20
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة تقنية SMART",
    "course_hours": 10,
    "name": "حسين محمد جاسم صحن",
    "seq": 21
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة تقنية SMART",
    "course_hours": 10,
    "name": "براء احمد متعب عواد",
    "seq": 22
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة تقنية SMART",
    "course_hours": 10,
    "name": "فاضل عبد العباس علي عباس",
    "seq": 23
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة تقنية SMART",
    "course_hours": 10,
    "name": "علي عباس بريج حطاب",
    "seq": 24
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة تقنية SMART",
    "course_hours": 10,
    "name": "عبد علي سليمان عنبر",
    "seq": 25
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة تقنية SMART",
    "course_hours": 10,
    "name": "قاسم عبد علي مزهر هزاء",
    "seq": 26
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة تقنية SMART",
    "course_hours": 10,
    "name": "علاوي محمد جدي عبود",
    "seq": 27
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة تقنية SMART",
    "course_hours": 10,
    "name": "علي حسين علاوي راضي",
    "seq": 28
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة تقنية SMART",
    "course_hours": 10,
    "name": "احمد كاظم مجبل محمد",
    "seq": 29
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة تقنية SMART",
    "course_hours": 10,
    "name": "ابو الفضل عبد مسلم يلسين",
    "seq": 30
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة تقنية SMART",
    "course_hours": 10,
    "name": "محسن خوام مهدي عظب",
    "seq": 31
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة تقنية SMART",
    "course_hours": 10,
    "name": "سليمان محمد كرحوت دريم",
    "seq": 32
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة تقنية SMART",
    "course_hours": 10,
    "name": "مزهر خوام نصيف جاسم",
    "seq": 33
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة تقنية SMART",
    "course_hours": 10,
    "name": "محمود ابراهيم جاسم محيميد",
    "seq": 34
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة تقنية SMART",
    "course_hours": 10,
    "name": "حيدر عبد الله رزوقي علي",
    "seq": 35
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة تقنية SMART",
    "course_hours": 10,
    "name": "محمود شاكر عويد بيروت",
    "seq": 36
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة إعداد التقارير",
    "course_hours": 10,
    "name": "علي عبد الامير خلف عرط",
    "seq": 1
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة إعداد التقارير",
    "course_hours": 10,
    "name": "علي رحيم عبود رشيد",
    "seq": 2
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة إعداد التقارير",
    "course_hours": 10,
    "name": "حسن وليد كاظم عبعوب",
    "seq": 3
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة إعداد التقارير",
    "course_hours": 10,
    "name": "احمد جاسم ابو الشون كاظم",
    "seq": 4
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة إعداد التقارير",
    "course_hours": 10,
    "name": "كرار سعد محمد علي",
    "seq": 5
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة إعداد التقارير",
    "course_hours": 10,
    "name": "احمد كاظم عبد علي حمزة",
    "seq": 6
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة إعداد التقارير",
    "course_hours": 10,
    "name": "وضاح فاروق خليل بارود",
    "seq": 7
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة إعداد التقارير",
    "course_hours": 10,
    "name": "حسين اركان عبد الزهرة عبد الحسين",
    "seq": 8
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة إعداد التقارير",
    "course_hours": 10,
    "name": "حسين ثامر سعيد جابر",
    "seq": 9
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة إعداد التقارير",
    "course_hours": 10,
    "name": "حيدر محسن علوان جاسم",
    "seq": 10
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة إعداد التقارير",
    "course_hours": 10,
    "name": "حسين كريم عبد عمران حمزة",
    "seq": 11
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة إعداد التقارير",
    "course_hours": 10,
    "name": "رشا حسن شاكر سعيد",
    "seq": 12
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة إعداد التقارير",
    "course_hours": 10,
    "name": "حسن مهدي حسن عزيز",
    "seq": 13
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة إعداد التقارير",
    "course_hours": 10,
    "name": "علاء هاشم كريم فجر",
    "seq": 14
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة إعداد التقارير",
    "course_hours": 10,
    "name": "عقيل كاظم مراد كاظم",
    "seq": 15
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة إعداد التقارير",
    "course_hours": 10,
    "name": "ابا الفضل عباس مهدي عبود",
    "seq": 16
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة إعداد التقارير",
    "course_hours": 10,
    "name": "عدي كتاب درب دعامة",
    "seq": 17
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة المخاطبات الإدارية",
    "course_hours": 5,
    "name": "مصطفى عيدان هادي حسين",
    "seq": 1
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة المخاطبات الإدارية",
    "course_hours": 5,
    "name": "كاظم ابراهيم باقر حسن",
    "seq": 2
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة المخاطبات الإدارية",
    "course_hours": 5,
    "name": "رضا علي هاني هادي",
    "seq": 3
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة المخاطبات الإدارية",
    "course_hours": 5,
    "name": "حسن وليد كاظم عبعوب",
    "seq": 4
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة المخاطبات الإدارية",
    "course_hours": 5,
    "name": "علي حسين عبد ابراهيم احمد",
    "seq": 5
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة المخاطبات الإدارية",
    "course_hours": 5,
    "name": "محمد عامر عبد الحسين راضي",
    "seq": 6
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة المخاطبات الإدارية",
    "course_hours": 5,
    "name": "احمد جاسم ابو الشون كاظم",
    "seq": 7
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة المخاطبات الإدارية",
    "course_hours": 5,
    "name": "عبد الخالق كاظم مرزوق",
    "seq": 8
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة المخاطبات الإدارية",
    "course_hours": 5,
    "name": "كرار سعد محمد علي",
    "seq": 9
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة المخاطبات الإدارية",
    "course_hours": 5,
    "name": "مصطفى محمد صاحب عبد الحسين",
    "seq": 10
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة المخاطبات الإدارية",
    "course_hours": 5,
    "name": "احمد كاظم عبد علي حمزة",
    "seq": 11
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة المخاطبات الإدارية",
    "course_hours": 5,
    "name": "وضاح فاروق خليل بارود",
    "seq": 12
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة المخاطبات الإدارية",
    "course_hours": 5,
    "name": "حسين اركان عبد الزهرة عبد الحسين",
    "seq": 13
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة المخاطبات الإدارية",
    "course_hours": 5,
    "name": "ماهر طعمة جابر محمد",
    "seq": 14
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة المخاطبات الإدارية",
    "course_hours": 5,
    "name": "حسين ثامر سعيد جابر",
    "seq": 15
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة المخاطبات الإدارية",
    "course_hours": 5,
    "name": "محمد مؤيد كاظم عمران",
    "seq": 16
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة المخاطبات الإدارية",
    "course_hours": 5,
    "name": "محمد مهدي حسن فريد",
    "seq": 17
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة المخاطبات الإدارية",
    "course_hours": 5,
    "name": "حسين كريم عبد عمران حمزة",
    "seq": 18
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة المخاطبات الإدارية",
    "course_hours": 5,
    "name": "خلود مدحت محمود جبار",
    "seq": 19
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة المخاطبات الإدارية",
    "course_hours": 5,
    "name": "احمد هاتف محمد عبد علي",
    "seq": 20
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة المخاطبات الإدارية",
    "course_hours": 5,
    "name": "حسن مهدي هاشم خلف",
    "seq": 21
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة أخلاقيات العمل",
    "course_hours": 9,
    "name": "مصطفى عيدان هادي حسين",
    "seq": 1
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة أخلاقيات العمل",
    "course_hours": 9,
    "name": "كاظم ابراهيم باقر حسن",
    "seq": 2
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة أخلاقيات العمل",
    "course_hours": 9,
    "name": "رضا علي هاني هادي",
    "seq": 3
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة أخلاقيات العمل",
    "course_hours": 9,
    "name": "علي حسين عبد ابراهيم احمد",
    "seq": 4
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة أخلاقيات العمل",
    "course_hours": 9,
    "name": "محمد عامر عبد الحسين راضي",
    "seq": 5
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة أخلاقيات العمل",
    "course_hours": 9,
    "name": "عبد الخالق كاظم مرزوق",
    "seq": 6
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة أخلاقيات العمل",
    "course_hours": 9,
    "name": "كرار سعد محمد علي",
    "seq": 7
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة أخلاقيات العمل",
    "course_hours": 9,
    "name": "مصطفى محمد صاحب عبد الحسين",
    "seq": 8
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة أخلاقيات العمل",
    "course_hours": 9,
    "name": "احمد كاظم عبد علي حمزة",
    "seq": 9
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة أخلاقيات العمل",
    "course_hours": 9,
    "name": "حسين اركان عبد الزهرة عبد الحسين",
    "seq": 10
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة أخلاقيات العمل",
    "course_hours": 9,
    "name": "امير عباس حمزة علوان",
    "seq": 11
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة أخلاقيات العمل",
    "course_hours": 9,
    "name": "حسين ثامر سعيد جابر",
    "seq": 12
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة أخلاقيات العمل",
    "course_hours": 9,
    "name": "محمد سعود حمزة عباس",
    "seq": 13
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة أخلاقيات العمل",
    "course_hours": 9,
    "name": "محمد مؤيد كاظم عمران",
    "seq": 14
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة أخلاقيات العمل",
    "course_hours": 9,
    "name": "مروان راشد ياسين حسين",
    "seq": 15
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة أخلاقيات العمل",
    "course_hours": 9,
    "name": "حسين جواد كاظم سلطان",
    "seq": 16
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة أخلاقيات العمل",
    "course_hours": 9,
    "name": "علي حيدر كاظم عباس",
    "seq": 17
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة أخلاقيات العمل",
    "course_hours": 9,
    "name": "محمد مهدي حسن فريد",
    "seq": 18
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة أخلاقيات العمل",
    "course_hours": 9,
    "name": "حسين كريم عبد عمران حمزة",
    "seq": 19
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة أخلاقيات العمل",
    "course_hours": 9,
    "name": "رشا حسن شاكر سعيد",
    "seq": 20
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة أخلاقيات العمل",
    "course_hours": 9,
    "name": "علي عبد الامير خلف عرط",
    "seq": 21
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة أخلاقيات العمل",
    "course_hours": 9,
    "name": "حسن مهدي حسن عزيز",
    "seq": 22
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة أخلاقيات العمل",
    "course_hours": 9,
    "name": "علاء هاشم كريم فجر",
    "seq": 23
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة أخلاقيات العمل",
    "course_hours": 9,
    "name": "علي رحيم عبود رشيد",
    "seq": 24
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة أخلاقيات العمل",
    "course_hours": 9,
    "name": "نشوان حسين علي عبد المرشدي",
    "seq": 25
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة أخلاقيات العمل",
    "course_hours": 9,
    "name": "ابا الفضل عباس مهدي عبود",
    "seq": 26
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة أخلاقيات العمل",
    "course_hours": 9,
    "name": "سجاد رحمن جمعة جابر",
    "seq": 27
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة أخلاقيات العمل",
    "course_hours": 9,
    "name": "علي سلطان قاسم لازم",
    "seq": 28
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة أخلاقيات العمل",
    "course_hours": 9,
    "name": "حسين محمد جاسم صحن",
    "seq": 29
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة أخلاقيات العمل",
    "course_hours": 9,
    "name": "براء احمد متعب عواد",
    "seq": 30
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة أخلاقيات العمل",
    "course_hours": 9,
    "name": "فاضل عبد العباس علي عباس",
    "seq": 31
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة أخلاقيات العمل",
    "course_hours": 9,
    "name": "قاسم عبد علي مزهر هزاء",
    "seq": 32
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة أخلاقيات العمل",
    "course_hours": 9,
    "name": "علاوي محمد جدي عبود",
    "seq": 33
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة أخلاقيات العمل",
    "course_hours": 9,
    "name": "حسن مهدي هاشم خلف",
    "seq": 34
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة الحفظ والأرشفة",
    "course_hours": 6,
    "name": "مصطفى عيدان هادي حسين",
    "seq": 1
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة الحفظ والأرشفة",
    "course_hours": 6,
    "name": "كاظم ابراهيم باقر حسن",
    "seq": 2
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة الحفظ والأرشفة",
    "course_hours": 6,
    "name": "رضا علي هاني هادي",
    "seq": 3
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة الحفظ والأرشفة",
    "course_hours": 6,
    "name": "حسن وليد كاظم عبعوب",
    "seq": 4
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة الحفظ والأرشفة",
    "course_hours": 6,
    "name": "علي حسين عبد ابراهيم احمد",
    "seq": 5
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة الحفظ والأرشفة",
    "course_hours": 6,
    "name": "محمد عامر عبد الحسين راضي",
    "seq": 6
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة الحفظ والأرشفة",
    "course_hours": 6,
    "name": "احمد جاسم ابو الشون كاظم",
    "seq": 7
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة الحفظ والأرشفة",
    "course_hours": 6,
    "name": "عبد الخالق كاظم مرزوق",
    "seq": 8
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة الحفظ والأرشفة",
    "course_hours": 6,
    "name": "كرار سعد محمد علي",
    "seq": 9
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة الحفظ والأرشفة",
    "course_hours": 6,
    "name": "مصطفى محمد صاحب عبد الحسين",
    "seq": 10
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة الحفظ والأرشفة",
    "course_hours": 6,
    "name": "احمد كاظم عبد علي حمزة",
    "seq": 11
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة الحفظ والأرشفة",
    "course_hours": 6,
    "name": "وضاح فاروق خليل بارود",
    "seq": 12
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة الحفظ والأرشفة",
    "course_hours": 6,
    "name": "حسين اركان عبد الزهرة عبد الحسين",
    "seq": 13
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة الحفظ والأرشفة",
    "course_hours": 6,
    "name": "ماهر طعمة جابر محمد",
    "seq": 14
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة الحفظ والأرشفة",
    "course_hours": 6,
    "name": "حسين ثامر سعيد جابر",
    "seq": 15
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة الحفظ والأرشفة",
    "course_hours": 6,
    "name": "محمد مؤيد كاظم عمران",
    "seq": 16
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة الحفظ والأرشفة",
    "course_hours": 6,
    "name": "محمد مهدي حسن فريد",
    "seq": 17
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة الحفظ والأرشفة",
    "course_hours": 6,
    "name": "حسين كريم عبد عمران حمزة",
    "seq": 18
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة الحفظ والأرشفة",
    "course_hours": 6,
    "name": "خلود مدحت محمود جبار",
    "seq": 19
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة الحفظ والأرشفة",
    "course_hours": 6,
    "name": "احمد هاتف محمد عبد علي",
    "seq": 20
  },
  {
    "domain": "الدورات الإدارية",
    "course_name": "دورة الحفظ والأرشفة",
    "course_hours": 6,
    "name": "حسن مهدي هاشم خلف",
    "seq": 21
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / الوورد",
    "course_hours": 15,
    "name": "مصطفى عيدان هادي حسين",
    "seq": 1
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / الوورد",
    "course_hours": 15,
    "name": "علي حسين عبد ابراهيم احمد",
    "seq": 2
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / الوورد",
    "course_hours": 15,
    "name": "ماهر طعمة جابر محمد",
    "seq": 3
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / الوورد",
    "course_hours": 15,
    "name": "علي محمد حاتم شعلان",
    "seq": 4
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / الوورد",
    "course_hours": 15,
    "name": "محمد سعود حمزة عباس",
    "seq": 5
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / الوورد",
    "course_hours": 15,
    "name": "حيدر محسن علوان جاسم",
    "seq": 6
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / الوورد",
    "course_hours": 15,
    "name": "حسين جواد كاظم سلطان",
    "seq": 7
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / الوورد",
    "course_hours": 15,
    "name": "علي حيدر كاظم عباس",
    "seq": 8
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / الوورد",
    "course_hours": 15,
    "name": "عدي كتاب درب دعامة",
    "seq": 9
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / الوورد",
    "course_hours": 15,
    "name": "علاء هاشم كريم فجر",
    "seq": 10
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / الوورد",
    "course_hours": 15,
    "name": "حسن عبد صكر حسين المنصوري",
    "seq": 11
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / الوورد",
    "course_hours": 15,
    "name": "محمد عبد زيد عبد السادة",
    "seq": 12
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / الوورد",
    "course_hours": 15,
    "name": "عناد دليمي محمد برهي",
    "seq": 13
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / الوورد",
    "course_hours": 15,
    "name": "علي طعمة جابر",
    "seq": 14
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / الوورد",
    "course_hours": 15,
    "name": "احمد حسين عبد الحمزة احمد",
    "seq": 15
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / الوورد",
    "course_hours": 15,
    "name": "علي حسين كزار راهي",
    "seq": 16
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / الوورد",
    "course_hours": 15,
    "name": "سجاد رحمن جمعة جابر",
    "seq": 17
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / الوورد",
    "course_hours": 15,
    "name": "عبد الحسن شعلان ساهي مشهد",
    "seq": 18
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / الوورد",
    "course_hours": 15,
    "name": "علي سلطان قاسم لازم",
    "seq": 19
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / الوورد",
    "course_hours": 15,
    "name": "حسنين نعمة عجيل حسين",
    "seq": 20
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / الوورد",
    "course_hours": 15,
    "name": "علي عبد الحسين موزان",
    "seq": 21
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / الوورد",
    "course_hours": 15,
    "name": "حسين محمد جاسم صحن",
    "seq": 22
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / الوورد",
    "course_hours": 15,
    "name": "فاضل عبد العباس علي عباس",
    "seq": 23
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / الوورد",
    "course_hours": 15,
    "name": "علي عباس بريج حطاب",
    "seq": 24
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / الوورد",
    "course_hours": 15,
    "name": "قاسم عبد علي مزهر هزاء",
    "seq": 25
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / الوورد",
    "course_hours": 15,
    "name": "علاوي محمد جدي عبود",
    "seq": 26
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / الوورد",
    "course_hours": 15,
    "name": "علي حسين علاوي راضي",
    "seq": 27
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / الوورد",
    "course_hours": 15,
    "name": "احمد كاظم مجبل محمد",
    "seq": 28
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / الوورد",
    "course_hours": 15,
    "name": "احمد هاتف محمد عبد علي",
    "seq": 29
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / الوورد",
    "course_hours": 15,
    "name": "ابو الفضل عبد مسلم يلسين",
    "seq": 30
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / الوورد",
    "course_hours": 15,
    "name": "محسن خوام مهدي عظب",
    "seq": 31
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / الوورد",
    "course_hours": 15,
    "name": "حسن مهدي هاشم خلف",
    "seq": 32
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / الوورد",
    "course_hours": 15,
    "name": "سليمان محمد كرحوت دريم",
    "seq": 33
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / الوورد",
    "course_hours": 15,
    "name": "مزهر خوام نصيف جاسم",
    "seq": 34
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / الوورد",
    "course_hours": 15,
    "name": "محمود ابراهيم جاسم محيميد",
    "seq": 35
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / الوورد",
    "course_hours": 15,
    "name": "حيدر عبد الله رزوقي علي",
    "seq": 36
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / الوورد",
    "course_hours": 15,
    "name": "محمود شاكر عويد بيروت",
    "seq": 37
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "مصطفى عيدان هادي حسين",
    "seq": 1
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "كاظم ابراهيم باقر حسن",
    "seq": 2
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "رضا علي هاني هادي",
    "seq": 3
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "علي حسين عبد ابراهيم احمد",
    "seq": 4
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "احمد جاسم ابو الشون كاظم",
    "seq": 5
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "عبد الخالق كاظم مرزوق",
    "seq": 6
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "كرار سعد محمد علي",
    "seq": 7
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "مصطفى محمد صاحب عبد الحسين",
    "seq": 8
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "علي محمد حاتم شعلان",
    "seq": 9
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "محمد سعود حمزة عباس",
    "seq": 10
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "محمد مؤيد كاظم عمران",
    "seq": 11
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "حسين جواد كاظم سلطان",
    "seq": 12
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "علي حيدر كاظم عباس",
    "seq": 13
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "عدي كتاب درب دعامة",
    "seq": 14
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "رشا حسن شاكر سعيد",
    "seq": 15
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "حسن مهدي حسن عزيز",
    "seq": 16
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "حسن عبد صكر حسين المنصوري",
    "seq": 17
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "نشوان حسين علي عبد المرشدي",
    "seq": 18
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "عقيل كاظم مراد كاظم",
    "seq": 19
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "علي طعمة جابر",
    "seq": 20
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "احمد حسين عبد الحمزة احمد",
    "seq": 21
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "علي حسين كزار راهي",
    "seq": 22
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "سجاد رحمن جمعة جابر",
    "seq": 23
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "عبد الحسن شعلان ساهي مشهد",
    "seq": 24
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "علي سلطان قاسم لازم",
    "seq": 25
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "حسنين نعمة عجيل حسين",
    "seq": 26
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "علي عبد الحسين موزان",
    "seq": 27
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "حسين محمد جاسم صحن",
    "seq": 28
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "براء احمد متعب عواد",
    "seq": 29
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "فاضل عبد العباس علي عباس",
    "seq": 30
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "علي عباس بريج حطاب",
    "seq": 31
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "عبد علي سليمان عنبر",
    "seq": 32
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "قاسم عبد علي مزهر هزاء",
    "seq": 33
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "علاوي محمد جدي عبود",
    "seq": 34
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "علي حسين علاوي راضي",
    "seq": 35
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "احمد كاظم مجبل محمد",
    "seq": 36
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "ابو الفضل عبد مسلم يلسين",
    "seq": 37
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "محسن خوام مهدي عظب",
    "seq": 38
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "سليمان محمد كرحوت دريم",
    "seq": 39
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "مزهر خوام نصيف جاسم",
    "seq": 40
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "محمود ابراهيم جاسم محيميد",
    "seq": 41
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "حيدر عبد الله رزوقي علي",
    "seq": 42
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة الإدارة الإلكترونية / Power Point",
    "course_hours": 15,
    "name": "محمود شاكر عويد بيروت",
    "seq": 43
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة برنامج الإكسل",
    "course_hours": 15,
    "name": "مصطفى عيدان هادي حسين",
    "seq": 1
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة برنامج الإكسل",
    "course_hours": 15,
    "name": "علي حسين عبد ابراهيم احمد",
    "seq": 2
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة برنامج الإكسل",
    "course_hours": 15,
    "name": "عبد الخالق كاظم مرزوق",
    "seq": 3
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة برنامج الإكسل",
    "course_hours": 15,
    "name": "ماهر طعمة جابر محمد",
    "seq": 4
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة برنامج الإكسل",
    "course_hours": 15,
    "name": "علي محمد حاتم شعلان",
    "seq": 5
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة برنامج الإكسل",
    "course_hours": 15,
    "name": "محمد سعود حمزة عباس",
    "seq": 6
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة برنامج الإكسل",
    "course_hours": 15,
    "name": "حيدر محسن علوان جاسم",
    "seq": 7
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة برنامج الإكسل",
    "course_hours": 15,
    "name": "محمد مؤيد كاظم عمران",
    "seq": 8
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة برنامج الإكسل",
    "course_hours": 15,
    "name": "حسين جواد كاظم سلطان",
    "seq": 9
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة برنامج الإكسل",
    "course_hours": 15,
    "name": "علي حيدر كاظم عباس",
    "seq": 10
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة برنامج الإكسل",
    "course_hours": 15,
    "name": "عدي كتاب درب دعامة",
    "seq": 11
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة برنامج الإكسل",
    "course_hours": 15,
    "name": "حسن مهدي حسن عزيز",
    "seq": 12
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة برنامج الإكسل",
    "course_hours": 15,
    "name": "علاء هاشم كريم فجر",
    "seq": 13
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة برنامج الإكسل",
    "course_hours": 15,
    "name": "حسن عبد صكر حسين المنصوري",
    "seq": 14
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة برنامج الإكسل",
    "course_hours": 15,
    "name": "محمد عبد زيد عبد السادة",
    "seq": 15
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة برنامج الإكسل",
    "course_hours": 15,
    "name": "عناد دليمي محمد برهي",
    "seq": 16
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة برنامج الإكسل",
    "course_hours": 15,
    "name": "نشوان حسين علي عبد المرشدي",
    "seq": 17
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة برنامج الإكسل",
    "course_hours": 15,
    "name": "علي طعمة جابر",
    "seq": 18
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة برنامج الإكسل",
    "course_hours": 15,
    "name": "احمد حسين عبد الحمزة احمد",
    "seq": 19
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة برنامج الإكسل",
    "course_hours": 15,
    "name": "علي حسين كزار راهي",
    "seq": 20
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة برنامج الإكسل",
    "course_hours": 15,
    "name": "سجاد رحمن جمعة جابر",
    "seq": 21
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة برنامج الإكسل",
    "course_hours": 15,
    "name": "عبد الحسن شعلان ساهي مشهد",
    "seq": 22
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة برنامج الإكسل",
    "course_hours": 15,
    "name": "علي سلطان قاسم لازم",
    "seq": 23
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة برنامج الإكسل",
    "course_hours": 15,
    "name": "حسنين نعمة عجيل حسين",
    "seq": 24
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة برنامج الإكسل",
    "course_hours": 15,
    "name": "علي عبد الحسين موزان",
    "seq": 25
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة برنامج الإكسل",
    "course_hours": 15,
    "name": "حسين محمد جاسم صحن",
    "seq": 26
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة برنامج الإكسل",
    "course_hours": 15,
    "name": "فاضل عبد العباس علي عباس",
    "seq": 27
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة برنامج الإكسل",
    "course_hours": 15,
    "name": "علي عباس بريج حطاب",
    "seq": 28
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة برنامج الإكسل",
    "course_hours": 15,
    "name": "قاسم عبد علي مزهر هزاء",
    "seq": 29
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة برنامج الإكسل",
    "course_hours": 15,
    "name": "علاوي محمد جدي عبود",
    "seq": 30
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة برنامج الإكسل",
    "course_hours": 15,
    "name": "علي حسين علاوي راضي",
    "seq": 31
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة برنامج الإكسل",
    "course_hours": 15,
    "name": "احمد كاظم مجبل محمد",
    "seq": 32
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة برنامج الإكسل",
    "course_hours": 15,
    "name": "احمد هاتف محمد عبد علي",
    "seq": 33
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة برنامج الإكسل",
    "course_hours": 15,
    "name": "ابو الفضل عبد مسلم يلسين",
    "seq": 34
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة برنامج الإكسل",
    "course_hours": 15,
    "name": "محسن خوام مهدي عظب",
    "seq": 35
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة برنامج الإكسل",
    "course_hours": 15,
    "name": "حسن مهدي هاشم خلف",
    "seq": 36
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة برنامج الإكسل",
    "course_hours": 15,
    "name": "سليمان محمد كرحوت دريم",
    "seq": 37
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة برنامج الإكسل",
    "course_hours": 15,
    "name": "مزهر خوام نصيف جاسم",
    "seq": 38
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة برنامج الإكسل",
    "course_hours": 15,
    "name": "محمود ابراهيم جاسم محيميد",
    "seq": 39
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة برنامج الإكسل",
    "course_hours": 15,
    "name": "حيدر عبد الله رزوقي علي",
    "seq": 40
  },
  {
    "domain": "الدورات التقنية",
    "course_name": "دورة برنامج الإكسل",
    "course_hours": 15,
    "name": "محمود شاكر عويد بيروت",
    "seq": 41
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة التخطيط الاستراتيجي",
    "course_hours": 21,
    "name": "مصطفى عيدان هادي حسين",
    "seq": 1
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة التخطيط الاستراتيجي",
    "course_hours": 21,
    "name": "حسن وليد كاظم عبعوب",
    "seq": 2
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة التخطيط الاستراتيجي",
    "course_hours": 21,
    "name": "ماهر طعمة جابر محمد",
    "seq": 3
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة التخطيط الاستراتيجي",
    "course_hours": 21,
    "name": "حسين ثامر سعيد جابر",
    "seq": 4
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة التخطيط الاستراتيجي",
    "course_hours": 21,
    "name": "علي محمد حاتم شعلان",
    "seq": 5
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة التخطيط الاستراتيجي",
    "course_hours": 21,
    "name": "محمد سعود حمزة عباس",
    "seq": 6
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة التخطيط الاستراتيجي",
    "course_hours": 21,
    "name": "حيدر محسن علوان جاسم",
    "seq": 7
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة التخطيط الاستراتيجي",
    "course_hours": 21,
    "name": "محمد مؤيد كاظم عمران",
    "seq": 8
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة التخطيط الاستراتيجي",
    "course_hours": 21,
    "name": "عدي كتاب درب دعامة",
    "seq": 9
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة التخطيط الاستراتيجي",
    "course_hours": 21,
    "name": "حسين كريم عبد عمران حمزة",
    "seq": 10
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة التخطيط الاستراتيجي",
    "course_hours": 21,
    "name": "حسن مهدي حسن عزيز",
    "seq": 11
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة التخطيط الاستراتيجي",
    "course_hours": 21,
    "name": "حسن عبد صكر حسين المنصوري",
    "seq": 12
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة التخطيط الاستراتيجي",
    "course_hours": 21,
    "name": "علي عبد الحسين موزان",
    "seq": 13
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة التخطيط الاستراتيجي",
    "course_hours": 21,
    "name": "احمد هاتف محمد عبد علي",
    "seq": 14
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة أسس القيادة",
    "course_hours": 21,
    "name": "مصطفى عيدان هادي حسين",
    "seq": 1
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة أسس القيادة",
    "course_hours": 21,
    "name": "حسن وليد كاظم عبعوب",
    "seq": 2
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة أسس القيادة",
    "course_hours": 21,
    "name": "ماهر طعمة جابر محمد",
    "seq": 3
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة أسس القيادة",
    "course_hours": 21,
    "name": "حسين ثامر سعيد جابر",
    "seq": 4
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة أسس القيادة",
    "course_hours": 21,
    "name": "علي محمد حاتم شعلان",
    "seq": 5
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة أسس القيادة",
    "course_hours": 21,
    "name": "محمد سعود حمزة عباس",
    "seq": 6
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة أسس القيادة",
    "course_hours": 21,
    "name": "حيدر محسن علوان جاسم",
    "seq": 7
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة أسس القيادة",
    "course_hours": 21,
    "name": "محمد مؤيد كاظم عمران",
    "seq": 8
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة أسس القيادة",
    "course_hours": 21,
    "name": "عدي كتاب درب دعامة",
    "seq": 9
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة أسس القيادة",
    "course_hours": 21,
    "name": "حسين كريم عبد عمران حمزة",
    "seq": 10
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة أسس القيادة",
    "course_hours": 21,
    "name": "حسن مهدي حسن عزيز",
    "seq": 11
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة أسس القيادة",
    "course_hours": 21,
    "name": "حسن عبد صكر حسين المنصوري",
    "seq": 12
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة أسس القيادة",
    "course_hours": 21,
    "name": "علي عبد الحسين موزان",
    "seq": 13
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة أسس القيادة",
    "course_hours": 21,
    "name": "احمد هاتف محمد عبد علي",
    "seq": 14
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة القيادة الإشرافية",
    "course_hours": 40,
    "name": "مصطفى عيدان هادي حسين",
    "seq": 1
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة القيادة الإشرافية",
    "course_hours": 40,
    "name": "حسن وليد كاظم عبعوب",
    "seq": 2
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة القيادة الإشرافية",
    "course_hours": 40,
    "name": "ماهر طعمة جابر محمد",
    "seq": 3
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة القيادة الإشرافية",
    "course_hours": 40,
    "name": "حسين ثامر سعيد جابر",
    "seq": 4
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة القيادة الإشرافية",
    "course_hours": 40,
    "name": "علي محمد حاتم شعلان",
    "seq": 5
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة القيادة الإشرافية",
    "course_hours": 40,
    "name": "محمد سعود حمزة عباس",
    "seq": 6
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة القيادة الإشرافية",
    "course_hours": 40,
    "name": "حيدر محسن علوان جاسم",
    "seq": 7
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة القيادة الإشرافية",
    "course_hours": 40,
    "name": "محمد مؤيد كاظم عمران",
    "seq": 8
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة القيادة الإشرافية",
    "course_hours": 40,
    "name": "عدي كتاب درب دعامة",
    "seq": 9
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة القيادة الإشرافية",
    "course_hours": 40,
    "name": "حسين كريم عبد عمران حمزة",
    "seq": 10
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة القيادة الإشرافية",
    "course_hours": 40,
    "name": "حسن مهدي حسن عزيز",
    "seq": 11
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة القيادة الإشرافية",
    "course_hours": 40,
    "name": "حسن عبد صكر حسين المنصوري",
    "seq": 12
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة القيادة الإشرافية",
    "course_hours": 40,
    "name": "علي عبد الحسين موزان",
    "seq": 13
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة القيادة الإشرافية",
    "course_hours": 40,
    "name": "احمد هاتف محمد عبد علي",
    "seq": 14
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة الالتزام والانضباط",
    "course_hours": 10,
    "name": "مصطفى عيدان هادي حسين",
    "seq": 1
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة الالتزام والانضباط",
    "course_hours": 10,
    "name": "كاظم ابراهيم باقر حسن",
    "seq": 2
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة الالتزام والانضباط",
    "course_hours": 10,
    "name": "رضا علي هاني هادي",
    "seq": 3
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة الالتزام والانضباط",
    "course_hours": 10,
    "name": "علي حسين عبد ابراهيم احمد",
    "seq": 4
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة الالتزام والانضباط",
    "course_hours": 10,
    "name": "محمد عامر عبد الحسين راضي",
    "seq": 5
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة الالتزام والانضباط",
    "course_hours": 10,
    "name": "عبد الخالق كاظم مرزوق",
    "seq": 6
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة الالتزام والانضباط",
    "course_hours": 10,
    "name": "كرار سعد محمد علي",
    "seq": 7
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة الالتزام والانضباط",
    "course_hours": 10,
    "name": "مصطفى محمد صاحب عبد الحسين",
    "seq": 8
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة الالتزام والانضباط",
    "course_hours": 10,
    "name": "احمد كاظم عبد علي حمزة",
    "seq": 9
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة الالتزام والانضباط",
    "course_hours": 10,
    "name": "حسين اركان عبد الزهرة عبد الحسين",
    "seq": 10
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة الالتزام والانضباط",
    "course_hours": 10,
    "name": "امير عباس حمزة علوان",
    "seq": 11
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة الالتزام والانضباط",
    "course_hours": 10,
    "name": "حسين ثامر سعيد جابر",
    "seq": 12
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة الالتزام والانضباط",
    "course_hours": 10,
    "name": "محمد سعود حمزة عباس",
    "seq": 13
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة الالتزام والانضباط",
    "course_hours": 10,
    "name": "محمد مؤيد كاظم عمران",
    "seq": 14
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة الالتزام والانضباط",
    "course_hours": 10,
    "name": "مروان راشد ياسين حسين",
    "seq": 15
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة الالتزام والانضباط",
    "course_hours": 10,
    "name": "حسين جواد كاظم سلطان",
    "seq": 16
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة الالتزام والانضباط",
    "course_hours": 10,
    "name": "علي حيدر كاظم عباس",
    "seq": 17
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة الالتزام والانضباط",
    "course_hours": 10,
    "name": "محمد مهدي حسن فريد",
    "seq": 18
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة الالتزام والانضباط",
    "course_hours": 10,
    "name": "حسين كريم عبد عمران حمزة",
    "seq": 19
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة الالتزام والانضباط",
    "course_hours": 10,
    "name": "رشا حسن شاكر سعيد",
    "seq": 20
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة الالتزام والانضباط",
    "course_hours": 10,
    "name": "علي عبد الامير خلف عرط",
    "seq": 21
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة الالتزام والانضباط",
    "course_hours": 10,
    "name": "حسن مهدي حسن عزيز",
    "seq": 22
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة الالتزام والانضباط",
    "course_hours": 10,
    "name": "علاء هاشم كريم فجر",
    "seq": 23
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة الالتزام والانضباط",
    "course_hours": 10,
    "name": "علي رحيم عبود رشيد",
    "seq": 24
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة الالتزام والانضباط",
    "course_hours": 10,
    "name": "نشوان حسين علي عبد المرشدي",
    "seq": 25
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة الالتزام والانضباط",
    "course_hours": 10,
    "name": "ابا الفضل عباس مهدي عبود",
    "seq": 26
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة الالتزام والانضباط",
    "course_hours": 10,
    "name": "سجاد رحمن جمعة جابر",
    "seq": 27
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة الالتزام والانضباط",
    "course_hours": 10,
    "name": "علي سلطان قاسم لازم",
    "seq": 28
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة الالتزام والانضباط",
    "course_hours": 10,
    "name": "حسين محمد جاسم صحن",
    "seq": 29
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة الالتزام والانضباط",
    "course_hours": 10,
    "name": "براء احمد متعب عواد",
    "seq": 30
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة الالتزام والانضباط",
    "course_hours": 10,
    "name": "فاضل عبد العباس علي عباس",
    "seq": 31
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة الالتزام والانضباط",
    "course_hours": 10,
    "name": "قاسم عبد علي مزهر هزاء",
    "seq": 32
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة الالتزام والانضباط",
    "course_hours": 10,
    "name": "علاوي محمد جدي عبود",
    "seq": 33
  },
  {
    "domain": "دورات القيادة والإشراف",
    "course_name": "دورة الالتزام والانضباط",
    "course_hours": 10,
    "name": "حسن مهدي هاشم خلف",
    "seq": 34
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات الحماية الشخصية والمنشآت",
    "course_hours": 14,
    "name": "رضا علي هاني هادي",
    "seq": 1
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات الحماية الشخصية والمنشآت",
    "course_hours": 14,
    "name": "احمد كاظم عبد علي حمزة",
    "seq": 2
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات الحماية الشخصية والمنشآت",
    "course_hours": 14,
    "name": "وضاح فاروق خليل بارود",
    "seq": 3
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات الحماية الشخصية والمنشآت",
    "course_hours": 14,
    "name": "حسين اركان عبد الزهرة عبد الحسين",
    "seq": 4
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات الحماية الشخصية والمنشآت",
    "course_hours": 14,
    "name": "محمد مهدي حسن فريد",
    "seq": 5
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات الحماية الشخصية والمنشآت",
    "course_hours": 14,
    "name": "علي سلطان قاسم لازم",
    "seq": 6
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات الحماية الشخصية والمنشآت",
    "course_hours": 14,
    "name": "حسنين نعمة عجيل حسين",
    "seq": 7
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات الحماية الشخصية والمنشآت",
    "course_hours": 14,
    "name": "علي عبد الحسين موزان",
    "seq": 8
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات الحماية الشخصية والمنشآت",
    "course_hours": 14,
    "name": "حسين محمد جاسم صحن",
    "seq": 9
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات الحماية الشخصية والمنشآت",
    "course_hours": 14,
    "name": "براء احمد متعب عواد",
    "seq": 10
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات الحماية الشخصية والمنشآت",
    "course_hours": 14,
    "name": "فاضل عبد العباس علي عباس",
    "seq": 11
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات الحماية الشخصية والمنشآت",
    "course_hours": 14,
    "name": "علي عباس بريج حطاب",
    "seq": 12
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات الحماية الشخصية والمنشآت",
    "course_hours": 14,
    "name": "عبد علي سليمان عنبر",
    "seq": 13
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات الحماية الشخصية والمنشآت",
    "course_hours": 14,
    "name": "قاسم عبد علي مزهر هزاء",
    "seq": 14
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات الحماية الشخصية والمنشآت",
    "course_hours": 14,
    "name": "علاوي محمد جدي عبود",
    "seq": 15
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات الحماية الشخصية والمنشآت",
    "course_hours": 14,
    "name": "علي حسين علاوي راضي",
    "seq": 16
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات الحماية الشخصية والمنشآت",
    "course_hours": 14,
    "name": "احمد كاظم مجبل محمد",
    "seq": 17
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات الحماية الشخصية والمنشآت",
    "course_hours": 14,
    "name": "احمد هاتف محمد عبد علي",
    "seq": 18
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات الحماية الشخصية والمنشآت",
    "course_hours": 14,
    "name": "ابو الفضل عبد مسلم يلسين",
    "seq": 19
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات الحماية الشخصية والمنشآت",
    "course_hours": 14,
    "name": "محسن خوام مهدي عظب",
    "seq": 20
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات الحماية الشخصية والمنشآت",
    "course_hours": 14,
    "name": "حسن مهدي هاشم خلف",
    "seq": 21
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات الحماية الشخصية والمنشآت",
    "course_hours": 14,
    "name": "سليمان محمد كرحوت دريم",
    "seq": 22
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات الحماية الشخصية والمنشآت",
    "course_hours": 14,
    "name": "مزهر خوام نصيف جاسم",
    "seq": 23
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات الحماية الشخصية والمنشآت",
    "course_hours": 14,
    "name": "محمود ابراهيم جاسم محيميد",
    "seq": 24
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات الحماية الشخصية والمنشآت",
    "course_hours": 14,
    "name": "حيدر عبد الله رزوقي علي",
    "seq": 25
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات الحماية الشخصية والمنشآت",
    "course_hours": 14,
    "name": "محمود شاكر عويد بيروت",
    "seq": 26
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة ضمان أمن المبنى",
    "course_hours": 14,
    "name": "رضا علي هاني هادي",
    "seq": 1
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة ضمان أمن المبنى",
    "course_hours": 14,
    "name": "احمد كاظم عبد علي حمزة",
    "seq": 2
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة ضمان أمن المبنى",
    "course_hours": 14,
    "name": "وضاح فاروق خليل بارود",
    "seq": 3
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة ضمان أمن المبنى",
    "course_hours": 14,
    "name": "حسين اركان عبد الزهرة عبد الحسين",
    "seq": 4
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة ضمان أمن المبنى",
    "course_hours": 14,
    "name": "محمد مهدي حسن فريد",
    "seq": 5
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة ضمان أمن المبنى",
    "course_hours": 14,
    "name": "علي سلطان قاسم لازم",
    "seq": 6
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة ضمان أمن المبنى",
    "course_hours": 14,
    "name": "حسنين نعمة عجيل حسين",
    "seq": 7
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة ضمان أمن المبنى",
    "course_hours": 14,
    "name": "علي عبد الحسين موزان",
    "seq": 8
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة ضمان أمن المبنى",
    "course_hours": 14,
    "name": "حسين محمد جاسم صحن",
    "seq": 9
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة ضمان أمن المبنى",
    "course_hours": 14,
    "name": "براء احمد متعب عواد",
    "seq": 10
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة ضمان أمن المبنى",
    "course_hours": 14,
    "name": "فاضل عبد العباس علي عباس",
    "seq": 11
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة ضمان أمن المبنى",
    "course_hours": 14,
    "name": "علي عباس بريج حطاب",
    "seq": 12
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة ضمان أمن المبنى",
    "course_hours": 14,
    "name": "عبد علي سليمان عنبر",
    "seq": 13
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة ضمان أمن المبنى",
    "course_hours": 14,
    "name": "قاسم عبد علي مزهر هزاء",
    "seq": 14
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة ضمان أمن المبنى",
    "course_hours": 14,
    "name": "علاوي محمد جدي عبود",
    "seq": 15
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة ضمان أمن المبنى",
    "course_hours": 14,
    "name": "علي حسين علاوي راضي",
    "seq": 16
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة ضمان أمن المبنى",
    "course_hours": 14,
    "name": "احمد كاظم مجبل محمد",
    "seq": 17
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة ضمان أمن المبنى",
    "course_hours": 14,
    "name": "احمد هاتف محمد عبد علي",
    "seq": 18
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة ضمان أمن المبنى",
    "course_hours": 14,
    "name": "ابو الفضل عبد مسلم يلسين",
    "seq": 19
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة ضمان أمن المبنى",
    "course_hours": 14,
    "name": "محسن خوام مهدي عظب",
    "seq": 20
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة ضمان أمن المبنى",
    "course_hours": 14,
    "name": "حسن مهدي هاشم خلف",
    "seq": 21
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة ضمان أمن المبنى",
    "course_hours": 14,
    "name": "سليمان محمد كرحوت دريم",
    "seq": 22
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة ضمان أمن المبنى",
    "course_hours": 14,
    "name": "مزهر خوام نصيف جاسم",
    "seq": 23
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة ضمان أمن المبنى",
    "course_hours": 14,
    "name": "محمود ابراهيم جاسم محيميد",
    "seq": 24
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة ضمان أمن المبنى",
    "course_hours": 14,
    "name": "حيدر عبد الله رزوقي علي",
    "seq": 25
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة ضمان أمن المبنى",
    "course_hours": 14,
    "name": "محمود شاكر عويد بيروت",
    "seq": 26
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات التعامل مع المخاطر والتهديدات",
    "course_hours": 14,
    "name": "رضا علي هاني هادي",
    "seq": 1
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات التعامل مع المخاطر والتهديدات",
    "course_hours": 14,
    "name": "احمد كاظم عبد علي حمزة",
    "seq": 2
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات التعامل مع المخاطر والتهديدات",
    "course_hours": 14,
    "name": "وضاح فاروق خليل بارود",
    "seq": 3
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات التعامل مع المخاطر والتهديدات",
    "course_hours": 14,
    "name": "حسين اركان عبد الزهرة عبد الحسين",
    "seq": 4
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات التعامل مع المخاطر والتهديدات",
    "course_hours": 14,
    "name": "محمد مهدي حسن فريد",
    "seq": 5
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات التعامل مع المخاطر والتهديدات",
    "course_hours": 14,
    "name": "علي سلطان قاسم لازم",
    "seq": 6
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات التعامل مع المخاطر والتهديدات",
    "course_hours": 14,
    "name": "حسنين نعمة عجيل حسين",
    "seq": 7
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات التعامل مع المخاطر والتهديدات",
    "course_hours": 14,
    "name": "علي عبد الحسين موزان",
    "seq": 8
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات التعامل مع المخاطر والتهديدات",
    "course_hours": 14,
    "name": "حسين محمد جاسم صحن",
    "seq": 9
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات التعامل مع المخاطر والتهديدات",
    "course_hours": 14,
    "name": "براء احمد متعب عواد",
    "seq": 10
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات التعامل مع المخاطر والتهديدات",
    "course_hours": 14,
    "name": "فاضل عبد العباس علي عباس",
    "seq": 11
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات التعامل مع المخاطر والتهديدات",
    "course_hours": 14,
    "name": "علي عباس بريج حطاب",
    "seq": 12
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات التعامل مع المخاطر والتهديدات",
    "course_hours": 14,
    "name": "عبد علي سليمان عنبر",
    "seq": 13
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات التعامل مع المخاطر والتهديدات",
    "course_hours": 14,
    "name": "قاسم عبد علي مزهر هزاء",
    "seq": 14
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات التعامل مع المخاطر والتهديدات",
    "course_hours": 14,
    "name": "علاوي محمد جدي عبود",
    "seq": 15
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات التعامل مع المخاطر والتهديدات",
    "course_hours": 14,
    "name": "علي حسين علاوي راضي",
    "seq": 16
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات التعامل مع المخاطر والتهديدات",
    "course_hours": 14,
    "name": "احمد كاظم مجبل محمد",
    "seq": 17
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات التعامل مع المخاطر والتهديدات",
    "course_hours": 14,
    "name": "احمد هاتف محمد عبد علي",
    "seq": 18
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات التعامل مع المخاطر والتهديدات",
    "course_hours": 14,
    "name": "ابو الفضل عبد مسلم يلسين",
    "seq": 19
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات التعامل مع المخاطر والتهديدات",
    "course_hours": 14,
    "name": "محسن خوام مهدي عظب",
    "seq": 20
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات التعامل مع المخاطر والتهديدات",
    "course_hours": 14,
    "name": "حسن مهدي هاشم خلف",
    "seq": 21
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات التعامل مع المخاطر والتهديدات",
    "course_hours": 14,
    "name": "سليمان محمد كرحوت دريم",
    "seq": 22
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات التعامل مع المخاطر والتهديدات",
    "course_hours": 14,
    "name": "مزهر خوام نصيف جاسم",
    "seq": 23
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات التعامل مع المخاطر والتهديدات",
    "course_hours": 14,
    "name": "محمود ابراهيم جاسم محيميد",
    "seq": 24
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات التعامل مع المخاطر والتهديدات",
    "course_hours": 14,
    "name": "حيدر عبد الله رزوقي علي",
    "seq": 25
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة مهارات التعامل مع المخاطر والتهديدات",
    "course_hours": 14,
    "name": "محمود شاكر عويد بيروت",
    "seq": 26
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة إدارة الأزمات",
    "course_hours": 14,
    "name": "رضا علي هاني هادي",
    "seq": 1
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة إدارة الأزمات",
    "course_hours": 14,
    "name": "احمد كاظم عبد علي حمزة",
    "seq": 2
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة إدارة الأزمات",
    "course_hours": 14,
    "name": "وضاح فاروق خليل بارود",
    "seq": 3
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة إدارة الأزمات",
    "course_hours": 14,
    "name": "حسين اركان عبد الزهرة عبد الحسين",
    "seq": 4
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة إدارة الأزمات",
    "course_hours": 14,
    "name": "محمد مهدي حسن فريد",
    "seq": 5
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة إدارة الأزمات",
    "course_hours": 14,
    "name": "علي سلطان قاسم لازم",
    "seq": 6
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة إدارة الأزمات",
    "course_hours": 14,
    "name": "حسنين نعمة عجيل حسين",
    "seq": 7
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة إدارة الأزمات",
    "course_hours": 14,
    "name": "علي عبد الحسين موزان",
    "seq": 8
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة إدارة الأزمات",
    "course_hours": 14,
    "name": "حسين محمد جاسم صحن",
    "seq": 9
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة إدارة الأزمات",
    "course_hours": 14,
    "name": "براء احمد متعب عواد",
    "seq": 10
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة إدارة الأزمات",
    "course_hours": 14,
    "name": "فاضل عبد العباس علي عباس",
    "seq": 11
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة إدارة الأزمات",
    "course_hours": 14,
    "name": "علي عباس بريج حطاب",
    "seq": 12
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة إدارة الأزمات",
    "course_hours": 14,
    "name": "عبد علي سليمان عنبر",
    "seq": 13
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة إدارة الأزمات",
    "course_hours": 14,
    "name": "قاسم عبد علي مزهر هزاء",
    "seq": 14
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة إدارة الأزمات",
    "course_hours": 14,
    "name": "علاوي محمد جدي عبود",
    "seq": 15
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة إدارة الأزمات",
    "course_hours": 14,
    "name": "علي حسين علاوي راضي",
    "seq": 16
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة إدارة الأزمات",
    "course_hours": 14,
    "name": "احمد كاظم مجبل محمد",
    "seq": 17
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة إدارة الأزمات",
    "course_hours": 14,
    "name": "احمد هاتف محمد عبد علي",
    "seq": 18
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة إدارة الأزمات",
    "course_hours": 14,
    "name": "ابو الفضل عبد مسلم يلسين",
    "seq": 19
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة إدارة الأزمات",
    "course_hours": 14,
    "name": "محسن خوام مهدي عظب",
    "seq": 20
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة إدارة الأزمات",
    "course_hours": 14,
    "name": "حسن مهدي هاشم خلف",
    "seq": 21
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة إدارة الأزمات",
    "course_hours": 14,
    "name": "سليمان محمد كرحوت دريم",
    "seq": 22
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة إدارة الأزمات",
    "course_hours": 14,
    "name": "مزهر خوام نصيف جاسم",
    "seq": 23
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة إدارة الأزمات",
    "course_hours": 14,
    "name": "محمود ابراهيم جاسم محيميد",
    "seq": 24
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة إدارة الأزمات",
    "course_hours": 14,
    "name": "حيدر عبد الله رزوقي علي",
    "seq": 25
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة إدارة الأزمات",
    "course_hours": 14,
    "name": "محمود شاكر عويد بيروت",
    "seq": 26
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة الحماية السرية",
    "course_hours": 6,
    "name": "رضا علي هاني هادي",
    "seq": 1
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة الحماية السرية",
    "course_hours": 6,
    "name": "احمد كاظم عبد علي حمزة",
    "seq": 2
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة الحماية السرية",
    "course_hours": 6,
    "name": "وضاح فاروق خليل بارود",
    "seq": 3
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة الحماية السرية",
    "course_hours": 6,
    "name": "حسين اركان عبد الزهرة عبد الحسين",
    "seq": 4
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة الحماية السرية",
    "course_hours": 6,
    "name": "محمد مهدي حسن فريد",
    "seq": 5
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة الحماية السرية",
    "course_hours": 6,
    "name": "علي سلطان قاسم لازم",
    "seq": 6
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة الحماية السرية",
    "course_hours": 6,
    "name": "حسنين نعمة عجيل حسين",
    "seq": 7
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة الحماية السرية",
    "course_hours": 6,
    "name": "علي عبد الحسين موزان",
    "seq": 8
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة الحماية السرية",
    "course_hours": 6,
    "name": "حسين محمد جاسم صحن",
    "seq": 9
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة الحماية السرية",
    "course_hours": 6,
    "name": "براء احمد متعب عواد",
    "seq": 10
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة الحماية السرية",
    "course_hours": 6,
    "name": "فاضل عبد العباس علي عباس",
    "seq": 11
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة الحماية السرية",
    "course_hours": 6,
    "name": "علي عباس بريج حطاب",
    "seq": 12
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة الحماية السرية",
    "course_hours": 6,
    "name": "عبد علي سليمان عنبر",
    "seq": 13
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة الحماية السرية",
    "course_hours": 6,
    "name": "قاسم عبد علي مزهر هزاء",
    "seq": 14
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة الحماية السرية",
    "course_hours": 6,
    "name": "علاوي محمد جدي عبود",
    "seq": 15
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة الحماية السرية",
    "course_hours": 6,
    "name": "علي حسين علاوي راضي",
    "seq": 16
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة الحماية السرية",
    "course_hours": 6,
    "name": "احمد كاظم مجبل محمد",
    "seq": 17
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة الحماية السرية",
    "course_hours": 6,
    "name": "احمد هاتف محمد عبد علي",
    "seq": 18
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة الحماية السرية",
    "course_hours": 6,
    "name": "ابو الفضل عبد مسلم يلسين",
    "seq": 19
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة الحماية السرية",
    "course_hours": 6,
    "name": "محسن خوام مهدي عظب",
    "seq": 20
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة الحماية السرية",
    "course_hours": 6,
    "name": "حسن مهدي هاشم خلف",
    "seq": 21
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة الحماية السرية",
    "course_hours": 6,
    "name": "سليمان محمد كرحوت دريم",
    "seq": 22
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة الحماية السرية",
    "course_hours": 6,
    "name": "مزهر خوام نصيف جاسم",
    "seq": 23
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة الحماية السرية",
    "course_hours": 6,
    "name": "محمود ابراهيم جاسم محيميد",
    "seq": 24
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة الحماية السرية",
    "course_hours": 6,
    "name": "حيدر عبد الله رزوقي علي",
    "seq": 25
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة الحماية السرية",
    "course_hours": 6,
    "name": "محمود شاكر عويد بيروت",
    "seq": 26
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة التعامل مع المظاهرات",
    "course_hours": 6,
    "name": "رضا علي هاني هادي",
    "seq": 1
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة التعامل مع المظاهرات",
    "course_hours": 6,
    "name": "احمد كاظم عبد علي حمزة",
    "seq": 2
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة التعامل مع المظاهرات",
    "course_hours": 6,
    "name": "وضاح فاروق خليل بارود",
    "seq": 3
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة التعامل مع المظاهرات",
    "course_hours": 6,
    "name": "حسين اركان عبد الزهرة عبد الحسين",
    "seq": 4
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة التعامل مع المظاهرات",
    "course_hours": 6,
    "name": "محمد مهدي حسن فريد",
    "seq": 5
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة التعامل مع المظاهرات",
    "course_hours": 6,
    "name": "علي سلطان قاسم لازم",
    "seq": 6
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة التعامل مع المظاهرات",
    "course_hours": 6,
    "name": "حسنين نعمة عجيل حسين",
    "seq": 7
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة التعامل مع المظاهرات",
    "course_hours": 6,
    "name": "علي عبد الحسين موزان",
    "seq": 8
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة التعامل مع المظاهرات",
    "course_hours": 6,
    "name": "حسين محمد جاسم صحن",
    "seq": 9
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة التعامل مع المظاهرات",
    "course_hours": 6,
    "name": "براء احمد متعب عواد",
    "seq": 10
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة التعامل مع المظاهرات",
    "course_hours": 6,
    "name": "فاضل عبد العباس علي عباس",
    "seq": 11
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة التعامل مع المظاهرات",
    "course_hours": 6,
    "name": "علي عباس بريج حطاب",
    "seq": 12
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة التعامل مع المظاهرات",
    "course_hours": 6,
    "name": "عبد علي سليمان عنبر",
    "seq": 13
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة التعامل مع المظاهرات",
    "course_hours": 6,
    "name": "قاسم عبد علي مزهر هزاء",
    "seq": 14
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة التعامل مع المظاهرات",
    "course_hours": 6,
    "name": "علاوي محمد جدي عبود",
    "seq": 15
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة التعامل مع المظاهرات",
    "course_hours": 6,
    "name": "علي حسين علاوي راضي",
    "seq": 16
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة التعامل مع المظاهرات",
    "course_hours": 6,
    "name": "احمد كاظم مجبل محمد",
    "seq": 17
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة التعامل مع المظاهرات",
    "course_hours": 6,
    "name": "احمد هاتف محمد عبد علي",
    "seq": 18
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة التعامل مع المظاهرات",
    "course_hours": 6,
    "name": "ابو الفضل عبد مسلم يلسين",
    "seq": 19
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة التعامل مع المظاهرات",
    "course_hours": 6,
    "name": "محسن خوام مهدي عظب",
    "seq": 20
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة التعامل مع المظاهرات",
    "course_hours": 6,
    "name": "حسن مهدي هاشم خلف",
    "seq": 21
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة التعامل مع المظاهرات",
    "course_hours": 6,
    "name": "سليمان محمد كرحوت دريم",
    "seq": 22
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة التعامل مع المظاهرات",
    "course_hours": 6,
    "name": "مزهر خوام نصيف جاسم",
    "seq": 23
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة التعامل مع المظاهرات",
    "course_hours": 6,
    "name": "محمود ابراهيم جاسم محيميد",
    "seq": 24
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة التعامل مع المظاهرات",
    "course_hours": 6,
    "name": "حيدر عبد الله رزوقي علي",
    "seq": 25
  },
  {
    "domain": "الدورات الأمنية والوقائية",
    "course_name": "دورة التعامل مع المظاهرات",
    "course_hours": 6,
    "name": "محمود شاكر عويد بيروت",
    "seq": 26
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة السلامة المهنية",
    "course_hours": 6,
    "name": "رضا علي هاني هادي",
    "seq": 1
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة السلامة المهنية",
    "course_hours": 6,
    "name": "احمد كاظم عبد علي حمزة",
    "seq": 2
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة السلامة المهنية",
    "course_hours": 6,
    "name": "وضاح فاروق خليل بارود",
    "seq": 3
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة السلامة المهنية",
    "course_hours": 6,
    "name": "حسين اركان عبد الزهرة عبد الحسين",
    "seq": 4
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة السلامة المهنية",
    "course_hours": 6,
    "name": "محمد مهدي حسن فريد",
    "seq": 5
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة السلامة المهنية",
    "course_hours": 6,
    "name": "علي سلطان قاسم لازم",
    "seq": 6
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة السلامة المهنية",
    "course_hours": 6,
    "name": "حسنين نعمة عجيل حسين",
    "seq": 7
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة السلامة المهنية",
    "course_hours": 6,
    "name": "علي عبد الحسين موزان",
    "seq": 8
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة السلامة المهنية",
    "course_hours": 6,
    "name": "حسين محمد جاسم صحن",
    "seq": 9
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة السلامة المهنية",
    "course_hours": 6,
    "name": "براء احمد متعب عواد",
    "seq": 10
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة السلامة المهنية",
    "course_hours": 6,
    "name": "فاضل عبد العباس علي عباس",
    "seq": 11
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة السلامة المهنية",
    "course_hours": 6,
    "name": "علي عباس بريج حطاب",
    "seq": 12
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة السلامة المهنية",
    "course_hours": 6,
    "name": "عبد علي سليمان عنبر",
    "seq": 13
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة السلامة المهنية",
    "course_hours": 6,
    "name": "قاسم عبد علي مزهر هزاء",
    "seq": 14
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة السلامة المهنية",
    "course_hours": 6,
    "name": "علاوي محمد جدي عبود",
    "seq": 15
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة السلامة المهنية",
    "course_hours": 6,
    "name": "علي حسين علاوي راضي",
    "seq": 16
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة السلامة المهنية",
    "course_hours": 6,
    "name": "احمد كاظم مجبل محمد",
    "seq": 17
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة السلامة المهنية",
    "course_hours": 6,
    "name": "احمد هاتف محمد عبد علي",
    "seq": 18
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة السلامة المهنية",
    "course_hours": 6,
    "name": "ابو الفضل عبد مسلم يلسين",
    "seq": 19
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة السلامة المهنية",
    "course_hours": 6,
    "name": "محسن خوام مهدي عظب",
    "seq": 20
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة السلامة المهنية",
    "course_hours": 6,
    "name": "حسن مهدي هاشم خلف",
    "seq": 21
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة السلامة المهنية",
    "course_hours": 6,
    "name": "سليمان محمد كرحوت دريم",
    "seq": 22
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة السلامة المهنية",
    "course_hours": 6,
    "name": "مزهر خوام نصيف جاسم",
    "seq": 23
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة السلامة المهنية",
    "course_hours": 6,
    "name": "محمود ابراهيم جاسم محيميد",
    "seq": 24
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة السلامة المهنية",
    "course_hours": 6,
    "name": "حيدر عبد الله رزوقي علي",
    "seq": 25
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة السلامة المهنية",
    "course_hours": 6,
    "name": "محمود شاكر عويد بيروت",
    "seq": 26
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة السلامة المهنية",
    "course_hours": 6,
    "name": "خلود مدحت محمود جبار",
    "seq": 27
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة السلامة المهنية",
    "course_hours": 6,
    "name": "محمد عبد زيد عبد السادة",
    "seq": 28
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة السلامة المهنية",
    "course_hours": 6,
    "name": "عناد دليمي محمد برهي",
    "seq": 29
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة السلامة المهنية",
    "course_hours": 6,
    "name": "نشوان حسين علي عبد المرشدي",
    "seq": 30
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة السلامة المهنية",
    "course_hours": 6,
    "name": "عقيل كاظم مراد كاظم",
    "seq": 31
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة السلامة المهنية",
    "course_hours": 6,
    "name": "علي طعمة جابر",
    "seq": 32
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة السلامة المهنية",
    "course_hours": 6,
    "name": "ابا الفضل عباس مهدي عبود",
    "seq": 33
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة السلامة المهنية",
    "course_hours": 6,
    "name": "احمد حسين عبد الحمزة احمد",
    "seq": 34
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة السلامة المهنية",
    "course_hours": 6,
    "name": "علي حسين كزار راهي",
    "seq": 35
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة السلامة المهنية",
    "course_hours": 6,
    "name": "سجاد رحمن جمعة جابر",
    "seq": 36
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة السلامة المهنية",
    "course_hours": 6,
    "name": "عبد الحسن شعلان ساهي مشهد",
    "seq": 37
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة الإسعافات الأولية",
    "course_hours": 6,
    "name": "رضا علي هاني هادي",
    "seq": 1
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة الإسعافات الأولية",
    "course_hours": 6,
    "name": "احمد كاظم عبد علي حمزة",
    "seq": 2
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة الإسعافات الأولية",
    "course_hours": 6,
    "name": "وضاح فاروق خليل بارود",
    "seq": 3
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة الإسعافات الأولية",
    "course_hours": 6,
    "name": "حسين اركان عبد الزهرة عبد الحسين",
    "seq": 4
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة الإسعافات الأولية",
    "course_hours": 6,
    "name": "محمد مهدي حسن فريد",
    "seq": 5
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة الإسعافات الأولية",
    "course_hours": 6,
    "name": "علي سلطان قاسم لازم",
    "seq": 6
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة الإسعافات الأولية",
    "course_hours": 6,
    "name": "حسنين نعمة عجيل حسين",
    "seq": 7
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة الإسعافات الأولية",
    "course_hours": 6,
    "name": "علي عبد الحسين موزان",
    "seq": 8
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة الإسعافات الأولية",
    "course_hours": 6,
    "name": "حسين محمد جاسم صحن",
    "seq": 9
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة الإسعافات الأولية",
    "course_hours": 6,
    "name": "براء احمد متعب عواد",
    "seq": 10
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة الإسعافات الأولية",
    "course_hours": 6,
    "name": "فاضل عبد العباس علي عباس",
    "seq": 11
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة الإسعافات الأولية",
    "course_hours": 6,
    "name": "علي عباس بريج حطاب",
    "seq": 12
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة الإسعافات الأولية",
    "course_hours": 6,
    "name": "عبد علي سليمان عنبر",
    "seq": 13
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة الإسعافات الأولية",
    "course_hours": 6,
    "name": "قاسم عبد علي مزهر هزاء",
    "seq": 14
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة الإسعافات الأولية",
    "course_hours": 6,
    "name": "علاوي محمد جدي عبود",
    "seq": 15
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة الإسعافات الأولية",
    "course_hours": 6,
    "name": "علي حسين علاوي راضي",
    "seq": 16
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة الإسعافات الأولية",
    "course_hours": 6,
    "name": "احمد كاظم مجبل محمد",
    "seq": 17
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة الإسعافات الأولية",
    "course_hours": 6,
    "name": "احمد هاتف محمد عبد علي",
    "seq": 18
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة الإسعافات الأولية",
    "course_hours": 6,
    "name": "ابو الفضل عبد مسلم يلسين",
    "seq": 19
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة الإسعافات الأولية",
    "course_hours": 6,
    "name": "محسن خوام مهدي عظب",
    "seq": 20
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة الإسعافات الأولية",
    "course_hours": 6,
    "name": "حسن مهدي هاشم خلف",
    "seq": 21
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة الإسعافات الأولية",
    "course_hours": 6,
    "name": "سليمان محمد كرحوت دريم",
    "seq": 22
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة الإسعافات الأولية",
    "course_hours": 6,
    "name": "مزهر خوام نصيف جاسم",
    "seq": 23
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة الإسعافات الأولية",
    "course_hours": 6,
    "name": "محمود ابراهيم جاسم محيميد",
    "seq": 24
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة الإسعافات الأولية",
    "course_hours": 6,
    "name": "حيدر عبد الله رزوقي علي",
    "seq": 25
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة الإسعافات الأولية",
    "course_hours": 6,
    "name": "محمود شاكر عويد بيروت",
    "seq": 26
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة الإسعافات الأولية",
    "course_hours": 6,
    "name": "خلود مدحت محمود جبار",
    "seq": 27
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة الإسعافات الأولية",
    "course_hours": 6,
    "name": "محمد عبد زيد عبد السادة",
    "seq": 28
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة الإسعافات الأولية",
    "course_hours": 6,
    "name": "عناد دليمي محمد برهي",
    "seq": 29
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة الإسعافات الأولية",
    "course_hours": 6,
    "name": "نشوان حسين علي عبد المرشدي",
    "seq": 30
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة الإسعافات الأولية",
    "course_hours": 6,
    "name": "عقيل كاظم مراد كاظم",
    "seq": 31
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة الإسعافات الأولية",
    "course_hours": 6,
    "name": "علي طعمة جابر",
    "seq": 32
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة الإسعافات الأولية",
    "course_hours": 6,
    "name": "ابا الفضل عباس مهدي عبود",
    "seq": 33
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة الإسعافات الأولية",
    "course_hours": 6,
    "name": "احمد حسين عبد الحمزة احمد",
    "seq": 34
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة الإسعافات الأولية",
    "course_hours": 6,
    "name": "علي حسين كزار راهي",
    "seq": 35
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة الإسعافات الأولية",
    "course_hours": 6,
    "name": "سجاد رحمن جمعة جابر",
    "seq": 36
  },
  {
    "domain": "دورات الصحة والسلامة",
    "course_name": "دورة الإسعافات الأولية",
    "course_hours": 6,
    "name": "عبد الحسن شعلان ساهي مشهد",
    "seq": 37
  },
  {
    "domain": "الدورات اللوجستية",
    "course_name": "دورة السيطرة المخزنية",
    "course_hours": 14,
    "name": "محمد مهدي حسن فريد",
    "seq": 1
  },
  {
    "domain": "الدورات اللوجستية",
    "course_name": "دورة السيطرة المخزنية",
    "course_hours": 14,
    "name": "خلود مدحت محمود جبار",
    "seq": 2
  },
  {
    "domain": "الدورات اللوجستية",
    "course_name": "دورة السيطرة المخزنية",
    "course_hours": 14,
    "name": "محمد عبد زيد عبد السادة",
    "seq": 3
  },
  {
    "domain": "الدورات اللوجستية",
    "course_name": "دورة السيطرة المخزنية",
    "course_hours": 14,
    "name": "عناد دليمي محمد برهي",
    "seq": 4
  },
  {
    "domain": "الدورات اللوجستية",
    "course_name": "دورة السيطرة المخزنية",
    "course_hours": 14,
    "name": "نشوان حسين علي عبد المرشدي",
    "seq": 5
  },
  {
    "domain": "الدورات اللوجستية",
    "course_name": "دورة السيطرة المخزنية",
    "course_hours": 14,
    "name": "عقيل كاظم مراد كاظم",
    "seq": 6
  },
  {
    "domain": "الدورات اللوجستية",
    "course_name": "دورة السيطرة المخزنية",
    "course_hours": 14,
    "name": "علي طعمة جابر",
    "seq": 7
  },
  {
    "domain": "الدورات اللوجستية",
    "course_name": "دورة السيطرة المخزنية",
    "course_hours": 14,
    "name": "ابا الفضل عباس مهدي عبود",
    "seq": 8
  },
  {
    "domain": "الدورات اللوجستية",
    "course_name": "دورة السيطرة المخزنية",
    "course_hours": 14,
    "name": "احمد حسين عبد الحمزة احمد",
    "seq": 9
  },
  {
    "domain": "الدورات اللوجستية",
    "course_name": "دورة السيطرة المخزنية",
    "course_hours": 14,
    "name": "علي حسين كزار راهي",
    "seq": 10
  },
  {
    "domain": "الدورات اللوجستية",
    "course_name": "دورة السيطرة المخزنية",
    "course_hours": 14,
    "name": "سجاد رحمن جمعة جابر",
    "seq": 11
  },
  {
    "domain": "الدورات اللوجستية",
    "course_name": "دورة السيطرة المخزنية",
    "course_hours": 14,
    "name": "عبد الحسن شعلان ساهي مشهد",
    "seq": 12
  },
  {
    "domain": "الدورات اللوجستية",
    "course_name": "دورة إدارة وصيانة الآليات والمركبات",
    "course_hours": 14,
    "name": "محمد عبد زيد عبد السادة",
    "seq": 1
  },
  {
    "domain": "الدورات اللوجستية",
    "course_name": "دورة إدارة وصيانة الآليات والمركبات",
    "course_hours": 14,
    "name": "عناد دليمي محمد برهي",
    "seq": 2
  },
  {
    "domain": "الدورات اللوجستية",
    "course_name": "دورة إدارة وصيانة الآليات والمركبات",
    "course_hours": 14,
    "name": "ابا الفضل عباس مهدي عبود",
    "seq": 3
  },
  {
    "domain": "الدورات اللوجستية",
    "course_name": "دورة الإشراف على المشاريع الهندسية والبنى التحتية",
    "course_hours": 6,
    "name": "حسن وليد كاظم عبعوب",
    "seq": 1
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "ماهر طعمة جابر محمد",
    "seq": 1
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "علي محمد حاتم شعلان",
    "seq": 2
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "محمد سعود حمزة عباس",
    "seq": 3
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "حيدر محسن علوان جاسم",
    "seq": 4
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "محمد عبد زيد عبد السادة",
    "seq": 5
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "عناد دليمي محمد برهي",
    "seq": 6
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "ابا الفضل عباس مهدي عبود",
    "seq": 7
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "حسن وليد كاظم عبعوب",
    "seq": 8
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "احمد جاسم ابو الشون كاظم",
    "seq": 9
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "عبد الخالق كاظم مرزوق",
    "seq": 10
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "كرار سعد محمد علي",
    "seq": 11
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "مصطفى محمد صاحب عبد الحسين",
    "seq": 12
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "احمد كاظم عبد علي حمزة",
    "seq": 13
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "وضاح فاروق خليل بارود",
    "seq": 14
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "حسين اركان عبد الزهرة عبد الحسين",
    "seq": 15
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "امير عباس حمزة علوان",
    "seq": 16
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "حسين ثامر سعيد جابر",
    "seq": 17
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "محمد مهدي حسن فريد",
    "seq": 18
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "رشا حسن شاكر سعيد",
    "seq": 19
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "علي عبد الامير خلف عرط",
    "seq": 20
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "حسن مهدي حسن عزيز",
    "seq": 21
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "علاء هاشم كريم فجر",
    "seq": 22
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "حسن عبد صكر حسين المنصوري",
    "seq": 23
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "علي رحيم عبود رشيد",
    "seq": 24
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "خلود مدحت محمود جبار",
    "seq": 25
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "نشوان حسين علي عبد المرشدي",
    "seq": 26
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "عقيل كاظم مراد كاظم",
    "seq": 27
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "علي سلطان قاسم لازم",
    "seq": 28
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "حسنين نعمة عجيل حسين",
    "seq": 29
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "حسين محمد جاسم صحن",
    "seq": 30
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "براء احمد متعب عواد",
    "seq": 31
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "فاضل عبد العباس علي عباس",
    "seq": 32
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "علي عباس بريج حطاب",
    "seq": 33
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "عبد علي سليمان عنبر",
    "seq": 34
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "قاسم عبد علي مزهر هزاء",
    "seq": 35
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "علاوي محمد جدي عبود",
    "seq": 36
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "علي حسين علاوي راضي",
    "seq": 37
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "احمد كاظم مجبل محمد",
    "seq": 38
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "ابو الفضل عبد مسلم يلسين",
    "seq": 39
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "محسن خوام مهدي عظب",
    "seq": 40
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "حسن مهدي هاشم خلف",
    "seq": 41
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "سليمان محمد كرحوت دريم",
    "seq": 42
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "مزهر خوام نصيف جاسم",
    "seq": 43
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العمل التطوعي",
    "course_hours": 15,
    "name": "محمود ابراهيم جاسم محيميد",
    "seq": 44
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة التشوه الإعلامي",
    "course_hours": 6,
    "name": "محمد مؤيد كاظم عمران",
    "seq": 1
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة التشوه الإعلامي",
    "course_hours": 6,
    "name": "مروان راشد ياسين حسين",
    "seq": 2
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة التشوه الإعلامي",
    "course_hours": 6,
    "name": "حسين جواد كاظم سلطان",
    "seq": 3
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة التشوه الإعلامي",
    "course_hours": 6,
    "name": "عدي كتاب درب دعامة",
    "seq": 4
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة الولاء المؤسسي",
    "course_hours": 6,
    "name": "مصطفى عيدان هادي حسين",
    "seq": 1
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة الولاء المؤسسي",
    "course_hours": 6,
    "name": "كاظم ابراهيم باقر حسن",
    "seq": 2
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة الولاء المؤسسي",
    "course_hours": 6,
    "name": "رضا علي هاني هادي",
    "seq": 3
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة الولاء المؤسسي",
    "course_hours": 6,
    "name": "علي حسين عبد ابراهيم احمد",
    "seq": 4
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة الولاء المؤسسي",
    "course_hours": 6,
    "name": "محمد عامر عبد الحسين راضي",
    "seq": 5
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة الولاء المؤسسي",
    "course_hours": 6,
    "name": "عبد الخالق كاظم مرزوق",
    "seq": 6
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة الولاء المؤسسي",
    "course_hours": 6,
    "name": "كرار سعد محمد علي",
    "seq": 7
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة الولاء المؤسسي",
    "course_hours": 6,
    "name": "مصطفى محمد صاحب عبد الحسين",
    "seq": 8
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة الولاء المؤسسي",
    "course_hours": 6,
    "name": "احمد كاظم عبد علي حمزة",
    "seq": 9
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة الولاء المؤسسي",
    "course_hours": 6,
    "name": "حسين اركان عبد الزهرة عبد الحسين",
    "seq": 10
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة الولاء المؤسسي",
    "course_hours": 6,
    "name": "امير عباس حمزة علوان",
    "seq": 11
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة الولاء المؤسسي",
    "course_hours": 6,
    "name": "حسين ثامر سعيد جابر",
    "seq": 12
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة الولاء المؤسسي",
    "course_hours": 6,
    "name": "محمد سعود حمزة عباس",
    "seq": 13
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة الولاء المؤسسي",
    "course_hours": 6,
    "name": "محمد مؤيد كاظم عمران",
    "seq": 14
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة الولاء المؤسسي",
    "course_hours": 6,
    "name": "مروان راشد ياسين حسين",
    "seq": 15
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة الولاء المؤسسي",
    "course_hours": 6,
    "name": "حسين جواد كاظم سلطان",
    "seq": 16
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة الولاء المؤسسي",
    "course_hours": 6,
    "name": "علي حيدر كاظم عباس",
    "seq": 17
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة الولاء المؤسسي",
    "course_hours": 6,
    "name": "محمد مهدي حسن فريد",
    "seq": 18
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة الولاء المؤسسي",
    "course_hours": 6,
    "name": "حسين كريم عبد عمران حمزة",
    "seq": 19
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة الولاء المؤسسي",
    "course_hours": 6,
    "name": "رشا حسن شاكر سعيد",
    "seq": 20
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة الولاء المؤسسي",
    "course_hours": 6,
    "name": "علي عبد الامير خلف عرط",
    "seq": 21
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة الولاء المؤسسي",
    "course_hours": 6,
    "name": "حسن مهدي حسن عزيز",
    "seq": 22
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة الولاء المؤسسي",
    "course_hours": 6,
    "name": "علاء هاشم كريم فجر",
    "seq": 23
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة الولاء المؤسسي",
    "course_hours": 6,
    "name": "علي رحيم عبود رشيد",
    "seq": 24
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة الولاء المؤسسي",
    "course_hours": 6,
    "name": "نشوان حسين علي عبد المرشدي",
    "seq": 25
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة الولاء المؤسسي",
    "course_hours": 6,
    "name": "ابا الفضل عباس مهدي عبود",
    "seq": 26
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة الولاء المؤسسي",
    "course_hours": 6,
    "name": "سجاد رحمن جمعة جابر",
    "seq": 27
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة الولاء المؤسسي",
    "course_hours": 6,
    "name": "علي سلطان قاسم لازم",
    "seq": 28
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة الولاء المؤسسي",
    "course_hours": 6,
    "name": "حسين محمد جاسم صحن",
    "seq": 29
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة الولاء المؤسسي",
    "course_hours": 6,
    "name": "براء احمد متعب عواد",
    "seq": 30
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة الولاء المؤسسي",
    "course_hours": 6,
    "name": "فاضل عبد العباس علي عباس",
    "seq": 31
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة الولاء المؤسسي",
    "course_hours": 6,
    "name": "قاسم عبد علي مزهر هزاء",
    "seq": 32
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة الولاء المؤسسي",
    "course_hours": 6,
    "name": "علاوي محمد جدي عبود",
    "seq": 33
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة الولاء المؤسسي",
    "course_hours": 6,
    "name": "حسن مهدي هاشم خلف",
    "seq": 34
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "ماهر طعمة جابر محمد",
    "seq": 1
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "علي محمد حاتم شعلان",
    "seq": 2
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "محمد سعود حمزة عباس",
    "seq": 3
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "حيدر محسن علوان جاسم",
    "seq": 4
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "محمد عبد زيد عبد السادة",
    "seq": 5
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "عناد دليمي محمد برهي",
    "seq": 6
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "ابا الفضل عباس مهدي عبود",
    "seq": 7
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "حسن وليد كاظم عبعوب",
    "seq": 8
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "احمد جاسم ابو الشون كاظم",
    "seq": 9
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "عبد الخالق كاظم مرزوق",
    "seq": 10
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "كرار سعد محمد علي",
    "seq": 11
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "مصطفى محمد صاحب عبد الحسين",
    "seq": 12
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "احمد كاظم عبد علي حمزة",
    "seq": 13
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "وضاح فاروق خليل بارود",
    "seq": 14
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "حسين اركان عبد الزهرة عبد الحسين",
    "seq": 15
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "امير عباس حمزة علوان",
    "seq": 16
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "حسين ثامر سعيد جابر",
    "seq": 17
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "محمد مهدي حسن فريد",
    "seq": 18
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "رشا حسن شاكر سعيد",
    "seq": 19
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "علي عبد الامير خلف عرط",
    "seq": 20
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "حسن مهدي حسن عزيز",
    "seq": 21
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "علاء هاشم كريم فجر",
    "seq": 22
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "حسن عبد صكر حسين المنصوري",
    "seq": 23
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "علي رحيم عبود رشيد",
    "seq": 24
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "خلود مدحت محمود جبار",
    "seq": 25
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "نشوان حسين علي عبد المرشدي",
    "seq": 26
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "عقيل كاظم مراد كاظم",
    "seq": 27
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "علي سلطان قاسم لازم",
    "seq": 28
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "حسنين نعمة عجيل حسين",
    "seq": 29
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "حسين محمد جاسم صحن",
    "seq": 30
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "براء احمد متعب عواد",
    "seq": 31
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "فاضل عبد العباس علي عباس",
    "seq": 32
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "علي عباس بريج حطاب",
    "seq": 33
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "عبد علي سليمان عنبر",
    "seq": 34
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "قاسم عبد علي مزهر هزاء",
    "seq": 35
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "علاوي محمد جدي عبود",
    "seq": 36
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "علي حسين علاوي راضي",
    "seq": 37
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "احمد كاظم مجبل محمد",
    "seq": 38
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "ابو الفضل عبد مسلم يلسين",
    "seq": 39
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "محسن خوام مهدي عظب",
    "seq": 40
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "حسن مهدي هاشم خلف",
    "seq": 41
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "سليمان محمد كرحوت دريم",
    "seq": 42
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "مزهر خوام نصيف جاسم",
    "seq": 43
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة العلاقات العامة",
    "course_hours": 6,
    "name": "محمود ابراهيم جاسم محيميد",
    "seq": 44
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة إدارة الفعاليات والمهرجانات",
    "course_hours": 6,
    "name": "علي محمد حاتم شعلان",
    "seq": 1
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة إدارة الفعاليات والمهرجانات",
    "course_hours": 6,
    "name": "محمد سعود حمزة عباس",
    "seq": 2
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة إدارة الفعاليات والمهرجانات",
    "course_hours": 6,
    "name": "مروان راشد ياسين حسين",
    "seq": 3
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة إدارة الفعاليات والمهرجانات",
    "course_hours": 6,
    "name": "حسين جواد كاظم سلطان",
    "seq": 4
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة إدارة الفعاليات والمهرجانات",
    "course_hours": 6,
    "name": "علي حيدر كاظم عباس",
    "seq": 5
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة إدارة الفعاليات والمهرجانات",
    "course_hours": 6,
    "name": "عدي كتاب درب دعامة",
    "seq": 6
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة إدارة الفعاليات والمهرجانات",
    "course_hours": 6,
    "name": "ابا الفضل عباس مهدي عبود",
    "seq": 7
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة إدارة الفعاليات والمهرجانات",
    "course_hours": 6,
    "name": "احمد حسين عبد الحمزة احمد",
    "seq": 8
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة إدارة الفعاليات والمهرجانات",
    "course_hours": 6,
    "name": "علي حسين كزار راهي",
    "seq": 9
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة إدارة الفعاليات والمهرجانات",
    "course_hours": 6,
    "name": "سجاد رحمن جمعة جابر",
    "seq": 10
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة إدارة الفعاليات والمهرجانات",
    "course_hours": 6,
    "name": "عبد الحسن شعلان ساهي مشهد",
    "seq": 11
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة إدارة الفعاليات والمهرجانات",
    "course_hours": 6,
    "name": "علي سلطان قاسم لازم",
    "seq": 12
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة إدارة الفعاليات والمهرجانات",
    "course_hours": 6,
    "name": "حسين محمد جاسم صحن",
    "seq": 13
  },
  {
    "domain": "الدورات المجتمعية والفكرية",
    "course_name": "دورة إدارة الفعاليات والمهرجانات",
    "course_hours": 6,
    "name": "محمد مؤيد كاظم عمران",
    "seq": 14
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الاستقطاب وبناء الشبكات",
    "course_hours": 18,
    "name": "مصطفى عيدان هادي حسين",
    "seq": 1
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الاستقطاب وبناء الشبكات",
    "course_hours": 18,
    "name": "كاظم ابراهيم باقر حسن",
    "seq": 2
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الاستقطاب وبناء الشبكات",
    "course_hours": 18,
    "name": "احمد جاسم ابو الشون كاظم",
    "seq": 3
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الاستقطاب وبناء الشبكات",
    "course_hours": 18,
    "name": "عبد الخالق كاظم مرزوق",
    "seq": 4
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الاستقطاب وبناء الشبكات",
    "course_hours": 18,
    "name": "كرار سعد محمد علي",
    "seq": 5
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الاستقطاب وبناء الشبكات",
    "course_hours": 18,
    "name": "مصطفى محمد صاحب عبد الحسين",
    "seq": 6
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الاستقطاب وبناء الشبكات",
    "course_hours": 18,
    "name": "احمد كاظم عبد علي حمزة",
    "seq": 7
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الاستقطاب وبناء الشبكات",
    "course_hours": 18,
    "name": "وضاح فاروق خليل بارود",
    "seq": 8
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الاستقطاب وبناء الشبكات",
    "course_hours": 18,
    "name": "حسين اركان عبد الزهرة عبد الحسين",
    "seq": 9
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الاستقطاب وبناء الشبكات",
    "course_hours": 18,
    "name": "ماهر طعمة جابر محمد",
    "seq": 10
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الاستقطاب وبناء الشبكات",
    "course_hours": 18,
    "name": "حسين ثامر سعيد جابر",
    "seq": 11
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الاستقطاب وبناء الشبكات",
    "course_hours": 18,
    "name": "علي محمد حاتم شعلان",
    "seq": 12
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الاستقطاب وبناء الشبكات",
    "course_hours": 18,
    "name": "محمد سعود حمزة عباس",
    "seq": 13
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الاستقطاب وبناء الشبكات",
    "course_hours": 18,
    "name": "محمد مؤيد كاظم عمران",
    "seq": 14
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الاستقطاب وبناء الشبكات",
    "course_hours": 18,
    "name": "مروان راشد ياسين حسين",
    "seq": 15
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الاستقطاب وبناء الشبكات",
    "course_hours": 18,
    "name": "حسين جواد كاظم سلطان",
    "seq": 16
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الاستقطاب وبناء الشبكات",
    "course_hours": 18,
    "name": "حسين كريم عبد عمران حمزة",
    "seq": 17
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الاستقطاب وبناء الشبكات",
    "course_hours": 18,
    "name": "رشا حسن شاكر سعيد",
    "seq": 18
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الاستقطاب وبناء الشبكات",
    "course_hours": 18,
    "name": "علي عبد الامير خلف عرط",
    "seq": 19
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الاستقطاب وبناء الشبكات",
    "course_hours": 18,
    "name": "حسن مهدي حسن عزيز",
    "seq": 20
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الاستقطاب وبناء الشبكات",
    "course_hours": 18,
    "name": "علاء هاشم كريم فجر",
    "seq": 21
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الاستقطاب وبناء الشبكات",
    "course_hours": 18,
    "name": "حسن عبد صكر حسين المنصوري",
    "seq": 22
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الاستقطاب وبناء الشبكات",
    "course_hours": 18,
    "name": "احمد حسين عبد الحمزة احمد",
    "seq": 23
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الاستقطاب وبناء الشبكات",
    "course_hours": 18,
    "name": "علي حسين كزار راهي",
    "seq": 24
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الاستقطاب وبناء الشبكات",
    "course_hours": 18,
    "name": "عبد علي سليمان عنبر",
    "seq": 25
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة العمل الفرقي",
    "course_hours": 6,
    "name": "كاظم ابراهيم باقر حسن",
    "seq": 1
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة العمل الفرقي",
    "course_hours": 6,
    "name": "براء احمد متعب عواد",
    "seq": 2
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة العمل الفرقي",
    "course_hours": 6,
    "name": "ماهر طعمة جابر محمد",
    "seq": 3
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة العمل الفرقي",
    "course_hours": 6,
    "name": "علي محمد حاتم شعلان",
    "seq": 4
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة العمل الفرقي",
    "course_hours": 6,
    "name": "محمد سعود حمزة عباس",
    "seq": 5
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة العمل الفرقي",
    "course_hours": 6,
    "name": "حيدر محسن علوان جاسم",
    "seq": 6
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة العمل الفرقي",
    "course_hours": 6,
    "name": "محمد عبد زيد عبد السادة",
    "seq": 7
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة العمل الفرقي",
    "course_hours": 6,
    "name": "عناد دليمي محمد برهي",
    "seq": 8
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة العمل الفرقي",
    "course_hours": 6,
    "name": "ابا الفضل عباس مهدي عبود",
    "seq": 9
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة العمل الفرقي",
    "course_hours": 6,
    "name": "رضا علي هاني هادي",
    "seq": 10
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة العمل الفرقي",
    "course_hours": 6,
    "name": "محمد مهدي حسن فريد",
    "seq": 11
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الإشراف التدريبي",
    "course_hours": 6,
    "name": "مصطفى عيدان هادي حسين",
    "seq": 1
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الإشراف التدريبي",
    "course_hours": 6,
    "name": "حسن وليد كاظم عبعوب",
    "seq": 2
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الإشراف التدريبي",
    "course_hours": 6,
    "name": "ماهر طعمة جابر محمد",
    "seq": 3
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الإشراف التدريبي",
    "course_hours": 6,
    "name": "حسين ثامر سعيد جابر",
    "seq": 4
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الإشراف التدريبي",
    "course_hours": 6,
    "name": "علي محمد حاتم شعلان",
    "seq": 5
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الإشراف التدريبي",
    "course_hours": 6,
    "name": "محمد سعود حمزة عباس",
    "seq": 6
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الإشراف التدريبي",
    "course_hours": 6,
    "name": "حيدر محسن علوان جاسم",
    "seq": 7
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الإشراف التدريبي",
    "course_hours": 6,
    "name": "محمد مؤيد كاظم عمران",
    "seq": 8
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الإشراف التدريبي",
    "course_hours": 6,
    "name": "عدي كتاب درب دعامة",
    "seq": 9
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الإشراف التدريبي",
    "course_hours": 6,
    "name": "حسين كريم عبد عمران حمزة",
    "seq": 10
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الإشراف التدريبي",
    "course_hours": 6,
    "name": "حسن مهدي حسن عزيز",
    "seq": 11
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الإشراف التدريبي",
    "course_hours": 6,
    "name": "حسن عبد صكر حسين المنصوري",
    "seq": 12
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الإشراف التدريبي",
    "course_hours": 6,
    "name": "علي عبد الحسين موزان",
    "seq": 13
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الإشراف التدريبي",
    "course_hours": 6,
    "name": "احمد هاتف محمد عبد علي",
    "seq": 14
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الإشراف التدريبي",
    "course_hours": 6,
    "name": "مروان راشد ياسين حسين",
    "seq": 15
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الإشراف التدريبي",
    "course_hours": 6,
    "name": "حسين جواد كاظم سلطان",
    "seq": 16
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الإشراف التدريبي",
    "course_hours": 6,
    "name": "علي عبد الامير خلف عرط",
    "seq": 17
  },
  {
    "domain": "دورات الموارد البشرية",
    "course_name": "دورة الإشراف التدريبي",
    "course_hours": 6,
    "name": "علي رحيم عبود رشيد",
    "seq": 18
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة دراسة المدن",
    "course_hours": 14,
    "name": "حسن وليد كاظم عبعوب",
    "seq": 1
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة دراسة المدن",
    "course_hours": 14,
    "name": "احمد جاسم ابو الشون كاظم",
    "seq": 2
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة دراسة المدن",
    "course_hours": 14,
    "name": "كرار سعد محمد علي",
    "seq": 3
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة دراسة المدن",
    "course_hours": 14,
    "name": "احمد كاظم عبد علي حمزة",
    "seq": 4
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة دراسة المدن",
    "course_hours": 14,
    "name": "وضاح فاروق خليل بارود",
    "seq": 5
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة دراسة المدن",
    "course_hours": 14,
    "name": "حسين اركان عبد الزهرة عبد الحسين",
    "seq": 6
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة دراسة المدن",
    "course_hours": 14,
    "name": "حسين ثامر سعيد جابر",
    "seq": 7
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة دراسة المدن",
    "course_hours": 14,
    "name": "حيدر محسن علوان جاسم",
    "seq": 8
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة دراسة المدن",
    "course_hours": 14,
    "name": "حسين كريم عبد عمران حمزة",
    "seq": 9
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة دراسة المدن",
    "course_hours": 14,
    "name": "رشا حسن شاكر سعيد",
    "seq": 10
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة دراسة المدن",
    "course_hours": 14,
    "name": "علي عبد الامير خلف عرط",
    "seq": 11
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة دراسة المدن",
    "course_hours": 14,
    "name": "حسن مهدي حسن عزيز",
    "seq": 12
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة دراسة المدن",
    "course_hours": 14,
    "name": "علاء هاشم كريم فجر",
    "seq": 13
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة دراسة المدن",
    "course_hours": 14,
    "name": "علي رحيم عبود رشيد",
    "seq": 14
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة دراسة المدن",
    "course_hours": 14,
    "name": "عقيل كاظم مراد كاظم",
    "seq": 15
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة دراسة المدن",
    "course_hours": 14,
    "name": "ابا الفضل عباس مهدي عبود",
    "seq": 16
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة إدارة الوقت وتنظيم الأولويات",
    "course_hours": 6,
    "name": "محمد عامر عبد الحسين راضي",
    "seq": 1
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة إدارة الوقت وتنظيم الأولويات",
    "course_hours": 6,
    "name": "علي حيدر كاظم عباس",
    "seq": 2
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة إدارة الوقت وتنظيم الأولويات",
    "course_hours": 6,
    "name": "مصطفى عيدان هادي حسين",
    "seq": 3
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة إدارة الوقت وتنظيم الأولويات",
    "course_hours": 6,
    "name": "علي حسين عبد ابراهيم احمد",
    "seq": 4
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة إدارة الوقت وتنظيم الأولويات",
    "course_hours": 6,
    "name": "كرار سعد محمد علي",
    "seq": 5
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة إدارة الوقت وتنظيم الأولويات",
    "course_hours": 6,
    "name": "حسين اركان عبد الزهرة عبد الحسين",
    "seq": 6
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة إدارة الوقت وتنظيم الأولويات",
    "course_hours": 6,
    "name": "محمد سعود حمزة عباس",
    "seq": 7
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة إدارة الوقت وتنظيم الأولويات",
    "course_hours": 6,
    "name": "محمد مؤيد كاظم عمران",
    "seq": 8
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة إدارة الوقت وتنظيم الأولويات",
    "course_hours": 6,
    "name": "محمد مهدي حسن فريد",
    "seq": 9
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة إدارة الوقت وتنظيم الأولويات",
    "course_hours": 6,
    "name": "حسين كريم عبد عمران حمزة",
    "seq": 10
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة إدارة الوقت وتنظيم الأولويات",
    "course_hours": 6,
    "name": "نشوان حسين علي عبد المرشدي",
    "seq": 11
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة إعداد المدربين (TOT)",
    "course_hours": 40,
    "name": "مصطفى عيدان هادي حسين",
    "seq": 1
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة إعداد المدربين (TOT)",
    "course_hours": 40,
    "name": "حسن وليد كاظم عبعوب",
    "seq": 2
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة إعداد المدربين (TOT)",
    "course_hours": 40,
    "name": "ماهر طعمة جابر محمد",
    "seq": 3
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة إعداد المدربين (TOT)",
    "course_hours": 40,
    "name": "حسين ثامر سعيد جابر",
    "seq": 4
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة إعداد المدربين (TOT)",
    "course_hours": 40,
    "name": "علي محمد حاتم شعلان",
    "seq": 5
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة إعداد المدربين (TOT)",
    "course_hours": 40,
    "name": "محمد سعود حمزة عباس",
    "seq": 6
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة إعداد المدربين (TOT)",
    "course_hours": 40,
    "name": "حيدر محسن علوان جاسم",
    "seq": 7
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة إعداد المدربين (TOT)",
    "course_hours": 40,
    "name": "محمد مؤيد كاظم عمران",
    "seq": 8
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة إعداد المدربين (TOT)",
    "course_hours": 40,
    "name": "عدي كتاب درب دعامة",
    "seq": 9
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة إعداد المدربين (TOT)",
    "course_hours": 40,
    "name": "حسين كريم عبد عمران حمزة",
    "seq": 10
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة إعداد المدربين (TOT)",
    "course_hours": 40,
    "name": "حسن مهدي حسن عزيز",
    "seq": 11
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة إعداد المدربين (TOT)",
    "course_hours": 40,
    "name": "حسن عبد صكر حسين المنصوري",
    "seq": 12
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة إعداد المدربين (TOT)",
    "course_hours": 40,
    "name": "علي عبد الحسين موزان",
    "seq": 13
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة إعداد المدربين (TOT)",
    "course_hours": 40,
    "name": "احمد هاتف محمد عبد علي",
    "seq": 14
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة إعداد المدربين (TOT)",
    "course_hours": 40,
    "name": "مروان راشد ياسين حسين",
    "seq": 15
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة إعداد المدربين (TOT)",
    "course_hours": 40,
    "name": "حسين جواد كاظم سلطان",
    "seq": 16
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة إعداد المدربين (TOT)",
    "course_hours": 40,
    "name": "علي عبد الامير خلف عرط",
    "seq": 17
  },
  {
    "domain": "دورات التخطيط والمعلومات",
    "course_name": "دورة إعداد المدربين (TOT)",
    "course_hours": 40,
    "name": "علي رحيم عبود رشيد",
    "seq": 18
  }
];

export const coursesPerParticipantData: CoursesPerParticipantRow[] = [
  {
    "id": 1,
    "name": "ابا الفضل عباس مهدي عبود",
    "course_count": 13,
    "total_hours": 122,
    "courses": "دورة إعداد التقارير|دورة أخلاقيات العمل|دورة الالتزام والانضباط|دورة السلامة المهنية|دورة الإسعافات الأولية|دورة السيطرة المخزنية|دورة إدارة وصيانة الآليات والمركبات|دورة العمل التطوعي|دورة الولاء المؤسسي|دورة العلاقات العامة|دورة إدارة الفعاليات والمهرجانات|دورة العمل الفرقي|دورة دراسة المدن"
  },
  {
    "id": 2,
    "name": "ابو الفضل عبد مسلم يلسين",
    "course_count": 14,
    "total_hours": 156,
    "courses": "دورة تقنية SMART|دورة الإدارة الإلكترونية / الوورد|دورة الإدارة الإلكترونية / Power Point|دورة برنامج الإكسل|دورة مهارات الحماية الشخصية والمنشآت|دورة ضمان أمن المبنى|دورة مهارات التعامل مع المخاطر والتهديدات|دورة إدارة الأزمات|دورة الحماية السرية|دورة التعامل مع المظاهرات|دورة السلامة المهنية|دورة الإسعافات الأولية|دورة العمل التطوعي|دورة العلاقات العامة"
  },
  {
    "id": 3,
    "name": "احمد جاسم ابو الشون كاظم",
    "course_count": 9,
    "total_hours": 99,
    "courses": "دورة تقنية SMART|دورة إعداد التقارير|دورة المخاطبات الإدارية|دورة الحفظ والأرشفة|دورة الإدارة الإلكترونية / Power Point|دورة العمل التطوعي|دورة العلاقات العامة|دورة الاستقطاب وبناء الشبكات|دورة دراسة المدن"
  },
  {
    "id": 4,
    "name": "احمد حسين عبد الحمزة احمد",
    "course_count": 9,
    "total_hours": 105,
    "courses": "دورة تقنية SMART|دورة الإدارة الإلكترونية / الوورد|دورة الإدارة الإلكترونية / Power Point|دورة برنامج الإكسل|دورة السلامة المهنية|دورة الإسعافات الأولية|دورة السيطرة المخزنية|دورة إدارة الفعاليات والمهرجانات|دورة الاستقطاب وبناء الشبكات"
  },
  {
    "id": 5,
    "name": "احمد كاظم عبد علي حمزة",
    "course_count": 18,
    "total_hours": 179,
    "courses": "دورة إعداد التقارير|دورة المخاطبات الإدارية|دورة أخلاقيات العمل|دورة الحفظ والأرشفة|دورة الالتزام والانضباط|دورة مهارات الحماية الشخصية والمنشآت|دورة ضمان أمن المبنى|دورة مهارات التعامل مع المخاطر والتهديدات|دورة إدارة الأزمات|دورة الحماية السرية|دورة التعامل مع المظاهرات|دورة السلامة المهنية|دورة الإسعافات الأولية|دورة العمل التطوعي|دورة الولاء المؤسسي|دورة العلاقات العامة|دورة الاستقطاب وبناء الشبكات|دورة دراسة المدن"
  },
  {
    "id": 6,
    "name": "احمد كاظم مجبل محمد",
    "course_count": 14,
    "total_hours": 156,
    "courses": "دورة تقنية SMART|دورة الإدارة الإلكترونية / الوورد|دورة الإدارة الإلكترونية / Power Point|دورة برنامج الإكسل|دورة مهارات الحماية الشخصية والمنشآت|دورة ضمان أمن المبنى|دورة مهارات التعامل مع المخاطر والتهديدات|دورة إدارة الأزمات|دورة الحماية السرية|دورة التعامل مع المظاهرات|دورة السلامة المهنية|دورة الإسعافات الأولية|دورة العمل التطوعي|دورة العلاقات العامة"
  },
  {
    "id": 7,
    "name": "احمد هاتف محمد عبد علي",
    "course_count": 17,
    "total_hours": 249,
    "courses": "دورة المخاطبات الإدارية|دورة الحفظ والأرشفة|دورة الإدارة الإلكترونية / الوورد|دورة برنامج الإكسل|دورة التخطيط الاستراتيجي|دورة أسس القيادة|دورة القيادة الإشرافية|دورة مهارات الحماية الشخصية والمنشآت|دورة ضمان أمن المبنى|دورة مهارات التعامل مع المخاطر والتهديدات|دورة إدارة الأزمات|دورة الحماية السرية|دورة التعامل مع المظاهرات|دورة السلامة المهنية|دورة الإسعافات الأولية|دورة الإشراف التدريبي|دورة إعداد المدربين (TOT)"
  },
  {
    "id": 8,
    "name": "امير عباس حمزة علوان",
    "course_count": 5,
    "total_hours": 46,
    "courses": "دورة أخلاقيات العمل|دورة الالتزام والانضباط|دورة العمل التطوعي|دورة الولاء المؤسسي|دورة العلاقات العامة"
  },
  {
    "id": 9,
    "name": "براء احمد متعب عواد",
    "course_count": 16,
    "total_hours": 157,
    "courses": "دورة تقنية SMART|دورة أخلاقيات العمل|دورة الإدارة الإلكترونية / Power Point|دورة الالتزام والانضباط|دورة مهارات الحماية الشخصية والمنشآت|دورة ضمان أمن المبنى|دورة مهارات التعامل مع المخاطر والتهديدات|دورة إدارة الأزمات|دورة الحماية السرية|دورة التعامل مع المظاهرات|دورة السلامة المهنية|دورة الإسعافات الأولية|دورة العمل التطوعي|دورة الولاء المؤسسي|دورة العلاقات العامة|دورة العمل الفرقي"
  },
  {
    "id": 10,
    "name": "حسن عبد صكر حسين المنصوري",
    "course_count": 12,
    "total_hours": 222,
    "courses": "دورة تقنية SMART|دورة الإدارة الإلكترونية / الوورد|دورة الإدارة الإلكترونية / Power Point|دورة برنامج الإكسل|دورة التخطيط الاستراتيجي|دورة أسس القيادة|دورة القيادة الإشرافية|دورة العمل التطوعي|دورة العلاقات العامة|دورة الاستقطاب وبناء الشبكات|دورة الإشراف التدريبي|دورة إعداد المدربين (TOT)"
  },
  {
    "id": 11,
    "name": "حسن مهدي حسن عزيز",
    "course_count": 15,
    "total_hours": 246,
    "courses": "دورة إعداد التقارير|دورة أخلاقيات العمل|دورة الإدارة الإلكترونية / Power Point|دورة برنامج الإكسل|دورة التخطيط الاستراتيجي|دورة أسس القيادة|دورة القيادة الإشرافية|دورة الالتزام والانضباط|دورة العمل التطوعي|دورة الولاء المؤسسي|دورة العلاقات العامة|دورة الاستقطاب وبناء الشبكات|دورة الإشراف التدريبي|دورة دراسة المدن|دورة إعداد المدربين (TOT)"
  },
  {
    "id": 12,
    "name": "حسن مهدي هاشم خلف",
    "course_count": 17,
    "total_hours": 167,
    "courses": "دورة المخاطبات الإدارية|دورة أخلاقيات العمل|دورة الحفظ والأرشفة|دورة الإدارة الإلكترونية / الوورد|دورة برنامج الإكسل|دورة الالتزام والانضباط|دورة مهارات الحماية الشخصية والمنشآت|دورة ضمان أمن المبنى|دورة مهارات التعامل مع المخاطر والتهديدات|دورة إدارة الأزمات|دورة الحماية السرية|دورة التعامل مع المظاهرات|دورة السلامة المهنية|دورة الإسعافات الأولية|دورة العمل التطوعي|دورة الولاء المؤسسي|دورة العلاقات العامة"
  },
  {
    "id": 13,
    "name": "حسن وليد كاظم عبعوب",
    "course_count": 12,
    "total_hours": 190,
    "courses": "دورة إعداد التقارير|دورة المخاطبات الإدارية|دورة الحفظ والأرشفة|دورة التخطيط الاستراتيجي|دورة أسس القيادة|دورة القيادة الإشرافية|دورة الإشراف على المشاريع الهندسية والبنى التحتية|دورة العمل التطوعي|دورة العلاقات العامة|دورة الإشراف التدريبي|دورة دراسة المدن|دورة إعداد المدربين (TOT)"
  },
  {
    "id": 14,
    "name": "حسنين نعمة عجيل حسين",
    "course_count": 14,
    "total_hours": 156,
    "courses": "دورة تقنية SMART|دورة الإدارة الإلكترونية / الوورد|دورة الإدارة الإلكترونية / Power Point|دورة برنامج الإكسل|دورة مهارات الحماية الشخصية والمنشآت|دورة ضمان أمن المبنى|دورة مهارات التعامل مع المخاطر والتهديدات|دورة إدارة الأزمات|دورة الحماية السرية|دورة التعامل مع المظاهرات|دورة السلامة المهنية|دورة الإسعافات الأولية|دورة العمل التطوعي|دورة العلاقات العامة"
  },
  {
    "id": 15,
    "name": "حسين اركان عبد الزهرة عبد الحسين",
    "course_count": 19,
    "total_hours": 185,
    "courses": "دورة إعداد التقارير|دورة المخاطبات الإدارية|دورة أخلاقيات العمل|دورة الحفظ والأرشفة|دورة الالتزام والانضباط|دورة مهارات الحماية الشخصية والمنشآت|دورة ضمان أمن المبنى|دورة مهارات التعامل مع المخاطر والتهديدات|دورة إدارة الأزمات|دورة الحماية السرية|دورة التعامل مع المظاهرات|دورة السلامة المهنية|دورة الإسعافات الأولية|دورة العمل التطوعي|دورة الولاء المؤسسي|دورة العلاقات العامة|دورة الاستقطاب وبناء الشبكات|دورة دراسة المدن|دورة إدارة الوقت وتنظيم الأولويات"
  },
  {
    "id": 16,
    "name": "حسين ثامر سعيد جابر",
    "course_count": 15,
    "total_hours": 227,
    "courses": "دورة إعداد التقارير|دورة المخاطبات الإدارية|دورة أخلاقيات العمل|دورة الحفظ والأرشفة|دورة التخطيط الاستراتيجي|دورة أسس القيادة|دورة القيادة الإشرافية|دورة الالتزام والانضباط|دورة العمل التطوعي|دورة الولاء المؤسسي|دورة العلاقات العامة|دورة الاستقطاب وبناء الشبكات|دورة الإشراف التدريبي|دورة دراسة المدن|دورة إعداد المدربين (TOT)"
  },
  {
    "id": 17,
    "name": "حسين جواد كاظم سلطان",
    "course_count": 11,
    "total_hours": 146,
    "courses": "دورة أخلاقيات العمل|دورة الإدارة الإلكترونية / الوورد|دورة الإدارة الإلكترونية / Power Point|دورة برنامج الإكسل|دورة الالتزام والانضباط|دورة التشوه الإعلامي|دورة الولاء المؤسسي|دورة إدارة الفعاليات والمهرجانات|دورة الاستقطاب وبناء الشبكات|دورة الإشراف التدريبي|دورة إعداد المدربين (TOT)"
  },
  {
    "id": 18,
    "name": "حسين كريم عبد عمران حمزة",
    "course_count": 14,
    "total_hours": 212,
    "courses": "دورة إعداد التقارير|دورة المخاطبات الإدارية|دورة أخلاقيات العمل|دورة الحفظ والأرشفة|دورة التخطيط الاستراتيجي|دورة أسس القيادة|دورة القيادة الإشرافية|دورة الالتزام والانضباط|دورة الولاء المؤسسي|دورة الاستقطاب وبناء الشبكات|دورة الإشراف التدريبي|دورة دراسة المدن|دورة إدارة الوقت وتنظيم الأولويات|دورة إعداد المدربين (TOT)"
  },
  {
    "id": 19,
    "name": "حسين محمد جاسم صحن",
    "course_count": 18,
    "total_hours": 187,
    "courses": "دورة تقنية SMART|دورة أخلاقيات العمل|دورة الإدارة الإلكترونية / الوورد|دورة الإدارة الإلكترونية / Power Point|دورة برنامج الإكسل|دورة الالتزام والانضباط|دورة مهارات الحماية الشخصية والمنشآت|دورة ضمان أمن المبنى|دورة مهارات التعامل مع المخاطر والتهديدات|دورة إدارة الأزمات|دورة الحماية السرية|دورة التعامل مع المظاهرات|دورة السلامة المهنية|دورة الإسعافات الأولية|دورة العمل التطوعي|دورة الولاء المؤسسي|دورة العلاقات العامة|دورة إدارة الفعاليات والمهرجانات"
  },
  {
    "id": 20,
    "name": "حيدر عبد الله رزوقي علي",
    "course_count": 12,
    "total_hours": 135,
    "courses": "دورة تقنية SMART|دورة الإدارة الإلكترونية / الوورد|دورة الإدارة الإلكترونية / Power Point|دورة برنامج الإكسل|دورة مهارات الحماية الشخصية والمنشآت|دورة ضمان أمن المبنى|دورة مهارات التعامل مع المخاطر والتهديدات|دورة إدارة الأزمات|دورة الحماية السرية|دورة التعامل مع المظاهرات|دورة السلامة المهنية|دورة الإسعافات الأولية"
  },
  {
    "id": 21,
    "name": "حيدر محسن علوان جاسم",
    "course_count": 12,
    "total_hours": 209,
    "courses": "دورة إعداد التقارير|دورة الإدارة الإلكترونية / الوورد|دورة برنامج الإكسل|دورة التخطيط الاستراتيجي|دورة أسس القيادة|دورة القيادة الإشرافية|دورة العمل التطوعي|دورة العلاقات العامة|دورة العمل الفرقي|دورة الإشراف التدريبي|دورة دراسة المدن|دورة إعداد المدربين (TOT)"
  },
  {
    "id": 22,
    "name": "خلود مدحت محمود جبار",
    "course_count": 7,
    "total_hours": 58,
    "courses": "دورة المخاطبات الإدارية|دورة الحفظ والأرشفة|دورة السلامة المهنية|دورة الإسعافات الأولية|دورة السيطرة المخزنية|دورة العمل التطوعي|دورة العلاقات العامة"
  },
  {
    "id": 23,
    "name": "رشا حسن شاكر سعيد",
    "course_count": 10,
    "total_hours": 113,
    "courses": "دورة تقنية SMART|دورة إعداد التقارير|دورة أخلاقيات العمل|دورة الإدارة الإلكترونية / Power Point|دورة الالتزام والانضباط|دورة العمل التطوعي|دورة الولاء المؤسسي|دورة العلاقات العامة|دورة الاستقطاب وبناء الشبكات|دورة دراسة المدن"
  },
  {
    "id": 24,
    "name": "رضا علي هاني هادي",
    "course_count": 16,
    "total_hours": 147,
    "courses": "دورة تقنية SMART|دورة المخاطبات الإدارية|دورة أخلاقيات العمل|دورة الحفظ والأرشفة|دورة الإدارة الإلكترونية / Power Point|دورة الالتزام والانضباط|دورة مهارات الحماية الشخصية والمنشآت|دورة ضمان أمن المبنى|دورة مهارات التعامل مع المخاطر والتهديدات|دورة إدارة الأزمات|دورة الحماية السرية|دورة التعامل مع المظاهرات|دورة السلامة المهنية|دورة الإسعافات الأولية|دورة الولاء المؤسسي|دورة العمل الفرقي"
  },
  {
    "id": 25,
    "name": "سجاد رحمن جمعة جابر",
    "course_count": 11,
    "total_hours": 112,
    "courses": "دورة تقنية SMART|دورة أخلاقيات العمل|دورة الإدارة الإلكترونية / الوورد|دورة الإدارة الإلكترونية / Power Point|دورة برنامج الإكسل|دورة الالتزام والانضباط|دورة السلامة المهنية|دورة الإسعافات الأولية|دورة السيطرة المخزنية|دورة الولاء المؤسسي|دورة إدارة الفعاليات والمهرجانات"
  },
  {
    "id": 26,
    "name": "سليمان محمد كرحوت دريم",
    "course_count": 14,
    "total_hours": 156,
    "courses": "دورة تقنية SMART|دورة الإدارة الإلكترونية / الوورد|دورة الإدارة الإلكترونية / Power Point|دورة برنامج الإكسل|دورة مهارات الحماية الشخصية والمنشآت|دورة ضمان أمن المبنى|دورة مهارات التعامل مع المخاطر والتهديدات|دورة إدارة الأزمات|دورة الحماية السرية|دورة التعامل مع المظاهرات|دورة السلامة المهنية|دورة الإسعافات الأولية|دورة العمل التطوعي|دورة العلاقات العامة"
  },
  {
    "id": 27,
    "name": "عبد الحسن شعلان ساهي مشهد",
    "course_count": 8,
    "total_hours": 87,
    "courses": "دورة تقنية SMART|دورة الإدارة الإلكترونية / الوورد|دورة الإدارة الإلكترونية / Power Point|دورة برنامج الإكسل|دورة السلامة المهنية|دورة الإسعافات الأولية|دورة السيطرة المخزنية|دورة إدارة الفعاليات والمهرجانات"
  },
  {
    "id": 28,
    "name": "عبد الخالق كاظم مرزوق",
    "course_count": 10,
    "total_hours": 105,
    "courses": "دورة المخاطبات الإدارية|دورة أخلاقيات العمل|دورة الحفظ والأرشفة|دورة الإدارة الإلكترونية / Power Point|دورة برنامج الإكسل|دورة الالتزام والانضباط|دورة العمل التطوعي|دورة الولاء المؤسسي|دورة العلاقات العامة|دورة الاستقطاب وبناء الشبكات"
  },
  {
    "id": 29,
    "name": "عبد علي سليمان عنبر",
    "course_count": 13,
    "total_hours": 144,
    "courses": "دورة تقنية SMART|دورة الإدارة الإلكترونية / Power Point|دورة مهارات الحماية الشخصية والمنشآت|دورة ضمان أمن المبنى|دورة مهارات التعامل مع المخاطر والتهديدات|دورة إدارة الأزمات|دورة الحماية السرية|دورة التعامل مع المظاهرات|دورة السلامة المهنية|دورة الإسعافات الأولية|دورة العمل التطوعي|دورة العلاقات العامة|دورة الاستقطاب وبناء الشبكات"
  },
  {
    "id": 30,
    "name": "عدي كتاب درب دعامة",
    "course_count": 11,
    "total_hours": 195,
    "courses": "دورة إعداد التقارير|دورة الإدارة الإلكترونية / الوورد|دورة الإدارة الإلكترونية / Power Point|دورة برنامج الإكسل|دورة التخطيط الاستراتيجي|دورة أسس القيادة|دورة القيادة الإشرافية|دورة التشوه الإعلامي|دورة إدارة الفعاليات والمهرجانات|دورة الإشراف التدريبي|دورة إعداد المدربين (TOT)"
  },
  {
    "id": 31,
    "name": "عقيل كاظم مراد كاظم",
    "course_count": 9,
    "total_hours": 96,
    "courses": "دورة تقنية SMART|دورة إعداد التقارير|دورة الإدارة الإلكترونية / Power Point|دورة السلامة المهنية|دورة الإسعافات الأولية|دورة السيطرة المخزنية|دورة العمل التطوعي|دورة العلاقات العامة|دورة دراسة المدن"
  },
  {
    "id": 32,
    "name": "علاء هاشم كريم فجر",
    "course_count": 10,
    "total_hours": 118,
    "courses": "دورة إعداد التقارير|دورة أخلاقيات العمل|دورة الإدارة الإلكترونية / الوورد|دورة برنامج الإكسل|دورة الالتزام والانضباط|دورة العمل التطوعي|دورة الولاء المؤسسي|دورة العلاقات العامة|دورة الاستقطاب وبناء الشبكات|دورة دراسة المدن"
  },
  {
    "id": 33,
    "name": "علاوي محمد جدي عبود",
    "course_count": 17,
    "total_hours": 181,
    "courses": "دورة تقنية SMART|دورة أخلاقيات العمل|دورة الإدارة الإلكترونية / الوورد|دورة الإدارة الإلكترونية / Power Point|دورة برنامج الإكسل|دورة الالتزام والانضباط|دورة مهارات الحماية الشخصية والمنشآت|دورة ضمان أمن المبنى|دورة مهارات التعامل مع المخاطر والتهديدات|دورة إدارة الأزمات|دورة الحماية السرية|دورة التعامل مع المظاهرات|دورة السلامة المهنية|دورة الإسعافات الأولية|دورة العمل التطوعي|دورة الولاء المؤسسي|دورة العلاقات العامة"
  },
  {
    "id": 34,
    "name": "علي حسين عبد ابراهيم احمد",
    "course_count": 10,
    "total_hours": 97,
    "courses": "دورة تقنية SMART|دورة المخاطبات الإدارية|دورة أخلاقيات العمل|دورة الحفظ والأرشفة|دورة الإدارة الإلكترونية / الوورد|دورة الإدارة الإلكترونية / Power Point|دورة برنامج الإكسل|دورة الالتزام والانضباط|دورة الولاء المؤسسي|دورة إدارة الوقت وتنظيم الأولويات"
  },
  {
    "id": 35,
    "name": "علي حسين علاوي راضي",
    "course_count": 14,
    "total_hours": 156,
    "courses": "دورة تقنية SMART|دورة الإدارة الإلكترونية / الوورد|دورة الإدارة الإلكترونية / Power Point|دورة برنامج الإكسل|دورة مهارات الحماية الشخصية والمنشآت|دورة ضمان أمن المبنى|دورة مهارات التعامل مع المخاطر والتهديدات|دورة إدارة الأزمات|دورة الحماية السرية|دورة التعامل مع المظاهرات|دورة السلامة المهنية|دورة الإسعافات الأولية|دورة العمل التطوعي|دورة العلاقات العامة"
  },
  {
    "id": 36,
    "name": "علي حسين كزار راهي",
    "course_count": 9,
    "total_hours": 105,
    "courses": "دورة تقنية SMART|دورة الإدارة الإلكترونية / الوورد|دورة الإدارة الإلكترونية / Power Point|دورة برنامج الإكسل|دورة السلامة المهنية|دورة الإسعافات الأولية|دورة السيطرة المخزنية|دورة إدارة الفعاليات والمهرجانات|دورة الاستقطاب وبناء الشبكات"
  },
  {
    "id": 37,
    "name": "علي حيدر كاظم عباس",
    "course_count": 9,
    "total_hours": 92,
    "courses": "دورة تقنية SMART|دورة أخلاقيات العمل|دورة الإدارة الإلكترونية / الوورد|دورة الإدارة الإلكترونية / Power Point|دورة برنامج الإكسل|دورة الالتزام والانضباط|دورة الولاء المؤسسي|دورة إدارة الفعاليات والمهرجانات|دورة إدارة الوقت وتنظيم الأولويات"
  },
  {
    "id": 38,
    "name": "علي رحيم عبود رشيد",
    "course_count": 9,
    "total_hours": 116,
    "courses": "دورة إعداد التقارير|دورة أخلاقيات العمل|دورة الالتزام والانضباط|دورة العمل التطوعي|دورة الولاء المؤسسي|دورة العلاقات العامة|دورة الإشراف التدريبي|دورة دراسة المدن|دورة إعداد المدربين (TOT)"
  },
  {
    "id": 39,
    "name": "علي سلطان قاسم لازم",
    "course_count": 18,
    "total_hours": 187,
    "courses": "دورة تقنية SMART|دورة أخلاقيات العمل|دورة الإدارة الإلكترونية / الوورد|دورة الإدارة الإلكترونية / Power Point|دورة برنامج الإكسل|دورة الالتزام والانضباط|دورة مهارات الحماية الشخصية والمنشآت|دورة ضمان أمن المبنى|دورة مهارات التعامل مع المخاطر والتهديدات|دورة إدارة الأزمات|دورة الحماية السرية|دورة التعامل مع المظاهرات|دورة السلامة المهنية|دورة الإسعافات الأولية|دورة العمل التطوعي|دورة الولاء المؤسسي|دورة العلاقات العامة|دورة إدارة الفعاليات والمهرجانات"
  },
  {
    "id": 40,
    "name": "علي طعمة جابر",
    "course_count": 7,
    "total_hours": 81,
    "courses": "دورة تقنية SMART|دورة الإدارة الإلكترونية / الوورد|دورة الإدارة الإلكترونية / Power Point|دورة برنامج الإكسل|دورة السلامة المهنية|دورة الإسعافات الأولية|دورة السيطرة المخزنية"
  },
  {
    "id": 41,
    "name": "علي عباس بريج حطاب",
    "course_count": 14,
    "total_hours": 156,
    "courses": "دورة تقنية SMART|دورة الإدارة الإلكترونية / الوورد|دورة الإدارة الإلكترونية / Power Point|دورة برنامج الإكسل|دورة مهارات الحماية الشخصية والمنشآت|دورة ضمان أمن المبنى|دورة مهارات التعامل مع المخاطر والتهديدات|دورة إدارة الأزمات|دورة الحماية السرية|دورة التعامل مع المظاهرات|دورة السلامة المهنية|دورة الإسعافات الأولية|دورة العمل التطوعي|دورة العلاقات العامة"
  },
  {
    "id": 42,
    "name": "علي عبد الامير خلف عرط",
    "course_count": 10,
    "total_hours": 134,
    "courses": "دورة إعداد التقارير|دورة أخلاقيات العمل|دورة الالتزام والانضباط|دورة العمل التطوعي|دورة الولاء المؤسسي|دورة العلاقات العامة|دورة الاستقطاب وبناء الشبكات|دورة الإشراف التدريبي|دورة دراسة المدن|دورة إعداد المدربين (TOT)"
  },
  {
    "id": 43,
    "name": "علي عبد الحسين موزان",
    "course_count": 17,
    "total_hours": 263,
    "courses": "دورة تقنية SMART|دورة الإدارة الإلكترونية / الوورد|دورة الإدارة الإلكترونية / Power Point|دورة برنامج الإكسل|دورة التخطيط الاستراتيجي|دورة أسس القيادة|دورة القيادة الإشرافية|دورة مهارات الحماية الشخصية والمنشآت|دورة ضمان أمن المبنى|دورة مهارات التعامل مع المخاطر والتهديدات|دورة إدارة الأزمات|دورة الحماية السرية|دورة التعامل مع المظاهرات|دورة السلامة المهنية|دورة الإسعافات الأولية|دورة الإشراف التدريبي|دورة إعداد المدربين (TOT)"
  },
  {
    "id": 44,
    "name": "علي محمد حاتم شعلان",
    "course_count": 14,
    "total_hours": 234,
    "courses": "دورة تقنية SMART|دورة الإدارة الإلكترونية / الوورد|دورة الإدارة الإلكترونية / Power Point|دورة برنامج الإكسل|دورة التخطيط الاستراتيجي|دورة أسس القيادة|دورة القيادة الإشرافية|دورة العمل التطوعي|دورة العلاقات العامة|دورة إدارة الفعاليات والمهرجانات|دورة الاستقطاب وبناء الشبكات|دورة العمل الفرقي|دورة الإشراف التدريبي|دورة إعداد المدربين (TOT)"
  },
  {
    "id": 45,
    "name": "عناد دليمي محمد برهي",
    "course_count": 9,
    "total_hours": 97,
    "courses": "دورة الإدارة الإلكترونية / الوورد|دورة برنامج الإكسل|دورة السلامة المهنية|دورة الإسعافات الأولية|دورة السيطرة المخزنية|دورة إدارة وصيانة الآليات والمركبات|دورة العمل التطوعي|دورة العلاقات العامة|دورة العمل الفرقي"
  },
  {
    "id": 46,
    "name": "فاضل عبد العباس علي عباس",
    "course_count": 17,
    "total_hours": 181,
    "courses": "دورة تقنية SMART|دورة أخلاقيات العمل|دورة الإدارة الإلكترونية / الوورد|دورة الإدارة الإلكترونية / Power Point|دورة برنامج الإكسل|دورة الالتزام والانضباط|دورة مهارات الحماية الشخصية والمنشآت|دورة ضمان أمن المبنى|دورة مهارات التعامل مع المخاطر والتهديدات|دورة إدارة الأزمات|دورة الحماية السرية|دورة التعامل مع المظاهرات|دورة السلامة المهنية|دورة الإسعافات الأولية|دورة العمل التطوعي|دورة الولاء المؤسسي|دورة العلاقات العامة"
  },
  {
    "id": 47,
    "name": "قاسم عبد علي مزهر هزاء",
    "course_count": 17,
    "total_hours": 181,
    "courses": "دورة تقنية SMART|دورة أخلاقيات العمل|دورة الإدارة الإلكترونية / الوورد|دورة الإدارة الإلكترونية / Power Point|دورة برنامج الإكسل|دورة الالتزام والانضباط|دورة مهارات الحماية الشخصية والمنشآت|دورة ضمان أمن المبنى|دورة مهارات التعامل مع المخاطر والتهديدات|دورة إدارة الأزمات|دورة الحماية السرية|دورة التعامل مع المظاهرات|دورة السلامة المهنية|دورة الإسعافات الأولية|دورة العمل التطوعي|دورة الولاء المؤسسي|دورة العلاقات العامة"
  },
  {
    "id": 48,
    "name": "كاظم ابراهيم باقر حسن",
    "course_count": 8,
    "total_hours": 75,
    "courses": "دورة المخاطبات الإدارية|دورة أخلاقيات العمل|دورة الحفظ والأرشفة|دورة الإدارة الإلكترونية / Power Point|دورة الالتزام والانضباط|دورة الولاء المؤسسي|دورة الاستقطاب وبناء الشبكات|دورة العمل الفرقي"
  },
  {
    "id": 49,
    "name": "كرار سعد محمد علي",
    "course_count": 13,
    "total_hours": 130,
    "courses": "دورة تقنية SMART|دورة إعداد التقارير|دورة المخاطبات الإدارية|دورة أخلاقيات العمل|دورة الحفظ والأرشفة|دورة الإدارة الإلكترونية / Power Point|دورة الالتزام والانضباط|دورة العمل التطوعي|دورة الولاء المؤسسي|دورة العلاقات العامة|دورة الاستقطاب وبناء الشبكات|دورة دراسة المدن|دورة إدارة الوقت وتنظيم الأولويات"
  },
  {
    "id": 50,
    "name": "ماهر طعمة جابر محمد",
    "course_count": 13,
    "total_hours": 214,
    "courses": "دورة المخاطبات الإدارية|دورة الحفظ والأرشفة|دورة الإدارة الإلكترونية / الوورد|دورة برنامج الإكسل|دورة التخطيط الاستراتيجي|دورة أسس القيادة|دورة القيادة الإشرافية|دورة العمل التطوعي|دورة العلاقات العامة|دورة الاستقطاب وبناء الشبكات|دورة العمل الفرقي|دورة الإشراف التدريبي|دورة إعداد المدربين (TOT)"
  },
  {
    "id": 51,
    "name": "محسن خوام مهدي عظب",
    "course_count": 14,
    "total_hours": 156,
    "courses": "دورة تقنية SMART|دورة الإدارة الإلكترونية / الوورد|دورة الإدارة الإلكترونية / Power Point|دورة برنامج الإكسل|دورة مهارات الحماية الشخصية والمنشآت|دورة ضمان أمن المبنى|دورة مهارات التعامل مع المخاطر والتهديدات|دورة إدارة الأزمات|دورة الحماية السرية|دورة التعامل مع المظاهرات|دورة السلامة المهنية|دورة الإسعافات الأولية|دورة العمل التطوعي|دورة العلاقات العامة"
  },
  {
    "id": 52,
    "name": "محمد سعود حمزة عباس",
    "course_count": 18,
    "total_hours": 265,
    "courses": "دورة تقنية SMART|دورة أخلاقيات العمل|دورة الإدارة الإلكترونية / الوورد|دورة الإدارة الإلكترونية / Power Point|دورة برنامج الإكسل|دورة التخطيط الاستراتيجي|دورة أسس القيادة|دورة القيادة الإشرافية|دورة الالتزام والانضباط|دورة العمل التطوعي|دورة الولاء المؤسسي|دورة العلاقات العامة|دورة إدارة الفعاليات والمهرجانات|دورة الاستقطاب وبناء الشبكات|دورة العمل الفرقي|دورة الإشراف التدريبي|دورة إدارة الوقت وتنظيم الأولويات|دورة إعداد المدربين (TOT)"
  },
  {
    "id": 53,
    "name": "محمد عامر عبد الحسين راضي",
    "course_count": 6,
    "total_hours": 42,
    "courses": "دورة المخاطبات الإدارية|دورة أخلاقيات العمل|دورة الحفظ والأرشفة|دورة الالتزام والانضباط|دورة الولاء المؤسسي|دورة إدارة الوقت وتنظيم الأولويات"
  },
  {
    "id": 54,
    "name": "محمد عبد زيد عبد السادة",
    "course_count": 9,
    "total_hours": 97,
    "courses": "دورة الإدارة الإلكترونية / الوورد|دورة برنامج الإكسل|دورة السلامة المهنية|دورة الإسعافات الأولية|دورة السيطرة المخزنية|دورة إدارة وصيانة الآليات والمركبات|دورة العمل التطوعي|دورة العلاقات العامة|دورة العمل الفرقي"
  },
  {
    "id": 55,
    "name": "محمد مؤيد كاظم عمران",
    "course_count": 16,
    "total_hours": 230,
    "courses": "دورة المخاطبات الإدارية|دورة أخلاقيات العمل|دورة الحفظ والأرشفة|دورة الإدارة الإلكترونية / Power Point|دورة برنامج الإكسل|دورة التخطيط الاستراتيجي|دورة أسس القيادة|دورة القيادة الإشرافية|دورة الالتزام والانضباط|دورة التشوه الإعلامي|دورة الولاء المؤسسي|دورة إدارة الفعاليات والمهرجانات|دورة الاستقطاب وبناء الشبكات|دورة الإشراف التدريبي|دورة إدارة الوقت وتنظيم الأولويات|دورة إعداد المدربين (TOT)"
  },
  {
    "id": 56,
    "name": "محمد مهدي حسن فريد",
    "course_count": 18,
    "total_hours": 163,
    "courses": "دورة المخاطبات الإدارية|دورة أخلاقيات العمل|دورة الحفظ والأرشفة|دورة الالتزام والانضباط|دورة مهارات الحماية الشخصية والمنشآت|دورة ضمان أمن المبنى|دورة مهارات التعامل مع المخاطر والتهديدات|دورة إدارة الأزمات|دورة الحماية السرية|دورة التعامل مع المظاهرات|دورة السلامة المهنية|دورة الإسعافات الأولية|دورة السيطرة المخزنية|دورة العمل التطوعي|دورة الولاء المؤسسي|دورة العلاقات العامة|دورة العمل الفرقي|دورة إدارة الوقت وتنظيم الأولويات"
  },
  {
    "id": 57,
    "name": "محمود ابراهيم جاسم محيميد",
    "course_count": 14,
    "total_hours": 156,
    "courses": "دورة تقنية SMART|دورة الإدارة الإلكترونية / الوورد|دورة الإدارة الإلكترونية / Power Point|دورة برنامج الإكسل|دورة مهارات الحماية الشخصية والمنشآت|دورة ضمان أمن المبنى|دورة مهارات التعامل مع المخاطر والتهديدات|دورة إدارة الأزمات|دورة الحماية السرية|دورة التعامل مع المظاهرات|دورة السلامة المهنية|دورة الإسعافات الأولية|دورة العمل التطوعي|دورة العلاقات العامة"
  },
  {
    "id": 58,
    "name": "محمود شاكر عويد بيروت",
    "course_count": 12,
    "total_hours": 135,
    "courses": "دورة تقنية SMART|دورة الإدارة الإلكترونية / الوورد|دورة الإدارة الإلكترونية / Power Point|دورة برنامج الإكسل|دورة مهارات الحماية الشخصية والمنشآت|دورة ضمان أمن المبنى|دورة مهارات التعامل مع المخاطر والتهديدات|دورة إدارة الأزمات|دورة الحماية السرية|دورة التعامل مع المظاهرات|دورة السلامة المهنية|دورة الإسعافات الأولية"
  },
  {
    "id": 59,
    "name": "مروان راشد ياسين حسين",
    "course_count": 8,
    "total_hours": 101,
    "courses": "دورة أخلاقيات العمل|دورة الالتزام والانضباط|دورة التشوه الإعلامي|دورة الولاء المؤسسي|دورة إدارة الفعاليات والمهرجانات|دورة الاستقطاب وبناء الشبكات|دورة الإشراف التدريبي|دورة إعداد المدربين (TOT)"
  },
  {
    "id": 60,
    "name": "مزهر خوام نصيف جاسم",
    "course_count": 14,
    "total_hours": 156,
    "courses": "دورة تقنية SMART|دورة الإدارة الإلكترونية / الوورد|دورة الإدارة الإلكترونية / Power Point|دورة برنامج الإكسل|دورة مهارات الحماية الشخصية والمنشآت|دورة ضمان أمن المبنى|دورة مهارات التعامل مع المخاطر والتهديدات|دورة إدارة الأزمات|دورة الحماية السرية|دورة التعامل مع المظاهرات|دورة السلامة المهنية|دورة الإسعافات الأولية|دورة العمل التطوعي|دورة العلاقات العامة"
  },
  {
    "id": 61,
    "name": "مصطفى عيدان هادي حسين",
    "course_count": 16,
    "total_hours": 243,
    "courses": "دورة تقنية SMART|دورة المخاطبات الإدارية|دورة أخلاقيات العمل|دورة الحفظ والأرشفة|دورة الإدارة الإلكترونية / الوورد|دورة الإدارة الإلكترونية / Power Point|دورة برنامج الإكسل|دورة التخطيط الاستراتيجي|دورة أسس القيادة|دورة القيادة الإشرافية|دورة الالتزام والانضباط|دورة الولاء المؤسسي|دورة الاستقطاب وبناء الشبكات|دورة الإشراف التدريبي|دورة إدارة الوقت وتنظيم الأولويات|دورة إعداد المدربين (TOT)"
  },
  {
    "id": 62,
    "name": "مصطفى محمد صاحب عبد الحسين",
    "course_count": 9,
    "total_hours": 90,
    "courses": "دورة المخاطبات الإدارية|دورة أخلاقيات العمل|دورة الحفظ والأرشفة|دورة الإدارة الإلكترونية / Power Point|دورة الالتزام والانضباط|دورة العمل التطوعي|دورة الولاء المؤسسي|دورة العلاقات العامة|دورة الاستقطاب وبناء الشبكات"
  },
  {
    "id": 63,
    "name": "نشوان حسين علي عبد المرشدي",
    "course_count": 12,
    "total_hours": 118,
    "courses": "دورة تقنية SMART|دورة أخلاقيات العمل|دورة الإدارة الإلكترونية / Power Point|دورة برنامج الإكسل|دورة الالتزام والانضباط|دورة السلامة المهنية|دورة الإسعافات الأولية|دورة السيطرة المخزنية|دورة العمل التطوعي|دورة الولاء المؤسسي|دورة العلاقات العامة|دورة إدارة الوقت وتنظيم الأولويات"
  },
  {
    "id": 64,
    "name": "وضاح فاروق خليل بارود",
    "course_count": 15,
    "total_hours": 154,
    "courses": "دورة إعداد التقارير|دورة المخاطبات الإدارية|دورة الحفظ والأرشفة|دورة مهارات الحماية الشخصية والمنشآت|دورة ضمان أمن المبنى|دورة مهارات التعامل مع المخاطر والتهديدات|دورة إدارة الأزمات|دورة الحماية السرية|دورة التعامل مع المظاهرات|دورة السلامة المهنية|دورة الإسعافات الأولية|دورة العمل التطوعي|دورة العلاقات العامة|دورة الاستقطاب وبناء الشبكات|دورة دراسة المدن"
  }
];

export const summaryData: Record<string, string | number> = {
  "إجمالي المنتسبين": 64,
  "إجمالي الدورات": 34,
  "إجمالي ساعات الدورات": 420,
  "الحد الأعلى لساعات المحاضرات يومياً": "3 ساعات لكل دورة",
  "الحد الأعلى النظري للدورة أسبوعياً": "15 ساعة إذا كان الأسبوع 5 أيام تدريب",
  "عدد المسارات/القاعات المقترحة": 2,
  "عدد الأسابيع الإجمالية حسب الخطة الممتدة": 22,
  "ملاحظة": "تم تحديث ساعات الدورات حسب التصحيحات الأخيرة، مع السماح باستمرار الدورة إلى أسبوع ثانٍ أو ثالث عند الحاجة، وبقاء التنفيذ بدورتين فعالتين كحد أقصى أسبوعياً."
};

export const topCoursesData: TopCourseRow[] = [
  {
    "course": "دورة العمل التطوعي",
    "count": 44,
    "ratio": 0.6875
  },
  {
    "course": "دورة العلاقات العامة",
    "count": 44,
    "ratio": 0.6875
  },
  {
    "course": "دورة الإدارة الإلكترونية / Power Point",
    "count": 43,
    "ratio": 0.671875
  },
  {
    "course": "دورة برنامج الإكسل",
    "count": 41,
    "ratio": 0.640625
  },
  {
    "course": "دورة الإدارة الإلكترونية / الوورد",
    "count": 37,
    "ratio": 0.578125
  },
  {
    "course": "دورة السلامة المهنية",
    "count": 37,
    "ratio": 0.578125
  },
  {
    "course": "دورة الإسعافات الأولية",
    "count": 37,
    "ratio": 0.578125
  },
  {
    "course": "دورة تقنية SMART",
    "count": 36,
    "ratio": 0.5625
  },
  {
    "course": "دورة أخلاقيات العمل",
    "count": 34,
    "ratio": 0.53125
  },
  {
    "course": "دورة الالتزام والانضباط",
    "count": 34,
    "ratio": 0.53125
  }
];

export const correctionsData: CorrectionRow[] = [
  {
    "id": 4,
    "name": "دورة أخلاقيات العمل",
    "corrected_hours": 9,
    "corrected_days": 3,
    "note": "تم اعتماد هذا الرقم حسب آخر تصحيح من المستخدم."
  },
  {
    "id": 6,
    "name": "دورة الإدارة الإلكترونية / الوورد",
    "corrected_hours": 15,
    "corrected_days": 5,
    "note": "تم اعتماد هذا الرقم حسب آخر تصحيح من المستخدم."
  },
  {
    "id": 7,
    "name": "دورة الإدارة الإلكترونية / Power Point",
    "corrected_hours": 15,
    "corrected_days": 5,
    "note": "تم اعتماد هذا الرقم حسب آخر تصحيح من المستخدم."
  },
  {
    "id": 8,
    "name": "دورة برنامج الإكسل",
    "corrected_hours": 15,
    "corrected_days": 5,
    "note": "تم اعتماد هذا الرقم حسب آخر تصحيح من المستخدم."
  },
  {
    "id": 12,
    "name": "دورة الالتزام والانضباط",
    "corrected_hours": 10,
    "corrected_days": 4,
    "note": "تم اعتماد هذا الرقم حسب آخر تصحيح من المستخدم."
  },
  {
    "id": 22,
    "name": "دورة إدارة وصيانة الآليات والمركبات",
    "corrected_hours": 14,
    "corrected_days": 5,
    "note": "تم اعتماد هذا الرقم حسب آخر تصحيح من المستخدم."
  }
];

export const totalHoursAfterCorrection = 420;
export const totalWeeks = 22;