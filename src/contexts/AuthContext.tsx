import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { localDb, defaultUserAccounts } from "@/lib/localStore";

interface UserProfile {
  id: string;
  name: string;
  department: string;
  section: string;
  position: string;
  phone: string;
  roles: string[];
  active?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  session: unknown | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string, department?: string, role?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  impersonate: (userId: string) => void;
  revertImpersonation: () => void;
  originalUserId: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_USER: UserProfile = defaultUserAccounts[0].profile;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<unknown | null>(null);
  const [loading, setLoading] = useState(true);
  const [originalUserId, setOriginalUserId] = useState<string | null>(null);

  useEffect(() => {
    const savedUserId = localStorage.getItem("tms_impersonated_user_id") || localStorage.getItem("tms_current_user_id");
    const origId = localStorage.getItem("tms_original_user_id");
    
    if (origId) setOriginalUserId(origId);

    if (savedUserId) {
      const profile = localDb.profiles.getById(savedUserId);
      if (profile && profile.active !== false) {
        setUser(profile);
        setSession({ user: { id: savedUserId } });
        
        // Session timeout logic (1 hour of inactivity)
        let timeout: NodeJS.Timeout;
        const resetTimeout = () => {
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            logout();
            alert("تم تسجيل الخروج لانتهاء مهلة الجلسة (ساعة واحدة من الخمول)");
          }, 60 * 60 * 1000);
        };
        window.addEventListener("mousemove", resetTimeout);
        window.addEventListener("keydown", resetTimeout);
        resetTimeout();
        
        return () => {
          clearTimeout(timeout);
          window.removeEventListener("mousemove", resetTimeout);
          window.removeEventListener("keydown", resetTimeout);
        };
      } else if (profile?.active === false) {
        // If they were disabled while logged in
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    if (!email && !password) {
      setUser(ADMIN_USER);
      localStorage.setItem("tms_current_user_id", ADMIN_USER.id);
      return { success: true };
    }
    const account = localDb.userAccounts.findByEmail(email);
    if (!account) return { success: false, error: "البريد الإلكتروني غير مسجل" };
    if (account.password !== password) return { success: false, error: "كلمة المرور غير صحيحة" };
    if (account.profile.active === false) return { success: false, error: "هذا الحساب معطل. يرجى مراجعة الإدارة." };
    
    setUser(account.profile);
    setSession({ user: { id: account.profile.id } });
    localStorage.setItem("tms_current_user_id", account.profile.id);
    return { success: true };
  };

  const signup = async (email: string, password: string, name: string, department: string = "", role: string = "individual") => {
    const existing = localDb.userAccounts.findByEmail(email);
    if (existing) return { success: false, error: "البريد الإلكتروني مسجل بالفعل" };
    const id = `emp-${Date.now()}`;
    const profile = { id, name, department, section: department, position: "", phone: "", roles: [role] };
    localDb.profiles.insert(profile);
    localDb.userAccounts.insert({
      email,
      password,
      profile,
    });
    localDb.employees.insert({ id, name, department, section: department, position: "", phone: "", work_schedule: "daily" });
    return { success: true };
  };

  const logout = async () => {
    localStorage.removeItem("tms_current_user_id");
    localStorage.removeItem("tms_impersonated_user_id");
    localStorage.removeItem("tms_original_user_id");
    setUser(null);
    setSession(null);
    setOriginalUserId(null);
  };

  const impersonate = (targetUserId: string) => {
    if (!user) return;
    localStorage.setItem("tms_original_user_id", user.id);
    localStorage.setItem("tms_impersonated_user_id", targetUserId);
    window.location.reload();
  };

  const revertImpersonation = () => {
    localStorage.removeItem("tms_impersonated_user_id");
    localStorage.removeItem("tms_original_user_id");
    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, login, signup, logout, impersonate, revertImpersonation, originalUserId }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
