import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { useCommerce } from '../store/CommerceContext';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { ASSETS, SEED_REVIEWS } from '../services/seedData';
import { SafeImage } from '../components/SafeImage';

// Cinematic Abstract & Motion Components
import { CinematicPreloader } from '../components/motion/CinematicPreloader';
import { HeroBrandIntroScene } from '../components/motion/HeroBrandIntroScene';
import { CategoryTransitionScene } from '../components/motion/CategoryTransitionScene';
import { CuratedCollectionsScene } from '../components/motion/CuratedCollectionsScene';
import { ProductCatalogSection } from '../components/motion/ProductCatalogSection';

export function HomePage() {
  const { homepageConfig, subscribeNewsletter } = useCommerce();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterError, setNewsletterError] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  useDocumentMeta({
    title: 'Everyday, Elevated — AKSHARA LIFESTYLE',
    description:
      'A considered world of everyday living. Curated essentials across horology, fine jewellery, Italian leather goods, architectural lighting, and botanical apothecary.',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'AKSHARA LIFESTYLE',
      url: window.location.origin,
      description: 'A considered world of everyday living.',
    },
  });

  const approvedReviews = useMemo(
    () => SEED_REVIEWS.filter((r) => r.status === 'approved' && r.verifiedPurchase).slice(0, 3),
    [],
  );

  // Pure Still-Life Living Archive (Zero Human Models)
  const stillLifeArchive = useMemo(
    () => [
      {
        image: ASSETS.fashionBlazer,
        label: 'Belgian Linen Blazer',
        category: 'Fashion',
        to: '/product/sand-double-breasted-linen-blazer',
      },
      {
        image: ASSETS.jewelleryPendant,
        label: 'Lotus Petal 18k Vermeil',
        category: 'Fine Jewellery',
        to: '/product/ak-signature-lotus-petal-gold-pendant',
      },
      {
        image: ASSETS.bagsTote,
        label: 'Architectural Pebble Tote',
        category: 'Leather Carry',
        to: '/product/miras-architectural-structured-leather-tote',
      },
      {
        image: ASSETS.decorLamp,
        label: 'Fluted Travertine Lamp',
        category: 'Home Décor',
        to: '/product/monolith-fluted-travertine-stone-table-lamp',
      },
      {
        image: ASSETS.beautySerum,
        label: 'Kashmiri Saffron Elixir',
        category: 'Botanical Apothecary',
        to: '/product/vana-and-saffron-botanical-radiance-elixir',
      },
      {
        image: ASSETS.fashionMerino,
        label: 'Extrafine Merino Knit',
        category: 'Textile Foundations',
        to: '/product/charcoal-merino-wool-mock-neck-sweater',
      },
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
    setNewsletterSuccess(true);
    setNewsletterEmail('');
    setTimeout(() => setNewsletterSuccess(false), 4000);
  };

  return (
    <div className="relative w-full bg-[#141312] text-[#F7F4EE] select-none">
      {/* 0. Cinematic Preloader (with 0-100% counter & elegant emblem reveal) */}
      <CinematicPreloader />

      {/* =========================================================================
          SECTION 1: BRAND INTRODUCTION (HERO)
          - Full-screen cinematic introduction featuring AKSHARA LIFESTYLE
          - Minimal copy: EVERYDAY, ELEVATED.
          - Subtitle: A multi-category lifestyle destination.
          - Animated brand logo emblem
          - GSAP scroll-triggered spatial typography transform (moves outward with parallax)
          - ZERO products. ZERO people. ZERO prices. ZERO sales buttons.
          - NO repetitive waves, NO floating transparent boxes.
          ========================================================================= */}
      <HeroBrandIntroScene />

      {/* =========================================================================
          SECTION 2: BRAND STORY & CATEGORY TRANSITIONS
          - Approved brand identity only:
            AKSHARA LIFESTYLE / EVERYDAY, ELEVATED. / A multi-category lifestyle destination.
          - 7 core categories:
            Fashion, Jewellery, Watches, Beauty, Home Décor, Electronics, Bags
          - Intentional animated transitions with authentic still life
          - Zero invented manifestos, zero fabricated claims
          ========================================================================= */}
      <CategoryTransitionScene />

      {/* =========================================================================
          SECTION 3: CURATED COLLECTIONS
          - Products ONLY enter the experience here
          - Real verified products from existing Firestore catalogue (useCommerce)
          - Verified prices, verified images, verified variants
          - Direct variant selection and Add to Bag with drawer integration
          - Zero fabricated watches or claims
          ========================================================================= */}
      <CuratedCollectionsScene />

      {/* =========================================================================
          SECTION 4: SHOPPING EXPERIENCE
          - Functional product catalogue
          - Product cards, search, filtering across all 7 categories, sorting
          - Clean empty state for categories without products (e.g. Watches)
          - Wishlist, Add to Cart, direct checkout pathways
          ========================================================================= */}
      <ProductCatalogSection />

      {/* Verified Patron Perspectives & Architectural Social Proof */}
      <section className="bg-[#131211] text-[#F7F4EE] py-20 lg:py-28 border-t border-white/10">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A46D]" />
                <span className="font-nav text-xs tracking-[0.28em] text-[#C5A46D] uppercase">
                  PATRON PERSPECTIVES
                </span>
              </div>
              <h2 className="font-editorial text-3xl sm:text-5xl uppercase tracking-tight mt-1 text-[#F7F4EE]">
                VERIFIED <span className="italic font-light text-[#C5A46D]">TESTIMONIALS</span>
              </h2>
            </div>
            <p className="font-nav text-xs tracking-widest text-[#A69C8E] uppercase">
              100% VERIFIED PURCHASES · PAN-INDIA CLIENTELE
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {approvedReviews.map((review) => (
              <div
                key={review.id}
                className="p-8 bg-white/[0.03] border border-white/10 rounded-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < review.rating ? 'fill-[#C5A46D] text-[#C5A46D]' : 'text-neutral-700'
                        }`}
                      />
                    ))}
                  </div>
                  <h4 className="font-editorial text-xl text-[#F7F4EE]">{review.title}</h4>
                  <p className="mt-3 text-xs sm:text-sm font-body text-[#A69C8E] leading-relaxed font-light">
                    "{review.comment}"
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                  <span className="text-[#F7F4EE] font-medium">{review.authorName}</span>
                  <span className="text-[#C5A46D] flex items-center gap-1 text-[10px]">
                    <ShieldCheck className="w-3 h-3" /> VERIFIED
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pure Still-Life Living Archive Grid (Zero Human Models) */}
      <section className="bg-[#161413] text-[#F7F4EE] py-20 lg:py-24 border-t border-white/10">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-white/10">
            <div>
              <p className="font-nav text-[11px] uppercase tracking-[0.28em] text-[#C5A46D]">
                STUDIO ARCHIVE
              </p>
              <h2 className="mt-1 font-editorial text-3xl sm:text-4xl text-[#F7F4EE]">
                OBJECTS IN SITU
              </h2>
            </div>
            <Link
              to="/shop"
              className="font-nav text-xs tracking-[0.18em] uppercase text-[#A69C8E] hover:text-[#C5A46D] transition-colors inline-flex items-center gap-2"
            >
              <span>Explore All Archive Pieces</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stillLifeArchive.map((item) => (
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#C5A46D]">
                    {item.category}
                  </span>
                  <span className="text-xs font-medium text-white tracking-wide mt-0.5">
                    {item.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Private Journal & Newsletter Subscription */}
      <section className="bg-[#121110] border-t border-white/10 py-20 lg:py-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-8 text-center space-y-4">
          <p className="font-nav text-[11px] uppercase tracking-[0.28em] text-[#C5A46D]">
            PRIVATE JOURNAL & PREVIEWS
          </p>
          <h2 className="font-editorial text-3xl sm:text-4xl text-[#F7F4EE]">
            Join the AKSHARA List
          </h2>
          <p className="font-body text-xs sm:text-sm text-[#A69C8E] leading-relaxed font-light">
            Privileged first access to limited seasonal runs, private salon appointments, and welcome privilege with code{' '}
            <span className="font-mono text-[#C5A46D]">WELCOME500</span>.
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
              className="flex-1 bg-[#1A1816] border border-white/15 px-4 py-3 text-xs sm:text-sm text-[#F7F4EE] placeholder:text-[#6E665D] focus:border-[#C5A46D] focus:outline-none transition-colors"
            />
            <button
              type="submit"
              className="px-7 py-3 bg-[#C5A46D] hover:bg-[#D4AF37] text-[#0B0B0B] text-xs font-nav uppercase tracking-[0.18em] font-semibold transition-colors whitespace-nowrap cursor-pointer shadow-md"
            >
              Subscribe
            </button>
          </form>
          {newsletterError && (
            <p className="mt-2 text-xs text-[#E07A5F] font-mono">{newsletterError}</p>
          )}
          {newsletterSuccess && (
            <p className="mt-2 text-xs text-emerald-400 font-mono">
              Welcome to the private journal. Your privileges are now active.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
