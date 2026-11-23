import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  type UploadMetadata,
} from 'firebase/storage';
import { storage } from './firebase';

export interface StorageUploadResult {
  ok: boolean;
  downloadUrl?: string;
  storagePath?: string;
  error?: string;
}

/**
 * Uploads a file (Blob or File) to Firebase Storage under the given path.
 * e.g., 'products/prod-123/main.jpg' or 'returns/ret-456/evidence.jpg'
 */
export async function uploadStorageFile(
  path: string,
  file: Blob | Uint8Array | ArrayBuffer,
  metadata?: UploadMetadata,
): Promise<StorageUploadResult> {
  if (!storage) {
    return {
      ok: false,
      error: 'Firebase Storage is not configured. Please supply VITE_FIREBASE_STORAGE_BUCKET in your environment.',
    };
  }

  try {
    const fileRef = ref(storage, path);
    const snapshot = await uploadBytes(fileRef, file, metadata);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return {
      ok: true,
      downloadUrl,
      storagePath: path,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Storage upload failed.';
    console.error(`[Firebase Storage] Upload error at ${path}:`, error);
    return { ok: false, error: message };
  }
}

/**
 * Retrieves the public download URL of an existing file in Storage.
 */
export async function getStorageFileUrl(path: string): Promise<string | null> {
  if (!storage) return null;
  try {
    const fileRef = ref(storage, path);
    return await getDownloadURL(fileRef);
  } catch (error) {
    console.warn(`[Firebase Storage] Could not retrieve URL for ${path}:`, error);
    return null;
  }
}

/**
 * Deletes a file from Firebase Storage.
 */
export async function deleteStorageFile(path: string): Promise<boolean> {
  if (!storage) return false;
  try {
    const fileRef = ref(storage, path);
    await deleteObject(fileRef);
    return true;
  } catch (error) {
    console.warn(`[Firebase Storage] Failed to delete file at ${path}:`, error);
    return false;
  }
}
