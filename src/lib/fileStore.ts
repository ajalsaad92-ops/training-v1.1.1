const DB_NAME = "tms_file_store";
const DB_VERSION = 1;
const STORE_NAME = "files";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("entity_key", "entity_key", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface StoredFile {
  id: string;
  entity_key: string;
  filename: string;
  mime_type: string;
  size: number;
  blob: Blob;
  uploaded_at: string;
  uploaded_by: string;
}

const uid = () => `file_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const fileStore = {
  save: async (entityKey: string, file: File, uploadedBy: string): Promise<StoredFile> => {
    const db = await openDB();
    const record: StoredFile = {
      id: uid(),
      entity_key: entityKey,
      filename: file.name,
      mime_type: file.type || "application/octet-stream",
      size: file.size,
      blob: file,
      uploaded_at: new Date().toISOString(),
      uploaded_by: uploadedBy,
    };
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(record);
      tx.oncomplete = () => resolve(record);
      tx.onerror = () => reject(tx.error);
    });
  },

  get: async (id: string): Promise<StoredFile | null> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  },

  getByEntity: async (entityKey: string): Promise<StoredFile[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const idx = tx.objectStore(STORE_NAME).index("entity_key");
      const req = idx.getAll(entityKey);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },

  delete: async (id: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  deleteByEntity: async (entityKey: string): Promise<void> => {
    const files = await fileStore.getByEntity(entityKey);
    for (const f of files) {
      await fileStore.delete(f.id);
    }
  },

  getObjectURL: async (id: string): Promise<string | null> => {
    const file = await fileStore.get(id);
    if (!file) return null;
    return URL.createObjectURL(file.blob);
  },
};
