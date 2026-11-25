import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Check, Sparkles, Heart, Eye, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCommerce } from '../../store/CommerceContext';
import { formatINR } from '../../utils/commerceLogic';
import { ASSETS } from '../../services/seedData';
import { SafeImage } from '../SafeImage';

export function CuratedCollectionsScene() {
  const { products, addToCart, toggleWishlist, wishlist } = useCommerce();

  // Curate verified flagship objects directly from existing Firestore products
  const curatedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    const targetIds = [
      'prod-watch-kala-auto',
      'prod-lotus-pendant',
      'prod-travertine-lamp',
      'prod-merino-knit',
      'prod-structured-tote',
      'prod-saffron-serum',
      'prod-anc-headphones',
    ];

    const matched = targetIds
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => p !== undefined && p.status === 'active');

    // If specific target IDs aren't found, fallback to active products from each category
    if (matched.length > 0) return matched;
    return products.filter((p) => p.status === 'active').slice(0, 6);
  }, [products]);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeProduct = curatedProducts[activeIndex];

  // Variant selection state for the active product
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');

  // Synchronize default variant when active product changes
  React.useEffect(() => {
    if (activeProduct && activeProduct.variants && activeProduct.variants.length > 0) {
      setSelectedVariantId(activeProduct.variants[0].id);
    } else {
      setSelectedVariantId('');
    }
  }, [activeProduct]);

  // Map product ID to studio cutout if available
  const getProductCutout = (productId: string, fallbackImage: string) => {
    switch (productId) {
      case 'prod-watch-kala-auto':
        return ASSETS.cutoutWatchDress || fallbackImage;
      case 'prod-lotus-pendant':
        return ASSETS.cutoutLotusPendant || fallbackImage;
      case 'prod-travertine-lamp':
        return ASSETS.cutoutTravertineLamp || fallbackImage;
      case 'prod-merino-knit':
        return ASSETS.cutoutMerinoKnit || fallbackImage;
      case 'prod-structured-tote':
        return ASSETS.cutoutLeatherTote || fallbackImage;
      case 'prod-saffron-serum':
        return ASSETS.cutoutSaffronSerum || fallbackImage;
      case 'prod-anc-headphones':
        return ASSETS.cutoutAncHeadphones || fallbackImage;
      default:
        return fallbackImage;
    }
  };

  if (!products || products.length === 0 || curatedProducts.length === 0) {
    return (
      <section className="py-24 bg-[#141312] text-[#F7F4EE] text-center border-t border-white/10">
        <p className="font-editorial text-2xl text-[#A69C8E]">
          No curated objects currently available in the catalogue.
        </p>
      </section>
    );
  }

  const selectedVariant =
    activeProduct.variants?.find((v) => v.id === selectedVariantId) ??
    activeProduct.variants?.[0];

  const effectivePrice =
    activeProduct.price + (selectedVariant?.priceDelta ?? 0);

  const isSaved = wishlist.includes(activeProduct.id);

  const handleAcquire = () => {
    addToCart(activeProduct.id, selectedVariant?.id, 1, true);
  };

  return (
    <section className="relative w-full bg-[#141312] text-[#F7F4EE] py-20 lg:py-28 overflow-hidden select-none border-t border-white/10">
      {/* Ambient Champagne Atmospheric Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,_rgba(197,164,109,0.1)_0%,_transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-[1380px] w-full mx-auto px-4 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A46D]" />
              <span className="font-nav text-xs tracking-[0.3em] uppercase text-[#C5A46D] font-medium">
                [SCENE IV · CURATED OBJECTS]
              </span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight mt-1 text-[#F7F4EE]">
              FLAGSHIP <span className="italic font-light text-[#C5A46D]">CATALOGUE</span>
            </h2>
          </div>

          <p className="max-w-md font-body text-xs sm:text-sm font-light text-[#A69C8E] leading-relaxed">
            Authentic objects from the AKSHARA permanent collection. Genuine materials, verified inventory, transparent pricing, and all-inclusive shipping.
          </p>
        </div>

        {/* Object Navigation Tabs */}
        <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none border-b border-white/10">
          {curatedProducts.map((prod, idx) => (
            <button
              key={prod.id}
              onClick={() => setActiveIndex(idx)}
              className={`px-4 sm:px-5 py-2.5 rounded-full text-xs font-nav uppercase tracking-[0.14em] whitespace-nowrap transition-all duration-300 cursor-pointer flex items-center gap-2 ${
                activeIndex === idx
                  ? 'bg-[#C5A46D] text-[#0B0B0B] font-semibold shadow-lg scale-102'
                  : 'bg-[#1E1C1A] border border-white/10 text-[#A69C8E] hover:border-[#C5A46D]/60 hover:text-white'
              }`}
            >
              <span className="text-[10px] font-mono opacity-70">0{idx + 1}</span>
              <span>{prod.category}</span>
            </button>
          ))}
        </div>

        {/* Active Flagship Interactive Display */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Studio Cutout & Presentation */}
          <div className="lg:col-span-6 relative aspect-square sm:aspect-[4/3] lg:aspect-square w-full rounded-sm bg-[#1A1816] border border-white/10 flex items-center justify-center p-8 sm:p-12 overflow-hidden shadow-2xl">
            {/* Subtle Pedestal Lighting */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_65%,_rgba(197,164,109,0.18)_0%,_transparent_65%)]" />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeProduct.id}
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.05, y: -20 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 w-full h-full flex items-center justify-center"
              >
                <img
                  src={getProductCutout(activeProduct.id, activeProduct.images[0])}
                  alt={activeProduct.name}
                  className="max-h-[82%] max-w-[82%] object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)] filter contrast-105"
                />
              </motion.div>
            </AnimatePresence>

            {/* Corner SKU / Category Badges */}
            <div className="absolute top-6 left-6 text-[10px] font-mono tracking-[0.25em] text-[#C5A46D] uppercase">
              {activeProduct.category}
            </div>

            <div className="absolute bottom-6 left-6 text-[10px] font-mono tracking-[0.25em] text-[#8C8478] uppercase">
              SKU: {activeProduct.sku}
            </div>

            {/* Wishlist Heart Toggle */}
            <button
              onClick={() => toggleWishlist(activeProduct.id)}
              aria-label="Save object"
              className={`absolute top-6 right-6 p-2.5 rounded-full border transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-[#C5A46D] border-[#C5A46D] text-[#0B0B0B]'
                  : 'bg-[#141312]/80 border-white/15 text-white hover:border-[#C5A46D]'
              }`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Right Column: Verified Product Information, Variant Selector, and Acquisition */}
          <div className="lg:col-span-6 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeProduct.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono tracking-[0.25em] text-[#C5A46D] uppercase">
                      VERIFIED CATALOGUE OBJECT
                    </span>
                    <span className="text-[#8C8478]">·</span>
                    <span className="text-[10px] font-nav uppercase tracking-[0.2em] text-[#8C8478]">
                      {activeProduct.brandName}
                    </span>
                  </div>

                  <h3 className="font-editorial text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-[#F7F4EE] leading-[1.08]">
                    {activeProduct.name}
                  </h3>

                  {/* Pricing Display */}
                  <div className="flex items-baseline gap-4 pt-1">
                    <span className="font-editorial text-2xl sm:text-3xl text-[#C5A46D] font-normal">
                      {formatINR(effectivePrice)}
                    </span>
                    {activeProduct.originalPrice > effectivePrice && (
                      <span className="text-sm font-mono text-[#8C8478] line-through">
                        {formatINR(activeProduct.originalPrice)}
                      </span>
                    )}
                    <span className="text-[11px] font-nav uppercase tracking-widest text-[#8C8478]">
                      All-Inclusive
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="font-body text-xs sm:text-sm font-light text-[#A69C8E] leading-relaxed">
                  {activeProduct.description || activeProduct.shortDescription}
                </p>

                {/* Real Variant Selection */}
                {activeProduct.variants && activeProduct.variants.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <label className="block text-[10px] font-nav uppercase tracking-[0.24em] text-[#8C8478]">
                      Select Specification / Variant:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {activeProduct.variants.map((v) => {
                        const isSelected = v.id === selectedVariantId;
                        const label = v.colorName || v.size || v.name || v.sku;
                        return (
                          <button
                            key={v.id}
                            onClick={() => setSelectedVariantId(v.id)}
                            className={`px-4 py-2 text-xs font-nav uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                              isSelected
                                ? 'bg-[#C5A46D] text-[#0B0B0B] font-semibold ring-2 ring-[#C5A46D]'
                                : 'bg-[#1E1C1A] border border-white/10 text-[#A69C8E] hover:border-white/30 hover:text-white'
                            }`}
                          >
                            <span>{label}</span>
                            {v.priceDelta && v.priceDelta > 0 ? (
                              <span className="text-[10px] opacity-80">(+{formatINR(v.priceDelta)})</span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Acquisition and Full Specification Pathway */}
                <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <button
                    onClick={handleAcquire}
                    className="flex-1 py-4 px-8 bg-[#C5A46D] hover:bg-[#D4B680] text-[#0B0B0B] text-xs font-nav uppercase tracking-[0.2em] font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Acquire Object</span>
                  </button>

                  <Link
                    to={`/product/${activeProduct.slug}`}
                    className="py-4 px-6 border border-white/20 hover:border-white text-white text-xs font-nav uppercase tracking-[0.18em] transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Specifications</span>
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
