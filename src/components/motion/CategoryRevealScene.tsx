import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, Sparkles, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CategoryShowcase {
  id: string;
  number: string;
  name: string;
  slug: string;
  headline: string;
  tagline: string;
  philosophy: string;
  materials: string[];
  visualTheme: {
    accent: string;
    gradient: string;
    geometryType: 'silk' | 'gold-ring' | 'dial' | 'flacon' | 'travertine' | 'acoustic' | 'leather';
  };
}

const CATEGORIES_DATA: CategoryShowcase[] = [
  {
    id: 'cat-fashion',
    number: '01',
    name: 'Fashion',
    slug: 'fashion-clothing',
    headline: 'THE DRAPERY OF NATURAL FIBRES',
    tagline: 'Belgian flax linen, handloom Chanderi silk, and extrafine merino wool.',
    philosophy:
      'We work exclusively with unadulterated natural yarns. Breathable weaves engineered with architectural structure that soften and gain character through decades of wear.',
    materials: ['Belgian Flax Linen', 'Handloom Chanderi Silk', 'Extrafine Merino Wool'],
    visualTheme: {
      accent: '#D4B680',
      gradient: 'from-[#3A332B] via-[#54483B] to-[#1E1B18]',
      geometryType: 'silk',
    },
  },
  {
    id: 'cat-jewellery',
    number: '02',
    name: 'Jewellery',
    slug: 'jewellery',
    headline: 'SACRED GEOMETRY IN 18K GOLD VERMEIL',
    tagline: 'Jaipur artisanal metallurgy, solid 925 silver, and baroque pearls.',
    philosophy:
      'Echoing the quiet symmetry of the sacred lotus petal. Each heirloom accent is hand-finished with satin brushing to reflect ambient daylight with a soft, warm luster.',
    materials: ['18K Champagne Gold Vermeil', 'Solid 925 Silver', 'Baroque Freshwater Pearl'],
    visualTheme: {
      accent: '#E5C07A',
      gradient: 'from-[#42331E] via-[#85673C] to-[#241B0E]',
      geometryType: 'gold-ring',
    },
  },
  {
    id: 'cat-watches',
    number: '03',
    name: 'Watches',
    slug: 'watches',
    headline: 'PRECISION HOROLOGY & MECHANICAL BALANCE',
    tagline: 'Applied faceted batons, high-beat automatic movements, and double-domed AR sapphire.',
    philosophy:
      'A study in classical proportion and quiet confidence. Designed with architectural symmetry, exhibition sapphire casebacks, and hand-stitched Italian leather straps.',
    materials: ['316L Surgical Stainless Steel', 'Double-Domed AR Sapphire', 'Italian Calfskin'],
    visualTheme: {
      accent: '#C5A46D',
      gradient: 'from-[#1A1816] via-[#2F2922] to-[#11100F]',
      geometryType: 'dial',
    },
  },
  {
    id: 'cat-beauty',
    number: '04',
    name: 'Beauty',
    slug: 'beauty-wellness',
    headline: 'WILD OUD & BOTANICAL ALCHEMY',
    tagline: 'Cold-pressed Kashmiri saffron, wild Deccan oud, and pharmaceutical glass flacons.',
    philosophy:
      'Sensory rituals formulated with uncompromising botanical purity. Distilled extracts and organic botanical oils preserved in heavy UV-protective amber glass flacons.',
    materials: ['Kashmiri Saffron Stigmas', 'Wild-Harvested Deccan Oud', 'Amber Glass Flacon'],
    visualTheme: {
      accent: '#E09F5A',
      gradient: 'from-[#3D2517] via-[#613A22] to-[#1C120B]',
      geometryType: 'flacon',
    },
  },
  {
    id: 'cat-decor',
    number: '05',
    name: 'Home Décor',
    slug: 'home-decor',
    headline: 'HONED STONE & AMBIENT ILLUMINATION',
    tagline: 'Monolithic travertine minerals, pleated Belgian linen, and matte stoneware.',
    philosophy:
      'Objects that create sanctuary. Honed natural mineral pedestals whose organic pores ground modern living spaces in geological permanence and calming warm light.',
    materials: ['Solid Italian Honed Travertine', 'Hand-Pleated Linen', 'Artisanal Stoneware'],
    visualTheme: {
      accent: '#D5B581',
      gradient: 'from-[#38332C] via-[#5C5449] to-[#211E1A]',
      geometryType: 'travertine',
    },
  },
  {
    id: 'cat-electronics',
    number: '06',
    name: 'Electronics',
    slug: 'electronics',
    headline: 'ACOUSTIC PURITY & ARCHITECTURAL AUDIO',
    tagline: 'Precision planar drivers, turned aluminium enclosures, and memory acoustic foam.',
    philosophy:
      'Acoustic isolation crafted for immersive sound. Stripped of plastic embellishment, utilizing solid metals and ergonomic contours for all-day sonic clarity.',
    materials: ['Turned Solid Aluminium', 'Memory Acoustic Foam', 'Gold-Plated Contacts'],
    visualTheme: {
      accent: '#B0A89C',
      gradient: 'from-[#222120] via-[#383533] to-[#151413]',
      geometryType: 'acoustic',
    },
  },
  {
    id: 'cat-bags',
    number: '07',
    name: 'Bags',
    slug: 'bags-accessories',
    headline: 'FULL-GRAIN DISCIPLINED LEATHER',
    tagline: 'Italian pebble leather, hand-painted edges, and solid turned brass hardware.',
    philosophy:
      'Structured silhouettes stripped of superfluous ornament. Compartments engineered for modern devices, lined with plush micro-suede, and built for daily commute.',
    materials: ['Full-Grain Italian Pebble Leather', 'Solid Brushed Brass Clasp', 'Micro-Suede Lining'],
    visualTheme: {
      accent: '#C5A46D',
      gradient: 'from-[#1A1816] via-[#2A2622] to-[#11100F]',
      geometryType: 'leather',
    },
  },
];

export function CategoryRevealScene() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeCategory = CATEGORIES_DATA[activeIndex];

  return (
    <section className="relative w-full bg-[#FAF8F5] text-[#171717] py-20 lg:py-28 overflow-hidden select-none border-t border-[#E5DFD5]">
      {/* Background Architectural Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#EFE9DE_1px,transparent_1px),linear-gradient(to_bottom,#EFE9DE_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />

      <div className="relative z-10 max-w-[1380px] w-full mx-auto px-4 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-[#E5DFD5]">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A46D]" />
              <span className="font-nav text-xs font-medium tracking-[0.3em] uppercase text-[#C5A46D]">
                [SCENE III · CATEGORIES]
              </span>
            </div>
            <h2 className="font-editorial text-4xl sm:text-6xl uppercase tracking-tight mt-1 text-[#171717]">
              SEVEN <span className="italic font-light text-[#C5A46D]">DISCIPLINES</span>
            </h2>
          </div>

          <p className="max-w-md font-body text-xs sm:text-sm font-light text-[#635D55] leading-relaxed">
            Every category at AKSHARA represents a disciplined design inquiry. Zero compromise on raw material, precision engineering, or tactile honesty.
          </p>
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none border-b border-[#E5DFD5]/60">
          {CATEGORIES_DATA.map((cat, idx) => (
            <button
              key={cat.id}
              onClick={() => setActiveIndex(idx)}
              className={`px-4 sm:px-5 py-2.5 rounded-full text-xs font-nav uppercase tracking-[0.14em] whitespace-nowrap transition-all duration-300 cursor-pointer flex items-center gap-2 ${
                activeIndex === idx
                  ? 'bg-[#171717] text-[#FAF8F5] shadow-md scale-102'
                  : 'bg-white border border-[#E5DFD5] text-[#635D55] hover:border-[#171717] hover:text-[#171717]'
              }`}
            >
              <span className="text-[10px] text-[#C5A46D] font-mono">{cat.number}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Active Category Cinematic Presentation (Split Layout: Abstract Form + Editorial Story) */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Procedural Abstract Visual Architecture (No Products, Pure Form & Material) */}
          <div className="lg:col-span-6 relative aspect-square sm:aspect-[4/3] lg:aspect-[5/4] w-full rounded-sm overflow-hidden bg-[#171717] shadow-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className={`absolute inset-0 bg-gradient-to-br ${activeCategory.visualTheme.gradient} flex items-center justify-center p-8`}
              >
                {/* Visual Geometry Based on Discipline */}
                {activeCategory.visualTheme.geometryType === 'silk' && (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <svg className="w-4/5 h-4/5 stroke-[#D4B680] fill-none opacity-85" viewBox="0 0 200 200">
                      <path d="M 20 100 Q 60 20 100 100 T 180 100" strokeWidth="1.5" />
                      <path d="M 20 115 Q 60 35 100 115 T 180 115" strokeWidth="1.2" opacity="0.8" />
                      <path d="M 20 130 Q 60 50 100 130 T 180 130" strokeWidth="0.9" opacity="0.6" />
                      <path d="M 20 145 Q 60 65 100 145 T 180 145" strokeWidth="0.6" opacity="0.4" />
                    </svg>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,182,128,0.2)_0%,transparent_65%)]" />
                  </div>
                )}

                {activeCategory.visualTheme.geometryType === 'gold-ring' && (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="w-56 h-56 rounded-full border border-[#E5C07A]/50 flex items-center justify-center animate-[spin_40s_linear_infinite]">
                      <div className="w-44 h-44 rounded-full border-2 border-dashed border-[#E5C07A]/40 flex items-center justify-center">
                        <div className="w-32 h-32 rounded-full border border-[#E5C07A]/70 flex items-center justify-center shadow-[0_0_40px_rgba(229,192,122,0.3)]">
                          <div className="w-4 h-4 rounded-full bg-[#E5C07A] animate-ping" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeCategory.visualTheme.geometryType === 'dial' && (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="w-60 h-60 rounded-full border border-[#C5A46D]/60 flex items-center justify-center shadow-[0_0_50px_rgba(197,164,109,0.25)]">
                      {/* Guilloché radial tick marks */}
                      <div className="absolute inset-4 rounded-full border border-white/10" />
                      <div className="w-1 h-20 bg-gradient-to-t from-transparent via-[#C5A46D] to-white origin-bottom animate-[spin_12s_linear_infinite]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#C5A46D] z-10" />
                    </div>
                  </div>
                )}

                {activeCategory.visualTheme.geometryType === 'flacon' && (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="w-36 h-56 border border-[#E09F5A]/60 rounded-t-3xl flex flex-col items-center justify-between p-4 bg-gradient-to-b from-[#E09F5A]/10 to-[#E09F5A]/30 backdrop-blur-sm shadow-[0_0_40px_rgba(224,159,90,0.3)]">
                      <div className="w-12 h-6 border-b border-[#E09F5A]/80" />
                      <div className="w-16 h-16 rounded-full bg-[#E09F5A]/25 filter blur-md animate-pulse" />
                      <span className="text-[9px] font-mono tracking-widest text-[#E09F5A] uppercase">ALCHEMIA</span>
                    </div>
                  </div>
                )}

                {activeCategory.visualTheme.geometryType === 'travertine' && (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="w-64 h-48 border border-[#D5B581]/50 bg-[#2E2822] p-6 shadow-2xl flex flex-col justify-between">
                      <div className="space-y-2 opacity-50">
                        <div className="h-0.5 w-full bg-[#D5B581]/40" />
                        <div className="h-0.5 w-3/4 bg-[#D5B581]/30" />
                        <div className="h-0.5 w-1/2 bg-[#D5B581]/20" />
                      </div>
                      <span className="text-[10px] font-mono tracking-[0.25em] text-[#D5B581] uppercase">
                        MONOLITHIC MINERAL
                      </span>
                    </div>
                  </div>
                )}

                {activeCategory.visualTheme.geometryType === 'acoustic' && (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="relative flex items-center justify-center">
                      <div className="w-64 h-64 rounded-full border border-[#B0A89C]/30 animate-ping [animation-duration:3s]" />
                      <div className="w-48 h-48 rounded-full border border-[#B0A89C]/50 flex items-center justify-center">
                        <div className="w-32 h-32 rounded-full border-2 border-[#B0A89C] flex items-center justify-center">
                          <span className="text-[9px] font-mono tracking-widest text-[#B0A89C]">40MM DRIVER</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeCategory.visualTheme.geometryType === 'leather' && (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="w-56 h-64 border border-[#C5A46D]/50 bg-[#1D1B19] rounded-sm p-6 flex flex-col justify-between shadow-2xl">
                      <div className="w-12 h-12 rounded-sm border border-[#C5A46D]/60 flex items-center justify-center">
                        <div className="w-2 h-2 bg-[#C5A46D]" />
                      </div>
                      <span className="text-[10px] font-mono tracking-[0.25em] text-[#C5A46D] uppercase">
                        FULL-GRAIN PEBBLE
                      </span>
                    </div>
                  </div>
                )}

                {/* Corner Watermark */}
                <div className="absolute top-5 left-6 text-[10px] font-mono tracking-[0.25em] text-white/50 uppercase">
                  DISCIPLINE {activeCategory.number}
                </div>
                <div className="absolute bottom-5 right-6 text-[10px] font-mono tracking-[0.25em] text-[#C5A46D] uppercase">
                  AKSHARA ATELIER
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: Editorial Typography & Philosophy */}
          <div className="lg:col-span-6 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold tracking-[0.2em] text-[#C5A46D]">
                    [{activeCategory.number} / 07]
                  </span>
                  <span className="text-xs font-nav uppercase tracking-[0.2em] text-[#8C8478]">
                    {activeCategory.name}
                  </span>
                </div>

                <h3 className="font-editorial text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-[#171717] leading-[1.08]">
                  {activeCategory.headline}
                </h3>

                <p className="font-editorial italic text-base sm:text-lg text-[#C5A46D]">
                  {activeCategory.tagline}
                </p>

                <p className="font-body text-xs sm:text-sm font-light text-[#635D55] leading-relaxed">
                  {activeCategory.philosophy}
                </p>

                {/* Materials List */}
                <div className="pt-4 border-t border-[#E5DFD5]">
                  <p className="font-nav text-[10px] uppercase tracking-[0.24em] text-[#8C8478] mb-3">
                    AUTHENTIC MATERIAL COMPOSITION
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {activeCategory.materials.map((mat) => (
                      <span
                        key={mat}
                        className="px-3 py-1 bg-white border border-[#E5DFD5] text-[11px] font-nav text-[#171717]"
                      >
                        {mat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Category Action Link */}
                <div className="pt-4 flex items-center gap-4">
                  <Link
                    to={`/category/${activeCategory.slug}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#171717] hover:bg-[#C5A46D] text-[#FAF8F5] text-xs font-nav uppercase tracking-[0.16em] transition-colors"
                  >
                    <span>Explore {activeCategory.name}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>

                  <a
                    href={`#catalog-${activeCategory.slug}`}
                    className="inline-flex items-center gap-2 px-6 py-3 border border-[#E5DFD5] hover:border-[#171717] text-[#171717] text-xs font-nav uppercase tracking-[0.16em] transition-colors"
                  >
                    <span>View Objects In Grid</span>
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
