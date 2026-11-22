import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useCommerce } from '../store/CommerceContext';
import { formatINR } from '../utils/commerceLogic';
import { SafeImage } from './SafeImage';

export function CartDrawer() {
  const {
    isCartDrawerOpen,
    closeCartDrawer,
    cart,
    products,
    cartTotals,
    shippingConfig,
    updateCartQuantity,
    removeFromCart,
  } = useCommerce();

  if (!isCartDrawerOpen) return null;

  const freeShippingProgress = Math.min(
    100,
    Math.round(
      ((shippingConfig.freeShippingThreshold - cartTotals.freeShippingRemaining) /
        shippingConfig.freeShippingThreshold) *
        100,
    ),
  );

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag"
    >
      <div
        className="fixed inset-0 bg-[#0B0B0B]/50 backdrop-blur-[2px]"
        onClick={closeCartDrawer}
      />

      <aside className="relative z-10 w-full max-w-md bg-[#F7F4EE] h-full flex flex-col border-l border-[#E9E1D5] shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E9E1D5] flex items-center justify-between bg-white">
          <div>
            <h2 className="font-editorial text-2xl text-[#171717]">Shopping Bag</h2>
            <p className="text-xs text-[#85817B] tabular-nums">
              {cartTotals.itemCount} {cartTotals.itemCount === 1 ? 'item' : 'items'}
            </p>
          </div>
          <button
            type="button"
            onClick={closeCartDrawer}
            aria-label="Close shopping bag"
            className="p-2 text-[#171717] hover:text-[#9A7A45] transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Free shipping indicator */}
        {cart.length > 0 && (
          <div className="px-6 py-3 bg-[#E9E1D5]/55 border-b border-[#E9E1D5]">
            <p className="text-xs text-[#171717]">
              {cartTotals.freeShippingRemaining > 0 ? (
                <>
                  Add{' '}
                  <span className="font-semibold tabular-nums">
                    {formatINR(cartTotals.freeShippingRemaining)}
                  </span>{' '}
                  more for complimentary Pan-India delivery.
                </>
              ) : (
                'Complimentary Pan-India standard delivery unlocked.'
              )}
            </p>
            <div className="mt-2 h-1 w-full bg-[#D9D0C2] overflow-hidden">
              <div
                className="h-full bg-[#C5A46D] transition-all duration-300"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Items list */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <ShoppingBag className="w-9 h-9 text-[#85817B]" strokeWidth={1.25} />
              <p className="mt-4 font-editorial text-2xl text-[#171717]">
                Your bag is currently empty
              </p>
              <p className="mt-2 text-sm text-[#85817B] max-w-xs">
                Explore curated essentials across fashion, jewellery, beauty, décor, audio, and leather carry.
              </p>
              <Link
                to="/shop"
                onClick={closeCartDrawer}
                className="mt-6 px-6 py-3 bg-[#171717] text-white text-xs tracking-[0.14em] uppercase hover:bg-[#0B0B0B] transition-colors"
              >
                Explore Collection
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-[#E9E1D5]">
              {cart.map((item) => {
                const product = products.find((p) => p.id === item.productId);
                if (!product) return null;
                const variant =
                  product.variants.find((v) => v.id === item.variantId) ?? product.variants[0];
                const unitPrice = product.price + (variant?.priceDelta ?? 0);

                return (
                  <li key={item.id} className="py-4 first:pt-0 flex gap-4">
                    <Link
                      to={`/product/${product.slug}`}
                      onClick={closeCartDrawer}
                      className="w-20 h-24 bg-[#E9E1D5] shrink-0 overflow-hidden"
                    >
                      <SafeImage
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/product/${product.slug}`}
                          onClick={closeCartDrawer}
                          className="text-sm font-medium text-[#171717] hover:text-[#9A7A45] line-clamp-2 leading-snug"
                        >
                          {product.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          aria-label={`Remove ${product.name} from bag`}
                          className="text-[#85817B] hover:text-[#171717] p-0.5 shrink-0"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </div>

                      <p className="mt-1 text-xs text-[#85817B]">
                        {variant?.colorName}
                        {variant?.size ? ` · ${variant.size}` : ''}
                      </p>

                      <div className="mt-auto pt-3 flex items-center justify-between">
                        <div className="inline-flex items-center border border-[#D9D0C2] bg-white">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            aria-label={`Decrease quantity of ${product.name}`}
                            className="w-8 h-8 flex items-center justify-center text-[#171717] hover:bg-[#F7F4EE]"
                          >
                            <Minus className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </button>
                          <span className="w-8 text-center text-xs font-medium tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            aria-label={`Increase quantity of ${product.name}`}
                            className="w-8 h-8 flex items-center justify-center text-[#171717] hover:bg-[#F7F4EE]"
                          >
                            <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </button>
                        </div>

                        <span className="text-sm font-semibold text-[#171717] tabular-nums">
                          {formatINR(unitPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer totals & CTAs */}
        {cart.length > 0 && (
          <div className="p-6 bg-white border-t border-[#E9E1D5] space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#85817B]">Subtotal (incl. GST)</span>
              <span className="font-semibold text-[#171717] tabular-nums">
                {formatINR(cartTotals.subtotal)}
              </span>
            </div>
            {cartTotals.couponDiscount > 0 && (
              <div className="flex items-center justify-between text-xs text-[#9A7A45]">
                <span>Coupon Savings</span>
                <span className="tabular-nums">−{formatINR(cartTotals.couponDiscount)}</span>
              </div>
            )}
            <p className="text-[11px] text-[#85817B]">
              Shipping & optional COD fees calculated at checkout.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <Link
                to="/cart"
                onClick={closeCartDrawer}
                className="py-3 px-4 text-center border border-[#171717] text-[#171717] hover:bg-[#F7F4EE] text-xs tracking-[0.12em] uppercase font-medium transition-colors whitespace-nowrap"
              >
                View Bag
              </Link>
              <Link
                to="/checkout"
                onClick={closeCartDrawer}
                className="py-3 px-4 text-center bg-[#171717] hover:bg-[#0B0B0B] text-white text-xs tracking-[0.12em] uppercase font-medium transition-colors whitespace-nowrap"
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
