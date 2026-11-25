import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, Sparkles, Layers, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AbstractDiscipline {
  id: string;
  number: string;
  title: string;
  discipline: string;
  tagline: string;
  philosophy: string;
  materials: string[];
  categorySlug: string;
  abstractVisual: {
    gradient: string;
    accentColor: string;
    textureStyle: string;
    geometryType: 'ribbon' | 'ring' | 'prism' | 'stone' | 'flacon' | 'radial';
  };
}

const DISCIPLINES: AbstractDiscipline[] = [
  {
    id: 'disc-textiles',
    number: '01',
    discipline: 'ATELIER & TEXTILES',
    title: 'THE DRAPERY OF NATURAL FIBRES',
    tagline: 'Belgian flax linen, handloom Chanderi silk, and extrafine merino wool.',
    philosophy:
      'We work exclusively with unadulterated natural yarns. Breathable weaves engineered with architectural structure that soften and gain character through decades of wear.',
    materials: ['Belgian Flax Linen', 'Handloom Chanderi Silk', 'Extrafine Merino'],
    categorySlug: 'fashion-clothing',
    abstractVisual: {
      gradient: 'from-[#3A332B] via-[#615649] to-[#1E1B18]',
      accentColor: '#D8C39D',
      textureStyle: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 2px, transparent 2px, transparent 12px)',
      geometryType: 'ribbon',
    },
  },
  {
    id: 'disc-metallurgy',
    number: '02',
    discipline: 'FINE METALLURGY',
    title: 'SACRED GEOMETRY IN 18K GOLD VERMEIL',
    tagline: 'Jaipur artisanal metallurgy, solid 925 silver, and baroque pearls.',
    philosophy:
      'Echoing the quiet symmetry of the sacred lotus petal. Each heirloom accent is hand-finished with satin brushing to reflect ambient daylight with a soft, warm luster.',
    materials: ['18K Champagne Gold Vermeil', 'Solid 925 Silver', 'Baroque Freshwater Pearl'],
    categorySlug: 'jewellery',
    abstractVisual: {
      gradient: 'from-[#42331E] via-[#85673C] to-[#241B0E]',
      accentColor: '#E5C07A',
      textureStyle: 'radial-gradient(circle at 50% 40%, rgba(229,192,122,0.25) 0%, transparent 65%)',
      geometryType: 'ring',
    },
  },
  {
    id: 'disc-carry',
    number: '03',
    discipline: 'ARCHITECTURAL CARRY',
    title: 'FULL-GRAIN DISCIPLINED LEATHER',
    tagline: 'Italian pebble leather, hand-painted edges, and solid turned brass.',
    philosophy:
      'Structured bags stripped of superfluous ornament. Designed with interior compartments engineered for modern tech, lined with plush micro-suede, and built for daily commute.',
    materials: ['Full-Grain Italian Pebble Leather', 'Solid Brushed Brass Clasp', 'Micro-Suede'],
    categorySlug: 'bags-accessories',
    abstractVisual: {
      gradient: 'from-[#1A1816] via-[#2A2622] to-[#11100F]',
      accentColor: '#C5A46D',
      textureStyle: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
      geometryType: 'prism',
    },
  },
  {
    id: 'disc-living',
    number: '04',
    discipline: 'SCULPTURAL LIVING',
    title: 'HONED STONE & AMBIENT ILLUMINATION',
    tagline: 'Monolithic travertine minerals, pleated Belgian linen, and matte stoneware.',
    philosophy:
      'Objects that create sanctuary. Honed natural mineral pedestals whose organic pores ground modern living spaces in geological permanence and calming warm light.',
    materials: ['Solid Italian Honed Travertine', 'Hand-Pleated Linen', 'Artisanal Stoneware'],
    categorySlug: 'home-decor',
    abstractVisual: {
      gradient: 'from-[#38332C] via-[#5C5449] to-[#211E1A]',
      accentColor: '#D5B581',
      textureStyle: 'repeating-linear-gradient(-35deg, rgba(213,181,129,0.06) 0px, transparent 4px, transparent 20px)',
      geometryType: 'stone',
    },
  },
  {
    id: 'disc-apothecary',
    number: '05',
    discipline: 'BOTANICAL ALCHEMY',
    title: 'WILD OUD & CLINICAL BOTANICALS',
    tagline: 'Cold-pressed Kashmiri saffron, wild Deccan oud, and amber glass.',
    philosophy:
      'Sensory rituals formulated with uncompromising purity. Distilled extracts and cold-pressed botanical oils preserved in heavy UV-protective pharmaceutical glass flacons.',
    materials: ['Kashmiri Saffron Stigmas', 'Wild-Harvested Deccan Oud', 'Amber Glass'],
    categorySlug: 'beauty-cosmetics',
    abstractVisual: {
      gradient: 'from-[#331821] via-[#592637] to-[#1C0D12]',
      accentColor: '#D88E9E',
      textureStyle: 'radial-gradient(circle at 60% 50%, rgba(216,142,158,0.2) 0%, transparent 70%)',
      geometryType: 'flacon',
    },
  },
  {
    id: 'disc-horology',
    number: '06',
    discipline: 'PRECISION INSTRUMENTS',
    title: 'MECHANICAL HOROLOGY & ACOUSTICS',
    tagline: 'High-beat automatic calibers, anti-reflective sapphire, and acoustic wool.',
    philosophy:
      'Everyday instruments that respect the intelligence of the wearer. Handcrafted 316L stainless steel cases, double-domed sapphire crystals, and uncoloured acoustic clarity.',
    materials: ['316L Surgical Stainless Steel', 'Double-Domed Sapphire', 'Acoustic Wool'],
    categorySlug: 'watches',
    abstractVisual: {
      gradient: 'from-[#191D24] via-[#2F3642] to-[#101216]',
      accentColor: '#9BB4D4',
      textureStyle: 'repeating-radial-gradient(circle, transparent 0, transparent 8px, rgba(155,180,212,0.04) 9px, transparent 10px)',
      geometryType: 'radial',
    },
  },
];

export function AbstractCategoryStorytellingScene() {
  const [activeId, setActiveId] = useState(DISCIPLINES[0].id);
  const current = DISCIPLINES.find((d) => d.id === activeId) || DISCIPLINES[0];

  return (
    <section className="relative w-full bg-[#171615] text-[#F7F4EE] py-24 lg:py-36 border-t border-white/10 select-none overflow-hidden">
      {/* Ambient Radial Shift */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 transition-all duration-700"
        style={{
          background: `radial-gradient(circle at 70% 50%, ${current.abstractVisual.accentColor}33 0%, transparent 65%)`,
        }}
      />

      <div className="relative z-10 max-w-[1380px] w-full mx-auto px-6 sm:px-10 lg:px-12">
        {/* Section Intro */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A46D]" />
              <span className="font-nav text-xs tracking-[0.3em] uppercase text-[#C5A46D] font-medium">
                [SCENE III · DISCIPLINED ATELIER]
              </span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight mt-2 text-[#F7F4EE]">
              SIX CREATIVE <span className="italic font-light text-[#C5A46D]">DOMAINS</span>
            </h2>
          </div>

          <p className="max-w-md font-body text-xs sm:text-sm text-[#A69C8E] font-light leading-relaxed">
            Pure material exploration across textiles, precious metallurgy, leather architecture, honed minerals, and mechanical timekeeping.
          </p>
        </div>

        {/* Interactive Discipline Selector Tabs */}
        <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none border-b border-white/5">
          {DISCIPLINES.map((d) => (
            <button
              key={d.id}
              onClick={() => setActiveId(d.id)}
              className={`px-4 sm:px-5 py-2.5 rounded-full text-xs font-nav font-medium tracking-wider uppercase whitespace-nowrap transition-all duration-300 cursor-pointer ${
                activeId === d.id
                  ? 'bg-[#C5A46D] text-[#141312] shadow-lg'
                  : 'bg-white/[0.04] text-[#A69C8E] hover:text-[#F7F4EE] hover:bg-white/[0.08] border border-white/10'
              }`}
            >
              {d.number} · {d.discipline}
            </button>
          ))}
        </div>

        {/* =========================================================================
            STAGE: ABSTRACT SCULPTURAL VISUALIZATION + EDITORIAL NARRATIVE
            ========================================================================= */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -25 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mt-12 lg:mt-16"
          >
            {/* Left Column: Editorial Philosophy (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-mono font-medium text-[#C5A46D]">
                  DISCIPLINE {current.number}
                </span>
                <span className="w-6 h-[1px] bg-[#C5A46D]/40" />
                <span className="text-[11px] font-mono tracking-widest uppercase text-[#A69C8E]">
                  MATERIAL ARCHIVE
                </span>
              </div>

              {/* Title with Clipping Mask */}
              <div className="overflow-hidden py-1">
                <motion.h3
                  initial={{ y: '90%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="font-editorial text-3xl sm:text-4xl lg:text-5xl uppercase leading-[1.04] text-[#F7F4EE]"
                >
                  {current.title}
                </motion.h3>
              </div>

              <p className="mt-3 font-nav text-xs sm:text-sm tracking-wide text-[#C5A46D]">
                {current.tagline}
              </p>

              <p className="mt-4 font-body text-xs sm:text-sm text-[#A69C8E] leading-relaxed font-light">
                {current.philosophy}
              </p>

              {/* Material Badges */}
              <div className="mt-6 flex flex-wrap gap-2">
                {current.materials.map((mat, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-white/[0.04] border border-white/10 rounded-full text-[10px] font-mono text-[#D5CDBC] tracking-wider uppercase"
                  >
                    {mat}
                  </span>
                ))}
              </div>

              {/* Direct Link to Category in the Shopping Section */}
              <div className="mt-8">
                <a
                  href={`#catalog-${current.categorySlug}`}
                  className="group inline-flex items-center gap-3 px-7 py-3.5 bg-white/[0.06] hover:bg-[#C5A46D] text-[#F7F4EE] hover:text-[#141312] border border-white/15 hover:border-[#C5A46D] rounded-full text-xs font-nav font-medium uppercase tracking-[0.2em] transition-all duration-300"
                >
                  <span>VIEW {current.discipline} OBJECTS</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            </div>

            {/* Right Column: Abstract Sculptural Visual Composition (7 cols) */}
            <div className="lg:col-span-7 relative flex items-center justify-center">
              <div
                className={`relative w-full max-w-lg aspect-[4/3] sm:aspect-[16/10] rounded-sm overflow-hidden border border-white/15 shadow-2xl bg-gradient-to-br ${current.abstractVisual.gradient} flex items-center justify-center`}
              >
                {/* Texture Grid Pattern */}
                <div
                  className="absolute inset-0 opacity-40 pointer-events-none"
                  style={{ backgroundImage: current.abstractVisual.textureStyle }}
                />

                {/* Abstract Sculptural Graphic Form (Zero Products, Pure Form & Material) */}
                {current.abstractVisual.geometryType === 'ribbon' && (
                  <svg viewBox="0 0 400 300" className="w-3/4 h-3/4 text-white/30" fill="none">
                    <path
                      d="M 40 180 C 120 40, 260 260, 360 120"
                      stroke={current.abstractVisual.accentColor}
                      strokeWidth="24"
                      strokeLinecap="round"
                      className="opacity-75 filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                    />
                    <path
                      d="M 60 195 C 140 70, 280 275, 375 140"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="3"
                    />
                  </svg>
                )}

                {current.abstractVisual.geometryType === 'ring' && (
                  <div className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-full border-8 border-[#E5C07A]/50 shadow-[0_0_50px_rgba(229,192,122,0.35)] flex items-center justify-center animate-[spin_30s_linear_infinite]">
                    <div className="w-36 h-36 rounded-full border-2 border-white/30 border-dashed" />
                  </div>
                )}

                {current.abstractVisual.geometryType === 'prism' && (
                  <div className="w-48 h-48 sm:w-60 sm:h-60 bg-gradient-to-tr from-white/10 to-transparent border border-white/20 transform rotate-12 skew-y-6 shadow-2xl backdrop-blur-md relative">
                    <div className="absolute inset-2 border border-[#C5A46D]/40" />
                  </div>
                )}

                {current.abstractVisual.geometryType === 'stone' && (
                  <div className="w-56 h-40 sm:w-72 sm:h-48 bg-[#D5B581]/20 border border-[#D5B581]/40 rounded-sm shadow-2xl relative overflow-hidden flex items-center justify-center">
                    <div className="w-full h-[1px] bg-white/25 absolute top-1/3" />
                    <div className="w-full h-[1px] bg-white/15 absolute top-2/3" />
                    <span className="font-editorial text-2xl text-[#D5B581]/60 tracking-widest uppercase">
                      TRAVERTINE
                    </span>
                  </div>
                )}

                {current.abstractVisual.geometryType === 'flacon' && (
                  <div className="w-36 h-52 sm:w-44 sm:h-60 rounded-t-sm rounded-b-md bg-gradient-to-t from-[#D88E9E]/25 via-white/10 to-transparent border border-[#D88E9E]/40 shadow-2xl relative flex items-center justify-center backdrop-blur-sm">
                    <div className="w-16 h-8 bg-black/60 border border-white/20 -top-8 absolute rounded-t-xs" />
                  </div>
                )}

                {current.abstractVisual.geometryType === 'radial' && (
                  <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-full border border-[#9BB4D4]/30 flex items-center justify-center">
                    <div className="w-36 h-36 rounded-full border border-dashed border-[#9BB4D4]/50 animate-[spin_24s_linear_infinite]" />
                    <div className="w-20 h-20 rounded-full border border-white/40" />
                    <div className="w-2 h-2 rounded-full bg-[#9BB4D4]" />
                  </div>
                )}

                <div className="absolute bottom-4 left-4 z-10 text-[10px] font-mono text-[#A69C8E] tracking-widest uppercase">
                  ABSTRACT MATERIAL STUDY · NO PRODUCT PROMOTIONS
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
