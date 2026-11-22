import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type {
  Address,
  CartItem,
  Category,
  Coupon,
  DeliveryMethodId,
  HomepageConfig,
  Order,
  OrderStatus,
  PaymentGatewayConfig,
  PaymentMethodId,
  Product,
  PromoBanner,
  ReturnRequest,
  Review,
  ShippingConfig,
  ToastMessage,
  User,
  UserRole,
} from '../types/commerce';
import {
  SEED_BANNERS,
  SEED_CATEGORIES,
  SEED_COUPONS,
  SEED_HOMEPAGE_CONFIG,
  SEED_ORDERS,
  SEED_PAYMENT_CONFIG,
  SEED_PRODUCTS,
  SEED_RETURNS,
  SEED_REVIEWS,
  SEED_SHIPPING_CONFIG,
  SEED_USERS,
} from '../services/seedData';
import { readStorage, writeStorage } from '../services/storage';
import { calculateCartTotals, type CartTotals } from '../utils/commerceLogic';
import { paymentGatewayAdapter, shippingProviderAdapter } from '../services/integrations';

interface PlaceOrderPayload {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerGstin?: string;
  shippingAddress: Omit<Address, 'id' | 'isDefault'>;
  deliveryMethod: DeliveryMethodId;
  paymentMethod: PaymentMethodId;
  couponCode?: string;
}

interface CommerceContextValue {
  products: Product[];
  categories: Category[];
  reviews: Review[];
  coupons: Coupon[];
  banners: PromoBanner[];
  homepageConfig: HomepageConfig;
  shippingConfig: ShippingConfig;
  paymentConfig: PaymentGatewayConfig;
  users: User[];
  orders: Order[];
  returns: ReturnRequest[];
  currentUser: User | null;
  cart: CartItem[];
  wishlist: string[];
  recentlyViewed: string[];
  searchHistory: string[];
  appliedCouponCode: string;
  cartTotals: CartTotals;
  isCartDrawerOpen: boolean;
  isSearchOpen: boolean;
  toasts: ToastMessage[];
  newsletterSubscribers: string[];

  // UI controls
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  pushToast: (title: string, description?: string, tone?: ToastMessage['tone']) => void;
  dismissToast: (id: string) => void;

  // Cart & wishlist actions
  addToCart: (productId: string, variantId?: string, quantity?: number, openDrawer?: boolean) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { ok: boolean; message: string };
  removeCoupon: () => void;
  toggleWishlist: (productId: string) => void;
  recordRecentlyViewed: (productId: string) => void;
  addSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  subscribeNewsletter: (email: string) => boolean;

  // Auth & customer account actions
  login: (email: string, password: string) => { ok: boolean; error?: string; user?: User };
  register: (payload: { name: string; email: string; phone: string; password: string }) => {
    ok: boolean;
    error?: string;
  };
  logout: () => void;
  updateProfile: (updates: Partial<Pick<User, 'name' | 'phone' | 'gstin' | 'emailOptIn' | 'smsOptIn'>>) => void;
  saveAddress: (address: Omit<Address, 'id'>, existingId?: string) => void;
  deleteAddress: (addressId: string) => void;
  placeDemoOrder: (payload: PlaceOrderPayload) => Promise<Order>;
  submitReview: (payload: {
    productId: string;
    authorName: string;
    city: string;
    rating: number;
    title: string;
    comment: string;
  }) => void;
  createReturnRequest: (payload: {
    orderId: string;
    reason: string;
    resolution: 'refund' | 'exchange';
  }) => void;

  // Admin actions
  upsertProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  updateVariantStock: (productId: string, variantId: string, stock: number) => void;
  updateCategory: (category: Category) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  upsertCoupon: (coupon: Coupon) => void;
  toggleCouponActive: (couponId: string) => void;
  updateBanner: (banner: PromoBanner) => void;
  updateHomepageConfig: (config: HomepageConfig) => void;
  moderateReview: (reviewId: string, status: Review['status']) => void;
  updateReturnStatus: (returnId: string, status: ReturnRequest['status']) => void;
  updateShippingConfig: (config: ShippingConfig) => void;
  updatePaymentConfig: (config: PaymentGatewayConfig) => void;
  updateUserRole: (userId: string, role: UserRole) => void;
}

const CommerceContext = createContext<CommerceContextValue | null>(null);

export function CommerceProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() =>
    readStorage('products', SEED_PRODUCTS),
  );
  const [categories, setCategories] = useState<Category[]>(() =>
    readStorage('categories', SEED_CATEGORIES),
  );
  const [reviews, setReviews] = useState<Review[]>(() =>
    readStorage('reviews', SEED_REVIEWS),
  );
  const [coupons, setCoupons] = useState<Coupon[]>(() =>
    readStorage('coupons', SEED_COUPONS),
  );
  const [banners, setBanners] = useState<PromoBanner[]>(() =>
    readStorage('banners', SEED_BANNERS),
  );
  const [homepageConfig, setHomepageConfig] = useState<HomepageConfig>(() =>
    readStorage('homepageConfig', SEED_HOMEPAGE_CONFIG),
  );
  const [shippingConfig, setShippingConfig] = useState<ShippingConfig>(() =>
    readStorage('shippingConfig', SEED_SHIPPING_CONFIG),
  );
  const [paymentConfig, setPaymentConfig] = useState<PaymentGatewayConfig>(() =>
    readStorage('paymentConfig', SEED_PAYMENT_CONFIG),
  );
  const [users, setUsers] = useState<User[]>(() => readStorage('users', SEED_USERS));
  const [orders, setOrders] = useState<Order[]>(() => readStorage('orders', SEED_ORDERS));
  const [returns, setReturns] = useState<ReturnRequest[]>(() =>
    readStorage('returns', SEED_RETURNS),
  );
  const [currentUserId, setCurrentUserId] = useState<string | null>(() =>
    readStorage<string | null>('currentUserId', null),
  );
  const [cart, setCart] = useState<CartItem[]>(() => readStorage('cart', []));
  const [wishlist, setWishlist] = useState<string[]>(() => readStorage('wishlist', []));
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() =>
    readStorage('recentlyViewed', []),
  );
  const [searchHistory, setSearchHistory] = useState<string[]>(() =>
    readStorage('searchHistory', []),
  );
  const [appliedCouponCode, setAppliedCouponCode] = useState<string>(() =>
    readStorage('appliedCoupon', ''),
  );
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<string[]>(() =>
    readStorage('newsletterSubscribers', []),
  );

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Persist domain state
  useEffect(() => writeStorage('products', products), [products]);
  useEffect(() => writeStorage('categories', categories), [categories]);
  useEffect(() => writeStorage('reviews', reviews), [reviews]);
  useEffect(() => writeStorage('coupons', coupons), [coupons]);
  useEffect(() => writeStorage('banners', banners), [banners]);
  useEffect(() => writeStorage('homepageConfig', homepageConfig), [homepageConfig]);
  useEffect(() => writeStorage('shippingConfig', shippingConfig), [shippingConfig]);
  useEffect(() => writeStorage('paymentConfig', paymentConfig), [paymentConfig]);
  useEffect(() => writeStorage('users', users), [users]);
  useEffect(() => writeStorage('orders', orders), [orders]);
  useEffect(() => writeStorage('returns', returns), [returns]);
  useEffect(() => writeStorage('currentUserId', currentUserId), [currentUserId]);
  useEffect(() => writeStorage('cart', cart), [cart]);
  useEffect(() => writeStorage('wishlist', wishlist), [wishlist]);
  useEffect(() => writeStorage('recentlyViewed', recentlyViewed), [recentlyViewed]);
  useEffect(() => writeStorage('searchHistory', searchHistory), [searchHistory]);
  useEffect(() => writeStorage('appliedCoupon', appliedCouponCode), [appliedCouponCode]);
  useEffect(
    () => writeStorage('newsletterSubscribers', newsletterSubscribers),
    [newsletterSubscribers],
  );

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId) ?? null,
    [users, currentUserId],
  );

  const cartTotals = useMemo(
    () =>
      calculateCartTotals(cart, products, coupons, shippingConfig, {
        couponCode: appliedCouponCode || undefined,
      }),
    [cart, products, coupons, shippingConfig, appliedCouponCode],
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (title: string, description?: string, tone: ToastMessage['tone'] = 'default') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-2), { id, title, description, tone }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3600);
    },
    [],
  );

  const addToCart = useCallback(
    (productId: string, variantId?: string, quantity = 1, openDrawer = true) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return;
      const chosenVariant =
        product.variants.find((v) => v.id === variantId) ??
        product.variants.find((v) => v.stock > 0) ??
        product.variants[0];

      if (!chosenVariant || chosenVariant.stock <= 0) {
        pushToast('Out of stock', `${product.name} is currently unavailable.`, 'error');
        return;
      }

      const itemKey = `${product.id}::${chosenVariant.id}`;
      setCart((prev) => {
        const existing = prev.find((i) => i.id === itemKey);
        if (existing) {
          const nextQty = Math.min(chosenVariant.stock, existing.quantity + quantity);
          return prev.map((i) => (i.id === itemKey ? { ...i, quantity: nextQty } : i));
        }
        return [
          ...prev,
          {
            id: itemKey,
            productId: product.id,
            variantId: chosenVariant.id,
            quantity: Math.min(chosenVariant.stock, Math.max(1, quantity)),
          },
        ];
      });

      if (openDrawer) {
        setIsCartDrawerOpen(true);
      } else {
        pushToast('Added to bag', product.name, 'success');
      }
    },
    [products, pushToast],
  );

  const updateCartQuantity = useCallback(
    (cartItemId: string, quantity: number) => {
      if (quantity <= 0) {
        setCart((prev) => prev.filter((i) => i.id !== cartItemId));
        return;
      }
      setCart((prev) =>
        prev.map((item) => {
          if (item.id !== cartItemId) return item;
          const product = products.find((p) => p.id === item.productId);
          const variant = product?.variants.find((v) => v.id === item.variantId);
          const maxStock = variant?.stock ?? 10;
          return { ...item, quantity: Math.min(maxStock, quantity) };
        }),
      );
    },
    [products],
  );

  const removeFromCart = useCallback((cartItemId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== cartItemId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setAppliedCouponCode('');
  }, []);

  const applyCoupon = useCallback(
    (code: string): { ok: boolean; message: string } => {
      const normalized = code.trim().toUpperCase();
      if (!normalized) {
        return { ok: false, message: 'Enter a coupon code.' };
      }
      const preview = calculateCartTotals(cart, products, coupons, shippingConfig, {
        couponCode: normalized,
      });
      if (preview.couponError) {
        return { ok: false, message: preview.couponError };
      }
      setAppliedCouponCode(normalized);
      pushToast('Coupon applied', `${normalized} saved on your order.`, 'success');
      return { ok: true, message: `${normalized} applied successfully.` };
    },
    [cart, products, coupons, shippingConfig, pushToast],
  );

  const removeCoupon = useCallback(() => {
    setAppliedCouponCode('');
  }, []);

  const toggleWishlist = useCallback(
    (productId: string) => {
      const product = products.find((p) => p.id === productId);
      setWishlist((prev) => {
        const exists = prev.includes(productId);
        if (exists) {
          pushToast('Removed from wishlist', product?.name);
          return prev.filter((id) => id !== productId);
        }
        pushToast('Saved to wishlist', product?.name, 'success');
        return [productId, ...prev];
      });
    },
    [products, pushToast],
  );

  const recordRecentlyViewed = useCallback((productId: string) => {
    setRecentlyViewed((prev) => [productId, ...prev.filter((id) => id !== productId)].slice(0, 8));
  }, []);

  const addSearchHistory = useCallback((query: string) => {
    const clean = query.trim();
    if (!clean) return;
    setSearchHistory((prev) =>
      [clean, ...prev.filter((q) => q.toLowerCase() !== clean.toLowerCase())].slice(0, 6),
    );
  }, []);

  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  const subscribeNewsletter = useCallback(
    (email: string): boolean => {
      const normalized = email.trim().toLowerCase();
      if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
        return false;
      }
      setNewsletterSubscribers((prev) =>
        prev.includes(normalized) ? prev : [normalized, ...prev],
      );
      pushToast('Subscribed to AKSHARA Journal', 'You will receive seasonal releases and private previews.', 'success');
      return true;
    },
    [pushToast],
  );

  const login = useCallback(
    (email: string, password: string) => {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !password.trim()) {
        return { ok: false, error: 'Please enter both email and password.' };
      }
      const found = users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (!found) {
        return {
          ok: false,
          error: 'No account found for this email. Use Demo Customer or create an account.',
        };
      }
      if (password.trim().length < 6) {
        return { ok: false, error: 'Password must be at least 6 characters.' };
      }
      setCurrentUserId(found.id);
      pushToast(`Welcome back, ${found.name.split(' ')[0]}`, undefined, 'success');
      return { ok: true, user: found };
    },
    [users, pushToast],
  );

  const register = useCallback(
    (payload: { name: string; email: string; phone: string; password: string }) => {
      const cleanEmail = payload.email.trim().toLowerCase();
      if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
        return { ok: false, error: 'An account with this email already exists.' };
      }
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: payload.name.trim(),
        email: cleanEmail,
        phone: payload.phone.trim(),
        role: 'customer',
        joinedAt: new Date().toISOString(),
        addresses: [],
        emailOptIn: true,
        smsOptIn: true,
      };
      setUsers((prev) => [newUser, ...prev]);
      setCurrentUserId(newUser.id);
      pushToast('Account created', `Welcome to AKSHARA LIFESTYLE, ${newUser.name}.`, 'success');
      return { ok: true };
    },
    [users, pushToast],
  );

  const logout = useCallback(() => {
    setCurrentUserId(null);
    pushToast('Signed out', 'You have been signed out of your account.');
  }, [pushToast]);

  const updateProfile = useCallback(
    (updates: Partial<Pick<User, 'name' | 'phone' | 'gstin' | 'emailOptIn' | 'smsOptIn'>>) => {
      if (!currentUserId) return;
      setUsers((prev) =>
        prev.map((u) => (u.id === currentUserId ? { ...u, ...updates } : u)),
      );
      pushToast('Profile updated', 'Your account details have been saved.', 'success');
    },
    [currentUserId, pushToast],
  );

  const saveAddress = useCallback(
    (address: Omit<Address, 'id'>, existingId?: string) => {
      if (!currentUserId) return;
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== currentUserId) return u;
          let updated: Address[];
          if (existingId) {
            updated = u.addresses.map((a) =>
              a.id === existingId ? { ...address, id: existingId } : a,
            );
          } else {
            updated = [...u.addresses, { ...address, id: `addr-${Date.now()}` }];
          }
          if (address.isDefault) {
            const targetId = existingId ?? updated[updated.length - 1].id;
            updated = updated.map((a) => ({ ...a, isDefault: a.id === targetId }));
          }
          return { ...u, addresses: updated };
        }),
      );
      pushToast('Address saved', undefined, 'success');
    },
    [currentUserId, pushToast],
  );

  const deleteAddress = useCallback(
    (addressId: string) => {
      if (!currentUserId) return;
      setUsers((prev) =>
        prev.map((u) =>
          u.id === currentUserId
            ? { ...u, addresses: u.addresses.filter((a) => a.id !== addressId) }
            : u,
        ),
      );
      pushToast('Address removed');
    },
    [currentUserId, pushToast],
  );

  const placeDemoOrder = useCallback(
    async (payload: PlaceOrderPayload): Promise<Order> => {
      const totals = calculateCartTotals(cart, products, coupons, shippingConfig, {
        couponCode: payload.couponCode || appliedCouponCode || undefined,
        deliveryMethod: payload.deliveryMethod,
        paymentMethod: payload.paymentMethod,
      });

      const paymentIntent = await paymentGatewayAdapter.createCheckoutOrder({
        amountInr: totals.total,
        method: payload.paymentMethod,
        customerEmail: payload.customerEmail,
        customerPhone: payload.customerPhone,
      });

      const seq = 1003 + orders.length;
      const orderNumber = `AKS-2611-${seq}`;
      const invoiceNumber = `GST/26-27/${seq}`;
      const awb = shippingProviderAdapter.generateDemoAwb(orderNumber);
      const serviceability = await shippingProviderAdapter.checkServiceability(
        payload.shippingAddress.pincode,
        true,
      );

      const orderItems = cart
        .map((ci) => {
          const product = products.find((p) => p.id === ci.productId);
          if (!product) return null;
          const variant =
            product.variants.find((v) => v.id === ci.variantId) ?? product.variants[0];
          return {
            productId: product.id,
            productSlug: product.slug,
            name: product.name,
            brandName: product.brandName,
            image: product.images[0],
            sku: variant?.sku ?? product.sku,
            colorName: variant?.colorName ?? 'Standard',
            size: variant?.size,
            quantity: ci.quantity,
            unitPrice: product.price + (variant?.priceDelta ?? 0),
            mrp: product.originalPrice,
            gstRate: product.gstRate,
            hsnCode: product.hsnCode,
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null);

      const nowIso = new Date().toISOString();
      const nowDisplay = new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date());

      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        orderNumber,
        invoiceNumber,
        userId: currentUserId ?? 'guest',
        customerName: payload.customerName,
        customerEmail: payload.customerEmail,
        customerPhone: payload.customerPhone,
        customerGstin: payload.customerGstin?.trim() || undefined,
        shippingAddress: payload.shippingAddress,
        deliveryMethod: payload.deliveryMethod,
        items: orderItems,
        subtotal: totals.subtotal,
        mrpTotal: totals.mrpTotal,
        couponCode: (payload.couponCode || appliedCouponCode || '').toUpperCase() || undefined,
        couponDiscount: totals.couponDiscount,
        shippingFee: totals.shippingFee,
        codFee: totals.codFee,
        taxableValue: totals.taxableValue,
        gstAmount: totals.gstAmount,
        total: totals.total,
        status: 'confirmed',
        payment: {
          id: `pay-${Date.now()}`,
          method: payload.paymentMethod,
          provider: paymentIntent.provider,
          mode: 'DEMO',
          status: paymentIntent.status,
          amount: totals.total,
          referenceId: paymentIntent.referenceId,
          paidAt: nowIso,
        },
        shipment: {
          carrier: awb.carrier,
          awbNumber: awb.awbNumber,
          estimatedDelivery: serviceability.estimatedDateText ?? '3–5 Business Days',
          events: [
            {
              status: 'Order Confirmed (Demo)',
              location: 'AKSHARA Mumbai Dispatch Hub',
              timestamp: nowDisplay,
              note: paymentIntent.notice,
            },
          ],
        },
        createdAt: nowIso,
        isDemoOrder: true,
      };

      // Decrement inventory cleanly
      setProducts((prev) =>
        prev.map((prod) => {
          const matchingItems = cart.filter((ci) => ci.productId === prod.id);
          if (matchingItems.length === 0) return prod;
          return {
            ...prod,
            variants: prod.variants.map((v) => {
              const matched = matchingItems.find((ci) => ci.variantId === v.id);
              if (!matched) return v;
              return { ...v, stock: Math.max(0, v.stock - matched.quantity) };
            }),
          };
        }),
      );

      // Increment coupon usage count if applied
      if (newOrder.couponCode) {
        setCoupons((prev) =>
          prev.map((c) =>
            c.code.toUpperCase() === newOrder.couponCode
              ? { ...c, usageCount: c.usageCount + 1 }
              : c,
          ),
        );
      }

      setOrders((prev) => [newOrder, ...prev]);
      setCart([]);
      setAppliedCouponCode('');
      pushToast('Demo order placed', `Order ${newOrder.orderNumber} recorded locally.`, 'success');
      return newOrder;
    },
    [cart, products, coupons, shippingConfig, appliedCouponCode, orders.length, currentUserId, pushToast],
  );

  const submitReview = useCallback(
    (payload: {
      productId: string;
      authorName: string;
      city: string;
      rating: number;
      title: string;
      comment: string;
    }) => {
      const review: Review = {
        id: `rev-${Date.now()}`,
        productId: payload.productId,
        userId: currentUserId ?? 'guest',
        authorName: payload.authorName.trim(),
        city: payload.city.trim() || 'India',
        rating: payload.rating,
        title: payload.title.trim(),
        comment: payload.comment.trim(),
        verifiedPurchase: Boolean(
          currentUserId &&
            orders.some(
              (o) =>
                o.userId === currentUserId &&
                o.items.some((i) => i.productId === payload.productId),
            ),
        ),
        status: 'approved',
        createdAt: new Date().toISOString(),
      };
      setReviews((prev) => [review, ...prev]);
      pushToast('Review published', 'Thank you for sharing your perspective.', 'success');
    },
    [currentUserId, orders, pushToast],
  );

  const createReturnRequest = useCallback(
    (payload: { orderId: string; reason: string; resolution: 'refund' | 'exchange' }) => {
      const order = orders.find((o) => o.id === payload.orderId);
      if (!order) return;
      const req: ReturnRequest = {
        id: `ret-${Date.now()}`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId: order.userId,
        customerName: order.customerName,
        reason: payload.reason,
        resolution: payload.resolution,
        refundAmount: order.total,
        status: 'requested',
        createdAt: new Date().toISOString(),
      };
      setReturns((prev) => [req, ...prev]);
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: 'return_requested' } : o)),
      );
      pushToast('Return request submitted', `Reference created for ${order.orderNumber}.`, 'success');
    },
    [orders, pushToast],
  );

  // Admin mutation handlers
  const upsertProduct = useCallback(
    (product: Product) => {
      setProducts((prev) => {
        const exists = prev.some((p) => p.id === product.id);
        return exists ? prev.map((p) => (p.id === product.id ? product : p)) : [product, ...prev];
      });
      pushToast('Catalog updated', product.name, 'success');
    },
    [pushToast],
  );

  const deleteProduct = useCallback(
    (productId: string) => {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      pushToast('Product removed from catalog');
    },
    [pushToast],
  );

  const updateVariantStock = useCallback((productId: string, variantId: string, stock: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              variants: p.variants.map((v) =>
                v.id === variantId ? { ...v, stock: Math.max(0, stock) } : v,
              ),
            }
          : p,
      ),
    );
  }, []);

  const updateCategory = useCallback(
    (category: Category) => {
      setCategories((prev) => prev.map((c) => (c.id === category.id ? category : c)));
      pushToast('Category updated', category.name, 'success');
    },
    [pushToast],
  );

  const updateOrderStatus = useCallback(
    (orderId: string, status: OrderStatus) => {
      const nowDisplay = new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date());

      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId) return o;
          return {
            ...o,
            status,
            shipment: {
              ...o.shipment,
              events: [
                ...o.shipment.events,
                {
                  status: status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
                  location: 'AKSHARA Operations Console',
                  timestamp: nowDisplay,
                  note: 'Order status updated by operations.',
                },
              ],
            },
          };
        }),
      );
      pushToast('Order status updated', undefined, 'success');
    },
    [pushToast],
  );

  const upsertCoupon = useCallback(
    (coupon: Coupon) => {
      setCoupons((prev) => {
        const exists = prev.some((c) => c.id === coupon.id);
        return exists ? prev.map((c) => (c.id === coupon.id ? coupon : c)) : [coupon, ...prev];
      });
      pushToast('Coupon saved', coupon.code, 'success');
    },
    [pushToast],
  );

  const toggleCouponActive = useCallback((couponId: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === couponId ? { ...c, active: !c.active } : c)),
    );
  }, []);

  const updateBanner = useCallback(
    (banner: PromoBanner) => {
      setBanners((prev) => prev.map((b) => (b.id === banner.id ? banner : b)));
      pushToast('Banner updated', undefined, 'success');
    },
    [pushToast],
  );

  const updateHomepageConfig = useCallback(
    (config: HomepageConfig) => {
      setHomepageConfig(config);
      pushToast('Homepage content saved', 'Changes are live on the storefront.', 'success');
    },
    [pushToast],
  );

  const moderateReview = useCallback(
    (reviewId: string, status: Review['status']) => {
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, status } : r)));
      pushToast('Review updated', `Status set to ${status}.`, 'success');
    },
    [pushToast],
  );

  const updateReturnStatus = useCallback(
    (returnId: string, status: ReturnRequest['status']) => {
      setReturns((prev) => prev.map((r) => (r.id === returnId ? { ...r, status } : r)));
      pushToast('Return workflow updated', `Status: ${status.replace('_', ' ')}`, 'success');
    },
    [pushToast],
  );

  const updateShippingConfig = useCallback(
    (config: ShippingConfig) => {
      setShippingConfig(config);
      pushToast('Shipping rules updated', undefined, 'success');
    },
    [pushToast],
  );

  const updatePaymentConfig = useCallback(
    (config: PaymentGatewayConfig) => {
      setPaymentConfig(config);
      pushToast('Payment settings updated', undefined, 'success');
    },
    [pushToast],
  );

  const updateUserRole = useCallback(
    (userId: string, role: UserRole) => {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
      pushToast('Role permissions updated', undefined, 'success');
    },
    [pushToast],
  );

  const value: CommerceContextValue = {
    products,
    categories,
    reviews,
    coupons,
    banners,
    homepageConfig,
    shippingConfig,
    paymentConfig,
    users,
    orders,
    returns,
    currentUser,
    cart,
    wishlist,
    recentlyViewed,
    searchHistory,
    appliedCouponCode,
    cartTotals,
    isCartDrawerOpen,
    isSearchOpen,
    toasts,
    newsletterSubscribers,
    openCartDrawer: () => setIsCartDrawerOpen(true),
    closeCartDrawer: () => setIsCartDrawerOpen(false),
    openSearch: () => setIsSearchOpen(true),
    closeSearch: () => setIsSearchOpen(false),
    pushToast,
    dismissToast,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    toggleWishlist,
    recordRecentlyViewed,
    addSearchHistory,
    clearSearchHistory,
    subscribeNewsletter,
    login,
    register,
    logout,
    updateProfile,
    saveAddress,
    deleteAddress,
    placeDemoOrder,
    submitReview,
    createReturnRequest,
    upsertProduct,
    deleteProduct,
    updateVariantStock,
    updateCategory,
    updateOrderStatus,
    upsertCoupon,
    toggleCouponActive,
    updateBanner,
    updateHomepageConfig,
    moderateReview,
    updateReturnStatus,
    updateShippingConfig,
    updatePaymentConfig,
    updateUserRole,
  };

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
}

export function useCommerce(): CommerceContextValue {
  const ctx = useContext(CommerceContext);
  if (!ctx) {
    throw new Error('useCommerce must be used inside CommerceProvider');
  }
  return ctx;
}
