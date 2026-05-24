import { useAuth } from "@/contexts/AuthContext";
import { getEffectivePermissions, hasPermission as checkPerm } from "@/lib/permissions";
import { useMemo } from "react";

export type UserPersona = "admin" | "dept_manager" | "unit_head" | "prep_unit_head" | "curriculum_unit_head" | "individual";

export const useUserRole = () => {
  const { user } = useAuth();

  const roles = user?.roles || [];
  const userId = user?.id || "";
  const section = (user?.section || "").trim();

  const isAdmin = roles.some(r => ["admin", "super_user"].includes(r));
  const isDeptManager = roles.some(r => ["dept_manager", "training_admin", "general_admin"].includes(r));
  const isUnitHead = roles.includes("unit_head");
  const isIndividual = !isAdmin && !isDeptManager && !isUnitHead;
  const isManager = isAdmin || isDeptManager;

  let persona: UserPersona = "individual";
  if (isAdmin) {
    persona = "admin";
  } else if (isDeptManager) {
    persona = "dept_manager";
  } else if (isUnitHead) {
    if (section.includes("داد") || section.includes("تدريب") || section.includes("عداد")) {
      persona = "prep_unit_head";
    } else if (section.includes("ناهج") || section.includes("مناهج")) {
      persona = "curriculum_unit_head";
    } else {
      persona = "unit_head";
    }
  }

  const effectivePermissions = useMemo(() => {
    if (!userId) return [];
    return getEffectivePermissions(userId, roles);
  }, [userId, roles.join(",")]);

  const has = (permKey: string): boolean => effectivePermissions.includes(permKey);

  return {
    persona,
    isAdmin,
    isDeptManager,
    isManager,
    isUnitHead,
    isIndividual,
    section,
    userId,
    userName: user?.name || "",

    effectivePermissions,
    has,

    // Convenience aliases (derived from has())
    canApproveRequests: has("approve_hr_dept"),
    canUnitApprove: has("approve_hr_unit"),
    canEditCurriculum: has("edit_curriculum") || has("add_curriculum"),
    canEditTasks: has("create_task") || has("edit_task"),
    canViewAllSections: has("view_employees") && has("view_courses"),
    canViewCurriculum: has("view_curriculum"),
    canViewPrep: has("view_archive"),
    canViewActivityLog: has("view_activity_log"),
  };
};
