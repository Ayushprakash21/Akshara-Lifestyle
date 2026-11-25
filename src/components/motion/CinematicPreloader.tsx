import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface CinematicPreloaderProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

export function CinematicPreloader({ onComplete, forceShow = false }: CinematicPreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(() => {
    if (forceShow) return true;
    if (typeof window !== 'undefined') {
      const seen = sessionStorage.getItem('aks_preloader_seen');
      return !seen;
    }
    return true;
  });

  useEffect(() => {
    if (!isVisible) {
      onComplete?.();
      return;
    }

    // Elegant animated counter from 0 to 100% over ~1.4s
    const startTime = performance.now();
    const duration = 1400;

    const updateProgress = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);
      // Custom smooth easing curve (slow start, rapid mid, smooth settle)
      const easedProgress = Math.floor(
        rawProgress < 0.5
          ? 2 * rawProgress * rawProgress * 100
          : (1 - Math.pow(-2 * rawProgress + 2, 2) / 2) * 100
      );

      setProgress(Math.min(easedProgress, 100));

      if (rawProgress < 1) {
        requestAnimationFrame(updateProgress);
      } else {
        setTimeout(() => {
          setIsVisible(false);
          sessionStorage.setItem('aks_preloader_seen', 'true');
          onComplete?.();
        }, 320);
      }
    };

    const frameId = requestAnimationFrame(updateProgress);

    // Escape key / click skip handler
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ') {
        setIsVisible(false);
        sessionStorage.setItem('aks_preloader_seen', 'true');
        onComplete?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, onComplete]);

  const handleSkip = () => {
    setIsVisible(false);
    sessionStorage.setItem('aks_preloader_seen', 'true');
    onComplete?.();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="cinematic-preloader"
          initial={{ opacity: 1 }}
          exit={{
            y: '-100%',
            transition: { duration: 0.85, ease: [0.76, 0, 0.24, 1] },
          }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#131211] text-[#F7F4EE] px-6 py-10 select-none overflow-hidden"
          style={{ willChange: 'transform' }}
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(197,164,109,0.08)_0%,_transparent_70%)] pointer-events-none" />

          {/* Top Bar: Edition & Skip Button */}
          <div className="relative z-10 w-full max-w-6xl flex items-center justify-between text-xs font-mono tracking-widest text-[#A69C8E]">
            <span className="uppercase text-[11px] text-[#C5A46D]">
              AKSHARA LIFESTYLE · ARCHIVE
            </span>
            <button
              onClick={handleSkip}
              className="text-[10px] tracking-[0.2em] uppercase text-[#A69C8E] hover:text-[#F7F4EE] transition-colors cursor-pointer py-1 px-3 border border-white/10 rounded-full hover:border-[#C5A46D]/40"
            >
              Skip Intro [Esc]
            </button>
          </div>

          {/* Centerpiece: Emblem Reveal, Logo & Typographic Animation */}
          <div className="relative z-10 flex flex-col items-center text-center max-w-xl">
            {/* Elegant Emblem SVG Animation */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-20 h-20 mb-6 flex items-center justify-center"
            >
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full text-[#C5A46D] filter drop-shadow-[0_0_15px_rgba(197,164,109,0.3)]"
                fill="none"
              >
                {/* Outer Delicate Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="4 6"
                  className="opacity-40 animate-[spin_24s_linear_infinite]"
                />
                {/* Stylized Arch A */}
                <path
                  d="M50 16 L22 82 M50 16 L78 82 M33 60 L67 60"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* North Star Accent */}
                <path
                  d="M50 8 L52 14 L58 16 L52 18 L50 24 L48 18 L42 16 L48 14 Z"
                  fill="currentColor"
                />
              </svg>
            </motion.div>

            {/* Brand Wordmark with Letter Spacing Expansion */}
            <motion.h1
              initial={{ opacity: 0, letterSpacing: '0.15em' }}
              animate={{ opacity: 1, letterSpacing: '0.35em' }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
              className="font-nav text-2xl sm:text-3xl font-light text-[#F7F4EE] uppercase tracking-[0.35em]"
            >
              AKSHARA
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mt-2 text-[11px] font-mono tracking-[0.4em] uppercase text-[#C5A46D]"
            >
              EVERYDAY, ELEVATED.
            </motion.p>
          </div>

          {/* Bottom Bar: Animated Percentage & Thin Progress Line */}
          <div className="relative z-10 w-full max-w-md flex flex-col items-center">
            <div className="w-full flex items-center justify-between text-xs font-mono text-[#8C8478] mb-2 tabular-nums">
              <span className="text-[10px] tracking-widest uppercase">INITIALIZING EXPERIENCE</span>
              <span className="text-xs text-[#C5A46D] font-medium">{progress}%</span>
            </div>

            {/* Glowing Progress Track */}
            <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#C5A46D]/60 via-[#E8CFA6] to-[#C5A46D]"
                style={{ width: `${progress}%` }}
                transition={{ ease: 'linear' }}
              />
            </div>

            <p className="mt-3 text-[10px] font-mono tracking-widest text-[#6E675E] uppercase">
              ARCHITECTURAL FORM · ARTISANAL LONGEVITY
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
