import type { Order, OrderStatus, ReturnRequest } from '../types/commerce';
import { isFirebaseConfigured } from './firebase/firebase';
import {
  COLLECTIONS,
  getDocument,
  queryDocuments,
  setDocument,
  updateDocument,
  where,
  orderBy,
} from './firebase/firestore';

/**
 * Order & Returns Management Service
 * Manages orders and returns in Firestore collection 'orders' and 'returns'.
 */
export async function saveOrder(order: Order): Promise<boolean> {
  if (isFirebaseConfigured()) {
    try {
      return await setDocument(COLLECTIONS.ORDERS, order.id, order);
    } catch (err) {
      console.error('[orderService] Failed to persist order in Firestore:', err);
      return false;
    }
  }
  return true;
}

export async function getOrder(orderId: string): Promise<Order | null> {
  if (isFirebaseConfigured()) {
    try {
      return await getDocument<Order>(COLLECTIONS.ORDERS, orderId);
    } catch (err) {
      console.warn('[orderService] Failed to fetch order:', err);
    }
  }
  return null;
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  if (isFirebaseConfigured()) {
    try {
      return await queryDocuments<Order>(
        COLLECTIONS.ORDERS,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
      );
    } catch (err) {
      console.warn('[orderService] Failed to query user orders:', err);
    }
  }
  return [];
}

export async function getAllOrders(): Promise<Order[]> {
  if (isFirebaseConfigured()) {
    try {
      return await queryDocuments<Order>(
        COLLECTIONS.ORDERS,
        orderBy('createdAt', 'desc'),
      );
    } catch (err) {
      console.warn('[orderService] Failed to query all orders:', err);
    }
  }
  return [];
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  if (isFirebaseConfigured()) {
    try {
      return await updateDocument(COLLECTIONS.ORDERS, orderId, { status });
    } catch (err) {
      console.error('[orderService] Failed to update order status:', err);
      return false;
    }
  }
  return true;
}

export async function saveReturnRequest(returnReq: ReturnRequest): Promise<boolean> {
  if (isFirebaseConfigured()) {
    try {
      return await setDocument(COLLECTIONS.ORDERS, returnReq.id, returnReq);
    } catch (err) {
      console.error('[orderService] Failed to save return request:', err);
      return false;
    }
  }
  return true;
}
