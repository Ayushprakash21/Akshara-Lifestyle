import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCartTotals,
  checkPincodeServiceability,
  computeAdminMetrics,
  evaluateCoupon,
  filterAndSortProducts,
  filterAndSortReviews,
  formatINR,
  getDiscountPercent,
  getOrderProgressInfo,
  getRatingDistribution,
  isValidGSTIN,
  isValidIndianPhone,
  isValidIndianPincode,
  levenshteinDistance,
  lookupGuestOrder,
  scoreProductMatch,
  validateNewsletterSubscription,
  validateProductReview,
} from './commerceLogic';
import type { Coupon, Order, Product, Review, ShippingConfig } from '../types/commerce';

const SAMPLE_SHIPPING: ShippingConfig = {
  freeShippingThreshold: 4999,
  standardFee: 199,
  expressFee: 349,
  priorityFee: 599,
  codFee: 99,
  codMaxOrderValue: 25000,
  dispatchHours: 24,
};

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'p1',
    slug: 'sand-linen-blazer',
    sku: 'AK-FAS-001',
    name: 'Architectural Sand Linen Blazer',
    brandId: 'b1',
    brandName: 'AKSHARA Atelier',
    categorySlug: 'fashion-clothing',
    subcategory: 'Blazers',
    shortDescription: 'Tailored Italian linen blazer',
    description: 'Double-breasted tailored linen blazer.',
    price: 8400,
    originalPrice: 10500,
    gstRate: 12,
    hsnCode: '6204',
    images: ['/img1.jpg'],
    badge: 'NEW',
    isNewArrival: true,
    isBestSeller: true,
    codEligible: true,
    variants: [
      { id: 'v1', sku: 'AK-FAS-001-S', colorName: 'Sand', colorHex: '#CBB9A0', size: 'S', stock: 8 },
      { id: 'v2', sku: 'AK-FAS-001-M', colorName: 'Sand', colorHex: '#CBB9A0', size: 'M', stock: 4 },
    ],
    specifications: [],
    shippingNotes: 'Dispatches within 24 hours.',
    returnPolicyDays: 14,
    weightGrams: 540,
    createdAt: '2026-10-15T10:00:00Z',
    status: 'active',
  },
  {
    id: 'p2',
    slug: 'lotus-gold-pendant',
    sku: 'AK-JWL-001',
    name: 'Lotus Petal 18k Gold Pendant',
    brandId: 'b2',
    brandName: 'AKSHARA Fine',
    categorySlug: 'jewellery',
    subcategory: 'Necklaces',
    shortDescription: 'Brushed champagne gold pendant',
    description: 'Minimalist lotus pendant.',
    price: 3800,
    originalPrice: 3800,
    gstRate: 3,
    hsnCode: '7113',
    images: ['/img2.jpg'],
    badge: 'BESTSELLER',
    isBestSeller: true,
    codEligible: true,
    variants: [
      { id: 'v3', sku: 'AK-JWL-001-G', colorName: 'Champagne Gold', colorHex: '#C5A46D', stock: 3 },
    ],
    specifications: [],
    shippingNotes: 'Insured courier delivery.',
    returnPolicyDays: 14,
    weightGrams: 40,
    createdAt: '2026-09-10T10:00:00Z',
    status: 'active',
  },
];

const SAMPLE_WATCH: Product = {
  id: 'p3',
  slug: 'kala-automatic-dress-watch',
  sku: 'AK-WAT-001',
  name: 'Kāla 38.5mm Automatic Dress Watch',
  brandId: 'b3',
  brandName: 'AKSHARA Horlogerie',
  categorySlug: 'watches',
  subcategory: 'Automatic',
  shortDescription: 'Japanese high-beat mechanical dress watch',
  description: 'High-beat automatic with exhibition caseback.',
  price: 24990,
  originalPrice: 29500,
  gstRate: 18,
  hsnCode: '910221',
  images: ['/watch1.jpg'],
  badge: 'NEW',
  isNewArrival: true,
  codEligible: true,
  movement: 'automatic',
  dialColor: 'Sunburst Champagne Gold',
  strapMaterial: 'Full-Grain Italian Leather',
  caseMaterial: '316L Stainless Steel',
  watchStyle: 'dress',
  tags: ['dress watch', 'mechanical', 'automatic', 'mens watch'],
  variants: [
    { id: 'v4', sku: 'AK-WAT-001-GOLD', colorName: 'Champagne Gold', colorHex: '#C5A46D', size: '38.5mm', stock: 12 },
  ],
  specifications: [],
  shippingNotes: 'Tamper-evident insured delivery.',
  returnPolicyDays: 15,
  weightGrams: 110,
  createdAt: '2026-11-20T10:00:00Z',
  status: 'active',
};

const SAMPLE_COUPONS: Coupon[] = [
  {
    id: 'c1',
    code: 'AKSHARA10',
    description: '10% off orders above ₹5,000',
    type: 'percentage',
    value: 10,
    minOrderValue: 5000,
    maxDiscount: 2000,
    active: true,
    expiresAt: '2027-12-31',
    usageCount: 14,
  },
  {
    id: 'c2',
    code: 'WELCOME500',
    description: 'Flat ₹500 off orders above ₹3,000',
    type: 'flat',
    value: 500,
    minOrderValue: 3000,
    active: true,
    expiresAt: '2027-12-31',
    usageCount: 8,
  },
];

test('formatINR formats Indian currency grouping cleanly', () => {
  assert.equal(formatINR(124999), '₹1,24,999');
  assert.equal(formatINR(8400), '₹8,400');
});

test('getDiscountPercent computes accurate percentage off', () => {
  assert.equal(getDiscountPercent(8400, 10500), 20);
  assert.equal(getDiscountPercent(3800, 3800), 0);
});

test('India-first validation handles phones, pincodes, and GSTIN', () => {
  assert.equal(isValidIndianPhone('9876543210'), true);
  assert.equal(isValidIndianPhone('+91 98765-43210'), true);
  assert.equal(isValidIndianPhone('1234567890'), false);
  assert.equal(isValidIndianPincode('400001'), true);
  assert.equal(isValidIndianPincode('012345'), false);
  assert.equal(isValidGSTIN('27AAPFU0939F1ZV'), true);
  assert.equal(isValidGSTIN('INVALID'), false);
  assert.equal(isValidGSTIN(''), true);
});

test('checkPincodeServiceability resolves Metro city and rejects invalid PIN', () => {
  const mumbai = checkPincodeServiceability('400001', true, new Date('2026-11-22T00:00:00Z'));
  assert.equal(mumbai.valid, true);
  assert.equal(mumbai.serviceable, true);
  assert.equal(mumbai.city, 'Mumbai');
  assert.equal(mumbai.zone, 'Metro');
  assert.equal(mumbai.codAvailable, true);

  const invalid = checkPincodeServiceability('999');
  assert.equal(invalid.valid, false);
  assert.equal(invalid.serviceable, false);
});

test('calculateCartTotals computes subtotal, coupon, GST extraction, shipping, and COD', () => {
  const totals = calculateCartTotals(
    [{ id: 'p1::v1', productId: 'p1', variantId: 'v1', quantity: 1 }],
    SAMPLE_PRODUCTS,
    SAMPLE_COUPONS,
    SAMPLE_SHIPPING,
    { couponCode: 'AKSHARA10', deliveryMethod: 'standard', paymentMethod: 'cod' },
  );

  assert.equal(totals.subtotal, 8400);
  assert.equal(totals.couponDiscount, 840);
  assert.equal(totals.shippingFee, 0); // All-inclusive delivery policy: shippingFee is always 0
  assert.equal(totals.codFee, 99);
  assert.equal(totals.total, 7659);
  assert.equal(totals.taxableValue + totals.gstAmount, 7560);
});

test('calculateCartTotals enforces all-inclusive shipping policy with zero delivery fee on small orders', () => {
  const totals = calculateCartTotals(
    [{ id: 'p2::v1', productId: 'p2', variantId: 'v2', quantity: 1 }],
    SAMPLE_PRODUCTS,
    SAMPLE_COUPONS,
    SAMPLE_SHIPPING,
    { deliveryMethod: 'standard', paymentMethod: 'upi' },
  );

  assert.equal(totals.subtotal, 3800);
  assert.equal(totals.shippingFee, 0);
  assert.equal(totals.freeShippingRemaining, 0);
  assert.equal(totals.total, 3800);
});

test('evaluateCoupon rejects below minimum order value', () => {
  const res = evaluateCoupon('AKSHARA10', 3800, SAMPLE_COUPONS);
  assert.equal(res.discount, 0);
  assert.ok(res.error?.includes('Minimum order'));
});

test('typo-tolerant search matches misspelled product terms', () => {
  assert.equal(levenshteinDistance('pendant', 'pendnt'), 1);
  assert.ok(scoreProductMatch(SAMPLE_PRODUCTS[1], 'lotus pendnt') > 0);
  assert.ok(scoreProductMatch(SAMPLE_PRODUCTS[0], 'linn blazr') > 0);
  assert.equal(scoreProductMatch(SAMPLE_PRODUCTS[0], 'headphone'), 0);
});

test('filterAndSortProducts filters by category and sorts by price ascending', () => {
  const reviews: Review[] = [];
  const res = filterAndSortProducts(
    SAMPLE_PRODUCTS,
    {
      categorySlug: 'all',
      brands: [],
      colors: [],
      sizes: [],
      inStockOnly: true,
      minRating: 0,
      minDiscount: 0,
      newArrivalsOnly: false,
      sortBy: 'price-asc',
    },
    reviews,
  );
  assert.equal(res.length, 2);
  assert.equal(res[0].id, 'p2');
  assert.equal(res[1].id, 'p1');
});

test('computeAdminMetrics calculates sales, AOV, and low stock accurately', () => {
  const orders: Order[] = [
    {
      id: 'o1',
      orderNumber: 'AKS-1001',
      invoiceNumber: 'INV-2026-1001',
      userId: 'u1',
      customerName: 'Ananya Sharma',
      customerEmail: 'ananya@example.com',
      customerPhone: '9876543210',
      shippingAddress: {
        label: 'Home',
        fullName: 'Ananya Sharma',
        phone: '9876543210',
        line1: '14 Pali Hill',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400050',
      },
      deliveryMethod: 'standard',
      items: [
        {
          productId: 'p1',
          productSlug: 'sand-linen-blazer',
          name: 'Architectural Sand Linen Blazer',
          brandName: 'AKSHARA Atelier',
          image: '/img1.jpg',
          sku: 'AK-FAS-001-S',
          colorName: 'Sand',
          size: 'S',
          quantity: 1,
          unitPrice: 8400,
          mrp: 10500,
          gstRate: 12,
          hsnCode: '6204',
        },
      ],
      subtotal: 8400,
      mrpTotal: 10500,
      couponDiscount: 0,
      shippingFee: 0,
      codFee: 0,
      taxableValue: 7500,
      gstAmount: 900,
      total: 8400,
      status: 'confirmed',
      payment: {
        id: 'pay1',
        method: 'upi',
        provider: 'razorpay_demo',
        mode: 'DEMO',
        status: 'demo_authorized',
        amount: 8400,
        referenceId: 'DEMO-UPI-1001',
        paidAt: '2026-11-20T10:00:00Z',
      },
      shipment: {
        carrier: 'BlueDart Express (Demo)',
        awbNumber: 'BD99001122',
        estimatedDelivery: 'Thu, 26 Nov',
        events: [],
      },
      createdAt: '2026-11-20T10:00:00Z',
      isDemoOrder: true,
    },
  ];

  const metrics = computeAdminMetrics(orders, SAMPLE_PRODUCTS, 0, 5);
  assert.equal(metrics.totalSales, 8400);
  assert.equal(metrics.averageOrderValue, 8400);
  assert.equal(metrics.pendingOrders, 1);
  assert.equal(metrics.lowStockProducts, 1); // p2 has stock 3 <= 5
});

test('filterAndSortProducts filters watches by category, movement, case metallurgy, and collection subcategory', () => {
  const catalog = [...SAMPLE_PRODUCTS, SAMPLE_WATCH];

  // 1. Filter by category watches
  const watchCategoryResult = filterAndSortProducts(
    catalog,
    {
      categorySlug: 'watches',
      searchQuery: '',
      brands: [],
      colors: [],
      sizes: [],
      inStockOnly: false,
      minRating: 0,
      minDiscount: 0,
      newArrivalsOnly: false,
      sortBy: 'recommended',
    },
    [],
  );
  assert.equal(watchCategoryResult.length, 1);
  assert.equal(watchCategoryResult[0].id, 'p3');

  // 2. Filter by movement
  const autoResult = filterAndSortProducts(
    catalog,
    {
      categorySlug: 'watches',
      searchQuery: '',
      brands: [],
      colors: [],
      sizes: [],
      inStockOnly: false,
      minRating: 0,
      minDiscount: 0,
      newArrivalsOnly: false,
      sortBy: 'recommended',
      movements: ['automatic'],
    },
    [],
  );
  assert.equal(autoResult.length, 1);

  // 3. Filter by non-matching movement
  const quartzResult = filterAndSortProducts(
    catalog,
    {
      categorySlug: 'watches',
      searchQuery: '',
      brands: [],
      colors: [],
      sizes: [],
      inStockOnly: false,
      minRating: 0,
      minDiscount: 0,
      newArrivalsOnly: false,
      sortBy: 'recommended',
      movements: ['quartz'],
    },
    [],
  );
  assert.equal(quartzResult.length, 0);

  // 4. Filter by Men's Collection subcategory
  const mensResult = filterAndSortProducts(
    catalog,
    {
      categorySlug: 'watches',
      subcategory: "Men's Collection",
      searchQuery: '',
      brands: [],
      colors: [],
      sizes: [],
      inStockOnly: false,
      minRating: 0,
      minDiscount: 0,
      newArrivalsOnly: false,
      sortBy: 'recommended',
    },
    [],
  );
  assert.equal(mensResult.length, 1);
  assert.equal(mensResult[0].id, 'p3');
});

test('validateNewsletterSubscription validates format, normalizes case, and detects duplicates', () => {
  const empty = validateNewsletterSubscription('   ', []);
  assert.equal(empty.status, 'invalid');
  assert.ok(empty.message?.includes('enter your email'));

  const malformed = validateNewsletterSubscription('not-an-email', []);
  assert.equal(malformed.status, 'invalid');
  assert.ok(malformed.message?.includes('valid email'));

  const fresh = validateNewsletterSubscription('  Meera.Kapoor@Example.COM ', [
    'other@example.com',
  ]);
  assert.equal(fresh.status, 'valid');
  assert.equal(fresh.normalizedEmail, 'meera.kapoor@example.com');

  const duplicate = validateNewsletterSubscription('MEERA.KAPOOR@EXAMPLE.COM', [
    'meera.kapoor@example.com',
  ]);
  assert.equal(duplicate.status, 'duplicate');
  assert.equal(duplicate.normalizedEmail, 'meera.kapoor@example.com');
  assert.ok(duplicate.message?.includes('already subscribed'));
});

test('lookupGuestOrder validates inputs, normalizes order ID & email, and rejects mismatched pairs', () => {
  const sampleOrders: Order[] = [
    {
      id: 'ord-demo-1002',
      orderNumber: 'AKS-2611-1002',
      invoiceNumber: 'GST/26-27/1002',
      userId: 'guest',
      customerName: 'Rohan Malhotra',
      customerEmail: 'rohan.m@example.com',
      customerPhone: '9810998877',
      shippingAddress: {
        label: 'Home',
        fullName: 'Rohan Malhotra',
        phone: '9810998877',
        line1: '42 Jor Bagh',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110003',
      },
      deliveryMethod: 'express',
      items: [],
      subtotal: 18990,
      mrpTotal: 22990,
      couponDiscount: 0,
      shippingFee: 349,
      codFee: 0,
      taxableValue: 16093,
      gstAmount: 2897,
      total: 19339,
      status: 'shipped',
      payment: {
        id: 'pay-2',
        method: 'card',
        provider: 'razorpay_demo',
        mode: 'DEMO',
        status: 'demo_authorized',
        amount: 19339,
        referenceId: 'DEMO-CARD-2',
        paidAt: '2026-11-19T15:10:00Z',
      },
      shipment: {
        carrier: 'BlueDart Priority',
        awbNumber: 'BD261102IN',
        estimatedDelivery: 'Mon, 23 Nov',
        events: [],
      },
      createdAt: '2026-11-19T15:10:00Z',
      isDemoOrder: true,
    },
  ];

  const missingId = lookupGuestOrder(sampleOrders, '  ', 'rohan.m@example.com');
  assert.equal(missingId.ok, false);
  assert.equal(missingId.field, 'orderId');

  const badEmail = lookupGuestOrder(sampleOrders, 'AKS-2611-1002', 'not-an-email');
  assert.equal(badEmail.ok, false);
  assert.equal(badEmail.field, 'email');

  const wrongEmail = lookupGuestOrder(sampleOrders, 'AKS-2611-1002', 'other@example.com');
  assert.equal(wrongEmail.ok, false);
  assert.equal(wrongEmail.field, 'lookup');

  const matched = lookupGuestOrder(sampleOrders, ' #aks-2611-1002 ', ' ROHAN.M@EXAMPLE.COM ');
  assert.equal(matched.ok, true);
  assert.equal(matched.order?.id, 'ord-demo-1002');

  const shippedInfo = getOrderProgressInfo('shipped');
  assert.equal(shippedInfo.activeStageIndex, 2);
  assert.equal(shippedInfo.isException, false);

  const cancelledInfo = getOrderProgressInfo('cancelled');
  assert.equal(cancelledInfo.activeStageIndex, -1);
  assert.equal(cancelledInfo.isException, true);
});

test('validateProductReview enforces authentication, star bounds, and text length', () => {
  const guest = validateProductReview({
    isAuthenticated: true && false,
    rating: 5,
    title: 'Great blazer',
    comment: 'Excellent drape and stitching.',
  });
  assert.equal(guest.valid, false);
  assert.equal(guest.field, 'auth');

  const badRating = validateProductReview({
    isAuthenticated: true,
    rating: 0,
    title: 'Great blazer',
    comment: 'Excellent drape and stitching.',
  });
  assert.equal(badRating.valid, false);
  assert.equal(badRating.field, 'rating');

  const shortTitle = validateProductReview({
    isAuthenticated: true,
    rating: 4,
    title: 'Ok',
    comment: 'Excellent drape and stitching.',
  });
  assert.equal(shortTitle.valid, false);
  assert.equal(shortTitle.field, 'title');

  const shortComment = validateProductReview({
    isAuthenticated: true,
    rating: 4,
    title: 'Lovely linen',
    comment: 'Too short',
  });
  assert.equal(shortComment.valid, false);
  assert.equal(shortComment.field, 'comment');

  const valid = validateProductReview({
    isAuthenticated: true,
    rating: 5,
    title: 'Refined tailoring',
    comment: 'Breathable Belgian linen with clean structured shoulders.',
  });
  assert.equal(valid.valid, true);
});

test('getRatingDistribution and filterAndSortReviews aggregate, filter, and sort accurately', () => {
  const sampleReviews: Review[] = [
    {
      id: 'r1',
      productId: 'p1',
      userId: 'u1',
      authorName: 'Meera',
      city: 'Mumbai',
      rating: 5,
      title: 'Superb',
      comment: 'Loved the weave and fit.',
      verifiedPurchase: true,
      status: 'approved',
      createdAt: '2026-11-10T10:00:00Z',
    },
    {
      id: 'r2',
      productId: 'p1',
      userId: 'u2',
      authorName: 'Rohan',
      city: 'Delhi',
      rating: 4,
      title: 'Very good',
      comment: 'Clean silhouette, slightly relaxed.',
      verifiedPurchase: false,
      status: 'approved',
      createdAt: '2026-11-18T10:00:00Z',
    },
    {
      id: 'r3',
      productId: 'p1',
      userId: 'u3',
      authorName: 'Pending',
      city: 'Pune',
      rating: 1,
      title: 'Pending moderation',
      comment: 'Should not count while pending.',
      verifiedPurchase: false,
      status: 'pending',
      createdAt: '2026-11-20T10:00:00Z',
    },
  ];

  const dist = getRatingDistribution('p1', sampleReviews);
  assert.equal(dist.length, 5);
  assert.equal(dist[0].stars, 5);
  assert.equal(dist[0].count, 1);
  assert.equal(dist[0].percentage, 50);
  assert.equal(dist[1].stars, 4);
  assert.equal(dist[1].count, 1);
  assert.equal(dist[1].percentage, 50);
  assert.equal(dist[4].stars, 1);
  assert.equal(dist[4].count, 0);

  const approvedOnly = sampleReviews.filter((r) => r.status === 'approved');
  const lowestFirst = filterAndSortReviews(approvedOnly, { starFilter: null, sortBy: 'lowest' });
  assert.equal(lowestFirst[0].id, 'r2');

  const fiveStarOnly = filterAndSortReviews(approvedOnly, { starFilter: 5, sortBy: 'newest' });
  assert.equal(fiveStarOnly.length, 1);
  assert.equal(fiveStarOnly[0].id, 'r1');
});



