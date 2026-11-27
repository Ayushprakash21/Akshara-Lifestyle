import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Lock, ShieldCheck, Star, UserCheck } from 'lucide-react';
import { useCommerce } from '../store/CommerceContext';
import {
  filterAndSortReviews,
  getProductRatingStats,
  getRatingDistribution,
  validateProductReview,
  type ReviewSortOption,
} from '../utils/commerceLogic';
import type { Product } from '../types/commerce';

const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Exceptional',
};

interface ProductReviewsSectionProps {
  product: Product;
}

export function ProductReviewsSection({ product }: ProductReviewsSectionProps) {
  const { reviews, orders, currentUser, submitReview } = useCommerce();

  const approvedReviews = useMemo(
    () => reviews.filter((r) => r.productId === product.id && r.status === 'approved'),
    [reviews, product.id],
  );

  const ratingStats = useMemo(
    () => getProductRatingStats(product.id, reviews),
    [product.id, reviews],
  );

  const distribution = useMemo(
    () => getRatingDistribution(product.id, reviews),
    [product.id, reviews],
  );

  const existingUserReview = useMemo(
    () =>
      currentUser
        ? reviews.find((r) => r.productId === product.id && r.userId === currentUser.id) ?? null
        : null,
    [reviews, product.id, currentUser],
  );

  const isVerifiedBuyer = useMemo(() => {
    if (!currentUser) return false;
    return orders.some(
      (o) =>
        (o.userId === currentUser.id ||
          o.customerEmail.toLowerCase() === currentUser.email.toLowerCase()) &&
        o.status !== 'cancelled' &&
        o.items.some((i) => i.productId === product.id),
    );
  }, [orders, currentUser, product.id]);

  // Filter & sort state
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<ReviewSortOption>('newest');

  // Review form state (authenticated users only)
  const [rating, setRating] = useState<number>(existingUserReview?.rating ?? 5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [city, setCity] = useState<string>(
    existingUserReview?.city ?? currentUser?.addresses[0]?.city ?? '',
  );
  const [title, setTitle] = useState<string>(existingUserReview?.title ?? '');
  const [comment, setComment] = useState<string>(existingUserReview?.comment ?? '');
  const [error, setError] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Reset view state and hydrate form only when switching products or signing in/out
  useEffect(() => {
    setStarFilter(null);
    setSortBy('newest');
    setError('');
    setStatusMessage('');
    if (existingUserReview) {
      setRating(existingUserReview.rating);
      setCity(existingUserReview.city);
      setTitle(existingUserReview.title);
      setComment(existingUserReview.comment);
    } else {
      setRating(5);
      setCity(currentUser?.addresses[0]?.city ?? '');
      setTitle('');
      setComment('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id, currentUser?.id]);

  const visibleReviews = useMemo(
    () => filterAndSortReviews(approvedReviews, { starFilter, sortBy }),
    [approvedReviews, starFilter, sortBy],
  );

  const redirectTarget = encodeURIComponent(`/product/${product.slug}#customer-reviews`);
  const displayedRating = hoverRating ?? rating;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage('');

    const check = validateProductReview({
      isAuthenticated: Boolean(currentUser),
      rating,
      title,
      comment,
    });

    if (!check.valid) {
      setError(check.error ?? 'Please complete all required review fields.');
      return;
    }

    const res = submitReview({
      productId: product.id,
      authorName: currentUser?.name,
      city,
      rating,
      title,
      comment,
    });

    if (!res.ok) {
      setError(res.error ?? 'Unable to publish review.');
      return;
    }

    setError('');
    setStatusMessage(
      res.updated
        ? 'Your review and rating have been updated.'
        : 'Thank you — your review has been published.',
    );
  };

  return (
    <section
      id="customer-reviews"
      aria-labelledby="customer-reviews-heading"
      className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-10 mt-20 pt-14 border-t border-[#E9E1D5]"
    >
      <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Left Column: Aggregate Score, 5-to-1 Breakdown & Auth-Gated Review Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#C5A46D] font-medium">
              Client Perspectives
            </p>
            <h2
              id="customer-reviews-heading"
              className="font-editorial text-3xl sm:text-4xl text-[#171717]"
            >
              Reviews &amp; Ratings
            </h2>

            {ratingStats.count > 0 ? (
              <div className="bg-white border border-[#E9E1D5] p-6 space-y-5">
                <div className="flex items-center gap-4 pb-5 border-b border-[#EFEAE1]">
                  <span
                    data-testid="product-average-rating"
                    className="font-editorial text-5xl text-[#171717] tabular-nums leading-none"
                  >
                    {ratingStats.average.toFixed(1)}
                  </span>
                  <div>
                    <div
                      className="flex items-center gap-0.5"
                      aria-label={`Average rating ${ratingStats.average.toFixed(1)} out of 5 stars`}
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(ratingStats.average)
                              ? 'fill-[#C5A46D] text-[#C5A46D]'
                              : 'text-[#D9D0C2]'
                          }`}
                          strokeWidth={1.5}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <p className="text-xs text-[#635F5A] mt-1">
                      Based on {ratingStats.count}{' '}
                      {ratingStats.count === 1 ? 'published review' : 'published reviews'}
                    </p>
                  </div>
                </div>

                {/* Interactive Star Rating Distribution Bars */}
                <div className="space-y-2" aria-label="Filter reviews by star rating">
                  {distribution.map((row) => {
                    const isActive = starFilter === row.stars;
                    return (
                      <button
                        key={row.stars}
                        type="button"
                        onClick={() =>
                          setStarFilter((prev) => (prev === row.stars ? null : row.stars))
                        }
                        aria-pressed={isActive}
                        aria-label={`Filter by ${row.stars} star reviews (${row.count})`}
                        className={`w-full flex items-center gap-3 text-xs py-1 px-1.5 -mx-1.5 transition-colors cursor-pointer ${
                          isActive ? 'bg-[#F7F4EE] text-[#171717] font-medium' : 'hover:bg-[#FAF8F4]'
                        }`}
                      >
                        <span className="w-10 text-left tabular-nums text-[#171717] inline-flex items-center gap-1 shrink-0">
                          {row.stars}
                          <Star
                            className="w-3 h-3 fill-[#C5A46D] text-[#C5A46D]"
                            strokeWidth={1.5}
                            aria-hidden="true"
                          />
                        </span>
                        <progress
                          value={row.percentage}
                          max={100}
                          aria-hidden="true"
                          className="flex-1 h-2 appearance-none bg-[#EFEAE1] [&::-webkit-progress-bar]:bg-[#EFEAE1] [&::-webkit-progress-value]:bg-[#C5A46D] [&::-moz-progress-bar]:bg-[#C5A46D]"
                        />
                        <span className="w-8 text-right tabular-nums text-[#85817B] shrink-0">
                          {row.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-[#E9E1D5] p-6">
                <p className="text-sm text-[#635F5A] leading-relaxed">
                  No client reviews yet for this piece. Be the first signed-in client to rate its craft, fit, and finish.
                </p>
              </div>
            )}
          </div>

          {/* Auth-Gated Review Submission Card */}
          {!currentUser ? (
            <div className="bg-white border border-[#E9E1D5] p-6 sm:p-7 space-y-4">
              <div className="flex items-start gap-3">
                <span className="w-9 h-9 shrink-0 bg-[#F7F4EE] border border-[#E9E1D5] flex items-center justify-center text-[#9A7A45]">
                  <Lock className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                </span>
                <div className="space-y-1">
                  <h3 className="text-xs uppercase tracking-[0.18em] font-semibold text-[#171717]">
                    Sign in to Write a Review
                  </h3>
                  <p className="text-xs text-[#635F5A] leading-relaxed">
                    To keep client feedback authentic and tied to real profiles, only logged-in AKSHARA members can submit star ratings and product reviews.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <Link
                  to={`/login?redirect=${redirectTarget}`}
                  className="flex-1 py-3 px-5 bg-[#171717] hover:bg-[#0B0B0B] text-white text-xs tracking-[0.16em] uppercase font-medium text-center transition-colors"
                >
                  Sign In to Review
                </Link>
                <Link
                  to={`/register?redirect=${redirectTarget}`}
                  className="flex-1 py-3 px-5 border border-[#D9D0C2] hover:border-[#171717] text-[#171717] text-xs tracking-[0.16em] uppercase font-medium text-center transition-colors"
                >
                  Create Account
                </Link>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="bg-white border border-[#E9E1D5] p-6 sm:p-7 space-y-5"
            >
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#EFEAE1]">
                <div>
                  <h3 className="text-xs uppercase tracking-[0.18em] font-semibold text-[#171717]">
                    {existingUserReview ? 'Update Your Review' : 'Write a Review'}
                  </h3>
                  <p className="mt-1 text-xs text-[#635F5A] inline-flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-[#C5A46D]" strokeWidth={1.6} aria-hidden="true" />
                    Posting as <span className="text-[#171717] font-medium">{currentUser.name}</span>
                  </p>
                </div>
                {isVerifiedBuyer && (
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-[#2D6A4F] border border-[#CBE0D5] bg-[#F3FAF6] px-2 py-0.5 shrink-0">
                    <ShieldCheck className="w-3 h-3" strokeWidth={1.7} aria-hidden="true" />
                    Verified Buyer
                  </span>
                )}
              </div>

              {/* Interactive Accessible Star Rating Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span id="review-rating-label" className="text-[11px] uppercase tracking-[0.14em] text-[#635F5A] font-medium">
                    Your Rating
                  </span>
                  <span className="text-xs text-[#9A7A45] font-medium tabular-nums">
                    {displayedRating} / 5 — {RATING_LABELS[displayedRating]}
                  </span>
                </div>
                <div
                  role="radiogroup"
                  aria-labelledby="review-rating-label"
                  className="inline-flex items-center gap-1"
                  onMouseLeave={() => setHoverRating(null)}
                >
                  {[1, 2, 3, 4, 5].map((n) => {
                    const filled = n <= displayedRating;
                    return (
                      <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={rating === n}
                        aria-label={`Rate ${n} out of 5 stars (${RATING_LABELS[n]})`}
                        onClick={() => {
                          setRating(n);
                          if (error) setError('');
                        }}
                        onMouseEnter={() => setHoverRating(n)}
                        className="p-1.5 -ml-1 first:ml-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C5A46D] cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            filled ? 'fill-[#C5A46D] text-[#C5A46D]' : 'text-[#D9D0C2]'
                          }`}
                          strokeWidth={1.5}
                          aria-hidden="true"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Headline */}
              <div>
                <label
                  htmlFor="rev-title"
                  className="block text-[11px] uppercase tracking-[0.14em] text-[#635F5A] font-medium mb-1.5"
                >
                  Review Headline
                </label>
                <input
                  id="rev-title"
                  name="title"
                  type="text"
                  maxLength={120}
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Summarize your impression in a few words"
                  className="w-full bg-[#FBF9F5] border border-[#DDD4C6] px-3.5 py-2.5 text-sm text-[#171717] placeholder:text-[#85817B] focus:border-[#171717] focus:bg-white focus:outline-none transition-colors"
                />
              </div>

              {/* City (optional) */}
              <div>
                <label
                  htmlFor="rev-city"
                  className="block text-[11px] uppercase tracking-[0.14em] text-[#635F5A] font-medium mb-1.5"
                >
                  City <span className="normal-case tracking-normal text-[#85817B]">(optional)</span>
                </label>
                <input
                  id="rev-city"
                  name="city"
                  type="text"
                  maxLength={60}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Mumbai"
                  className="w-full bg-[#FBF9F5] border border-[#DDD4C6] px-3.5 py-2.5 text-sm text-[#171717] placeholder:text-[#85817B] focus:border-[#171717] focus:bg-white focus:outline-none transition-colors"
                />
              </div>

              {/* Review Text */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="rev-body"
                    className="block text-[11px] uppercase tracking-[0.14em] text-[#635F5A] font-medium"
                  >
                    Your Review
                  </label>
                  <span className="text-[11px] text-[#85817B] tabular-nums">
                    {comment.trim().length} / 1000
                  </span>
                </div>
                <textarea
                  id="rev-body"
                  name="comment"
                  rows={4}
                  maxLength={1000}
                  value={comment}
                  onChange={(e) => {
                    setComment(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Share notes on craftsmanship, fit, material texture, or everyday wear"
                  className="w-full bg-[#FBF9F5] border border-[#DDD4C6] px-3.5 py-2.5 text-sm text-[#171717] placeholder:text-[#85817B] focus:border-[#171717] focus:bg-white focus:outline-none transition-colors"
                />
              </div>

              {error && (
                <p role="alert" className="text-xs text-[#9E2A2B] bg-[#FDF4F4] border border-[#EBCBCB] px-3.5 py-2.5">
                  {error}
                </p>
              )}

              {statusMessage && (
                <p
                  role="status"
                  aria-live="polite"
                  className="text-xs text-[#2D6A4F] bg-[#F3FAF6] border border-[#CBE0D5] px-3.5 py-2.5 inline-flex items-center gap-2 w-full"
                >
                  <Check className="w-3.5 h-3.5 shrink-0" strokeWidth={1.8} aria-hidden="true" />
                  <span>{statusMessage}</span>
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-[#171717] hover:bg-[#0B0B0B] text-white text-xs tracking-[0.16em] uppercase font-semibold transition-colors cursor-pointer"
              >
                {existingUserReview ? 'Update Review' : 'Publish Review'}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Filter/Sort Bar & Review Cards */}
        <div className="lg:col-span-7 space-y-5">
          {approvedReviews.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E9E1D5]">
              <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#635F5A]">
                <span className="font-medium text-[#171717] tabular-nums">
                  Showing {visibleReviews.length} of {approvedReviews.length}{' '}
                  {approvedReviews.length === 1 ? 'review' : 'reviews'}
                </span>
                {starFilter !== null && (
                  <button
                    type="button"
                    onClick={() => setStarFilter(null)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#D9D0C2] hover:border-[#171717] text-[#171717] text-[11px] transition-colors cursor-pointer"
                  >
                    <span>{starFilter} Stars</span>
                    <span aria-hidden="true">×</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="review-sort" className="text-xs text-[#85817B]">
                  Sort by
                </label>
                <select
                  id="review-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as ReviewSortOption)}
                  className="bg-white border border-[#D9D0C2] px-3 py-1.5 text-xs text-[#171717] focus:border-[#171717] focus:outline-none"
                >
                  <option value="newest">Most Recent</option>
                  <option value="highest">Highest Rated</option>
                  <option value="lowest">Lowest Rated</option>
                </select>
              </div>
            </div>
          )}

          {approvedReviews.length === 0 ? (
            <div className="bg-white border border-[#E9E1D5] p-8 sm:p-10 space-y-2">
              <p className="font-editorial text-2xl text-[#171717]">No published reviews yet</p>
              <p className="text-sm text-[#635F5A] leading-relaxed">
                Reviews on AKSHARA LIFESTYLE come exclusively from authenticated clients—we never display fabricated or imported ratings.
              </p>
            </div>
          ) : visibleReviews.length === 0 ? (
            <div className="bg-white border border-[#E9E1D5] p-8 space-y-3">
              <p className="text-sm text-[#635F5A]">
                No {starFilter}-star reviews have been published for this piece yet.
              </p>
              <button
                type="button"
                onClick={() => setStarFilter(null)}
                className="text-xs uppercase tracking-[0.14em] text-[#171717] underline underline-offset-4 cursor-pointer"
              >
                Show all reviews
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {visibleReviews.map((rev) => {
                const isOwnReview = Boolean(currentUser && rev.userId === currentUser.id);
                return (
                  <article
                    key={rev.id}
                    className={`bg-white border p-6 space-y-3 ${
                      isOwnReview ? 'border-[#C5A46D]' : 'border-[#E9E1D5]'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex items-center gap-0.5"
                          aria-label={`Rated ${rev.rating} out of 5 stars`}
                        >
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star
                              key={n}
                              className={`w-3.5 h-3.5 ${
                                n <= rev.rating
                                  ? 'fill-[#C5A46D] text-[#C5A46D]'
                                  : 'text-[#D9D0C2]'
                              }`}
                              strokeWidth={1.5}
                              aria-hidden="true"
                            />
                          ))}
                        </div>
                        {isOwnReview && (
                          <span className="text-[10px] uppercase tracking-[0.14em] text-[#9A7A45] font-semibold">
                            Your Review
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#85817B]">
                        {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <h3 className="text-base font-medium text-[#171717]">{rev.title}</h3>
                    <p className="text-sm text-[#4A4743] leading-relaxed whitespace-pre-line">
                      {rev.comment}
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#85817B]">
                      <span className="font-medium text-[#171717]">{rev.authorName}</span>
                      <span>·</span>
                      <span>{rev.city}</span>
                      {rev.verifiedPurchase && (
                        <>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1 text-[#2D6A4F]">
                            <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.6} aria-hidden="true" />
                            Verified Client
                          </span>
                        </>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
