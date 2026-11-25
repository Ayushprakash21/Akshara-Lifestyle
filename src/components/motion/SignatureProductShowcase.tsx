import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Check, ShieldCheck, Sparkles, ArrowRight, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCommerce } from '../../store/CommerceContext';
import { formatINR } from '../../utils/commerceLogic';
import { ASSETS } from '../../services/seedData';
import { SafeImage } from '../SafeImage';

interface FlagshipProduct {
  id: string;
  slug: string;
  sku: string;
  name: string;
  tagline: string;
  category: string;
  price: number;
  originalPrice: number;
  cutoutImage: string;
  contextImage: string;
  variants: { id: string; label: string; stock: number }[];
  specs: { label: string; value: string }[];
  description: string;
}

const FLAGSHIP_ITEMS: FlagshipProduct[] = [
  {
    id: 'prod-horlogerie-dress',
    slug: 'akshara-horlogerie-kala-38mm-automatic-dress-watch',
    sku: 'AKS-WAT-301',
    name: 'Kala 38mm Automatic Dress Watch',
    tagline: 'Architectural minimalism powered by a high-beat automatic caliber.',
    category: 'Horology',
    price: 18500,
    originalPrice: 22000,
    cutoutImage: ASSETS.cutoutWatchDress,
    contextImage: ASSETS.watchDressHero,
    variants: [
      { id: 'v-wat-38', label: '38mm Classic Case', stock: 8 },
      { id: 'v-wat-41', label: '41mm Contemporary Case', stock: 5 },
    ],
    specs: [
      { label: 'Caliber', value: 'High-Beat Automatic (28,800 vph)' },
      { label: 'Glass', value: 'Double-Domed AR Sapphire' },
      { label: 'Case', value: '316L Surgical Stainless Steel' },
      { label: 'Strap', value: 'Hand-Stitched Italian Calfskin' },
    ],
    description:
      'A study in classical proportion and quiet confidence. Featuring a brushed champagne dial with applied faceted batons and an exhibition sapphire caseback.',
  },
  {
    id: 'prod-lotus-pendant',
    slug: 'lotus-petal-18k-gold-vermeil-pendant',
    sku: 'AKS-JWL-201',
    name: 'Lotus Petal 18k Vermeil Pendant',
    tagline: 'Modern heirloom accent inspired by the quiet geometry of the lotus.',
    category: 'Fine Jewellery',
    price: 6800,
    originalPrice: 8500,
    cutoutImage: ASSETS.cutoutPearlDrops,
    contextImage: ASSETS.jewelleryPendant,
    variants: [
      { id: 'v-jwl-gld', label: '18k Champagne Gold', stock: 12 },
      { id: 'v-jwl-slv', label: 'Solid 925 Silver', stock: 6 },
    ],
    specs: [
      { label: 'Metal', value: '18k Gold-Vermeil (2.5 microns)' },
      { label: 'Base', value: 'Solid 925 Recycled Sterling Silver' },
      { label: 'Finish', value: 'Artisanal Satin Brush' },
      { label: 'Chain', value: '18-Inch Diamond-Cut Cable' },
    ],
    description:
      'Hand-finished in Jaipur with a tactile satin luster. Its sculpted petal curvature reflects ambient daylight with soft luminescence.',
  },
  {
    id: 'prod-travertine-lamp',
    slug: 'monolith-fluted-travertine-stone-table-lamp',
    sku: 'AKS-DEC-401',
    name: 'Monolithic Travertine Stone Table Lamp',
    tagline: 'Hand-honed raw mineral pedestal with hand-pleated Belgian linen shade.',
    category: 'Home Décor',
    price: 12400,
    originalPrice: 14800,
    cutoutImage: ASSETS.cutoutTravertineLamp,
    contextImage: ASSETS.decorLamp,
    variants: [
      { id: 'v-dec-ivr', label: 'Honed Ivory Travertine', stock: 7 },
      { id: 'v-dec-ter', label: 'Raw Terracotta Stone', stock: 3 },
    ],
    specs: [
      { label: 'Pedestal', value: 'Solid Italian Honed Travertine' },
      { label: 'Shade', value: 'Hand-Pleated Belgian Linen' },
      { label: 'Hardware', value: 'Turned Solid Brushed Brass' },
      { label: 'Cord', value: 'Braided Warm Ecru Textile (2m)' },
    ],
    description:
      'Carved from a singular block of porous architectural travertine. The organic stone cavities contrast with the geometric precision of its pleated shade.',
  },
];

export function SignatureProductShowcase() {
  const { addToCart } = useCommerce();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    FLAGSHIP_ITEMS[0].variants[0].id
  );
  const [isAdded, setIsAdded] = useState(false);

  const product = FLAGSHIP_ITEMS[currentIndex];

  const handleSelectProduct = (index: number) => {
    setCurrentIndex(index);
    setSelectedVariantId(FLAGSHIP_ITEMS[index].variants[0].id);
    setIsAdded(false);
  };

  const handleAddToCart = () => {
    addToCart(product.id, selectedVariantId, 1, true);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2200);
  };

  return (
    <section className="relative w-full bg-[#161413] text-[#F7F4EE] py-24 lg:py-32 border-t border-white/10 select-none overflow-hidden">
      {/* Ambient Radial Spotlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_rgba(197,164,109,0.12)_0%,_transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-[1380px] w-full mx-auto px-4 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A46D]" />
              <span className="text-[11px] font-mono tracking-[0.26em] text-[#C5A46D] uppercase">
                FLAGSHIP SPOTLIGHT
              </span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight mt-1 text-[#F7F4EE]">
              SIGNATURE <span className="italic font-light text-[#C5A46D]">OBJECTS</span>
            </h2>
          </div>

          {/* Interactive Product Tabs */}
          <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-full border border-white/10">
            {FLAGSHIP_ITEMS.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => handleSelectProduct(idx)}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs font-nav font-medium tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                  currentIndex === idx
                    ? 'bg-[#C5A46D] text-[#141312] shadow-md'
                    : 'text-[#A69C8E] hover:text-[#F7F4EE] hover:bg-white/5'
                }`}
              >
                {item.category}
              </button>
            ))}
          </div>
        </div>

        {/* =========================================================================
            SHOWCASE STAGE: CENTRAL DYNAMIC VISUAL + EDITORIAL SPECIFICATIONS
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mt-12 lg:mt-16">
          {/* Left Column: Product Narrative & Real Actions (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-center order-2 lg:order-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[#C5A46D] tracking-widest uppercase">
                    SKU: {product.sku}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C5A46D]" />
                  <span className="text-xs font-mono text-[#A69C8E] tracking-widest uppercase">
                    {product.category}
                  </span>
                </div>

                <h3 className="font-editorial text-3xl sm:text-4xl lg:text-5xl mt-3 leading-tight uppercase text-[#F7F4EE]">
                  {product.name}
                </h3>

                <p className="mt-3 text-xs sm:text-sm font-body text-[#A69C8E] leading-relaxed font-light">
                  {product.description}
                </p>

                {/* Price Display */}
                <div className="mt-6 flex items-baseline gap-4">
                  <span className="text-3xl font-nav font-medium text-[#F7F4EE]">
                    {formatINR(product.price)}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-sm font-nav text-[#8C8478] line-through">
                      {formatINR(product.originalPrice)}
                    </span>
                  )}
                  <span className="text-[10px] font-mono tracking-widest text-[#C5A46D] uppercase">
                    ALL TAXES INCLUDED
                  </span>
                </div>

                {/* Variant Selector */}
                <div className="mt-6">
                  <label className="block text-[11px] font-mono tracking-wider text-[#A69C8E] uppercase mb-2">
                    SELECT FINISH / VARIANT:
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`px-4 py-2 rounded-full text-xs font-nav tracking-wider uppercase border transition-all duration-200 cursor-pointer ${
                          selectedVariantId === v.id
                            ? 'border-[#C5A46D] bg-[#C5A46D]/15 text-[#F7F4EE]'
                            : 'border-white/15 bg-white/[0.03] text-[#A69C8E] hover:border-white/30'
                        }`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons: Add to Bag & View Product */}
                <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={handleAddToCart}
                    className={`w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-full text-xs font-nav font-semibold uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer ${
                      isAdded
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gradient-to-r from-[#C5A46D] via-[#D5B581] to-[#C5A46D] text-[#141312] hover:shadow-[0_0_25px_rgba(197,164,109,0.45)]'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>ADDED TO YOUR BAG</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>ACQUIRE OBJECT</span>
                      </>
                    )}
                  </button>

                  <Link
                    to={`/product/${product.slug}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/[0.05] hover:bg-white/[0.1] text-[#F7F4EE] border border-white/15 rounded-full text-xs font-nav tracking-[0.16em] uppercase transition-all duration-200"
                  >
                    <span>DETAILS</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: Central Floating Visual + Material Detail (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center order-1 lg:order-2">
            <div className="relative w-full max-w-lg aspect-square flex items-center justify-center">
              {/* Radial Platform Glow */}
              <div className="absolute inset-10 bg-[radial-gradient(circle_at_center,_rgba(197,164,109,0.22)_0%,_transparent_65%)] filter blur-2xl pointer-events-none" />

              {/* Large Animated Floating Product Cutout */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={product.id}
                  initial={{ scale: 0.85, opacity: 0, rotate: -6 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.85, opacity: 0, rotate: 6 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="relative z-20 w-[260px] sm:w-[340px] md:w-[400px] drop-shadow-[0_30px_45px_rgba(0,0,0,0.7)]"
                >
                  <SafeImage
                    src={product.cutoutImage}
                    alt={product.name}
                    className="w-full h-auto object-contain"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Genuine Architectural Context Inset */}
              <div className="absolute bottom-2 right-2 w-32 sm:w-40 aspect-square rounded-sm overflow-hidden border border-white/15 shadow-xl bg-black/50 z-30 hidden sm:block">
                <SafeImage
                  src={product.contextImage}
                  alt={`${product.name} Still Life`}
                  className="w-full h-full object-cover object-center filter brightness-95"
                />
              </div>
            </div>

            {/* Specifications Grid */}
            <div className="w-full max-w-lg grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 border-t border-white/10 pt-6">
              {product.specs.map((spec, i) => (
                <div key={i} className="text-left">
                  <p className="text-[10px] font-mono text-[#C5A46D] uppercase tracking-wider">
                    {spec.label}
                  </p>
                  <p className="text-xs font-mono text-[#D5CDBC] mt-0.5">{spec.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
