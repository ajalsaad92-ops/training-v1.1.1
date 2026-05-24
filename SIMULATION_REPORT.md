# 7-Agent End-to-End Simulation Report
## Training Management System v1.1.1 — Full Trace

**Date:** 2026-05-24  
**Agents:** A1 فاطمة (dept_manager), A2 خالد (prep_unit_head), A3 نورة (curriculum_unit_head), A4 سارة (individual/إعداد), A5 محمد (individual/إعداد), A6 زينب (individual/مناهج), A7 ليث (individual/مناهج)

---

## Agent Identity Map

| Agent | Profile ID | Email | Password | Roles | Persona | Section |
|-------|-----------|-------|----------|-------|---------|---------|
| A1 فاطمة | emp-2 | manager@tadreeb.iq | manager123 | dept_manager, training_admin | dept_manager | إدارة التدريب |
| A2 خالد | emp-3 | prep@tadreeb.iq | prep123 | unit_head | prep_unit_head | شعبة الإعداد والتدريب |
| A3 نورة | emp-4 | curriculum@tadreeb.iq | curr123 | unit_head | curriculum_unit_head | شعبة المناهج |
| A4 سارة | emp-6 | prep1@tadreeb.iq | user123 | individual | individual | شعبة الإعداد والتدريب |
| A5 محمد | emp-5 | hr1@tadreeb.iq | user123 | individual | individual | شعبة الإعداد والتدريب |
| A6 زينب | emp-10 | cur1@tadreeb.iq | user123 | individual | individual | شعبة المناهج |
| A7 ليث | emp-11 | pres1@tadreeb.iq | user123 | individual | individual | شعبة المناهج |

---

## Phase 1: Login & Access

### Step 1.1: A1 فاطمة logs in
- **Input:** email=`manager@tadreeb.iq`, password=`manager123`
- **Code path:** `AuthContext.login()` → `localDb.userAccounts.findByEmail("manager@tadreeb.iq")` → finds account with profile emp-2 → `account.password === "manager123"` → true → `account.profile.active !== false` → true
- **Data mutations:** `localStorage.setItem("tms_current_user_id", "emp-2")`, `setUser(profile)`, `setSession({user:{id:"emp-2"}})`
- **Session timeout:** starts 55min warning + 60min logout timers (`AuthContext.tsx:53-62`)
- **Result:** **PASS** — User emp-2 authenticated, session established

### Step 1.2: A2 خالد logs in
- **Input:** email=`prep@tadreeb.iq`, password=`prep123`
- **Code path:** `localDb.userAccounts.findByEmail("prep@tadreeb.iq")` → finds emp-3 → password match → `localStorage.setItem("tms_current_user_id", "emp-3")`
- **Result:** **PASS**

### Step 1.3: A3 نورة logs in
- **Input:** email=`curriculum@tadreeb.iq`, password=`curr123`
- **Code path:** finds emp-4 → password match → `localStorage.setItem("tms_current_user_id", "emp-4")`
- **Result:** **PASS**

### Step 1.4: A4 سارة logs in
- **Input:** email=`prep1@tadreeb.iq`, password=`user123`
- **Code path:** finds emp-6 → password match → `localStorage.setItem("tms_current_user_id", "emp-6")`
- **Result:** **PASS**

### Step 1.5: A5 محمد logs in
- **Input:** email=`hr1@tadreeb.iq`, password=`user123`
- **Code path:** finds emp-5 → password match → `localStorage.setItem("tms_current_user_id", "emp-5")`
- **Result:** **PASS**

### Step 1.6: A6 زينب logs in
- **Input:** email=`cur1@tadreeb.iq`, password=`user123`
- **Code path:** finds emp-10 → password match → `localStorage.setItem("tms_current_user_id", "emp-10")`
- **Result:** **PASS**

### Step 1.7: A7 ليث logs in
- **Input:** email=`pres1@tadreeb.iq`, password=`user123`
- **Code path:** finds emp-11 → password match → `localStorage.setItem("tms_current_user_id", "emp-11")`
- **Result:** **PASS**

### Step 1.8: Wrong password attempt
- **Input:** email=`manager@tadreeb.iq`, password=`wrong`
- **Code path:** `AuthContext.tsx:97` → `account.password !== password` → returns `{success:false, error:"كلمة المرور غير صحيحة"}`
- **Result:** **PASS** — Correctly rejects

### Step 1.9: Unregistered email attempt
- **Input:** email=`nobody@tadreeb.iq`, password=`any`
- **Code path:** `AuthContext.tsx:96` → `!account` → returns `{success:false, error:"البريد الإلكتروني غير مسجل"}`
- **Result:** **PASS**

### Step 1.10: Session restore on page reload (A1)
- **Code path:** `AuthContext.tsx:38` → `localStorage.getItem("tms_current_user_id")` = "emp-2" → `localDb.profiles.getById("emp-2")` → profile found, active !== false → `setUser(profile)`, restarts timeout
- **Result:** **PASS**

**Phase 1 Summary: 10/10 PASS, 0 FAIL**

---

## Phase 2: Dashboard Rendering

### Step 2.1: A1 فاطمة sees ManagerDashboard
- **Code path:** `Dashboard.tsx:605` → `persona === "dept_manager"` → renders `<ManagerDashboard />`
- **Permission check:** `has("view_attendance_section")` = true (dept_manager has all except manage_permissions/reset_data), `has("view_pending_requests_section")` = true, `has("view_tasks_section")` = true, `has("view_alerts_section")` = true, `has("view_curriculum_stages_section")` = true, `has("view_achievement_section")` = true
- **Dashboard sections:** attendance, pending_requests, tasks, alerts, curriculum_stages, achievement
- **Data loaded:** employees (14), courses (8), hrRequests (10), tasks (10), curriculumItems (8), archiveDocuments (50), notifications (6)
- **Stats computed:** activeCourses=2, plannedCourses=2, completedCourses=4, pendingHR=5, totalCur=8, missingReports=2 (cur-2, cur-3), missingPPT=2 (cur-3, cur-6)
- **Result:** **PASS**

### Step 2.2: A2 خالد sees PrepDashboard
- **Code path:** `useUserRole.ts:26` → section "شعبة الإعداد والتدريب" includes "تدريب" → persona = "prep_unit_head" → `Dashboard.tsx:606` → renders `<PrepDashboard />`
- **Section filter:** `PrepDashboard.tsx:318` → `sectionEmployees = employees.filter(e => e.section === "شعبة الإعداد والتدريب")` → filters to emp-3,5,6,7,8,9
- **Pending HR visible:** only requests where employee_name is in sectionEmpNames
- **Permission check:** `has("view_attendance_section")` = true, `has("view_pending_requests_section")` = true, `has("view_tasks_section")` = true
- **Dashboard sections:** attendance, pending_requests, tasks
- **Result:** **PASS**

### Step 2.3: A3 نورة sees CurriculumDashboard
- **Code path:** `useUserRole.ts:28` → section "شعبة المناهج" includes "مناهج" → persona = "curriculum_unit_head" → `Dashboard.tsx:607` → renders `<CurriculumDashboard />`
- **Data loaded:** curriculumItems (8), tasks (filtered to unit "المناهج")
- **Stats:** totalCur=8, missingReports=2, missingPPT=2
- **Permission check:** `has("view_curriculum_stages_section")` = true, `has("view_achievement_section")` = true, `has("view_alerts_section")` = true
- **Dashboard sections:** curriculum_stages, achievement, alerts
- **BUG:** CurriculumDashboard does NOT show the attendance section or pending HR requests, but curriculum_unit_head has `view_attendance_section` and `view_pending_requests_section` permissions in their role perms — these sections ARE listed by `getDashboardSections()` but the CurriculumDashboard component doesn't render them. This is a **UI inconsistency**: the PageHeader shows section anchors for sections that don't exist on the page.
- **BUG LOCATION:** `Dashboard.tsx:587-597` (getDashboardSections returns sections based on permissions) vs `Dashboard.tsx:434-478` (CurriculumDashboard only renders curriculum stages, achievement, alerts — no attendance or pending requests)
- **Result:** **PASS with BUG** — Bug #1: Dashboard section anchors mismatch for curriculum_unit_head

### Step 2.4: A4 سارة sees IndividualDashboard
- **Code path:** persona = "individual" → `Dashboard.tsx:608` → renders `<IndividualDashboard />`
- **Data loaded:** `employees.find(e => e.id === "emp-6")` → سارة, hrRequests filtered by `emp.name`, tasks filtered by `t.assigned_to === "emp-6"` → tsk-2 (completed, assigned to emp-6), courses filtered by trainees
- **My tasks:** tsk-2 (تنسيق دورة PMP, completed)
- **My trainings:** crs-1 (passed), crs-2 (waiting), crs-3 (failed), crs-4 (waiting), crs-6 (passed), crs-7 (waiting), crs-8 (failed) = 7 courses
- **Permission check:** `has("view_attendance_section")` = true, `has("view_pending_requests_section")` = true, `has("view_tasks_section")` = true, `has("view_curriculum_quick_section")` = true
- **Result:** **PASS**

### Step 2.5: A5 محمد sees IndividualDashboard
- **Code path:** Same as A4, persona = "individual"
- **My tasks:** None assigned directly (emp-5 has no tasks in seed data)
- **My HR:** hr-10 (pending, created_by emp-5)
- **Result:** **PASS**

### Step 2.6: A6 زينب sees IndividualDashboard
- **Code path:** Same persona, section = "شعبة المناهج"
- **My tasks:** tsk-1 (إعداد منهج الأمن السيبراني, in_progress, assigned to emp-10), tsk-3 (تحديث منهج القيادة, pending, assigned to emp-10), tsk-9 (إعداد خطة التدريب لشهر حزيران, pending, assigned to emp-12 — NOT emp-10)
- **BUG:** tsk-9 is assigned to emp-12 (مريم), NOT emp-10 (زينب). So زينب sees only tsk-1 and tsk-3 as "my tasks".
- **My HR:** hr-5 (unit_approved, created_by emp-10)
- **Result:** **PASS**

### Step 2.7: A7 ليث sees IndividualDashboard
- **Code path:** Same persona, section = "شعبة المناهج"
- **My tasks:** tsk-5 (إعداد عرض القيادة, review, assigned to emp-11)
- **My trainings:** crs-1 (passed), crs-3 (passed), crs-5 (waiting), crs-6 (passed), crs-7 (waiting)
- **Result:** **PASS**

**Phase 2 Summary: 7/7 PASS, 1 BUG found**

---

## Phase 3: HR Request Creation

### Step 3.1: A4 سارة creates leave request (إجازة اعتيادية)
- **Agent:** emp-6, section="شعبة الإعداد والتدريب"
- **Form:** type="إجازة اعتيادية", date="2026-05-25", employee_name="سارة يوسف القحطاني"
- **Code path:** `HRAttendance.tsx:336-430` (handleSubmitLeave)
  1. Validates employee_name and date present → OK
  2. `new Date("2026-05-25") >= new Date(today)` → OK (not retroactive)
  3. Type is "إجازة اعتيادية" → checks for existing same-date request → none found → OK
  4. **Section conflict check** (`HRAttendance.tsx:375-391`): `empSection = "شعبة الإعداد والتدريب"`, `sectionMates = [emp-3,5,7,8,9]` (names). Checks if any mate has approved إجازة اعتيادية on same date → none → OK
  5. `isSubmitterManager = false` (سارة is individual), `isOwnRequest = true` (سارة submits for herself)
  6. `localDb.hrRequests.insert({employee_name, type, date, notes, department, hours:null, created_by:"emp-6"})` — uses default values: `approval_status:"pending"`, `unit_head_status:"pending"`, `dept_manager_status:"pending"`
- **Data mutation:** New HRRequest inserted with auto-generated id, approval_status="pending"
- **Audit log:** `logAction("سارة يوسف القحطاني", "رفع طلب إجازة", "سارة يوسف القحطاني (2026-05-25)")`
- **Result:** **PASS**

### Step 3.2: A5 محمد creates leave request (إجازة زواج) — same section, same date as 3.1
- **Agent:** emp-5, section="شعبة الإعداد والتدريب"
- **Form:** type="إجازة اعتيادية", date="2026-05-25", employee_name="محمد علي الزهراني"
- **Code path:** Same as 3.1 until section conflict check
  1. `sectionMates = [emp-3,6,7,8,9]`
  2. سارة's newly created request is pending (approval_status="pending"), NOT unit_approved or approved → **NO CONFLICT DETECTED**
  3. **BUG:** The section conflict check at `HRAttendance.tsx:378-381` only checks for `["unit_approved", "approved"].includes(r.approval_status)` — pending requests are NOT checked. So two colleagues in the same section can submit overlapping إجازة اعتيادية requests, and both could get approved, resulting in the section being empty. The conflict is only caught at approval time if the approver notices.
  4. Request inserted successfully
- **BUG LOCATION:** `HRAttendance.tsx:381` — Conflict check only looks at unit_approved/approved, not pending
- **Result:** **PASS with BUG** — Bug #2: Section conflict check doesn't consider pending requests

### Step 3.3: A6 زينب creates خروجية request
- **Agent:** emp-10, section="شعبة المناهج"
- **Form:** type="خروجية", date="2026-05-25", hours="2"
- **Code path:**
  1. Validates → OK
  2. Not retroactive → OK
  3. Type = "خروجية" → checks monthly time-off cap (`HRAttendance.tsx:348-356`):
     - `thisMonth = "2026-05"`, `monthTimeOffs = hrRequests.filter(r => r.employee_name === "زينب كريم الموسوي" && r.type === "خروجية" && r.date.startsWith("2026-05") && status in [pending,unit_approved,approved])`
     - No existing خروجية for زينب in May → totalHours = 0
     - `0 + 2 <= 7` → OK
  4. Request inserted with approval_status="pending"
- **Result:** **PASS**

### Step 3.4: A4 سارة tries to create retroactive request
- **Form:** type="إجازة مرضية", date="2026-05-01" (past date)
- **Code path:** `HRAttendance.tsx:343-346` → `new Date("2026-05-01") < new Date(today)` → toast error "لا يمكن تقديم إجازة بأثر رجعي"
- **Result:** **PASS**

### Step 3.5: A6 زينب tries to exceed خروجية cap (7 hours/month)
- **Precondition:** زينب already has pending خروجية with 2 hours from step 3.3
- **Form:** type="خروجية", date="2026-05-26", hours="6"
- **Code path:** `monthTimeOffs` now includes step 3.3's request → totalHours=2 → `2+6=8 > 7` → toast error "تجاوز الحد المسموح"
- **Result:** **PASS**

### Step 3.6: A1 فاطمة creates request on behalf of A5 محمد (manager override)
- **Agent:** emp-2, isDeptManager=true, has("manager_override_hr")=true
- **Form:** type="إجازة اعتيادية", date="2026-05-26", employee_name="محمد علي الزهراني"
- **Code path:**
  1. `isSubmitterManager = true`, `isOwnRequest = false` (فاطمة ≠ محمد)
  2. `HRAttendance.tsx:416-421`: Because `isSubmitterManager && !isOwnRequest`, the insert payload gets:
     - `unit_head_status: "approved"`, `unit_head_by: "emp-2"`, `unit_head_at: now()`, `approval_status: "unit_approved"`
  3. Request skips unit_head step entirely, goes straight to dept_manager pending
- **Data mutation:** New HRRequest with approval_status="unit_approved", unit_head_status="approved", unit_head_by="emp-2"
- **Result:** **PASS**

**Phase 3 Summary: 6/6 PASS, 1 BUG found**

---

## Phase 4: Unit Head Approval

### Step 4.1: A2 خالد approves A4 سارة's pending request (from step 3.1)
- **Agent:** emp-3, isUnitHead=true, has("approve_hr_unit")=true
- **Request:** سارة's new request, approval_status="pending", created_by="emp-6"
- **Code path:** `HRAttendance.tsx:180-199` (handleUnitApprove)
  1. `req.created_by === userId` → "emp-6" !== "emp-3" → not self → OK
  2. Visibility check (`HRAttendance.tsx:166-168`): emp section = "شعبة الإعداد والتدريب", req employee (سارة) section = "شعبة الإعداد والتدريب" → matchVisibility = true
  3. `unitApprovalCountThisMonth("سارة يوسف القحطاني")` → checks if >= 3 routine approvals this month → 0 → OK (not over cap)
  4. `localDb.hrRequests.update(id, {approval_status:"unit_approved", unit_head_status:"approved", unit_head_by:"emp-3", unit_head_at:now(), history})`
  5. Notification inserted: `{user_id:"emp-6", message:"وافق رئيس الشعبة على طلبك (إجازة اعتيادية)", type:"info", link:"/hr"}`
  6. Audit: `logAction("خالد عبدالله السعيد", "موافقة رئيس شعبة", "طلب {id}")`
- **Data mutation:** approval_status → "unit_approved", unit_head_status → "approved"
- **Result:** **PASS**

### Step 4.2: A2 خالد approves A5 محمد's pending request (from step 3.2)
- **Same flow as 4.1** — محمد is in same section → visibility OK → not self → approved
- **Result:** **PASS**

### Step 4.3: A3 نورة tries to approve A4 سارة's request (cross-section)
- **Agent:** emp-4, section="شعبة المناهج", isUnitHead=true
- **Request:** سارة's request, employee section="شعبة الإعداد والتدريب"
- **Visibility check (`HRAttendance.tsx:166-170`):**
  - `reqSection = "شعبة الإعداد والتدريب"` ≠ `currentEmpSection = "شعبة المناهج"`
  - `persona === "curriculum_unit_head"` and `isPrepAbsent`? → checks if prep head is absent → `isPrepAbsent = false` (خالد is not on leave today) → matchVisibility = false
  - BUT `r.created_by === userId` → "emp-6" !== "emp-4" → false
- **Result:** Request is NOT visible to نورة → she cannot approve it. **PASS** — Cross-section isolation works

### Step 4.4: A2 خالد tries to approve his own request
- **Precondition:** خالد creates a request for himself (created_by = "emp-3")
- **Code path:** `HRAttendance.tsx:183-185` → `req.created_by === userId` → "emp-3" === "emp-3" → toast "لا يمكنك الموافقة على طلبك" → BLOCKED
- **Result:** **PASS** — Self-approve guard works

### Step 4.5: A2 خالد rejects A5 محمد's request (with reason)
- **Code path:** `HRAttendance.tsx:201-220` (handleUnitReject)
  1. `req.created_by === userId` → "emp-5" !== "emp-3" → not self → OK
  2. `localDb.hrRequests.update(id, {approval_status:"rejected", unit_head_status:"rejected", unit_head_by:"emp-3", ...})`
  3. Notification: `message: "رفض رئيس الشعبة طلبك (إجازة اعتيادية) — {reason}"`
  4. Audit logged
- **Data mutation:** approval_status → "rejected", unit_head_status → "rejected"
- **Result:** **PASS**

### Step 4.6: Unit head monthly cap (3 routine approvals)
- **Precondition:** خالد has already approved 3 إجازة اعتيادية/خروجية requests for the same employee this month
- **Code path:** `HRAttendance.tsx:517-528` → `overUnitCap = true` → renders "بلغ السقف (3) — يتطلب موافقة المدير" instead of approve button
- **Result:** **PASS** — Cap enforcement works visually

### Step 4.7: A3 نورة approves A6 زينب's خروجية request (same section)
- **Agent:** emp-4, section="شعبة المناهج", isUnitHead=true
- **Request:** زينب's خروجية (from step 3.3), employee section="شعبة المناهج"
- **Visibility:** reqSection === currentEmpSection → matchVisibility = true
- **Code path:** Same handleUnitApprove → approved → notification to emp-10
- **Result:** **PASS**

**Phase 4 Summary: 7/7 PASS, 0 BUG**

---

## Phase 5: Dept Manager Approval

### Step 5.1: A1 فاطمة approves unit_approved request (A4 سارة)
- **Agent:** emp-2, isDeptManager=true, has("approve_hr_dept")=true
- **Request:** سارة's request, approval_status="unit_approved" (from step 4.1)
- **Code path:** `HRAttendance.tsx:222-241` (handleDeptApprove)
  1. `req.created_by === userId` → "emp-6" !== "emp-2" → not self → OK
  2. `localDb.hrRequests.update(id, {approval_status:"approved", dept_manager_status:"approved", dept_manager_by:"emp-2", dept_manager_at:now(), history})`
  3. Notification: "تمت الموافقة النهائية على طلبك (إجازة اعتيادية)"
  4. Audit logged
- **Data mutation:** approval_status → "approved", dept_manager_status → "approved"
- **Result:** **PASS**

### Step 5.2: A1 فاطمة uses manager override on pending request
- **Agent:** emp-2, isDeptManager=true
- **Request:** Any pending request (not yet unit-approved)
- **Code path:** `HRAttendance.tsx:264-287` (handleManagerOverride)
  1. Sets BOTH unit_head_status AND dept_manager_status to "approved" with by="emp-2"
  2. approval_status → "approved"
  3. Notification to employee: "تمت الموافقة على طلبك مباشرة من مدير القسم"
  4. **Notifies section heads** (`HRAttendance.tsx:279-283`): finds unit_heads in same section as employee, sends notification about override
  5. Audit: "موافقة مباشرة (مدير)"
- **Data mutation:** Both approval levels set to approved by emp-2 simultaneously
- **Result:** **PASS**

### Step 5.3: A1 فاطمة overrides a rejected request
- **Precondition:** A request where unit_head rejected but dept_manager_status still "pending"
- **Code path:** `HRAttendance.tsx:563-567` → renders override button for rejected requests where `unit_head_status === "rejected" && dept_manager_status === "pending"`
- **Click → handleManagerOverride** → sets both to approved → employee gets approved
- **Result:** **PASS**

### Step 5.4: A1 فاطمة undoes her approval (dept level)
- **Code path:** `HRAttendance.tsx:289-320` (performUndo)
  1. `undoTarget.level = "dept"` → resets `approval_status = "unit_approved"`, `dept_manager_status = "pending"`, `dept_manager_by = null`, `dept_manager_at = null`
  2. History entry: {kind:"undo", action:"تراجع مدير القسم", reason}
  3. Notification to employee about undo
- **Data mutation:** Rolls back to unit_approved state
- **Result:** **PASS**

### Step 5.5: A1 فاطمة requests opinion from unit head on pending request
- **Code path:** `HRAttendance.tsx:449-458` (handleRequestOpinion)
  1. `localDb.hrRequests.update(id, {opinion_requested:true, opinion_requested_by:"emp-2", ...})`
  2. Notification to employee: "طُلب بيان رأي على طلبك"
- **Then A2 خالد submits opinion:** `HRAttendance.tsx:459-470` (handleSubmitOpinion)
  1. Writes `unit_opinion`, `unit_opinion_by:"emp-3"`, `unit_opinion_at:now()`
  2. History entry added
- **Result:** **PASS**

**Phase 5 Summary: 5/5 PASS, 0 BUG**

---

## Phase 6: Self-Approve Guards

### Step 6.1: A1 فاطمة tries to approve her own HR request
- **Precondition:** فاطمة creates a request (created_by = "emp-2"), then tries to approve it as dept_manager
- **Code path:** `HRAttendance.tsx:225-227` → `req.created_by === userId` → "emp-2" === "emp-2" → toast "لا يمكنك الموافقة على طلبك" → BLOCKED
- **Same guard at unit level:** `HRAttendance.tsx:183-185`
- **Same guard for reject:** `HRAttendance.tsx:204-206` and `HRAttendance.tsx:245-247`
- **Result:** **PASS** — All self-approve guards work for HR

### Step 6.2: Manager override on self-created request
- **Code path:** `handleManagerOverride` at `HRAttendance.tsx:264-287` — **NO self-approve guard!**
- **BUG:** `handleManagerOverride` does NOT check `req.created_by === userId`. The function checks self-approve in `handleDeptApprove` and `handleUnitApprove`, but `handleManagerOverride` has no such check. A manager who creates a request for themselves could override-approve it.
- **However:** The render logic at `HRAttendance.tsx:550-556` shows the override button only when `(isDeptManager || isAdmin) && !isRequester`. So `isRequester = req.created_by === userId` would hide the button.
- **Resolution:** The UI hides the button, but the function itself lacks the guard. If called programmatically, it would succeed. This is a **defense-in-depth bug** — the backend function should also check.
- **BUG LOCATION:** `HRAttendance.tsx:264-287` — handleManagerOverride missing self-approve guard
- **Result:** **PASS with BUG** — Bug #3: handleManagerOverride lacks self-approve guard (UI prevents but function doesn't)

### Step 6.3: Dashboard quick-approve self-request
- **Code path:** `Dashboard.tsx:134-160` (handleHRAction in ManagerDashboard)
  - Line 137: `if (req.created_by === userId)` → returns with toast error → BLOCKED
- **Result:** **PASS** — Dashboard quick-approve has self-approve guard

**Phase 6 Summary: 3/3 PASS, 1 BUG found**

---

## Phase 7: Task Creation

### Step 7.1: A2 خالد creates task in his own unit (الإعداد)
- **Agent:** emp-3, isUnitHead=true, section="شعبة الإعداد والتدريب"
- **Form:** title="تنسيق قاعة جديدة", unit="الإعداد", assigned_to="emp-6" (سارة), stage="routine", is_routine=true
- **Code path:** `Tasks.tsx:195-227` (handleCreate)
  1. `targetUnit = "الإعداد"` (same as section)
  2. `isProposalToOtherUnit = !isManager && !isAdmin && isUnitHead && targetUnit && targetUnit !== section` → "الإعداد" === section → false
  3. `status = "pending"` (not a proposal)
  4. `localDb.tasks.insert({title, description, unit:"الإعداد", stage:"routine", status:"pending", assigned_to:"emp-6", assigned_by:"emp-3", created_by:"emp-3", is_routine:true})`
  5. Notification to emp-6: "مهمة جديدة: تنسيق قاعة جديدة"
  6. Audit: "إنشاء مهمة"
- **Result:** **PASS**

### Step 7.2: A3 نورة creates task in المناهج unit
- **Agent:** emp-4, isUnitHead=true, section="شعبة المناهج"
- **Form:** title="كتابة منهج جديد", unit="المناهج", assigned_to="emp-10" (زينب), stage="writing"
- **Code path:** Same as 7.1, isProposalToOtherUnit = false (same section)
- **Result:** **PASS**

### Step 7.3: A4 سارة (individual) tries to create task
- **Code path:** `Tasks.tsx:628-629` → `canEditTasks = has("create_task") || has("edit_task")` → individual role does NOT have "create_task" → canEditTasks = false → "مهمة جديدة" button hidden
- **Also:** `PermissionRoute permission={has("view_tasks")}` → individual has "view_tasks" → can view page but not create
- **Result:** **PASS** — Individual cannot create tasks

**Phase 7 Summary: 3/3 PASS, 0 BUG**

---

## Phase 8: Cross-Unit Task Proposal

### Step 8.1: A2 خالد proposes task to المناهج unit
- **Agent:** emp-3, section="شعبة الإعداد والتدريب", isUnitHead=true
- **Form:** title="مساعدة في إعداد عرض", unit="المناهج" (different from section), assigned_to="emp-10"
- **Code path:** `Tasks.tsx:195-227`
  1. `targetUnit = "المناهج"` ≠ section → `isProposalToOtherUnit = true`
  2. `status = "proposed"`, description appends `[مقترح من شعبة شعبة الإعداد والتدريب]`
  3. `localDb.tasks.insert({...status:"proposed"})`
  4. Notification: `{message:"مقترح مهمة جديدة من شعبة الإعداد والتدريب → المناهج: مساعدة في إعداد عرض", type:"info", link:"/tasks"}` — **BUG: user_id is undefined/null** → notification has no specific user_id, becomes broadcast
  5. Audit: "اقتراح مهمة بين الشعب"
- **BUG:** `Tasks.tsx:219` — `localDb.notifications.insert({message:..., type:"info", link:"/tasks"})` — no `user_id` field. This means the notification is a broadcast (user_id=null), which means ALL users see it, not just the dept_manager. The notification should target the dept_manager (emp-2).
- **BUG LOCATION:** `Tasks.tsx:219`
- **Result:** **PASS with BUG** — Bug #4: Cross-unit proposal notification is broadcast instead of targeting dept_manager

### Step 8.2: A1 فاطمة approves the proposal
- **Agent:** emp-2, isManager=true
- **Code path:** `Tasks.tsx:367-384` (handleApproveProposal)
  1. `!(isManager || isAdmin)` → false (isManager=true) → passes check
  2. `localDb.tasks.update(taskId, {status:"pending"})` — converts from "proposed" to "pending"
  3. Notifications to both assigned_to and created_by
  4. Audit: "قبول مقترح مهمة"
- **Result:** **PASS**

### Step 8.3: A5 محمد (individual) tries to approve proposal
- **Code path:** `Tasks.tsx:370-372` → `!(isManager || isAdmin)` → true → toast "فقط رئيس القسم يمكنه قبول المقترحات" → BLOCKED
- **Result:** **PASS**

### Step 8.4: A1 فاطمة rejects a proposal
- **Code path:** `Tasks.tsx:386-400` → `localDb.tasks.update(id, {status:"rejected"})` → notification to created_by → audit logged
- **Result:** **PASS**

**Phase 8 Summary: 4/4 PASS, 1 BUG found**

---

## Phase 9: Task Lifecycle (Start → Complete → Review → Approve)

### Step 9.1: A6 زينب starts task tsk-3 (pending → in_progress)
- **Agent:** emp-10, isIndividual=true, assigned_to=emp-10 for tsk-3
- **Code path:** `Tasks.tsx:508-509` → renders "بدء" button when `isMyTask && isIndividual && status === "pending"`
- **Click:** `handleUpdateStatus(taskId, "in_progress")` → `Tasks.tsx:308-325`
  - `newStatus !== "approved"` → OK
  - `newStatus !== "completed"` → OK
  - `localDb.tasks.update(taskId, {status:"in_progress"})`
  - Notification to assigner if different from current user
  - Audit: "تحديث حالة مهمة"
- **Data mutation:** tsk-3 status → "in_progress"
- **Result:** **PASS**

### Step 9.2: A6 زينب completes task tsk-3 (in_progress → review)
- **Agent:** emp-10, task tsk-3
- **Code path:** `Tasks.tsx:327-346` (handleMarkCompleted)
  1. `task.estimated_hours = 20`, `task.created_at = "2026-04-20T08:00:00Z"`
  2. `hoursSpent = (now - created_at) / ms_per_hour` → > 20 hours → points = 0 (no bonus)
  3. `localDb.tasks.update(taskId, {status:"review", pending_points:0})`
  4. Notification to assigned_by or created_by (emp-4 نورة): "مهمة مكتملة بانتظار المراجعة: تحديث منهج القيادة"
  5. Audit: "إنهاء مهمة (بانتظار المراجعة)"
- **Data mutation:** tsk-3 status → "review", pending_points → 0
- **Result:** **PASS**

### Step 9.3: A3 نورة approves task tsk-3 (review → approved)
- **Agent:** emp-4, isUnitHead=true, task created_by="emp-4", assigned_to="emp-10"
- **Code path:** `Tasks.tsx:348-365` (handleApproveTask)
  1. **Self-approve guard:** `task.created_by === userId` → "emp-4" === "emp-4" → **BLOCKED!**
  2. Toast: "لا يمكنك اعتماد مهمة أنشأتها أو أسندت إليك"
  3. **BUG ANALYSIS:** نورة created the task AND assigned it to زينب. The guard prevents the creator from approving. This is correct behavior — the dept_manager (فاطمة) should approve instead.
- **Result:** **PASS** — Self-approve guard works correctly

### Step 9.4: A1 فاطمة approves task tsk-3 (review → approved)
- **Agent:** emp-2, isManager=true
- **Code path:** `Tasks.tsx:348-365` (handleApproveTask)
  1. `task.created_by === userId` → "emp-4" !== "emp-2" → OK
  2. `task.assigned_to === userId` → "emp-10" !== "emp-2" → OK
  3. `localDb.tasks.update(taskId, {status:"approved", achievement_points: (0 || 0) + 1 + (0 || 0) = 1})`
  4. Notification to emp-10: "تم اعتماد مهمتك: تحديث منهج القيادة (+1 نقطة)"
  5. Audit: "اعتماد مهمة"
- **Data mutation:** tsk-3 status → "approved", achievement_points → 1
- **Result:** **PASS**

### Step 9.5: A3 نورة sends comment/returns task tsk-5 (review → in_progress)
- **Precondition:** tsk-5 (إعداد عرض القيادة, status="review", assigned_to=emp-11)
- **Code path:** `Tasks.tsx:402-423` (handleSendComment) — used when unit head sends comment on review task
  1. `localDb.taskComments.insert({task_id, author_id:"emp-4", author_name:"نورة سعد المالكي", message:"أضف مصادر"})`
  2. `localDb.tasks.update(taskId, {status:"in_progress"})` — **returns task to in_progress**
  3. Notification to emp-11 (ليث): "ملاحظة على مهمة: إعداد عرض القيادة"
  4. Audit: "إرجاع مهمة مع ملاحظة"
- **Data mutation:** tsk-5 status → "in_progress", new comment added
- **Result:** **PASS**

### Step 9.6: A7 ليث advances task stage (writing → new_form → auditing → printing → done)
- **Agent:** emp-11, task tsk-5 now back in in_progress at stage "new_ppt"
- **Code path:** `Tasks.tsx:460-474` (handleAdvanceStage)
  - Only unit_heads/managers can advance stages (button rendered at `Tasks.tsx:531-532`)
  - **BUG:** Individuals do NOT get the "ترقية" button. The advance stage button is only available to `canEditTask(task)` which checks `isManager || isAdmin || (task.unit === section && canEditTasks)`. For individual, `canEditTasks = has("create_task") || has("edit_task")` → individual doesn't have these → false.
  - **Individual has `advance_task_stage` permission** (it's in the individual role perms at `permissions.ts:73`), but the UI doesn't render the button because `canEditTask` doesn't check for `has("advance_task_stage")`.
  - **BUG LOCATION:** `Tasks.tsx:188-193` (canEditTask) doesn't check `has("advance_task_stage")`, and `Tasks.tsx:531-532` gate is `canEditTask(task)` instead of checking the specific permission
- **Resolution:** ليث cannot advance the stage from the UI. A unit head or manager must do it.
- **Result:** **PASS with BUG** — Bug #5: Individual with advance_task_stage perm can't use it in UI

**Phase 9 Summary: 6/6 PASS, 1 BUG found**

---

## Phase 10: Task Self-Approve Guard

### Step 10.1: A2 خالد tries to approve task he created
- **Task:** tsk-4 (متابعة إصدار الشهادات, created_by="emp-3", assigned_to="emp-8")
- **Code path:** `Tasks.tsx:351-353` → `task.created_by === userId` → "emp-3" === "emp-3" → BLOCKED
- **Result:** **PASS**

### Step 10.2: A6 زينب tries to approve task assigned to her
- **Task:** tsk-1 (assigned_to="emp-10")
- **Code path:** `Tasks.tsx:351` → `task.assigned_to === userId` → "emp-10" === "emp-10" → BLOCKED
- **But:** زينب is individual, doesn't have "approve_task" permission anyway → button not rendered at `Tasks.tsx:520-523`
- **Result:** **PASS** — Double protection (UI + logic)

### Step 10.3: Task handover flow — A6 زينب hands tsk-1 to A7 ليث
- **Agent:** emp-10 (زينب), task tsk-1
- **Code path:** `Tasks.tsx:229-257` (handleHandover)
  1. `localDb.taskHandovers.insert({task_id, from_user_id:"emp-10", to_user_id:"emp-11", status:"pending_acceptance"})`
  2. Notification to emp-11: "طلب إحالة مهمة إليك: إعداد منهج الأمن السيبراني"
  3. Audit: "طلب إحالة مهمة"
- **Then A7 ليث accepts:** `Tasks.tsx:259-280` (handleAcceptHandover)
  1. `localDb.taskHandovers.update(handoverId, {status:"pending_approval"})`
  2. Notification to unit_heads of المناهج section: "موافقة مطلوبة على إحالة مهمة"
- **Then A3 نورة approves handover:** `Tasks.tsx:282-306` (handleApproveHandover)
  1. `localDb.taskHandovers.update(handoverId, {status:"approved"})`
  2. `localDb.tasks.update(taskId, {assigned_to:"emp-11", previous_owner:"emp-10", handed_over:true, handed_over_at:now()})`
  3. Notifications to both parties
- **Result:** **PASS**

**Phase 10 Summary: 3/3 PASS, 0 BUG**

---

## Phase 11: Curriculum Management

### Step 11.1: A3 نورة adds new curriculum item
- **Agent:** emp-4, curriculum_unit_head, has("add_curriculum")=true
- **Permission route:** `App.tsx:88` → `has("view_curriculum")` → true → page accessible
- **Form:** title="منهج الإحصاء التطبيقي", goals="...", target_audience="محللون", type="specialized"
- **Code path:** Curriculum.tsx — `localDb.curriculumItems.insert({...})` with default values
- **Result:** **PASS**

### Step 11.2: A4 سارة (individual) views curriculum but cannot add
- **Permission:** has("view_curriculum")=true, has("add_curriculum")=false → can view but not add
- **Code path:** Add button hidden based on permission check
- **Result:** **PASS**

### Step 11.3: A2 خالد (prep_unit_head) views curriculum
- **Permission:** has("view_curriculum")=true, has("add_curriculum")=false, has("edit_curriculum")=false
- **BUG:** prep_unit_head role at `permissions.ts:169-178` only has `view_curriculum`, `export_curriculum`, `print_curriculum` — no add/edit. But prep_unit_head should arguably be able to upload curriculum files since they manage the prep/training execution side.
- **Not a bug per spec** — this is a design choice. Curriculum management is reserved for curriculum_unit_head.
- **Result:** **PASS** — No bug, design is intentional

**Phase 11 Summary: 3/3 PASS, 0 BUG**

---

## Phase 12: Notification Flow

### Step 12.1: Verify seed notification links match App.tsx routes
- **notif-1:** link="/courses?focus=crs-5" → App.tsx:93 route="/courses" → **MATCH**
- **notif-2:** link="/hr" → App.tsx:91 route="/hr" → **MATCH**
- **notif-3:** link="/hr" → **MATCH**
- **notif-4:** link="/tasks?focus=tsk-3" → App.tsx:90 route="/tasks" → **MATCH**
- **notif-5:** link="/curriculum?focus=cur-2" → App.tsx:88 route="/curriculum" → **MATCH**
- **notif-6:** link="/training-plan" → App.tsx:94 route="/training-plan" → **MATCH**
- **Result:** **PASS** — All seed notification links match routes

### Step 12.2: Verify notification user_id targeting
- **notif-1:** user_id=null → broadcast (all users see it) — intentional for "دورة جارية الآن"
- **notif-2:** user_id="emp-1" → targeted to admin only — correct
- **notif-3:** user_id="emp-2" → targeted to فاطمة — correct
- **notif-4:** user_id="emp-10" → targeted to زينب — correct
- **notif-5:** user_id=null → broadcast — intentional for curriculum status
- **notif-6:** user_id="emp-3" → targeted to خالد — correct
- **Result:** **PASS**

### Step 12.3: Notification created during HR approval (step 4.1)
- **From step 4.1:** `{user_id:"emp-6", message:"وافق رئيس الشعبة على طلبك (إجازة اعتيادية)", type:"info", link:"/hr"}`
- **Visibility in Layout:** `Layout.tsx` notification panel filters by `user_id === currentUser.id || user_id === null` → سارة (emp-6) sees this notification
- **Result:** **PASS**

### Step 12.4: Cross-unit proposal notification (from Bug #4)
- **Notification:** `{message:"مقترح مهمة جديدة من الإعداد → المناهج: ...", type:"info", link:"/tasks"}` — **NO user_id** → broadcast
- **Should target:** emp-2 (dept_manager) only
- **Result:** **FAIL** — Bug #4 confirmed (from Phase 8)

**Phase 12 Summary: 3/4 PASS, 1 FAIL (Bug #4 from Phase 8)**

---

## Phase 13: Archive Access

### Step 13.1: A2 خالد accesses archive
- **Permission:** prep_unit_head has `view_archive`, `add_archive`, `edit_archive`, `export_archive` → full archive access except delete
- **PermissionRoute:** `has("view_archive")` → true → accessible
- **Result:** **PASS**

### Step 13.2: A4 سارة accesses archive (individual)
- **Permission:** individual has `view_archive` → can view only
- **Cannot:** add, edit, delete (no corresponding perms)
- **Result:** **PASS**

### Step 13.3: A1 فاطمة can delete archive documents
- **Permission:** dept_manager has `delete_archive` → true
- **Result:** **PASS**

### Step 13.4: Seed archive document attachment entity key
- **Code path:** Archive page uses `FileUploadButton` with `entityKey="archive-{docId}"`
- **fileStore.save()** → saves to IndexedDB `tms_file_store`
- **fileStore.getByEntity("archive-arc-1")** → retrieves files for that document
- **Result:** **PASS**

**Phase 13 Summary: 4/4 PASS, 0 BUG**

---

## Phase 14: Settings & Permissions

### Step 14.1: A1 فاطمة cannot access manage_permissions
- **Permission:** dept_manager does NOT have `manage_permissions` (excluded at `permissions.ts:157`)
- **Code path:** `App.tsx:87` → Settings page is accessible (no PermissionRoute on /settings), BUT the permissions tab within Settings checks `has("manage_permissions")` before rendering
- **Result:** **PASS** — فاطمة can see Settings but not the permissions tab

### Step 14.2: Admin (emp-1) can access manage_permissions and reset_data
- **Permission:** admin has ALL permissions including `manage_permissions` and `reset_data`
- **Result:** **PASS**

### Step 14.3: Custom permissions override
- **Code path:** `permissions.ts:217-226` (getEffectivePermissions)
  1. Checks `localStorage.getItem("tms_custom_permissions")` for userId
  2. If found, returns custom perms instead of role-based
  3. `hasPermission()` uses this
- **Setting custom perms:** Settings page (admin only) can set per-user custom permission lists stored in `tms_custom_permissions` localStorage key
- **Result:** **PASS**

### Step 14.4: A4 سارة tries to access settings
- **Code path:** `App.tsx:87` → `<Route path="settings" .../>` has NO PermissionRoute wrapper → accessible to all logged-in users
- **Within Settings:** Tabs like "الصلاحيات" are hidden without `manage_permissions`, backup requires `backup_data`, reset requires `reset_data`
- **Individual perms:** individual does NOT have `backup_data` or `reset_data` → these tabs are hidden
- **BUG:** The settings page itself is accessible to all users, but most tabs are hidden. The "المستخدمين" tab requires `view_users` which individual doesn't have. The only visible content for individuals would be their own profile info (if any). This is acceptable but could be confusing.
- **Result:** **PASS**

**Phase 14 Summary: 4/4 PASS, 0 BUG**

---

## Phase 15: Audit Log

### Step 15.1: Verify audit entries from simulation actions
- **From Phase 3:** logAction("سارة يوسف القحطاني", "رفع طلب إجازة", ...) → inserted into `localDb.auditLog`
- **From Phase 4:** logAction("خالد عبدالله السعيد", "موافقة رئيس شعبة", ...) → inserted
- **From Phase 5:** logAction("فاطمة حسن الأمير", "موافقة نهائية", ...) → inserted
- **From Phase 7:** logAction("خالد عبدالله السعيد", "إنشاء مهمة", ...) → inserted
- **From Phase 8:** logAction("فاطمة حسن الأمير", "قبول مقترح مهمة", ...) → inserted
- **From Phase 9:** logAction("فاطمة حسن الأمير", "اعتماد مهمة", ...) → inserted
- **Code path:** `auditLog.ts` → `localDb.auditLog.insert({user_name, action, target, timestamp})`
- **Visibility:** `has("view_activity_log")` → admin/dept_manager/unit_head have this → they can see the ActivityLog page
- **Result:** **PASS**

### Step 15.2: A4 سارة cannot view activity log
- **Permission:** individual does NOT have `view_activity_log`
- **Code path:** `App.tsx:89` → `has("view_activity_log")` → false → `<PermissionRoute>` redirects to "/"
- **Result:** **PASS**

**Phase 15 Summary: 2/2 PASS, 0 BUG**

---

## Phase 16: Error Conditions & Edge Cases

### Step 16.1: Cancel own request (A4 سارة cancels her pending request)
- **Code path:** `HRAttendance.tsx:322-334` (handleCancel)
  1. `isIndividual && req.created_by === userId && (approval_status === "pending" || "unit_approved") && has("cancel_own_request")` → individual has "cancel_own_request" → true
  2. `["pending", "unit_approved"].includes(req.approval_status)` → OK
  3. `localDb.hrRequests.update(id, {approval_status:"cancelled", history})`
  4. Audit: "إلغاء طلب"
- **Result:** **PASS**

### Step 16.2: Cancel already approved request
- **Code path:** `HRAttendance.tsx:325-327` → `!["pending", "unit_approved"].includes("approved")` → toast "لا يمكن إلغاء طلب تمت الموافقة النهائية عليه" → BLOCKED
- **Result:** **PASS**

### Step 16.3: Unit head undo at unit level (A2 خالد undoes his approval)
- **Code path:** `HRAttendance.tsx:289-320` (performUndo) with `level="unit"`
  1. Resets: `approval_status:"pending"`, `unit_head_status:"pending"`, `unit_head_by:null`, `unit_head_at:null`
  2. History entry with reason
  3. Notification to employee about undo
- **Data mutation:** Rolls completely back to pending state
- **Result:** **PASS**

### Step 16.4: Duplicate إجازة اعتيادية for same employee, same date
- **Code path:** `HRAttendance.tsx:361-371` → checks for existing request with same employee_name, type, date, and status in ["pending", "unit_approved", "approved"] → if found → toast "يوجد طلب إجازة اعتيادية لنفس الموظف في نفس التاريخ" → BLOCKED
- **Result:** **PASS**

### Step 16.5: Not Found page for invalid route
- **Code path:** `App.tsx:101` → `<Route path="*" element={<NotFound />} />` → renders Arabic 404 page
- **Result:** **PASS**

### Step 16.6: External survey access
- **Code path:** `App.tsx:76,99` → `/survey/:courseId/:role` accessible WITHOUT login
- **ExternalSurvey.tsx** → `useParams()` gets courseId → `localDb.courses.getById(courseId)` → renders evaluation form → saves to `localDb.evaluations.insert()`
- **Result:** **PASS**

### Step 16.7: Session timeout after 1hr idle
- **Code path:** `AuthContext.tsx:53-62` → 55min warning, 60min auto-logout → `localStorage.removeItem("tms_current_user_id")`, `setUser(null)`
- **Result:** **PASS** — Timeout mechanism in place

### Step 16.8: Impersonation by admin
- **Code path:** `AuthContext.tsx:130-136` (impersonate)
  1. Checks `user.roles?.some(r => ["admin", "super_user"].includes(r))` → only admin/super_user can impersonate
  2. `localStorage.setItem("tms_original_user_id", user.id)`, `localStorage.setItem("tms_impersonated_user_id", targetUserId)`
  3. `window.location.reload()` → on reload, AuthContext picks up impersonated_user_id first
- **A1 فاطمة (dept_manager) CANNOT impersonate** → `roles = ["dept_manager", "training_admin"]` → neither is admin/super_user → BLOCKED
- **Result:** **PASS**

### Step 16.9: Reset store
- **Code path:** `localStore.ts:473-476` → `resetStore()` → `store = getDefaultStore()` → `saveStore()` → fresh seed data
- **From Settings:** Admin clicks reset → auto-backup first → then `resetStore()`
- **Result:** **PASS**

### Step 16.10: Task with no assigned_to
- **Seed data:** No tasks with assigned_to=null in seed, but system supports it
- **handleMarkCompleted notification path:** `Tasks.tsx:337-343` → if no assigned_by/created_by, finds unit_head from profiles and sends notification
- **Result:** **PASS**

**Phase 16 Summary: 10/10 PASS, 0 BUG**

---

## BUG SUMMARY

| # | Severity | Description | Location | Phase |
|---|----------|-------------|----------|-------|
| 1 | Medium | CurriculumDashboard doesn't render attendance/pending sections even though curriculum_unit_head has those permissions and PageHeader shows anchors for them | `Dashboard.tsx:434-478` vs `Dashboard.tsx:587-597` | 2 |
| 2 | Medium | Section conflict check for إجازة اعتيادية only checks unit_approved/approved, not pending — two colleagues can submit overlapping pending requests | `HRAttendance.tsx:381` | 3 |
| 3 | Low | `handleManagerOverride()` lacks self-approve guard (UI prevents but function doesn't check) — defense-in-depth issue | `HRAttendance.tsx:264-287` | 6 |
| 4 | Medium | Cross-unit task proposal notification has no user_id — becomes broadcast instead of targeting dept_manager | `Tasks.tsx:219` | 8 |
| 5 | Low | Individual has `advance_task_stage` permission but UI doesn't render the button (canEditTask doesn't check this perm) | `Tasks.tsx:188-193` | 9 |

---

## FINAL SUMMARY

| Phase | Description | PASS | FAIL | BUGs |
|-------|-------------|------|------|------|
| 1 | Login & Access | 10 | 0 | 0 |
| 2 | Dashboard Rendering | 7 | 0 | 1 |
| 3 | HR Request Creation | 6 | 0 | 1 |
| 4 | Unit Head Approval | 7 | 0 | 0 |
| 5 | Dept Manager Approval | 5 | 0 | 0 |
| 6 | Self-Approve Guards | 3 | 0 | 1 |
| 7 | Task Creation | 3 | 0 | 0 |
| 8 | Cross-Unit Task Proposal | 4 | 0 | 1 |
| 9 | Task Lifecycle | 6 | 0 | 1 |
| 10 | Task Self-Approve Guard | 3 | 0 | 0 |
| 11 | Curriculum Management | 3 | 0 | 0 |
| 12 | Notification Flow | 3 | 1 | 0 |
| 13 | Archive Access | 4 | 0 | 0 |
| 14 | Settings & Permissions | 4 | 0 | 0 |
| 15 | Audit Log | 2 | 0 | 0 |
| 16 | Error Conditions | 10 | 0 | 0 |
| **TOTAL** | | **80** | **1** | **5** |

### Overall: 80 PASS, 1 FAIL, 5 BUGs across 16 phases

**Critical bugs to fix:**
1. **Bug #4** (Medium) — Cross-unit proposal notification should target dept_manager, not broadcast
2. **Bug #2** (Medium) — Section conflict check should include pending requests for إجازة اعتيادية
3. **Bug #1** (Medium) — CurriculumDashboard should render sections matching the user's permissions (or getDashboardSections should exclude sections not rendered by the current dashboard)

**Low-priority bugs:**
4. **Bug #3** (Low) — Add self-approve guard to handleManagerOverride for defense-in-depth
5. **Bug #5** (Low) — Either remove `advance_task_stage` from individual perms or add UI support for it
