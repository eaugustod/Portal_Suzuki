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

export async function saveDiagramImage(diagramId: string, dataUrl: string, illustrationCode?: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      store.put({ diagramId, dataUrl, updatedAt: Date.now() });
      if (illustrationCode && illustrationCode !== diagramId) {
        store.put({ diagramId: illustrationCode, dataUrl, updatedAt: Date.now() });
      }

      transaction.oncomplete = () => resolve();
      transaction.onerror = (e: any) => reject(e.target.error);
    });
  } catch (err) {
    console.warn('IndexedDB write failed, continuing with localStorage fallback', err);
  }

  // Always keep localStorage synchronized as instant fallback
  try {
    localStorage.setItem(`epc_img_${diagramId}`, dataUrl);
    if (illustrationCode) {
      localStorage.setItem(`epc_img_${illustrationCode}`, dataUrl);
    }
  } catch (localErr) {
    console.warn('Could not save to localStorage fallback:', localErr);
  }
}

export async function getDiagramImage(diagramId: string, illustrationCode?: string): Promise<string | null> {
  try {
    const db = await openDB();
    const idbResult = await new Promise<string | null>((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(diagramId);

      request.onsuccess = (e: any) => {
        const result = e.target.result;
        if (result && result.dataUrl) {
          resolve(result.dataUrl);
        } else if (illustrationCode) {
          const req2 = store.get(illustrationCode);
          req2.onsuccess = (e2: any) => {
            const res2 = e2.target.result;
            resolve(res2?.dataUrl || null);
          };
          req2.onerror = () => resolve(null);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => resolve(null);
    });

    if (idbResult) return idbResult;
  } catch {
    // Continue to localStorage fallback
  }

  const fallback = localStorage.getItem(`epc_img_${diagramId}`) || 
    (illustrationCode ? localStorage.getItem(`epc_img_${illustrationCode}`) : null);
  return fallback;
}

export async function deleteDiagramImage(diagramId: string, illustrationCode?: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.delete(diagramId);
      if (illustrationCode) {
        store.delete(illustrationCode);
      }
      transaction.oncomplete = () => resolve();
      transaction.onerror = (e: any) => reject(e.target.error);
    });
  } catch {
    // Ignore error
  }
  localStorage.removeItem(`epc_img_${diagramId}`);
  if (illustrationCode) {
    localStorage.removeItem(`epc_img_${illustrationCode}`);
  }
}
