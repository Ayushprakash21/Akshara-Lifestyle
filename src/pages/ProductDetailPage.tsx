import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Check,
  ChevronDown,
  Heart,
  MapPin,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  Star,
  Truck,
  X,
  ZoomIn,
} from 'lucide-react';
import { useCommerce } from '../store/CommerceContext';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import {
  checkPincodeServiceability,
  formatINR,
  getDiscountPercent,
  getProductRatingStats,
} from '../utils/commerceLogic';
import type { PincodeServiceability } from '../types/commerce';
import { ProductCard } from '../components/ProductCard';
import { SafeImage } from '../components/SafeImage';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const {
    products,
    categories,
    reviews,
    wishlist,
    recentlyViewed,
    currentUser,
    addToCart,
    toggleWishlist,
    recordRecentlyViewed,
    submitReview,
  } = useCommerce();

  const product = useMemo(() => products.find((p) => p.slug === slug), [products, slug]);
  const category = useMemo(
    () => categories.find((c) => c.slug === product?.categorySlug),
    [categories, product?.categorySlug],
  );

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState<PincodeServiceability | null>(null);
  const [openAccordion, setOpenAccordion] = useState<'specs' | 'shipping' | null>('specs');

  // Review form state
  const [reviewName, setReviewName] = useState(currentUser?.name ?? '');
  const [reviewCity, setReviewCity] = useState(currentUser?.addresses[0]?.city ?? '');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    if (product) {
      setSelectedImageIdx(0);
      setSelectedVariantId(
        product.variants.find((v) => v.stock > 0)?.id ?? product.variants[0]?.id ?? '',
      );
      setQuantity(1);
      setPincodeResult(null);
      recordRecentlyViewed(product.id);
    }
  }, [product?.id, recordRecentlyViewed]);

  const selectedVariant = useMemo(() => {
    if (!product) return undefined;
    return product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0];
  }, [product, selectedVariantId]);

  const productReviews = useMemo(
    () =>
      product
        ? reviews.filter((r) => r.productId === product.id && r.status === 'approved')
        : [],
    [reviews, product],
  );

  const ratingStats = useMemo(
    () => (product ? getProductRatingStats(product.id, reviews) : { average: 0, count: 0 }),
    [product, reviews],
  );

  const unitPrice = product ? product.price + (selectedVariant?.priceDelta ?? 0) : 0;
  const discount = product ? getDiscountPercent(unitPrice, product.originalPrice) : 0;

  useDocumentMeta({
    title: product ? product.name : 'Piece Not Found',
    description: product?.shortDescription,
    structuredData: product
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          sku: product.sku,
          brand: { '@type': 'Brand', name: product.brandName },
          description: product.description,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'INR',
            price: unitPrice,
            availability:
              (selectedVariant?.stock ?? 0) > 0
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
          },
        }
      : null,
  });

  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center">
        <h1 className="font-editorial text-4xl text-[#171717]">Piece not found</h1>
        <p className="mt-3 text-sm text-[#85817B]">
          This item may have been archived or moved to a seasonal collection.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-block px-6 py-3 bg-[#171717] text-white text-xs tracking-[0.14em] uppercase"
        >
          Browse All Collections
        </Link>
      </div>
    );
  }

  const isWishlisted = wishlist.includes(product.id);
  const stockCount = selectedVariant?.stock ?? 0;

  const uniqueColors = Array.from(
    new Map(product.variants.map((v) => [v.colorName, v])).values(),
  );
  const sizesForColor = product.variants.filter(
    (v) => v.colorName === selectedVariant?.colorName && v.size,
  );

  const relatedProducts = products
    .filter((p) => p.status === 'active' && p.id !== product.id && p.categorySlug === product.categorySlug)
    .slice(0, 4);

  const recentlyViewedProducts = recentlyViewed
    .filter((id) => id !== product.id)
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .slice(0, 4);

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    setPincodeResult(checkPincodeServiceability(pincode, product.codEligible));
  };

  const handleBuyNow = () => {
    addToCart(product.id, selectedVariant?.id, quantity, false);
    navigate('/checkout');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewTitle.trim() || reviewComment.trim().length < 10) {
      setReviewError('Please provide your name, a headline, and at least 10 characters of feedback.');
      return;
    }
    submitReview({
      productId: product.id,
      authorName: reviewName,
      city: reviewCity,
      rating: reviewRating,
      title: reviewTitle,
      comment: reviewComment,
    });
    setReviewTitle('');
    setReviewComment('');
    setReviewError('');
  };

  return (
    <div className="pb-20 lg:pb-16">
      {/* Breadcrumb */}
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-10 py-5">
        <nav aria-label="Breadcrumb" className="text-xs text-[#85817B] flex flex-wrap items-center gap-2">
          <Link to="/" className="hover:text-[#171717]">
            Home
          </Link>
          <span>/</span>
          {category && (
            <>
              <Link to={`/category/${category.slug}`} className="hover:text-[#171717]">
                {category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-[#171717] truncate">{product.name}</span>
        </nav>
      </div>

      {/* Contiguous Gallery + Purchase Module */}
      <section className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-10 grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left: Sticky Multi-Image Gallery with Zoom */}
        <div className="lg:col-span-7 lg:sticky lg:top-24 space-y-4">
          <div className="relative aspect-[3/4] max-h-[760px] w-full bg-[#E9E1D5] overflow-hidden group">
            <SafeImage
              src={product.images[selectedImageIdx] ?? product.images[0]}
              alt={`${product.name} — view ${selectedImageIdx + 1}`}
              priority
              className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <button
              type="button"
              onClick={() => setZoomOpen(true)}
              aria-label="Zoom product photograph"
              className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#F7F4EE]/92 hover:bg-white text-[#171717] text-xs tracking-[0.1em] uppercase transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" strokeWidth={1.5} />
              Zoom
            </button>
          </div>

          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  type="button"
                  onClick={() => setSelectedImageIdx(idx)}
                  aria-label={`View image ${idx + 1} of ${product.name}`}
                  className={`w-20 h-24 shrink-0 overflow-hidden bg-[#E9E1D5] border-2 transition-colors ${
                    selectedImageIdx === idx ? 'border-[#171717]' : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <SafeImage src={img} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Contiguous Purchase Module */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center justify-between gap-2 text-xs text-[#85817B]">
              <span className="uppercase tracking-[0.16em]">{product.brandName}</span>
              <span className="font-mono text-[11px]">{selectedVariant?.sku ?? product.sku}</span>
            </div>

            <h1 className="mt-2 font-editorial text-3xl sm:text-4xl text-[#171717] leading-tight">
              {product.name}
            </h1>

            {ratingStats.count > 0 && (
              <a
                href="#customer-reviews"
                className="mt-2.5 inline-flex items-center gap-1.5 text-xs text-[#171717] hover:text-[#9A7A45]"
              >
                <Star className="w-3.5 h-3.5 fill-[#C5A46D] text-[#C5A46D]" strokeWidth={1.5} />
                <span className="font-semibold tabular-nums">{ratingStats.average.toFixed(1)}</span>
                <span className="text-[#85817B]">
                  ({ratingStats.count} {ratingStats.count === 1 ? 'review' : 'reviews'})
                </span>
              </a>
            )}

            {/* Price & Tax Note */}
            <div className="mt-5 flex items-baseline gap-3 tabular-nums">
              <span className="text-2xl font-semibold text-[#171717]">
                {formatINR(unitPrice)}
              </span>
              {discount > 0 && (
                <>
                  <span className="text-base text-[#85817B] line-through">
                    {formatINR(product.originalPrice)}
                  </span>
                  <span className="text-sm font-medium text-[#9A7A45]">Save {discount}%</span>
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-[#85817B]">
              Inclusive of all taxes ({product.gstRate}% GST · HSN {product.hsnCode})
            </p>
          </div>

          <p className="text-sm text-[#4A4743] leading-relaxed">{product.description}</p>

          {/* Colour Selector */}
          <div className="pt-4 border-t border-[#E9E1D5]">
            <p className="text-xs uppercase tracking-[0.14em] text-[#85817B]">
              Colour: <span className="text-[#171717] font-medium">{selectedVariant?.colorName}</span>
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2.5">
              {uniqueColors.map((v) => {
                const active = v.colorName === selectedVariant?.colorName;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariantId(v.id)}
                    aria-label={`Select colour ${v.colorName}`}
                    className={`inline-flex items-center gap-2 px-3 py-2 border text-xs transition-colors ${
                      active
                        ? 'border-[#171717] bg-white font-medium text-[#171717]'
                        : 'border-[#D9D0C2] bg-transparent text-[#55524E] hover:border-[#171717]'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 border border-black/15 shrink-0"
                      style={{ backgroundColor: v.colorHex }}
                    />
                    <span>{v.colorName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Selector */}
          {sizesForColor.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-[#85817B]">
                Size / Edition: <span className="text-[#171717] font-medium">{selectedVariant?.size}</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {sizesForColor.map((v) => {
                  const active = v.id === selectedVariant?.id;
                  const out = v.stock <= 0;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={out}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`min-w-[54px] px-4 py-2.5 border text-xs font-medium transition-colors ${
                        active
                          ? 'bg-[#171717] text-white border-[#171717]'
                          : out
                            ? 'border-[#E9E1D5] text-[#B5AFA6] line-through cursor-not-allowed'
                            : 'bg-white text-[#171717] border-[#D9D0C2] hover:border-[#171717]'
                      }`}
                    >
                      {v.size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock & Quantity */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="inline-flex items-center border border-[#D9D0C2] bg-white">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="w-10 h-11 flex items-center justify-center text-[#171717] hover:bg-[#F7F4EE]"
              >
                <Minus className="w-4 h-4" strokeWidth={1.5} />
              </button>
              <span className="w-12 text-center text-sm font-medium tabular-nums">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(Math.max(1, stockCount), q + 1))}
                aria-label="Increase quantity"
                className="w-10 h-11 flex items-center justify-center text-[#171717] hover:bg-[#F7F4EE]"
              >
                <Plus className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            <p className="text-xs font-medium">
              {stockCount > 5 ? (
                <span className="text-[#2D6A4F]">In Stock · Ready to dispatch</span>
              ) : stockCount > 0 ? (
                <span className="text-[#9A7A45]">Only {stockCount} left in stock</span>
              ) : (
                <span className="text-[#9E2A2B]">Currently out of stock</span>
              )}
            </p>
          </div>

          {/* Primary Purchase Actions */}
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                disabled={stockCount <= 0}
                onClick={() => addToCart(product.id, selectedVariant?.id, quantity, true)}
                className="py-3.5 px-6 bg-[#171717] hover:bg-[#0B0B0B] disabled:bg-[#85817B] text-white text-xs tracking-[0.16em] uppercase font-semibold transition-colors"
              >
                Add to Bag
              </button>
              <button
                type="button"
                disabled={stockCount <= 0}
                onClick={handleBuyNow}
                className="py-3.5 px-6 bg-[#C5A46D] hover:bg-[#B8955A] disabled:bg-[#D9D0C2] text-[#0B0B0B] text-xs tracking-[0.16em] uppercase font-semibold transition-colors"
              >
                Buy Now
              </button>
            </div>

            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              className="w-full py-3 px-4 border border-[#D9D0C2] hover:border-[#171717] bg-white text-xs tracking-[0.14em] uppercase text-[#171717] inline-flex items-center justify-center gap-2 transition-colors"
            >
              <Heart
                className={`w-4 h-4 ${isWishlisted ? 'fill-[#C5A46D] text-[#C5A46D]' : ''}`}
                strokeWidth={1.5}
              />
              {isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
            </button>
          </div>

          {/* India Delivery Pincode Checker */}
          <div className="p-5 bg-white border border-[#E9E1D5] space-y-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[#171717] font-medium">
              <MapPin className="w-4 h-4 text-[#C5A46D]" strokeWidth={1.5} />
              Check Indian Delivery & COD Availability
            </div>
            <form onSubmit={handleCheckPincode} className="flex gap-2">
              <label htmlFor="pdp-pincode" className="sr-only">
                6-digit Indian PIN code
              </label>
              <input
                id="pdp-pincode"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit PIN (e.g. 400001)"
                className="flex-1 bg-[#F7F4EE] border border-[#D9D0C2] px-3.5 py-2.5 text-sm text-[#171717] placeholder:text-[#85817B] focus:border-[#171717] focus:outline-none tabular-nums"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-[#171717] text-white text-xs tracking-[0.14em] uppercase hover:bg-[#0B0B0B] transition-colors"
              >
                Check
              </button>
            </form>

            {pincodeResult && (
              <div
                className={`text-xs leading-relaxed pt-1 ${
                  pincodeResult.serviceable ? 'text-[#171717]' : 'text-[#9E2A2B]'
                }`}
              >
                <p className="font-medium">{pincodeResult.message}</p>
                {pincodeResult.serviceable && (
                  <ul className="mt-1.5 space-y-1 text-[#55524E]">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#2D6A4F]" strokeWidth={1.8} />
                      Estimated delivery: <strong className="text-[#171717]">{pincodeResult.estimatedDateText}</strong>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#2D6A4F]" strokeWidth={1.8} />
                      Cash on Delivery: {pincodeResult.codAvailable ? 'Available' : 'Prepaid only for this PIN'}
                    </li>
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Accordion: Specifications & Shipping/Returns */}
          <div className="border-t border-[#E9E1D5] divide-y divide-[#E9E1D5]">
            <div>
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === 'specs' ? null : 'specs')}
                aria-expanded={openAccordion === 'specs'}
                className="w-full py-4 flex items-center justify-between text-xs uppercase tracking-[0.16em] font-medium text-[#171717]"
              >
                <span>Specifications & Craft</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${openAccordion === 'specs' ? 'rotate-180' : ''}`}
                  strokeWidth={1.5}
                />
              </button>
              {openAccordion === 'specs' && (
                <dl className="pb-5 space-y-2.5 text-sm">
                  {product.specifications.map((spec) => (
                    <div key={spec.label} className="grid grid-cols-3 gap-3">
                      <dt className="text-[#85817B]">{spec.label}</dt>
                      <dd className="col-span-2 text-[#171717]">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>

            <div>
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === 'shipping' ? null : 'shipping')}
                aria-expanded={openAccordion === 'shipping'}
                className="w-full py-4 flex items-center justify-between text-xs uppercase tracking-[0.16em] font-medium text-[#171717]"
              >
                <span>Shipping, GST & Returns</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${openAccordion === 'shipping' ? 'rotate-180' : ''}`}
                  strokeWidth={1.5}
                />
              </button>
              {openAccordion === 'shipping' && (
                <div className="pb-5 space-y-3 text-sm text-[#55524E]">
                  <p className="flex items-start gap-2.5">
                    <Truck className="w-4 h-4 text-[#C5A46D] shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span>{product.shippingNotes}</span>
                  </p>
                  <p className="flex items-start gap-2.5">
                    <RotateCcw className="w-4 h-4 text-[#C5A46D] shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span>
                      {product.returnPolicyDays}-day return or exchange window in original unused packaging.
                    </span>
                  </p>
                  <p className="flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#C5A46D] shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span>GST tax invoice issued automatically with optional B2B GSTIN support at checkout.</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section
        id="customer-reviews"
        className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-10 mt-20 pt-14 border-t border-[#E9E1D5]"
      >
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 space-y-5">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#85817B]">
              Client Perspectives
            </p>
            <h2 className="font-editorial text-3xl text-[#171717]">Customer Reviews</h2>
            {ratingStats.count > 0 ? (
              <div className="flex items-center gap-3">
                <span className="font-editorial text-4xl text-[#171717] tabular-nums">
                  {ratingStats.average.toFixed(1)}
                </span>
                <div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(ratingStats.average)
                            ? 'fill-[#C5A46D] text-[#C5A46D]'
                            : 'text-[#D9D0C2]'
                        }`}
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-[#85817B] mt-0.5">
                    Based on {ratingStats.count} published {ratingStats.count === 1 ? 'review' : 'reviews'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#85817B]">
                No reviews yet for this piece. Share your experience below once you have tried it.
              </p>
            )}

            {/* Write a review form */}
            <form
              onSubmit={handleReviewSubmit}
              className="bg-white border border-[#E9E1D5] p-6 space-y-4"
            >
              <h3 className="text-xs uppercase tracking-[0.16em] font-semibold text-[#171717]">
                Write a Review
              </h3>
              <div>
                <span className="block text-xs text-[#85817B] mb-1.5">Rating</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setReviewRating(n)}
                      aria-label={`Rate ${n} out of 5`}
                      className="p-1"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          n <= reviewRating ? 'fill-[#C5A46D] text-[#C5A46D]' : 'text-[#D9D0C2]'
                        }`}
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="rev-name" className="block text-xs text-[#85817B] mb-1">
                    Name
                  </label>
                  <input
                    id="rev-name"
                    type="text"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-[#F7F4EE] border border-[#D9D0C2] px-3 py-2 text-sm text-[#171717]"
                  />
                </div>
                <div>
                  <label htmlFor="rev-city" className="block text-xs text-[#85817B] mb-1">
                    City
                  </label>
                  <input
                    id="rev-city"
                    type="text"
                    value={reviewCity}
                    onChange={(e) => setReviewCity(e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="w-full bg-[#F7F4EE] border border-[#D9D0C2] px-3 py-2 text-sm text-[#171717]"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="rev-title" className="block text-xs text-[#85817B] mb-1">
                  Headline
                </label>
                <input
                  id="rev-title"
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="Summary of your impression"
                  className="w-full bg-[#F7F4EE] border border-[#D9D0C2] px-3 py-2 text-sm text-[#171717]"
                />
              </div>
              <div>
                <label htmlFor="rev-body" className="block text-xs text-[#85817B] mb-1">
                  Perspective
                </label>
                <textarea
                  id="rev-body"
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share notes on fit, finish, materials, or longevity"
                  className="w-full bg-[#F7F4EE] border border-[#D9D0C2] px-3 py-2 text-sm text-[#171717]"
                />
              </div>
              {reviewError && <p className="text-xs text-[#9E2A2B]">{reviewError}</p>}
              <button
                type="submit"
                className="w-full py-2.5 bg-[#171717] hover:bg-[#0B0B0B] text-white text-xs tracking-[0.14em] uppercase"
              >
                Publish Review
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-5">
            {productReviews.length === 0 ? (
              <div className="bg-white border border-[#E9E1D5] p-8 text-sm text-[#85817B]">
                Reviews are published exclusively from real client submissions—we do not display fabricated ratings.
              </div>
            ) : (
              productReviews.map((rev) => (
                <article key={rev.id} className="bg-white border border-[#E9E1D5] p-6">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`w-3.5 h-3.5 ${
                            n <= rev.rating ? 'fill-[#C5A46D] text-[#C5A46D]' : 'text-[#D9D0C2]'
                          }`}
                          strokeWidth={1.5}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-[#85817B]">
                      {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <h3 className="mt-2.5 text-base font-medium text-[#171717]">{rev.title}</h3>
                  <p className="mt-1.5 text-sm text-[#55524E] leading-relaxed">{rev.comment}</p>
                  <p className="mt-3 text-xs text-[#85817B]">
                    {rev.authorName} · {rev.city}
                    {rev.verifiedPurchase ? ' · Verified Client' : ''}
                  </p>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-10 mt-20 pt-14 border-t border-[#E9E1D5]">
          <h2 className="font-editorial text-3xl text-[#171717] mb-8">Related Pieces</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed Products */}
      {recentlyViewedProducts.length > 0 && (
        <section className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-10 mt-16 pt-12 border-t border-[#E9E1D5]">
          <h2 className="font-editorial text-3xl text-[#171717] mb-8">Recently Viewed</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
            {recentlyViewedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile Sticky Quick Purchase Bar (compact <= 64px) */}
      <div className="fixed bottom-0 inset-x-0 z-30 lg:hidden bg-white border-t border-[#E9E1D5] px-4 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-[#85817B] truncate">{product.name}</p>
          <p className="text-sm font-semibold text-[#171717] tabular-nums">{formatINR(unitPrice)}</p>
        </div>
        <button
          type="button"
          disabled={stockCount <= 0}
          onClick={() => addToCart(product.id, selectedVariant?.id, quantity, true)}
          className="px-5 py-2.5 bg-[#171717] text-white text-xs tracking-[0.14em] uppercase font-medium shrink-0"
        >
          Add to Bag
        </button>
      </div>

      {/* High-Resolution Image Zoom Modal */}
      {zoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#0B0B0B]/90 flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Zoomed product photograph"
          onClick={() => setZoomOpen(false)}
        >
          <button
            type="button"
            onClick={() => setZoomOpen(false)}
            aria-label="Close zoom view"
            className="absolute top-5 right-5 p-2.5 bg-white/10 hover:bg-white/20 text-white"
          >
            <X className="w-6 h-6" strokeWidth={1.5} />
          </button>
          <div
            className="max-w-3xl max-h-[88vh] overflow-hidden bg-[#E9E1D5]"
            onClick={(e) => e.stopPropagation()}
          >
            <SafeImage
              src={product.images[selectedImageIdx] ?? product.images[0]}
              alt={product.name}
              className="w-full h-full max-h-[88vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
