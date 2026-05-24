import { supabase } from "./supabase";
import { localDb } from "./localStore";

const SYNC_DEBOUNCE = 800;
let pushTimer: ReturnType<typeof setTimeout> | null = null;
let isSyncing = false;
let lastServerTs = 0;
let onRemoteUpdate: ((data: Record<string, unknown>) => void) | null = null;
let isInitialized = false;

// Pull state from Supabase
export async function pullFromSupabase(): Promise<Record<string, unknown> | null> {
  try {
    const { data, error } = await supabase
      .from('global_state')
      .select('data, updated_at')
      .eq('id', 1)
      .single();

    if (error || !data) return null;

    const ts = new Date(data.updated_at).getTime();
    if (ts > lastServerTs) {
      lastServerTs = ts;
      return data.data as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

// Push state to Supabase
export async function pushToSupabase(): Promise<boolean> {
  if (isSyncing) return false;
  isSyncing = true;
  try {
    const stored = localStorage.getItem("tms_local_store");
    if (!stored) { isSyncing = false; return false; }
    
    const parsedData = JSON.parse(stored);
    
    const { data, error } = await supabase
      .from('global_state')
      .upsert({ 
        id: 1, 
        data: parsedData,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
      .select('updated_at')
      .single();

    if (!error && data) {
      lastServerTs = new Date(data.updated_at).getTime();
    }
    isSyncing = false;
    return !error;
  } catch {
    isSyncing = false;
    return false;
  }
}

// Debounced push for performance
export function debouncedPush() {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushToSupabase();
  }, SYNC_DEBOUNCE);
}

// Apply remote update to local storage
function applyRemoteUpdate(remoteData: Record<string, unknown>) {
  const localRaw = localStorage.getItem("tms_local_store");
  const localData = localRaw ? JSON.parse(localRaw) : {};
  const merged = { ...localData, ...remoteData };
  localStorage.setItem("tms_local_store", JSON.stringify(merged));
  
  // Notify localStore to clear cache
  try { window.dispatchEvent(new CustomEvent("tms_remote_update")); } catch { /* noop */ }
  // Notify React hooks to re-render
  try { window.dispatchEvent(new CustomEvent("tms_store_changed")); } catch { /* noop */ }
  
  if (onRemoteUpdate) onRemoteUpdate(merged);
}

// Ensure server is always available (as we're online)
export function getServerAvailable() { return isInitialized; }

// Start real-time sync with Supabase
export function startSync(callback?: (data: Record<string, unknown>) => void) {
  onRemoteUpdate = callback || null;
  
  // Initial Pull
  pullFromSupabase().then(data => {
    if (data) applyRemoteUpdate(data);
    isInitialized = true;
  });

  // Subscribe to real-time changes
  supabase
    .channel('global_state_changes')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'global_state',
        filter: 'id=eq.1'
      },
      (payload) => {
        // If we get an update, pull the new data
        if (payload.new && (payload.new as any).data) {
          const newData = (payload.new as any).data;
          const newTs = new Date((payload.new as any).updated_at).getTime();
          
          if (newTs > lastServerTs) {
            lastServerTs = newTs;
            applyRemoteUpdate(newData);
          }
        } else {
          // Fallback if payload doesn't contain data
          pullFromSupabase().then(data => {
            if (data) applyRemoteUpdate(data);
          });
        }
      }
    )
    .subscribe((status) => {
      console.log("Supabase Realtime status:", status);
    });
}

export function stopSync() {
  supabase.removeAllChannels();
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = null;
}
