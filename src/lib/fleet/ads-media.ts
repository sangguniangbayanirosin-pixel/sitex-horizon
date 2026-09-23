const DB_NAME = "sitex-ads";
const STORE = "media";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveAdBlob(id: string, blob: Blob): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(blob, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function loadAdBlob(id: string): Promise<Blob | null> {
  const db = await openDb();
  const blob = await new Promise<Blob | null>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve((req.result as Blob | undefined) ?? null);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return blob;
}

export async function deleteAdBlob(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

const objectUrls = new Map<string, string>();

export async function resolveAdSrc(src: string): Promise<string> {
  if (!src.startsWith("idb:")) return src;
  const id = src.slice(4);
  const cached = objectUrls.get(id);
  if (cached) return cached;
  const blob = await loadAdBlob(id);
  if (!blob) return "";
  const url = URL.createObjectURL(blob);
  objectUrls.set(id, url);
  return url;
}

export function isUploadedSrc(src: string): boolean {
  return src.startsWith("idb:");
}

export async function compressImageFile(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const max = 1600;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/jpeg", 0.84),
  );
  return blob ?? file;
}

export function detectKind(file: File): "poster" | "video" | null {
  if (file.type.startsWith("image/")) return "poster";
  if (file.type.startsWith("video/")) return "video";
  const name = file.name.toLowerCase();
  if (/\.(jpe?g|png|webp|gif)$/.test(name)) return "poster";
  if (/\.(mp4|webm|mov)$/.test(name)) return "video";
  return null;
}
