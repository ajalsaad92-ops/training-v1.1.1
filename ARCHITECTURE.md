# Architecture — Cloud & Local/Offline Dual Mode

The app is prepared to run in two modes without breaking existing cloud behaviour.
Default mode is **cloud**, so the current hosted app is unaffected.

## Layers (clean separation)

| Layer | File(s) | Responsibility |
|-------|---------|----------------|
| Mode handling | `src/lib/appConfig.ts` | Single source of truth for mode (cloud/local), server role, local server host/port, storage path. Persisted + event-driven. |
| Device identity | `src/lib/deviceIdentity.ts` | Stable id/name/type per device (used for monitoring). |
| Data layer | `src/lib/localStore.ts` | In-memory + `localStorage` store. Calls `persistChanged()` after every save. |
| Cloud adapter | `src/lib/supabaseSync.ts` | Real-time cloud sync (unchanged). |
| Local adapter | `src/lib/sync/localServerSync.ts` | Connection + storage against the central local server: store push/pull, heartbeat, device list, discovery, IP/port fallback. |
| Sync orchestration | `src/lib/sync/syncManager.ts` | Routes persistence by mode; `initSync`, `reinitSync`, `manualPullFromCloud` (Cloud→Local only). |
| Update management | `src/lib/updates/updateManager.ts` | Manual, selectable update categories vs `/version.json`. |
| Server/client backend | `electron/main.js` | Local Express server: `/api/store`, `/api/ping`, `/api/discover`, `/api/heartbeat`, `/api/devices`, block/unblock, configurable `TMS_DATA_DIR`. |
| UI / settings | `src/components/settings/SystemModeTab.tsx` | Mode switch, server config, discovery, manual sync, device monitor, updates. |

## Behaviour

- **Cloud mode:** automatic real-time cloud sync (exactly as before).
- **Local mode:** no automatic cloud sync. Data persists to the central local server
  (the chosen Windows host = server + database + storage). Clients (phones/PCs) connect over LAN.
- **Sync:** manual only, **Cloud → Local** only. Never Local → Cloud, never automatic.
- **Discovery:** clients probe candidates for `/api/discover`; manual IP/port fallback in Settings.
- **Updates:** manual check, per-category selection. Data/schema apply in place via sync;
  UI/pages/logic/full require installing a new desktop build.

## Future readiness

- Auth/sessions unchanged → compatible with both modes.
- Web-first, server abstracted → PWA / Capacitor (Android/iOS) can be layered without a rebuild.
- Local DB is a JSON file behind the server API; can be swapped for SQLite by changing only `electron/main.js`.
