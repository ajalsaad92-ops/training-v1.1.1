import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { localDb } from "@/lib/localStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { CheckCircle2, Loader2, Star } from "lucide-react";

export default function ExternalSurvey() {
  const { courseId, role } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [submitted, setSubmitted] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [rating1, setRating1] = useState(0); // General Rating
  const [rating2, setRating2] = useState(0); // Specific Rating (Trainer/Environment)
  const [notes, setNotes] = useState("");

  useEffect(() => {
    // Check if course exists in localDb first (if accessed from admin device)
    const c = localDb.courses.getAll().find((c: any) => c.id === courseId);
    if (c) {
      setCourse(c);
    } else {
      // If accessed from a mobile device (external survey), try to construct it from URL params
      const courseName = searchParams.get("name");
      const courseDate = searchParams.get("date");
      if (courseName) {
        setCourse({ id: courseId, name: courseName, date: courseDate });
      }
    }
    setLoading(false);
  }, [courseId, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: "خطأ", description: "يرجى كتابة الاسم", variant: "destructive" });
      return;
    }
    if (rating1 === 0 || rating2 === 0) {
      toast({ title: "خطأ", description: "يرجى تحديد التقييم بالنجوم", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase
        .from('evaluations')
        .insert([
          {
            course_id: courseId!,
            evaluator_name: name,
            evaluator_role: role === "trainee" ? "متدرب" : role === "trainer" ? "مدرب" : "مشرف",
            scores: {
              general: rating1,
              specific: rating2
            },
            notes: notes,
            is_external: true
          }
        ]);

      if (error) throw error;

      toast({ title: "تم", description: "شكراً لك! تم إرسال التقييم بنجاح." });
      setSubmitted(true);
    } catch (error: any) {
      console.error('Error submitting evaluation:', error);
      toast({ title: "خطأ", description: "حدث خطأ أثناء إرسال التقييم، يرجى المحاولة مرة أخرى.", variant: "destructive" });
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  
  if (!course) return (
    <div className="flex flex-col items-center justify-center h-screen p-4 text-center" dir="rtl">
      <h1 className="text-2xl font-bold text-destructive mb-2">الدورة غير موجودة</h1>
      <p className="text-muted-foreground">الرابط الذي تحاول الوصول إليه غير صالح أو تم حذفه.</p>
    </div>
  );

  if (submitted) return (
    <div className="flex flex-col items-center justify-center h-screen p-4 text-center bg-background" dir="rtl">
      <div className="bg-card border border-border p-8 rounded-2xl shadow-xl max-w-sm w-full flex flex-col items-center animate-bounce-in">
        <CheckCircle2 className="w-16 h-16 text-success mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">تم الإرسال بنجاح!</h1>
        <p className="text-muted-foreground mb-6">شكراً لتقييمك ومساهمتك في تطوير برامجنا التدريبية.</p>
        <Button onClick={() => window.close()} className="w-full">إغلاق</Button>
      </div>
    </div>
  );

  const getRoleLabel = () => {
    if (role === "trainee") return "استمارة تقييم متدرب";
    if (role === "trainer") return "استمارة تقييم مدرب";
    return "استمارة تقييم مشرف";
  };

  const StarRating = ({ value, onChange, label }: { value: number, onChange: (v: number) => void, label: string }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-1 justify-center bg-muted/30 p-3 rounded-xl border border-border/50" dir="ltr">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`p-1 transition-transform hover:scale-110 focus:outline-none`}
          >
            <Star className={`w-8 h-8 ${star <= value ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-4 flex justify-center items-start md:items-center py-8" dir="rtl">
      <div className="bg-card border border-border rounded-3xl shadow-xl max-w-md w-full overflow-hidden animate-slide-up">
        <div className="bg-primary/10 p-6 border-b border-border/50 text-center">
          <h1 className="text-xl font-bold text-primary mb-1">{getRoleLabel()}</h1>
          <h2 className="text-sm text-foreground font-semibold truncate">{course.name || course.title}</h2>
          <p className="text-xs text-muted-foreground mt-1">{course.date || course.start_date}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label>الاسم الكامل</Label>
            <Input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="اكتب اسمك الثلاثي..." 
              required
              className="bg-muted/50"
            />
          </div>

          <StarRating 
            value={rating1} 
            onChange={setRating1} 
            label={role === "trainee" ? "تقييم المدرب والمادة العلمية" : "التقييم العام للدورة والتفاعل"} 
          />

          <StarRating 
            value={rating2} 
            onChange={setRating2} 
            label={role === "trainee" ? "تقييم قاعة التدريب والخدمات" : "تقييم مستوى المتدربين والبيئة"} 
          />

          <div className="space-y-2">
            <Label>ملاحظات إضافية (اختياري)</Label>
            <Textarea 
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
              placeholder="أضف أي مقترحات أو ملاحظات..."
              rows={3}
              className="resize-none bg-muted/50"
            />
          </div>

          <Button type="submit" className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20 gap-2">
            إرسال التقييم
          </Button>
        </form>
      </div>
    </div>
  );
}
