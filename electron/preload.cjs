// Preload runs in an isolated context with access to a limited set of Node APIs.
// We expose a tiny, typed surface for the renderer (React) so it can discover the
// local server port and build absolute API URLs (necessary because the renderer
// is loaded via file://, where relative fetches to /api/* don't work).
const { contextBridge, ipcRenderer } = require("electron");
function readArg(flag) {
  for (const a of process.argv) {
    if (a.startsWith(flag + "=")) return a.slice(flag.length + 1);
  }
  return "";
}
contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,
  apiPort: parseInt(readArg("--tms-api-port") || "3000", 10),
  host: readArg("--tms-host") || "",
  serverRunning: readArg("--tms-server") === "1",
  getServerInfo: () => ipcRenderer.invoke("tms:get-server-info"),
});
