export interface PermissionDef {
  key: string;
  label: string;
  description: string;
  example: string;
  category: string;
}

export interface PermissionCategory {
  id: string;
  label: string;
  icon: string;
}

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  { id: "dashboard", label: "لوحة القيادة", icon: "LayoutDashboard" },
  { id: "hr", label: "الموارد البشرية", icon: "Users" },
  { id: "employees", label: "الموظفين", icon: "Shield" },
  { id: "tasks", label: "المهام", icon: "ListTodo" },
  { id: "curriculum", label: "المناهج والعروض", icon: "BookOpen" },
  { id: "archive", label: "الأرشيف الإداري", icon: "FolderArchive" },
  { id: "courses", label: "التنفيذ التدريبي", icon: "GraduationCap" },
  { id: "training_plan", label: "الخطة التدريبية", icon: "CalendarDays" },
  { id: "evaluation", label: "التقييم والمتابعة", icon: "ClipboardCheck" },
  { id: "reports", label: "التقارير", icon: "BarChart3" },
  { id: "activity_log", label: "سجل النشاط", icon: "FileText" },
  { id: "users", label: "إدارة المستخدمين", icon: "UserCog" },
  { id: "settings", label: "الإعدادات", icon: "Settings" },
];

export const ALL_PERMISSIONS: PermissionDef[] = [
  // ─── لوحة القيادة ───
  { key: "view_dashboard", label: "عرض لوحة القيادة", description: "السماح بالدخول لصفحة لوحة القيادة الرئيسية", example: "المستخدم يرى لوحة القيادة عند فتح النظام", category: "dashboard" },
  { key: "view_attendance_section", label: "عرض الموقف اليومي", description: "عرض قسم الموقف اليومي في اللوحة (الحضور/الإجازات/الزمنيات)", example: "مدير القسم يرى من حاضر ومن مجاز اليوم", category: "dashboard" },
  { key: "view_pending_requests_section", label: "عرض الطلبات المعلقة", description: "عرض قسم الطلبات بانتظار الإجراء في اللوحة", example: "رئيس الشعبة يرى طلبات الإجازة التي تحتاج موافقته", category: "dashboard" },
  { key: "view_tasks_section", label: "عرض قسم المهام", description: "عرض قسم المهام في لوحة القيادة", example: "الموظف يرى مهامه المعلقة في اللوحة", category: "dashboard" },
  { key: "view_alerts_section", label: "عرض التنبيهات", description: "عرض تنبيهات النظام (مناهج بدون تقرير، طلبات معلقة، وثائق)", example: "المشرف يرى تنبيه: 3 مناهج بدون تقرير", category: "dashboard" },
  { key: "view_curriculum_stages_section", label: "عرض مراحل المنهاج", description: "عرض أشرطة مراحل المناهج والعروض في اللوحة", example: "رئيس شعبة المناهج يرى توزيع المناهج على المراحل", category: "dashboard" },
  { key: "view_achievement_section", label: "عرض نسبة الإنجاز", description: "عرض نسبة إنجاز الدورات التدريبية في اللوحة", example: "المدير يرى نسبة إنجاز الدورات 60%", category: "dashboard" },
  { key: "view_curriculum_quick_section", label: "عرض المناهج نظرة سريعة", description: "عرض قائمة المناهج المختصرة في اللوحة", example: "رئيس المناهج يرى قائمة بجميع المناهج وحالتها", category: "dashboard" },
  { key: "print_dashboard", label: "طباعة لوحة القيادة", description: "السماح باستخدام زر الطباعة في لوحة القيادة", example: "المدير يطبع تقرير الموقف اليومي", category: "dashboard" },

  // ─── الموارد البشرية ───
  { key: "view_hr", label: "عرض صفحة الموارد البشرية", description: "الدخول لصفحة الموارد البشرية وسجل الطلبات", example: "الموظف يفتح صفحة الموارد البشرية ليرى طلبياته", category: "hr" },
  { key: "view_daily_situation", label: "عرض الموقف اليومي", description: "عرض بطاقات الموقف اليومي (حضور/إجازات/زمنيات/واجبات/غيابات)", example: "رئيس الشعبة يرى توزيع الموظفين اليوم", category: "hr" },
  { key: "create_leave_request", label: "إنشاء طلب إجازة/زمنية", description: "رفع طلب إجازة اعتيادية أو مرضية أو طارئة أو زمنية أو واجب", example: "الموظف يطلب إجازة اعتيادية ليوم غد", category: "hr" },
  { key: "approve_hr_unit", label: "موافقة رئيس الشعبة", description: "الموافقة أو الرفض على مستوى رئيس الشعبة (المرحلة الأولى)", example: "رئيس شعبة الإعداد يوافق على طلب إجازة أحد أفراد شعبته", category: "hr" },
  { key: "approve_hr_dept", label: "الموافقة النهائية", description: "الموافقة أو الرفض النهائي على مستوى رئيس القسم أو المدير", example: "مدير القسم يوافق نهائياً على طلب الإجازة", category: "hr" },
  { key: "reject_hr", label: "رفض الطلبات", description: "رفض طلبات الإجازات والزمنيات على أي مستوى", example: "رئيس الشعبة يرفض طلب إجازة لعدم وجود بديل", category: "hr" },
  { key: "undo_hr_decision", label: "التراجع عن قرار", description: "إعادة طلب تمت الموافقة عليه أو رفضه إلى حالة المعلق", example: "المدير يتراجع عن موافقة بعد اكتشاف خطأ", category: "hr" },
  { key: "cancel_own_request", label: "إلغاء طلب شخصي", description: "إلغاء طلب إجازة/زمنية خاص بالمستخدم قبل الموافقة النهائية", example: "الموظف يلغي طلب إجازته بعد تغير خططه", category: "hr" },
  { key: "manager_override_hr", label: "تجاوز مسار الموافقة", description: "الموافقة المباشرة متجاوزاً مرحلة رئيس الشعبة (صلاحية مدير)", example: "المدير يوافق مباشرة على طلب دون انتظار رئيس الشعبة", category: "hr" },
  { key: "export_hr", label: "تصدير بيانات الموارد البشرية", description: "تصدير سجل الطلبات إلى Excel", example: "المشرف يصدّر جميع الطلبات لهذا الشهر", category: "hr" },
  { key: "change_attendance", label: "تغيير الحضور/الجدولة الأسبوعية", description: "تعديل حضور الموظف اليومي وجدولة الشِفت الأسبوعية", example: "رئيس الشعبة يضع موظفاً على شِفت 7×7 لهذا الأسبوع", category: "hr" },
  { key: "manage_employees", label: "إدارة الموظفين", description: "صلاحية شاملة لإضافة/تعديل/حذف الموظفين", example: "مدير القسم يدير قائمة الموظفين بالكامل", category: "employees" },

  { key: "print_hr", label: "طباعة صفحة الموارد البشرية", description: "استخدام زر الطباعة في صفحة الموارد البشرية", example: "المدير يطبع الموقف اليومي كتقرير ورقي", category: "hr" },

  // ─── الموظفين ───
  { key: "view_employees", label: "عرض صفحة الموظفين", description: "الدخول لصفحة إدارة الموظفين ورؤية بياناتهم", example: "مدير القسم يرى قائمة جميع الموظفين", category: "employees" },
  { key: "add_employee", label: "إضافة موظف", description: "إضافة موظف جديد للنظام مع بياناته الأساسية", example: "المشرف يضيف موظف جديد بعد تعيينه", category: "employees" },
  { key: "edit_employee", label: "تعديل بيانات موظف", description: "تعديل بيانات موظف موجود (الاسم، القسم، المنصب، الهاتف، الدوام)", example: "المشرف يغير منصب موظف بعد ترقيته", category: "employees" },
  { key: "delete_employee", label: "حذف موظف", description: "حذف موظف من النظام نهائياً (فقط للمدراء)", example: "المدير يحذف موظف استقال من العمل", category: "employees" },
  { key: "create_user_account", label: "إنشاء حساب مستخدم", description: "إنشاء حساب تسجيل دخول لموظف (بريد + كلمة مرور)", example: "المشرف ينشئ حساب لموظف جديد ليتمكن من الدخول", category: "employees" },
  { key: "export_employees", label: "تصدير بيانات الموظفين", description: "تصدير جدول الموظفين إلى Excel", example: "المشرف يصدّر قائمة الموظفين لملف Excel", category: "employees" },
  { key: "print_employees", label: "طباعة صفحة الموظفين", description: "استخدام زر الطباعة في صفحة الموظفين", example: "المشرف يطبع قائمة الموظفين كتقرير", category: "employees" },

  // ─── المهام ───
  { key: "view_tasks", label: "عرض صفحة المهام", description: "الدخول لصفحة المهام ورؤية قائمة المهام", example: "الموظف يفتح صفحة المهام ليرى ما أسند إليه", category: "tasks" },
  { key: "create_task", label: "إنشاء مهمة", description: "إنشاء مهمة جديدة وتعيينها لموظف أو وحدة", example: "رئيس الشعبة ينشئ مهمة كتابة منهج ويُسندها لأحد الموظفين", category: "tasks" },
  { key: "edit_task", label: "تعديل مهمة", description: "تعديل بيانات مهمة موجودة (العنوان، الوصف، المرحلة)", example: "رئيس الشعبة يغير عنوان مهمة لتكون أوضح", category: "tasks" },
  { key: "assign_task", label: "إسناد مهمة لموظف", description: "إسناد مهمة لموظف معين أو تسليمها من موظف لآخر", example: "رئيس الشعبة يُسند مهمة التدقيق للموظف أحمد", category: "tasks" },
  { key: "advance_task_stage", label: "ترقية مرحلة مهمة", description: "نقل مهمة من مرحلة للتالية (كتابة → نموذج → تدقيق → طباعة)", example: "رئيس المناهج ينقل مهمة من مرحلة الكتابة للتدقيق", category: "tasks" },
  { key: "handover_task", label: "تسليم مهمة", description: "تسليم مهمة من موظف لآخر مع ملاحظات", example: "أحمد يُسلّم مهمة التدقيق لمحمد لأنه سينتقل لعمل آخر", category: "tasks" },
  { key: "start_task", label: "بدء تنفيذ مهمة", description: "تحويل مهمة من معلقة إلى قيد التنفيذ", example: "الموظف يضغط 'بدء' ليبدأ العمل على المهمة المسندة إليه", category: "tasks" },
  { key: "complete_task", label: "إنهاء مهمة (فرد)", description: "تحديد مهمة كمكتملة (تنتقل لمراجعة رئيس الشعبة)", example: "الموظف ينهي مهمة الكتابة فينتقل لمراجعة رئيس الشعبة", category: "tasks" },
  { key: "approve_task", label: "اعتماد مهمة (رئيس)", description: "اعتماد مهمة كمكتملة نهائياً وإضافة نقاط إنجاز", example: "رئيس الشعبة يعتمد المهمة بعد التأكد من جودتها", category: "tasks" },
  { key: "comment_task", label: "إرسال ملاحظة على مهمة", description: "إرسال ملاحظة/تعليق على مهمة في حالة المراجعة (يرجعها للتنفيذ)", example: "رئيس الشعبة يكتب 'أضف مصادر' وترجع المهمة للتنفيذ", category: "tasks" },
  { key: "view_other_units_tasks", label: "عرض مهام الوحدات الأخرى", description: "رؤية مهام ليست في وحدة المستخدم (فقط المدراء ورؤساء الأقسام)", example: "المدير يرى مهام شعبة الإعداد وشعبة المناهج معاً", category: "tasks" },
  { key: "export_tasks", label: "تصدير بيانات المهام", description: "تصدير قائمة المهام إلى Excel", example: "المشرف يصدّر تقرير المهام المنجزة هذا الشهر", category: "tasks" },
  { key: "print_tasks", label: "طباعة صفحة المهام", description: "استخدام زر الطباعة في صفحة المهام", example: "المشرف يطبع قائمة المهام المعلقة", category: "tasks" },

  // ─── المناهج والعروض ───
  { key: "view_curriculum", label: "عرض صفحة المناهج والعروض", description: "الدخول لصفحة المناهج ورؤية قائمة المناهج ومراحلها", example: "رئيس المناهج يفتح صفحة المناهج ليرى حالة كل منهج", category: "curriculum" },
  { key: "add_curriculum", label: "إضافة منهج/عرض", description: "إضافة منهج جديد أو عرض تقديمي للنظام", example: "رئيس المناهج يضيف منهج 'مقدمة في الإدارة'", category: "curriculum" },
  { key: "edit_curriculum", label: "تعديل منهج/عرض", description: "تعديل بيانات منهج موجود أو عرض تقديمي", example: "رئيس المناهج يغير الفئة المستهدفة لمنهج معين", category: "curriculum" },
  { key: "upload_curriculum_file", label: "رفع ملف منهج", description: "رفع ملف PDF أو PPT كتقرير أو نسخة نهائية لمنهج", example: "الموظف يرفع ملف PDF للمنهج بعد الانتهاء من كتابته", category: "curriculum" },
  { key: "upload_presentation", label: "رفع عرض تقديمي", description: "تسجيل رفع عرض تقديمي (بوربوينت) لمنهج", example: "الموظف يرفع العرض التقديمي المرافق للمنهج", category: "curriculum" },
  { key: "import_curriculum_excel", label: "استيراد مناهج من Excel", description: "استيراد قائمة مناهج من ملف Excel خارجي", example: "رئيس المناهج يستورد 20 منهج من ملف Excel أرسله المشرف", category: "curriculum" },
  { key: "export_curriculum", label: "تصدير بيانات المناهج", description: "تصدير قائمة المناهج إلى Excel", example: "المشرف يصدّر جميع المناهج لملف Excel", category: "curriculum" },
  { key: "print_curriculum", label: "طباعة صفحة المناهج", description: "استخدام زر الطباعة في صفحة المناهج والعروض", example: "رئيس المناهج يطبع قائمة المناهج وحالاتها", category: "curriculum" },

  // ─── الأرشيف الإداري ───
  { key: "view_archive", label: "عرض الأرشيف الإداري", description: "الدخول لصفحة الأرشيف الإداري ورؤية الوثائق الرسمية والبحث فيها", example: "المشرف يرى الوثائق الواردة والصادرة في الأرشيف", category: "archive" },
  { key: "add_archive", label: "إضافة وثيقة للأرشيف", description: "إضافة وثيقة جديدة للأرشيف الإداري (واردة أو صادرة)", example: "المشرف يضيف كتاب وارد جديد للأرشيف", category: "archive" },
  { key: "edit_archive", label: "تعديل وثيقة في الأرشيف", description: "تعديل بيانات وثيقة موجودة في الأرشيف", example: "المشرف يعدل رقم وثيقة بعد اكتشاف خطأ", category: "archive" },
  { key: "delete_archive", label: "حذف وثيقة من الأرشيف", description: "حذف وثيقة من الأرشيف الإداري (فقط المدراء)", example: "المدير يحذف وثيقة مكررة", category: "archive" },
  { key: "upload_archive_attachment", label: "رفع مرفق وثيقة", description: "رفع ملف مرفق بوثيقة في الأرشيف (صورة أو PDF)", example: "المشرف يرفع صورة الكتاب الأصلي", category: "archive" },
  { key: "import_archive_excel", label: "استيراد وثائق من Excel", description: "استيراد قائمة وثائق من ملف Excel خارجي للأرشيف", example: "المشرف يستورد 50 وثيقة من ملف Excel", category: "archive" },
  { key: "export_archive", label: "تصدير بيانات الأرشيف", description: "تصدير بيانات الوثائق إلى Excel", example: "المشرف يصدّر جميع وثائق الأرشيف لملف Excel", category: "archive" },
  { key: "print_archive", label: "طباعة بيانات الأرشيف", description: "استخدام زر الطباعة في صفحة الأرشيف الإداري", example: "المشرف يطبع سجل الوثائق", category: "archive" },

  // ─── التنفيذ التدريبي ───
  { key: "view_courses", label: "عرض صفحة الدورات", description: "الدخول لصفحة الدورات التدريبية ورؤية تفاصيلها", example: "المشرف يرى قائمة الدورات النشطة والمخططة", category: "courses" },
  { key: "add_course", label: "إضافة دورة", description: "إنشاء دورة تدريبية جديدة في النظام", example: "المشرف ينشئ دورة 'مهارات القيادة' ويحدد موعدها", category: "courses" },
  { key: "edit_course", label: "تعديل دورة", description: "تعديل بيانات دورة موجودة (العنوان، المكان، التاريخ، الميزانية)", example: "المشرف يغير مكان الدورة من قاعة أ إلى قاعة ب", category: "courses" },
  { key: "delete_course", label: "حذف دورة", description: "حذف دورة تدريبية من النظام نهائياً (فقط المدراء)", example: "المدير يحذف دورة تم إلغاؤها", category: "courses" },
  { key: "update_trainee_status", label: "تحديث حالة متدرب", description: "تغيير حالة متدرب (اجتاز/لم يجتز/قيد الانتظار)", example: "المدرب يحدد أن المتدرب أحمد اجتاز الدورة", category: "courses" },
  { key: "export_courses", label: "تصدير بيانات الدورات", description: "تصدير قائمة الدورات إلى Excel", example: "المشرف يصدّر تقرير الدورات المنتهية", category: "courses" },
  { key: "print_courses", label: "طباعة صفحة الدورات", description: "استخدام زر الطباعة في صفحة الدورات التدريبية", example: "المشرف يطبع قائمة الدورات النشطة", category: "courses" },

  // ─── الخطة التدريبية ───
  { key: "view_training_plan", label: "عرض الخطة التدريبية", description: "الدخول لصفحة الخطة التدريبية الممتدة ورؤية الجداول والبيانات", example: "المشرف يرى الخطة الأسبوعية وتوزيع الدورات", category: "training_plan" },
  { key: "export_training_plan", label: "تصدير الخطة التدريبية", description: "تصدير بيانات الخطة التدريبية إلى Excel", example: "المشرف يصدّر الخطة الأسبوعية لملف Excel", category: "training_plan" },
  { key: "print_training_plan", label: "طباعة الخطة التدريبية", description: "استخدام زر الطباعة في صفحة الخطة التدريبية", example: "المشرف يطبع الخطة الأسبوعية", category: "training_plan" },
  { key: "import_training_plan", label: "استيراد خطة تدريبية من Excel", description: "استيراد بيانات الخطة التدريبية أو بيانات المحافظات من ملف Excel", example: "المشرف يستورد بيانات الدورات من ملف Excel", category: "training_plan" },
  { key: "add_governorate_training", label: "إضافة بيانات محافظة", description: "إضافة دورة تدريبية مرتبطة بمحافظة يدوياً", example: "المشرف يضيف دورة تقنية SMART لمحافظة بابل", category: "training_plan" },
  { key: "edit_governorate_training", label: "تعديل بيانات محافظة", description: "تعديل أو حذف بيانات الدورات المرتبطة بالمحافظات", example: "المشرف يعدّل تاريخ بدء دورة في بغداد", category: "training_plan" },
  { key: "record_followup", label: "تسجيل متابعة", description: "تسجيل حالة الالتزام والملاحظات لكل محافظة", example: "رئيس الشعبة يسجل أن بابل ملتزمة بالجدول", category: "training_plan" },
  { key: "manage_followup", label: "إدارة إشعارات المتابعة", description: "تخصيص إشعارات المتابعة وتكليف أفراد بالمتابعة (للمدير والأدمن)", example: "المدير يكلف أحمد بمتابعة دورات بابل أسبوعياً", category: "training_plan" },

  // ─── التقييم والمتابعة ───
  { key: "view_evaluation", label: "عرض صفحة التقييم", description: "الدخول لصفحة التقييم والمتابعة ورؤية أنواع التقييم", example: "المشرف يرى نسبة إنجاز التقييمات", category: "evaluation" },
  { key: "export_evaluation", label: "تصدير بيانات التقييم", description: "تصدير بيانات التقييم إلى Excel", example: "المشرف يصدّر تقرير التقييمات", category: "evaluation" },
  { key: "print_evaluation", label: "طباعة صفحة التقييم", description: "استخدام زر الطباعة في صفحة التقييم والمتابعة", example: "المشرف يطبع تقرير المتابعة", category: "evaluation" },

  // ─── التقارير ───
  { key: "view_reports", label: "عرض صفحة التقارير", description: "الدخول لصفحة التقارير والإحصائيات", example: "المدير يرى تقارير الأداء التدريبي", category: "reports" },
  { key: "export_reports", label: "تصدير التقارير", description: "تصدير التقارير والإحصائيات إلى Excel", example: "المدير يصدّر تقرير الإنجاز الشهري", category: "reports" },
  { key: "print_reports", label: "طباعة التقارير", description: "استخدام زر الطباعة في صفحة التقارير", example: "المدير يطبع تقرير الإنجاز", category: "reports" },

  // ─── سجل النشاط ───
  { key: "view_activity_log", label: "عرض سجل النشاط", description: "الدخول لصفحة سجل النشاط ورؤية جميع العمليات المسجلة", example: "رئيس الشعبة يرى من قام بتعديل منهج ومتى", category: "activity_log" },
  { key: "export_activity_log", label: "تصدير سجل النشاط", description: "تصدير سجل النشاط إلى Excel", example: "المشرف يصدّر سجل العمليات للشهر الماضي", category: "activity_log" },
  { key: "print_activity_log", label: "طباعة سجل النشاط", description: "استخدام زر الطباعة في صفحة سجل النشاط", example: "المشرف يطبع سجل العمليات", category: "activity_log" },

  // ─── إدارة المستخدمين ───
  { key: "view_users", label: "عرض المستخدمين", description: "رؤية قائمة المستخدمين في تبويب المستخدمين بالإعدادات", example: "المشرف يرى قائمة المستخدمين وأدوارهم", category: "users" },
  { key: "add_user", label: "إضافة مستخدم", description: "إنشاء حساب مستخدم جديد (موظف + حساب دخول)", example: "المشرف ينشئ حساب لموظف جديد", category: "users" },
  { key: "delete_user", label: "حذف مستخدم", description: "حذف مستخدم من النظام", example: "المدير يحذف حساب موظف استقال", category: "users" },

  // ─── المراسلات ───
  { key: "add_correspondence", label: "إضافة مراسلة", description: "إنشاء مراسلة جديدة", example: "الموظف ينشئ كتاب صادر", category: "correspondence" },
  { key: "edit_correspondence", label: "تعديل مراسلة", description: "تعديل بيانات المراسلة", example: "المشرف يعدل موضوع مراسلة", category: "correspondence" },
  { key: "delete_correspondence", label: "حذف مراسلة", description: "حذف مراسلة من السجل", example: "المشرف يحذف مراسلة خاطئة", category: "correspondence" },
  { key: "import_correspondence_excel", label: "استيراد مراسلات Excel", description: "استيراد مراسلات من ملف Excel", example: "المشرف يستورد ملف مراسلات تاريخية", category: "correspondence" },
  { key: "upload_correspondence_attachment", label: "رفع مرفق مراسلة", description: "رفع ملف مرفق بالمراسلة", example: "الموظف يرفع صورة كتاب", category: "correspondence" },

  // ─── الإعدادات ───
  { key: "manage_permissions", label: "إدارة الصلاحيات", description: "الدخول لتبويب الصلاحيات في الإعدادات وتعديل صلاحيات المستخدمين", example: "المدير يفتح تبويب الصلاحيات ويمنح موظف صلاحية إضافة دورات", category: "settings" },
  { key: "backup_data", label: "النسخ الاحتياطي", description: "تحميل نسخة احتياطية من جميع بيانات النظام", example: "المدير يحمّل نسخة احتياطية قبل صيانة النظام", category: "settings" },
  { key: "reset_data", label: "إعادة تعيين البيانات", description: "حذف جميع البيانات والعودة للبيانات الافتراضية (خطر!)", example: "المدير يعيد تعيين البيانات بعد فترة تجريبية", category: "settings" },
];

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ALL_PERMISSIONS.map(p => p.key),
  dept_manager: ALL_PERMISSIONS.map(p => p.key).filter(k => !["manage_permissions", "reset_data"].includes(k)),
  unit_head: [
    "view_dashboard", "view_attendance_section", "view_pending_requests_section", "view_tasks_section", "print_dashboard",
    "view_hr", "view_daily_situation", "create_leave_request", "approve_hr_unit", "reject_hr", "undo_hr_decision", "export_hr", "print_hr", "change_attendance",
    "view_tasks", "create_task", "assign_task", "advance_task_stage", "handover_task", "approve_task", "comment_task", "view_other_units_tasks", "export_tasks", "print_tasks",
    "view_curriculum", "export_curriculum", "print_curriculum",
    "view_training_plan", "export_training_plan", "print_training_plan",
    "import_training_plan", "add_governorate_training", "edit_governorate_training",
    "record_followup", "manage_followup",
    "view_activity_log", "export_activity_log", "print_activity_log",
    "view_archive", "add_archive", "edit_archive", "export_archive",
  ],
  prep_unit_head: [
    "view_dashboard", "view_attendance_section", "view_pending_requests_section", "view_tasks_section", "print_dashboard",
    "view_hr", "view_daily_situation", "create_leave_request", "approve_hr_unit", "reject_hr", "undo_hr_decision", "export_hr", "print_hr", "change_attendance",
    "view_tasks", "create_task", "assign_task", "advance_task_stage", "handover_task", "approve_task", "comment_task", "export_tasks", "print_tasks",
    "view_courses", "add_course", "edit_course", "update_trainee_status", "export_courses", "print_courses",
    "view_archive", "add_archive", "edit_archive", "upload_archive_attachment", "export_archive",
    "view_training_plan", "export_training_plan", "print_training_plan",
    "record_followup",
    "view_reports", "export_reports", "print_reports",
    "view_activity_log", "export_activity_log", "print_activity_log",
  ],
  curriculum_unit_head: [
    "view_dashboard", "view_curriculum_stages_section", "view_achievement_section", "view_curriculum_quick_section", "view_tasks_section", "view_alerts_section", "print_dashboard",
    "view_hr", "view_daily_situation", "create_leave_request", "approve_hr_unit", "reject_hr", "undo_hr_decision", "change_attendance", "export_hr",
    "view_tasks", "create_task", "assign_task", "advance_task_stage", "handover_task", "approve_task", "comment_task", "export_tasks", "print_tasks",
    "view_curriculum", "add_curriculum", "edit_curriculum", "upload_curriculum_file", "upload_presentation", "import_curriculum_excel", "export_curriculum", "print_curriculum",
    "view_training_plan", "export_training_plan", "print_training_plan",
    "import_training_plan", "add_governorate_training", "edit_governorate_training",
    "view_evaluation", "export_evaluation", "print_evaluation",
    "record_followup", "manage_followup",
    "view_reports", "export_reports", "print_reports",
    "view_activity_log", "export_activity_log", "print_activity_log",
  ],
  trainer: [
    "view_dashboard", "view_tasks_section", "view_attendance_section", "print_dashboard",
    "view_hr", "view_daily_situation", "create_leave_request", "cancel_own_request",
    "view_tasks", "start_task", "complete_task",
    "view_courses",
    "view_training_plan",
    "view_evaluation",
    "record_followup",
  ],
  curriculum_individual: [
    "view_dashboard", "view_attendance_section", "view_tasks_section", "print_dashboard",
    "view_hr", "view_daily_situation", "create_leave_request", "cancel_own_request", "export_hr", "print_hr",
    "view_tasks", "start_task", "complete_task", "advance_task_stage", "export_tasks", "print_tasks",
    "view_curriculum",
    "view_training_plan", "view_evaluation", "view_reports", "record_followup",
    "add_correspondence", "upload_correspondence_attachment",
  ],
  prep_individual: [
    "view_dashboard", "view_attendance_section", "view_pending_requests_section", "view_tasks_section", "print_dashboard",
    "view_hr", "view_daily_situation", "create_leave_request", "cancel_own_request", "export_hr", "print_hr",
    "view_tasks", "start_task", "complete_task", "advance_task_stage", "export_tasks", "print_tasks",
    "view_courses",
    "view_archive",
    "view_training_plan", "view_reports",
    "add_correspondence", "upload_correspondence_attachment",
  ],
  individual: [
    "view_dashboard", "view_attendance_section", "view_pending_requests_section", "view_tasks_section", "print_dashboard",
    "view_hr", "view_daily_situation", "create_leave_request", "cancel_own_request", "export_hr", "print_hr",
    "view_tasks", "start_task", "complete_task", "advance_task_stage", "export_tasks", "print_tasks",
    "view_curriculum", "view_archive", "view_courses",
    "view_training_plan", "view_evaluation", "view_reports", "record_followup",
    "add_correspondence", "upload_correspondence_attachment",
  ],
};

export function getPermissionsForRoles(roles: string[]): string[] {
  const perms = new Set<string>();
  roles.forEach(r => {
    const rolePerms = ROLE_PERMISSIONS[r] || ROLE_PERMISSIONS.individual;
    rolePerms.forEach(p => perms.add(p));
  });
  return Array.from(perms);
}

export function getEffectivePermissions(userId: string, roles: string[]): string[] {
  try {
    const stored = localStorage.getItem("tms_custom_permissions");
    if (stored) {
      const custom: Record<string, string[]> = JSON.parse(stored);
      if (custom[userId]) return custom[userId];
    }
  } catch { /* ignore */ }
  return getPermissionsForRoles(roles);
}

export function hasPermission(userId: string, roles: string[], permissionKey: string): boolean {
  return getEffectivePermissions(userId, roles).includes(permissionKey);
}

export const PERMISSION_KEY_SET = new Set(ALL_PERMISSIONS.map(p => p.key));

export function getPermissionDef(key: string): PermissionDef | undefined {
  return ALL_PERMISSIONS.find(p => p.key === key);
}
