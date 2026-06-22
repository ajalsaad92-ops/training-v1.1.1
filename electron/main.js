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

  // Storage location is configurable via TMS_DATA_DIR (set by the desktop app / Settings).
  const DATA_DIR = process.env.TMS_DATA_DIR || path.join(__dirname, "..", "server");
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch {}
  const DATA_FILE = path.join(DATA_DIR, "data.json");
  const DEVICES_FILE = path.join(DATA_DIR, "devices.json");

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));

  function readData() {
    try {
      if (fs.existsSync(DATA_FILE)) return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    } catch {}
    return null;
  }

  // ----- Connected devices registry (monitoring + access control) -----
  function readDevices() {
    try {
      if (fs.existsSync(DEVICES_FILE)) return JSON.parse(fs.readFileSync(DEVICES_FILE, "utf-8"));
    } catch {}
    return {};
  }
  function writeDevices(d) {
    try { fs.writeFileSync(DEVICES_FILE, JSON.stringify(d, null, 2), "utf-8"); } catch {}
  }
  function clientIp(req) {
    const fwd = req.headers["x-forwarded-for"];
    return (fwd ? String(fwd).split(",")[0] : req.socket?.remoteAddress || "").replace("::ffff:", "");
  }

  app.get("/api/store", (_req, res) => {
    const data = readData();
    res.json({ ok: true, data, ts: data ? Date.now() : 0 });
  });

  app.put("/api/store", (req, res) => {
    const { data } = req.body;
    if (!data) return res.status(400).json({ ok: false });
    // Stamp a server-side timestamp so polling clients can detect changes cheaply.
    data.__ts = Date.now();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    res.json({ ok: true, ts: data.__ts });
  });

  app.get("/api/ping", (_req, res) => res.json({ ok: true, ts: Date.now() }));
  app.get("/api/ip", (_req, res) => res.json({ ok: true, ips: getLanIPs(), port: PORT }));

  // Discovery handshake — lets clients confirm this host is the TMS local server.
  app.get("/api/discover", (_req, res) =>
    res.json({ ok: true, role: "server", name: "نظام التدريب — الخادم المحلي", port: PORT, ts: Date.now() }));

  // Heartbeat — clients register/refresh themselves so the server can monitor them.
  app.post("/api/heartbeat", (req, res) => {
    const { id, name, type, platform } = req.body || {};
    if (!id) return res.status(400).json({ ok: false });
    const devices = readDevices();
    const existing = devices[id] || {};
    if (existing.blocked) return res.status(403).json({ ok: false, blocked: true });
    devices[id] = {
      id,
      name: name || existing.name || "جهاز",
      type: type || existing.type || "unknown",
      platform: platform || existing.platform || "",
      ip: clientIp(req),
      firstSeen: existing.firstSeen || new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      blocked: false,
    };
    writeDevices(devices);
    res.json({ ok: true });
  });

  app.get("/api/devices", (_req, res) => {
    const devices = readDevices();
    const now = Date.now();
    const list = Object.values(devices).map((d) => ({
      ...d,
      online: now - new Date(d.lastSeen).getTime() < 30_000,
    }));
    res.json({ ok: true, devices: list });
  });

  app.post("/api/devices/:id/block", (req, res) => {
    const devices = readDevices();
    const d = devices[req.params.id];
    if (!d) return res.status(404).json({ ok: false });
    d.blocked = !!(req.body && req.body.blocked);
    writeDevices(devices);
    res.json({ ok: true });
  });

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
