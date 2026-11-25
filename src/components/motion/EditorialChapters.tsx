import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, Sparkles, Sun, Moon, Sunset, Eye } from 'lucide-react';
import { ASSETS } from '../../services/seedData';
import { SafeImage } from '../SafeImage';

export function EditorialChapters() {
  // State for Section F: Lighting interactive mood toggle
  const [lightingMood, setLightingMood] = useState<'day' | 'dusk' | 'night'>('dusk');

  return (
    <div className="relative w-full overflow-hidden bg-[#171717] text-[#F7F3EB]">
      {/* =========================================================================
          SECTION A — THE COLLECTION: "CURATED FOR EVERYDAY."
          ========================================================================= */}
      <section className="relative w-full min-h-screen py-24 sm:py-32 bg-[#121110] border-t border-white/10 flex items-center">
        <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 pb-12 border-b border-white/10">
            <div>
              <p className="text-[10px] font-mono tracking-[0.26em] uppercase text-[#C6A15B]">
                SECTION 01 / CHAPTER ARCHIVE
              </p>
              <h2 className="mt-2 font-editorial text-4xl sm:text-6xl lg:text-7xl leading-[1.02] tracking-[-0.01em] text-[#F7F3EB]">
                CURATED FOR
                <br />
                <span className="italic text-[#C6A15B]">EVERYDAY.</span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#A89D8F] max-w-md leading-relaxed font-light">
              A cohesive wardrobe and living landscape built on architectural proportion, natural fibers, and enduring Indian artisanal handcraft.
            </p>
          </div>

          {/* Editorial 3-Column Visual Rhythm */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {/* Visual 1: Chanderi Draped Kurta */}
            <Link
              to="/product/ivory-chanderi-silk-draped-kurta-set"
              className="group relative h-[440px] sm:h-[520px] rounded-sm overflow-hidden border border-white/10 bg-[#1A1816]"
            >
              <SafeImage
                src={ASSETS.fashionKurta}
                alt="Chanderi Silk Drapery"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B]/85 via-black/20 to-transparent" />
              <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[9px] font-mono tracking-widest uppercase text-[#C6A15B]">
                FASHION ATELIER
              </div>
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-xs font-mono tracking-wider text-[#C6A15B] uppercase">NO. 01</p>
                <h3 className="font-editorial text-2xl text-[#F7F3EB] group-hover:text-[#C6A15B] transition-colors mt-1">
                  Chanderi Silk Drapery
                </h3>
                <p className="text-[11px] text-[#A89D8F] mt-1 font-light">Handwoven in Madhya Pradesh</p>
              </div>
            </Link>

            {/* Visual 2: Jaipur Gold Sculptural Cuff */}
            <Link
              to="/product/hammered-champagne-gold-cuff-and-hoops"
              className="group relative h-[440px] sm:h-[520px] rounded-sm overflow-hidden border border-white/10 bg-[#1A1816] md:-translate-y-6 transition-transform"
            >
              <SafeImage
                src={ASSETS.jewelleryCuff}
                alt="Jaipur Hammered Gold"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B]/85 via-black/20 to-transparent" />
              <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[9px] font-mono tracking-widest uppercase text-[#C6A15B]">
                FINE JEWELLERY
              </div>
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-xs font-mono tracking-wider text-[#C6A15B] uppercase">NO. 02</p>
                <h3 className="font-editorial text-2xl text-[#F7F3EB] group-hover:text-[#C6A15B] transition-colors mt-1">
                  Jaipur Sculptural Cuff
                </h3>
                <p className="text-[11px] text-[#A89D8F] mt-1 font-light">Hand-hammered 18k Champagne Gold</p>
              </div>
            </Link>

            {/* Visual 3: Saddle Leather Carry */}
            <Link
              to="/product/miras-camel-smooth-leather-saddle-crossbody"
              className="group relative h-[440px] sm:h-[520px] rounded-sm overflow-hidden border border-white/10 bg-[#1A1816]"
            >
              <SafeImage
                src={ASSETS.bagsCrossbody}
                alt="Saddle Leather Carry"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B]/85 via-black/20 to-transparent" />
              <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[9px] font-mono tracking-widest uppercase text-[#C6A15B]">
                LEATHER ATELIER
              </div>
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-xs font-mono tracking-wider text-[#C6A15B] uppercase">NO. 03</p>
                <h3 className="font-editorial text-2xl text-[#F7F3EB] group-hover:text-[#C6A15B] transition-colors mt-1">
                  Smooth Saddle Crossbody
                </h3>
                <p className="text-[11px] text-[#A89D8F] mt-1 font-light">Tuscan Full-Grain Vegetable Tanned</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION B — WOMEN'S FASHION: "MAKE AN ENTRANCE."
          ========================================================================= */}
      <section className="relative w-full min-h-screen py-24 sm:py-32 bg-[#F7F3EB] text-[#171717]">
        <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* Left Narrative Column */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-[10px] font-mono tracking-[0.24em] uppercase text-[#C6A15B] font-semibold">
                SECTION 02 / WOMEN'S READY-TO-WEAR
              </span>
              <h2 className="font-editorial text-5xl sm:text-7xl leading-[0.98] tracking-[-0.01em] text-[#171717]">
                MAKE AN
                <br />
                <span className="italic text-[#C6A15B]">ENTRANCE.</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#5C564E] leading-relaxed font-light">
                Sculptural cuts, raw slub textures, and effortless fluidity. Designed to move with quiet presence through boardroom mornings, evening gallery previews, and celebratory gatherings.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-4 text-xs font-mono">
                <div className="border-l-2 border-[#C6A15B] pl-4">
                  <p className="font-semibold text-[#171717]">100% BELGIAN FLAX</p>
                  <p className="text-[#8C8375] text-[11px] mt-0.5">Breathable year-round tailoring</p>
                </div>
                <div className="border-l-2 border-[#C6A15B] pl-4">
                  <p className="font-semibold text-[#171717]">MULBERRY SILK</p>
                  <p className="text-[#8C8375] text-[11px] mt-0.5">Naturally lustrous natural drape</p>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  to="/category/fashion-clothing"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#171717] hover:bg-[#0B0B0B] text-white text-xs uppercase tracking-[0.18em] font-medium transition-colors"
                >
                  <span>EXPLORE WOMEN'S FASHION</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Cinematic Parallax Gallery */}
            <div className="lg:col-span-7 grid grid-cols-2 gap-4 sm:gap-6">
              <div className="relative aspect-[3/4] rounded-sm overflow-hidden shadow-xl">
                <SafeImage
                  src={ASSETS.fashionBlazer}
                  alt="Architectural Sand Linen Blazer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 px-3 py-1 bg-white/85 backdrop-blur-md rounded text-[10px] font-mono tracking-wider text-[#171717]">
                  SAND LINEN BLAZER
                </div>
              </div>
              <div className="relative aspect-[3/4] rounded-sm overflow-hidden shadow-xl translate-y-6 sm:translate-y-12">
                <SafeImage
                  src={ASSETS.heroCampaign}
                  alt="Atelier Campaign Look"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 px-3 py-1 bg-white/85 backdrop-blur-md rounded text-[10px] font-mono tracking-wider text-[#171717]">
                  ATELIER ARCHIVE
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION C — JEWELLERY & HOROLOGY: "THE POWER IS IN THE DETAILS."
          ========================================================================= */}
      <section className="relative w-full min-h-screen py-24 sm:py-32 bg-[#30231C] text-[#F7F3EB] flex items-center">
        <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-12">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-[10px] font-mono tracking-[0.28em] uppercase text-[#C6A15B]">
              SECTION 03 / FINE JEWELLERY & HOROLOGY
            </span>
            <h2 className="font-editorial text-4xl sm:text-6xl lg:text-7xl leading-[1.02] tracking-[-0.01em]">
              THE POWER IS IN
              <br />
              <span className="italic text-[#C6A15B]">THE DETAILS.</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#D9CFC4] leading-relaxed font-light">
              Micro-sculpted gold, hand-set baroque pearls, and mechanical automatic movements engineered for a lifetime of daily tactile appreciation.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Jewel 1: 18k Lotus Pendant */}
            <div className="group relative aspect-square rounded-sm overflow-hidden bg-[#241A14] border border-[#594236] p-6 flex flex-col justify-between">
              <SafeImage
                src={ASSETS.jewelleryPendant}
                alt="Lotus Petal 18k Gold Pendant"
                className="w-full h-full object-cover absolute inset-0 transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              <div className="relative z-10 flex justify-between items-center text-[10px] font-mono text-[#C6A15B]">
                <span>18K GOLD</span>
                <span>JAIPUR SILVERSMITHS</span>
              </div>
              <div className="relative z-10">
                <h3 className="font-editorial text-2xl text-white">Lotus Petal Pendant</h3>
                <Link
                  to="/product/lotus-petal-18k-gold-pendant"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#C6A15B] hover:text-white uppercase tracking-wider font-mono"
                >
                  <span>View Specifications</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Jewel 2: Automatic Horology Watch */}
            <div className="group relative aspect-square rounded-sm overflow-hidden bg-[#241A14] border border-[#C6A15B]/50 p-6 flex flex-col justify-between shadow-2xl">
              <SafeImage
                src={ASSETS.watchDressHero}
                alt="The Horloger 38mm Automatic Dress Watch"
                className="w-full h-full object-cover absolute inset-0 transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              <div className="relative z-10 flex justify-between items-center text-[10px] font-mono text-[#C6A15B]">
                <span>MECHANICAL AUTOMATIC</span>
                <span>42H POWER RESERVE</span>
              </div>
              <div className="relative z-10">
                <h3 className="font-editorial text-2xl text-white">The Horloger 38mm</h3>
                <Link
                  to="/product/the-horloger-38mm-automatic-dress-watch"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#C6A15B] hover:text-white uppercase tracking-wider font-mono"
                >
                  <span>Explore Horology</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Jewel 3: Baroque Pearl Drops */}
            <div className="group relative aspect-square rounded-sm overflow-hidden bg-[#241A14] border border-[#594236] p-6 flex flex-col justify-between">
              <SafeImage
                src={ASSETS.jewelleryPearl}
                alt="Baroque Pearl Drop Earrings"
                className="w-full h-full object-cover absolute inset-0 transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              <div className="relative z-10 flex justify-between items-center text-[10px] font-mono text-[#C6A15B]">
                <span>FRESHWATER BAROQUE</span>
                <span>HYPOALLERGENIC</span>
              </div>
              <div className="relative z-10">
                <h3 className="font-editorial text-2xl text-white">Baroque Pearl Drops</h3>
                <Link
                  to="/product/freshwater-baroque-pearl-statement-drop-earrings"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#C6A15B] hover:text-white uppercase tracking-wider font-mono"
                >
                  <span>View Specifications</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION D — BAGS & ACCESSORIES: "CARRY YOUR OWN STYLE."
          ========================================================================= */}
      <section className="relative w-full py-24 sm:py-32 bg-[#EFECE6] text-[#171717]">
        <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-12 border-b border-[#D4CCC2]">
            <div>
              <p className="text-[10px] font-mono tracking-[0.24em] uppercase text-[#A06535] font-semibold">
                SECTION 04 / LEATHER ATELIER
              </p>
              <h2 className="mt-2 font-editorial text-5xl sm:text-7xl leading-[0.98] tracking-[-0.01em]">
                CARRY YOUR
                <br />
                <span className="italic text-[#A06535]">OWN STYLE.</span>
              </h2>
            </div>
            <Link
              to="/category/bags-accessories"
              className="px-6 py-3 border border-[#171717] hover:bg-[#171717] hover:text-white text-xs uppercase tracking-[0.16em] font-semibold transition-all inline-flex items-center gap-2"
            >
              <span>DISCOVER ALL CARRY</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 sm:p-10 rounded-sm shadow-sm flex flex-col justify-between">
              <div className="aspect-[4/3] rounded-sm overflow-hidden mb-6">
                <SafeImage
                  src={ASSETS.bagsCrossbody}
                  alt="Camel Smooth Leather Saddle Crossbody"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#A06535]">
                  VEGETABLE TANNED
                </span>
                <h3 className="font-editorial text-3xl text-[#171717]">Saddle Leather Crossbody</h3>
                <p className="text-xs text-[#6E6961] leading-relaxed">
                  Sculpted with an adjustable strap, brass hardware and microsuede interior for hands-free movement.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-10 rounded-sm shadow-sm flex flex-col justify-between">
              <div className="aspect-[4/3] rounded-sm overflow-hidden mb-6">
                <SafeImage
                  src={ASSETS.bagsTote}
                  alt="Architectural Structured Leather Tote"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#A06535]">
                  LWG CERTIFIED PEBBLE
                </span>
                <h3 className="font-editorial text-3xl text-[#171717]">Architectural Structured Tote</h3>
                <p className="text-xs text-[#6E6961] leading-relaxed">
                  Houses a 14-inch laptop and daily essentials with solid brass base feet and reinforced magnetic clasp.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION E — HOME & LIVING: "MAKE SPACE FOR BEAUTY."
          ========================================================================= */}
      <section className="relative w-full py-24 sm:py-32 bg-[#F7F3EB] text-[#171717]">
        <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 relative aspect-[4/3] sm:aspect-[16/11] rounded-sm overflow-hidden shadow-2xl">
              <SafeImage
                src={ASSETS.editorialLiving}
                alt="Editorial Curated Living"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/10" />
            </div>

            <div className="lg:col-span-6 space-y-6 lg:pl-6">
              <span className="text-[10px] font-mono tracking-[0.24em] uppercase text-[#C6A15B] font-semibold">
                SECTION 05 / HOME ARCHITECTURE
              </span>
              <h2 className="font-editorial text-5xl sm:text-7xl leading-[0.98] tracking-[-0.01em]">
                MAKE SPACE
                <br />
                <span className="italic text-[#C6A15B]">FOR BEAUTY.</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#5C564E] leading-relaxed font-light">
                Hand-thrown Bengaluru ceramic stoneware, carved Indian sandstones, and acoustic audio systems designed to enrich the quiet hours spent within your sanctuary.
              </p>

              <div className="pt-2">
                <Link
                  to="/category/home-decor"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#171717] hover:bg-[#0B0B0B] text-white text-xs uppercase tracking-[0.18em] font-medium transition-colors"
                >
                  <span>EXPLORE HOME & DÉCOR</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION F — LIGHTING & MOOD: "SET THE MOOD."
          Interactive Lighting Day/Dusk/Night ambient transition
          ========================================================================= */}
      <section
        className={`relative w-full py-28 sm:py-36 transition-colors duration-1000 ease-in-out ${
          lightingMood === 'day'
            ? 'bg-[#EFEAE1] text-[#171717]'
            : lightingMood === 'dusk'
            ? 'bg-[#211915] text-[#F7F3EB]'
            : 'bg-[#0E0C0B] text-[#F7F3EB]'
        }`}
      >
        <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Lighting Mood Switcher & Editorial */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-[#C6A15B]" />
                <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#C6A15B]">
                  INTERACTIVE LIGHTING LAB
                </span>
              </div>

              <h2 className="font-editorial text-5xl sm:text-7xl leading-[0.98] tracking-[-0.01em]">
                SET THE
                <br />
                <span className="italic text-[#C6A15B]">MOOD.</span>
              </h2>

              <p className="text-xs sm:text-sm leading-relaxed max-w-md font-light opacity-80">
                Experience the Monolithic Travertine Lamp across different hours of the day. The porous Italian travertine stone filters warm 2700K illumination into sculpted shadows.
              </p>

              {/* Day / Dusk / Night Ambient Interactive Controls */}
              <div className="pt-2">
                <p className="text-[10px] font-mono tracking-widest uppercase text-[#C6A15B] mb-3">
                  SELECT AMBIENCE TIME:
                </p>
                <div className="inline-flex p-1.5 rounded-full border border-white/20 bg-black/40 backdrop-blur-md gap-2">
                  <button
                    type="button"
                    onClick={() => setLightingMood('day')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                      lightingMood === 'day'
                        ? 'bg-[#F7F3EB] text-[#171717] font-semibold shadow-md'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5 text-[#E0A96D]" />
                    <span>DAY (14:00)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLightingMood('dusk')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                      lightingMood === 'dusk'
                        ? 'bg-[#C6A15B] text-[#0B0B0B] font-semibold shadow-md'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <Sunset className="w-3.5 h-3.5" />
                    <span>DUSK (19:30)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLightingMood('night')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                      lightingMood === 'night'
                        ? 'bg-[#1F1B18] text-[#C6A15B] border border-[#C6A15B] font-semibold shadow-md'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5 text-[#95A5A6]" />
                    <span>NIGHT (23:00)</span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/product/monolithic-travertine-table-lamp"
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-semibold text-[#C6A15B] hover:underline"
                >
                  <span>ACQUIRE MONOLITHIC TRAVERTINE LAMP</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Travertine Lamp with Interactive Glow */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              {/* Dynamic Atmospheric Glow according to lighting mood */}
              <div
                className={`absolute w-72 sm:w-96 aspect-square rounded-full blur-[90px] transition-all duration-1000 ${
                  lightingMood === 'day'
                    ? 'bg-amber-200/20 scale-90'
                    : lightingMood === 'dusk'
                    ? 'bg-[#C6A15B]/40 scale-110'
                    : 'bg-[#E5AA42]/50 scale-125'
                }`}
              />

              <div className="relative z-10 w-full max-w-md aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border border-white/10">
                <SafeImage
                  src={ASSETS.decorLamp}
                  alt="Monolithic Travertine Table Lamp"
                  className="w-full h-full object-cover transition-all duration-1000"
                />
                <div
                  className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none ${
                    lightingMood === 'day'
                      ? 'bg-amber-500/0'
                      : lightingMood === 'dusk'
                      ? 'bg-amber-900/15 mix-blend-color-burn'
                      : 'bg-black/35 mix-blend-multiply'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
