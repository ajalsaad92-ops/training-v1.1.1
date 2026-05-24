import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type UITheme = "classic" | "aurora" | "noir";

interface UIThemeContextType {
  theme: UITheme;
  setTheme: (t: UITheme) => void;
}

const UIThemeContext = createContext<UIThemeContextType | undefined>(undefined);

const STORAGE_KEY = "tms_ui_theme";

export const UIThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<UITheme>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as UITheme | null;
    return saved || "classic";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-ui-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (t: UITheme) => setThemeState(t);

  return (
    <UIThemeContext.Provider value={{ theme, setTheme }}>{children}</UIThemeContext.Provider>
  );
};

export const useUITheme = () => {
  const ctx = useContext(UIThemeContext);
  if (!ctx) throw new Error("useUITheme must be used within UIThemeProvider");
  return ctx;
};

export const themeMeta: Record<UITheme, { name: string; description: string; gradient: string }> = {
  classic: {
    name: "الكلاسيكي",
    description: "الشريط الجانبي التقليدي بألوان هادئة",
    gradient: "linear-gradient(135deg, hsl(217 91% 50%), hsl(172 66% 38%))",
  },
  aurora: {
    name: "أورورا",
    description: "زجاجي حيوي مع شريط علوي وتدرجات شفقية",
    gradient: "linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #06b6d4 100%)",
  },
  noir: {
    name: "نوار",
    description: "فخامة سوداء مع لمسات ذهبية وشريط عائم سفلي",
    gradient: "linear-gradient(135deg, #0a0a0a 0%, #1a1410 60%, #c9a14a 100%)",
  },
};
