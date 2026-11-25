import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Star, ShieldCheck } from 'lucide-react';
import { useCommerce } from '../store/CommerceContext';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { ASSETS, SEED_REVIEWS } from '../services/seedData';
import { ProductCard } from '../components/ProductCard';
import { SafeImage } from '../components/SafeImage';
import { RainbowFashionHero } from '../components/motion/RainbowFashionHero';
import { FlagshipCampaignSpotlight } from '../components/motion/FlagshipCampaignSpotlight';
import { CoherentCategoryHighlights } from '../components/motion/CoherentCategoryHighlights';

type ShowcaseTab = 'trending' | 'new' | 'bestsellers' | 'offers';

export function HomePage() {
  const {
    products,
    categories,
    homepageConfig,
    banners,
    subscribeNewsletter,
  } = useCommerce();

  const [activeTab, setActiveTab] = useState<ShowcaseTab>('trending');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterError, setNewsletterError] = useState('');

  useDocumentMeta({
    title: 'Everyday, Elevated',
    description: homepageConfig.heroSubheadline,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'AKSHARA LIFESTYLE',
      url: window.location.origin,
      description: homepageConfig.heroSubheadline,
    },
  });

  const activeProducts = useMemo(
    () => products.filter((p) => p.status === 'active'),
    [products],
  );

  const tabProducts = useMemo(() => {
    switch (activeTab) {
      case 'new':
        return activeProducts.filter((p) => p.isNewArrival || p.badge === 'NEW').slice(0, 4);
      case 'bestsellers':
        return activeProducts.filter((p) => p.isBestSeller || p.badge === 'BESTSELLER').slice(0, 4);
      case 'offers':
        return activeProducts
          .filter((p) => p.isLimitedOffer || p.originalPrice > p.price)
          .slice(0, 4);
      case 'trending':
      default:
        return activeProducts.filter((p) => p.isTrending).slice(0, 4);
    }
  }, [activeProducts, activeTab]);

  const midpageBanner = banners.find((b) => b.placement === 'midpage' && b.active);

  const approvedReviews = useMemo(
    () => SEED_REVIEWS.filter((r) => r.status === 'approved' && r.verifiedPurchase).slice(0, 3),
    [],
  );

  const lookbookItems = useMemo(
    () => [
      { image: ASSETS.rainbowPage1, label: 'Rainbow Organza Silk', to: '/product/rainbow-elegance-handloom-organza-silk-ensemble' },
      { image: ASSETS.fashionKurta, label: 'Chanderi Silk Drapery', to: '/product/ivory-chanderi-silk-draped-kurta-set' },
      { image: ASSETS.watchDressHero, label: 'Kala Automatic 38mm', to: '/product/akshara-horlogerie-kala-38mm-automatic-dress-watch' },
      { image: ASSETS.jewelleryCuff, label: 'Jaipur Hammered Gold', to: '/product/hammered-champagne-gold-cuff-and-hoops' },
      { image: ASSETS.bagsTote, label: 'Architectural Pebble Tote', to: '/product/miras-architectural-structured-leather-tote' },
      { image: ASSETS.decorLamp, label: 'Fluted Travertine Lamp', to: '/product/monolith-fluted-travertine-stone-table-lamp' },
    ],
    [],
  );

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscribeNewsletter(newsletterEmail)) {
      setNewsletterError('Please enter a valid email address.');
      return;
    }
    setNewsletterError('');
    setNewsletterEmail('');
  };

  return (
    <div className="relative w-full bg-[#151413] text-[#F7F3EB]">
      {/* 1. Proper Full-Screen Motion-Led Fashion Campaign Hero */}
      <RainbowFashionHero />

      {/* 2. Flagship Campaign Spotlight (Interactive Multi-View & Immediate Purchase) */}
      <FlagshipCampaignSpotlight />

      {/* 3. Shop by Category — Dedicated Clean Taxonomy */}
      <section className="bg-[#141312] text-[#F7F3EB] border-t border-white/10 py-20 lg:py-28">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 border-b border-white/10 pb-6">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.26em] text-[#C6A15B]">
                STOREFRONT DIRECTORY
              </p>
              <h2 className="mt-2 font-editorial text-3xl sm:text-5xl text-[#F7F3EB]">
                Seven Curated Departments
              </h2>
            </div>
            <Link
              to="/shop"
              className="text-xs font-mono tracking-[0.16em] uppercase text-[#C6A15B] hover:text-white inline-flex items-center gap-1.5 pb-1 self-start sm:self-auto"
            >
              <span>View Complete Catalogue</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 sm:gap-5">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C6A15B]"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-[#1F1D1A] border border-white/10">
                  <SafeImage
                    src={category.heroImage}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B]/85 via-transparent to-transparent" />
                  <div className="absolute inset-x-3 bottom-3">
                    <h3 className="font-editorial text-lg text-[#F7F3EB] leading-tight group-hover:text-[#C6A15B] transition-colors">
                      {category.shortName}
                    </h3>
                  </div>
                </div>
                <p className="mt-2 text-[11px] font-mono text-[#8C8375] line-clamp-1 group-hover:text-[#F7F3EB] transition-colors">
                  {category.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Coherent Category Highlights (Dedicated Campaigns: Horology, Jewellery, Bags, Living) */}
      <CoherentCategoryHighlights />

      {/* 5. Clean Shopping Collection Grid: Trending / New Arrivals / Best Sellers / Limited Offers */}
      <section className="bg-[#F7F3EB] text-[#171717] py-20 lg:py-28 border-t border-[#E9E1D5]">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-[#C6A15B] font-semibold">
                CURATED SELECTION
              </p>
              <h2 className="mt-2 font-editorial text-4xl sm:text-5xl text-[#171717]">
                {activeTab === 'trending' && 'Trending Now'}
                {activeTab === 'new' && 'New Arrivals'}
                {activeTab === 'bestsellers' && 'Best Sellers'}
                {activeTab === 'offers' && 'Limited-Time Offers'}
              </h2>
            </div>

            <div
              role="tablist"
              aria-label="Product collections"
              className="flex flex-wrap items-center gap-1.5 border-b border-[#DCD5C9] md:border-b-0"
            >
              {(
                [
                  ['trending', 'Trending Now'],
                  ['new', 'New Arrivals'],
                  ['bestsellers', 'Best Sellers'],
                  ['offers', 'Limited Offers'],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === key}
                  onClick={() => setActiveTab(key)}
                  className={`px-4 py-2.5 text-xs font-mono tracking-[0.14em] uppercase transition-all whitespace-nowrap rounded-sm cursor-pointer ${
                    activeTab === key
                      ? 'bg-[#171717] text-[#F7F3EB] font-semibold shadow-sm'
                      : 'text-[#85817B] hover:text-[#171717] hover:bg-black/5'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
            {tabProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              to={
                activeTab === 'new'
                  ? '/shop?sort=newest'
                  : activeTab === 'bestsellers'
                    ? '/shop?sort=bestselling'
                    : activeTab === 'offers'
                      ? '/shop?offers=true'
                      : '/shop'
              }
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-[#171717] hover:bg-[#0B0B0B] text-white text-xs font-mono uppercase tracking-[0.18em] font-semibold transition-all shadow-md"
            >
              <span>Explore Collection Archive</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Promotional Midpage Banner */}
      {midpageBanner && (
        <section className="bg-[#1C1815] text-[#F7F3EB] border-y border-white/10 px-6 sm:px-12 py-12">
          <div className="max-w-[1380px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-[#C6A15B]">
                SEASONAL PRIVILEGE
              </p>
              <h3 className="mt-1.5 font-editorial text-3xl sm:text-4xl text-[#F7F3EB]">
                {midpageBanner.title}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-[#A89D8F] font-light">{midpageBanner.subtitle}</p>
            </div>
            <Link
              to={midpageBanner.ctaLink}
              className="px-8 py-4 bg-[#C6A15B] hover:bg-[#D4AF37] text-[#0B0B0B] text-xs font-mono tracking-[0.18em] uppercase font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap self-start md:self-auto shadow-lg"
            >
              <span>{midpageBanner.ctaLabel}</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
            </Link>
          </div>
        </section>
      )}

      {/* 7. Curated Lifestyle Editorial & Brand Story */}
      <section className="bg-[#141211] text-[#F7F3EB] border-b border-white/10 py-20 lg:py-28">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-7">
              <div className="aspect-[16/10] overflow-hidden rounded-sm bg-[#1E1C1A] border border-white/10 shadow-2xl">
                <SafeImage
                  src={ASSETS.editorialLiving}
                  alt="AKSHARA LIFESTYLE curated architectural interior"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="lg:col-span-5 space-y-6">
              <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-[#C6A15B]">
                EDITORIAL PERSPECTIVE
              </p>

              <h2 className="font-editorial text-3xl sm:text-4xl text-[#F7F3EB] leading-tight">
                {homepageConfig.editorialTitle}
              </h2>
              <p className="text-xs sm:text-sm text-[#A89D8F] leading-relaxed font-light">
                {homepageConfig.editorialBody}
              </p>

              <div className="pt-4 border-t border-white/10 space-y-3">
                <h3 className="font-editorial text-2xl text-[#C6A15B]">
                  {homepageConfig.brandStoryTitle}
                </h3>
                <p className="text-xs sm:text-sm text-[#8C8274] leading-relaxed font-light">
                  {homepageConfig.brandStoryBody}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10 font-mono">
                <div>
                  <p className="font-editorial text-3xl text-[#C6A15B] tabular-nums">7</p>
                  <p className="text-[10px] uppercase tracking-wider text-[#A89D8F] mt-1">Houses</p>
                </div>
                <div>
                  <p className="font-editorial text-3xl text-[#C6A15B] tabular-nums">24h</p>
                  <p className="text-[10px] uppercase tracking-wider text-[#A89D8F] mt-1">Dispatch</p>
                </div>
                <div>
                  <p className="font-editorial text-3xl text-[#C6A15B] tabular-nums">14d</p>
                  <p className="text-[10px] uppercase tracking-wider text-[#A89D8F] mt-1">Returns</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Genuine Verified Customer Reviews */}
      <section className="bg-[#FAF8F5] text-[#171717] py-20 lg:py-24 border-b border-[#E8E2D7]">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="text-center max-w-xl mx-auto mb-14">
            <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-[#C6A15B] font-semibold">
              VERIFIED PATRON REVIEWS
            </p>
            <h2 className="mt-2 font-editorial text-3xl sm:text-4xl text-[#171717]">
              Words from Our Patrons
            </h2>
            <p className="mt-2 text-xs font-mono text-[#8C8375]">
              Unfiltered impressions from verified acquisitions across India.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {approvedReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white p-6 sm:p-8 rounded-sm border border-[#E0D7C9] shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center gap-1 text-[#C6A15B] mb-3">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <h3 className="font-editorial text-lg text-[#171717] font-semibold">
                    "{rev.title}"
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-[#57524B] leading-relaxed font-light">
                    {rev.comment}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#EBE4D8] flex items-center justify-between text-xs font-mono">
                  <div>
                    <p className="font-semibold text-[#171717]">{rev.authorName}</p>
                    <p className="text-[10px] text-[#8C8375]">{rev.city}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] text-[#2E7D32]">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Lookbook / Visual Inspiration Living Archive */}
      <section className="max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12 py-20 lg:py-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-white/10">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-[#C6A15B]">
              LIVING ARCHIVE
            </p>
            <h2 className="mt-2 font-editorial text-3xl sm:text-4xl text-[#F7F3EB]">
              @aksharalifestyle
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs font-mono tracking-[0.16em] uppercase text-[#A89D8F] hover:text-[#C6A15B] transition-colors"
          >
            <span>Shop Featured Looks</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {lookbookItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group relative aspect-square overflow-hidden rounded-sm bg-[#1A1816] border border-white/10"
            >
              <SafeImage
                src={item.image}
                alt={item.label}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="text-xs font-medium text-white tracking-wide">
                  {item.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 10. Quiet Newsletter / Privilege Access Section */}
      <section className="bg-[#121110] border-t border-white/10 py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-8 text-center space-y-4">
          <p className="text-[10px] font-mono uppercase tracking-[0.26em] text-[#C6A15B]">
            PRIVATE JOURNAL & PREVIEWS
          </p>
          <h2 className="font-editorial text-3xl sm:text-4xl text-[#F7F3EB]">
            Join the AKSHARA List
          </h2>
          <p className="text-xs sm:text-sm text-[#A89D8F] leading-relaxed font-light">
            Privileged first access to limited seasonal runs, private salon appointments, and welcome privilege with code{' '}
            <span className="font-mono text-[#C6A15B]">WELCOME500</span>.
          </p>
          <form
            onSubmit={handleNewsletter}
            className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => {
                setNewsletterEmail(e.target.value);
                if (newsletterError) setNewsletterError('');
              }}
              placeholder="Enter your email address"
              className="flex-1 bg-[#1A1816] border border-white/15 px-4 py-3 text-xs sm:text-sm text-[#F7F3EB] placeholder:text-[#6E665D] focus:border-[#C6A15B] focus:outline-none transition-colors"
            />
            <button
              type="submit"
              className="px-7 py-3 bg-[#C6A15B] hover:bg-[#D4AF37] text-[#0B0B0B] text-xs font-mono uppercase tracking-[0.18em] font-semibold transition-colors whitespace-nowrap cursor-pointer shadow-md"
            >
              Subscribe
            </button>
          </form>
          {newsletterError && (
            <p className="mt-2 text-xs text-[#E07A5F] font-mono">{newsletterError}</p>
          )}
        </div>
      </section>
    </div>
  );
}
