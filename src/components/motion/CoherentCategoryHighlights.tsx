import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ASSETS } from '../../services/seedData';
import { SafeImage } from '../SafeImage';

export function CoherentCategoryHighlights() {
  const highlights = [
    {
      category: 'HOROLOGY & WATCHES',
      title: "AKSHARA Horlogerie 'Kala' Automatic",
      subtitle: '38.5mm mechanical dress timepiece with double-domed sapphire crystal.',
      image: ASSETS.watchDressHero,
      link: '/category/watches',
      cta: 'Explore Timepieces',
      accent: 'Caliber AKS-CAL-2800 · 28,800 VPH High-Beat Caliber',
      price: '₹38,500',
    },
    {
      category: 'FINE JEWELLERY',
      title: 'Signature Lotus Petal 18k Vermeil',
      subtitle: 'Sculptural botanical motifs cast in heavy 18k gold over sterling silver.',
      image: ASSETS.jewelleryPendant,
      link: '/category/jewellery',
      cta: 'Explore Fine Jewellery',
      accent: '18k Champagne Gold Vermeil · Recycled 925 Silver Base',
      price: '₹4,850',
    },
    {
      category: 'BAGS & LEATHER ACCESSORIES',
      title: 'Structured Full-Grain Leather Work Tote',
      subtitle: 'Architectural proportion in pebble-grain Tuscan calf with brass hardware.',
      image: ASSETS.bagsTote,
      link: '/category/bags-accessories',
      cta: 'Explore Leather Carry',
      accent: 'Full-Grain Pebble Leather · Padded 15" Laptop Compartment',
      price: '₹9,800',
    },
    {
      category: 'HOME & ARCHITECTURAL OBJECTS',
      title: 'Monolithic Fluted Travertine Table Lamp',
      subtitle: 'Hand-carved solid travertine stone casting warm 2700K ambient illumination.',
      image: ASSETS.decorLamp,
      link: '/category/home-decor',
      cta: 'Explore Living Objects',
      accent: 'Solid Natural Travertine Stone · Oatmeal Linen Drum Shade',
      price: '₹8,900',
    },
  ];

  return (
    <section className="bg-[#141312] text-[#F7F3EB] py-20 lg:py-28 border-t border-white/10">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C6A15B]/15 border border-[#C6A15B]/30 rounded-full mb-3">
              <Sparkles className="w-3 h-3 text-[#C6A15B]" />
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#C6A15B]">
                DISCIPLINE SPOTLIGHTS
              </span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-5xl text-[#F7F3EB]">
              Dedicated Category Campaigns
            </h2>
          </div>
          <p className="text-xs font-mono text-[#8C8375] max-w-sm sm:text-right">
            Coherent singular product stories across our specialist departments.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
          {highlights.map((item) => (
            <div
              key={item.category}
              className="group relative bg-[#1B1917] rounded-sm border border-white/10 overflow-hidden flex flex-col justify-between"
            >
              <div className="relative aspect-[16/11] w-full overflow-hidden bg-[#242220]">
                <SafeImage
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1B1917] via-transparent to-transparent opacity-90" />
                <div className="absolute top-4 left-4 px-3 py-1 bg-black/70 backdrop-blur-sm border border-white/15 rounded-full text-[10px] font-mono tracking-widest uppercase text-[#C6A15B]">
                  {item.category}
                </div>
              </div>

              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-editorial text-2xl sm:text-3xl text-[#F7F3EB] group-hover:text-[#C6A15B] transition-colors">
                      {item.title}
                    </h3>
                    <span className="font-editorial text-xl text-[#C6A15B] shrink-0 font-medium">
                      {item.price}
                    </span>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-[#A89F91] leading-relaxed font-light">
                    {item.subtitle}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#7D766C] tracking-wide line-clamp-1">
                    {item.accent}
                  </span>
                  <Link
                    to={item.link}
                    className="inline-flex items-center gap-1.5 text-xs font-mono tracking-wider uppercase text-[#C6A15B] hover:text-white transition-colors shrink-0 ml-3"
                  >
                    <span>{item.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
