import { useState, useEffect, useCallback } from "react";
import { localDb, defaultUserAccounts } from "@/lib/localStore";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Users, UserPlus, Shield, Loader2, RefreshCw } from "lucide-react";

interface UserWithRoles {
  id: string;
  name: string;
  department: string;
  position: string;
  roles: string[];
}

const ALL_ROLES = [
  { value: "admin", label: "مدير النظام" },
  { value: "dept_manager", label: "مدير قسم" },
  { value: "unit_head", label: "رئيس شعبة" },
  { value: "trainer", label: "مدرب" },
  { value: "supervisor", label: "مشرف" },
  { value: "general_admin", label: "مدير عام" },
  { value: "training_admin", label: "مسؤول تدريب" },
  { value: "super_user", label: "مستخدم متميز" },
];

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRolesDialog, setShowRolesDialog] = useState<UserWithRoles | null>(null);
  
  const [newUser, setNewUser] = useState({ email: "", password: "", name: "", department: "", position: "" });
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    try {
      const profiles = localDb.profiles.getAll();
      const mapped: UserWithRoles[] = profiles.map((p) => ({
        id: p.id,
        name: p.name || "مستخدم",
        department: p.department || "",
        position: p.position || "",
        roles: p.roles || [],
      }));
      setUsers(mapped);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Error fetching users:", error);
      toast({ title: "خطأ", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.name) {
      toast({ title: "نقص بيانات", description: "املأ الحقول المطلوبة", variant: "destructive" });
      return;
    }
    setSaving(true);
    const id = `emp-${Date.now()}`;
    const profile = { id, name: newUser.name, department: newUser.department, section: newUser.department, position: newUser.position, phone: "", roles: ["individual"] };

    localDb.employees.insert({
      id,
      name: newUser.name,
      department: newUser.department,
      section: newUser.department,
      position: newUser.position,
      phone: "",
      work_schedule: "daily",
    });
    localDb.profiles.insert(profile);
    localDb.userAccounts.insert({
      email: newUser.email,
      password: newUser.password,
      profile,
    });
    toast({ title: "تم", description: "تم إنشاء المستخدم بنجاح" });
    setShowAddDialog(false);
    setNewUser({ email: "", password: "", name: "", department: "", position: "" });
    fetchUsers();
    setSaving(false);
  };

  const openRolesDialog = (user: UserWithRoles) => {
    setShowRolesDialog(user);
    setSelectedRoles([...user.roles]);
  };

  const handleSaveRoles = async () => {
    if (!showRolesDialog) return;
    setSaving(true);
    const userId = showRolesDialog.id;
    try {
      localDb.profiles.update(userId, { roles: selectedRoles });
      const accounts = localDb.userAccounts.getAll();
      const account = accounts.find(a => a.profile.id === userId);
      if (account) {
        localDb.userAccounts.updateByEmail(account.email, { profile: { ...account.profile, roles: selectedRoles } });
      }
      toast({ title: "تم", description: "تم التحديث" });
      setShowRolesDialog(null);
      fetchUsers();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Error saving roles:", error);
      toast({ title: "خطأ", description: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) => prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]);
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="w-6 h-6" /> إدارة المستخدمين</h1>
        <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={fetchUsers}><RefreshCw className="w-4 h-4" /></Button>
            <Button onClick={() => setShowAddDialog(true)} className="gap-2"><UserPlus className="w-4 h-4" /> مستخدم جديد</Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <table className="w-full text-sm text-right">
          <thead className="bg-muted text-muted-foreground">
            <tr><th className="p-3">الاسم</th><th className="p-3">القسم</th><th className="p-3">الأدوار</th><th className="p-3">تحكم</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t hover:bg-muted/50">
                <td className="p-3 font-medium">{u.name}</td>
                <td className="p-3">{u.department}</td>
                <td className="p-3 flex gap-1 flex-wrap">
                  {u.roles.map(r => <span key={r} className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs">{ALL_ROLES.find(ar => ar.value === r)?.label || r}</span>)}
                </td>
                <td className="p-3"><Button variant="ghost" size="sm" onClick={() => openRolesDialog(u)}><Shield className="w-4 h-4 ml-1" /> تعديل</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>إضافة موظف جديد</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Input placeholder="الاسم الكامل" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} />
            <Select onValueChange={(v) => setNewUser({...newUser, department: v})}>
                <SelectTrigger><SelectValue placeholder="اختر القسم (هام للصلاحيات)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="شعبة الإعداد والتدريب">شعبة الإعداد والتدريب</SelectItem>
                  <SelectItem value="شعبة المناهج">شعبة المناهج</SelectItem>
                  <SelectItem value="الإدارة">الإدارة العامة</SelectItem>
                </SelectContent>
            </Select>
            <Input type="email" placeholder="البريد الإلكتروني" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} dir="ltr" />
            <Input type="password" placeholder="كلمة المرور" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} dir="ltr" />
          </div>
          <DialogFooter><Button onClick={handleAddUser} disabled={saving}>{saving ? <Loader2 className="animate-spin" /> : "حفظ"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!showRolesDialog} onOpenChange={() => setShowRolesDialog(null)}>
        <DialogContent>
            <div className="space-y-3">
            {ALL_ROLES.map((role) => (
                <label key={role.value} className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                <Checkbox checked={selectedRoles.includes(role.value)} onCheckedChange={() => toggleRole(role.value)} /><span>{role.label}</span>
                </label>
            ))}
            <Button onClick={handleSaveRoles} disabled={saving} className="w-full mt-4">حفظ التغييرات</Button>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
