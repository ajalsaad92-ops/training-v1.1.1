interface StatusBadgeProps {
  status: string;
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
}

const autoVariant = (status: string): StatusBadgeProps["variant"] => {
  const successTerms = ["passed", "approved", "done", "applied", "اجتاز", "موافق", "منجز", "مطبق", "completed"];
  const warningTerms = ["waiting", "pending", "in_progress", "unit_approved", "قيد", "معلق", "انتظار"];
  const dangerTerms = ["failed", "rejected", "absent", "لم يجتز", "مرفوض", "غياب", "مفقود"];

  const lower = status.toLowerCase();
  if (successTerms.some(t => lower.includes(t))) return "success";
  if (warningTerms.some(t => lower.includes(t))) return "warning";
  if (dangerTerms.some(t => lower.includes(t))) return "danger";
  return "info";
};

const StatusBadge = ({ status, variant }: StatusBadgeProps) => {
  const v = variant || autoVariant(status);
  const classMap = {
    success: "badge-success",
    warning: "badge-warning",
    danger: "badge-danger",
    info: "badge-info",
    neutral: "badge-neutral",
  };

  return <span className={classMap[v]}>{status}</span>;
};

export default StatusBadge;
