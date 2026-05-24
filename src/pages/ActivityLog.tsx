import { useAuditLog } from "@/hooks/useSupabaseData";
import PageHeader from "@/components/PageHeader";
import { Loader2, FileText, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState, useMemo } from "react";
import { Input } from "@/components/ui/input";

const ActivityLog = () => {
  const { data: logs, loading, refetch } = useAuditLog();
  const intervalRef = useRef<NodeJS.Timeout>();
  const [search, setSearch] = useState("");

  useEffect(() => {
    intervalRef.current = setInterval(() => refetch(), 10000);
    return () => clearInterval(intervalRef.current);
  }, [refetch]);

  const filteredLogs = useMemo(() => {
    let result = logs;
    if (search) {
      result = result.filter(l =>
        l.user_name.includes(search) || l.action.includes(search) || l.target.includes(search)
      );
    }
    return result;
  }, [logs, search]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <PageHeader title="سجل النشاط" subtitle="جميع العمليات المسجلة (يتحدث كل 10 ثوانٍ)" icon={FileText} sections={[
        { id: "log_search", label: "البحث" },
        { id: "log_table", label: "جدول السجل" },
      ]} exportData={() => ({
        filename: "activity-log",
        rows: filteredLogs.map(l => ({ المستخدم: l.user_name, الإجراء: l.action, الهدف: l.target, التاريخ: new Date(l.timestamp).toLocaleString("ar-SA") }))
      })} />
      <div className="flex items-center justify-between flex-wrap gap-4 no-print">
        <div className="relative max-w-sm">
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث في السجل..." className="ps-3" />
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4" />تحديث
        </Button>
      </div>

      <div data-print-section="log_table" className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>المستخدم</th><th>الإجراء</th><th>الهدف</th><th>التاريخ</th></tr></thead>
            <tbody>
              {filteredLogs.length > 0 ? filteredLogs.map(log => (
                <tr key={log.id}>
                  <td className="font-medium text-foreground">{log.user_name}</td>
                  <td className="text-foreground">{log.action}</td>
                  <td className="text-muted-foreground">{log.target}</td>
                  <td className="text-muted-foreground text-xs">{new Date(log.timestamp).toLocaleString("ar-SA")}</td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">لا توجد سجلات</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
