import type {
  CartItem,
  Coupon,
  DeliveryMethodId,
  FilterState,
  Order,
  PaymentMethodId,
  PincodeServiceability,
  Product,
  Review,
  ShippingConfig,
} from '../types/commerce';

/**
 * Formats an amount in Indian Rupees using standard Indian numbering (Lakhs/Crores).
 */
export function formatINR(amount: number): string {
  const safe = Number.isFinite(amount) ? Math.round(amount) : 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(safe);
}

/**
 * Computes integer discount percentage from MRP and selling price.
 */
export function getDiscountPercent(price: number, originalPrice: number): number {
  if (!originalPrice || originalPrice <= price || price < 0) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

/**
 * Returns total available inventory across all variants of a product.
 */
export function getProductTotalStock(product: Product): number {
  return product.variants.reduce((sum, v) => sum + Math.max(0, v.stock), 0);
}

/**
 * Computes product rating strictly from approved reviews (never invented).
 */
export function getProductRatingStats(
  productId: string,
  reviews: Review[],
): { average: number; count: number } {
  const approved = reviews.filter(
    (r) => r.productId === productId && r.status === 'approved',
  );
  if (approved.length === 0) {
    return { average: 0, count: 0 };
  }
  const sum = approved.reduce((acc, r) => acc + r.rating, 0);
  return {
    average: Math.round((sum / approved.length) * 10) / 10,
    count: approved.length,
  };
}

/**
 * Validates a 10-digit Indian mobile number (starts with 6-9).
 */
export function isValidIndianPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-+]/g, '').replace(/^91(?=\d{10}$)/, '');
  return /^[6-9]\d{9}$/.test(cleaned);
}

/**
 * Validates a 6-digit Indian postal PIN code (cannot start with 0).
 */
export function isValidIndianPincode(pincode: string): boolean {
  return /^[1-9]\d{5}$/.test(pincode.trim());
}

/**
 * Validates optional 15-character Indian GSTIN format.
 */
export function isValidGSTIN(gstin: string): boolean {
  if (!gstin.trim()) return true;
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
    gstin.trim().toUpperCase(),
  );
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

const PINCODE_REGION_MAP: Record<
  string,
  { city: string; state: string; zone: 'Metro' | 'Tier 1' | 'Regional' | 'Remote' }
> = {
  '11': { city: 'New Delhi', state: 'Delhi', zone: 'Metro' },
  '12': { city: 'Gurugram', state: 'Haryana', zone: 'Metro' },
  '20': { city: 'Noida', state: 'Uttar Pradesh', zone: 'Metro' },
  '30': { city: 'Jaipur', state: 'Rajasthan', zone: 'Tier 1' },
  '38': { city: 'Ahmedabad', state: 'Gujarat', zone: 'Tier 1' },
  '40': { city: 'Mumbai', state: 'Maharashtra', zone: 'Metro' },
  '41': { city: 'Pune', state: 'Maharashtra', zone: 'Tier 1' },
  '50': { city: 'Hyderabad', state: 'Telangana', zone: 'Metro' },
  '56': { city: 'Bengaluru', state: 'Karnataka', zone: 'Metro' },
  '60': { city: 'Chennai', state: 'Tamil Nadu', zone: 'Metro' },
  '68': { city: 'Kochi', state: 'Kerala', zone: 'Tier 1' },
  '70': { city: 'Kolkata', state: 'West Bengal', zone: 'Metro' },
  '75': { city: 'Bhubaneswar', state: 'Odisha', zone: 'Regional' },
  '78': { city: 'Guwahati', state: 'Assam', zone: 'Regional' },
};

/**
 * Evaluates Indian pincode delivery serviceability, ETA, and COD eligibility.
 */
export function checkPincodeServiceability(
  rawPincode: string,
  productCodEligible = true,
  referenceDate: Date = new Date(),
): PincodeServiceability {
  const pincode = rawPincode.trim();
  if (!isValidIndianPincode(pincode)) {
    return {
      pincode,
      valid: false,
      serviceable: false,
      message: 'Please enter a valid 6-digit Indian PIN code.',
    };
  }

  const prefix2 = pincode.slice(0, 2);
  const firstDigit = pincode[0];
  const matched = PINCODE_REGION_MAP[prefix2];

  const fallbackRegions: Record<
    string,
    { city: string; state: string; zone: 'Tier 1' | 'Regional' | 'Remote' }
  > = {
    '1': { city: 'North India Hub', state: 'NCR / Punjab', zone: 'Tier 1' },
    '2': { city: 'Lucknow', state: 'Uttar Pradesh', zone: 'Tier 1' },
    '3': { city: 'Western Corridor', state: 'Rajasthan / Gujarat', zone: 'Tier 1' },
    '4': { city: 'Nagpur / Indore', state: 'Maharashtra / MP', zone: 'Tier 1' },
    '5': { city: 'Deccan Hub', state: 'Telangana / Karnataka', zone: 'Tier 1' },
    '6': { city: 'Southern Corridor', state: 'Tamil Nadu / Kerala', zone: 'Regional' },
    '7': { city: 'Eastern Hub', state: 'West Bengal / Odisha', zone: 'Regional' },
    '8': { city: 'Patna / Ranchi', state: 'Bihar / Jharkhand', zone: 'Regional' },
    '9': { city: 'Army / Special Zone', state: 'India', zone: 'Remote' },
  };

  const region = matched ?? fallbackRegions[firstDigit] ?? {
    city: 'India',
    state: 'India',
    zone: 'Regional' as const,
  };

  const standardDays: [number, number] =
    region.zone === 'Metro'
      ? [2, 3]
      : region.zone === 'Tier 1'
        ? [3, 5]
        : region.zone === 'Regional'
          ? [4, 6]
          : [6, 9];

  const expressDays: [number, number] =
    region.zone === 'Metro' ? [1, 2] : region.zone === 'Tier 1' ? [2, 3] : [3, 5];

  const minDate = new Date(referenceDate);
  minDate.setDate(minDate.getDate() + standardDays[0]);
  const maxDate = new Date(referenceDate);
  maxDate.setDate(maxDate.getDate() + standardDays[1]);

  const fmt = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const codAvailable = productCodEligible && region.zone !== 'Remote';

  return {
    pincode,
    valid: true,
    serviceable: true,
    city: region.city,
    state: region.state,
    zone: region.zone,
    standardDays,
    expressDays,
    estimatedDateText: `${fmt.format(minDate)} – ${fmt.format(maxDate)}`,
    codAvailable,
    message: `Delivery available to ${region.city}, ${region.state} (${pincode}).`,
  };
}

export interface CartTotals {
  itemCount: number;
  mrpTotal: number;
  subtotal: number;
  productSavings: number;
  couponDiscount: number;
  shippingFee: number;
  codFee: number;
  taxableValue: number;
  gstAmount: number;
  total: number;
  freeShippingRemaining: number;
  couponError?: string;
}

/**
 * Validates a coupon code against current subtotal and computes discount.
 */
export function evaluateCoupon(
  code: string | undefined,
  subtotal: number,
  coupons: Coupon[],
): { coupon?: Coupon; discount: number; error?: string } {
  if (!code || !code.trim()) {
    return { discount: 0 };
  }
  const normalized = code.trim().toUpperCase();
  const coupon = coupons.find((c) => c.code.toUpperCase() === normalized);
  if (!coupon) {
    return { discount: 0, error: `Coupon "${normalized}" is not recognized.` };
  }
  if (!coupon.active) {
    return { discount: 0, error: `Coupon "${normalized}" is currently inactive.` };
  }
  if (subtotal < coupon.minOrderValue) {
    return {
      discount: 0,
      error: `Minimum order of ${formatINR(coupon.minOrderValue)} required for ${coupon.code}.`,
    };
  }

  let discount =
    coupon.type === 'percentage'
      ? Math.round((subtotal * coupon.value) / 100)
      : coupon.value;

  if (coupon.maxDiscount && discount > coupon.maxDiscount) {
    discount = coupon.maxDiscount;
  }
  discount = Math.min(discount, subtotal);
  return { coupon, discount };
}

/**
 * Calculates full India-first cart pricing including MRP savings, coupons,
 * GST extraction (prices are GST-inclusive per Indian MRP norms), shipping, and COD fee.
 */
export function calculateCartTotals(
  cart: CartItem[],
  products: Product[],
  coupons: Coupon[],
  shippingConfig: ShippingConfig,
  options?: {
    couponCode?: string;
    deliveryMethod?: DeliveryMethodId;
    paymentMethod?: PaymentMethodId;
  },
): CartTotals {
  let itemCount = 0;
  let mrpTotal = 0;
  let subtotal = 0;
  let weightedGstNumerator = 0;

  for (const item of cart) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) continue;
    const variant = product.variants.find((v) => v.id === item.variantId) ?? product.variants[0];
    const unitPrice = product.price + (variant?.priceDelta ?? 0);
    const unitMrp = Math.max(product.originalPrice, unitPrice);
    const lineTotal = unitPrice * item.quantity;

    itemCount += item.quantity;
    mrpTotal += unitMrp * item.quantity;
    subtotal += lineTotal;
    // Extract GST included in Indian MRP/selling price: GST = price - (price / (1 + rate/100))
    const lineGst = lineTotal - lineTotal / (1 + product.gstRate / 100);
    weightedGstNumerator += lineGst;
  }

  const productSavings = Math.max(0, mrpTotal - subtotal);
  const { discount: couponDiscount, error: couponError } = evaluateCoupon(
    options?.couponCode,
    subtotal,
    coupons,
  );

  const discountedSubtotal = Math.max(0, subtotal - couponDiscount);
  const freeShippingRemaining = Math.max(
    0,
    shippingConfig.freeShippingThreshold - discountedSubtotal,
  );

  const deliveryMethod = options?.deliveryMethod ?? 'standard';
  let shippingFee = 0;
  if (itemCount > 0) {
    if (deliveryMethod === 'standard') {
      shippingFee =
        discountedSubtotal >= shippingConfig.freeShippingThreshold
          ? 0
          : shippingConfig.standardFee;
    } else if (deliveryMethod === 'express') {
      shippingFee = shippingConfig.expressFee;
    } else if (deliveryMethod === 'priority') {
      shippingFee = shippingConfig.priorityFee;
    }
  }

  const codFee =
    itemCount > 0 && options?.paymentMethod === 'cod' ? shippingConfig.codFee : 0;

  // Proportionally scale GST after coupon discount
  const discountRatio = subtotal > 0 ? discountedSubtotal / subtotal : 0;
  const gstAmount = Math.round(weightedGstNumerator * discountRatio);
  const taxableValue = Math.max(0, discountedSubtotal - gstAmount);
  const total = discountedSubtotal + shippingFee + codFee;

  return {
    itemCount,
    mrpTotal,
    subtotal,
    productSavings,
    couponDiscount,
    shippingFee,
    codFee,
    taxableValue,
    gstAmount,
    total,
    freeShippingRemaining,
    couponError,
  };
}

/**
 * Computes Levenshtein edit distance for typo-tolerant search matching.
 */
export function levenshteinDistance(a: string, b: string): number {
  const s = a.toLowerCase();
  const t = b.toLowerCase();
  if (s === t) return 0;
  if (s.length === 0) return t.length;
  if (t.length === 0) return s.length;

  const prev = Array.from({ length: t.length + 1 }, (_, i) => i);
  const curr = new Array<number>(t.length + 1);

  for (let i = 1; i <= s.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= t.length; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= t.length; j++) {
      prev[j] = curr[j];
    }
  }
  return prev[t.length];
}

/**
 * Typo-tolerant product relevance scorer. Returns 0 for non-matches, higher is better.
 */
export function scoreProductMatch(product: Product, rawQuery: string): number {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return 1;

  const tokens = query.split(/\s+/).filter(Boolean);
  const haystack = [
    product.name,
    product.brandName,
    product.categorySlug.replace('-', ' '),
    product.subcategory,
    product.shortDescription,
    ...product.variants.map((v) => v.colorName),
  ]
    .join(' ')
    .toLowerCase();

  const words = haystack.split(/[^a-z0-9]+/).filter(Boolean);
  let totalScore = 0;

  for (const token of tokens) {
    if (product.name.toLowerCase().includes(token)) {
      totalScore += 10;
      continue;
    }
    if (haystack.includes(token)) {
      totalScore += 6;
      continue;
    }
    // Typo tolerance for words of length >= 4
    if (token.length >= 4) {
      const maxDist = token.length >= 7 ? 2 : 1;
      const fuzzyMatched = words.some((w) => {
        if (Math.abs(w.length - token.length) > maxDist) return false;
        return levenshteinDistance(w, token) <= maxDist;
      });
      if (fuzzyMatched) {
        totalScore += 3;
        continue;
      }
    }
    return 0;
  }

  return totalScore;
}

/**
 * Filters and sorts catalog products cleanly according to FilterState.
 */
export function filterAndSortProducts(
  products: Product[],
  filters: FilterState,
  reviews: Review[],
): Product[] {
  const filtered = products.filter((product) => {
    if (product.status !== 'active') return false;

    if (
      filters.categorySlug &&
      filters.categorySlug !== 'all' &&
      product.categorySlug !== filters.categorySlug
    ) {
      return false;
    }

    if (
      filters.subcategory &&
      filters.subcategory !== 'All' &&
      product.subcategory.toLowerCase() !== filters.subcategory.toLowerCase()
    ) {
      return false;
    }

    if (filters.searchQuery && filters.searchQuery.trim()) {
      if (scoreProductMatch(product, filters.searchQuery) <= 0) {
        return false;
      }
    }

    if (filters.minPrice !== undefined && product.price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice !== undefined && product.price > filters.maxPrice) {
      return false;
    }

    if (filters.brands.length > 0 && !filters.brands.includes(product.brandName)) {
      return false;
    }

    if (filters.colors.length > 0) {
      const hasColor = product.variants.some((v) =>
        filters.colors.includes(v.colorName),
      );
      if (!hasColor) return false;
    }

    if (filters.sizes.length > 0) {
      const hasSize = product.variants.some(
        (v) => v.size && filters.sizes.includes(v.size),
      );
      if (!hasSize) return false;
    }

    if (filters.inStockOnly && getProductTotalStock(product) <= 0) {
      return false;
    }

    if (filters.minRating > 0) {
      const { average } = getProductRatingStats(product.id, reviews);
      if (average < filters.minRating) return false;
    }

    if (filters.minDiscount > 0) {
      const discount = getDiscountPercent(product.price, product.originalPrice);
      if (discount < filters.minDiscount) return false;
    }

    if (filters.newArrivalsOnly && !product.isNewArrival && product.badge !== 'NEW') {
      return false;
    }

    return true;
  });

  const sorted = [...filtered];
  sorted.sort((a, b) => {
    switch (filters.sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'bestselling':
        return Number(Boolean(b.isBestSeller)) - Number(Boolean(a.isBestSeller));
      case 'top-rated': {
        const ra = getProductRatingStats(a.id, reviews);
        const rb = getProductRatingStats(b.id, reviews);
        return rb.average - ra.average || rb.count - ra.count;
      }
      case 'recommended':
      default: {
        if (filters.searchQuery && filters.searchQuery.trim()) {
          return (
            scoreProductMatch(b, filters.searchQuery) -
            scoreProductMatch(a, filters.searchQuery)
          );
        }
        return (
          Number(Boolean(b.isTrending)) - Number(Boolean(a.isTrending)) ||
          Number(Boolean(b.isBestSeller)) - Number(Boolean(a.isBestSeller))
        );
      }
    }
  });

  return sorted;
}

export interface AdminMetrics {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  pendingOrders: number;
  lowStockProducts: number;
  returnRatePercent: number;
  topSellingProducts: { productId: string; name: string; units: number; revenue: number }[];
}

/**
 * Computes real administrative KPIs strictly from actual orders and inventory.
 */
export function computeAdminMetrics(
  orders: Order[],
  products: Product[],
  returnCount: number,
  lowStockThreshold = 6,
): AdminMetrics {
  const validOrders = orders.filter((o) => o.status !== 'cancelled');
  const totalSales = validOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const averageOrderValue =
    validOrders.length > 0 ? Math.round(totalSales / validOrders.length) : 0;
  const pendingOrders = orders.filter(
    (o) => o.status === 'confirmed' || o.status === 'packed',
  ).length;
  const lowStockProducts = products.filter(
    (p) => getProductTotalStock(p) <= lowStockThreshold,
  ).length;
  const returnRatePercent =
    totalOrders > 0 ? Math.round((returnCount / totalOrders) * 1000) / 10 : 0;

  const salesByProduct = new Map<
    string,
    { productId: string; name: string; units: number; revenue: number }
  >();
  for (const order of validOrders) {
    for (const item of order.items) {
      const existing = salesByProduct.get(item.productId) ?? {
        productId: item.productId,
        name: item.name,
        units: 0,
        revenue: 0,
      };
      existing.units += item.quantity;
      existing.revenue += item.unitPrice * item.quantity;
      salesByProduct.set(item.productId, existing);
    }
  }

  const topSellingProducts = Array.from(salesByProduct.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return {
    totalSales,
    totalOrders,
    averageOrderValue,
    pendingOrders,
    lowStockProducts,
    returnRatePercent,
    topSellingProducts,
  };
}
