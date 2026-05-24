import { app, BrowserWindow } from "electron";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import { createServer } from "http";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, "..", "dist");
const PORT = 3000;

function getLanIPs() {
  const nets = os.networkInterfaces();
  const results = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        results.push({ iface: name, address: net.address });
      }
    }
  }
  return results;
}

async function startServer() {
  const express = (await import("express")).default;
  const cors = (await import("cors")).default;
  const fs = await import("fs");

  const DATA_FILE = path.join(__dirname, "..", "server", "data.json");

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));

  function readData() {
    try {
      if (fs.existsSync(DATA_FILE)) return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    } catch {}
    return null;
  }

  app.get("/api/store", (_req, res) => {
    const data = readData();
    res.json({ ok: true, data, ts: data ? Date.now() : 0 });
  });

  app.put("/api/store", (req, res) => {
    const { data } = req.body;
    if (!data) return res.status(400).json({ ok: false });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    res.json({ ok: true, ts: Date.now() });
  });

  app.get("/api/ping", (_req, res) => res.json({ ok: true, ts: Date.now() }));
  app.get("/api/ip", (_req, res) => res.json({ ok: true, ips: getLanIPs(), port: PORT }));
  app.use(express.static(DIST_DIR));
  app.get("*", (_req, res) => {
    const f = path.join(DIST_DIR, "index.html");
    fs.existsSync(f) ? res.sendFile(f) : res.status(404).send("Run npm run build first");
  });

  return new Promise((resolve) => {
    const server = createServer(app);
    server.listen(PORT, "0.0.0.0", () => resolve(server));
  });
}

let mainWindow = null;

async function createWindow() {
  await startServer();
  const ips = getLanIPs();

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    title: `نظام التدريب — ${ips[0]?.address || "localhost"}:${PORT}`,
    show: false,
    webPreferences: { nodeIntegration: false, contextIsolation: true },
  });

  mainWindow.loadURL(`http://localhost:${PORT}`);
  mainWindow.once("ready-to-show", () => mainWindow.show());
  mainWindow.on("closed", () => { mainWindow = null; });
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => app.quit());
app.on("activate", () => { if (!mainWindow) createWindow(); });
