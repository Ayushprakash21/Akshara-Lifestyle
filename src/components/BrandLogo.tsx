import React from 'react';

interface BrandLogoProps {
  variant?: 'dark' | 'light';
  layout?: 'horizontal' | 'stacked';
  showSubword?: boolean;
  className?: string;
}

/**
 * Official AKSHARA LIFESTYLE brand lockup featuring the stylized lotus emblem
 * and architectural open-crossbar A letterforms.
 */
export function BrandLogo({
  variant = 'dark',
  layout = 'horizontal',
  showSubword = false,
  className = '',
}: BrandLogoProps) {
  const strokeColor = variant === 'dark' ? '#171717' : '#F7F4EE';
  const accentColor = '#C5A46D';

  return (
    <span
      className={`inline-flex ${
        layout === 'stacked' ? 'flex-col items-center gap-2' : 'items-center gap-2.5'
      } select-none whitespace-nowrap shrink-0 ${className}`}
      aria-label="AKSHARA LIFESTYLE"
    >
      {/* Lotus-inspired geometric emblem */}
      <svg
        viewBox="0 0 44 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className={`shrink-0 ${layout === 'stacked' ? 'w-[38px] h-[28px]' : 'w-[22px] h-[17px] sm:w-[26px] sm:h-[20px]'}`}
      >
        {/* Central lotus petal */}
        <path
          d="M22 3C25.2 9.2 26.2 15.8 22 23.5C17.8 15.8 18.8 9.2 22 3Z"
          stroke={accentColor}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Inner flanking petals */}
        <path
          d="M22 23.5C15.5 21 11.4 15.4 11.2 9.5C15.6 11.6 19.2 16.5 22 23.5Z"
          stroke={strokeColor}
          strokeWidth="1.35"
          strokeLinejoin="round"
        />
        <path
          d="M22 23.5C28.5 21 32.6 15.4 32.8 9.5C28.4 11.6 24.8 16.5 22 23.5Z"
          stroke={strokeColor}
          strokeWidth="1.35"
          strokeLinejoin="round"
        />
        {/* Outer subtle lotus wings */}
        <path
          d="M20.5 24.2C13.5 24.8 7.6 21.8 4 16.8C9.2 16.8 14.8 19.5 20.5 24.2Z"
          stroke={accentColor}
          strokeWidth="1.2"
          strokeLinejoin="round"
          opacity="0.88"
        />
        <path
          d="M23.5 24.2C30.5 24.8 36.4 21.8 40 16.8C34.8 16.8 29.2 19.5 23.5 24.2Z"
          stroke={accentColor}
          strokeWidth="1.2"
          strokeLinejoin="round"
          opacity="0.88"
        />
        {/* Subtle base horizon */}
        <path d="M12 28H32" stroke={accentColor} strokeWidth="1.1" strokeLinecap="round" />
      </svg>

      {/* Custom stylized AKSHARA wordmark preserving architectural A forms */}
      <span className="inline-flex flex-col items-center leading-none">
        <svg
          viewBox="0 0 186 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="AKSHARA"
          className={layout === 'stacked' ? 'w-[148px] h-[22px]' : 'w-[96px] h-[15px] sm:w-[118px] sm:h-[18px]'}
        >
          {/* Stylized A #1 (sculpted open apex with gold accent dot) */}
          <path d="M3 25L12.5 3L22 25" stroke={strokeColor} strokeWidth="1.9" strokeLinecap="square" strokeLinejoin="miter" />
          <path d="M8.5 18.5H16.5" stroke={accentColor} strokeWidth="1.4" />
          {/* K */}
          <path d="M31 3V25M44 3L32 14.5L45 25" stroke={strokeColor} strokeWidth="1.85" strokeLinecap="square" />
          {/* S */}
          <path
            d="M68 7.2C66.5 4.4 63.4 3.2 60 3.2C55.8 3.2 53 5.4 53 8.6C53 11.8 55.6 13.1 60.5 14.1C65.4 15.1 68.5 16.5 68.5 20.1C68.5 23.5 65.2 25.4 60.4 25.4C56.2 25.4 53.2 23.8 51.8 20.8"
            stroke={strokeColor}
            strokeWidth="1.85"
            strokeLinecap="round"
          />
          {/* H */}
          <path d="M78 3V25M95 3V25M78 14H95" stroke={strokeColor} strokeWidth="1.85" strokeLinecap="square" />
          {/* Stylized A #2 */}
          <path d="M104 25L113.5 3L123 25" stroke={strokeColor} strokeWidth="1.9" strokeLinecap="square" />
          <path d="M109.5 18.5H117.5" stroke={accentColor} strokeWidth="1.4" />
          {/* R */}
          <path
            d="M132 25V3H142.5C146.8 3 149.2 5.4 149.2 9.2C149.2 12.8 146.7 15 142.5 15H132M141.5 15L149.8 25"
            stroke={strokeColor}
            strokeWidth="1.85"
            strokeLinecap="square"
          />
          {/* Stylized A #3 */}
          <path d="M158 25L167.5 3L177 25" stroke={strokeColor} strokeWidth="1.9" strokeLinecap="square" />
          <path d="M163.5 18.5H171.5" stroke={accentColor} strokeWidth="1.4" />
        </svg>
        {showSubword && (
          <span
            className={`mt-1 text-[9px] tracking-[0.38em] font-medium ${
              variant === 'dark' ? 'text-[#85817B]' : 'text-[#C5A46D]'
            }`}
          >
            LIFESTYLE
          </span>
        )}
      </span>
    </span>
  );
}
