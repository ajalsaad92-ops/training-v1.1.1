import { useState, useRef } from "react";
import { useCorrespondence, type CorrespondenceItem } from "@/hooks/useSupabaseData";
import { correspondenceSchema, sanitizeExcelRow } from "@/lib/validation";
import StatusBadge from "@/components/StatusBadge";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { localDb } from "@/lib/localStore";
import { Archive, Search, Plus, Upload, Eye, Loader2, FileSpreadsheet } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import * as XLSX from "xlsx";

const typeLabels: Record<string, string> = { outgoing_internal: "صادر داخلي", outgoing_external: "صادر خارجي", incoming_internal: "وارد داخلي", incoming_external: "وارد خارجي" };
const statusLabels: Record<string, string> = { done: "منجز", in_progress: "قيد الإجراء", archived: "حفظ" };

const emptyForm = { number: "", subject: "", from: "", to: "", type: "incoming_internal", status: "in_progress", summary: "", date: "" };

const Correspondence = () => {
  const { data: items, loading, refetch } = useCorrespondence();
  const { has } = useUserRole();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [selected, setSelected] = useState<CorrespondenceItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [importedItems, setImportedItems] = useState<CorrespondenceItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs = [{ key: "all", label: "الكل" }, { key: "incoming", label: "الوارد" }, { key: "outgoing", label: "الصادر" }];

  const allItems = [...items, ...importedItems];

  const filtered = allItems.filter((c) => {
    const matchSearch = c.subject.includes(search) || c.number.includes(search);
    const matchTab = tab === "all" || (tab === "incoming" && c.type.startsWith("incoming")) || (tab === "outgoing" && c.type.startsWith("outgoing"));
    return matchSearch && matchTab;
  });

  const handleSave = async () => {
    const result = correspondenceSchema.safeParse({ ...form, date: form.date || new Date().toISOString().split("T")[0] });
    if (!result.success) {
      toast({ title: "خطأ", description: result.error.errors[0].message, variant: "destructive" });
      return;
    }
    setSaving(true);
    localDb.correspondence.insert(result.data);
    toast({ title: "تم", description: "تم إضافة المراسلة" });
    setSaving(false);
    setShowForm(false);
    setForm(emptyForm);
    refetch();
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
      const mapped = jsonData.map((row: Record<string, unknown>, i: number) => {
        const s = sanitizeExcelRow(row);
        return {
          id: `imported-${Date.now()}-${i}`,
          number: (s["الرقم"] || s["number"] || `IMP-${i + 1}`).slice(0, 50),
          date: (s["التاريخ"] || s["date"] || new Date().toISOString().split("T")[0]).slice(0, 20),
          subject: (s["الموضوع"] || s["subject"] || "—").slice(0, 300),
          from: (s["من"] || s["from"] || "—").slice(0, 200),
          to: (s["إلى"] || s["to"] || "—").slice(0, 200),
          type: "incoming_internal",
          status: "in_progress",
          summary: (s["الملخص"] || s["summary"] || "").slice(0, 1000),
          created_by: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });
      setImportedItems(mapped);
      toast({ title: "تم", description: `تم استيراد ${mapped.length} مراسلة من الملف` });
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <PageHeader title="الإعداد والأرشيف" subtitle="إدارة المراسلات والكتب الرسمية" icon={Archive} sections={[
        { id: "search_filter", label: "البحث والفلترة" },
        { id: "correspondence_list", label: "قائمة المراسلات" },
      ]} exportData={() => ({
        filename: "correspondence",
        rows: filtered.map(c => ({ الرقم: c.number, التاريخ: c.date, الموضوع: c.subject, من: c.from, إلى: c.to, النوع: typeLabels[c.type] || c.type, الحالة: statusLabels[c.status] || c.status, الملخص: c.summary || "" }))
      })} />
      <div className="flex items-center justify-end flex-wrap gap-4 no-print">
        <div className="flex gap-2">
          {has("import_correspondence_excel") && (<><Button variant="outline" size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()}><FileSpreadsheet className="w-4 h-4" />استيراد Excel</Button>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImportExcel} /></>)}
          {has("add_correspondence") && <Button size="sm" className="gap-2" onClick={() => setShowForm(true)}><Plus className="w-4 h-4" />مراسلة جديدة</Button>}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-4 flex flex-wrap gap-3 items-center no-print">
        <div className="flex gap-2">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{t.label}</button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث بالموضوع أو الرقم..." className="ps-9" />
        </div>
      </div>

      <div data-print-section="correspondence_list" className="bg-card rounded-xl border border-border overflow-hidden print-content">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>الرقم</th><th>التاريخ</th><th>الموضوع</th><th>من</th><th>إلى</th><th>النوع</th><th>الحالة</th><th className="no-print">إجراءات</th></tr></thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((item) => (
                <tr key={item.id}>
                  <td className="font-medium text-foreground font-mono text-xs">{item.number}</td>
                  <td className="text-muted-foreground">{item.date}</td>
                  <td className="font-medium text-foreground max-w-[250px] truncate">{item.subject}</td>
                  <td className="text-muted-foreground">{item.from}</td>
                  <td className="text-muted-foreground">{item.to}</td>
                  <td><StatusBadge status={typeLabels[item.type] || item.type} variant="info" /></td>
                  <td><StatusBadge status={statusLabels[item.status] || item.status} /></td>
                   <td className="no-print">
                     <div className="flex gap-1">
                       <button onClick={() => setSelected(item)} className="p-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors" title="عرض"><Eye className="w-3.5 h-3.5" /></button>
                       {has("upload_correspondence_attachment") && <button onClick={() => toast({ title: "تم", description: "تم رفع المرفق (محاكاة)" })} className="p-1.5 rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-colors" title="رفع مرفق"><Upload className="w-3.5 h-3.5" /></button>}
                     </div>
                   </td>
                </tr>
              )) : (
                <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">لا توجد مراسلات</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Correspondence Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>مراسلة جديدة</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>الرقم</Label><Input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} /></div>
              <div><Label>التاريخ</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            </div>
            <div><Label>الموضوع</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>من</Label><Input value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} /></div>
              <div><Label>إلى</Label><Input value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} /></div>
            </div>
            <div>
              <Label>النوع</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="incoming_internal">وارد داخلي</SelectItem>
                  <SelectItem value="incoming_external">وارد خارجي</SelectItem>
                  <SelectItem value="outgoing_internal">صادر داخلي</SelectItem>
                  <SelectItem value="outgoing_external">صادر خارجي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>الملخص</Label><Textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={2} /></div>
            <Button onClick={handleSave} disabled={saving} className="w-full">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "إضافة"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>تفاصيل المراسلة</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              {[["الرقم", selected.number], ["التاريخ", selected.date], ["الموضوع", selected.subject], ["من", selected.from], ["إلى", selected.to], ["النوع", typeLabels[selected.type] || selected.type], ["الملخص", selected.summary]].map(([label, value]) => (
                <div key={label}><p className="text-muted-foreground text-xs">{label}</p><p className="font-medium text-foreground">{value}</p></div>
              ))}
              <div><p className="text-muted-foreground text-xs">الحالة</p><StatusBadge status={statusLabels[selected.status] || selected.status} /></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Correspondence;
