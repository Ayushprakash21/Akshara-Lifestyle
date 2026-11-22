import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Plus, Star } from 'lucide-react';
import type { Product } from '../types/commerce';
import { useCommerce } from '../store/CommerceContext';
import {
  formatINR,
  getDiscountPercent,
  getProductRatingStats,
  getProductTotalStock,
} from '../utils/commerceLogic';
import { SafeImage } from './SafeImage';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { wishlist, toggleWishlist, addToCart, reviews } = useCommerce();
  const isWishlisted = wishlist.includes(product.id);
  const discount = getDiscountPercent(product.price, product.originalPrice);
  const totalStock = getProductTotalStock(product);
  const rating = getProductRatingStats(product.id, reviews);
  const primaryImage = product.images[0];
  const alternateImage = product.images[1];

  return (
    <article className="group flex flex-col">
      {/* 3:4 Gallery Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#E9E1D5]">
        <Link
          to={`/product/${product.slug}`}
          className="block w-full h-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C5A46D]"
        >
          <SafeImage
            src={primaryImage}
            alt={product.name}
            className={`w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03] ${
              alternateImage ? 'group-hover:opacity-0 transition-opacity duration-500' : ''
            }`}
          />
          {alternateImage && (
            <SafeImage
              src={alternateImage}
              alt={`${product.name} alternate view`}
              className="absolute inset-0 w-full h-full object-cover object-top opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out group-hover:scale-[1.03]"
            />
          )}
        </Link>

        {/* Single subtle editorial badge (no pill spam) */}
        {product.badge && (
          <span
            className={`pointer-events-none absolute top-3 left-3 px-2 py-0.5 text-[10px] tracking-[0.16em] font-medium uppercase ${
              product.badge === 'SALE'
                ? 'bg-[#171717] text-[#F7F4EE]'
                : 'bg-[#F7F4EE]/92 text-[#171717]'
            }`}
          >
            {product.badge}
          </span>
        )}

        {/* Wishlist toggle button */}
        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-label={
            isWishlisted
              ? `Remove ${product.name} from wishlist`
              : `Save ${product.name} to wishlist`
          }
          aria-pressed={isWishlisted}
          className="absolute top-2.5 right-2.5 w-9 h-9 flex items-center justify-center bg-[#F7F4EE]/85 hover:bg-white text-[#171717] transition-colors"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? 'fill-[#C5A46D] text-[#C5A46D]' : 'text-[#171717]'
            }`}
            strokeWidth={1.6}
          />
        </button>

        {/* Quick add button revealed gently on hover / visible on touch */}
        <div className="absolute inset-x-3 bottom-3 opacity-100 md:opacity-0 md:translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0 focus-within:opacity-100 focus-within:translate-y-0 transition-all duration-200">
          <button
            type="button"
            disabled={totalStock <= 0}
            onClick={() => addToCart(product.id, product.variants[0]?.id, 1, true)}
            aria-label={`Quick add ${product.name} to bag`}
            className="w-full py-2.5 px-3 bg-[#171717]/95 hover:bg-[#0B0B0B] disabled:bg-[#85817B] text-[#F7F4EE] text-xs tracking-[0.14em] uppercase font-medium flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={1.6} />
            {totalStock > 0 ? 'Quick Add' : 'Sold Out'}
          </button>
        </div>
      </div>

      {/* Product metadata — uniform baseline and clean typographic hierarchy */}
      <div className="pt-3.5 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 text-[11px] text-[#85817B]">
          <span className="tracking-[0.08em] uppercase truncate">{product.brandName}</span>
          {rating.count > 0 && (
            <span className="inline-flex items-center gap-1 text-[#171717] tabular-nums shrink-0">
              <Star className="w-3 h-3 fill-[#C5A46D] text-[#C5A46D]" strokeWidth={1.5} />
              <span>{rating.average.toFixed(1)}</span>
              <span className="text-[#85817B]">({rating.count})</span>
            </span>
          )}
        </div>

        <Link
          to={`/product/${product.slug}`}
          className="mt-1 text-[15px] font-medium text-[#171717] hover:text-[#C5A46D] transition-colors leading-snug line-clamp-2"
        >
          {product.name}
        </Link>

        {/* Price baseline */}
        <div className="mt-auto pt-2 flex items-baseline gap-2 tabular-nums">
          <span className="text-[15px] font-semibold text-[#171717]">
            {formatINR(product.price)}
          </span>
          {discount > 0 && (
            <>
              <span className="text-xs text-[#85817B] line-through">
                {formatINR(product.originalPrice)}
              </span>
              <span className="text-xs font-medium text-[#9A7A45]">
                {discount}% off
              </span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
