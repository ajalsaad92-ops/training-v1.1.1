import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { localDb, type UserProfile } from "@/lib/localStore";
import {
  PERMISSION_CATEGORIES, ALL_PERMISSIONS, ROLE_PERMISSIONS,
  getPermissionsForRoles, getPermissionDef,
} from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  Settings as SettingsIcon, Download, Upload, Shield, Database, FileSpreadsheet,
  AlertTriangle, CheckCircle2, XCircle, Clock, Loader2, LogOut, Bug, Bell,
  Users, UserPlus, RefreshCw, Lock, Search, ChevronDown, ChevronUp, DownloadCloud,
  Eye, EyeOff, RotateCcw, Copy, Pencil, Trash2, FileText, Wrench,
} from "lucide-react";
import NotificationsControl from "@/components/settings/NotificationsControl";
import { downloadFullBackup, restoreFromBackup } from "@/lib/backup";
import { manualPullFromCloud } from "@/lib/sync/syncManager";
import { checkForUpdates, applyUpdates } from "@/lib/updates/updateManager";

type SettingsTab = "general" | "permissions" | "tools";

const Settings = () => {
  const { user } = useAuth();
  const { has, isManager } = useUserRole();
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  const canManageUsers = has("view_users") || has("add_user");
  const canManagePerms = has("manage_permissions");

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType; show: boolean }[] = [
    { id: "general", label: "عام", icon: Database, show: true },
    { id: "permissions", label: "الصلاحيات", icon: Shield, show: true },
    { id: "tools", label: "أدوات", icon: Wrench, show: true },
  ];

  const visibleTabs = tabs.filter(t => t.show);

  return (
    <div className="h-full flex flex-col p-2 md:p-3 overflow-hidden">
      <div className="shrink-0 mb-3">
        <h1 className="text-base font-bold text-foreground flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-primary" />الإعدادات
        </h1>
      </div>

      <div className="flex gap-1 mb-3 shrink-0 overflow-x-auto no-scrollbar">
        {visibleTabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
              activeTab === tab.id ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}>
            <tab.icon className="w-3.5 h-3.5" />{tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 animate-fade-in" key={activeTab}>
        {activeTab === "general" && <GeneralTab canManageUsers={canManageUsers} />}
        {activeTab === "permissions" && <PermissionsHub canManagePerms={canManagePerms} />}
        {activeTab === "tools" && <ToolsTab canBackup={isManager} />}
      </div>
    </div>
  );
};

// ===== GENERAL TAB: Users + Activity Log =====
const GeneralTab = ({ canManageUsers }: { canManageUsers: boolean }) => {
  const [sub, setSub] = useState<"users" | "activity">(canManageUsers ? "users" : "activity");
  const subs = [
    { id: "users" as const, label: "المستخدمين", icon: Users, show: canManageUsers },
    { id: "activity" as const, label: "سجل النشاط", icon: FileText, show: true },
  ].filter(s => s.show);

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5">
        {subs.map(s => (
          <button key={s.id} onClick={() => setSub(s.id)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-medium transition-colors ${
              sub === s.id ? "bg-primary/10 text-primary" : "bg-muted/40 text-muted-foreground hover:bg-muted"
            }`}>
            <s.icon className="w-3.5 h-3.5" />{s.label}
          </button>
        ))}
      </div>
      {sub === "users" && canManageUsers && <UsersTab />}
      {sub === "activity" && <ActivityLogPanel />}
    </div>
  );
};

// ===== PERMISSIONS HUB: Permissions + Notifications =====
const PermissionsHub = ({ canManagePerms }: { canManagePerms: boolean }) => {
  const [sub, setSub] = useState<"permissions" | "notifications">(canManagePerms ? "permissions" : "notifications");
  const subs = [
    { id: "permissions" as const, label: "الصلاحيات", icon: Shield, show: canManagePerms },
    { id: "notifications" as const, label: "الإشعارات", icon: Bell, show: true },
  ].filter(s => s.show);

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5">
        {subs.map(s => (
          <button key={s.id} onClick={() => setSub(s.id)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-medium transition-colors ${
              sub === s.id ? "bg-primary/10 text-primary" : "bg-muted/40 text-muted-foreground hover:bg-muted"
            }`}>
            <s.icon className="w-3.5 h-3.5" />{s.label}
          </button>
        ))}
      </div>
      {sub === "permissions" && canManagePerms && <PermissionsTab />}
      {sub === "notifications" && <NotificationsControl />}
    </div>
  );
};

// ===== ACTIVITY LOG PANEL =====
const ActivityLogPanel = () => {
  const { data: auditLog } = useAuditLogLazy();
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-3 border-b border-border"><h3 className="font-bold text-sm text-foreground flex items-center gap-2"><FileText className="w-4 h-4 text-primary" />سجل النشاط</h3></div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-right">
          <thead className="bg-muted/50"><tr><th className="p-2">المستخدم</th><th className="p-2">الإجراء</th><th className="p-2">العنصر</th><th className="p-2">الوقت</th></tr></thead>
          <tbody>
            {auditLog.length > 0 ? auditLog.slice(0, 50).map(e => (
              <tr key={e.id} className="border-t border-border/50"><td className="p-2 font-medium">{e.user_name}</td><td className="p-2"><span className="badge-info">{e.action}</span></td><td className="p-2 text-muted-foreground">{e.target}</td><td className="p-2 text-muted-foreground">{new Date(e.timestamp).toLocaleString("ar-SA")}</td></tr>
            )) : <tr><td colSpan={4} className="text-center py-6 text-muted-foreground">لا توجد سجلات</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

function useAuditLogLazy() {
  const [data, setData] = useState(() => localDb.auditLog.getAll().sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
  return { data, refetch: () => setData(localDb.auditLog.getAll().sort((a, b) => b.timestamp.localeCompare(a.timestamp))) };
}




// ===== USERS TAB =====
const UsersTab = () => {
  const [users, setUsers] = useState<Array<UserProfile & { email?: string; password?: string }>>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDetail, setShowDetail] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [form, setForm] = useState({ email: "", password: "", name: "", section: "", position: "موظف", phone: "" });
  const [editForm, setEditForm] = useState({ id: "", email: "", name: "", section: "", position: "موظف", phone: "", roles: [] as string[], active: true });
  const [saving, setSaving] = useState(false);
  const { has, isAdmin } = useUserRole();
  const { impersonate } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const roleOptions = [
    { value: "admin", label: "مدير النظام" },
    { value: "dept_manager", label: "مدير القسم" },
    { value: "curriculum_unit_head", label: "مسؤول شعبة المناهج" },
    { value: "prep_unit_head", label: "مسؤول شعبة الإعداد" },
    { value: "unit_head", label: "رئيس شعبة (عام)" },
    { value: "curriculum_individual", label: "موظف مناهج" },
    { value: "prep_individual", label: "موظف إعداد" },
    { value: "trainer", label: "مدرب" },
    { value: "supervisor", label: "مشرف" },
    { value: "individual", label: "موظف" },
  ];

  const positionRoleMap: Record<string, string[]> = {
    "مدير النظام (Admin)": ["admin"],
    "مدير القسم": ["dept_manager"],
    "مسؤول شعبة المناهج": ["curriculum_unit_head"],
    "مسؤول شعبة الإعداد": ["prep_unit_head"],
    "مسؤول شعبة": ["unit_head"],
    "موظف مناهج": ["curriculum_individual"],
    "موظف إعداد": ["prep_individual"],
    "مدرب": ["trainer"],
    "مشرف": ["supervisor"],
    "موظف": ["individual"],
  };

  const refresh = useCallback(() => {
    const profiles = localDb.profiles.getAll();
    const accounts = localDb.userAccounts.getAll();
    setUsers(profiles.map(p => ({
      ...p,
      email: accounts.find((a: any) => a.profile?.id === p.id)?.email || "",
      password: accounts.find((a: any) => a.profile?.id === p.id)?.password || "",
    })));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const sectionOptions = useMemo(() => {
    const fromDb = [...new Set(localDb.employees.getAll().map((e: any) => e.section).filter(Boolean))];
    const defaults = ["شعبة الإعداد والتدريب", "شعبة المناهج"];
    return [...new Set([...fromDb, ...defaults])];
  }, [refresh]);

  const handleAdd = () => {
    if (!form.email || !form.password || !form.name) { toast({ title: "نقص بيانات", variant: "destructive" }); return; }
    const existing = localDb.userAccounts.getAll().find((a: any) => a.email === form.email);
    if (existing) { toast({ title: "خطأ", description: "البريد الإلكتروني مستخدم بالفعل", variant: "destructive" }); return; }
    setSaving(true);
    const id = `emp-${Date.now()}`;
    const roles = positionRoleMap[form.position] || ["individual"];
    const profile = { id, name: form.name, department: "قسم التدريب", section: form.section, position: form.position, phone: form.phone, roles, active: true };
    localDb.employees.insert({ id, name: form.name, department: "قسم التدريب", section: form.section, position: form.position, phone: form.phone, work_schedule: "daily" as const });
    localDb.profiles.insert(profile);
    localDb.userAccounts.insert({ email: form.email, password: form.password, profile });
    toast({ title: "تم", description: "تم إنشاء المستخدم بنجاح" });
    setShowAdd(false);
    setForm({ email: "", password: "", name: "", section: "", position: "موظف", phone: "" });
    refresh();
    setSaving(false);
  };

  const openEdit = (u: UserProfile & { email?: string; password?: string }) => {
    setEditForm({
      id: u.id,
      email: u.email || "",
      name: u.name,
      section: u.section || "",
      position: u.position || "موظف",
      phone: u.phone || "",
      roles: [...(u.roles || [])],
      active: u.active !== false,
    });
    setNewPassword("");
    setShowEditPassword(false);
    setShowEdit(true);
  };

  const handleEditSave = () => {
    if (!editForm.name) { toast({ title: "خطأ", description: "الاسم مطلوب", variant: "destructive" }); return; }
    setSaving(true);
    const roles = positionRoleMap[editForm.position] || ["individual"];
    localDb.profiles.update(editForm.id, {
      name: editForm.name,
      section: editForm.section,
      position: editForm.position,
      phone: editForm.phone,
      roles,
      active: editForm.active,
    });
    const emp = localDb.employees.getAll().find((e: any) => e.id === editForm.id);
    if (emp) {
      localDb.employees.update(editForm.id, {
        name: editForm.name,
        section: editForm.section,
        position: editForm.position,
        phone: editForm.phone,
      });
    }
    const account = localDb.userAccounts.getAll().find((a: any) => a.profile?.id === editForm.id);
    if (account) {
      const updates: Record<string, unknown> = {};
      if (editForm.email && editForm.email !== account.email) {
        const dup = localDb.userAccounts.getAll().find((a: any) => a.email === editForm.email && a.profile?.id !== editForm.id);
        if (dup) { toast({ title: "خطأ", description: "البريد مستخدم بالفعل", variant: "destructive" }); setSaving(false); return; }
        updates.email = editForm.email;
      }
      if (showEditPassword && newPassword) {
        updates.password = newPassword;
      }
      if (Object.keys(updates).length > 0) {
        localDb.userAccounts.update(account.id || account.email, updates);
      }
    }
    toast({ title: "تم", description: "تم تحديث بيانات المستخدم" });
    setShowEdit(false);
    refresh();
    setSaving(false);
  };

  const handleToggleActive = (id: string, currentActive: boolean) => {
    localDb.profiles.update(id, { active: !currentActive });
    toast({ title: "تم", description: !currentActive ? "تم تفعيل الحساب" : "تم تعطيل الحساب" });
    refresh();
  };

  const handleDeleteUser = (id: string) => {
    if (!confirm("حذف المستخدم نهائياً؟ لا يمكن التراجع.")) return;
    localDb.profiles.delete(id);
    const account = localDb.userAccounts.getAll().find((a: any) => a.profile?.id === id);
    if (account) localDb.userAccounts.delete(account.id || account.email);
    const emp = localDb.employees.getAll().find((e: any) => e.id === id);
    if (emp) localDb.employees.delete(id);
    toast({ title: "تم", description: "تم حذف المستخدم" });
    refresh();
  };

  const filteredUsers = users.filter(u =>
    !userSearch || u.name.includes(userSearch) || (u.email || "").includes(userSearch) || u.section?.includes(userSearch)
  );

  const activeCount = filteredUsers.filter(u => u.active !== false).length;
  const inactiveCount = filteredUsers.filter(u => u.active === false).length;

  const detailUser = users.find(u => u.id === showDetail);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm text-foreground flex items-center gap-2"><Users className="w-4 h-4 text-primary" />المستخدمين</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refresh} className="gap-1"><RefreshCw className="w-3.5 h-3.5" />تحديث</Button>
          {has("add_user") && <Button size="sm" onClick={() => { setShowAdd(true); setForm({ email: "", password: "", name: "", section: "", position: "موظف", phone: "" }); }} className="gap-1"><UserPlus className="w-3.5 h-3.5" />مستخدم جديد</Button>}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-[300px]">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="بحث بالاسم أو البريد أو الشعبة..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="ps-8 h-8 text-xs" />
        </div>
        <div className="flex gap-2 text-[10px]">
          <span className="px-2 py-1 rounded bg-success/10 text-success">{activeCount} نشط</span>
          <span className="px-2 py-1 rounded bg-muted text-muted-foreground">{inactiveCount} معطل</span>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-x-auto">
        <table className="w-full text-xs text-right">
          <thead className="bg-muted/50"><tr>
            <th className="p-2">الاسم</th>
            <th className="p-2">البريد</th>
            <th className="p-2">الشعبة</th>
            <th className="p-2">المنصب</th>
            <th className="p-2">الأدوار</th>
            <th className="p-2">الحالة</th>
            <th className="p-2">إجراءات</th>
          </tr></thead>
          <tbody>
            {filteredUsers.length > 0 ? filteredUsers.map(u => (
              <tr key={u.id} className={`border-t border-border/50 hover:bg-muted/20 ${u.active === false ? "opacity-50" : ""}`}>
                <td className="p-2 font-medium">{u.name}</td>
                <td className="p-2 text-muted-foreground" dir="ltr">{u.email || "—"}</td>
                <td className="p-2 text-muted-foreground">{u.section || "—"}</td>
                <td className="p-2 text-muted-foreground">{u.position || "—"}</td>
                <td className="p-2"><div className="flex gap-0.5 flex-wrap">{(u.roles || []).map(r => <span key={r} className="px-1 py-0.5 rounded bg-primary/10 text-primary text-[10px]">{r}</span>)}</div></td>
                <td className="p-2">
                  {u.active !== false
                    ? <span className="px-1.5 py-0.5 rounded text-[10px] bg-success/10 text-success">نشط</span>
                    : <span className="px-1.5 py-0.5 rounded text-[10px] bg-destructive/10 text-destructive">معطل</span>
                  }
                </td>
                <td className="p-2">
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => setShowDetail(u.id)} className="p-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20" title="تفاصيل"><Eye className="w-3.5 h-3.5" /></button>
                    {has("add_user") && <button onClick={() => openEdit(u)} className="p-1.5 rounded-md bg-accent/10 text-accent hover:bg-accent/20" title="تعديل"><Pencil className="w-3.5 h-3.5" /></button>}
                    {isAdmin && u.id !== localDb.profiles.getById(localStorage.getItem("tms_current_user_id") || "")?.id && (
                      <button onClick={() => impersonate(u.id)} className="p-1.5 rounded-md bg-warning/10 text-warning hover:bg-warning/20" title="دخول كـ"><Shield className="w-3.5 h-3.5" /></button>
                    )}
                    {has("delete_user") && u.id !== localDb.profiles.getById(localStorage.getItem("tms_current_user_id") || "")?.id && (
                      <>
                        <button onClick={() => handleToggleActive(u.id, u.active !== false)} className="p-1.5 rounded-md bg-muted text-muted-foreground hover:bg-muted/80" title={u.active !== false ? "تعطيل" : "تفعيل"}>
                          {u.active !== false ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => handleDeleteUser(u.id)} className="p-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20" title="حذف نهائي"><Trash2 className="w-3.5 h-3.5" /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">لا يوجد مستخدمون</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* === ADD USER DIALOG === */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><UserPlus className="w-5 h-5 text-primary" />إنشاء مستخدم جديد</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">الاسم الكامل *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="الاسم الثلاثي" /></div>
              <div><Label className="text-xs">الهاتف</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="رقم الهاتف" dir="ltr" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">البريد الإلكتروني *</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="user@training.iq" dir="ltr" /></div>
              <div>
                <Label className="text-xs">كلمة المرور *</Label>
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="كلمة المرور" dir="ltr" className="pe-9" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute start-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">الشعبة *</Label>
                <Select value={form.section} onValueChange={v => setForm({ ...form, section: v })}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="اختر الشعبة" /></SelectTrigger>
                  <SelectContent>
                    {sectionOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">المنصب *</Label>
                <Select value={form.position} onValueChange={v => setForm({ ...form, position: v })}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="المنصب" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="مدير النظام (Admin)">مدير النظام</SelectItem>
                    <SelectItem value="مدير القسم">مدير القسم</SelectItem>
                    <SelectItem value="مسؤول شعبة">مسؤول شعبة</SelectItem>
                    <SelectItem value="مدرب">مدرب</SelectItem>
                    <SelectItem value="مشرف">مشرف</SelectItem>
                    <SelectItem value="موظف">موظف</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 space-y-1">
              <p className="text-[10px] text-muted-foreground">سيتم تعيين الأدوار تلقائياً:</p>
              <div className="flex gap-1 flex-wrap">
                {(positionRoleMap[form.position] || ["individual"]).map(r => {
                  const opt = roleOptions.find(o => o.value === r);
                  return <span key={r} className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px]">{opt?.label || r}</span>;
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)} size="sm">إلغاء</Button>
            <Button onClick={handleAdd} disabled={saving} size="sm" className="gap-1">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}إنشاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* === EDIT USER DIALOG === */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Pencil className="w-5 h-5 text-accent" />تعديل بيانات المستخدم</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">الاسم *</Label><Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} /></div>
              <div><Label className="text-xs">الهاتف</Label><Input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} dir="ltr" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">البريد الإلكتروني</Label><Input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} dir="ltr" /></div>
              <div>
                <Label className="text-xs">تغيير كلمة المرور</Label>
                <div className="flex items-center gap-2">
                  <Checkbox checked={showEditPassword} onCheckedChange={(c) => setShowEditPassword(!!c)} id="change_pass" />
                  <Label htmlFor="change_pass" className="text-[10px] text-muted-foreground">تغيير كلمة المرور</Label>
                </div>
                {showEditPassword && (
                  <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="كلمة المرور الجديدة" dir="ltr" className="mt-1" />
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">الشعبة</Label>
                <Select value={editForm.section} onValueChange={v => setEditForm({ ...editForm, section: v })}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="الشعبة" /></SelectTrigger>
                  <SelectContent>
                    {sectionOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">المنصب</Label>
                <Select value={editForm.position} onValueChange={v => setEditForm({ ...editForm, position: v })}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="المنصب" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="مدير النظام (Admin)">مدير النظام</SelectItem>
                    <SelectItem value="مدير القسم">مدير القسم</SelectItem>
                    <SelectItem value="مسؤول شعبة">مسؤول شعبة</SelectItem>
                    <SelectItem value="مدرب">مدرب</SelectItem>
                    <SelectItem value="مشرف">مشرف</SelectItem>
                    <SelectItem value="موظف">موظف</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 space-y-1">
              <p className="text-[10px] text-muted-foreground">الأدوار المُعيَّنة:</p>
              <div className="flex gap-1 flex-wrap">
                {(positionRoleMap[editForm.position] || ["individual"]).map(r => {
                  const opt = roleOptions.find(o => o.value === r);
                  return <span key={r} className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px]">{opt?.label || r}</span>;
                })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={editForm.active} onCheckedChange={(c) => setEditForm({ ...editForm, active: !!c })} id="active_check" />
              <Label htmlFor="active_check" className="text-xs">الحساب نشط</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEdit(false)} size="sm">إلغاء</Button>
            <Button onClick={handleEditSave} disabled={saving} size="sm" className="gap-1">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-3.5 h-3.5" />}حفظ التعديلات</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* === USER DETAIL DIALOG === */}
      <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Eye className="w-5 h-5 text-primary" />تفاصيل المستخدم</DialogTitle></DialogHeader>
          {detailUser && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">{detailUser.name.split(" ").map(w => w[0]).join("").slice(0, 2)}</div>
                <div>
                  <p className="font-bold text-foreground">{detailUser.name}</p>
                  <p className="text-xs text-muted-foreground" dir="ltr">{detailUser.email || "—"}</p>
                </div>
                <div className="mr-auto">
                  {detailUser.active !== false
                    ? <span className="px-2 py-1 rounded text-[10px] bg-success/10 text-success">نشط</span>
                    : <span className="px-2 py-1 rounded text-[10px] bg-destructive/10 text-destructive">معطل</span>
                  }
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/20 rounded-lg p-2.5"><p className="text-[10px] text-muted-foreground">الشعبة</p><p className="text-xs font-medium text-foreground">{detailUser.section || "—"}</p></div>
                <div className="bg-muted/20 rounded-lg p-2.5"><p className="text-[10px] text-muted-foreground">المنصب</p><p className="text-xs font-medium text-foreground">{detailUser.position || "—"}</p></div>
                <div className="bg-muted/20 rounded-lg p-2.5"><p className="text-[10px] text-muted-foreground">الهاتف</p><p className="text-xs font-medium text-foreground" dir="ltr">{detailUser.phone || "—"}</p></div>
                <div className="bg-muted/20 rounded-lg p-2.5"><p className="text-[10px] text-muted-foreground">القسم</p><p className="text-xs font-medium text-foreground">{detailUser.department || "—"}</p></div>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground mb-1.5">الأدوار والصلاحيات</p>
                <div className="flex gap-1 flex-wrap mb-2">
                  {(detailUser.roles || []).map(r => {
                    const opt = roleOptions.find(o => o.value === r);
                    return <span key={r} className="px-2 py-1 rounded bg-primary/10 text-primary text-[10px] font-medium">{opt?.label || r}</span>;
                  })}
                </div>
                <p className="text-[10px] text-muted-foreground">عدد الصلاحيات الفعّالة: {getPermissionsForRoles(detailUser.roles || []).length}</p>
              </div>
              <div className="flex gap-2 pt-2 border-t border-border">
                {has("add_user") && <Button size="sm" variant="outline" className="gap-1" onClick={() => { setShowDetail(null); openEdit(detailUser); }}><Pencil className="w-3.5 h-3.5" />تعديل</Button>}
                {isAdmin && detailUser.id !== localDb.profiles.getById(localStorage.getItem("tms_current_user_id") || "")?.id && (
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => { setShowDetail(null); impersonate(detailUser.id); }}><Shield className="w-3.5 h-3.5" />دخول كـ</Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ===== PERMISSIONS TAB (NEW COMPREHENSIVE DESIGN) =====
const PermissionsTab = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [customPerms, setCustomPerms] = useState<Record<string, string[]>>({});
  const [searchPerm, setSearchPerm] = useState("");
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(PERMISSION_CATEGORIES.map(c => c.id)));
  const [applyRoleDialog, setApplyRoleDialog] = useState(false);
  const [selectedApplyRole, setSelectedApplyRole] = useState("");

  useEffect(() => {
    setProfiles(localDb.profiles.getAll());
    try {
      const stored = localStorage.getItem("tms_custom_permissions");
      if (stored) setCustomPerms(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const selected = profiles.find(p => p.id === selectedId);

  const getEffective = (profile: UserProfile): string[] => {
    if (customPerms[profile.id]) return customPerms[profile.id];
    return getPermissionsForRoles(profile.roles);
  };

  const getDefault = (profile: UserProfile): string[] => getPermissionsForRoles(profile.roles);

  const togglePerm = (userId: string, permKey: string) => {
    setCustomPerms(prev => {
      const current = prev[userId] || getPermissionsForRoles(profiles.find(p => p.id === userId)?.roles || []);
      const updated = current.includes(permKey) ? current.filter(p => p !== permKey) : [...current, permKey];
      const next = { ...prev, [userId]: updated };
      localStorage.setItem("tms_custom_permissions", JSON.stringify(next));
      return next;
    });
  };

  const toggleCategory = (catId: string, userId: string) => {
    const catPerms = ALL_PERMISSIONS.filter(p => p.category === catId);
    const effective = getEffective(profiles.find(p => p.id === userId) || profiles[0]);
    const allOn = catPerms.every(p => effective.includes(p.key));
    setCustomPerms(prev => {
      const current = prev[userId] || getPermissionsForRoles(profiles.find(p => p.id === userId)?.roles || []);
      let updated: string[];
      if (allOn) {
        updated = current.filter(k => !catPerms.some(p => p.key === k));
      } else {
        const newKeys = catPerms.map(p => p.key).filter(k => !current.includes(k));
        updated = [...current, ...newKeys];
      }
      const next = { ...prev, [userId]: updated };
      localStorage.setItem("tms_custom_permissions", JSON.stringify(next));
      return next;
    });
  };

  const resetDefaults = (userId: string) => {
    setCustomPerms(prev => {
      const next = { ...prev };
      delete next[userId];
      localStorage.setItem("tms_custom_permissions", JSON.stringify(next));
      return next;
    });
    toast({ title: "تم", description: "تم إعادة الصلاحيات للوضع الافتراضي" });
  };

  const applyRolePermissions = () => {
    if (!selectedId || !selectedApplyRole) return;
    const rolePerms = ROLE_PERMISSIONS[selectedApplyRole] || ROLE_PERMISSIONS.individual;
    setCustomPerms(prev => {
      const next = { ...prev, [selectedId]: [...rolePerms] };
      localStorage.setItem("tms_custom_permissions", JSON.stringify(next));
      return next;
    });
    setApplyRoleDialog(false);
    setSelectedApplyRole("");
    toast({ title: "تم", description: "تم تطبيق صلاحيات الدور كنقطة بداية — يمكنك الآن تعديلها" });
  };

  const copyPermsFrom = (fromUserId: string) => {
    if (!selectedId || fromUserId === selectedId) return;
    const fromPerms = getEffective(profiles.find(p => p.id === fromUserId) || profiles[0]);
    setCustomPerms(prev => {
      const next = { ...prev, [selectedId]: [...fromPerms] };
      localStorage.setItem("tms_custom_permissions", JSON.stringify(next));
      return next;
    });
    toast({ title: "تم", description: "تم نسخ الصلاحيات — يمكنك الآن تعديلها" });
  };

  const toggleCatExpanded = (catId: string) => {
    setExpandedCats(prev => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId); else next.add(catId);
      return next;
    });
  };

  const expandAll = () => setExpandedCats(new Set(PERMISSION_CATEGORIES.map(c => c.id)));
  const collapseAll = () => setExpandedCats(new Set());

  const filteredPerms = searchPerm
    ? ALL_PERMISSIONS.filter(p => p.label.includes(searchPerm) || p.description.includes(searchPerm) || p.key.includes(searchPerm))
    : ALL_PERMISSIONS;

  const visibleCategories = PERMISSION_CATEGORIES.filter(cat =>
    filteredPerms.some(p => p.category === cat.id)
  );

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-sm text-foreground flex items-center gap-2"><Shield className="w-4 h-4 text-primary" />إدارة الصلاحيات</h3>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3">
        {/* User List */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="p-2 border-b border-border bg-muted/30 flex items-center justify-between">
            <p className="text-xs font-bold">الموظفون ({profiles.length})</p>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {profiles.map(p => {
              const eff = getEffective(p);
              const isCustom = !!customPerms[p.id];
              return (
                <button key={p.id} onClick={() => setSelectedId(p.id)}
                  className={`w-full text-right px-3 py-2.5 border-b border-border/30 text-xs transition-colors ${selectedId === p.id ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted/30"}`}>
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate">{p.name}</p>
                    {isCustom && <span className="text-[9px] text-warning bg-warning/10 rounded px-1 shrink-0">مخصّص</span>}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{p.department} • {p.roles.join(" + ")}</p>
                  <p className="text-[9px] text-muted-foreground">{eff.length}/{ALL_PERMISSIONS.length} صلاحية</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Permissions Panel */}
        <div className="lg:col-span-2 bg-card rounded-lg border border-border overflow-hidden">
          {selected ? (
            <>
              <div className="p-2.5 border-b border-border bg-muted/30">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <p className="text-xs font-bold text-foreground">{selected.name}</p>
                    <p className="text-[10px] text-muted-foreground">{selected.department} • {selected.roles.join(" + ")}</p>
                  </div>
                  <div className="flex gap-1.5 no-print">
                    {customPerms[selected.id] && (
                      <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1" onClick={() => resetDefaults(selected.id)}>
                        <RotateCcw className="w-3 h-3" />افتراضي
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1" onClick={() => setApplyRoleDialog(true)}>
                      <Copy className="w-3 h-3" />تطبيق دور
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${(getEffective(selected).length / ALL_PERMISSIONS.length) * 100}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{getEffective(selected).length}/{ALL_PERMISSIONS.length}</span>
                </div>
              </div>

              <div className="p-3 no-print flex flex-wrap gap-2 items-center">
                <div className="relative flex-1 min-w-[150px]">
                  <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                  <Input value={searchPerm} onChange={e => setSearchPerm(e.target.value)} placeholder="بحث في الصلاحيات..." className="ps-7 h-7 text-[11px]" />
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={expandAll}>توسيع الكل</Button>
                <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={collapseAll}>طي الكل</Button>
              </div>

              <div className="px-3 pb-3 max-h-[50vh] overflow-y-auto space-y-2">
                {visibleCategories.map(cat => {
                  const catPerms = filteredPerms.filter(p => p.category === cat.id);
                  if (!catPerms.length) return null;
                  const effective = getEffective(selected);
                  const catOn = catPerms.filter(p => effective.includes(p.key)).length;
                  const catTotal = catPerms.length;
                  const isExpanded = expandedCats.has(cat.id);
                  const allOn = catTotal > 0 && catOn === catTotal;

                  return (
                    <div key={cat.id} className="border border-border rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => toggleCatExpanded(cat.id)}>
                        <div className="flex items-center gap-2">
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                          <Lock className="w-3.5 h-3.5 text-primary" />
                          <span className="text-xs font-bold text-foreground">{cat.label}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${allOn ? "bg-success/10 text-success" : catOn > 0 ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"}`}>{catOn}/{catTotal}</span>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); toggleCategory(cat.id, selected.id); }}
                          className={`text-[10px] px-2 py-0.5 rounded transition-colors ${allOn ? "bg-success/20 text-success hover:bg-success/30" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                          {allOn ? "إلغاء الكل" : "تحديد الكل"}
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="p-2 space-y-1">
                          {catPerms.map(perm => {
                            const on = effective.includes(perm.key);
                            const isDefault = getDefault(selected).includes(perm.key);
                            return (
                              <div key={perm.key} className={`rounded-lg border transition-colors ${on ? "border-primary/20 bg-primary/5" : "border-border bg-muted/20"}`}>
                                <label className="flex items-start gap-2.5 px-3 py-2 cursor-pointer">
                                  <Checkbox checked={on} onCheckedChange={() => togglePerm(selected.id, perm.key)} className="mt-0.5 scale-90" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className={`text-[11px] font-medium ${on ? "text-foreground" : "text-muted-foreground"}`}>{perm.label}</span>
                                      {customPerms[selected.id] && (
                                        <span className={`text-[8px] px-1 rounded ${on !== isDefault ? (on ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive") : "bg-muted text-muted-foreground"}`}>
                                          {on !== isDefault ? (on ? "+مضافة" : "-محذوفة") : "افتراضي"}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">{perm.description}</p>
                                    <p className="text-[9px] text-muted-foreground/70 mt-0.5 italic">مثال: {perm.example}</p>
                                  </div>
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Shield className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-xs">اختر موظف من القائمة لتعديل صلاحياته</p>
            </div>
          )}
        </div>
      </div>

      {/* Apply Role Dialog */}
      <Dialog open={applyRoleDialog} onOpenChange={setApplyRoleDialog}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Copy className="w-5 h-5 text-primary" />تطبيق صلاحيات دور</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-xs text-muted-foreground">سيتم استبدال صلاحيات <strong>{selected?.name}</strong> بصلاحيات الدور المختار كنقطة بداية. يمكنك بعد ذلك تعديل أي صلاحية فردية.</p>
            <Select value={selectedApplyRole} onValueChange={setSelectedApplyRole}>
              <SelectTrigger><SelectValue placeholder="اختر الدور" /></SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_PERMISSIONS).map(([role, perms]) => (
                  <SelectItem key={role} value={role}>
                    {role === "admin" ? "مدير النظام" : role === "dept_manager" ? "مدير القسم" : role === "unit_head" ? "رئيس شعبة (عام)" : role === "prep_unit_head" ? "مسؤول شعبة الإعداد" : role === "curriculum_unit_head" ? "مسؤول شعبة المناهج" : role === "curriculum_individual" ? "موظف مناهج" : role === "prep_individual" ? "موظف إعداد" : role === "trainer" ? "مدرب" : role === "supervisor" ? "مشرف" : "فرد"} ({perms.length} صلاحية)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedApplyRole && (
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground">سيتم تفعيل {ROLE_PERMISSIONS[selectedApplyRole]?.length || 0} صلاحية من أصل {ALL_PERMISSIONS.length}</p>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setApplyRoleDialog(false)}>إلغاء</Button>
            <Button size="sm" onClick={applyRolePermissions} disabled={!selectedApplyRole} className="gap-1"><Copy className="w-3.5 h-3.5" />تطبيق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ===== TOOLS TAB =====
const ToolsTab = ({ canBackup }: { canBackup: boolean }) => {
  const [errMonVisible, setErrMonVisible] = useState(false);
  const [backupDone, setBackupDone] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [checking, setChecking] = useState(false);

  const toggleErrMon = () => {
    const next = !errMonVisible;
    setErrMonVisible(next);
    window.dispatchEvent(new CustomEvent("toggle-error-monitor", { detail: { visible: next } }));
    toast({ title: next ? "مراقب الأخطاء مفعّل" : "مراقب الأخطاء معطّل" });
  };

  const handleBackup = () => {
    if (!canBackup) { toast({ title: "غير مصرح", description: "النسخ الاحتياطي متاح لمدير القسم أو الأدمن فقط", variant: "destructive" }); return; }
    downloadFullBackup();
    setBackupDone(true);
    toast({ title: "تم", description: "تم تحميل نسخة احتياطية كاملة لجميع بيانات التطبيق" });
    setTimeout(() => setBackupDone(false), 3000);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        const res = restoreFromBackup(parsed);
        if (!res.ok) { toast({ title: "خطأ", description: res.message, variant: "destructive" }); return; }
        toast({ title: "تم", description: res.message + " — سيتم إعادة تحميل الصفحة" });
        setTimeout(() => window.location.reload(), 1000);
      } catch {
        toast({ title: "خطأ", description: "ملف النسخة الاحتياطية غير صالح", variant: "destructive" });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const pullCloud = async () => {
    setSyncing(true);
    const res = await manualPullFromCloud();
    setSyncing(false);
    toast({ title: res.ok ? "تمت المزامنة" : "فشلت المزامنة", description: res.message, variant: res.ok ? "default" : "destructive" });
  };

  const checkUpdates = async () => {
    setChecking(true);
    try {
      const r = await checkForUpdates();
      toast({ title: r.available ? "تتوفر تحديثات" : "النسخة محدّثة", description: `السحابة: ${r.cloudVersion} • المثبّت: ${r.installedVersion}` });
    } catch {
      toast({ title: "تعذّر التحقق من التحديثات", variant: "destructive" });
    }
    setChecking(false);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-sm text-foreground flex items-center gap-2"><Wrench className="w-4 h-4 text-primary" />أدوات</h3>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3">
        {/* Backup */}
        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="font-bold text-sm text-foreground mb-2 flex items-center gap-2"><Database className="w-4 h-4 text-primary" />النسخ الاحتياطي</h3>
          <p className="text-xs text-muted-foreground mb-3">حفظ نسخة احتياطية كاملة لكل بيانات التطبيق {canBackup ? "" : "(متاح لمدير القسم أو الأدمن فقط)"}</p>
          <Button onClick={handleBackup} size="sm" className="gap-1.5" disabled={!canBackup}>
            <Download className="w-3.5 h-3.5" />{backupDone ? "✓ تم" : "تحميل نسخة كاملة"}
          </Button>
        </div>

        {/* Import backup */}
        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="font-bold text-sm text-foreground mb-2 flex items-center gap-2"><FileSpreadsheet className="w-4 h-4 text-accent" />استيراد نسخة احتياطية</h3>
          <p className="text-xs text-muted-foreground mb-3">استعادة جميع البيانات من ملف نسخة احتياطية</p>
          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20">
            <Upload className="w-3.5 h-3.5" />استيراد
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
        </div>

        {/* Pull from cloud */}
        <button onClick={pullCloud} disabled={syncing} className="bg-card border border-border rounded-lg p-3 flex items-center gap-3 hover:shadow-md transition-all text-right disabled:opacity-60">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            {syncing ? <Loader2 className="w-4 h-4 text-primary animate-spin" /> : <DownloadCloud className="w-4 h-4 text-primary" />}
          </div>
          <div><p className="text-xs font-bold">سحب من السحابة الآن</p><p className="text-[10px] text-muted-foreground">تحديث البيانات المحلية من السحابة</p></div>
        </button>

        {/* Check updates */}
        <button onClick={checkUpdates} disabled={checking} className="bg-card border border-border rounded-lg p-3 flex items-center gap-3 hover:shadow-md transition-all text-right disabled:opacity-60">
          <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
            {checking ? <Loader2 className="w-4 h-4 text-accent animate-spin" /> : <RefreshCw className="w-4 h-4 text-accent" />}
          </div>
          <div><p className="text-xs font-bold">التحقق من التحديثات</p><p className="text-[10px] text-muted-foreground">فحص توفر نسخة أحدث</p></div>
        </button>

        {/* Error monitor */}
        <button onClick={toggleErrMon} className="bg-card border border-border rounded-lg p-3 flex items-center gap-3 hover:shadow-md transition-all text-right">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${errMonVisible ? "bg-warning/10" : "bg-muted"}`}><Bug className={`w-4 h-4 ${errMonVisible ? "text-warning" : "text-muted-foreground"}`} /></div>
          <div><p className="text-xs font-bold">مراقب الأخطاء</p><p className="text-[10px] text-muted-foreground">{errMonVisible ? "مفعّل" : "معطّل"}</p></div>
        </button>
      </div>
    </div>
  );
};

export default Settings;

