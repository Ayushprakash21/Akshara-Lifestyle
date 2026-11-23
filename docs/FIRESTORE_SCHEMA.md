# AKSHARA LIFESTYLE — Cloud Firestore Database Schema

## Architecture Overview

AKSHARA LIFESTYLE utilizes Google Cloud Firestore as its primary NoSQL document database. The schema is optimized for luxury multi-category retail performance, strict client ownership boundaries, and granular role-based security.

---

### Collections Specification

#### 1. `users/`
- **Document ID**: `uid` (Firebase Authentication UID)
- **Ownership**: `uid == request.auth.uid`
- **Schema**:
  ```typescript
  {
    id: string;                      // Firebase Auth UID
    name: string;                    // Full customer / admin name
    email: string;                   // Contact & login email (lowercase)
    phone: string;                   // 10-digit Indian phone number
    role: 'super_admin' | 'admin' | 'product_manager' | 'order_manager' | 'customer';
    gstin?: string;                  // Optional Indian GSTIN for B2B billing
    joinedAt: string;                // ISO 8601 timestamp
    addresses: Address[];            // Array of customer delivery addresses
    emailOptIn: boolean;             // Marketing email consent
    smsOptIn: boolean;               // Transactional & promo SMS consent
    createdAt?: Timestamp;           // Server timestamp
    updatedAt?: Timestamp;           // Server timestamp
  }
  ```

#### 2. `products/`
- **Document ID**: `prod-{categoryPrefix}-{timestamp}` or descriptive slug
- **Access**: Public Read, Write restricted to `product_manager`, `admin`, `super_admin`
- **Schema**:
  ```typescript
  {
    id: string;                      // Unique product identifier
    slug: string;                    // URL-safe unique slug
    sku: string;                     // Primary SKU
    name: string;                    // Product title
    brandId: string;                 // Brand identifier
    brandName: string;               // Display brand name (e.g., 'AKSHARA ATELIER')
    categorySlug: string;            // 'fashion-clothing' | 'jewellery' | etc.
    subcategory: string;             // Subcategory label
    shortDescription: string;        // Brief editorial summary
    description: string;             // Full editorial details and craft notes
    price: number;                   // Selling price in INR (inclusive of GST)
    originalPrice: number;           // MRP in INR
    gstRate: number;                 // 3, 5, 12, or 18 (%)
    hsnCode: string;                 // Indian HSN Code for GST compliance
    images: string[];                // URLs hosted on Firebase Storage or CDN
    badge?: 'NEW' | 'BESTSELLER' | 'SALE';
    isTrending?: boolean;
    isNewArrival?: boolean;
    isBestSeller?: boolean;
    isLimitedOffer?: boolean;
    codEligible: boolean;            // Whether Cash on Delivery is supported
    variants: Array<{
      id: string;                    // Variant ID
      sku: string;
      colorName: string;
      colorHex: string;
      size?: string;
      priceDelta?: number;
      stock: number;
    }>;
    specifications: Array<{
      label: string;
      value: string;
    }>;
    shippingNotes: string;
    returnPolicyDays: number;
    weightGrams: number;
    status: 'active' | 'draft' | 'archived';
    createdAt: string;
    updatedAt?: Timestamp;
  }
  ```

#### 3. `categories/`
- **Document ID**: `cat-{slug}`
- **Access**: Public Read, Admin Write
- **Schema**:
  ```typescript
  {
    id: string;
    slug: string;                    // e.g. 'jewellery', 'fashion-clothing'
    name: string;                    // 'Fine Jewellery & Heirlooms'
    shortName: string;               // 'Jewellery'
    tagline: string;
    description: string;
    heroImage: string;
    subcategories: string[];
    featuredCollectionTitle: string;
    featuredCollectionNote: string;
    displayOrder: number;
    updatedAt?: Timestamp;
  }
  ```

#### 4. `orders/`
- **Document ID**: `ord-{timestamp}-{sequence}`
- **Ownership & Access**: Customer can read their own (`userId == auth.uid`), `order_manager` and `admin` have full read/write
- **Schema**:
  ```typescript
  {
    id: string;                      // Document key
    orderNumber: string;             // Display order reference (e.g. AKS-2611-1004)
    invoiceNumber: string;           // Legal GST tax invoice number
    userId: string;                  // Firebase UID or 'guest'
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerGstin?: string;
    shippingAddress: Address;
    deliveryMethod: 'standard' | 'express' | 'white_glove';
    items: Array<{
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
    }>;
    subtotal: number;
    mrpTotal: number;
    couponCode?: string;
    couponDiscount: number;
    shippingFee: number;
    codFee: number;
    taxableValue: number;
    gstAmount: number;
    total: number;
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    payment: {
      id: string;
      method: 'upi' | 'card' | 'netbanking' | 'cod';
      provider: string;
      mode: 'DEMO' | 'LIVE';
      status: 'demo_authorized' | 'cod_pending' | 'pending' | 'paid' | 'failed';
      amount: number;
      referenceId: string;
      paidAt?: string;
    };
    shipment?: {
      carrier: string;
      awbNumber: string;
      estimatedDelivery: string;
      events: Array<{
        status: string;
        location: string;
        timestamp: string;
        note?: string;
      }>;
    };
    isDemoOrder?: boolean;
    createdAt: string;
    updatedAt?: Timestamp;
  }
  ```

#### 5. `inventory/`
- **Document ID**: `productId`
- **Access**: Public Read, Write restricted to `product_manager` and `order_manager`
- **Schema**:
  ```typescript
  {
    productId: string;
    sku: string;
    totalStock: number;
    variantStocks: {
      [variantId: string]: number;
    };
    lowStockThreshold: number;
    updatedAt: string;
  }
  ```

#### 6. `wishlists/`
- **Document ID**: `userId` (Firebase Auth UID)
- **Ownership**: Read/Write restricted to document owner (`request.auth.uid == userId`)
- **Schema**:
  ```typescript
  {
    userId: string;
    items: string[];                 // Array of product IDs
    updatedAt?: Timestamp;
  }
  ```

#### 7. `carts/`
- **Document ID**: `userId` (Firebase Auth UID)
- **Ownership**: Read/Write restricted to document owner (`request.auth.uid == userId`)
- **Schema**:
  ```typescript
  {
    userId: string;
    items: Array<{
      id: string;                    // composite key productId::variantId
      productId: string;
      variantId: string;
      quantity: number;
    }>;
    updatedAt?: Timestamp;
  }
  ```

#### 8. `addresses/`
- **Document ID**: `addr-{timestamp}`
- **Ownership**: User-owned via `userId` field
- **Schema**:
  ```typescript
  {
    id: string;
    userId: string;
    label: string;                   // 'Home' | 'Work' | 'Studio'
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
  }
  ```

#### 9. `coupons/`
- **Document ID**: `code` (uppercase string, e.g., 'AKSHARA10')
- **Access**: Public Read, Admin Write
- **Schema**:
  ```typescript
  {
    id: string;
    code: string;
    type: 'percentage' | 'fixed';
    discountValue: number;
    minOrderAmount: number;
    maxDiscountAmount?: number;
    validUntil: string;
    usageLimit?: number;
    usageCount: number;
    isActive: boolean;
  }
  ```

#### 10. `reviews/`
- **Document ID**: `rev-{timestamp}`
- **Access**: Approved reviews are public read; Create allowed for authenticated buyer; Admin moderation
- **Schema**:
  ```typescript
  {
    id: string;
    productId: string;
    userId: string;
    authorName: string;
    city: string;
    rating: number;                  // 1 to 5
    title: string;
    comment: string;
    verifiedPurchase: boolean;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
  }
  ```

---

## Security & Access Control Enforcement

1. **Role Resolution**: Roles are stored in `users/{uid}.role` and checked server-side via `firestore.rules`.
2. **Owner Isolation**: Customer carts, wishlists, personal addresses, and order histories are strictly locked to `request.auth.uid`.
3. **Escalation Prevention**: The `firestore.rules` prohibit regular users from mutating their own `role` field.
