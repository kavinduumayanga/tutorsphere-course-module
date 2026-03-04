/**
 * Stores and retrieves uploaded file data (as base64) in localStorage.
 * Used so that tutor-uploaded resources can actually be downloaded.
 */

const FILE_STORE_KEY = 'tutorsphere_file_store';

interface StoredFile {
  name: string;
  type: string;       // MIME type
  data: string;       // base64-encoded content
  size: number;       // original byte size
}

function getStore(): Record<string, StoredFile> {
  const raw = localStorage.getItem(FILE_STORE_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch { /* fall through */ }
  }
  return {};
}

function saveStore(store: Record<string, StoredFile>): void {
  localStorage.setItem(FILE_STORE_KEY, JSON.stringify(store));
}

/**
 * Save an uploaded file keyed by resource ID.
 */
export function storeFile(resourceId: string, file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const store = getStore();
      store[resourceId] = {
        name: file.name,
        type: file.type || 'application/octet-stream',
        data: reader.result as string,   // data URL (base64)
        size: file.size,
      };
      saveStore(store);
      resolve();
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Check whether a stored file exists for a resource.
 */
export function hasStoredFile(resourceId: string): boolean {
  const store = getStore();
  return !!store[resourceId];
}

/**
 * Trigger a browser download of a stored file.
 * Returns true if the file was found and downloaded.
 */
export function downloadStoredFile(resourceId: string): boolean {
  const store = getStore();
  const entry = store[resourceId];
  if (!entry) return false;

  const a = document.createElement('a');
  a.href = entry.data;
  a.download = entry.name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => document.body.removeChild(a), 100);
  return true;
}

/**
 * Remove a stored file (called when resource is deleted).
 */
export function removeStoredFile(resourceId: string): void {
  const store = getStore();
  delete store[resourceId];
  saveStore(store);
}
