import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "data.json");
const DIST_DIR = path.join(__dirname, "..", "dist");
const PORT = parseInt(process.env.TMS_PORT || "3000", 10);

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

function readData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    }
  } catch { /* ignore */ }
  return null;
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

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

app.get("/api/store", (_req, res) => {
  const data = readData();
  if (data) {
    res.json({ ok: true, data, ts: Date.now() });
  } else {
    res.json({ ok: true, data: null, ts: 0 });
  }
});

app.put("/api/store", (req, res) => {
  const { data } = req.body;
  if (!data || typeof data !== "object") {
    return res.status(400).json({ ok: false, error: "invalid data" });
  }
  writeData(data);
  res.json({ ok: true, ts: Date.now() });
});

app.get("/api/ping", (_req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

app.get("/api/ip", (_req, res) => {
  res.json({ ok: true, ips: getLanIPs(), port: PORT });
});

app.use(express.static(DIST_DIR));
app.get("*", (_req, res) => {
  const indexPath = path.join(DIST_DIR, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send("App not built. Run 'npm run build' first.");
  }
});

export function startServer() {
  return new Promise((resolve) => {
    app.listen(PORT, "0.0.0.0", () => {
      const ips = getLanIPs();
      console.log(`\n  TMS Server running on:`);
      console.log(`    Local:   http://localhost:${PORT}`);
      ips.forEach(ip => {
        console.log(`    Network: http://${ip.address}:${PORT}`);
      });
      console.log(`\n  Open on phone (same WiFi): http://${ips[0]?.address || "YOUR_IP"}:${PORT}\n`);
      resolve({ port: PORT, ips });
    });
  });
}

if (import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, "/")}`) {
  startServer();
}
