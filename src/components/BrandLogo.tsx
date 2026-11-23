import React from 'react';

export interface BrandLogoProps {
  /**
   * 'dark' = designed for light surfaces (ivory #F7F4EE, white #FFFFFF)
   * 'light' = designed for dark surfaces (charcoal #171717, black #0B0B0B)
   * 'gold' = pure radiant champagne gold
   */
  variant?: 'dark' | 'light' | 'gold';
  /**
   * 'horizontal' = desktop header & wide containers (Emblem | AKSHARA LIFESTYLE)
   * 'stacked' = primary centered lockup (Emblem above AKSHARA LIFESTYLE)
   * 'emblem' = compact icon-only emblem (A with star & lotus petal)
   * 'card' = luxury dark presentation card
   */
  layout?: 'horizontal' | 'stacked' | 'emblem' | 'card';
  showSubword?: boolean;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  /**
   * When true on horizontal layout, smoothly swaps to compact emblem on small mobile screens
   */
  mobileResponsive?: boolean;
}

/**
 * Authoritative AKSHARA LIFESTYLE Brand Lockup.
 * Uses official brand assets preserving the custom A emblem and stylized letterforms.
 */
export function BrandLogo({
  variant = 'dark',
  layout = 'horizontal',
  showSubword = true,
  className = '',
  size = 'md',
  mobileResponsive = false,
}: BrandLogoProps) {
  if (layout === 'horizontal' && mobileResponsive) {
    const horizontalSrc =
      variant === 'light' || variant === 'gold'
        ? '/assets/logo/logo-horizontal-dark.png'
        : '/assets/logo/logo-horizontal.png';

    return (
      <span
        className={`inline-flex items-center justify-center select-none shrink-0 ${className}`}
        aria-label="AKSHARA LIFESTYLE"
      >
        {/* Compact emblem on mobile where space is constrained */}
        <img
          src="/assets/logo/logo-emblem.png"
          alt="AKSHARA LIFESTYLE"
          decoding="async"
          loading="eager"
          className="sm:hidden h-7 w-auto object-contain"
        />
        {/* Full horizontal lockup on desktop & tablet */}
        <img
          src={horizontalSrc}
          alt="AKSHARA LIFESTYLE"
          decoding="async"
          loading="eager"
          className="hidden sm:block h-7 sm:h-8 lg:h-[34px] w-auto object-contain"
        />
      </span>
    );
  }

  let src = '/assets/logo/logo-horizontal.png';
  let defaultClasses = 'h-7 sm:h-8 lg:h-[34px] w-auto object-contain';

  if (layout === 'emblem') {
    src = '/assets/logo/logo-emblem.png';
    const sizeMap: Record<string, string> = {
      xs: 'h-5 w-auto',
      sm: 'h-6 w-auto',
      md: 'h-7 sm:h-8 w-auto',
      lg: 'h-9 w-auto',
      xl: 'h-11 w-auto',
      custom: '',
    };
    defaultClasses = `${sizeMap[size] || 'h-7 w-auto'} object-contain`;
  } else if (layout === 'stacked') {
    src =
      variant === 'light'
        ? '/assets/logo/logo-gold-transparent.png'
        : '/assets/logo/logo-primary.png';
    const sizeMap: Record<string, string> = {
      xs: 'h-10 w-auto',
      sm: 'h-12 w-auto',
      md: 'h-16 w-auto',
      lg: 'h-20 w-auto',
      xl: 'h-24 w-auto',
      custom: '',
    };
    defaultClasses = `${sizeMap[size] || 'h-16 w-auto'} object-contain`;
  } else if (layout === 'card') {
    src = '/assets/logo/logo-dark-bg.png';
    defaultClasses = 'w-48 h-auto object-contain rounded-md shadow-md';
  } else {
    // horizontal lockup
    src =
      variant === 'light' || variant === 'gold'
        ? '/assets/logo/logo-horizontal-dark.png'
        : '/assets/logo/logo-horizontal.png';
    const sizeMap: Record<string, string> = {
      xs: 'h-5 sm:h-6',
      sm: 'h-6 sm:h-7',
      md: 'h-7 sm:h-8 lg:h-[34px]',
      lg: 'h-8 sm:h-9 lg:h-10',
      xl: 'h-10 sm:h-12',
      custom: '',
    };
    defaultClasses = `${sizeMap[size] || 'h-7 sm:h-8 lg:h-[34px]'} w-auto object-contain`;
  }

  return (
    <span
      className={`inline-flex items-center justify-center select-none shrink-0 ${className}`}
      aria-label="AKSHARA LIFESTYLE"
    >
      <img
        src={src}
        alt="AKSHARA LIFESTYLE"
        decoding="async"
        loading="eager"
        className={`${defaultClasses} transition-opacity duration-200`}
      />
    </span>
  );
}
