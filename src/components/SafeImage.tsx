import React, { useState } from 'react';

interface SafeImageProps {
  src?: string;
  alt: string;
  className?: string;
  priority?: boolean;
  fallbackLabel?: string;
}

/**
 * Resilient image component with graceful fallback surface so no broken frame ever appears.
 */
export function SafeImage({
  src,
  alt,
  className = '',
  priority = false,
  fallbackLabel,
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-[#E9E1D5] text-[#85817B] px-4 text-center ${className}`}
      >
        <span className="font-editorial text-lg tracking-[0.18em] text-[#171717]">
          AKSHARA
        </span>
        <span className="mt-1 text-xs text-[#85817B] line-clamp-2">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
