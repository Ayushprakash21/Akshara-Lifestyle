import type { Address, CartItem, User } from '../types/commerce';
import { isFirebaseConfigured } from './firebase/firebase';
import { COLLECTIONS, getDocument, setDocument, updateDocument } from './firebase/firestore';

/**
 * Customer Account, Address, Cart & Wishlist Service
 * Handles user profiles and persistent data in Firestore.
 */
export async function getCustomerProfile(userId: string): Promise<User | null> {
  if (isFirebaseConfigured()) {
    try {
      return await getDocument<User>(COLLECTIONS.USERS, userId);
    } catch (err) {
      console.warn('[customerService] Failed to load profile:', err);
    }
  }
  return null;
}

export async function updateCustomerProfile(
  userId: string,
  updates: Partial<User>,
): Promise<boolean> {
  if (isFirebaseConfigured()) {
    try {
      return await updateDocument(COLLECTIONS.USERS, userId, updates);
    } catch (err) {
      console.error('[customerService] Failed to update profile:', err);
      return false;
    }
  }
  return true;
}

export async function saveCustomerAddress(
  userId: string,
  address: Address,
  currentAddresses: Address[],
): Promise<Address[]> {
  const existingIdx = currentAddresses.findIndex((a) => a.id === address.id);
  let updated: Address[];

  if (existingIdx >= 0) {
    updated = currentAddresses.map((a) => (a.id === address.id ? address : a));
  } else {
    updated = [...currentAddresses, address];
  }

  if (address.isDefault) {
    updated = updated.map((a) => ({ ...a, isDefault: a.id === address.id }));
  }

  if (isFirebaseConfigured()) {
    try {
      await updateDocument(COLLECTIONS.USERS, userId, { addresses: updated });
    } catch (err) {
      console.error('[customerService] Failed to save address in Firestore:', err);
    }
  }

  return updated;
}

export async function deleteCustomerAddress(
  userId: string,
  addressId: string,
  currentAddresses: Address[],
): Promise<Address[]> {
  const updated = currentAddresses.filter((a) => a.id !== addressId);

  if (isFirebaseConfigured()) {
    try {
      await updateDocument(COLLECTIONS.USERS, userId, { addresses: updated });
    } catch (err) {
      console.error('[customerService] Failed to delete address in Firestore:', err);
    }
  }

  return updated;
}

export async function getCustomerWishlist(userId: string): Promise<string[] | null> {
  if (isFirebaseConfigured()) {
    try {
      const doc = await getDocument<{ items: string[] }>(COLLECTIONS.WISHLISTS, userId);
      if (doc && Array.isArray(doc.items)) return doc.items;
    } catch (err) {
      console.warn('[customerService] Failed to fetch wishlist:', err);
    }
  }
  return null;
}

export async function saveCustomerWishlist(userId: string, items: string[]): Promise<boolean> {
  if (isFirebaseConfigured()) {
    try {
      return await setDocument(COLLECTIONS.WISHLISTS, userId, { items });
    } catch (err) {
      console.error('[customerService] Failed to sync wishlist to Firestore:', err);
      return false;
    }
  }
  return true;
}

export async function getCustomerCart(userId: string): Promise<CartItem[] | null> {
  if (isFirebaseConfigured()) {
    try {
      const doc = await getDocument<{ items: CartItem[] }>(COLLECTIONS.CARTS, userId);
      if (doc && Array.isArray(doc.items)) return doc.items;
    } catch (err) {
      console.warn('[customerService] Failed to fetch cart:', err);
    }
  }
  return null;
}

export async function saveCustomerCart(userId: string, items: CartItem[]): Promise<boolean> {
  if (isFirebaseConfigured()) {
    try {
      return await setDocument(COLLECTIONS.CARTS, userId, { items });
    } catch (err) {
      console.error('[customerService] Failed to sync cart to Firestore:', err);
      return false;
    }
  }
  return true;
}
