import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  type DocumentData,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';

export const COLLECTIONS = {
  USERS: 'users',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  ORDERS: 'orders',
  INVENTORY: 'inventory',
  WISHLISTS: 'wishlists',
  CARTS: 'carts',
  ADDRESSES: 'addresses',
  COUPONS: 'coupons',
  REVIEWS: 'reviews',
  ADMINS: 'admins',
  SETTINGS: 'settings',
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

/**
 * Returns a typed collection reference if Firestore is initialized.
 */
export function getCollectionRef(name: CollectionName) {
  if (!db) return null;
  return collection(db, name);
}

/**
 * Returns a typed document reference if Firestore is initialized.
 */
export function getDocRef(name: CollectionName, id: string) {
  if (!db) return null;
  return doc(db, name, id);
}

/**
 * Generic fetch document by ID.
 */
export async function getDocument<T>(collectionName: CollectionName, id: string): Promise<T | null> {
  if (!db) return null;
  try {
    const docRef = doc(db, collectionName, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as T;
  } catch (error) {
    console.error(`[Firestore] Error fetching ${collectionName}/${id}:`, error);
    return null;
  }
}

/**
 * Generic set document with merge option.
 */
export async function setDocument<T extends DocumentData>(
  collectionName: CollectionName,
  id: string,
  data: T,
  merge = true,
): Promise<boolean> {
  if (!db) return false;
  try {
    const docRef = doc(db, collectionName, id);
    await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge });
    return true;
  } catch (error) {
    console.error(`[Firestore] Error setting ${collectionName}/${id}:`, error);
    return false;
  }
}

/**
 * Generic update document.
 */
export async function updateDocument<T extends DocumentData>(
  collectionName: CollectionName,
  id: string,
  data: Partial<T>,
): Promise<boolean> {
  if (!db) return false;
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() } as DocumentData);
    return true;
  } catch (error) {
    console.error(`[Firestore] Error updating ${collectionName}/${id}:`, error);
    return false;
  }
}

/**
 * Generic delete document.
 */
export async function deleteDocument(collectionName: CollectionName, id: string): Promise<boolean> {
  if (!db) return false;
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error(`[Firestore] Error deleting ${collectionName}/${id}:`, error);
    return false;
  }
}

/**
 * Query documents in a collection.
 */
export async function queryDocuments<T>(
  collectionName: CollectionName,
  ...constraints: QueryConstraint[]
): Promise<T[]> {
  if (!db) return [];
  try {
    const colRef = collection(db, collectionName);
    const q = query(colRef, ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as T);
  } catch (error) {
    console.error(`[Firestore] Error querying ${collectionName}:`, error);
    return [];
  }
}

export {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
};
