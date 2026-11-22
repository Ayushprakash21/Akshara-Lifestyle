import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useCommerce } from '../store/CommerceContext';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { ASSETS } from '../services/seedData';
import { ProductCard } from '../components/ProductCard';
import { SafeImage } from '../components/SafeImage';

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

  const lookbookItems = useMemo(
    () => [
      { image: ASSETS.fashionKurta, label: 'Chanderi Silk Drapery', to: '/product/ivory-chanderi-silk-draped-kurta-set' },
      { image: ASSETS.jewelleryCuff, label: 'Jaipur Hammered Gold', to: '/product/hammered-champagne-gold-cuff-and-hoops' },
      { image: ASSETS.beautyParfum, label: 'Mysore Sandalwood Extrait', to: '/product/sandalwood-white-oud-eau-de-parfum' },
      { image: ASSETS.decorVessels, label: 'Bengaluru Matte Stoneware', to: '/product/trio-matte-stoneware-architectural-vessels' },
      { image: ASSETS.electronicsSpeaker, label: 'Kala Acoustic Wool', to: '/product/kala-monolith-acoustic-wool-wireless-speaker' },
      { image: ASSETS.bagsCrossbody, label: 'Saddle Leather Carry', to: '/product/miras-camel-smooth-leather-saddle-crossbody' },
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
    <div>
      {/* 1. Cinematic Hero Section */}
      <section className="relative w-full min-h-[76vh] lg:min-h-[84vh] bg-[#171717] overflow-hidden flex items-end">
        <SafeImage
          src={ASSETS.heroCampaign}
          alt="AKSHARA LIFESTYLE contemporary linen and fine jewellery campaign"
          priority
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Measured dual scrim ensuring WCAG AA readability on desktop & mobile */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B]/90 via-[#0B0B0B]/45 to-[#0B0B0B]/15" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0B]/65 via-[#0B0B0B]/20 to-transparent" />

        <div className="relative z-10 max-w-[1380px] w-full mx-auto px-4 sm:px-6 lg:px-10 pb-14 sm:pb-20 pt-32">
          <div className="max-w-2xl">
            <p className="text-xs tracking-[0.24em] uppercase text-[#E5CB9B] font-semibold">
              {homepageConfig.heroEyebrow}
            </p>
            <h1 className="mt-4 font-editorial text-4xl sm:text-6xl lg:text-[68px] text-[#F7F4EE] leading-[1.03] tracking-[0.02em] font-normal">
              {homepageConfig.heroHeadline}
            </h1>
            <p className="mt-5 text-base sm:text-lg text-[#E9E1D5]/92 leading-relaxed max-w-xl font-normal">
              {homepageConfig.heroSubheadline}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Link
                to="/shop"
                className="px-7 py-3.5 bg-[#F7F4EE] hover:bg-white text-[#0B0B0B] text-xs tracking-[0.16em] uppercase font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap"
              >
                {homepageConfig.primaryCtaLabel}
                <ArrowRight className="w-4 h-4" strokeWidth={1.6} />
              </Link>
              <Link
                to="/category/fashion-clothing"
                className="px-7 py-3.5 border border-[#F7F4EE]/70 hover:border-[#C5A46D] hover:text-[#C5A46D] text-[#F7F4EE] text-xs tracking-[0.16em] uppercase font-medium transition-colors whitespace-nowrap"
              >
                {homepageConfig.secondaryCtaLabel}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Shop by Category — Asymmetrical Editorial Grid */}
      <section className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-10 py-16 lg:py-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#85817B]">
              Six Curated Departments
            </p>
            <h2 className="mt-2 font-editorial text-3xl sm:text-4xl text-[#171717]">
              Shop by Category
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs tracking-[0.14em] uppercase text-[#171717] hover:text-[#9A7A45] inline-flex items-center gap-1.5 border-b border-[#171717] pb-1 self-start sm:self-auto"
          >
            View Complete Catalog
            <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C5A46D]"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-[#E9E1D5]">
                <SafeImage
                  src={category.heroImage}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B]/65 via-transparent to-transparent" />
                <div className="absolute inset-x-3.5 bottom-3.5">
                  <h3 className="font-editorial text-xl text-[#F7F4EE] leading-tight">
                    {category.shortName}
                  </h3>
                </div>
              </div>
              <p className="mt-2.5 text-xs text-[#85817B] line-clamp-1 group-hover:text-[#171717] transition-colors">
                {category.name}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Curated Merchandising Showcase: Trending / New Arrivals / Best Sellers / Limited Offers */}
      <section className="border-t border-[#E9E1D5] bg-white">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-10 py-16 lg:py-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#C5A46D] font-medium">
                Curated Selection
              </p>
              <h2 className="mt-2 font-editorial text-3xl sm:text-4xl text-[#171717]">
                {activeTab === 'trending' && 'Trending Now'}
                {activeTab === 'new' && 'New Arrivals'}
                {activeTab === 'bestsellers' && 'Best Sellers'}
                {activeTab === 'offers' && 'Limited-Time Offers'}
              </h2>
            </div>

            <div
              role="tablist"
              aria-label="Product collections"
              className="flex flex-wrap items-center gap-1 border-b border-[#E9E1D5] md:border-b-0"
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
                  className={`px-4 py-2 text-xs tracking-[0.12em] uppercase transition-colors whitespace-nowrap ${
                    activeTab === key
                      ? 'bg-[#171717] text-[#F7F4EE] font-medium'
                      : 'text-[#85817B] hover:text-[#171717]'
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

          <div className="mt-12 text-center">
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
              className="inline-flex items-center gap-2 px-7 py-3.5 border border-[#171717] text-[#171717] hover:bg-[#171717] hover:text-white text-xs tracking-[0.16em] uppercase font-medium transition-colors"
            >
              View All in Collection
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Featured Collections — Two-Column Asymmetrical Split */}
      <section className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-10 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-6 items-stretch">
          <Link
            to="/category/jewellery"
            className="group relative min-h-[420px] lg:min-h-[520px] bg-[#E9E1D5] overflow-hidden flex items-end p-8 sm:p-10"
          >
            <SafeImage
              src={ASSETS.jewelleryPendant}
              alt="The Lotus Fine Jewellery Collection"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B]/80 via-[#0B0B0B]/20 to-transparent" />
            <div className="relative z-10 max-w-md">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#C5A46D]">
                Featured Collection
              </p>
              <h3 className="mt-2 font-editorial text-3xl sm:text-4xl text-[#F7F4EE]">
                The Lotus Signature Edit
              </h3>
              <p className="mt-2.5 text-sm text-[#E9E1D5]/90 leading-relaxed">
                Brushed 18k champagne gold-vermeil and baroque pearl forms handcrafted in Jaipur.
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-xs tracking-[0.16em] uppercase text-white border-b border-[#C5A46D] pb-1">
                Explore Jewellery
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
              </span>
            </div>
          </Link>

          <Link
            to="/category/electronics"
            className="group relative min-h-[420px] lg:min-h-[520px] bg-[#E9E1D5] overflow-hidden flex items-end p-8 sm:p-10"
          >
            <SafeImage
              src={ASSETS.electronicsHeadphones}
              alt="Kala Acoustics Personal Audio Collection"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B]/80 via-[#0B0B0B]/20 to-transparent" />
            <div className="relative z-10 max-w-md">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#C5A46D]">
                Objects of Sound
              </p>
              <h3 className="mt-2 font-editorial text-3xl sm:text-4xl text-[#F7F4EE]">
                Kala Studio Audio
              </h3>
              <p className="mt-2.5 text-sm text-[#E9E1D5]/90 leading-relaxed">
                Anodized aluminum and acoustic wool engineered for calm focus at home and in transit.
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-xs tracking-[0.16em] uppercase text-white border-b border-[#C5A46D] pb-1">
                Explore Technology
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
              </span>
            </div>
          </Link>
        </div>

        {/* Limited-Time Promotional Banner */}
        {midpageBanner && (
          <div className="mt-6 bg-[#171717] text-[#F7F4EE] px-6 sm:px-10 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#C5A46D]">
                Seasonal Privilege
              </p>
              <h3 className="mt-1.5 font-editorial text-2xl sm:text-3xl text-white">
                {midpageBanner.title}
              </h3>
              <p className="mt-1 text-sm text-[#C9C3BA]">{midpageBanner.subtitle}</p>
            </div>
            <Link
              to={midpageBanner.ctaLink}
              className="px-6 py-3.5 bg-[#C5A46D] hover:bg-[#D4B680] text-[#0B0B0B] text-xs tracking-[0.16em] uppercase font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap self-start md:self-auto"
            >
              {midpageBanner.ctaLabel}
              <ArrowRight className="w-4 h-4" strokeWidth={1.6} />
            </Link>
          </div>
        )}
      </section>

      {/* 5. Curated Lifestyle Editorial & Brand Story */}
      <section className="bg-white border-y border-[#E9E1D5]">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-10 py-16 lg:py-24">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-7">
              <div className="aspect-[16/10] overflow-hidden bg-[#E9E1D5]">
                <SafeImage
                  src={ASSETS.editorialLiving}
                  alt="AKSHARA LIFESTYLE curated architectural interior"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="lg:col-span-5 space-y-6">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#C5A46D] font-medium">
                Editorial Perspective
              </p>
              <h2 className="font-editorial text-3xl sm:text-4xl text-[#171717] leading-tight">
                {homepageConfig.editorialTitle}
              </h2>
              <p className="text-sm sm:text-[15px] text-[#55524E] leading-relaxed">
                {homepageConfig.editorialBody}
              </p>

              <div className="pt-4 border-t border-[#E9E1D5] space-y-3">
                <h3 className="font-editorial text-2xl text-[#171717]">
                  {homepageConfig.brandStoryTitle}
                </h3>
                <p className="text-sm text-[#85817B] leading-relaxed">
                  {homepageConfig.brandStoryBody}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-3 border-t border-[#E9E1D5]">
                <div>
                  <p className="font-editorial text-2xl text-[#171717] tabular-nums">6</p>
                  <p className="text-xs text-[#85817B] mt-0.5">Curated Houses</p>
                </div>
                <div>
                  <p className="font-editorial text-2xl text-[#171717] tabular-nums">24h</p>
                  <p className="text-xs text-[#85817B] mt-0.5">Mumbai Dispatch</p>
                </div>
                <div>
                  <p className="font-editorial text-2xl text-[#171717] tabular-nums">14d</p>
                  <p className="text-xs text-[#85817B] mt-0.5">Easy Returns</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Social / Visual Inspiration Gallery */}
      <section className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-10 py-16 lg:py-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#85817B]">
              In Everyday Spaces
            </p>
            <h2 className="mt-1.5 font-editorial text-3xl sm:text-4xl text-[#171717]">
              @aksharalifestyle
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs tracking-[0.14em] uppercase text-[#171717] hover:text-[#9A7A45]"
          >
            Shop Featured Looks
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {lookbookItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group relative aspect-square overflow-hidden bg-[#E9E1D5]"
            >
              <SafeImage
                src={item.image}
                alt={item.label}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-[#0B0B0B]/0 group-hover:bg-[#0B0B0B]/45 transition-colors flex items-end p-3">
                <span className="text-[11px] tracking-[0.08em] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 7. Quiet Newsletter Section */}
      <section className="bg-[#E9E1D5]/60 border-t border-[#E9E1D5]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#9A7A45] font-medium">
            Private Previews
          </p>
          <h2 className="mt-2 font-editorial text-3xl sm:text-4xl text-[#171717]">
            Join the AKSHARA List
          </h2>
          <p className="mt-3 text-sm text-[#55524E] leading-relaxed">
            First access to limited editions, seasonal lookbooks, and ₹500 welcome credit with code{' '}
            <span className="font-mono font-medium text-[#171717]">WELCOME500</span>.
          </p>
          <form
            onSubmit={handleNewsletter}
            className="mt-7 flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto"
          >
            <label htmlFor="home-newsletter" className="sr-only">
              Email address
            </label>
            <input
              id="home-newsletter"
              type="email"
              value={newsletterEmail}
              onChange={(e) => {
                setNewsletterEmail(e.target.value);
                if (newsletterError) setNewsletterError('');
              }}
              placeholder="Your email address"
              className="flex-1 bg-white border border-[#D4CBBF] px-4 py-3 text-sm text-[#171717] placeholder:text-[#85817B] focus:border-[#171717] focus:outline-none"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-[#171717] hover:bg-[#0B0B0B] text-white text-xs tracking-[0.16em] uppercase font-medium transition-colors whitespace-nowrap"
            >
              Join List
            </button>
          </form>
          {newsletterError && (
            <p className="mt-2 text-xs text-[#9E2A2B]">{newsletterError}</p>
          )}
        </div>
      </section>
    </div>
  );
}
