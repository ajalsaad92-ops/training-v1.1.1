import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Home, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted" dir="rtl">
      <div className="text-center bg-card border border-border rounded-2xl p-8 shadow-xl max-w-sm">
        <AlertTriangle className="w-16 h-16 text-warning mx-auto mb-4" />
        <h1 className="mb-2 text-5xl font-bold text-foreground">404</h1>
        <p className="mb-4 text-lg text-muted-foreground">الصفحة غير موجودة</p>
        <p className="text-xs text-muted-foreground mb-6">المسار المطلوب غير متاح أو تم حذفه</p>
        <Button onClick={() => navigate("/")} className="gap-2"><Home className="w-4 h-4" />العودة للرئيسية</Button>
      </div>
    </div>
  );
};

export default NotFound;
