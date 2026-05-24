import { localDb } from "@/lib/localStore";

export const logAction = async (userName: string, action: string, target: string) => {
  localDb.auditLog.insert({ user_name: userName, action, target });
};
