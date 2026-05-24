import { useState, useEffect, useCallback } from "react";
import { localDb } from "@/lib/localStore";
import { useAuth } from "@/contexts/AuthContext";

type Employee = import("@/lib/localStore").Employee;
type Course = import("@/lib/localStore").Course;
type CourseTrainee = import("@/lib/localStore").CourseTrainee;
type HRRequest = import("@/lib/localStore").HRRequest;
type CurriculumItem = import("@/lib/localStore").CurriculumItem;
type CorrespondenceItem = import("@/lib/localStore").CorrespondenceItem;
type AuditEntry = import("@/lib/localStore").AuditEntry;
type Notification = import("@/lib/localStore").Notification;
type Task = import("@/lib/localStore").Task;
type TaskHandover = import("@/lib/localStore").TaskHandover;
type TaskComment = import("@/lib/localStore").TaskComment;

export type { Employee, Course, CourseTrainee, HRRequest, CurriculumItem, CorrespondenceItem, AuditEntry, Notification, Task, TaskHandover, TaskComment };

// Subscribe to instant local updates (same tab via CustomEvent) and cross-tab via storage.
function useStoreSubscription(refetch: () => void) {
  useEffect(() => {
    refetch();
    const onChange = () => refetch();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "tms_local_store") {
        localDb.invalidateStore();
        refetch();
      }
    };
    window.addEventListener("tms_store_changed", onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("tms_store_changed", onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, [refetch]);
}

export const useEmployees = () => {
  const [data, setData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const refetch = useCallback(() => {
    setData(localDb.employees.getAll().sort((a, b) => b.created_at.localeCompare(a.created_at)));
    setLoading(false);
  }, []);
  useStoreSubscription(refetch);
  return { data, loading, refetch };
};

export const useCourses = () => {
  const [data, setData] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const refetch = useCallback(() => {
    setData(localDb.courses.getAll().sort((a, b) => b.created_at.localeCompare(a.created_at)));
    setLoading(false);
  }, []);
  useStoreSubscription(refetch);
  return { data, loading, refetch };
};

export const useHRRequests = () => {
  const [data, setData] = useState<HRRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const refetch = useCallback(() => {
    setData(localDb.hrRequests.getAll().sort((a, b) => b.created_at.localeCompare(a.created_at)));
    setLoading(false);
  }, []);
  useStoreSubscription(refetch);
  return { data, loading, refetch };
};

export const useCurriculumItems = () => {
  const [data, setData] = useState<CurriculumItem[]>([]);
  const [loading, setLoading] = useState(true);
  const refetch = useCallback(() => {
    setData(localDb.curriculumItems.getAll().sort((a, b) => b.created_at.localeCompare(a.created_at)));
    setLoading(false);
  }, []);
  useStoreSubscription(refetch);
  return { data, loading, refetch };
};

export const useCorrespondence = () => {
  const [data, setData] = useState<CorrespondenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const refetch = useCallback(() => {
    setData(localDb.correspondence.getAll().sort((a, b) => b.created_at.localeCompare(a.created_at)));
    setLoading(false);
  }, []);
  useStoreSubscription(refetch);
  return { data, loading, refetch };
};

export const useAuditLog = () => {
  const [data, setData] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const refetch = useCallback(() => {
    setData(localDb.auditLog.getAll().sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
    setLoading(false);
  }, []);
  useStoreSubscription(refetch);
  return { data, loading, refetch };
};

export const useNotifications = () => {
  const [data, setData] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const userId = user?.id || "";

  const refetch = useCallback(() => {
    const all = localDb.notifications.getAll();
    const mine = all.filter((n: Notification) => !n.user_id || n.user_id === userId);
    setData(mine.sort((a: Notification, b: Notification) => (b.created_at || "").localeCompare(a.created_at || "")));
    setLoading(false);
  }, [userId]);

  useStoreSubscription(refetch);
  return { data, loading, refetch };
};

export const useTasks = () => {
  const [data, setData] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const refetch = useCallback(() => {
    setData(localDb.tasks.getAll().sort((a, b) => b.created_at.localeCompare(a.created_at)));
    setLoading(false);
  }, []);
  useStoreSubscription(refetch);
  return { data, loading, refetch };
};

export const useTaskHandovers = (taskId?: string) => {
  const [data, setData] = useState<TaskHandover[]>([]);
  const [loading, setLoading] = useState(true);
  const refetch = useCallback(() => {
    let result = localDb.taskHandovers.getAll().sort((a, b) => b.created_at.localeCompare(a.created_at));
    if (taskId) result = result.filter(t => t.task_id === taskId);
    setData(result);
    setLoading(false);
  }, [taskId]);
  useStoreSubscription(refetch);
  return { data, loading, refetch };
};

export const useTaskComments = (taskId?: string) => {
  const [data, setData] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState(true);
  const refetch = useCallback(() => {
    let result = localDb.taskComments.getAll().sort((a: TaskComment, b: TaskComment) => (a.created_at || "").localeCompare(b.created_at || ""));
    if (taskId) result = result.filter((c: TaskComment) => c.task_id === taskId);
    setData(result);
    setLoading(false);
  }, [taskId]);
  useStoreSubscription(refetch);
  return { data, loading, refetch };
};
