import { useState } from "react";
import { useUITheme, themeMeta, type UITheme } from "@/contexts/UIThemeContext";
import { Palette, Check } from "lucide-react";

const ThemeSwitcher = () => {
  const { theme, setTheme } = useUITheme();
  const [open, setOpen] = useState(false);

  // Lift above the noir floating dock so they don't overlap
  const positionClass = theme === "noir" ? "fixed bottom-24 right-4 z-[60]" : "fixed bottom-5 right-5 z-[60]";

  return (
    <div className={positionClass}>
      {open && (
        <div className="mb-3 w-72 rounded-2xl bg-card border border-border shadow-2xl p-3 animate-scale-in" dir="rtl">
          <p className="text-xs font-bold text-foreground mb-2 px-1">اختر تجربة التصميم</p>
          <div className="space-y-2">
            {(Object.keys(themeMeta) as UITheme[]).map(t => {
              const meta = themeMeta[t];
              const active = theme === t;
              return (
                <button key={t} onClick={() => { setTheme(t); setOpen(false); }}
                  className={`w-full text-right flex items-center gap-3 p-2 rounded-xl transition-all border-2 ${active ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted/50"}`}>
                  <div className="w-12 h-12 rounded-xl shrink-0 shadow-md" style={{ background: meta.gradient }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      {meta.name}
                      {active && <Check className="w-3.5 h-3.5 text-primary" />}
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-tight">{meta.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
      <button onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-full shadow-2xl flex items-center justify-center text-white transition-transform hover:scale-110 active:scale-95"
        style={{ background: themeMeta[theme].gradient }}
        title="تبديل التصميم">
        <Palette className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ThemeSwitcher;
