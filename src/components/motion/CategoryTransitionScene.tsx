import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ASSETS } from '../../services/seedData';

interface CategoryItem {
  id: string;
  number: string;
  name: string;
  slug: string;
  subtitle: string;
  image: string;
  hasProducts: boolean;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-fashion',
    number: '01',
    name: 'Fashion',
    slug: 'fashion-clothing',
    subtitle: 'Tailored wardrobe foundations in natural fibres.',
    image: ASSETS.fashionMerino,
    hasProducts: true,
  },
  {
    id: 'cat-jewellery',
    number: '02',
    name: 'Jewellery',
    slug: 'jewellery',
    subtitle: 'Sculptural precious metal & freshwater pearl accents.',
    image: ASSETS.jewelleryPendant,
    hasProducts: true,
  },
  {
    id: 'cat-watches',
    number: '03',
    name: 'Watches',
    slug: 'watches',
    subtitle: 'Horological timepieces. New editions in production.',
    image: ASSETS.watchDressHero,
    hasProducts: false,
  },
  {
    id: 'cat-beauty',
    number: '04',
    name: 'Beauty',
    slug: 'beauty-wellness',
    subtitle: 'Clinical botanicals and small-batch perfumery.',
    image: ASSETS.beautyParfum,
    hasProducts: true,
  },
  {
    id: 'cat-decor',
    number: '05',
    name: 'Home Décor',
    slug: 'home-decor',
    subtitle: 'Honed natural stone lighting and ceramic vessels.',
    image: ASSETS.decorLamp,
    hasProducts: true,
  },
  {
    id: 'cat-electronics',
    number: '06',
    name: 'Electronics',
    slug: 'electronics',
    subtitle: 'Acoustic audio objects crafted with solid metals.',
    image: ASSETS.electronicsSpeaker,
    hasProducts: true,
  },
  {
    id: 'cat-bags',
    number: '07',
    name: 'Bags',
    slug: 'bags-accessories',
    subtitle: 'Disciplined full-grain leather carry and totes.',
    image: ASSETS.bagsTote,
    hasProducts: true,
  },
];

export function CategoryTransitionScene() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeCategory = CATEGORIES[activeIndex];

  return (
    <section className="relative w-full bg-[#141312] text-[#F7F4EE] py-24 sm:py-32 border-t border-white/10 select-none">
      <div className="max-w-[1380px] w-full mx-auto px-4 sm:px-8 lg:px-12">
        {/* Section Intro: Approved Brand Identity only */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-white/10">
          <div>
            <p className="font-nav text-xs uppercase tracking-[0.32em] text-[#C5A46D] font-medium">
              AKSHARA LIFESTYLE
            </p>
            <h2 className="font-editorial text-4xl sm:text-6xl uppercase tracking-tight mt-1 text-[#F7F4EE]">
              SEVEN <span className="italic font-light text-[#C5A46D]">CATEGORIES</span>
            </h2>
          </div>

          <p className="max-w-md font-body text-xs sm:text-sm font-light text-[#A69C8E] leading-relaxed">
            A multi-category lifestyle destination uniting independent ateliers across fashion, jewellery, horology, beauty, living, audio, and leather carry.
          </p>
        </div>

        {/* Category Horizontal Selector Pills */}
        <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none border-b border-white/10">
          {CATEGORIES.map((cat, idx) => (
            <button
              key={cat.id}
              onClick={() => setActiveIndex(idx)}
              className={`px-4 sm:px-5 py-2.5 rounded-full text-xs font-nav uppercase tracking-[0.16em] whitespace-nowrap transition-all duration-300 cursor-pointer flex items-center gap-2 ${
                activeIndex === idx
                  ? 'bg-[#C5A46D] text-[#0B0B0B] font-semibold shadow-lg scale-102'
                  : 'bg-[#1E1C1A] border border-white/10 text-[#A69C8E] hover:border-white/30 hover:text-white'
              }`}
            >
              <span className="text-[10px] font-mono opacity-80">{cat.number}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Active Category Presentation (Dialed Coffee inspired split transition) */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Left Column: Authentic Still-Life Presentation with Mask Reveal */}
          <div className="lg:col-span-7 relative aspect-[4/3] sm:aspect-[16/10] w-full rounded-sm overflow-hidden bg-[#1A1816] border border-white/10 shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory.id}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full h-full"
              >
                <img
                  src={activeCategory.image}
                  alt={activeCategory.name}
                  className="w-full h-full object-cover filter contrast-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0C0B0A] via-transparent to-transparent opacity-60" />

                <div className="absolute bottom-6 left-6 text-xs font-mono tracking-widest text-[#C5A46D] uppercase">
                  {activeCategory.number} / 07 · {activeCategory.name}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: Editorial Typography & Intentional Category Actions */}
          <div className="lg:col-span-5 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div>
                  <span className="text-xs font-mono tracking-[0.25em] text-[#C5A46D] uppercase">
                    CATEGORY {activeCategory.number}
                  </span>
                  <h3 className="font-editorial text-4xl sm:text-5xl uppercase tracking-tight text-[#F7F4EE] mt-1">
                    {activeCategory.name}
                  </h3>
                  <p className="font-body text-xs sm:text-sm font-light text-[#A69C8E] mt-3 leading-relaxed">
                    {activeCategory.subtitle}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10">
                  {activeCategory.hasProducts ? (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <Link
                        to={`/category/${activeCategory.slug}`}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#C5A46D] hover:bg-[#D4B680] text-[#0B0B0B] text-xs font-nav uppercase tracking-[0.16em] font-semibold transition-colors"
                      >
                        <span>Explore {activeCategory.name}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>

                      <a
                        href={`#catalog-${activeCategory.slug}`}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-white/20 hover:border-white text-white text-xs font-nav uppercase tracking-[0.16em] transition-colors"
                      >
                        <span>View In Catalogue</span>
                      </a>
                    </div>
                  ) : (
                    <div className="p-5 bg-white/[0.04] border border-white/10 rounded-sm space-y-2">
                      <p className="text-xs font-nav uppercase tracking-widest text-[#C5A46D]">
                        Catalogue Status
                      </p>
                      <p className="font-body text-xs text-[#A69C8E]">
                        Our horological collection is currently in studio development. New timepiece editions will be announced shortly.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
