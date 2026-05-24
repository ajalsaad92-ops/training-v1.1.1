import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { localDb } from "@/lib/localStore";
import type { ArchiveDocument, ArchiveDocType, ArchivePart, ArchiveSection, ArchiveYear } from "@/lib/localStore";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import {
  FolderArchive, Search, Plus, Eye, Loader2, FileSpreadsheet,
  BarChart3, FileText, Download, Trash2, Edit3, ChevronRight, ChevronLeft,
  ChevronDown, ChevronUp, ArrowUpRight, ArrowDownRight, ShieldAlert,
  FileCheck, FolderOpen, Hash, Calendar, Building2, Layers,
  Send, Inbox, Lock, Printer, Clock,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, AreaChart, Area } from "recharts";
import * as XLSX from "xlsx";

const DOC_TYPE_LABELS: Record<string, string> = {
  "1": "صادر عام", "2": "صادر سري", "3": "وارد عام", "4": "وارد سري",
  "5": "صادر سري وشخصي", "6": "وارد سري وشخصي", "7": "صادر سري للغاية", "8": "وارد سري للغاية",
};

const DOC_TYPE_COLORS: Record<string, string> = {
  "1": "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  "2": "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  "3": "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  "4": "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  "5": "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  "6": "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  "7": "bg-red-200 text-red-900 dark:bg-red-900/60 dark:text-red-200",
  "8": "bg-red-200 text-red-900 dark:bg-red-900/60 dark:text-red-200",
};

const DOC_TYPE_ROW_BORDER: Record<string, string> = {
  "1": "border-r-4 border-r-blue-500",
  "2": "border-r-4 border-r-orange-500",
  "3": "border-r-4 border-r-green-500",
  "4": "border-r-4 border-r-red-500",
  "5": "border-r-4 border-r-orange-600",
  "6": "border-r-4 border-r-red-600",
  "7": "border-r-4 border-r-red-800",
  "8": "border-r-4 border-r-red-800",
};

const DOC_TYPE_BANNER_COLORS: Record<string, string> = {
  "1": "from-blue-500 to-blue-600",
  "2": "from-orange-500 to-orange-600",
  "3": "from-green-500 to-green-600",
  "4": "from-red-500 to-red-600",
  "5": "from-orange-600 to-orange-700",
  "6": "from-red-600 to-red-700",
  "7": "from-red-800 to-red-900",
  "8": "from-red-800 to-red-900",
};

const CHART_TYPE_COLORS: Record<string, string> = {
  "1": "#3b82f6", "2": "#f97316", "3": "#22c55e", "4": "#ef4444",
  "5": "#fb923c", "6": "#f87171", "7": "#dc2626", "8": "#b91c1c",
};

const emptyDocForm = {
  docType: "", docYear: "", docNum: "", docDateCH: "", docDateHig: "",
  docSubj: "", docTo: "", docSorse: "", storedNum: "", stordPlace: "",
  folderNum: "", docPath: "", pId: "", secId: "", forCheck: "0",
};

const PAGE_SIZE = 20;

const AnimatedCounter = ({ value, duration = 800 }: { value: number; duration?: number }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const startTime = performance.now();
    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    return () => { start = value; };
  }, [value, duration]);
  return <span>{display}</span>;
};

const StatCard = ({ icon: Icon, label, value, gradient, iconColor }: {
  icon: React.ElementType; label: string; value: number; gradient: string; iconColor: string;
}) => (
  <div className={`relative overflow-hidden rounded-xl p-4 bg-gradient-to-br ${gradient} text-white shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group`}>
    <div className="absolute top-0 left-0 w-20 h-20 rounded-full bg-white/10 -translate-x-6 -translate-y-6 group-hover:scale-125 transition-transform duration-500" />
    <div className="relative flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-white/80 mb-1">{label}</p>
        <p className="text-3xl font-bold"><AnimatedCounter value={value} /></p>
      </div>
      <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
    </div>
  </div>
);

const QuickFilterChip = ({ label, active, onClick, colorClass }: {
  label: string; active: boolean; onClick: () => void; colorClass?: string;
}) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap ${
      active
        ? colorClass || "bg-primary text-primary-foreground shadow-sm"
        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-border"
    }`}
  >
    {label}
  </button>
);

const FormStepIndicator = ({ currentStep, steps }: { currentStep: number; steps: string[] }) => (
  <div className="flex items-center gap-1 mb-4" dir="rtl">
    {steps.map((step, i) => (
      <div key={i} className="flex items-center gap-1">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${
          i <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        }`}>
          <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold">{i + 1}</span>
          <span className="hidden sm:inline">{step}</span>
        </div>
        {i < steps.length - 1 && <div className={`w-4 h-0.5 ${i < currentStep ? "bg-primary" : "bg-muted"}`} />}
      </div>
    ))}
  </div>
);

const TimelineItem = ({ doc, partNameMap }: { doc: ArchiveDocument; partNameMap: Record<string, string> }) => (
  <div className="flex gap-3 group">
    <div className="flex flex-col items-center">
      <div className={`w-3 h-3 rounded-full ${doc.docType === "3" || doc.docType === "4" || doc.docType === "6" || doc.docType === "8" ? "bg-green-500" : "bg-blue-500"} ring-2 ring-background`} />
      <div className="w-px h-full bg-border group-last:hidden" />
    </div>
    <div className="flex-1 pb-4">
      <div className="flex items-center gap-2 mb-0.5">
        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-medium ${DOC_TYPE_COLORS[doc.docType] || "bg-muted text-muted-foreground"}`}>
          {DOC_TYPE_LABELS[doc.docType] || "—"}
        </span>
        <span className="text-[10px] text-muted-foreground">{doc.docDateCH}</span>
      </div>
      <p className="text-xs font-medium text-foreground truncate">{doc.docSubj}</p>
      <p className="text-[10px] text-muted-foreground">{partNameMap[doc.pId] || "—"}</p>
    </div>
  </div>
);

const Archive = () => {
  const { has, userName } = useUserRole();
  const { user } = useAuth();

  const [documents, setDocuments] = useState<ArchiveDocument[]>([]);
  const [docTypes, setDocTypes] = useState<ArchiveDocType[]>([]);
  const [parts, setParts] = useState<ArchivePart[]>([]);
  const [sections, setSections] = useState<ArchiveSection[]>([]);
  const [years, setYears] = useState<ArchiveYear[]>([]);

  const [activeTab, setActiveTab] = useState("search");
  const [searchText, setSearchText] = useState("");
  const [filterDocType, setFilterDocType] = useState("all");
  const [filterDocYear, setFilterDocYear] = useState("all");
  const [filterPId, setFilterPId] = useState("all");
  const [filterSecId, setFilterSecId] = useState("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedDoc, setSelectedDoc] = useState<ArchiveDocument | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [docForm, setDocForm] = useState(emptyDocForm);
  const [saving, setSaving] = useState(false);
  const [addFormPId, setAddFormPId] = useState("");
  const [addFormStep, setAddFormStep] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshData = useCallback(() => {
    setDocuments(localDb.archiveDocuments.getAll());
    setDocTypes(localDb.archiveDocTypes.getAll());
    setParts(localDb.archiveParts.getAll());
    setSections(localDb.archiveSections.getAll());
    setYears(localDb.archiveYears.getAll());
  }, []);

  useEffect(() => { refreshData(); }, [refreshData]);

  const partNameMap = useMemo(() => {
    const m: Record<string, string> = {};
    parts.forEach(p => { m[p.id] = p.label; });
    return m;
  }, [parts]);

  const sectionNameMap = useMemo(() => {
    const m: Record<string, string> = {};
    sections.forEach(s => { m[s.id] = s.label; });
    return m;
  }, [sections]);

  const filteredSections = useMemo(() => {
    if (filterPId === "all") return sections;
    return sections.filter(s => s.pId === filterPId);
  }, [sections, filterPId]);

  const addFormSections = useMemo(() => {
    if (!addFormPId) return [];
    return sections.filter(s => s.pId === addFormPId);
  }, [sections, addFormPId]);

  const outgoingCount = useMemo(() => documents.filter(d => ["1", "2", "5", "7"].includes(d.docType)).length, [documents]);
  const incomingCount = useMemo(() => documents.filter(d => ["3", "4", "6", "8"].includes(d.docType)).length, [documents]);
  const secretCount = useMemo(() => documents.filter(d => ["2", "4", "5", "6", "7", "8"].includes(d.docType)).length, [documents]);

  const quickFilterChips = useMemo(() => {
    const recentYears = years.slice(-3);
    return [
      { label: "صادر", type: "outgoing", colorClass: "bg-blue-500 text-white shadow-sm" },
      { label: "وارد", type: "incoming", colorClass: "bg-green-500 text-white shadow-sm" },
      { label: "سري", type: "secret", colorClass: "bg-red-500 text-white shadow-sm" },
      ...recentYears.map(y => ({ label: y.label, type: `year_${y.id}`, colorClass: "bg-accent text-accent-foreground shadow-sm" })),
    ];
  }, [years]);

  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);

  useEffect(() => {
    if (activeQuickFilter === "outgoing") setFilterDocType("1");
    else if (activeQuickFilter === "incoming") setFilterDocType("3");
    else if (activeQuickFilter === "secret") setFilterDocType("2");
    else if (activeQuickFilter?.startsWith("year_")) {
      const yearId = activeQuickFilter.replace("year_", "");
      setFilterDocYear(yearId);
    } else {
      setFilterDocType("all");
      setFilterDocYear("all");
    }
  }, [activeQuickFilter]);

  const filteredDocs = useMemo(() => {
    let result = documents.filter(doc => {
      if (filterDocType !== "all" && doc.docType !== filterDocType) return false;
      if (filterDocYear !== "all" && doc.docYear !== filterDocYear) return false;
      if (filterPId !== "all" && doc.pId !== filterPId) return false;
      if (filterSecId !== "all" && doc.secId !== filterSecId) return false;
      if (filterDateFrom && doc.docDateCH < filterDateFrom) return false;
      if (filterDateTo && doc.docDateCH > filterDateTo) return false;
      if (searchText) {
        const s = searchText.toLowerCase();
        const match = (doc.docNum || "").toLowerCase().includes(s)
          || (doc.docSubj || "").toLowerCase().includes(s)
          || (doc.docTo || "").toLowerCase().includes(s)
          || (doc.docSorse || "").toLowerCase().includes(s);
        if (!match) return false;
      }
      return true;
    });

    if (activeQuickFilter === "outgoing") result = result.filter(d => ["1", "2", "5", "7"].includes(d.docType));
    else if (activeQuickFilter === "incoming") result = result.filter(d => ["3", "4", "6", "8"].includes(d.docType));
    else if (activeQuickFilter === "secret") result = result.filter(d => ["2", "4", "5", "6", "7", "8"].includes(d.docType));

    return result.sort((a, b) => (b.dateOfAdd || "").localeCompare(a.dateOfAdd || ""));
  }, [documents, filterDocType, filterDocYear, filterPId, filterSecId, filterDateFrom, filterDateTo, searchText, activeQuickFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredDocs.length / PAGE_SIZE));
  const paginatedDocs = filteredDocs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => { setCurrentPage(1); }, [searchText, filterDocType, filterDocYear, filterPId, filterSecId, filterDateFrom, filterDateTo, activeQuickFilter]);

  const generateOutgoingNumber = useCallback((typeId: string, yearId: string) => {
    if (!["1", "2", "5", "7"].includes(typeId) || !yearId) return "";
    
    const outgoingDocs = documents.filter(d => ["1", "2", "5", "7"].includes(d.docType) && d.docYear === yearId);
    let maxSeq = 0;
    outgoingDocs.forEach(d => {
      if (d.docNum && d.docNum.includes("/")) {
        const parts = d.docNum.split("/");
        const numPart = parts[parts.length - 1];
        const num = parseInt(numPart, 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    });
    
    const nextSeq = String(maxSeq + 1).padStart(3, "0");
    const prefix = typeId === "1" ? "ص" : (typeId === "2" ? "ص/س" : (typeId === "5" ? "ص/س/ش" : "ص/س/ل"));
    return `${prefix}/${yearId}/${nextSeq}`;
  }, [documents]);

  const handleSaveDoc = () => {
    if (!has(showEditForm ? "edit_archive" : "add_archive")) {
      toast({ title: "خطأ", description: "ليس لديك صلاحية حفظ وثيقة", variant: "destructive" });
      return;
    }
    if (!docForm.docType || !docForm.docYear || !docForm.docNum || !docForm.docSubj || !docForm.docDateCH) {
      toast({ title: "خطأ", description: "يرجى ملء الحقول المطلوبة: النوع، السنة، الرقم، الموضوع، التاريخ", variant: "destructive" });
      return;
    }
    setSaving(true);
    if (showEditForm && selectedDoc) {
      localDb.archiveDocuments.update(selectedDoc.id, {
        ...docForm,
        editBy: userName,
        editDate: new Date().toISOString(),
      });
      toast({ title: "تم", description: "تم تعديل الوثيقة" });
    } else {
      localDb.archiveDocuments.insert({
        ...docForm,
        pId: docForm.pId || addFormPId,
        userName: userName,
      });
      toast({ title: "تم", description: "تم إضافة الوثيقة للأرشيف" });
    }
    setSaving(false);
    setShowAddForm(false);
    setShowEditForm(false);
    setDocForm(emptyDocForm);
    setAddFormPId("");
    setAddFormStep(0);
    setSelectedDoc(null);
    refreshData();
  };

  const handleDeleteDoc = (id: string) => {
    if (!has("delete_archive")) {
      toast({ title: "خطأ", description: "ليس لديك صلاحية حذف وثيقة", variant: "destructive" });
      return;
    }
    if (!confirm("هل أنت متأكد من حذف هذه الوثيقة؟")) return;
    localDb.archiveDocuments.delete(id);
    toast({ title: "تم", description: "تم حذف الوثيقة" });
    setSelectedDoc(null);
    refreshData();
  };

  const handleExportExcel = () => {
    const rows = filteredDocs.map(d => ({
      "رقم الوثيقة": d.docNum,
      "التاريخ الميلادي": d.docDateCH,
      "التاريخ الهجري": d.docDateHig,
      "الموضوع": d.docSubj,
      "إلى": d.docTo,
      "المصدر": d.docSorse,
      "رقم الأرشفة": d.storedNum,
      "مكان الحفظ": d.stordPlace,
      "نوع الوثيقة": DOC_TYPE_LABELS[d.docType] || d.docType,
      "القسم": partNameMap[d.pId] || d.pId,
      "السنة": d.docYear,
      "رقم المجلد": d.folderNum,
      "مسار الملف": d.docPath,
    }));
    if (!rows.length) return;
    const ws = XLSX.utils.json_to_sheet(rows);
    const colWidths = Object.keys(rows[0]).map(k => ({
      wch: Math.max(k.length, ...rows.map(r => String(r[k] || "").length)) + 2,
    }));
    ws["!cols"] = colWidths;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "الأرشيف");
    XLSX.writeFile(wb, "archive_export.xlsx");
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
      let count = 0;
      jsonData.forEach((row: Record<string, unknown>, i: number) => {
        const r = row as Record<string, string>;
        const docNum = r["رقم الوثيقة"] || r["docNum"] || `IMP-${i + 1}`;
        const docSubj = r["الموضوع"] || r["docSubj"] || "—";
        if (!docNum || !docSubj) return;
        localDb.archiveDocuments.insert({
          docType: r["نوع الوثيقة"] || r["docType"] || "1",
          docYear: r["السنة"] || r["docYear"] || new Date().getFullYear().toString(),
          docNum: String(docNum).slice(0, 50),
          docDateCH: r["التاريخ الميلادي"] || r["docDateCH"] || new Date().toISOString().split("T")[0],
          docDateHig: r["التاريخ الهجري"] || r["docDateHig"] || "",
          docSubj: String(docSubj).slice(0, 300),
          docTo: (r["إلى"] || r["docTo"] || "").slice(0, 200),
          docSorse: (r["المصدر"] || r["docSorse"] || "").slice(0, 200),
          storedNum: (r["رقم الأرشفة"] || r["storedNum"] || "").slice(0, 50),
          stordPlace: (r["مكان الحفظ"] || r["stordPlace"] || "").slice(0, 200),
          folderNum: (r["رقم المجلد"] || r["folderNum"] || "").slice(0, 50),
          docPath: (r["مسار الملف"] || r["docPath"] || "").slice(0, 300),
          pId: r["pId"] || "1",
          forCheck: "0",
          userName: userName,
        });
        count++;
      });
      toast({ title: "تم", description: `تم استيراد ${count} وثيقة من الملف` });
      refreshData();
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  };

  const statsByType = useMemo(() => {
    const counts: Record<string, number> = {};
    documents.forEach(d => {
      const label = DOC_TYPE_LABELS[d.docType] || "غير محدد";
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count, id: Object.entries(DOC_TYPE_LABELS).find(([, l]) => l === name)?.[0] || "0" }));
  }, [documents]);

  const statsByYear = useMemo(() => {
    const counts: Record<string, number> = {};
    documents.forEach(d => {
      counts[d.docYear] = (counts[d.docYear] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [documents]);

  const statsByDept = useMemo(() => {
    const counts: Record<string, number> = {};
    documents.forEach(d => {
      const label = partNameMap[d.pId] || "غير محدد";
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [documents, partNameMap]);

  const monthlyTrend = useMemo(() => {
    const counts: Record<string, number> = {};
    documents.forEach(d => {
      if (d.docDateCH) {
        const month = d.docDateCH.substring(0, 7);
        counts[month] = (counts[month] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(-12);
  }, [documents]);

  const recentDocs = useMemo(() => {
    return [...documents]
      .sort((a, b) => (b.dateOfAdd || "").localeCompare(a.dateOfAdd || ""))
      .slice(0, 8);
  }, [documents]);

  const openEditDialog = (doc: ArchiveDocument) => {
    setDocForm({
      docType: doc.docType || "",
      docYear: doc.docYear || "",
      docNum: doc.docNum || "",
      docDateCH: doc.docDateCH || "",
      docDateHig: doc.docDateHig || "",
      docSubj: doc.docSubj || "",
      docTo: doc.docTo || "",
      docSorse: doc.docSorse || "",
      storedNum: doc.storedNum || "",
      stordPlace: doc.stordPlace || "",
      folderNum: doc.folderNum || "",
      docPath: doc.docPath || "",
      pId: doc.pId || "",
      secId: doc.secId || "",
      forCheck: doc.forCheck || "0",
    });
    setAddFormPId(doc.pId || "");
    setSelectedDoc(doc);
    setShowEditForm(true);
  };

  const isAddFormValid = (step: number) => {
    if (step === 0) return !!docForm.docType && !!docForm.docYear && !!docForm.docNum;
    if (step === 1) return !!docForm.docDateCH && !!docForm.docSubj;
    return true;
  };

  const FORM_STEPS = ["النوع والرقم", "التاريخ والموضوع", "التفاصيل"];

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <PageHeader
        title="الأرشيف الإداري"
        subtitle="إدارة وأرشفة الوثائق والكتب الرسمية - العتبة الحسينية المقدسة"
        icon={FolderArchive}
        sections={[
          { id: "search_filter", label: "البحث والفلترة" },
          { id: "documents_table", label: "جدول الوثائق" },
        ]}
        exportData={has("export_archive") ? () => ({
          filename: "archive",
          rows: filteredDocs.map(d => ({
            "رقم الوثيقة": d.docNum,
            "التاريخ الميلادي": d.docDateCH,
            "التاريخ الهجري": d.docDateHig,
            "الموضوع": d.docSubj,
            "إلى": d.docTo,
            "المصدر": d.docSorse,
            "رقم الأرشفة": d.storedNum,
            "نوع الوثيقة": DOC_TYPE_LABELS[d.docType] || d.docType,
            "القسم": partNameMap[d.pId] || d.pId,
            "السنة": d.docYear,
          })),
        }) : undefined}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
        <TabsList className="mb-4">
          <TabsTrigger value="search" className="gap-1.5"><Search className="w-4 h-4" />البحث والأرشيف</TabsTrigger>
          <TabsTrigger value="add" className="gap-1.5" disabled={!has("add_archive")}><Plus className="w-4 h-4" />إضافة وثيقة</TabsTrigger>
          <TabsTrigger value="stats" className="gap-1.5"><BarChart3 className="w-4 h-4" />الإحصائيات</TabsTrigger>
        </TabsList>

        {/* === البحث والأرشيف === */}
        <TabsContent value="search" className="space-y-4">

          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3">
            <StatCard icon={FolderOpen} label="إجمالي الوثائق" value={documents.length} gradient="from-indigo-500 to-indigo-600" iconColor="text-white" />
            <StatCard icon={ArrowDownRight} label="الوارد" value={incomingCount} gradient="from-green-500 to-emerald-600" iconColor="text-white" />
            <StatCard icon={ArrowUpRight} label="الصادر" value={outgoingCount} gradient="from-blue-500 to-blue-600" iconColor="text-white" />
            <StatCard icon={ShieldAlert} label="سري" value={secretCount} gradient="from-red-500 to-red-600" iconColor="text-white" />
          </div>

          <div className="flex items-center justify-end flex-wrap gap-3 no-print">
            {has("export_archive") && (
              <Button variant="outline" size="sm" className="gap-2" onClick={handleExportExcel}>
                <Download className="w-4 h-4" />تصدير Excel
              </Button>
            )}
            <Button variant="outline" size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()}>
              <FileSpreadsheet className="w-4 h-4" />استيراد Excel
            </Button>
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImportExcel} />
            {has("add_archive") && (
              <Button size="sm" className="gap-2" onClick={() => { setDocForm(emptyDocForm); setAddFormPId(""); setAddFormStep(0); setActiveTab("add"); }}>
                <Plus className="w-4 h-4" />وثيقة جديدة
              </Button>
            )}
            <Button variant="outline" size="sm" className="gap-2 no-screen" onClick={() => window.print()}>
              <Printer className="w-4 h-4" />طباعة
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 no-print">
            {quickFilterChips.map(chip => (
              <QuickFilterChip
                key={chip.type}
                label={chip.label}
                active={activeQuickFilter === chip.type}
                onClick={() => setActiveQuickFilter(activeQuickFilter === chip.type ? null : chip.type)}
                colorClass={chip.colorClass}
              />
            ))}
          </div>

          <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen} className="no-print">
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-full mb-2">
                {filtersOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                <Layers className="w-3.5 h-3.5" />
                فلاتر متقدمة
                {(filterDocType !== "all" || filterDocYear !== "all" || filterPId !== "all" || filterSecId !== "all" || filterDateFrom || filterDateTo) && (
                  <Badge variant="secondary" className="text-[9px] h-4 px-1.5">نشط</Badge>
                )}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div data-print-section="search_filter" className="bg-card rounded-xl border border-border p-4">
                <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3">
                  <div className="sm:col-span-2 lg:col-span-4">
                    <div className="relative">
                      <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="بحث بالرقم، الموضوع، الجهة المرسل إليها، المصدر..."
                        className="ps-9"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">نوع الوثيقة</Label>
                    <Select value={filterDocType} onValueChange={(v) => { setFilterDocType(v); setActiveQuickFilter(null); }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">الكل</SelectItem>
                        {docTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">السنة</Label>
                    <Select value={filterDocYear} onValueChange={(v) => { setFilterDocYear(v); setActiveQuickFilter(null); }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">الكل</SelectItem>
                        {years.map(y => <SelectItem key={y.id} value={y.id}>{y.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">القسم</Label>
                    <Select value={filterPId} onValueChange={(v) => { setFilterPId(v); setFilterSecId("all"); }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">الكل</SelectItem>
                        {parts.map(p => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">الشعبة</Label>
                    <Select value={filterSecId} onValueChange={setFilterSecId}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">الكل</SelectItem>
                        {filteredSections.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">من تاريخ</Label>
                    <Input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">إلى تاريخ</Label>
                    <Input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} />
                  </div>
                  {(filterDocType !== "all" || filterDocYear !== "all" || filterPId !== "all" || filterSecId !== "all" || filterDateFrom || filterDateTo || searchText) && (
                    <div className="flex items-end">
                      <Button variant="ghost" size="sm" className="text-[10px] h-8" onClick={() => {
                        setFilterDocType("all"); setFilterDocYear("all"); setFilterPId("all"); setFilterSecId("all");
                        setFilterDateFrom(""); setFilterDateTo(""); setSearchText(""); setActiveQuickFilter(null);
                      }}>مسح الفلاتر</Button>
                    </div>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div data-print-section="documents_table" className="bg-card rounded-xl border border-border overflow-hidden print-content">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>الرقم</th>
                    <th>التاريخ</th>
                    <th>الهجري</th>
                    <th>الموضوع</th>
                    <th>إلى</th>
                    <th>المصدر</th>
                    <th>الأرشفة</th>
                    <th>النوع</th>
                    <th>القسم</th>
                    <th className="no-print">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDocs.length > 0 ? paginatedDocs.map((doc, idx) => (
                    <tr
                      key={doc.id}
                      className={`cursor-pointer hover:bg-muted/30 transition-all duration-200 animate-fade-in ${DOC_TYPE_ROW_BORDER[doc.docType] || ""}`}
                      style={{ animationDelay: `${idx * 30}ms` }}
                      onClick={() => setSelectedDoc(doc)}
                    >
                      <td className="font-medium text-foreground font-mono text-xs">{doc.docNum}</td>
                      <td className="text-muted-foreground text-xs">{doc.docDateCH}</td>
                      <td className="text-muted-foreground text-xs">{doc.docDateHig}</td>
                      <td className="font-medium text-foreground  text-xs">{doc.docSubj}</td>
                      <td className="text-muted-foreground text-xs ">{doc.docTo}</td>
                      <td className="text-muted-foreground text-xs ">{doc.docSorse}</td>
                      <td className="text-muted-foreground text-xs">{doc.storedNum}</td>
                      <td>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${DOC_TYPE_COLORS[doc.docType] || "bg-muted text-muted-foreground"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            ["1", "2", "5", "7"].includes(doc.docType) ? "bg-blue-500" : "bg-green-500"
                          }`} />
                          {DOC_TYPE_LABELS[doc.docType] || "—"}
                        </span>
                      </td>
                      <td className="text-muted-foreground text-xs ">{partNameMap[doc.pId] || "—"}</td>
                      <td className="no-print">
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => setSelectedDoc(doc)} className="p-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors" title="عرض"><Eye className="w-3.5 h-3.5" /></button>
                          {has("edit_archive") && <button onClick={() => openEditDialog(doc)} className="p-1.5 rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-colors" title="تعديل"><Edit3 className="w-3.5 h-3.5" /></button>}
                          {has("delete_archive") && <button onClick={() => handleDeleteDoc(doc.id)} className="p-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors" title="حذف"><Trash2 className="w-3.5 h-3.5" /></button>}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={10} className="text-center py-8 text-muted-foreground">لا توجد وثائق مطابقة</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border no-print">
                <span className="text-xs text-muted-foreground">
                  {filteredDocs.length} وثيقة — صفحة {currentPage} من {totalPages}
                </span>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page: number;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    return (
                      <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(page)} className="w-8 h-8 p-0 text-xs">
                        {page}
                      </Button>
                    );
                  })}
                  <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* === إضافة وثيقة === */}
        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                إضافة وثيقة جديدة للأرشيف
              </CardTitle>
            </CardHeader>
            <CardContent dir="rtl">
              <FormStepIndicator currentStep={addFormStep} steps={FORM_STEPS} />

              {addFormStep === 0 && (
                <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
                  <div>
                    <Label className="text-xs flex items-center gap-1"><Layers className="w-3 h-3" />نوع الوثيقة <span className="text-destructive">*</span></Label>
                    <Select value={docForm.docType} onValueChange={(v) => {
                      const newForm = { ...docForm, docType: v };
                      if (["1", "2", "5", "7"].includes(v) && newForm.docYear) {
                        newForm.docNum = generateOutgoingNumber(v, newForm.docYear);
                      }
                      setDocForm(newForm);
                    }}>
                      <SelectTrigger><SelectValue placeholder="اختر النوع" /></SelectTrigger>
                      <SelectContent>
                        {docTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs flex items-center gap-1"><Calendar className="w-3 h-3" />السنة <span className="text-destructive">*</span></Label>
                    <Select value={docForm.docYear} onValueChange={(v) => {
                      const newForm = { ...docForm, docYear: v };
                      if (["1", "2", "5", "7"].includes(newForm.docType) && v) {
                        newForm.docNum = generateOutgoingNumber(newForm.docType, v);
                      }
                      setDocForm(newForm);
                    }}>
                      <SelectTrigger><SelectValue placeholder="اختر السنة" /></SelectTrigger>
                      <SelectContent>
                        {years.map(y => <SelectItem key={y.id} value={y.id}>{y.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs flex items-center gap-1"><Hash className="w-3 h-3" />رقم الوثيقة <span className="text-destructive">*</span></Label>
                    <Input value={docForm.docNum} onChange={(e) => setDocForm({ ...docForm, docNum: e.target.value })} placeholder="مثال: ص/2024/001" />
                  </div>
                </div>
              )}

              {addFormStep === 1 && (
                <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
                  <div>
                    <Label className="text-xs flex items-center gap-1"><Calendar className="w-3 h-3" />التاريخ الميلادي <span className="text-destructive">*</span></Label>
                    <Input type="date" value={docForm.docDateCH} onChange={(e) => setDocForm({ ...docForm, docDateCH: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs flex items-center gap-1"><Calendar className="w-3 h-3" />التاريخ الهجري</Label>
                    <Input value={docForm.docDateHig} onChange={(e) => setDocForm({ ...docForm, docDateHig: e.target.value })} placeholder="مثال: 1445/06/04" />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-3">
                    <Label className="text-xs flex items-center gap-1"><FileText className="w-3 h-3" />الموضوع <span className="text-destructive">*</span></Label>
                    <Input value={docForm.docSubj} onChange={(e) => setDocForm({ ...docForm, docSubj: e.target.value })} placeholder="موضوع الوثيقة" />
                  </div>
                </div>
              )}

              {addFormStep === 2 && (
                <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
                  <div>
                    <Label className="text-xs flex items-center gap-1"><Send className="w-3 h-3" />إلى (الجهة المرسل إليها)</Label>
                    <Input value={docForm.docTo} onChange={(e) => setDocForm({ ...docForm, docTo: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs flex items-center gap-1"><Inbox className="w-3 h-3" />المصدر (الجهة المصدرة)</Label>
                    <Input value={docForm.docSorse} onChange={(e) => setDocForm({ ...docForm, docSorse: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs flex items-center gap-1"><Building2 className="w-3 h-3" />القسم</Label>
                    <Select value={addFormPId} onValueChange={(v) => { setAddFormPId(v); setDocForm({ ...docForm, pId: v, secId: "" }); }}>
                      <SelectTrigger><SelectValue placeholder="اختر القسم" /></SelectTrigger>
                      <SelectContent>
                        {parts.map(p => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs flex items-center gap-1"><Building2 className="w-3 h-3" />الشعبة</Label>
                    <Select value={docForm.secId || "all"} onValueChange={(v) => setDocForm({ ...docForm, secId: v === "all" ? "" : v })}>
                      <SelectTrigger><SelectValue placeholder="اختر الشعبة" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">— بدون —</SelectItem>
                        {addFormSections.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs flex items-center gap-1"><Hash className="w-3 h-3" />رقم الأرشفة</Label>
                    <Input value={docForm.storedNum} onChange={(e) => setDocForm({ ...docForm, storedNum: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs flex items-center gap-1"><FolderOpen className="w-3 h-3" />مكان الحفظ</Label>
                    <Input value={docForm.stordPlace} onChange={(e) => setDocForm({ ...docForm, stordPlace: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs flex items-center gap-1"><FolderArchive className="w-3 h-3" />رقم المجلد</Label>
                    <Input value={docForm.folderNum} onChange={(e) => setDocForm({ ...docForm, folderNum: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs flex items-center gap-1"><FileCheck className="w-3 h-3" />مسار الملف</Label>
                    <Input value={docForm.docPath} onChange={(e) => setDocForm({ ...docForm, docPath: e.target.value })} />
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-3">
                    <input
                      type="checkbox"
                      checked={docForm.forCheck === "1"}
                      onChange={(e) => setDocForm({ ...docForm, forCheck: e.target.checked ? "1" : "0" })}
                      className="rounded border-border"
                    />
                    <Label className="text-xs flex items-center gap-1"><Lock className="w-3 h-3" />وثيقة سرية / تحتاج مراجعة</Label>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                {addFormStep > 0 && (
                  <Button variant="outline" onClick={() => setAddFormStep(addFormStep - 1)}>
                    السابق
                  </Button>
                )}
                {addFormStep < FORM_STEPS.length - 1 ? (
                  <Button onClick={() => setAddFormStep(addFormStep + 1)} disabled={!isAddFormValid(addFormStep)}>
                    التالي
                  </Button>
                ) : (
                  <Button onClick={handleSaveDoc} disabled={saving || !isAddFormValid(addFormStep)} className="gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    إضافة الوثيقة
                  </Button>
                )}
                <Button variant="outline" onClick={() => { setShowAddForm(false); setShowEditForm(false); setDocForm(emptyDocForm); setAddFormPId(""); setAddFormStep(0); setActiveTab("search"); }}>
                  إلغاء
                </Button>
              </div>

              <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border">
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <FileSpreadsheet className="w-3 h-3" />
                  لاستيراد بيانات من Access (.accdb)، يرجى تصدير البيانات أولاً إلى ملف Excel ثم استيرادها هنا باستخدام زر "استيراد Excel"
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === الإحصائيات === */}
        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
            <StatCard icon={FolderOpen} label="إجمالي الوثائق" value={documents.length} gradient="from-indigo-500 to-indigo-600" iconColor="text-white" />
            <StatCard icon={ArrowDownRight} label="الوارد" value={incomingCount} gradient="from-green-500 to-emerald-600" iconColor="text-white" />
            <StatCard icon={ArrowUpRight} label="الصادر" value={outgoingCount} gradient="from-blue-500 to-blue-600" iconColor="text-white" />
            <StatCard icon={ShieldAlert} label="سري" value={secretCount} gradient="from-red-500 to-red-600" iconColor="text-white" />
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Layers className="w-4 h-4 text-primary" />الوثائق حسب النوع</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statsByType} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10 }} />
                      <RechartsTooltip contentStyle={{ fontSize: 12, direction: "rtl" }} />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {statsByType.map((entry, index) => (
                          <Cell key={index} fill={CHART_TYPE_COLORS[entry.id] || "#6b7280"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" />الوثائق حسب السنة</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={statsByYear}>
                      <defs>
                        <linearGradient id="yearGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <RechartsTooltip contentStyle={{ fontSize: 12, direction: "rtl" }} />
                      <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="url(#yearGradient)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {monthlyTrend.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary" />الاتجاه الشهري</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyTrend}>
                        <defs>
                          <linearGradient id="monthGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <RechartsTooltip contentStyle={{ fontSize: 12, direction: "rtl" }} />
                        <Area type="monotone" dataKey="count" stroke="#8b5cf6" fill="url(#monthGradient)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className={monthlyTrend.length > 0 ? "" : "lg:col-span-2"}>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Building2 className="w-4 h-4 text-primary" />أكثر 10 أقسام من حيث عدد الوثائق</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statsByDept} layout="vertical">
                      <defs>
                        <linearGradient id="deptGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={1} />
                          <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.7} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis dataKey="name" type="category" width={200} tick={{ fontSize: 10 }} />
                      <RechartsTooltip contentStyle={{ fontSize: 12, direction: "rtl" }} />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="url(#deptGradient)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {recentDocs.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Clock className="w-4 h-4 text-primary" />أحدث الوثائق</CardTitle></CardHeader>
              <CardContent>
                <div className="flex-1 overflow-y-auto">
                  {recentDocs.map(doc => (
                    <TimelineItem key={doc.id} doc={doc} partNameMap={partNameMap} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* === Document Details Dialog === */}
      <Dialog open={!!selectedDoc && !showEditForm} onOpenChange={() => setSelectedDoc(null)}>
        <DialogContent className="max-w-lg p-0 overflow-hidden" dir="rtl">
          {selectedDoc && (
            <>
              <div className={`bg-gradient-to-l ${DOC_TYPE_BANNER_COLORS[selectedDoc.docType] || "from-muted to-muted"} p-4 text-white`}>
                <div className="flex items-center gap-2 mb-2">
                  <FolderArchive className="w-5 h-5" />
                  <span className="text-xs font-bold opacity-90">{DOC_TYPE_LABELS[selectedDoc.docType] || "—"}</span>
                  {selectedDoc.forCheck === "1" && <Badge variant="destructive" className="text-[10px] bg-white/20 border-white/40 text-white">سرية</Badge>}
                </div>
                <h3 className="font-bold text-sm leading-snug">{selectedDoc.docSubj || "—"}</h3>
                <p className="text-xs opacity-80 mt-1">{selectedDoc.docNum} — {selectedDoc.docDateCH}</p>
              </div>
              <div className="p-4 space-y-3 max-h-[50vh] overflow-y-auto">
                <div>
                  <p className="text-muted-foreground text-[10px] mb-1 flex items-center gap-1"><Hash className="w-3 h-3" />بيانات الوثيقة</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ["رقم الوثيقة", selectedDoc.docNum],
                      ["السنة", selectedDoc.docYear],
                      ["التاريخ الميلادي", selectedDoc.docDateCH],
                      ["التاريخ الهجري", selectedDoc.docDateHig],
                    ].map(([label, value]) => (
                      <div key={label} className="bg-muted/30 rounded-lg p-2">
                        <p className="text-[10px] text-muted-foreground">{label}</p>
                        <p className="text-xs font-medium text-foreground">{value || "—"}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-muted-foreground text-[10px] mb-1 flex items-center gap-1"><Send className="w-3 h-3" />الجهات</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ["إلى (الجهة المرسل إليها)", selectedDoc.docTo],
                      ["المصدر (الجهة المصدرة)", selectedDoc.docSorse],
                    ].map(([label, value]) => (
                      <div key={label} className="bg-muted/30 rounded-lg p-2">
                        <p className="text-[10px] text-muted-foreground">{label}</p>
                        <p className="text-xs font-medium text-foreground">{value || "—"}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-muted-foreground text-[10px] mb-1 flex items-center gap-1"><FolderArchive className="w-3 h-3" />الأرشفة</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ["القسم", partNameMap[selectedDoc.pId] || selectedDoc.pId],
                      ["الشعبة", sectionNameMap[selectedDoc.secId] || "—"],
                      ["رقم الأرشفة", selectedDoc.storedNum],
                      ["مكان الحفظ", selectedDoc.stordPlace],
                      ["رقم المجلد", selectedDoc.folderNum],
                      ["مسار الملف", selectedDoc.docPath || "—"],
                    ].map(([label, value]) => (
                      <div key={label} className="bg-muted/30 rounded-lg p-2">
                        <p className="text-[10px] text-muted-foreground">{label}</p>
                        <p className="text-xs font-medium text-foreground">{value || "—"}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-muted/30 rounded-lg p-2">
                    <p className="text-[10px] text-muted-foreground">أضيف بواسطة</p>
                    <p className="text-xs font-medium text-foreground">{selectedDoc.userName || "—"}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-2">
                    <p className="text-[10px] text-muted-foreground">تاريخ الإضافة</p>
                    <p className="text-xs font-medium text-foreground">{selectedDoc.dateOfAdd ? new Date(selectedDoc.dateOfAdd).toLocaleDateString("ar-SA") : "—"}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-border">
                  {has("edit_archive") && (
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { openEditDialog(selectedDoc); }}>
                      <Edit3 className="w-3.5 h-3.5" />تعديل
                    </Button>
                  )}
                  {has("delete_archive") && (
                    <Button size="sm" variant="destructive" className="gap-1.5" onClick={() => handleDeleteDoc(selectedDoc.id)}>
                      <Trash2 className="w-3.5 h-3.5" />حذف
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* === Edit Document Dialog === */}
      <Dialog open={showEditForm} onOpenChange={() => { setShowEditForm(false); setSelectedDoc(null); setDocForm(emptyDocForm); setAddFormPId(""); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-primary" />
              تعديل الوثيقة
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
            <div>
              <Label className="text-xs">نوع الوثيقة <span className="text-destructive">*</span></Label>
              <Select value={docForm.docType} onValueChange={(v) => setDocForm({ ...docForm, docType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {docTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">السنة <span className="text-destructive">*</span></Label>
              <Select value={docForm.docYear} onValueChange={(v) => setDocForm({ ...docForm, docYear: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {years.map(y => <SelectItem key={y.id} value={y.id}>{y.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">رقم الوثيقة <span className="text-destructive">*</span></Label>
              <Input value={docForm.docNum} onChange={(e) => setDocForm({ ...docForm, docNum: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">التاريخ الميلادي <span className="text-destructive">*</span></Label>
              <Input type="date" value={docForm.docDateCH} onChange={(e) => setDocForm({ ...docForm, docDateCH: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">التاريخ الهجري</Label>
              <Input value={docForm.docDateHig} onChange={(e) => setDocForm({ ...docForm, docDateHig: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">الموضوع <span className="text-destructive">*</span></Label>
              <Input value={docForm.docSubj} onChange={(e) => setDocForm({ ...docForm, docSubj: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">إلى</Label>
              <Input value={docForm.docTo} onChange={(e) => setDocForm({ ...docForm, docTo: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">المصدر</Label>
              <Input value={docForm.docSorse} onChange={(e) => setDocForm({ ...docForm, docSorse: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">القسم</Label>
              <Select value={addFormPId} onValueChange={(v) => { setAddFormPId(v); setDocForm({ ...docForm, pId: v, secId: "" }); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {parts.map(p => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">الشعبة</Label>
              <Select value={docForm.secId || "all"} onValueChange={(v) => setDocForm({ ...docForm, secId: v === "all" ? "" : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">— بدون —</SelectItem>
                  {addFormSections.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">رقم الأرشفة</Label>
              <Input value={docForm.storedNum} onChange={(e) => setDocForm({ ...docForm, storedNum: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">مكان الحفظ</Label>
              <Input value={docForm.stordPlace} onChange={(e) => setDocForm({ ...docForm, stordPlace: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">رقم المجلد</Label>
              <Input value={docForm.folderNum} onChange={(e) => setDocForm({ ...docForm, folderNum: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">مسار الملف</Label>
              <Input value={docForm.docPath} onChange={(e) => setDocForm({ ...docForm, docPath: e.target.value })} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <input
              type="checkbox"
              checked={docForm.forCheck === "1"}
              onChange={(e) => setDocForm({ ...docForm, forCheck: e.target.checked ? "1" : "0" })}
              className="rounded border-border"
            />
            <Label className="text-xs">وثيقة سرية / تحتاج مراجعة</Label>
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={handleSaveDoc} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit3 className="w-4 h-4" />}
              حفظ التعديل
            </Button>
            <Button variant="outline" onClick={() => { setShowEditForm(false); setSelectedDoc(null); setDocForm(emptyDocForm); setAddFormPId(""); }}>
              إلغاء
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <style>{`
        @media print {
          .no-screen { display: flex !important; }
          .no-print { display: none !important; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Archive;


