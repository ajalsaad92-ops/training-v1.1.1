import { CurriculumItem } from "@/hooks/useSupabaseData";

// Required field check (used for "missing data" indicators)
export const hasEmptyFields = (item: CurriculumItem): string[] => {
  const missing: string[] = [];
  if (!item.title?.trim()) missing.push("العنوان");
  if (!item.goals?.trim()) missing.push("الأهداف");
  if (!item.target_audience?.trim()) missing.push("الفئة المستهدفة");
  if (!item.trainer_name?.trim()) missing.push("المدرب");
  if (!item.hours || item.hours <= 0) missing.push("الساعات");
  if (!item.location?.trim()) missing.push("المكان");
  if (!item.executor_name?.trim()) missing.push("المنفذ");
  if (!item.training_style?.trim()) missing.push("أسلوب التدريب");
  return missing;
};

export const getItemsWithEmptyFields = (items: CurriculumItem[]) =>
  items.filter(item => hasEmptyFields(item).length > 0);

// ===== Curriculum stages =====
// writing  : only title (no new-form data yet)
// new_form : written in the new form (form_type === "new") but not yet under audit
// auditing : in the new form & under/awaiting audit
// printing : audit done but not printed
// done     : printed
export type CurriculumStage = "writing" | "new_form" | "auditing" | "printing" | "done";

const isWrittenInNewForm = (item: CurriculumItem) =>
  item.form_type === "new" && (
    !!item.goals?.trim() ||
    !!item.target_audience?.trim() ||
    (item.hours || 0) > 0 ||
    !!item.trainer_name?.trim()
  );

export const computeStage = (item: CurriculumItem): CurriculumStage => {
  if (item.printed || item.hard_copy_printed) return "done";
  if (item.audit_status === "approved" || item.audit_status === "done") return "printing";
  if (item.form_type === "new" && (item.audit_status === "in_progress" || isWrittenInNewForm(item))) return "auditing";
  if (item.form_type === "new") return "new_form";
  return "writing";
};

export const stageLabels: Record<CurriculumStage, string> = {
  writing: "كتابة",
  new_form: "نموذج جديد",
  auditing: "تدقيق",
  printing: "طباعة",
  done: "منجز",
};

export const stageColors: Record<CurriculumStage, string> = {
  writing: "bg-muted text-muted-foreground",
  new_form: "bg-primary/15 text-primary",
  auditing: "bg-warning/15 text-warning",
  printing: "bg-accent/15 text-accent",
  done: "bg-success/15 text-success",
};

// ===== Presentation stages =====
// not_done : curriculum fully done but no PDF and no PPT
// pdf      : has a PDF but no PPT
// ppt      : has a PPT but not yet audited/finalized
// done     : has a finalized PPT (presentation_uploaded) and curriculum done
export type PptStage = "not_done" | "pdf" | "ppt" | "done";

export const computePptStage = (item: CurriculumItem): PptStage => {
  const curriculumDone = computeStage(item) === "done";
  if (curriculumDone && item.presentation_uploaded) return "done";
  if (item.presentation_uploaded) return "ppt";
  if (item.file_url && item.file_type === "pdf") return "pdf";
  return "not_done";
};

export const pptStageLabels: Record<PptStage, string> = {
  not_done: "غير منجز",
  pdf: "PDF",
  ppt: "بوربوينت",
  done: "منجز",
};

export const pptStageColors: Record<PptStage, string> = {
  not_done: "bg-muted text-muted-foreground",
  pdf: "bg-accent/15 text-accent",
  ppt: "bg-warning/15 text-warning",
  done: "bg-success/15 text-success",
};

export const countByStage = (items: CurriculumItem[]) => {
  const counts: Record<CurriculumStage, number> = { writing: 0, new_form: 0, auditing: 0, printing: 0, done: 0 };
  items.forEach(item => { counts[computeStage(item)]++; });
  return counts;
};

export const countByPptStage = (items: CurriculumItem[]) => {
  const counts: Record<PptStage, number> = { not_done: 0, pdf: 0, ppt: 0, done: 0 };
  items.forEach(item => { counts[computePptStage(item)]++; });
  return counts;
};
