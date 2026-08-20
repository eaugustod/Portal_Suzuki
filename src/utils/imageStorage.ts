// IndexedDB + LocalStorage persistent storage for Suzuki EPC exploded view PNGs
const DB_NAME = 'suzuki_epc_diagrams_db';
const STORE_NAME = 'diagram_images';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'diagramId' });
      }
    };

    request.onsuccess = (event: any) => {
      resolve(event.target.result as IDBDatabase);
    };

    request.onerror = (event: any) => {
      reject(event.target.error);
    };
  });
}

export async function saveDiagramImage(diagramId: string, dataUrl: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ diagramId, dataUrl, updatedAt: Date.now() });

      request.onsuccess = () => {
        resolve();
      };
      request.onerror = (e: any) => {
        reject(e.target.error);
      };
    });
  } catch (err) {
    // Fallback to localStorage
    try {
      localStorage.setItem(`epc_img_${diagramId}`, dataUrl);
    } catch (localErr) {
      console.warn('Could not save to localStorage fallback:', localErr);
    }
  }
}

export async function getDiagramImage(diagramId: string): Promise<string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(diagramId);

      request.onsuccess = (e: any) => {
        const result = e.target.result;
        if (result && result.dataUrl) {
          resolve(result.dataUrl);
        } else {
          // Check localStorage fallback
          const fallback = localStorage.getItem(`epc_img_${diagramId}`);
          resolve(fallback);
        }
      };

      request.onerror = () => {
        const fallback = localStorage.getItem(`epc_img_${diagramId}`);
        resolve(fallback);
      };
    });
  } catch {
    const fallback = localStorage.getItem(`epc_img_${diagramId}`);
    return fallback;
  }
}

export async function deleteDiagramImage(diagramId: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(diagramId);
      request.onsuccess = () => resolve();
      request.onerror = (e: any) => reject(e.target.error);
    });
  } catch {
    // Ignore error
  }
  localStorage.removeItem(`epc_img_${diagramId}`);
}
