import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Check, Sparkles, ChevronDown } from 'lucide-react';
import { useCommerce } from '../../store/CommerceContext';
import { formatINR } from '../../utils/commerceLogic';
import { ASSETS } from '../../services/seedData';
import { SafeImage } from '../SafeImage';

export function RainbowFashionHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { products, addToCart } = useCommerce();
  const [selectedSize, setSelectedSize] = useState<'XS' | 'S' | 'M' | 'L'>('S');
  const [isAdded, setIsAdded] = useState(false);

  // Retrieve the Rainbow Elegance product from catalog
  const campaignProduct =
    products.find((p) => p.slug === 'rainbow-elegance-handloom-organza-silk-ensemble') ||
    products.find((p) => p.categorySlug === 'fashion-clothing') ||
    products[0];

  // Raw scroll progress tied to the pinned 320vh container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Buttery spring physics for smooth, responsive scroll-driven scrubbing
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 24,
    mass: 0.8,
  });

  // 1. Background Color Transition:
  // Starts in opulent Charcoal (#151413), warms through espresso (#281F18), transitions into warm ivory (#F7F4EE)
  const bgColor = useTransform(
    smoothProgress,
    [0, 0.4, 0.75, 1],
    ['#151413', '#221915', '#F2EFEB', '#F7F4EE']
  );

  // 2. Text Color Transitions
  const headlineColor = useTransform(
    smoothProgress,
    [0, 0.5, 0.75, 1],
    ['#F7F3EB', '#F7F3EB', '#171717', '#171717']
  );

  const subtextColor = useTransform(
    smoothProgress,
    [0, 0.5, 0.75, 1],
    ['#C8BEB2', '#C8BEB2', '#635D55', '#57524B']
  );

  const borderColor = useTransform(
    smoothProgress,
    [0, 0.5, 0.75, 1],
    ['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.16)', 'rgba(0,0,0,0.12)', 'rgba(0,0,0,0.14)']
  );

  // 3. Model Scale & Translation
  // Start (0-25%): Hero enters large, centered
  // Mid (25-65%): Scales down slightly, translates to right half of screen
  // Final (65-100%): Settles into a clean editorial portrait frame
  const modelScale = useTransform(smoothProgress, [0, 0.3, 0.7, 1], [1.02, 0.98, 0.94, 0.88]);
  const modelX = useTransform(smoothProgress, [0, 0.3, 0.7, 1], ['0%', '8%', '20%', '22%']);
  const modelY = useTransform(smoothProgress, [0, 0.3, 0.7, 1], ['2%', '0%', '-2%', '0%']);

  // 4. Sheer Dupatta Floating Crossfade
  // Pose 1 (resting drape) smoothly fades into Pose 2 (sheer dupatta flying wide) as user scrolls
  const pose1Opacity = useTransform(smoothProgress, [0, 0.28, 0.55], [1, 0.8, 0]);
  const pose2Opacity = useTransform(smoothProgress, [0.32, 0.5, 1], [0, 1, 1]);

  // 5. Stage 1 Top Headline & CTA Opacity (0–35%)
  const stage1Opacity = useTransform(smoothProgress, [0, 0.25, 0.38], [1, 0.9, 0]);
  const stage1Y = useTransform(smoothProgress, [0, 0.35], ['0px', '-40px']);

  // 6. Stage 2 Editorial Story & Supporting Cards Opacity (35–75%)
  const stage2Opacity = useTransform(smoothProgress, [0.35, 0.48, 0.72, 0.82], [0, 1, 1, 0]);
  const stage2Y = useTransform(smoothProgress, [0.35, 0.5], ['50px', '0px']);

  // 7. Stage 3 Transition into Shopping Collection (75–100%)
  const stage3Opacity = useTransform(smoothProgress, [0.75, 0.88, 1], [0, 1, 1]);
  const stage3Y = useTransform(smoothProgress, [0.75, 0.95], ['40px', '0px']);

  const handleAddToCart = () => {
    if (!campaignProduct) return;
    const selectedVariant =
      campaignProduct.variants.find((v) => v.size === selectedSize) ||
      campaignProduct.variants[0];
    addToCart(campaignProduct.id, selectedVariant?.id, 1, true);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2200);
  };

  return (
    <div ref={containerRef} className="relative w-full h-[320vh]">
      {/* Pinned Sticky Viewport — dynamically fits viewport minus announcement and sticky header */}
      <motion.section
        style={{ backgroundColor: bgColor }}
        className="sticky top-16 lg:top-[72px] h-[calc(100vh-6.75rem)] min-h-[540px] w-full overflow-hidden flex flex-col justify-between select-none"
      >
        {/* Subtle Warm Architecture Background Layer with Parallax */}
        <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen">
          <SafeImage
            src={ASSETS.rainbowBg}
            alt="Royal Courtyard Architecture"
            className="w-full h-full object-cover object-center filter blur-[1px]"
          />
        </div>

        {/* Ambient Radial Gradient Accent */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,_var(--tw-gradient-stops))] from-[#F6C344]/15 via-[#E63988]/10 to-transparent pointer-events-none" />

        {/* Top Minimal Status Indicator */}
        <motion.div
          style={{ borderColor }}
          className="relative z-30 max-w-[1380px] w-full mx-auto px-4 sm:px-8 py-3 flex items-center justify-between border-b"
        >
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono tracking-[0.26em] uppercase text-[#C6A15B] font-semibold">
              HAUTE COUTURE CAMPAIGN
            </span>
            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#C6A15B]" />
            <span className="hidden sm:inline-block text-xs font-mono text-[#A89F91]">
              RAINBOW ELEGANCE · VOL. 01
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-[10px] tracking-widest uppercase text-[#C6A15B] font-medium">
              SCROLL TO REVEAL
            </span>
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            >
              <ChevronDown className="w-3.5 h-3.5 text-[#C6A15B]" />
            </motion.div>
          </div>
        </motion.div>

        {/* =========================================================================
            CENTER STAGE: DOMINANT MODEL PHOTOGRAPHY + TYPOGRAPHIC LAYERS
            ========================================================================= */}
        <div className="relative z-10 flex-1 w-full max-w-[1380px] mx-auto px-4 sm:px-8 flex items-center justify-center">
          {/* -----------------------------------------------------------------------
              STAGE 1: TOP HERO HEADLINE & DIRECT PURCHASE (0–35% SCROLL)
              ----------------------------------------------------------------------- */}
          <motion.div
            style={{ opacity: stage1Opacity, y: stage1Y }}
            className="absolute inset-0 flex flex-col items-center justify-start pt-2 sm:pt-4 text-center pointer-events-none px-4 z-20"
          >
            <p className="text-[10px] sm:text-xs tracking-[0.32em] uppercase font-mono text-[#C6A15B] mb-1.5 font-medium">
              SIGNATURE COUTURE EDIT
            </p>

            <motion.h1
              style={{ color: headlineColor }}
              className="font-editorial text-3xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-[-0.01em] uppercase drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            >
              EVERYDAY. <span className="text-[#C6A15B] italic font-normal">ELEVATED.</span>
            </motion.h1>

            <motion.p
              style={{ color: subtextColor }}
              className="mt-1 text-xs tracking-[0.18em] uppercase font-light max-w-md hidden sm:block drop-shadow-sm"
            >
              A spectrum of color · Light layers, graceful fluid movement
            </motion.p>
          </motion.div>

          {/* -----------------------------------------------------------------------
              STAGE 2: SPLIT EDITORIAL STORYTELLING & MATERIAL CALLOUTS (35–75%)
              ----------------------------------------------------------------------- */}
          <motion.div
            style={{ opacity: stage2Opacity, y: stage2Y }}
            className="absolute left-4 sm:left-8 lg:left-12 max-w-xl text-left z-20 pointer-events-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C6A15B]/15 border border-[#C6A15B]/30 rounded-full mb-3">
              <Sparkles className="w-3 h-3 text-[#C6A15B]" />
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#C6A15B]">
                HANDLOOM ORGANZA SILK
              </span>
            </div>

            <motion.h2
              style={{ color: headlineColor }}
              className="font-editorial text-3xl sm:text-5xl lg:text-6xl leading-[1.04]"
            >
              A SPECTRUM
              <br />
              <span className="italic text-[#C6A15B]">OF COLOR.</span>
            </motion.h2>

            <motion.p
              style={{ color: subtextColor }}
              className="mt-3 text-xs sm:text-sm leading-relaxed max-w-md font-light"
            >
              Masterfully woven from gossamer handloom organza silk with an artisanal ombre blend of
              sunlit yellow, vibrant fuchsia, and cerulean blue. Finished with hand-rolled silk hems and
              subtle golden zari contours that catch the light with every step.
            </motion.p>

            {/* Genuine Campaign Attributes Grid */}
            <div className="mt-5 grid grid-cols-2 gap-3 max-w-sm text-xs font-mono">
              <div className="p-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-sm">
                <p className="text-[10px] text-[#C6A15B] tracking-wider uppercase">DRAPE & FINISH</p>
                <p className="text-[#F7F3EB] mt-0.5 font-medium">Gossamer Sheer Silk</p>
              </div>
              <div className="p-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-sm">
                <p className="text-[10px] text-[#C6A15B] tracking-wider uppercase">PALETTE</p>
                <p className="text-[#F7F3EB] mt-0.5 font-medium">Yellow · Pink · Blue</p>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <Link
                to={`/product/${campaignProduct.slug}`}
                className="px-6 py-3 bg-[#171717] hover:bg-[#000] text-white text-xs uppercase tracking-[0.18em] font-semibold transition-all flex items-center gap-2 border border-[#C6A15B]/40"
              >
                <span>VIEW ATELIER DETAILS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>

          {/* -----------------------------------------------------------------------
              STAGE 3: SEAMLESS SHOPPING TRANSITION CTA (75–100%)
              ----------------------------------------------------------------------- */}
          <motion.div
            style={{ opacity: stage3Opacity, y: stage3Y }}
            className="absolute left-4 sm:left-8 lg:left-12 max-w-lg text-left z-20 pointer-events-auto"
          >
            <span className="text-[10px] font-mono tracking-[0.24em] uppercase text-[#C6A15B] font-semibold">
              SIGNATURE COUTURE PIECE
            </span>
            <h2 className="mt-1 font-editorial text-3xl sm:text-5xl text-[#171717] leading-tight">
              RAINBOW
              <br />
              <span className="italic text-[#C6A15B]">ELEGANCE.</span>
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#57524B] leading-relaxed max-w-md">
              Available in limited atelier quantities. Insured Pan-India delivery included with
              complimentary 14-day effortless returns.
            </p>
            <div className="mt-5 flex items-center gap-4">
              <Link
                to="/category/fashion-clothing"
                className="px-6 py-3 bg-[#171717] hover:bg-[#000] text-white text-xs uppercase tracking-[0.18em] font-semibold transition-colors flex items-center gap-2"
              >
                <span>EXPLORE FASHION COLLECTION</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>

          {/* -----------------------------------------------------------------------
              LARGE DOMINANT FASHION MODEL PHOTOGRAPHY WITH DYNAMIC SCROLL TRANSITION
              ----------------------------------------------------------------------- */}
          <motion.div
            style={{
              scale: modelScale,
              x: modelX,
              y: modelY,
            }}
            className="relative z-15 h-[38vh] sm:h-[46vh] lg:h-[50vh] max-h-[460px] aspect-[9/14] flex items-center justify-center pointer-events-none mt-10 sm:mt-14 lg:mt-16"
          >
            {/* Ambient Halation Glow */}
            <div className="absolute inset-4 rounded-full bg-[#F6C344]/25 blur-3xl -z-10" />

            {/* Pose 1: Elegant Initial Silhouette (Draped Rest) */}
            <motion.div
              style={{ opacity: pose1Opacity }}
              className="absolute inset-0 flex items-center justify-center filter drop-shadow-[0_25px_50px_rgba(0,0,0,0.65)]"
            >
              <SafeImage
                src={ASSETS.rainbowModel1}
                alt="Rainbow Elegance Couture Ensemble Pose 1"
                priority
                className="h-full w-auto object-contain object-bottom"
              />
            </motion.div>

            {/* Pose 2: Dynamic Extended Floating Sheer Dupatta */}
            <motion.div
              style={{ opacity: pose2Opacity }}
              className="absolute inset-0 flex items-center justify-center filter drop-shadow-[0_25px_50px_rgba(0,0,0,0.65)]"
            >
              <SafeImage
                src={ASSETS.rainbowModelOpen}
                alt="Rainbow Elegance Couture Ensemble Floating Dupatta"
                priority
                className="h-full w-auto object-contain object-bottom"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* =========================================================================
            BOTTOM BAR: GENUINE PRODUCT DETAILS, SIZE SELECTOR & IMMEDIATE ACQUIRE
            ========================================================================= */}
        <motion.div
          style={{ borderColor }}
          className="relative z-30 max-w-[1380px] w-full mx-auto px-4 sm:px-8 py-2 sm:py-2.5 flex flex-col md:flex-row items-center justify-between gap-2.5 border-t shrink-0"
        >
          {/* Product Identification & Size Selection */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div>
              <p className="text-[9px] font-mono text-[#C6A15B] uppercase tracking-widest">
                SIGNATURE CAMPAIGN
              </p>
              <motion.h3
                style={{ color: headlineColor }}
                className="text-xs sm:text-sm font-medium tracking-wide transition-colors"
              >
                Rainbow Elegance Organza Silk
              </motion.h3>
            </div>

            {/* Real Size Selector */}
            <div className="flex items-center gap-1 ml-2">
              <span className="text-[10px] font-mono text-[#A89F91] uppercase mr-0.5">SIZE:</span>
              {(['XS', 'S', 'M', 'L'] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedSize(sz)}
                  className={`w-6 h-6 sm:w-7 sm:h-7 text-[10px] sm:text-[11px] font-mono rounded-full border transition-all cursor-pointer ${
                    selectedSize === sz
                      ? 'bg-[#C6A15B] text-[#121110] border-[#C6A15B] font-bold shadow-sm'
                      : 'bg-black/40 hover:bg-black/70 text-[#D8D0C5] border-white/15'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing & Add to Bag Trigger */}
          <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
            <div className="text-right">
              <div className="flex items-baseline gap-2">
                <span className="font-editorial text-lg sm:text-2xl font-semibold tabular-nums text-[#C6A15B]">
                  {formatINR(campaignProduct.price)}
                </span>
                <span className="text-xs line-through text-[#8C8375] tabular-nums">
                  {formatINR(campaignProduct.originalPrice)}
                </span>
              </div>
              <p className="text-[8px] sm:text-[9px] font-mono text-[#8C8375] tracking-widest uppercase">
                ALL-INCLUSIVE PAN-INDIA DELIVERY
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="px-5 py-2.5 sm:px-6 sm:py-3 bg-[#C6A15B] hover:bg-[#D4AF37] text-[#0B0B0B] text-[11px] sm:text-xs uppercase tracking-[0.16em] font-semibold transition-all flex items-center gap-1.5 shadow-lg cursor-pointer shrink-0"
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>ADDED</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>ACQUIRE ENSEMBLE</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.section>
    </div>
  );
}
