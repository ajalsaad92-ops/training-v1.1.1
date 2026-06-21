import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { UIThemeProvider } from "@/contexts/UIThemeContext";
import { useUserRole } from "@/hooks/useUserRole";
import Layout from "@/components/Layout";
import ErrorMonitor from "@/components/ErrorMonitor";
import Login from "@/pages/Login";
import ConnectScreen from "@/components/ConnectScreen";
import { lazy, Suspense, useState, useEffect, useRef } from "react";
import { startScheduler } from "@/lib/scheduledReports";
import { Loader2 } from "lucide-react";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const HRAttendance = lazy(() => import("@/pages/HRAttendance"));

const Courses = lazy(() => import("@/pages/Courses"));
const Curriculum = lazy(() => import("@/pages/Curriculum"));
const Evaluation = lazy(() => import("@/pages/Evaluation"));
const Reports = lazy(() => import("@/pages/Reports"));
const Settings = lazy(() => import("@/pages/Settings"));
const Tasks = lazy(() => import("@/pages/Tasks"));
const TrainingPlan = lazy(() => import("@/pages/TrainingPlan"));
const ActivityLog = lazy(() => import("@/pages/ActivityLog"));
const Archive = lazy(() => import("@/pages/Archive"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const ExternalSurvey = lazy(() => import("@/pages/ExternalSurvey"));

const PageLoader = () => (
  <div className="h-64 w-full flex items-center justify-center">
    <Loader2 className="animate-spin text-primary w-6 h-6" />
  </div>
);

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, requireRole }: { children: JSX.Element, requireRole?: boolean }) => {
  const { loading: authLoading } = useAuth();
  
  if (authLoading) return <div className="h-screen w-full flex items-center justify-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
  if (requireRole === false) return <Navigate to="/" replace />;

  return children;
};

const PermissionRoute = ({ children, permission }: { children: JSX.Element, permission: boolean }) => {
  if (permission === false) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();
  const { has } = useUserRole();
  const [serverOk, setServerOk] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/ping").then(r => r.json()).then(j => setServerOk(j.ok === true)).catch(() => setServerOk(false));
    startScheduler();
  }, []);

  if (loading) return <div className="h-screen w-full flex items-center justify-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;

  if (serverOk === false && !window.location.pathname.startsWith("/survey")) {
    const host = window.location.hostname;
    const isHostedApp = /lovable\.(app|dev)$|lovableproject\.com$|vercel\.app$|netlify\.app$/i.test(host);
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile && !isHostedApp) return <ConnectScreen />;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/survey/:courseId/:role" element={<Suspense fallback={<PageLoader />}><ExternalSurvey /></Suspense>} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
        <Route path="settings" element={<Suspense fallback={<PageLoader />}><Settings /></Suspense>} />
        <Route path="curriculum" element={<PermissionRoute permission={has("view_curriculum")}><Suspense fallback={<PageLoader />}><Curriculum /></Suspense></PermissionRoute>} />
        <Route path="activity-log" element={<PermissionRoute permission={has("view_activity_log")}><Suspense fallback={<PageLoader />}><ActivityLog /></Suspense></PermissionRoute>} />
        <Route path="tasks" element={<PermissionRoute permission={has("view_tasks")}><Suspense fallback={<PageLoader />}><Tasks /></Suspense></PermissionRoute>} />
        <Route path="hr" element={<PermissionRoute permission={has("view_hr")}><Suspense fallback={<PageLoader />}><HRAttendance /></Suspense></PermissionRoute>} />

        <Route path="courses" element={<PermissionRoute permission={has("view_courses")}><Suspense fallback={<PageLoader />}><Courses /></Suspense></PermissionRoute>} />
        <Route path="training-plan" element={<PermissionRoute permission={has("view_training_plan")}><Suspense fallback={<PageLoader />}><TrainingPlan /></Suspense></PermissionRoute>} />
        <Route path="archive" element={<PermissionRoute permission={has("view_archive")}><Suspense fallback={<PageLoader />}><Archive /></Suspense></PermissionRoute>} />
        <Route path="evaluation" element={<PermissionRoute permission={has("view_evaluation")}><Suspense fallback={<PageLoader />}><Evaluation /></Suspense></PermissionRoute>} />
        <Route path="reports" element={<PermissionRoute permission={has("view_reports")}><Suspense fallback={<PageLoader />}><Reports /></Suspense></PermissionRoute>} />
      </Route>
      <Route path="/survey/:courseId/:role" element={<Suspense fallback={<PageLoader />}><ExternalSurvey /></Suspense>} />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <UIThemeProvider>
          <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
            <AppRoutes />
            <ErrorMonitor />
          </BrowserRouter>
        </UIThemeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
