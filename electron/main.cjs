// CommonJS main process. Must be .cjs because package.json sets "type":"module",
// which would otherwise treat .js as ESM (where __dirname is undefined and importing
// CommonJS deps such as express from inside an asar archive is unreliable).
const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("path");
const os = require("os");
const fs = require("fs");
const http = require("http");
// ✅ FIX: Single source of truth for the port. Previously 3003 here vs 3000 in
// the React side (src/lib/runtime.ts), which made every desktop startup fail
// the /api/ping check and incorrectly show the "ConnectScreen".
const DEFAULT_PORT = 3000;
function resolveDistDir() {
  const packagedCandidates = [
    // Real folder copied by extraResources; Express can serve it reliably.
    path.join(process.resourcesPath || "", "dist"),
    path.join(process.resourcesPath || "", "app", "dist"),
    path.join(app.getAppPath(), "dist"),
    path.join(__dirname, "..", "dist"),
  ];
  const devCandidates = [
    path.join(__dirname, "..", "dist"),
    path.join(process.resourcesPath || "", "dist"),
    path.join(app.getAppPath(), "dist"),
  ];
  const candidates = app.isPackaged ? packagedCandidates : devCandidates;
  return candidates.find((dir) => fs.existsSync(path.join(dir, "index.html"))) || candidates[0];
}
const DIST_DIR = resolveDistDir();
let activePort = DEFAULT_PORT;
let httpServer = null;
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
  // ---- Health & diagnostics ----
  server.get("/api/ping", (_req, res) => res.json({ ok: true, ts: Date.now(), port: activePort }));
  server.get("/api/ip", (_req, res) => res.json({ ok: true, ips: getLanIPs(), port: activePort }));
  server.get("/api/discover", (_req, res) =>
    res.json({ ok: true, role: "server", name: "نظام التدريب — الخادم المحلي", port: activePort, ts: Date.now() }));
  // ---- Data store ----
  server.get("/api/store", (_req, res) => {
    const data = readData();
    res.json({ ok: true, data, ts: data ? Date.now() : 0 });
  });
  server.put("/api/store", (req, res) => {
    const { data } = req.body || {};
    if (!data) return res.status(400).json({ ok: false });
    data.__ts = Date.now();
    try { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8"); } catch (e) {
      return res.status(500).json({ ok: false, error: String(e) });
    }
    res.json({ ok: true, ts: data.__ts });
  });
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
  // ---- Static SPA for LAN clients. The desktop window loads the same files directly. ----
  const indexFile = path.join(DIST_DIR, "index.html");
  server.use(express.static(DIST_DIR));
  // SPA fallback: every non-API GET returns index.html so BrowserRouter routes resolve.
  server.get("*", (_req, res) => {
    if (fs.existsSync(indexFile)) return res.sendFile(indexFile);
    res.status(500).send("Build not found. dist/index.html is missing inside the package.");
  });
  return server;
}
/**
 * ✅ FIX: Robust port fallback.
 * - Tries DEFAULT_PORT first.
 * - On EADDRINUSE, walks up to `maxAttempts` higher ports.
 * - If EVERY attempt fails, the OUTER promise rejects so callers can react.
 *   The previous implementation nested resolve() around a rejecting inner
 *   promise, which silently swallowed the final EADDRINUSE error.
 */
function listenWithFallback(handler, startPort, maxAttempts) {
  return new Promise((resolve, reject) => {
    const tryPort = (port, left) => {
      const srv = http.createServer(handler);
      const onError = (err) => {
        srv.removeListener("listening", onListening);
        if (err.code === "EADDRINUSE" && left > 0) {
          log("Port", port, "in use, trying", port + 1);
          tryPort(port + 1, left - 1);
        } else {
          reject(err);
        }
      };
      const onListening = () => {
        srv.removeListener("error", onError);
        activePort = port;
        httpServer = srv;
        log("Local server listening on port", activePort);
        resolve(srv);
      };
      srv.once("error", onError);
      srv.once("listening", onListening);
      srv.listen(port, "0.0.0.0");
    };
    tryPort(startPort, maxAttempts);
  });
}
async function startServer() {
  if (!fs.existsSync(path.join(DIST_DIR, "index.html"))) {
    log("WARNING: dist/index.html not found at", DIST_DIR);
  }
  const handler = buildApp();
  await listenWithFallback(handler, DEFAULT_PORT, 10);
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
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // ✅ FIX: Expose the actual running port and server status to the renderer
      // so the React side can build absolute API URLs (file:// cannot do relative fetches).
      preload: path.join(__dirname, "preload.cjs"),
      additionalArguments: [
        `--tms-api-port=${activePort}`,
        `--tms-server=${serverStarted ? "1" : "0"}`,
        `--tms-host=${ips[0]?.address || ""}`,
      ],
    },
  });
  // Load the desktop UI directly from the packaged Vite files. This avoids the
  // repeated Windows issue where the BrowserWindow opens http://localhost before
  // static files are reachable and ends on "Cannot GET /" or a white 404 page.
  // The local Express server still runs for API/LAN sync endpoints only.
  const indexFile = path.join(DIST_DIR, "index.html");
  if (fs.existsSync(indexFile)) {
    mainWindow.loadFile(indexFile, {
      query: {
        electron: "1",
        tmsApiPort: String(activePort),
        server: serverStarted ? "1" : "0",
        tmsHost: ips[0]?.address || "",
      },
    });
  } else if (serverStarted) {
    mainWindow.loadURL(`http://localhost:${activePort}`);
  } else {
    dialog.showErrorBox("نظام التدريب", "تعذر تشغيل الخادم المحلي ولم يتم العثور على ملفات التطبيق.");
  }
  mainWindow.webContents.on("did-fail-load", (_e, code, desc, url) => {
    log("did-fail-load", code, desc, url);
  });
  mainWindow.once("ready-to-show", () => mainWindow.show());
  // ✅ IPC: let the renderer query server info at runtime (used by runtime.ts).
  ipcMain.handle("tms:get-server-info", () => ({
    ok: true,
    port: activePort,
    ips: getLanIPs(),
    serverStarted,
  }));
}
app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("before-quit", () => {
  if (httpServer) {
    try { httpServer.close(); } catch {}
    httpServer = null;
  }
});
