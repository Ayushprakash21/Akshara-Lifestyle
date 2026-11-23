import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Minus, Plus, ShoppingBag, Tag, Trash2, X } from 'lucide-react';
import { useCommerce } from '../store/CommerceContext';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { formatINR } from '../utils/commerceLogic';
import { SafeImage } from '../components/SafeImage';

export function CartPage() {
  const {
    cart,
    products,
    coupons,
    cartTotals,
    appliedCouponCode,
    updateCartQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
  } = useCommerce();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  useDocumentMeta({ title: 'Shopping Bag' });

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const res = applyCoupon(couponInput);
    setCouponFeedback(res);
    if (res.ok) setCouponInput('');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-24 text-center">
        <ShoppingBag className="w-10 h-10 text-[#85817B] mx-auto" strokeWidth={1.25} />
        <h1 className="mt-5 font-editorial text-4xl text-[#171717]">Your shopping bag is empty</h1>
        <p className="mt-3 text-sm text-[#85817B]">
          Discover contemporary essentials across our six curated departments.
        </p>
        <Link
          to="/shop"
          className="mt-7 inline-flex items-center gap-2 px-7 py-3.5 bg-[#171717] text-white text-xs tracking-[0.16em] uppercase hover:bg-[#0B0B0B] transition-colors"
        >
          Continue Shopping
          <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E9E1D5]">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#85817B]">Order Review</p>
          <h1 className="mt-1.5 font-editorial text-4xl text-[#171717]">Shopping Bag</h1>
        </div>
        <Link
          to="/shop"
          className="text-xs tracking-[0.14em] uppercase text-[#171717] hover:text-[#9A7A45] underline underline-offset-4"
        >
          Continue Shopping
        </Link>
      </div>

      <div className="mt-10 grid lg:grid-cols-12 gap-10 items-start">
        {/* Line items */}
        <div className="lg:col-span-8 bg-white border border-[#E9E1D5] divide-y divide-[#E9E1D5]">
          {cart.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            if (!product) return null;
            const variant =
              product.variants.find((v) => v.id === item.variantId) ?? product.variants[0];
            const unitPrice = product.price + (variant?.priceDelta ?? 0);

            return (
              <div key={item.id} className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5">
                <Link
                  to={`/product/${product.slug}`}
                  className="w-24 h-32 bg-[#E9E1D5] shrink-0 overflow-hidden"
                >
                  <SafeImage
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </Link>

                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.12em] text-[#85817B]">
                        {product.brandName}
                      </p>
                      <Link
                        to={`/product/${product.slug}`}
                        className="mt-0.5 text-base font-medium text-[#171717] hover:text-[#9A7A45]"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-1 text-xs text-[#85817B]">
                        Colour: {variant?.colorName}
                        {variant?.size ? ` · Size: ${variant.size}` : ''} · SKU:{' '}
                        <span className="font-mono">{variant?.sku ?? product.sku}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      aria-label={`Remove ${product.name}`}
                      className="text-[#85817B] hover:text-[#9E2A2B] p-1"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>

                  <div className="mt-auto pt-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="inline-flex items-center border border-[#D9D0C2] bg-[#F7F4EE]">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        aria-label={`Decrease quantity for ${product.name}`}
                        className="w-9 h-9 flex items-center justify-center hover:bg-white"
                      >
                        <Minus className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                      <span className="w-10 text-center text-sm font-medium tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        aria-label={`Increase quantity for ${product.name}`}
                        className="w-9 h-9 flex items-center justify-center hover:bg-white"
                      >
                        <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                    </div>

                    <div className="text-right tabular-nums">
                      <p className="text-base font-semibold text-[#171717]">
                        {formatINR(unitPrice * item.quantity)}
                      </p>
                      {product.originalPrice > unitPrice && (
                        <p className="text-xs text-[#85817B] line-through">
                          {formatINR(product.originalPrice * item.quantity)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary & Coupon Sidebar */}
        <aside className="lg:col-span-4 bg-white border border-[#E9E1D5] p-6 space-y-6">
          <h2 className="font-editorial text-2xl text-[#171717]">Order Summary</h2>

          {/* Coupon Form */}
          <div className="space-y-2.5">
            <label
              htmlFor="cart-coupon"
              className="flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-[#85817B]"
            >
              <Tag className="w-3.5 h-3.5 text-[#C5A46D]" strokeWidth={1.5} />
              Privilege Code
            </label>
            {appliedCouponCode ? (
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#F7F4EE] border border-[#C5A46D]">
                <span className="font-mono text-xs font-medium text-[#171717]">
                  {appliedCouponCode} applied
                </span>
                <button
                  type="button"
                  onClick={() => {
                    removeCoupon();
                    setCouponFeedback(null);
                  }}
                  aria-label="Remove applied coupon"
                  className="text-[#85817B] hover:text-[#171717]"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  id="cart-coupon"
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Enter code (e.g. AKSHARA10)"
                  className="flex-1 bg-[#F7F4EE] border border-[#D9D0C2] px-3 py-2 text-xs font-mono uppercase text-[#171717] focus:border-[#171717] focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#171717] text-white text-xs tracking-[0.12em] uppercase"
                >
                  Apply
                </button>
              </form>
            )}
            {couponFeedback && !couponFeedback.ok && (
              <p className="text-xs text-[#9E2A2B]">{couponFeedback.message}</p>
            )}
            <div className="text-[11px] text-[#85817B] space-y-1 pt-1">
              {coupons
                .filter((c) => c.active)
                .slice(0, 2)
                .map((c) => (
                  <p key={c.id}>
                    <span className="font-mono text-[#171717]">{c.code}</span>: {c.description}
                  </p>
                ))}
            </div>
          </div>

          {/* Pricing Breakdown */}
          <dl className="space-y-3 pt-4 border-t border-[#E9E1D5] text-sm tabular-nums">
            <div className="flex justify-between">
              <dt className="text-[#85817B]">Bag MRP Total</dt>
              <dd className="text-[#171717]">{formatINR(cartTotals.mrpTotal)}</dd>
            </div>
            {cartTotals.productSavings > 0 && (
              <div className="flex justify-between text-[#2D6A4F]">
                <dt>Offer Savings</dt>
                <dd>−{formatINR(cartTotals.productSavings)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-[#85817B]">Subtotal (incl. GST)</dt>
              <dd className="text-[#171717]">{formatINR(cartTotals.subtotal)}</dd>
            </div>
            {cartTotals.couponDiscount > 0 && (
              <div className="flex justify-between text-[#9A7A45]">
                <dt>Coupon ({appliedCouponCode})</dt>
                <dd>−{formatINR(cartTotals.couponDiscount)}</dd>
              </div>
            )}
            <div className="flex justify-between text-xs text-[#85817B]">
              <dt>Included Indian GST Component</dt>
              <dd>{formatINR(cartTotals.gstAmount)}</dd>
            </div>
            <div className="pt-3 border-t border-[#E9E1D5] flex justify-between text-base font-semibold text-[#171717]">
              <dt>Estimated Total</dt>
              <dd>{formatINR(cartTotals.total)}</dd>
            </div>
          </dl>

          <p className="text-[12px] text-[#85817B]">
            Delivery is included in the product price.
          </p>

          <Link
            to="/checkout"
            className="w-full py-3.5 px-6 bg-[#171717] hover:bg-[#0B0B0B] text-white text-xs tracking-[0.16em] uppercase font-semibold inline-flex items-center justify-center gap-2 transition-colors"
          >
            Proceed to Checkout
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </Link>
        </aside>
      </div>
    </div>
  );
}
