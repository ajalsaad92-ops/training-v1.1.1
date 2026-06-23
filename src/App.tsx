import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { UIThemeProvider } from "@/contexts/UIThemeContext";
import { useUserRole } from "@/hooks/useUserRole";
import Layout from "@/components/Layout";
import ErrorMonitor from "@/components/ErrorMonitor";
import Login from "@/pages/Login";
import ConnectScreen from "@/components/ConnectScreen";
import { lazy, Suspense, useState, useEffect, useCallback } from "react";
import { startScheduler } from "@/lib/scheduledReports";
import { Loader2 } from "lucide-react";
import {
  isCapacitorNative,
  isMobileDevice,
  isElectronRuntime,
  getRuntimeApiBaseUrl,
  pingLocalServer,
} from "@/lib/runtime";
import { getConfig } from "@/lib/appConfig";
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
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);
const queryClient = new QueryClient();
// ✅ اختيار الراوتر بناءً على المنصة
const Router = (isCapacitorNative() || isMobileDevice()) ? HashRouter : BrowserRouter;
const routerProps = (isCapacitorNative() || isMobileDevice())
  ? {}
  : { future: { v7_relativeSplatPath: true, v7_startTransition: true } };
const ProtectedRoute = ({ children, requireRole }: { children: JSX.Element, requireRole?: boolean }) => {
  const { loading: authLoading } = useAuth();
  if (authLoading) return <PageLoader />;
  if (requireRole === false) return <Navigate to="/dashboard" replace />;
  return children;
};
const PermissionRoute = ({ children, permission }: { children: JSX.Element, permission: boolean }) => {
  if (permission === false) return <Navigate to="/dashboard" replace />;
  return children;
};
const AppRoutes = () => {
  const { user, loading } = useAuth();
  const { has } = useUserRole();
  const [serverOk, setServerOk] = useState<boolean | null>(null);
  // ✅ فحص الاتصال بالخادم — يستخدم pingLocalServer (مطلق، يعمل على file:// أيضاً)
  const checkServer = useCallback(async () => {
    // 1) إذا كنا على Electron والخادم معروف أنه يعمل — لا تفحص أبداً
    if (isElectronRuntime() && (window as any).electronAPI?.serverRunning === true) {
      setServerOk(true);
      return;
    }
    // 2) جرّب العنوان من الإعدادات (أو localhost على Electron)
    const apiBase = getRuntimeApiBaseUrl();
    if (apiBase) {
      const ok = await pingLocalServer(3000);
      setServerOk(ok);
      return;
    }
    // 3) لا يوجد عنوان — على المتصفح العادي (سحابي) لا حاجة لخادم محلي
    if (!isCapacitorNative() && !isMobileDevice()) {
      setServerOk(null);
      return;
    }
    // 4) على الهاتف بدون عنوان — فشل
    setServerOk(false);
  }, []);
  useEffect(() => {
    checkServer();
    startScheduler();
  }, [checkServer]);
  // الاستماع لتغييرات الإعدادات (بعد ConnectScreen)
  useEffect(() => {
    const handleConfigChange = () => {
      checkServer();
    };
    window.addEventListener("tms-config-changed", handleConfigChange);
    return () => window.removeEventListener("tms-config-changed", handleConfigChange);
  }, [checkServer]);
  if (loading) return <PageLoader />;
  // ✅ إظهار ConnectScreen على الهاتف إذا الخادم غير متاح
  const onSurvey =
    window.location.pathname.startsWith("/survey") ||
    window.location.hash.startsWith("#/survey");
  if (!onSurvey && serverOk === false) {
    const host = window.location.hostname;
    const isHostedApp =
      /lovable\.(app|dev)$|lovableproject\.com$|vercel\.app$|netlify\.app$/i.test(host);
    const isMobile = isCapacitorNative() || isMobileDevice();
    if (isMobile && !isHostedApp) {
      return <ConnectScreen onRetry={checkServer} />;
    }
  }
  if (!user) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/survey" element={<ExternalSurvey />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    );
  }
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/hr-attendance" element={<ProtectedRoute requireRole={has("hr_attendance")}><HRAttendance /></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
          <Route path="/curriculum" element={<ProtectedRoute><Curriculum /></ProtectedRoute>} />
          <Route path="/evaluation" element={<ProtectedRoute><Evaluation /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
          <Route path="/training-plan" element={<ProtectedRoute><TrainingPlan /></ProtectedRoute>} />
          <Route path="/activity-log" element={<ProtectedRoute><ActivityLog /></ProtectedRoute>} />
          <Route path="/archive" element={<ProtectedRoute><Archive /></ProtectedRoute>} />
          <Route path="/survey" element={<ExternalSurvey />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
};
const App = () => (
  <QueryClientProvider client={queryClient}>
    <UIThemeProvider>
      <TooltipProvider>
        <AuthProvider>
          <Router {...routerProps}>
            <ErrorMonitor />
            <Sonner />
            <Toaster />
            <AppRoutes />
          </Router>
        </AuthProvider>
      </TooltipProvider>
    </UIThemeProvider>
  </QueryClientProvider>
);
export default App;
