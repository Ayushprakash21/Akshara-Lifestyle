import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function HeroBrandIntroScene() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const emblemRef = useRef<HTMLDivElement>(null);
  const brandTitleRef = useRef<HTMLDivElement>(null);
  const lineEverydayRef = useRef<HTMLHeadingElement>(null);
  const lineElevatedRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const lightShaftRef = useRef<HTMLDivElement>(null);
  const ambientGlowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // 1. Entrance Animation on Mount
      const entranceTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      entranceTl
        .fromTo(
          ambientGlowRef.current,
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, duration: 1.6 },
          0
        )
        .fromTo(
          emblemRef.current,
          { opacity: 0, scale: 0.85, y: 15 },
          { opacity: 1, scale: 1, y: 0, duration: 1.2 },
          0.2
        )
        .fromTo(
          brandTitleRef.current,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 1 },
          0.4
        )
        .fromTo(
          lineEverydayRef.current,
          { y: '110%', opacity: 0 },
          { y: '0%', opacity: 1, duration: 1.1 },
          0.5
        )
        .fromTo(
          lineElevatedRef.current,
          { y: '110%', opacity: 0 },
          { y: '0%', opacity: 1, duration: 1.1 },
          0.65
        )
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 1 },
          0.85
        )
        .fromTo(
          scrollIndicatorRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.8 },
          1.1
        );

      // 2. Scroll-Triggered Spatial Motion
      // As the user scrolls, typography moves and transforms in response to scroll
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.8,
        },
      });

      scrollTl
        // Line 1 moves outward to the left with scale
        .to(
          lineEverydayRef.current,
          {
            x: '-14vw',
            scale: 0.94,
            opacity: 0.2,
            ease: 'none',
          },
          0
        )
        // Line 2 moves outward to the right with scale
        .to(
          lineElevatedRef.current,
          {
            x: '16vw',
            scale: 0.94,
            opacity: 0.2,
            ease: 'none',
          },
          0
        )
        // Emblem shifts upward faster (depth parallax)
        .to(
          emblemRef.current,
          {
            y: -120,
            opacity: 0,
            scale: 0.75,
            ease: 'none',
          },
          0
        )
        // Subtitle glides down and fades
        .to(
          subtitleRef.current,
          {
            y: 60,
            opacity: 0,
            ease: 'none',
          },
          0
        )
        // Light shaft angles and pans
        .to(
          lightShaftRef.current,
          {
            rotate: -20,
            x: '15%',
            opacity: 0.3,
            ease: 'none',
          },
          0
        )
        // Ambient glow deepens and translates
        .to(
          ambientGlowRef.current,
          {
            scale: 1.3,
            opacity: 0.2,
            ease: 'none',
          },
          0
        )
        .to(
          scrollIndicatorRef.current,
          {
            opacity: 0,
            ease: 'none',
          },
          0
        );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-[100vh] min-h-[680px] bg-[#0C0B0A] text-[#F7F4EE] flex flex-col justify-between overflow-hidden select-none"
    >
      {/* 1. Controlled Ambient Lighting Layer (Depth & Warmth) */}
      <div
        ref={ambientGlowRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[900px] h-[70vh] bg-[radial-gradient(ellipse_at_center,rgba(197,164,109,0.12)_0%,transparent_75%)] pointer-events-none filter blur-2xl"
      />

      {/* 2. Architectural Raking Light Beam (Parallax Light Layer) */}
      <div
        ref={lightShaftRef}
        className="absolute -top-[20%] left-[10%] w-[60vw] h-[140%] bg-gradient-to-br from-transparent via-[#C5A46D]/[0.06] to-transparent rotate-[-12deg] pointer-events-none filter blur-3xl"
      />

      {/* 3. Subtle Architectural Texture Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:6rem_6rem] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] pointer-events-none" />

      {/* 4. Top Minimal Identity Details */}
      <div className="relative z-20 max-w-[1380px] w-full mx-auto px-6 sm:px-10 pt-6 sm:pt-8 flex items-center justify-between text-[11px] font-nav uppercase tracking-[0.28em] text-[#8C8478]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C5A46D] animate-pulse" />
          <span>EST. 2026</span>
        </div>
        <span>MUMBAI · PAN-INDIA</span>
      </div>

      {/* 5. Center Composition: Dynamic Typography & Animated Emblem */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-8 my-auto">
        {/* Animated Brand Emblem */}
        <div ref={emblemRef} className="mb-4 sm:mb-6 relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[#C5A46D]/20 filter blur-lg animate-pulse" />
          <img
            src="/assets/logo/logo-emblem.png"
            alt="AKSHARA Emblem"
            className="relative w-11 h-11 sm:w-14 sm:h-14 object-contain drop-shadow-[0_4px_24px_rgba(197,164,109,0.4)]"
          />
        </div>

        {/* Brand Name Label */}
        <div ref={brandTitleRef} className="overflow-hidden py-1 mb-2">
          <p className="font-nav text-[10px] sm:text-xs uppercase tracking-[0.38em] text-[#C5A46D] font-medium">
            AKSHARA LIFESTYLE
          </p>
        </div>

        {/* Dynamic Editorial Headline with Clipping Masks */}
        <div className="flex flex-col items-center">
          <div className="overflow-hidden py-1">
            <h1
              ref={lineEverydayRef}
              className="font-editorial text-5xl sm:text-7xl md:text-8xl lg:text-[108px] tracking-tight text-[#F7F4EE] leading-[0.92] will-change-transform"
            >
              EVERYDAY,
            </h1>
          </div>
          <div className="overflow-hidden py-1">
            <h1
              ref={lineElevatedRef}
              className="font-editorial text-5xl sm:text-7xl md:text-8xl lg:text-[108px] tracking-tight text-[#C5A46D] italic font-light leading-[0.92] will-change-transform"
            >
              ELEVATED.
            </h1>
          </div>
        </div>

        {/* Approved Subtitle Statement */}
        <div className="overflow-hidden py-1 mt-6 sm:mt-8 max-w-lg">
          <p
            ref={subtitleRef}
            className="font-body text-xs sm:text-sm md:text-base font-light tracking-wide text-[#A69C8E] leading-relaxed"
          >
            A multi-category lifestyle destination.
          </p>
        </div>
      </div>

      {/* 6. Bottom Scroll Indicator */}
      <div
        ref={scrollIndicatorRef}
        className="relative z-20 max-w-[1380px] w-full mx-auto px-6 sm:px-10 pb-8 flex flex-col items-center gap-2 text-[#8C8478]"
      >
        <span className="font-nav text-[9px] uppercase tracking-[0.3em]">
          SCROLL TO EXPLORE
        </span>
        <div className="w-[1px] h-8 bg-gradient-to-b from-[#C5A46D] to-transparent animate-pulse" />
      </div>
    </section>
  );
}
