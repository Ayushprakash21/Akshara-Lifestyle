import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AbstractAtmosphereCanvas } from './AbstractAtmosphereCanvas';

gsap.registerPlugin(ScrollTrigger);

export function CinematicBrandExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const manifestoRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);
  const bgOverlayRef = useRef<HTMLDivElement>(null);

  // Mouse coords for interactive lighting
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const pinned = pinnedRef.current;
    if (!container || !pinned) return;

    const ctx = gsap.context(() => {
      // Main Scrubbed ScrollTrigger Timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          pin: pinned,
          anticipatePin: 1,
        },
      });

      // =========================================================================
      // PHASE 1: Hero introduction exits as scroll begins (0.0 to 0.35)
      // =========================================================================
      tl.to(
        heroContentRef.current,
        {
          y: -80,
          scale: 0.9,
          opacity: 0,
          ease: 'power2.inOut',
          duration: 0.35,
        },
        0
      );

      // =========================================================================
      // PHASE 2: Brand Manifesto reveals line-by-line with clipping mask (0.25 to 0.70)
      // =========================================================================
      const manifestoLines = manifestoRef.current?.querySelectorAll('.manifesto-line-inner');
      if (manifestoLines && manifestoLines.length > 0) {
        tl.fromTo(
          manifestoLines,
          { y: '110%', opacity: 0 },
          {
            y: '0%',
            opacity: 1,
            stagger: 0.08,
            ease: 'power3.out',
            duration: 0.35,
          },
          0.25
        );
      }

      // =========================================================================
      // PHASE 3: Background morphs from #141312 (charcoal) to #FAF8F5 (warm ivory)
      // and typography transitions to charcoal #171717 (0.55 to 0.95)
      // =========================================================================
      tl.to(
        bgOverlayRef.current,
        {
          backgroundColor: '#FAF8F5',
          ease: 'power2.inOut',
          duration: 0.4,
        },
        0.55
      );

      if (manifestoRef.current) {
        tl.to(
          manifestoRef.current.querySelectorAll('.manifesto-text'),
          {
            color: '#171717',
            ease: 'power2.inOut',
            duration: 0.4,
          },
          0.55
        );

        tl.to(
          manifestoRef.current.querySelectorAll('.manifesto-accent'),
          {
            color: '#B58E52',
            ease: 'power2.inOut',
            duration: 0.4,
          },
          0.55
        );

        tl.to(
          manifestoRef.current.querySelectorAll('.manifesto-sub'),
          {
            color: '#635D55',
            ease: 'power2.inOut',
            duration: 0.4,
          },
          0.55
        );
      }

      // Diagonal architectural sunlight sweep
      if (beamRef.current) {
        tl.fromTo(
          beamRef.current,
          { x: '-30%', opacity: 0 },
          {
            x: '80%',
            opacity: 0.65,
            ease: 'none',
            duration: 0.8,
          },
          0.2
        );
      }
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[240vh] select-none"
    >
      {/* Pinned 100vh Viewport */}
      <div
        ref={pinnedRef}
        className="relative w-full h-screen overflow-hidden flex flex-col justify-between"
      >
        {/* Background Overlay (morphs from charcoal #141312 to warm ivory #FAF8F5) */}
        <div
          ref={bgOverlayRef}
          className="absolute inset-0 bg-[#141312] transition-colors pointer-events-none"
        />

        {/* Procedural 60fps Atmosphere Canvas (silk waves, sunlight caustics, glass prisms) */}
        <AbstractAtmosphereCanvas
          scrollProgress={0}
          mouseX={mousePos.x}
          mouseY={mousePos.y}
          theme="warm"
        />

        {/* Architectural Sunlight Beam Layer */}
        <div
          ref={beamRef}
          className="absolute inset-y-0 w-2/5 bg-gradient-to-r from-transparent via-[#C5A46D]/15 to-transparent skew-x-[-25deg] pointer-events-none filter blur-2xl opacity-0"
        />

        {/* Minimalist Top Brand Header */}
        <header className="relative z-30 max-w-[1380px] w-full mx-auto px-6 sm:px-10 pt-8 sm:pt-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A46D] animate-pulse" />
            <span className="font-nav text-[11px] font-medium tracking-[0.32em] text-[#C5A46D] uppercase">
              EST. 2026
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-nav text-[10px] tracking-[0.24em] text-[#8C8478] uppercase">
              MUMBAI
            </span>
            <span className="text-[#8C8478]">·</span>
            <span className="font-nav text-[10px] tracking-[0.24em] text-[#8C8478] uppercase">
              PAN-INDIA
            </span>
          </div>
        </header>

        {/* =========================================================================
            SECTION 1: BRAND INTRODUCTION (Hero)
            - Minimal copy: EVERYDAY, ELEVATED.
            - Animated Brand Emblem
            - Word-by-word reveal with clipping masks
            - Zero products. Zero people. Zero prices. Zero sales buttons.
            ========================================================================= */}
        <div
          ref={heroContentRef}
          className="relative z-20 flex-1 flex flex-col items-center justify-center text-center px-6 my-auto"
        >
          {/* Animated Brand Emblem */}
          <div className="mb-6 sm:mb-8 relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-[#C5A46D]/20 filter blur-xl animate-pulse" />
            <img
              src="/assets/logo/logo-emblem.png"
              alt="AKSHARA Emblem"
              className="relative w-12 h-12 sm:w-16 sm:h-16 object-contain drop-shadow-[0_4px_24px_rgba(197,164,109,0.35)]"
            />
          </div>

          {/* Subtitle Monogram */}
          <div className="overflow-hidden py-1 mb-2">
            <p className="font-nav text-[11px] sm:text-xs uppercase tracking-[0.38em] text-[#C5A46D] font-medium">
              AKSHARA LIFESTYLE
            </p>
          </div>

          {/* Headline: EVERYDAY, ELEVATED. with clipping masks */}
          <div className="space-y-0.5 sm:space-y-2">
            <div className="overflow-hidden py-1">
              <h1 className="font-editorial text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight text-[#F7F4EE] leading-[0.92]">
                EVERYDAY,
              </h1>
            </div>
            <div className="overflow-hidden py-1">
              <h1 className="font-editorial text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight text-[#C5A46D] italic font-light leading-[0.92]">
                ELEVATED.
              </h1>
            </div>
          </div>

          {/* Editorial Philosophy Statement */}
          <div className="overflow-hidden py-1 mt-6 sm:mt-8 max-w-xl">
            <p className="font-body text-xs sm:text-sm md:text-base font-light tracking-wide text-[#A69C8E] leading-relaxed">
              A considered world of everyday living.
            </p>
          </div>

          {/* Animated Minimal Scroll Indicator */}
          <div className="mt-10 sm:mt-14 flex flex-col items-center gap-2 text-[#8C8478]">
            <span className="font-nav text-[9px] uppercase tracking-[0.28em]">
              SCROLL TO EXPLORE
            </span>
            <div className="w-[1px] h-9 bg-gradient-to-b from-[#C5A46D] to-transparent animate-pulse" />
          </div>
        </div>

        {/* =========================================================================
            SECTION 2: CINEMATIC STORYTELLING / MANIFESTO
            - Full-screen scroll-controlled sequence
            - Typography, textures, lighting and visual compositions transform
            - Oversized editorial typography with clipping masks
            ========================================================================= */}
        <div
          ref={manifestoRef}
          className="absolute inset-0 z-20 flex flex-col justify-center items-center pointer-events-none px-6 sm:px-12"
        >
          <div className="max-w-5xl mx-auto text-center space-y-3 sm:space-y-5">
            <div className="overflow-hidden py-1">
              <div className="manifesto-line-inner">
                <span className="manifesto-sub font-nav text-xs sm:text-sm uppercase tracking-[0.32em] text-[#A69C8E] block mb-2">
                  [SCENE II · MANIFESTO]
                </span>
              </div>
            </div>

            <div className="overflow-hidden py-1">
              <div className="manifesto-line-inner">
                <h2 className="manifesto-text font-editorial text-3xl sm:text-5xl md:text-6xl lg:text-7xl uppercase tracking-tight text-[#F7F4EE] leading-[1.05]">
                  TRUE LUXURY IS QUIET.
                </h2>
              </div>
            </div>

            <div className="overflow-hidden py-1">
              <div className="manifesto-line-inner">
                <h2 className="manifesto-text font-editorial text-3xl sm:text-5xl md:text-6xl lg:text-7xl uppercase tracking-tight text-[#F7F4EE] leading-[1.05]">
                  CRAFTED IN <span className="manifesto-accent italic font-light text-[#C5A46D]">PROPORTION.</span>
                </h2>
              </div>
            </div>

            <div className="overflow-hidden py-1">
              <div className="manifesto-line-inner">
                <h2 className="manifesto-text font-editorial text-3xl sm:text-5xl md:text-6xl lg:text-7xl uppercase tracking-tight text-[#F7F4EE] leading-[1.05]">
                  ROOTED IN MATERIALITY.
                </h2>
              </div>
            </div>

            <div className="overflow-hidden py-1">
              <div className="manifesto-line-inner">
                <h2 className="manifesto-text font-editorial text-3xl sm:text-5xl md:text-6xl lg:text-7xl uppercase tracking-tight text-[#F7F4EE] leading-[1.05]">
                  DESIGNED FOR <span className="manifesto-accent italic font-light text-[#C5A46D]">LIVING.</span>
                </h2>
              </div>
            </div>

            <div className="overflow-hidden py-1 pt-4">
              <div className="manifesto-line-inner">
                <p className="manifesto-sub max-w-2xl mx-auto font-body text-xs sm:text-sm font-light text-[#A69C8E] leading-relaxed">
                  We reject ostentation. AKSHARA exists to elevate the daily rituals of the modern Indian home through honest materials, balanced proportions, and timeless craftsmanship.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Bottom Bar */}
        <div className="relative z-30 max-w-[1380px] w-full mx-auto px-6 sm:px-10 pb-6 sm:pb-8 flex items-center justify-between text-[10px] font-nav uppercase tracking-[0.24em] text-[#8C8478]">
          <span>COLLECTION 2026</span>
          <span>ALL-INCLUSIVE DELIVERY</span>
        </div>
      </div>
    </div>
  );
}
