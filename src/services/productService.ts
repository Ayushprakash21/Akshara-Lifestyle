import type { Category, Product } from '../types/commerce';
import { SEED_CATEGORIES, SEED_PRODUCTS } from './seedData';
import { isFirebaseConfigured } from './firebase/firebase';
import {
  COLLECTIONS,
  getDocument,
  queryDocuments,
  setDocument,
  deleteDocument,
  where,
} from './firebase/firestore';

/**
 * Product Management Service
 * Supports Firestore collection 'products' with fallback to curated luxury catalog seeds.
 */
export async function getProducts(): Promise<Product[]> {
  if (isFirebaseConfigured()) {
    try {
      const items = await queryDocuments<Product>(COLLECTIONS.PRODUCTS);
      if (items && items.length > 0) {
        return items;
      }
    } catch (err) {
      console.warn('[productService] Firestore query error, falling back to seed catalog:', err);
    }
  }
  return SEED_PRODUCTS;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (isFirebaseConfigured()) {
    try {
      const matches = await queryDocuments<Product>(
        COLLECTIONS.PRODUCTS,
        where('slug', '==', slug),
      );
      if (matches.length > 0) return matches[0];
    } catch (err) {
      console.warn('[productService] Slug lookup error:', err);
    }
  }
  return SEED_PRODUCTS.find((p) => p.slug === slug) ?? null;
}

export async function getProductById(id: string): Promise<Product | null> {
  if (isFirebaseConfigured()) {
    try {
      const doc = await getDocument<Product>(COLLECTIONS.PRODUCTS, id);
      if (doc) return doc;
    } catch (err) {
      console.warn('[productService] ID lookup error:', err);
    }
  }
  return SEED_PRODUCTS.find((p) => p.id === id) ?? null;
}

export async function saveProduct(product: Product): Promise<boolean> {
  if (isFirebaseConfigured()) {
    return await setDocument(COLLECTIONS.PRODUCTS, product.id, product);
  }
  return true;
}

export async function removeProduct(id: string): Promise<boolean> {
  if (isFirebaseConfigured()) {
    return await deleteDocument(COLLECTIONS.PRODUCTS, id);
  }
  return true;
}

export async function getCategories(): Promise<Category[]> {
  if (isFirebaseConfigured()) {
    try {
      const list = await queryDocuments<Category>(COLLECTIONS.CATEGORIES);
      if (list && list.length > 0) return list;
    } catch (err) {
      console.warn('[productService] Categories query error:', err);
    }
  }
  return SEED_CATEGORIES;
}

export async function saveCategory(category: Category): Promise<boolean> {
  if (isFirebaseConfigured()) {
    return await setDocument(COLLECTIONS.CATEGORIES, category.id, category);
  }
  return true;
}
