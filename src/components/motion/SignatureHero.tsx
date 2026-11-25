import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'motion/react';
import { ArrowRight, ShoppingBag, Check, ShieldCheck, Sparkles, SlidersHorizontal } from 'lucide-react';
import { ASSETS } from '../../services/seedData';
import { useCommerce } from '../../store/CommerceContext';
import { formatINR } from '../../utils/commerceLogic';
import { SafeImage } from '../SafeImage';

export function SignatureHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { products, addToCart, cartTotals } = useCommerce();

  // Scroll tracking pinned to this 360vh container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Smooth springs for buttery 60fps scrub
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.001,
  });

  // 1. Color transitions: Charcoal (#141312) -> Deep Espresso (#261A14) -> Warm Ivory (#F7F3EB)
  const bgColor = useTransform(
    smoothProgress,
    [0, 0.32, 0.65, 0.95],
    ['#141312', '#221712', '#2D201A', '#F7F3EB']
  );

  const textColor = useTransform(
    smoothProgress,
    [0, 0.45, 0.65, 0.95],
    ['#F7F3EB', '#F7F3EB', '#F7F3EB', '#171717']
  );

  const subtextColor = useTransform(
    smoothProgress,
    [0, 0.45, 0.65, 0.95],
    ['#A89D8F', '#B3A698', '#C9BEB2', '#6E6961']
  );

  const borderLight = useTransform(
    smoothProgress,
    [0, 0.5, 0.8, 1],
    ['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.15)', 'rgba(0,0,0,0.12)', 'rgba(0,0,0,0.15)']
  );

  // 2. Product Motion: Scale, Rotation, Translation
  // 0–20%: Enters large (scale 1.35 -> 1.05), tilted -7deg
  // 20–50%: Tilts +6deg, translates slightly right
  // 50–75%: Glides to composed right layout, straightens
  // 75–100%: Settles into clean showcase card position
  const productScale = useTransform(smoothProgress, [0, 0.22, 0.55, 0.85, 1], [0.94, 0.98, 0.94, 0.88, 0.84]);
  const productRotate = useTransform(smoothProgress, [0, 0.25, 0.52, 0.8, 1], [-4, 4, -2, 0, 0]);
  const productXDesktop = useTransform(smoothProgress, [0, 0.3, 0.6, 0.9, 1], ['0%', '0%', '16%', '22%', '24%']);
  const productYDesktop = useTransform(smoothProgress, [0, 0.3, 0.6, 0.9, 1], ['12%', '10%', '-2%', '4%', '6%']);

  // Parallax floating decorative elements
  const floatingJewelY = useTransform(smoothProgress, [0, 1], [120, -180]);
  const floatingJewelRotate = useTransform(smoothProgress, [0, 1], [15, -25]);
  const floatingSwatchY = useTransform(smoothProgress, [0, 1], [-60, 160]);
  const floatingSpecsOpacity = useTransform(smoothProgress, [0, 0.25, 0.4, 0.8, 0.95], [0, 0, 1, 1, 0]);
  const phase1Opacity = useTransform(smoothProgress, [0, 0.22, 0.35], [1, 0.8, 0]);
  const phase2Opacity = useTransform(smoothProgress, [0.32, 0.45, 0.75, 0.9], [0, 1, 1, 0]);
  const phase3Opacity = useTransform(smoothProgress, [0.8, 0.9, 1], [0, 1, 1]);

  // Variant switcher state
  const heroVariants = [
    {
      id: 'camel',
      name: 'Camel Saddle Leather',
      colorHex: '#B68A5A',
      image: ASSETS.bagsCrossbody,
      accentBg: '#2A1D16',
      price: 7400,
      originalPrice: 8800,
      slug: 'miras-camel-smooth-leather-saddle-crossbody',
      sku: 'AKS-BAG-602-CML',
      badge: 'LIMITED EDITION',
      spec: 'Vegetable-Tanned Tuscan Calf',
    },
    {
      id: 'noir',
      name: 'Obsidian Pebble Tote',
      colorHex: '#181716',
      image: ASSETS.bagsTote,
      accentBg: '#181716',
      price: 9800,
      originalPrice: 11800,
      slug: 'miras-architectural-structured-leather-tote',
      sku: 'AKS-BAG-601-BLK',
      badge: 'BESTSELLER',
      spec: 'Full-Grain Architectural Pebble',
    },
    {
      id: 'gold',
      name: 'Jaipur Sculptural Cuff',
      colorHex: '#C6A15B',
      image: ASSETS.jewelleryCuff,
      accentBg: '#2E2215',
      price: 5600,
      originalPrice: 6800,
      slug: 'hammered-champagne-gold-cuff-and-hoops',
      sku: 'AKS-JWL-202-GLD',
      badge: 'ATELIER PIECE',
      spec: '18k Champagne Gold Plated',
    },
  ];

  const [selectedVariant, setSelectedVariant] = useState(heroVariants[0]);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const handleQuickAdd = () => {
    // Look up target product in context
    const targetProduct =
      products.find((p) => p.slug === selectedVariant.slug) ||
      products.find((p) => p.categorySlug === 'bags-accessories') ||
      products[0];

    if (targetProduct) {
      addToCart(targetProduct.id, targetProduct.variants[0]?.id, 1, true);
      setAddedAnimation(true);
      setTimeout(() => setAddedAnimation(false), 2000);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-[340vh] sm:h-[380vh]">
      {/* Sticky Presentation Viewport — dynamically fits viewport minus storefront header */}
      <motion.section
        style={{ backgroundColor: bgColor }}
        className="sticky top-0 h-[calc(100vh-6.5rem)] min-h-[560px] w-full overflow-hidden flex flex-col justify-between select-none"
      >
        {/* Subtle Ambient Radial Lighting Layer */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_45%,_var(--tw-gradient-stops))] from-[#C6A15B]/15 via-transparent to-transparent pointer-events-none" />

        {/* =========================================================================
            HEADER LAYER (MINIMAL FIXED NAVIGATION INTEGRATION)
            ========================================================================= */}
        <motion.div
          style={{ borderColor: borderLight }}
          className="relative z-30 max-w-[1400px] w-full mx-auto px-4 sm:px-8 py-2 flex items-center justify-between border-b shrink-0"
        >
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-mono tracking-[0.22em] uppercase text-[#C6A15B]">
              ATELIER EXHIBITION 2026
            </span>
            <div className="hidden md:flex items-center gap-4 text-xs font-mono">
              <motion.span style={{ color: subtextColor }}>ALL-INCLUSIVE PAN-INDIA LOGISTICS</motion.span>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 text-xs font-mono">
            <Link
              to="/shop"
              className="hidden sm:inline-block px-3 py-1 border border-[#C6A15B]/40 rounded-full text-[#C6A15B] hover:border-[#C6A15B] transition-colors text-[11px]"
            >
              BROWSE ARCHIVE
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-widest uppercase text-[#C6A15B] font-semibold">
                SCROLL TO IMMERSE
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#C6A15B] animate-ping" />
            </div>
          </div>
        </motion.div>

        {/* =========================================================================
            CENTER STAGE: FLOATING EDITORIAL TYPOGRAPHY & FLOATING ELEMENTS
            ========================================================================= */}
        <div className="relative z-10 flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-8 flex items-center justify-center">
          {/* PHASE 1 (0–35%): GIANT EDITORIAL HEADLINE "EVERYDAY. ELEVATED." */}
          <motion.div
            style={{ opacity: phase1Opacity }}
            className="absolute inset-0 flex flex-col items-center justify-start pt-3 sm:pt-5 lg:pt-6 text-center pointer-events-none px-4 z-10"
          >
            <motion.p
              style={{ color: subtextColor }}
              className="text-[10px] sm:text-xs tracking-[0.34em] uppercase font-mono mb-2"
            >
              SERIES 01 · OBJECTS OF DISTINCTION
            </motion.p>
            <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.02] tracking-[-0.01em] uppercase text-[#F7F3EB] drop-shadow-[0_10px_35px_rgba(0,0,0,0.6)]">
              EVERYDAY.
              <br />
              <span className="text-[#C6A15B] italic font-normal">ELEVATED.</span>
            </h1>
            <motion.p
              style={{ color: subtextColor }}
              className="mt-1 text-[11px] sm:text-xs tracking-[0.18em] uppercase font-light max-w-md hidden sm:block"
            >
              Tactile leather carry, architectural fine jewellery & still living objects.
            </motion.p>
          </motion.div>

          {/* PHASE 2 (35–80%): SPLIT EDITORIAL STORYTELLING + CALLOUTS */}
          <motion.div
            style={{ opacity: phase2Opacity }}
            className="absolute left-4 sm:left-10 lg:left-16 max-w-xl text-left z-20 pointer-events-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C6A15B]/15 border border-[#C6A15B]/30 rounded-full mb-4">
              <Sparkles className="w-3 h-3 text-[#C6A15B]" />
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#C6A15B]">
                HERO ATELIER FOCUS
              </span>
            </div>

            <motion.h2
              style={{ color: textColor }}
              className="font-editorial text-4xl sm:text-6xl lg:text-7xl leading-[1.02] tracking-[-0.01em]"
            >
              RESTLESS
              <br />
              <span className="italic text-[#C6A15B]">PERFECTION.</span>
            </motion.h2>

            <motion.p
              style={{ color: subtextColor }}
              className="mt-4 text-xs sm:text-sm leading-relaxed max-w-md font-light"
            >
              Crafted from vegetable-tanned full-grain leather that burnishes beautifully with age.
              Hand-painted edge finishing and solid brushed champagne brass accents designed for daily longevity.
            </motion.p>

            {/* Micro Feature Indicators */}
            <div className="mt-6 grid grid-cols-2 gap-3 max-w-sm text-xs font-mono">
              <div className="p-3 bg-[#0B0B0B]/40 backdrop-blur-md border border-white/10 rounded-sm">
                <p className="text-[10px] text-[#C6A15B] tracking-wider uppercase">ORIGIN</p>
                <p className="text-[#F7F3EB] mt-0.5 font-medium">Tuscan Calfs</p>
              </div>
              <div className="p-3 bg-[#0B0B0B]/40 backdrop-blur-md border border-white/10 rounded-sm">
                <p className="text-[10px] text-[#C6A15B] tracking-wider uppercase">HARDWARE</p>
                <p className="text-[#F7F3EB] mt-0.5 font-medium">Solid Brass</p>
              </div>
            </div>
          </motion.div>

          {/* PHASE 3 (80–100%): TRANSITION INTO SHOPPING COMPOSITION */}
          <motion.div
            style={{ opacity: phase3Opacity }}
            className="absolute left-4 sm:left-10 lg:left-16 max-w-lg text-left z-20 pointer-events-auto"
          >
            <span className="text-[10px] font-mono tracking-[0.24em] uppercase text-[#C6A15B]">
              READY FOR TRANSIT
            </span>
            <h2 className="mt-1 font-editorial text-4xl sm:text-5xl lg:text-6xl text-[#171717] leading-tight">
              CURATED FOR
              <br />
              <span className="italic text-[#C6A15B]">YOUR RITUAL.</span>
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-[#6E6961] leading-relaxed max-w-md">
              Every creation is insured in reinforced tamper-evident packaging with zero delivery charges across all domestic pin codes.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <Link
                to={`/product/${selectedVariant.slug}`}
                className="px-6 py-3 bg-[#171717] hover:bg-[#0B0B0B] text-white text-xs uppercase tracking-[0.18em] font-semibold transition-colors flex items-center gap-2"
              >
                <span>EXPLORE CREATION</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>

          {/* =========================================================================
              HERO PRODUCT VISUAL (SCROLL-DRIVEN SCALE, ROTATION, PARALLAX TRANSLATION)
              ========================================================================= */}
          <motion.div
            style={{
              scale: productScale,
              rotate: productRotate,
              x: productXDesktop,
              y: productYDesktop,
            }}
            className="relative z-15 w-[200px] sm:w-[250px] lg:w-[290px] xl:w-[320px] max-h-[36vh] aspect-[4/5] flex items-center justify-center pointer-events-none mt-10 sm:mt-14 lg:mt-16"
          >
            {/* Ambient Product Halo Glow */}
            <div className="absolute inset-4 rounded-full bg-[#C6A15B]/20 blur-3xl -z-10" />

            {/* Dynamic Product Visual with Smooth Crossfade */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedVariant.id}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.04 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full h-full rounded-2xl overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.45)] border border-white/10"
              >
                <SafeImage
                  src={selectedVariant.image}
                  alt={selectedVariant.name}
                  priority
                  className="w-full h-full object-cover object-center"
                />

                {/* Subtle Luxury Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B]/60 via-transparent to-transparent pointer-events-none" />

                {/* Floating Product Badge */}
                <div className="absolute top-4 left-4 px-3 py-1 bg-[#121110]/80 backdrop-blur-md border border-[#C6A15B]/30 rounded-full text-[9px] font-mono tracking-[0.2em] uppercase text-[#C6A15B]">
                  {selectedVariant.badge}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Parallax Floating Layer 1: Sculptural Jewellery Accent */}
            <motion.div
              style={{ y: floatingJewelY, rotate: floatingJewelRotate }}
              className="absolute -top-10 -right-8 w-28 sm:w-36 aspect-square rounded-full overflow-hidden shadow-2xl border border-white/20 hidden sm:block z-20 pointer-events-none"
            >
              <SafeImage
                src={ASSETS.jewelleryCuff}
                alt="Jewellery Detail"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
            </motion.div>

            {/* Parallax Floating Layer 2: Texture Swatch Detail */}
            <motion.div
              style={{ y: floatingSwatchY }}
              className="absolute -bottom-8 -left-8 w-24 sm:w-32 aspect-[3/4] rounded-lg overflow-hidden shadow-2xl border border-white/15 hidden md:block z-20 pointer-events-none"
            >
              <SafeImage
                src={ASSETS.bagsTote || ASSETS.bagsCrossbody}
                alt="Material Texture"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute bottom-2 left-2 text-[8px] font-mono text-[#C6A15B] uppercase tracking-widest">
                TUSCAN HIDE
              </span>
            </motion.div>
          </motion.div>
        </div>

        {/* =========================================================================
            BOTTOM LAYER: DYNAMIC PRODUCT VARIANT SWITCHER & REAL-TIME PURCHASE BAR
            Inspired directly by Dialed In's interactive swatch switcher (Frames 08–10)
            ========================================================================= */}
        <motion.div
          style={{ borderColor: borderLight }}
          className="relative z-30 max-w-[1400px] w-full mx-auto px-4 sm:px-8 py-2 sm:py-3 flex flex-col md:flex-row items-center justify-between gap-3 border-t shrink-0"
        >
          {/* Variant Selector Swatches */}
          <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#C6A15B] shrink-0 mr-1">
              SELECT VARIANT:
            </span>
            {heroVariants.map((v) => {
              const isSelected = selectedVariant.id === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariant(v)}
                  className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-[#F7F3EB] text-[#171717] border-[#C6A15B] shadow-md'
                      : 'bg-[#181615]/70 hover:bg-[#25221F] text-[#D4CCC2] border-white/15'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-black/30 shrink-0"
                    style={{ backgroundColor: v.colorHex }}
                  />
                  <span className="text-[11px] font-medium tracking-wide whitespace-nowrap">
                    {v.name}
                  </span>
                  {isSelected && (
                    <motion.span layoutId="variant-active-indicator" className="text-[#C6A15B]">
                      <Check className="w-3 h-3" strokeWidth={3} />
                    </motion.span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Product Pricing & Fast Buy Interaction */}
          <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
            <div className="text-right">
              <div className="flex items-baseline gap-2">
                <span className="font-editorial text-2xl font-semibold tabular-nums text-[#C6A15B]">
                  {formatINR(selectedVariant.price)}
                </span>
                <span className="text-xs line-through text-[#8C8375] tabular-nums">
                  {formatINR(selectedVariant.originalPrice)}
                </span>
              </div>
              <p className="text-[10px] font-mono text-[#8C8375] tracking-widest uppercase">
                ALL-INCLUSIVE DELIVERY INCLUDED
              </p>
            </div>

            <button
              type="button"
              onClick={handleQuickAdd}
              className="px-6 py-3.5 bg-[#C6A15B] hover:bg-[#D4AF37] text-[#0B0B0B] text-xs uppercase tracking-[0.18em] font-semibold transition-all flex items-center gap-2 shadow-lg cursor-pointer"
            >
              {addedAnimation ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>ADDED TO BAG</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>ACQUIRE OBJECT</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.section>
    </div>
  );
}
