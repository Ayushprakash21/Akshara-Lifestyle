import React, { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type {
  CategorySlug,
  Coupon,
  OrderStatus,
  Product,
  ReturnRequest,
  UserRole,
} from '../../types/commerce';
import { useCommerce } from '../../store/CommerceContext';
import { computeAdminMetrics, formatINR, getProductTotalStock } from '../../utils/commerceLogic';
import { ASSETS } from '../../services/seedData';
import { getActiveIntegrationStatus } from '../../services/integrations';

export type AdminModuleKey =
  | 'overview'
  | 'products'
  | 'categories'
  | 'inventory'
  | 'orders'
  | 'customers'
  | 'coupons'
  | 'banners'
  | 'homepage'
  | 'reviews'
  | 'returns'
  | 'shipping'
  | 'payments'
  | 'analytics'
  | 'roles';

export function AdminModuleContent({ activeModule }: { activeModule: AdminModuleKey }) {
  const {
    products,
    categories,
    orders,
    users,
    coupons,
    banners,
    homepageConfig,
    reviews,
    returns,
    shippingConfig,
    paymentConfig,
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
  } = useCommerce();

  const metrics = useMemo(
    () => computeAdminMetrics(orders, products, returns.length, 6),
    [orders, products, returns.length],
  );
  const integrationStatus = useMemo(() => getActiveIntegrationStatus(), []);

  // Product creation state
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [newProd, setNewProd] = useState({
    name: '',
    brandName: 'AKSHARA Atelier',
    categorySlug: 'fashion-clothing' as CategorySlug,
    subcategory: 'Blazers',
    price: 5990,
    originalPrice: 6990,
    gstRate: 12,
    stock: 10,
  });

  // Coupon creation state
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    description: '',
    type: 'percentage' as Coupon['type'],
    value: 10,
    minOrderValue: 3000,
  });

  // Homepage CMS form state
  const [cmsDraft, setCmsDraft] = useState(homepageConfig);
  const [shipDraft, setShipDraft] = useState(shippingConfig);
  const [payDraft, setPayDraft] = useState(paymentConfig);

  if (activeModule === 'overview') {
    const lowStockList = products.filter((p) => getProductTotalStock(p) <= 6);
    const revenueByCategory = categories.map((cat) => {
      const catProductIds = new Set(
        products.filter((p) => p.categorySlug === cat.slug).map((p) => p.id),
      );
      const rev = orders
        .filter((o) => o.status !== 'cancelled')
        .reduce(
          (sum, o) =>
            sum +
            o.items
              .filter((i) => catProductIds.has(i.productId))
              .reduce((s, i) => s + i.unitPrice * i.quantity, 0),
          0,
        );
      return { name: cat.shortName, revenue: rev };
    });
    const maxCatRev = Math.max(1, ...revenueByCategory.map((c) => c.revenue));

    return (
      <div className="space-y-8">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[
            { label: 'Total Sales', value: formatINR(metrics.totalSales) },
            { label: 'Total Orders', value: String(metrics.totalOrders) },
            { label: 'Avg. Order Value', value: formatINR(metrics.averageOrderValue) },
            { label: 'Pending Orders', value: String(metrics.pendingOrders) },
            { label: 'Low Stock', value: String(metrics.lowStockProducts) },
            { label: 'Return Rate', value: `${metrics.returnRatePercent}%` },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white border border-[#E9E1D5] p-5 flex flex-col justify-between">
              <p className="text-[11px] uppercase tracking-[0.14em] text-[#85817B] whitespace-nowrap">
                {kpi.label}
              </p>
              <p className="mt-3 font-mono text-2xl font-medium text-[#171717] tabular-nums">
                {kpi.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Revenue by Department Bar Chart (computed strictly from actual orders) */}
          <div className="lg:col-span-7 bg-white border border-[#E9E1D5] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-editorial text-2xl text-[#171717]">
                  Revenue by Department
                </h2>
                <p className="text-xs text-[#85817B]">
                  Aggregated strictly from recorded orders (Demo & Session)
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {revenueByCategory.map((row) => (
                <div key={row.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#171717]">{row.name}</span>
                    <span className="font-mono text-[#55524E] tabular-nums">
                      {formatINR(row.revenue)}
                    </span>
                  </div>
                  <div className="h-2 bg-[#F7F4EE] overflow-hidden">
                    <div
                      className="h-full bg-[#171717]"
                      style={{ width: `${Math.round((row.revenue / maxCatRev) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Best Sellers & Inventory Alerts */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-[#E9E1D5] p-6">
              <h2 className="font-editorial text-2xl text-[#171717] mb-4">Best-Selling Pieces</h2>
              {metrics.topSellingProducts.length === 0 ? (
                <p className="text-xs text-[#85817B]">No completed order items recorded yet.</p>
              ) : (
                <ul className="divide-y divide-[#E9E1D5] text-sm">
                  {metrics.topSellingProducts.map((item) => (
                    <li key={item.productId} className="py-2.5 flex items-center justify-between gap-3">
                      <span className="truncate text-[#171717]">{item.name}</span>
                      <span className="font-mono text-xs tabular-nums shrink-0 text-[#55524E]">
                        {item.units} sold · {formatINR(item.revenue)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-white border border-[#E9E1D5] p-6">
              <h2 className="font-editorial text-2xl text-[#171717] mb-4">
                Inventory Alerts (≤ 6 Units)
              </h2>
              {lowStockList.length === 0 ? (
                <p className="text-xs text-[#2D6A4F]">All products are well stocked.</p>
              ) : (
                <ul className="divide-y divide-[#E9E1D5] text-sm">
                  {lowStockList.map((p) => (
                    <li key={p.id} className="py-2 flex items-center justify-between gap-2">
                      <span className="truncate text-[#171717]">{p.name}</span>
                      <span className="font-mono text-xs text-[#9E2A2B] tabular-nums shrink-0">
                        {getProductTotalStock(p)} left
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeModule === 'products') {
    const handleCreateProduct = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newProd.name.trim()) return;
      const slug = newProd.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const id = `prod-${Date.now()}`;
      const product: Product = {
        id,
        slug: `${slug}-${Date.now().toString().slice(-3)}`,
        sku: `AKS-NEW-${Date.now().toString().slice(-3)}`,
        name: newProd.name.trim(),
        brandId: 'brand-atelier',
        brandName: newProd.brandName,
        categorySlug: newProd.categorySlug,
        subcategory: newProd.subcategory,
        shortDescription: 'Newly added AKSHARA catalog piece.',
        description: 'Added via AKSHARA Admin Console product management.',
        price: Number(newProd.price) || 2990,
        originalPrice: Math.max(Number(newProd.originalPrice) || 2990, Number(newProd.price) || 2990),
        gstRate: Number(newProd.gstRate) || 12,
        hsnCode: '6204',
        images: [ASSETS.fashionBlazer],
        badge: 'NEW',
        isNewArrival: true,
        codEligible: true,
        variants: [
          {
            id: `v-${Date.now()}`,
            sku: `AKS-NEW-${Date.now().toString().slice(-3)}-OS`,
            colorName: 'Signature Neutral',
            colorHex: '#C5A46D',
            size: 'Standard',
            stock: Number(newProd.stock) || 10,
          },
        ],
        specifications: [{ label: 'Origin', value: 'India' }],
        shippingNotes: 'Dispatches within 24 hours.',
        returnPolicyDays: 14,
        weightGrams: 400,
        createdAt: new Date().toISOString(),
        status: 'active',
      };
      upsertProduct(product);
      setShowNewProduct(false);
      setNewProd({
        name: '',
        brandName: 'AKSHARA Atelier',
        categorySlug: 'fashion-clothing',
        subcategory: 'Blazers',
        price: 5990,
        originalPrice: 6990,
        gstRate: 12,
        stock: 10,
      });
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-editorial text-3xl text-[#171717]">Product Management ({products.length})</h2>
          <button
            type="button"
            onClick={() => setShowNewProduct((v) => !v)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#171717] text-white text-xs tracking-[0.14em] uppercase"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={1.6} />
            Add Product
          </button>
        </div>

        {showNewProduct && (
          <form onSubmit={handleCreateProduct} className="bg-white border border-[#171717] p-6 grid sm:grid-cols-3 gap-4">
            <input
              required
              placeholder="Product Name"
              value={newProd.name}
              onChange={(e) => setNewProd((p) => ({ ...p, name: e.target.value }))}
              className="sm:col-span-2 bg-[#F7F4EE] border border-[#D9D0C2] px-3 py-2 text-sm"
            />
            <select
              value={newProd.categorySlug}
              onChange={(e) =>
                setNewProd((p) => ({ ...p, categorySlug: e.target.value as CategorySlug }))
              }
              className="bg-[#F7F4EE] border border-[#D9D0C2] px-3 py-2 text-sm"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Selling Price (INR)"
              value={newProd.price}
              onChange={(e) => setNewProd((p) => ({ ...p, price: Number(e.target.value) }))}
              className="bg-[#F7F4EE] border border-[#D9D0C2] px-3 py-2 text-sm tabular-nums"
            />
            <input
              type="number"
              placeholder="MRP (INR)"
              value={newProd.originalPrice}
              onChange={(e) => setNewProd((p) => ({ ...p, originalPrice: Number(e.target.value) }))}
              className="bg-[#F7F4EE] border border-[#D9D0C2] px-3 py-2 text-sm tabular-nums"
            />
            <input
              type="number"
              placeholder="Initial Stock"
              value={newProd.stock}
              onChange={(e) => setNewProd((p) => ({ ...p, stock: Number(e.target.value) }))}
              className="bg-[#F7F4EE] border border-[#D9D0C2] px-3 py-2 text-sm tabular-nums"
            />
            <div className="sm:col-span-3 flex gap-3">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#171717] text-white text-xs tracking-[0.14em] uppercase"
              >
                Save to Catalog
              </button>
              <button
                type="button"
                onClick={() => setShowNewProduct(false)}
                className="px-5 py-2.5 border border-[#D9D0C2] text-xs uppercase"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="bg-white border border-[#E9E1D5] overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#E9E1D5] bg-[#FAF8F4] text-[11px] uppercase tracking-[0.12em] text-[#85817B]">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Price</th>
                <th className="py-3 px-4 text-right">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E1D5]">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-[#FAF8F4]">
                  <td className="py-3 px-4 font-medium text-[#171717]">{p.name}</td>
                  <td className="py-3 px-4 font-mono text-xs text-[#85817B]">{p.sku}</td>
                  <td className="py-3 px-4 text-xs text-[#55524E]">{p.categorySlug}</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">{formatINR(p.price)}</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">{getProductTotalStock(p)}</td>
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() =>
                        upsertProduct({
                          ...p,
                          status: p.status === 'active' ? 'draft' : 'active',
                        })
                      }
                      className="text-xs uppercase tracking-[0.1em] underline text-[#171717]"
                    >
                      {p.status}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => deleteProduct(p.id)}
                      aria-label={`Delete ${p.name}`}
                      className="text-[#85817B] hover:text-[#9E2A2B] p-1"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (activeModule === 'categories') {
    return (
      <div className="space-y-6">
        <h2 className="font-editorial text-3xl text-[#171717]">Category Management</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white border border-[#E9E1D5] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-editorial text-2xl text-[#171717]">{cat.name}</h3>
                <span className="font-mono text-xs text-[#85817B]">/{cat.slug}</span>
              </div>
              <input
                type="text"
                value={cat.tagline}
                onChange={(e) => updateCategory({ ...cat, tagline: e.target.value })}
                aria-label={`${cat.name} tagline`}
                className="w-full bg-[#F7F4EE] border border-[#D9D0C2] px-3 py-2 text-xs text-[#171717]"
              />
              <p className="text-xs text-[#85817B]">
                Subcategories: {cat.subcategories.filter((s) => s !== 'All').join(' · ')}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeModule === 'inventory') {
    return (
      <div className="space-y-6">
        <h2 className="font-editorial text-3xl text-[#171717]">Inventory Management</h2>
        <div className="bg-white border border-[#E9E1D5] overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#E9E1D5] bg-[#FAF8F4] text-[11px] uppercase tracking-[0.12em] text-[#85817B]">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Variant SKU</th>
                <th className="py-3 px-4">Option</th>
                <th className="py-3 px-4 text-right">On-Hand Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E1D5]">
              {products.flatMap((p) =>
                p.variants.map((v) => (
                  <tr key={v.id}>
                    <td className="py-2.5 px-4 font-medium text-[#171717]">{p.name}</td>
                    <td className="py-2.5 px-4 font-mono text-xs text-[#85817B]">{v.sku}</td>
                    <td className="py-2.5 px-4 text-xs text-[#55524E]">
                      {v.colorName}
                      {v.size ? ` · ${v.size}` : ''}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <input
                        type="number"
                        min={0}
                        value={v.stock}
                        onChange={(e) => updateVariantStock(p.id, v.id, Number(e.target.value))}
                        aria-label={`Stock for ${v.sku}`}
                        className={`w-20 text-right font-mono tabular-nums px-2 py-1 border text-xs ${
                          v.stock <= 5
                            ? 'border-[#9E2A2B] bg-[#FDF2F2] text-[#9E2A2B]'
                            : 'border-[#D9D0C2] bg-[#F7F4EE] text-[#171717]'
                        }`}
                      />
                    </td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (activeModule === 'orders') {
    const statuses: OrderStatus[] = [
      'confirmed',
      'packed',
      'shipped',
      'out_for_delivery',
      'delivered',
      'cancelled',
      'return_requested',
    ];
    return (
      <div className="space-y-6">
        <h2 className="font-editorial text-3xl text-[#171717]">Order Management ({orders.length})</h2>
        <div className="bg-white border border-[#E9E1D5] overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#E9E1D5] bg-[#FAF8F4] text-[11px] uppercase tracking-[0.12em] text-[#85817B]">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E1D5]">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="py-3 px-4 font-mono text-xs font-medium text-[#171717]">
                    {o.orderNumber}
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-[#171717] font-medium">{o.customerName}</p>
                    <p className="text-xs text-[#85817B]">
                      {o.shippingAddress.city} ({o.shippingAddress.pincode})
                    </p>
                  </td>
                  <td className="py-3 px-4 text-xs uppercase text-[#55524E]">
                    {o.payment.method} · {o.payment.mode}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-medium">
                    {formatINR(o.total)}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={o.status}
                      onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                      aria-label={`Status for order ${o.orderNumber}`}
                      className="bg-[#F7F4EE] border border-[#D9D0C2] px-2.5 py-1.5 text-xs uppercase"
                    >
                      {statuses.map((st) => (
                        <option key={st} value={st}>
                          {st.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (activeModule === 'customers') {
    const customers = users.filter((u) => u.role === 'customer');
    return (
      <div className="space-y-6">
        <h2 className="font-editorial text-3xl text-[#171717]">Customer Directory ({customers.length})</h2>
        <div className="bg-white border border-[#E9E1D5] overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#E9E1D5] bg-[#FAF8F4] text-[11px] uppercase tracking-[0.12em] text-[#85817B]">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4 text-right">Orders</th>
                <th className="py-3 px-4 text-right">Lifetime Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E1D5]">
              {customers.map((u) => {
                const userOrders = orders.filter((o) => o.userId === u.id);
                const spend = userOrders.reduce((s, o) => s + o.total, 0);
                return (
                  <tr key={u.id}>
                    <td className="py-3 px-4">
                      <p className="font-medium text-[#171717]">{u.name}</p>
                      <p className="text-xs text-[#85817B]">{u.email}</p>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">+91 {u.phone}</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">{userOrders.length}</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">{formatINR(spend)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (activeModule === 'coupons') {
    const handleAddCoupon = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newCoupon.code.trim()) return;
      upsertCoupon({
        id: `cpn-${Date.now()}`,
        code: newCoupon.code.trim().toUpperCase(),
        description: newCoupon.description.trim() || 'Promotional code',
        type: newCoupon.type,
        value: Number(newCoupon.value) || 10,
        minOrderValue: Number(newCoupon.minOrderValue) || 0,
        active: true,
        expiresAt: '2027-12-31',
        usageCount: 0,
      });
      setNewCoupon({ code: '', description: '', type: 'percentage', value: 10, minOrderValue: 3000 });
    };

    return (
      <div className="space-y-6">
        <h2 className="font-editorial text-3xl text-[#171717]">Discounts & Coupons</h2>
        <form onSubmit={handleAddCoupon} className="bg-white border border-[#E9E1D5] p-5 grid sm:grid-cols-5 gap-3">
          <input
            required
            placeholder="Code (e.g. FESTIVE15)"
            value={newCoupon.code}
            onChange={(e) => setNewCoupon((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
            className="bg-[#F7F4EE] border border-[#D9D0C2] px-3 py-2 text-xs font-mono uppercase"
          />
          <input
            placeholder="Description"
            value={newCoupon.description}
            onChange={(e) => setNewCoupon((p) => ({ ...p, description: e.target.value }))}
            className="sm:col-span-2 bg-[#F7F4EE] border border-[#D9D0C2] px-3 py-2 text-xs"
          />
          <input
            type="number"
            placeholder="Value"
            value={newCoupon.value}
            onChange={(e) => setNewCoupon((p) => ({ ...p, value: Number(e.target.value) }))}
            className="bg-[#F7F4EE] border border-[#D9D0C2] px-3 py-2 text-xs tabular-nums"
          />
          <button
            type="submit"
            className="bg-[#171717] text-white text-xs tracking-[0.14em] uppercase px-4 py-2"
          >
            Create
          </button>
        </form>

        <div className="bg-white border border-[#E9E1D5] divide-y divide-[#E9E1D5]">
          {coupons.map((c) => (
            <div key={c.id} className="p-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-mono text-sm font-semibold text-[#171717]">{c.code}</p>
                <p className="text-xs text-[#85817B]">
                  {c.description} · Min order {formatINR(c.minOrderValue)} · Used {c.usageCount} times
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleCouponActive(c.id)}
                className={`px-3.5 py-1.5 text-xs uppercase tracking-[0.12em] border ${
                  c.active
                    ? 'bg-[#171717] text-white border-[#171717]'
                    : 'bg-white text-[#85817B] border-[#D9D0C2]'
                }`}
              >
                {c.active ? 'Active' : 'Paused'}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeModule === 'banners') {
    return (
      <div className="space-y-6">
        <h2 className="font-editorial text-3xl text-[#171717]">Promotional Banners</h2>
        <div className="space-y-4">
          {banners.map((b) => (
            <div key={b.id} className="bg-white border border-[#E9E1D5] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.14em] text-[#C5A46D] font-medium">
                  Placement: {b.placement}
                </span>
                <label className="inline-flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={b.active}
                    onChange={(e) => updateBanner({ ...b, active: e.target.checked })}
                    className="accent-[#171717]"
                  />
                  <span>Active</span>
                </label>
              </div>
              <input
                type="text"
                value={b.title}
                onChange={(e) => updateBanner({ ...b, title: e.target.value })}
                aria-label="Banner headline"
                className="w-full bg-[#F7F4EE] border border-[#D9D0C2] px-3 py-2 text-sm"
              />
              <input
                type="text"
                value={b.subtitle}
                onChange={(e) => updateBanner({ ...b, subtitle: e.target.value })}
                aria-label="Banner subtitle"
                className="w-full bg-[#F7F4EE] border border-[#D9D0C2] px-3 py-2 text-xs"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeModule === 'homepage') {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateHomepageConfig(cmsDraft);
        }}
        className="bg-white border border-[#E9E1D5] p-6 space-y-4 max-w-3xl"
      >
        <h2 className="font-editorial text-3xl text-[#171717]">Homepage Content Management</h2>
        {(
          [
            ['announcementText', 'Announcement Bar Text'],
            ['heroEyebrow', 'Hero Eyebrow'],
            ['heroHeadline', 'Hero Headline'],
            ['heroSubheadline', 'Hero Supporting Copy'],
            ['editorialTitle', 'Editorial Section Title'],
            ['brandStoryTitle', 'Brand Story Title'],
          ] as const
        ).map(([field, label]) => (
          <div key={field}>
            <label htmlFor={`cms-${field}`} className="block text-xs uppercase tracking-[0.12em] text-[#85817B] mb-1">
              {label}
            </label>
            <input
              id={`cms-${field}`}
              type="text"
              value={cmsDraft[field]}
              onChange={(e) => setCmsDraft((p) => ({ ...p, [field]: e.target.value }))}
              className="w-full bg-[#F7F4EE] border border-[#D9D0C2] px-3.5 py-2.5 text-sm"
            />
          </div>
        ))}
        <button
          type="submit"
          className="px-6 py-3 bg-[#171717] text-white text-xs tracking-[0.16em] uppercase"
        >
          Publish Homepage Changes
        </button>
      </form>
    );
  }

  if (activeModule === 'reviews') {
    return (
      <div className="space-y-6">
        <h2 className="font-editorial text-3xl text-[#171717]">Reviews & Moderation ({reviews.length})</h2>
        <div className="bg-white border border-[#E9E1D5] divide-y divide-[#E9E1D5]">
          {reviews.map((rev) => (
            <div key={rev.id} className="p-5 flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-xl">
                <p className="text-sm font-medium text-[#171717]">
                  {rev.title} · <span className="font-mono">{rev.rating}/5</span>
                </p>
                <p className="text-xs text-[#55524E] mt-1">{rev.comment}</p>
                <p className="text-[11px] text-[#85817B] mt-1.5">
                  {rev.authorName} ({rev.city}) · Status: {rev.status}
                </p>
              </div>
              <div className="flex gap-2">
                {(['approved', 'pending', 'rejected'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => moderateReview(rev.id, st)}
                    className={`px-3 py-1.5 text-xs uppercase border ${
                      rev.status === st
                        ? 'bg-[#171717] text-white border-[#171717]'
                        : 'border-[#D9D0C2] text-[#55524E]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeModule === 'returns') {
    const statuses: ReturnRequest['status'][] = [
      'requested',
      'approved',
      'pickup_scheduled',
      'refunded',
      'rejected',
    ];
    return (
      <div className="space-y-6">
        <h2 className="font-editorial text-3xl text-[#171717]">Returns & Refunds ({returns.length})</h2>
        {returns.length === 0 ? (
          <div className="bg-white border border-[#E9E1D5] p-8 text-sm text-[#85817B]">
            No return requests submitted yet. Customer return requests initiated from Account → Orders appear here.
          </div>
        ) : (
          <div className="bg-white border border-[#E9E1D5] divide-y divide-[#E9E1D5]">
            {returns.map((r) => (
              <div key={r.id} className="p-5 flex flex-wrap items-center justify-between gap-4 text-sm">
                <div>
                  <p className="font-mono font-medium text-[#171717]">{r.orderNumber}</p>
                  <p className="text-xs text-[#85817B]">
                    {r.customerName} · {r.reason} · {formatINR(r.refundAmount)}
                  </p>
                </div>
                <select
                  value={r.status}
                  onChange={(e) => updateReturnStatus(r.id, e.target.value as ReturnRequest['status'])}
                  className="bg-[#F7F4EE] border border-[#D9D0C2] px-3 py-1.5 text-xs uppercase"
                >
                  {statuses.map((st) => (
                    <option key={st} value={st}>
                      {st.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (activeModule === 'shipping') {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateShippingConfig(shipDraft);
        }}
        className="bg-white border border-[#E9E1D5] p-6 space-y-4 max-w-2xl"
      >
        <h2 className="font-editorial text-3xl text-[#171717]">India Shipping Configuration</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {(
            [
              ['freeShippingThreshold', 'Free Shipping Threshold (₹)'],
              ['standardFee', 'Standard Delivery Fee (₹)'],
              ['expressFee', 'Express Air Fee (₹)'],
              ['priorityFee', 'Priority / Gift Fee (₹)'],
              ['codFee', 'COD Handling Fee (₹)'],
              ['codMaxOrderValue', 'COD Max Order Value (₹)'],
            ] as const
          ).map(([k, label]) => (
            <div key={k}>
              <label htmlFor={`ship-${k}`} className="block text-xs uppercase tracking-[0.12em] text-[#85817B] mb-1">
                {label}
              </label>
              <input
                id={`ship-${k}`}
                type="number"
                value={shipDraft[k]}
                onChange={(e) => setShipDraft((p) => ({ ...p, [k]: Number(e.target.value) }))}
                className="w-full bg-[#F7F4EE] border border-[#D9D0C2] px-3 py-2 text-sm font-mono tabular-nums"
              />
            </div>
          ))}
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-[#171717] text-white text-xs tracking-[0.14em] uppercase"
        >
          Save Shipping Rules
        </button>
      </form>
    );
  }

  if (activeModule === 'payments') {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updatePaymentConfig(payDraft);
        }}
        className="bg-white border border-[#E9E1D5] p-6 space-y-5 max-w-2xl"
      >
        <h2 className="font-editorial text-3xl text-[#171717]">Payment & GST Configuration</h2>
        <p className="text-xs text-[#85817B]">
          Current Gateway Adapter: <span className="font-mono text-[#171717]">{integrationStatus.paymentGateway}</span>.
          Live Razorpay transactions require server-side secret keys configured in environment variables.
        </p>

        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          {(
            [
              ['upiEnabled', 'UPI (GPay, PhonePe, Paytm)'],
              ['cardsEnabled', 'Credit & Debit Cards'],
              ['netBankingEnabled', 'Indian Net Banking'],
              ['walletsEnabled', 'Digital Wallets'],
              ['codEnabled', 'Cash on Delivery (COD)'],
            ] as const
          ).map(([k, label]) => (
            <label key={k} className="flex items-center gap-2.5 p-3 bg-[#F7F4EE] border border-[#E9E1D5] cursor-pointer">
              <input
                type="checkbox"
                checked={payDraft[k]}
                onChange={(e) => setPayDraft((p) => ({ ...p, [k]: e.target.checked }))}
                className="accent-[#171717]"
              />
              <span>{label}</span>
            </label>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="pay-gstin" className="block text-xs uppercase tracking-[0.12em] text-[#85817B] mb-1">
              Seller GSTIN
            </label>
            <input
              id="pay-gstin"
              type="text"
              value={payDraft.sellerGstin}
              onChange={(e) => setPayDraft((p) => ({ ...p, sellerGstin: e.target.value.toUpperCase() }))}
              className="w-full bg-[#F7F4EE] border border-[#D9D0C2] px-3 py-2 text-sm font-mono uppercase"
            />
          </div>
          <div>
            <label htmlFor="pay-state" className="block text-xs uppercase tracking-[0.12em] text-[#85817B] mb-1">
              Registered GST State
            </label>
            <input
              id="pay-state"
              type="text"
              value={payDraft.gstRegisteredState}
              onChange={(e) => setPayDraft((p) => ({ ...p, gstRegisteredState: e.target.value }))}
              className="w-full bg-[#F7F4EE] border border-[#D9D0C2] px-3 py-2 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-[#171717] text-white text-xs tracking-[0.14em] uppercase"
        >
          Save Payment Settings
        </button>
      </form>
    );
  }

  if (activeModule === 'analytics') {
    const byPayment = ['upi', 'card', 'netbanking', 'wallet', 'cod'].map((method) => {
      const subset = orders.filter((o) => o.payment.method === method && o.status !== 'cancelled');
      return {
        method: method.toUpperCase(),
        count: subset.length,
        total: subset.reduce((s, o) => s + o.total, 0),
      };
    });
    const totalGstCollected = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((s, o) => s + o.gstAmount, 0);

    return (
      <div className="space-y-6">
        <h2 className="font-editorial text-3xl text-[#171717]">Sales & GST Analytics</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white border border-[#E9E1D5] p-5">
            <p className="text-xs uppercase tracking-[0.12em] text-[#85817B]">Gross Demo Revenue</p>
            <p className="mt-2 font-mono text-2xl tabular-nums">{formatINR(metrics.totalSales)}</p>
          </div>
          <div className="bg-white border border-[#E9E1D5] p-5">
            <p className="text-xs uppercase tracking-[0.12em] text-[#85817B]">GST Component Recorded</p>
            <p className="mt-2 font-mono text-2xl tabular-nums">{formatINR(totalGstCollected)}</p>
          </div>
          <div className="bg-white border border-[#E9E1D5] p-5">
            <p className="text-xs uppercase tracking-[0.12em] text-[#85817B]">Active Catalog SKUs</p>
            <p className="mt-2 font-mono text-2xl tabular-nums">
              {products.reduce((s, p) => s + p.variants.length, 0)}
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E9E1D5] p-6">
          <h3 className="font-editorial text-2xl text-[#171717] mb-4">Payment Method Mix</h3>
          <div className="divide-y divide-[#E9E1D5] text-sm">
            {byPayment.map((row) => (
              <div key={row.method} className="py-3 flex items-center justify-between">
                <span className="font-mono text-xs">{row.method}</span>
                <span className="font-mono tabular-nums text-xs text-[#55524E]">
                  {row.count} orders · {formatINR(row.total)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Roles & Integration Readiness
  const roles: UserRole[] = ['customer', 'merchandiser', 'operations', 'admin'];
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="font-editorial text-3xl text-[#171717]">User & Role Management</h2>
        <div className="bg-white border border-[#E9E1D5] overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#E9E1D5] bg-[#FAF8F4] text-[11px] uppercase tracking-[0.12em] text-[#85817B]">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E1D5]">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="py-3 px-4 font-medium text-[#171717]">{u.name}</td>
                  <td className="py-3 px-4 text-xs text-[#55524E]">{u.email}</td>
                  <td className="py-3 px-4">
                    <select
                      value={u.role}
                      onChange={(e) => updateUserRole(u.id, e.target.value as UserRole)}
                      aria-label={`Role for ${u.name}`}
                      className="bg-[#F7F4EE] border border-[#D9D0C2] px-2.5 py-1.5 text-xs uppercase"
                    >
                      {roles.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Backend Provider Status */}
      <div className="bg-white border border-[#E9E1D5] p-6 space-y-3">
        <h3 className="font-editorial text-2xl text-[#171717]">Backend Integration Status</h3>
        <dl className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {Object.entries(integrationStatus).map(([k, v]) => (
            <div key={k} className="p-3 bg-[#F7F4EE] border border-[#E9E1D5]">
              <dt className="uppercase tracking-[0.12em] text-[#85817B]">{k}</dt>
              <dd className="mt-1 font-mono text-[#171717]">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
