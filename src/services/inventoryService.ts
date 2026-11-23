import { isFirebaseConfigured } from './firebase/firebase';
import { COLLECTIONS, getDocument, setDocument, updateDocument } from './firebase/firestore';
import type { Product } from '../types/commerce';

export interface InventoryRecord {
  productId: string;
  sku: string;
  totalStock: number;
  variantStocks: Record<string, number>;
  lowStockThreshold: number;
  updatedAt: string;
}

/**
 * Inventory Management Service
 * Tracks and updates stock levels for products and variants in Firestore.
 */
export async function getInventoryRecord(productId: string): Promise<InventoryRecord | null> {
  if (isFirebaseConfigured()) {
    try {
      const record = await getDocument<InventoryRecord>(COLLECTIONS.INVENTORY, productId);
      if (record) return record;
    } catch (err) {
      console.warn('[inventoryService] Record lookup error:', err);
    }
  }
  return null;
}

export async function updateVariantStock(
  productId: string,
  variantId: string,
  newStock: number,
  product?: Product,
): Promise<boolean> {
  const cleanStock = Math.max(0, Math.floor(newStock));

  if (isFirebaseConfigured()) {
    try {
      // 1. Update Inventory tracking collection
      const existing = await getInventoryRecord(productId);
      const variantStocks = existing?.variantStocks ? { ...existing.variantStocks } : {};
      variantStocks[variantId] = cleanStock;

      const totalStock = Object.values(variantStocks).reduce((acc, s) => acc + s, 0);

      await setDocument(
        COLLECTIONS.INVENTORY,
        productId,
        {
          productId,
          variantStocks,
          totalStock,
          updatedAt: new Date().toISOString(),
        },
        true,
      );

      // 2. Update embedded Product variants for quick querying
      if (product) {
        const updatedVariants = product.variants.map((v) =>
          v.id === variantId ? { ...v, stock: cleanStock } : v,
        );
        await updateDocument(COLLECTIONS.PRODUCTS, productId, { variants: updatedVariants });
      }

      return true;
    } catch (err) {
      console.error('[inventoryService] Failed to update variant stock in Firestore:', err);
      return false;
    }
  }

  return true;
}

export async function decrementOrderInventory(
  items: Array<{ productId: string; variantId: string; quantity: number }>,
  currentProducts: Product[],
): Promise<Product[]> {
  const updatedProducts = currentProducts.map((prod) => {
    const matching = items.filter((item) => item.productId === prod.id);
    if (matching.length === 0) return prod;

    const newVariants = prod.variants.map((v) => {
      const item = matching.find((m) => m.variantId === v.id);
      if (!item) return v;
      return { ...v, stock: Math.max(0, v.stock - item.quantity) };
    });

    return { ...prod, variants: newVariants };
  });

  if (isFirebaseConfigured()) {
    for (const item of items) {
      const prod = updatedProducts.find((p) => p.id === item.productId);
      const variant = prod?.variants.find((v) => v.id === item.variantId);
      if (prod && variant) {
        await updateVariantStock(prod.id, variant.id, variant.stock, prod);
      }
    }
  }

  return updatedProducts;
}
