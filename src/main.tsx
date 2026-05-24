import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { startSync } from "@/lib/serverSync";

startSync();

createRoot(document.getElementById("root")!).render(<App />);
