import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'motion/react';
import { AbstractAtmosphereCanvas } from './AbstractAtmosphereCanvas';

export function AbstractCinematicHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse move for architectural light and 3D depth shifting
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 28, stiffness: 100 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Scroll animation
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '35%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-[100vh] min-h-[640px] flex flex-col justify-between bg-[#141312] text-[#F7F4EE] overflow-hidden select-none"
    >
      {/* 1. Procedural Animated Environment (Fluid Silk Waves, Glass Prisms, Sunlight Caustics) */}
      <AbstractAtmosphereCanvas
        scrollProgress={0}
        mouseX={smoothMouseX.get()}
        mouseY={smoothMouseY.get()}
        theme="warm"
      />

      {/* Subtle Atmospheric Gradient Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,_rgba(197,164,109,0.14)_0%,_transparent_70%)] pointer-events-none" />

      {/* 2. Top Minimal Monogram & Identity Header */}
      <div className="relative z-20 max-w-[1380px] w-full mx-auto px-6 sm:px-10 pt-8 sm:pt-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C5A46D] animate-pulse" />
          <span className="font-nav text-[11px] font-medium tracking-[0.32em] text-[#C5A46D] uppercase">
            EST. 2026
          </span>
        </div>

        <div className="font-nav text-[11px] font-light tracking-[0.28em] text-[#A69C8E] uppercase">
          INDIA
        </div>
      </div>

      {/* 3. Central Brand Typography with Clipping Mask Animation */}
      <motion.div
        style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
        className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 my-auto"
      >
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          {/* Brand Name with Clipping Mask */}
          <div className="overflow-hidden py-1 mb-3 sm:mb-4">
            <motion.p
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-nav text-xs sm:text-sm font-medium tracking-[0.45em] text-[#C5A46D] uppercase"
            >
              AKSHARA LIFESTYLE
            </motion.p>
          </div>

          {/* Line 1: EVERYDAY, */}
          <div className="overflow-hidden py-1">
            <motion.h1
              initial={{ y: '110%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="font-editorial text-5xl sm:text-7xl md:text-8xl lg:text-9xl leading-[0.94] tracking-tight uppercase text-[#F7F4EE]"
            >
              EVERYDAY,
            </motion.h1>
          </div>

          {/* Line 2: ELEVATED. */}
          <div className="overflow-hidden py-1 mt-1 sm:mt-2">
            <motion.h1
              initial={{ y: '110%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 1.2, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
              className="font-editorial text-5xl sm:text-7xl md:text-8xl lg:text-9xl leading-[0.94] tracking-tight uppercase"
            >
              <span className="italic font-light text-[#C5A46D]">ELEVATED.</span>
            </motion.h1>
          </div>

          {/* Subtitle: A considered world of everyday living. */}
          <div className="overflow-hidden mt-6 sm:mt-8 max-w-md mx-auto">
            <motion.p
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              transition={{ duration: 1.0, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="font-body text-sm sm:text-base font-light tracking-wide text-[#A69C8E] leading-relaxed"
            >
              A considered world of everyday living.
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* 4. Bottom Subtle Scroll Indicator (Zero Sales Text, Zero Buttons) */}
      <div className="relative z-20 max-w-[1380px] w-full mx-auto px-6 sm:px-10 pb-8 flex items-center justify-between text-xs font-mono text-[#8C8478]">
        <span className="text-[10px] tracking-[0.24em] uppercase text-[#A69C8E]">
          PROPORTION · MATERIALITY · REFINEMENT
        </span>

        {/* Minimal Animated Scroll Line */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] tracking-[0.26em] uppercase text-[#C5A46D]">
            SCROLL TO EXPLORE
          </span>
          <div className="w-8 h-[1px] bg-white/20 relative overflow-hidden">
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1/2 h-full bg-[#C5A46D]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
