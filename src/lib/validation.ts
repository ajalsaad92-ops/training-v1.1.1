import { z } from "zod";

const sanitize = (val: string) => val.replace(/<[^>]*>/g, "").trim();
const textField = (max = 200) => z.string().transform(sanitize).pipe(z.string().min(1, "هذا الحقل مطلوب").max(max));
const optionalText = (max = 200) => z.string().transform(sanitize).pipe(z.string().max(max)).default("");
const optionalDate = z.string().max(20).optional().default("");

export const courseSchema = z.object({
  title: textField(200),
  code: optionalText(50),
  type: z.enum(["internal", "external"]),
  training_type: z.enum(["developmental", "specialized"]),
  venue: optionalText(200),
  start_date: optionalDate,
  end_date: optionalDate,
  trainer: optionalText(100),
  supervisor: optionalText(100),
  sponsor: optionalText(100),
  status: z.enum(["planned", "active", "completed"]),
  estimated_budget: z.coerce.number().min(0).max(999999999),
  actual_cost: z.coerce.number().min(0).max(999999999),
});

export const employeeSchema = z.object({
  name: textField(100),
  department: optionalText(100),
  section: optionalText(100),
  position: optionalText(100),
  phone: optionalText(20),
});

export const hrRequestSchema = z.object({
  employee_name: textField(100),
  department: optionalText(100),
  type: textField(50),
  date: z.string().min(1, "التاريخ مطلوب").max(20),
  notes: optionalText(500),
});

export const correspondenceSchema = z.object({
  number: optionalText(50),
  subject: textField(300),
  from: optionalText(200),
  to: optionalText(200),
  type: z.enum(["incoming_internal", "incoming_external", "outgoing_internal", "outgoing_external"]),
  status: z.enum(["done", "in_progress", "archived"]),
  summary: optionalText(1000),
  date: optionalDate,
});

export const curriculumSchema = z.object({
  title: textField(200),
  goals: optionalText(500),
  target_audience: optionalText(200),
  count: z.coerce.number().int().min(0).max(9999),
  training_style: optionalText(50),
  type: z.enum(["developmental", "specialized"]),
  status: z.enum(["applied", "not_applied"]),
});

export const userSchema = z.object({
  name: textField(100),
  email: z.string().trim().email("بريد إلكتروني غير صالح").max(255),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل").max(100),
});

export function sanitizeExcelRow(row: Record<string, unknown>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  for (const [key, value] of Object.entries(row)) {
    sanitized[key] = typeof value === "string" ? value.replace(/<[^>]*>/g, "").slice(0, 500) : String(value ?? "").slice(0, 500);
  }
  return sanitized;
}
