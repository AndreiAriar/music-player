const DB_NAME = "musicPlayerDB";
const AUDIO_STORE = "audioFiles";
const COVER_STORE = "coverFiles";
const DB_VERSION = 2;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(AUDIO_STORE)) db.createObjectStore(AUDIO_STORE);
      if (!db.objectStoreNames.contains(COVER_STORE)) db.createObjectStore(COVER_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function putFile(store: string, id: string, file: File): Promise<void> {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(store, "readwrite");
        tx.objectStore(store).put(file, id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      })
  );
}

function getFile(store: string, id: string): Promise<File | null> {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(store, "readonly");
        const req = tx.objectStore(store).get(id);
        req.onsuccess = () => resolve(req.result ?? null);
        req.onerror = () => reject(req.error);
      })
  );
}

function deleteFile(store: string, id: string): Promise<void> {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(store, "readwrite");
        tx.objectStore(store).delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      })
  );
}

export const saveAudioFile = (id: string, file: File) => putFile(AUDIO_STORE, id, file);
export const getAudioFile = (id: string) => getFile(AUDIO_STORE, id);
export const deleteAudioFile = (id: string) => deleteFile(AUDIO_STORE, id);

export const saveCoverFile = (id: string, file: File) => putFile(COVER_STORE, id, file);
export const getCoverFile = (id: string) => getFile(COVER_STORE, id);
export const deleteCoverFile = (id: string) => deleteFile(COVER_STORE, id);