import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { BrandLogo } from '../BrandLogo';

interface CinematicIntroProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

export function CinematicIntro({ onComplete, forceShow = false }: CinematicIntroProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasSeenIntro = sessionStorage.getItem('akshara_intro_viewed_v1');

    if (prefersReducedMotion || (hasSeenIntro && !forceShow)) {
      if (onComplete) onComplete();
      return;
    }

    setIsVisible(true);

    // Progressive counter mimicking the Dialed In preloader (0% to 100%)
    let current = 0;
    const timer = setInterval(() => {
      current += Math.floor(Math.random() * 8) + 4;
      if (current >= 100) {
        current = 100;
        setCount(100);
        clearInterval(timer);
        setTimeout(() => {
          handleDismiss();
        }, 1100);
      } else {
        setCount(current);
      }
    }, 45);

    // Escape key listener to skip immediately
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [forceShow]);

  const handleDismiss = () => {
    sessionStorage.setItem('akshara_intro_viewed_v1', 'true');
    setIsVisible(false);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 800);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="cinematic-intro"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            y: '-10%',
            filter: 'blur(12px)',
            transition: { duration: 0.85, ease: [0.76, 0, 0.24, 1] },
          }}
          className="fixed inset-0 z-[9999] bg-[#121110] text-[#F7F3EB] flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-hidden select-none"
        >
          {/* Subtle Ambient Radial Lighting */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#241C16]/60 via-[#141211]/90 to-[#0C0B0A] pointer-events-none" />

          {/* Top Bar: Brand Coordinates & Skip Trigger */}
          <div className="relative z-10 flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-[#A89D8F] font-mono">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-[#C6A15B] animate-pulse" />
              <span>AKSHARA LIFESTYLE · MMXXVI</span>
            </motion.div>

            <motion.button
              type="button"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              onClick={handleDismiss}
              className="group inline-flex items-center gap-2 px-3.5 py-1.5 border border-[#3A342D] rounded-full text-[#C6A15B] hover:text-[#F7F3EB] hover:border-[#C6A15B] transition-all bg-[#1A1816]/60 backdrop-blur-sm cursor-pointer"
            >
              <span className="text-[10px] tracking-[0.18em]">SKIP INTRO</span>
              <span className="text-[9px] text-[#6E665D] group-hover:text-[#A89D8F]">[ESC]</span>
            </motion.button>
          </div>

          {/* Center Stage: Oversized Editorial Reveal */}
          <div className="relative z-10 my-auto w-full max-w-6xl mx-auto text-center flex flex-col items-center justify-center">
            {/* Minimal Brand Emblem */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="mb-6"
            >
              <BrandLogo variant="light" layout="icon" className="w-14 h-14 mx-auto drop-shadow-[0_0_25px_rgba(198,161,91,0.25)]" />
            </motion.div>

            {/* Word 1: EVERYDAY. */}
            <div className="overflow-hidden">
              <motion.h1
                initial={{ y: '110%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
                className="font-editorial text-5xl sm:text-7xl lg:text-[110px] tracking-[-0.01em] leading-none text-[#F7F3EB]"
              >
                EVERYDAY.
              </motion.h1>
            </div>

            {/* Animated Gold Divider Line with Emblem Glow */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
              className="w-32 sm:w-56 h-[1.5px] bg-gradient-to-r from-transparent via-[#C6A15B] to-transparent my-3 sm:my-5"
            />

            {/* Word 2: ELEVATED. */}
            <div className="overflow-hidden">
              <motion.h2
                initial={{ y: '110%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1], delay: 0.65 }}
                className="font-editorial italic text-5xl sm:text-7xl lg:text-[110px] tracking-[-0.01em] leading-none text-[#C6A15B]"
              >
                ELEVATED.
              </motion.h2>
            </div>

            {/* Sub-line / Atelier Note */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.85 }}
              className="mt-6 text-xs sm:text-sm tracking-[0.28em] uppercase text-[#A89D8F] max-w-md mx-auto font-light"
            >
              Curated D2C Objects For Enduring Stillness
            </motion.p>
          </div>

          {/* Bottom Bar: Loading Meter & Atelier Coordinates */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#8C8274] border-t border-[#26211C] pt-5">
            <div className="flex items-center gap-4">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#C6A15B]">
                INITIALIZING STOREFRONT
              </span>
              <div className="w-24 sm:w-36 h-[2px] bg-[#2A241F] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#A8823B] to-[#C6A15B]"
                  style={{ width: `${count}%` }}
                />
              </div>
              <span className="tabular-nums text-[#F7F3EB] text-xs font-semibold">{count}%</span>
            </div>

            <div className="flex items-center gap-6 text-[10px] uppercase tracking-[0.2em]">
              <span className="hidden md:inline">MUMBAI · JAIPUR · GENEVA</span>
              <span className="text-[#C6A15B]">ALL-INCLUSIVE PAN-INDIA LOGISTICS</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
