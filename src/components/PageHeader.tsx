import { useState, useRef, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Printer, Download, Eye } from "lucide-react";
import * as XLSX from "xlsx";

interface PrintSection {
  id: string;
  label: string;
  defaultChecked?: boolean;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  sections?: PrintSection[];
  exportData?: () => { rows: Record<string, unknown>[]; filename: string; sheetName?: string };
  actions?: React.ReactNode;
}

const handleExportExcel = (getData: () => { rows: Record<string, unknown>[]; filename: string; sheetName?: string }) => {
  const { rows, filename, sheetName } = getData();
  if (!rows.length) return;
  const ws = XLSX.utils.json_to_sheet(rows);
  const colWidths = Object.keys(rows[0]).map(k => ({
    wch: Math.max(k.length, ...rows.map(r => String(r[k] || "").length)).valueOf() + 2,
  }));
  ws["!cols"] = colWidths;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName || "Sheet1");
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

const PageHeader = ({ title, subtitle, icon: Icon, sections, exportData, actions }: PageHeaderProps) => {
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [checkedSections, setCheckedSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (sections) {
      const initial: Record<string, boolean> = {};
      sections.forEach(s => { initial[s.id] = s.defaultChecked !== false; });
      setCheckedSections(initial);
    }
  }, [sections]);

  const toggleSection = (id: string) => {
    setCheckedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePrint = () => {
    if (sections && sections.length > 0) {
      setShowPrintDialog(true);
    } else {
      window.print();
    }
  };

  const confirmPrint = () => {
    document.querySelectorAll("[data-print-section]").forEach(el => {
      const sectionId = el.getAttribute("data-print-section");
      if (sectionId) {
        if (checkedSections[sectionId] === false) {
          el.classList.add("print-excluded");
        } else {
          el.classList.remove("print-excluded");
        }
      }
    });
    const maxHElements = document.querySelectorAll("[class*='max-h-']");
    const originals = new Map<Element, string>();
    maxHElements.forEach(el => {
      const cs = (el as HTMLElement).style.maxHeight;
      originals.set(el, cs || "");
      (el as HTMLElement).style.maxHeight = "none";
    });
    setShowPrintDialog(false);
    const restoreMaxH = () => {
      originals.forEach((cs, el) => {
        (el as HTMLElement).style.maxHeight = cs || "";
      });
      document.querySelectorAll(".print-excluded").forEach(el => {
        el.classList.remove("print-excluded");
      });
      window.removeEventListener("afterprint", restoreMaxH);
    };
    window.addEventListener("afterprint", restoreMaxH);
    setTimeout(() => window.print(), 150);
  };

  const selectAll = () => {
    const all: Record<string, boolean> = {};
    sections?.forEach(s => { all[s.id] = true; });
    setCheckedSections(all);
  };

  const deselectAll = () => {
    const none: Record<string, boolean> = {};
    sections?.forEach(s => { none[s.id] = false; });
    setCheckedSections(none);
  };

  const checkedCount = Object.values(checkedSections).filter(Boolean).length;
  const totalCount = sections?.length || 0;

  const todayStr = new Date().toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });

  return (
    <>
      <div className="print-only-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <strong>{title}</strong>
          <span>{todayStr}</span>
        </div>
      </div>
      <div className="shrink-0 mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-base font-bold text-foreground flex items-center gap-2">
            {Icon && <Icon className="w-5 h-5 text-primary" />}{title}
          </h1>
          {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex gap-1.5 no-print shrink-0 items-center">
          {actions}
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handlePrint}>
            <Printer className="w-3.5 h-3.5" />طباعة
          </Button>
          {exportData && (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleExportExcel(exportData)}>
              <Download className="w-3.5 h-3.5" />Excel
            </Button>
          )}
        </div>
      </div>

      <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-primary" />
              تخصيص الطباعة
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <p className="text-xs text-muted-foreground">اختر الأقسام التي تريد طباعتها:</p>

            <div className="flex gap-2 mb-2">
              <Button variant="outline" size="sm" className="text-[10px] h-6" onClick={selectAll}>تحديد الكل</Button>
              <Button variant="outline" size="sm" className="text-[10px] h-6" onClick={deselectAll}>إلغاء الكل</Button>
            </div>

            <div className="space-y-1.5 flex-1 overflow-y-auto">
              {sections?.map(section => (
                <label
                  key={section.id}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                    checkedSections[section.id]
                      ? "border-primary/30 bg-primary/5 text-foreground"
                      : "border-border bg-muted/20 text-muted-foreground"
                  }`}
                >
                  <Checkbox
                    checked={checkedSections[section.id]}
                    onCheckedChange={() => toggleSection(section.id)}
                  />
                  <span className="text-sm">{section.label}</span>
                </label>
              ))}
            </div>

            {sections && sections.length > 0 && (
              <div className="bg-muted/30 rounded-lg px-3 py-2 flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground">
                  سيتم طباعة {checkedCount} من {totalCount} قسم
                </span>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowPrintDialog(false)}>إلغاء</Button>
            <Button size="sm" onClick={confirmPrint} disabled={checkedCount === 0} className="gap-1.5">
              <Printer className="w-3.5 h-3.5" />طباعة ({checkedCount})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PageHeader;

