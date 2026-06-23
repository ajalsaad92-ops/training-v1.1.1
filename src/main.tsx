import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initSync } from "@/lib/sync/syncManager";

// Boots the right sync engine for the active mode (cloud real-time vs. local server).
initSync();

createRoot(document.getElementById("root")!).render(<App />);
