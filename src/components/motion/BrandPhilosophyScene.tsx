import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';

export function BrandPhilosophyScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 24,
    mass: 0.8,
  });

  // Background color transition: from charcoal #141312 to warm ivory #FAF8F5
  const bgColor = useTransform(
    smoothProgress,
    [0, 0.45, 0.85, 1],
    ['#141312', '#221E1B', '#F3EFE9', '#FAF8F5']
  );

  const headlineColor = useTransform(
    smoothProgress,
    [0, 0.45, 0.85, 1],
    ['#F7F4EE', '#F7F4EE', '#22201D', '#171717']
  );

  const accentColor = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    ['#C5A46D', '#C5A46D', '#B58E52']
  );

  const subtextColor = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    ['#A69C8E', '#8C8377', '#635D55']
  );

  // Line reveals through clipping masks
  const line1Y = useTransform(smoothProgress, [0.05, 0.25], ['100%', '0%']);
  const line2Y = useTransform(smoothProgress, [0.18, 0.38], ['100%', '0%']);
  const line3Y = useTransform(smoothProgress, [0.32, 0.52], ['100%', '0%']);
  const line4Y = useTransform(smoothProgress, [0.46, 0.66], ['100%', '0%']);
  const line5Y = useTransform(smoothProgress, [0.6, 0.8], ['100%', '0%']);

  // Diagonal architectural shadow beam sweep
  const beamX = useTransform(smoothProgress, [0, 1], ['-20%', '80%']);

  return (
    <div ref={containerRef} className="relative w-full h-[220vh]">
      {/* Pinned Viewport */}
      <motion.section
        style={{ backgroundColor: bgColor }}
        className="sticky top-0 h-screen w-full flex flex-col justify-between px-6 sm:px-12 py-12 select-none overflow-hidden z-10"
      >
        {/* Architectural Sunlight Beam Layer */}
        <motion.div
          style={{ x: beamX }}
          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[#C5A46D]/10 to-transparent skew-x-[-25deg] pointer-events-none filter blur-xl"
        />

        {/* Top Monogram Tag */}
        <div className="relative z-20 max-w-[1380px] w-full mx-auto flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <span className="font-nav text-xs tracking-[0.3em] uppercase text-[#C5A46D] font-medium">
              [SCENE II · MANIFESTO]
            </span>
          </div>

          <motion.p
            style={{ color: subtextColor }}
            className="font-nav text-xs tracking-widest uppercase hidden sm:block"
          >
            THE PHILOSOPHY OF QUIET EXCELLENCE
          </motion.p>
        </div>

        {/* Central Oversized Editorial Manifesto */}
        <div className="relative z-10 max-w-5xl w-full mx-auto my-auto flex flex-col justify-center">
          {/* Subheading */}
          <div className="overflow-hidden py-1 mb-2">
            <motion.p
              style={{ y: line1Y, color: accentColor }}
              className="font-nav text-xs sm:text-sm font-medium tracking-[0.35em] uppercase"
            >
              WE BELIEVE
            </motion.p>
          </div>

          {/* Line 2: TRUE LUXURY IS QUIET. */}
          <div className="overflow-hidden py-1">
            <motion.h2
              style={{ y: line2Y, color: headlineColor }}
              className="font-editorial text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.96] uppercase tracking-tight"
            >
              TRUE LUXURY IS <span className="italic font-light text-[#C5A46D]">QUIET.</span>
            </motion.h2>
          </div>

          {/* Line 3: CRAFTED IN PROPORTION. */}
          <div className="overflow-hidden py-1 mt-1 sm:mt-2">
            <motion.h2
              style={{ y: line3Y, color: headlineColor }}
              className="font-editorial text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.96] uppercase tracking-tight"
            >
              CRAFTED IN PROPORTION.
            </motion.h2>
          </div>

          {/* Line 4: ROOTED IN MATERIALITY. */}
          <div className="overflow-hidden py-1 mt-1 sm:mt-2">
            <motion.h2
              style={{ y: line4Y, color: headlineColor }}
              className="font-editorial text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.96] uppercase tracking-tight"
            >
              ROOTED IN <span className="italic font-light text-[#C5A46D]">MATERIALITY.</span>
            </motion.h2>
          </div>

          {/* Line 5: DESIGNED FOR LIVING. */}
          <div className="overflow-hidden py-1 mt-1 sm:mt-2">
            <motion.h2
              style={{ y: line5Y, color: headlineColor }}
              className="font-editorial text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.96] uppercase tracking-tight"
            >
              DESIGNED FOR LIVING.
            </motion.h2>
          </div>

          {/* Editorial Note */}
          <div className="overflow-hidden mt-8 max-w-xl">
            <motion.p
              style={{ color: subtextColor }}
              className="font-body text-xs sm:text-sm font-light leading-relaxed"
            >
              No artificial logos, no transient novelties. Only timeless Indian artisanship meeting contemporary architectural forms.
            </motion.p>
          </div>
        </div>

        {/* Bottom Status */}
        <div className="relative z-20 max-w-[1380px] w-full mx-auto flex items-center justify-between pt-4 border-t border-black/10 dark:border-white/10 text-xs font-mono">
          <motion.span style={{ color: subtextColor }} className="tracking-widest uppercase text-[10px]">
            ARCHITECTURAL HARMONY · EVERYDAY FORM
          </motion.span>
          <span className="text-[10px] tracking-widest text-[#C5A46D] uppercase">
            CONTINUE SCROLLING
          </span>
        </div>
      </motion.section>
    </div>
  );
}
