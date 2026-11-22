export type UserRole = 'customer' | 'admin' | 'merchandiser' | 'operations';

export type CategorySlug =
  | 'fashion-clothing'
  | 'jewellery'
  | 'beauty-cosmetics'
  | 'home-decor'
  | 'electronics'
  | 'bags-accessories';

export type ProductBadge = 'NEW' | 'BESTSELLER' | 'SALE';

export interface ProductVariant {
  id: string;
  sku: string;
  colorName: string;
  colorHex: string;
  size?: string;
  priceDelta?: number;
  stock: number;
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: string;
  brandId: string;
  brandName: string;
  categorySlug: CategorySlug;
  subcategory: string;
  shortDescription: string;
  description: string;
  price: number; // Selling price in INR (inclusive of GST)
  originalPrice: number; // MRP in INR
  gstRate: number; // e.g. 12 or 18 (%)
  hsnCode: string;
  images: string[];
  badge?: ProductBadge;
  isTrending?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isLimitedOffer?: boolean;
  codEligible: boolean;
  variants: ProductVariant[];
  specifications: ProductSpecification[];
  shippingNotes: string;
  returnPolicyDays: number;
  weightGrams: number;
  createdAt: string;
  status: 'active' | 'draft' | 'archived';
}

export interface Category {
  id: string;
  slug: CategorySlug;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  heroImage: string;
  subcategories: string[];
  featuredCollectionTitle: string;
  featuredCollectionNote: string;
  displayOrder: number;
}

export interface Brand {
  id: string;
  name: string;
  origin: string;
  summary: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  authorName: string;
  city: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
}

export interface Address {
  id: string;
  label: string; // Home, Studio, Office
  fullName: string;
  phone: string; // 10-digit Indian mobile
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string; // 6-digit Indian PIN
  isDefault: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  gstin?: string;
  joinedAt: string;
  addresses: Address[];
  emailOptIn: boolean;
  smsOptIn: boolean;
  isDemoAccount?: boolean;
}

export interface CartItem {
  id: string; // composite key: productId::variantId
  productId: string;
  variantId: string;
  quantity: number;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  type: 'percentage' | 'flat';
  value: number;
  minOrderValue: number;
  maxDiscount?: number;
  active: boolean;
  expiresAt: string;
  usageCount: number;
}

export type PaymentMethodId = 'upi' | 'card' | 'netbanking' | 'wallet' | 'cod';

export type DeliveryMethodId = 'standard' | 'express' | 'priority';

export type OrderStatus =
  | 'confirmed'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'return_requested';

export interface OrderItem {
  productId: string;
  productSlug: string;
  name: string;
  brandName: string;
  image: string;
  sku: string;
  colorName: string;
  size?: string;
  quantity: number;
  unitPrice: number;
  mrp: number;
  gstRate: number;
  hsnCode: string;
}

export interface ShipmentTrackingEvent {
  status: string;
  location: string;
  timestamp: string;
  note: string;
}

export interface Shipment {
  carrier: string;
  awbNumber: string;
  estimatedDelivery: string;
  events: ShipmentTrackingEvent[];
}

export interface PaymentRecord {
  id: string;
  method: PaymentMethodId;
  provider: 'razorpay_demo' | 'cod_demo';
  mode: 'DEMO' | 'LIVE';
  status: 'demo_authorized' | 'cod_pending' | 'refunded';
  amount: number;
  referenceId: string;
  paidAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  invoiceNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerGstin?: string;
  shippingAddress: Omit<Address, 'id' | 'isDefault'>;
  deliveryMethod: DeliveryMethodId;
  items: OrderItem[];
  subtotal: number;
  mrpTotal: number;
  couponCode?: string;
  couponDiscount: number;
  shippingFee: number;
  codFee: number;
  taxableValue: number;
  gstAmount: number;
  total: number;
  status: OrderStatus;
  payment: PaymentRecord;
  shipment: Shipment;
  createdAt: string;
  isDemoOrder: boolean;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  reason: string;
  resolution: 'refund' | 'exchange';
  refundAmount: number;
  status: 'requested' | 'approved' | 'pickup_scheduled' | 'refunded' | 'rejected';
  createdAt: string;
  notes?: string;
}

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaLink: string;
  placement: 'announcement' | 'midpage' | 'category';
  active: boolean;
}

export interface HomepageConfig {
  announcementText: string;
  heroEyebrow: string;
  heroHeadline: string;
  heroSubheadline: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  editorialTitle: string;
  editorialBody: string;
  brandStoryTitle: string;
  brandStoryBody: string;
}

export interface ShippingConfig {
  freeShippingThreshold: number;
  standardFee: number;
  expressFee: number;
  priorityFee: number;
  codFee: number;
  codMaxOrderValue: number;
  dispatchHours: number;
}

export interface PaymentGatewayConfig {
  razorpayEnabled: boolean;
  razorpayMode: 'demo' | 'live';
  upiEnabled: boolean;
  cardsEnabled: boolean;
  netBankingEnabled: boolean;
  walletsEnabled: boolean;
  codEnabled: boolean;
  gstRegisteredState: string;
  sellerGstin: string;
}

export interface FilterState {
  categorySlug?: CategorySlug | 'all';
  subcategory?: string;
  searchQuery?: string;
  minPrice?: number;
  maxPrice?: number;
  brands: string[];
  colors: string[];
  sizes: string[];
  inStockOnly: boolean;
  minRating: number;
  minDiscount: number;
  newArrivalsOnly: boolean;
  sortBy:
    | 'recommended'
    | 'newest'
    | 'price-asc'
    | 'price-desc'
    | 'bestselling'
    | 'top-rated';
}

export interface PincodeServiceability {
  pincode: string;
  valid: boolean;
  serviceable: boolean;
  city?: string;
  state?: string;
  zone?: 'Metro' | 'Tier 1' | 'Regional' | 'Remote';
  standardDays?: [number, number];
  expressDays?: [number, number];
  estimatedDateText?: string;
  codAvailable?: boolean;
  message: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  tone?: 'default' | 'success' | 'error';
}
