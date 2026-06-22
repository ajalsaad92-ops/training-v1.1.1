// CommonJS main process. Must be .cjs because package.json sets "type":"module",
// which would otherwise treat .js as ESM (where __dirname is undefined and importing
// CommonJS deps such as express from inside an asar archive is unreliable).
const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");
const os = require("os");
const fs = require("fs");
const http = require("http");

const DEFAULT_PORT = 3000;

function resolveDistDir() {
  const candidates = [
    path.join(__dirname, "..", "dist"),
    path.join(process.resourcesPath || "", "app", "dist"),
    path.join(process.resourcesPath || "", "dist"),
    path.join(app.getAppPath(), "dist"),
  ];
  return candidates.find((dir) => fs.existsSync(path.join(dir, "index.html"))) || candidates[0];
}

const DIST_DIR = resolveDistDir();

function log(...args) {
  try {
    const line = `[${new Date().toISOString()}] ` + args.map(String).join(" ") + "\n";
    fs.appendFileSync(path.join(os.tmpdir(), "tms-electron.log"), line);
  } catch {}
  // eslint-disable-next-line no-console
  console.log(...args);
}

function getLanIPs() {
  const nets = os.networkInterfaces();
  const results = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === "IPv4" && !net.internal) {
        results.push({ iface: name, address: net.address });
      }
    }
  }
  return results;
}

function buildApp() {
  const express = require("express");
  const cors = require("cors");

  // Storage location is configurable via TMS_DATA_DIR (set by the desktop app / Settings).
  const DATA_DIR = process.env.TMS_DATA_DIR || path.join(app.getPath("userData"), "data");
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch {}
  const DATA_FILE = path.join(DATA_DIR, "data.json");
  const DEVICES_FILE = path.join(DATA_DIR, "devices.json");

  const server = express();
  server.use(cors());
  server.use(express.json({ limit: "10mb" }));

  function readData() {
    try { if (fs.existsSync(DATA_FILE)) return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")); } catch {}
    return null;
  }
  function readDevices() {
    try { if (fs.existsSync(DEVICES_FILE)) return JSON.parse(fs.readFileSync(DEVICES_FILE, "utf-8")); } catch {}
    return {};
  }
  function writeDevices(d) {
    try { fs.writeFileSync(DEVICES_FILE, JSON.stringify(d, null, 2), "utf-8"); } catch {}
  }
  function clientIp(req) {
    const fwd = req.headers["x-forwarded-for"];
    return (fwd ? String(fwd).split(",")[0] : req.socket?.remoteAddress || "").replace("::ffff:", "");
  }

  // ---- Data store ----
  server.get("/api/store", (_req, res) => {
    const data = readData();
    res.json({ ok: true, data, ts: data ? Date.now() : 0 });
  });
  server.put("/api/store", (req, res) => {
    const { data } = req.body || {};
    if (!data) return res.status(400).json({ ok: false });
    data.__ts = Date.now();
    try { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8"); } catch (e) { return res.status(500).json({ ok: false, error: String(e) }); }
    res.json({ ok: true, ts: data.__ts });
  });

  // ---- Diagnostics / discovery ----
  server.get("/api/ping", (_req, res) => res.json({ ok: true, ts: Date.now() }));
  server.get("/api/ip", (_req, res) => res.json({ ok: true, ips: getLanIPs(), port: activePort }));
  server.get("/api/discover", (_req, res) =>
    res.json({ ok: true, role: "server", name: "نظام التدريب — الخادم المحلي", port: activePort, ts: Date.now() }));

  // ---- Devices registry ----
  server.post("/api/heartbeat", (req, res) => {
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
  server.get("/api/devices", (_req, res) => {
    const devices = readDevices();
    const now = Date.now();
    const list = Object.values(devices).map((d) => ({ ...d, online: now - new Date(d.lastSeen).getTime() < 30000 }));
    res.json({ ok: true, devices: list });
  });
  server.post("/api/devices/:id/block", (req, res) => {
    const devices = readDevices();
    const d = devices[req.params.id];
    if (!d) return res.status(404).json({ ok: false });
    d.blocked = !!(req.body && req.body.blocked);
    writeDevices(devices);
    res.json({ ok: true });
  });

  // ---- Static SPA (served from real files; asar is disabled in electron-builder.yml) ----
  const indexFile = path.join(DIST_DIR, "index.html");
  server.use(express.static(DIST_DIR));
  // SPA fallback: every non-API GET returns index.html so BrowserRouter routes resolve.
  server.get("*", (_req, res) => {
    if (fs.existsSync(indexFile)) return res.sendFile(indexFile);
    res.status(500).send("Build not found. dist/index.html is missing inside the package.");
  });

  return server;
}

let activePort = DEFAULT_PORT;

// Try the default port, then a few fallbacks if it is already in use.
function listenWithFallback(handler, port, attemptsLeft) {
  return new Promise((resolve, reject) => {
    const srv = http.createServer(handler);
    srv.on("error", (err) => {
      if (err.code === "EADDRINUSE" && attemptsLeft > 0) {
        log("Port", port, "in use, trying", port + 1);
        resolve(listenWithFallback(handler, port + 1, attemptsLeft - 1));
      } else {
        reject(err);
      }
    });
    srv.listen(port, "0.0.0.0", () => {
      activePort = port;
      resolve(srv);
    });
  });
}

async function startServer() {
  if (!fs.existsSync(path.join(DIST_DIR, "index.html"))) {
    log("WARNING: dist/index.html not found at", DIST_DIR);
  }
  const handler = buildApp();
  await listenWithFallback(handler, DEFAULT_PORT, 10);
  log("Local server listening on port", activePort);
}

let mainWindow = null;

async function createWindow() {
  let serverStarted = true;
  try {
    await startServer();
  } catch (e) {
    serverStarted = false;
    log("Server failed to start:", e && e.stack ? e.stack : String(e));
  }

  const ips = getLanIPs();
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    title: `نظام التدريب — ${ips[0]?.address || "localhost"}:${activePort}`,
    show: false,
    webPreferences: { nodeIntegration: false, contextIsolation: true },
  });

  if (serverStarted) {
    mainWindow.loadURL(`http://localhost:${activePort}`);
  } else {
    // Fallback: load the built file directly so the user never gets a blank/Cannot GET screen.
    const indexFile = path.join(DIST_DIR, "index.html");
    if (fs.existsSync(indexFile)) mainWindow.loadFile(indexFile);
    else dialog.showErrorBox("نظام التدريب", "تعذر تشغيل الخادم المحلي ولم يتم العثور على ملفات التطبيق.");
  }

  mainWindow.webContents.on("did-fail-load", (_e, code, desc, url) => {
    log("did-fail-load", code, desc, url);
  });

  mainWindow.once("ready-to-show", () => mainWindow.show());
  mainWindow.on("closed", () => { mainWindow = null; });
}

app.whenReady().then(createWindow).catch((e) => {
  log("whenReady error:", e && e.stack ? e.stack : String(e));
});
app.on("window-all-closed", () => app.quit());
app.on("activate", () => { if (!mainWindow) createWindow(); });
