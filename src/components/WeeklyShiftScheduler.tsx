import { useEmployees } from "@/hooks/useSupabaseData";
import { localDb } from "@/lib/localStore";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { CalendarDays, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

// Weekly per-employee shift assignment, stored in localStorage under tms_weekly_shifts.
// Key format: `${isoWeekStart}|${employeeId}` -> "morning" | "evening" | "off" | "day".
const STORAGE_KEY = "tms_weekly_shifts";
const SHIFTS = [
  { value: "day", label: "صباحي" },
  { value: "evening", label: "مسائي" },
  { value: "off", label: "إجازة أسبوعية" },
];

function getMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function loadAll(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}
function saveAll(map: Record<string, string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export default function WeeklyShiftScheduler() {
  const { data: employees } = useEmployees();
  const { has, section, isManager } = useUserRole();
  const canEdit = has("change_attendance");

  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [allMap, setAllMap] = useState<Record<string, string>>({});

  useEffect(() => { setAllMap(loadAll()); }, []);

  const weekKey = weekStart.toISOString().split("T")[0];

  const eligibleEmployees = useMemo(() => {
    return employees.filter(e => {
      // Only show shift-based employees in scheduler. Daily workers don't need a shift.
      if (e.work_schedule === "daily") return false;
      if (!isManager && section) return e.section === section;
      return true;
    });
  }, [employees, isManager, section]);

  useEffect(() => {
    const next: Record<string, string> = {};
    eligibleEmployees.forEach(e => {
      next[e.id] = allMap[`${weekKey}|${e.id}`] || "day";
    });
    setAssignments(next);
  }, [weekKey, eligibleEmployees, allMap]);

  const shiftWeek = (delta: number) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + delta * 7);
    setWeekStart(getMonday(d));
  };

  const handleSave = () => {
    const updated = { ...allMap };
    Object.entries(assignments).forEach(([empId, val]) => {
      updated[`${weekKey}|${empId}`] = val;
    });
    saveAll(updated);
    setAllMap(updated);
    toast({ title: "تم الحفظ", description: `تم حفظ جدولة الشِفت للأسبوع ${weekKey}` });
  };

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  return (
    <div className="space-y-3" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-sm">
          <CalendarDays className="w-4 h-4 text-primary" />
          <span className="font-semibold">جدولة الشِفت الأسبوعية:</span>
          <span className="text-muted-foreground">{weekKey} → {weekEnd.toISOString().split("T")[0]}</span>
        </div>
        <div className="flex gap-1.5">
          <Button size="sm" variant="outline" onClick={() => shiftWeek(-1)}>الأسبوع السابق</Button>
          <Button size="sm" variant="outline" onClick={() => setWeekStart(getMonday(new Date()))}>هذا الأسبوع</Button>
          <Button size="sm" variant="outline" onClick={() => shiftWeek(1)}>الأسبوع التالي</Button>
          {canEdit && <Button size="sm" className="gap-1.5" onClick={handleSave}><Save className="w-3.5 h-3.5" />حفظ</Button>}
        </div>
      </div>

      {eligibleEmployees.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">لا يوجد موظفون على نظام الوجبات لجدولتهم</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>الموظف</th><th>الشعبة</th><th>نظام العمل</th><th>شِفت الأسبوع</th></tr></thead>
            <tbody>
              {eligibleEmployees.map(e => (
                <tr key={e.id}>
                  <td className="font-medium">{e.name}</td>
                  <td>{e.section}</td>
                  <td className="text-muted-foreground text-xs">{e.work_schedule}</td>
                  <td>
                    {canEdit ? (
                      <Select value={assignments[e.id] || "day"} onValueChange={(v) => setAssignments(s => ({ ...s, [e.id]: v }))}>
                        <SelectTrigger className="w-36 h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {SHIFTS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-sm">{SHIFTS.find(s => s.value === (assignments[e.id] || "day"))?.label}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
