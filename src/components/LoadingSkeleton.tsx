import React from 'react';

export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10" aria-busy="true" aria-label="Loading products">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="animate-pulse">
          <div className="aspect-[3/4] w-full bg-[#E9E1D5]" />
          <div className="mt-3.5 h-3 w-20 bg-[#E9E1D5]" />
          <div className="mt-2 h-4 w-4/5 bg-[#E9E1D5]" />
          <div className="mt-2 h-4 w-1/3 bg-[#E9E1D5]" />
        </div>
      ))}
    </div>
  );
}
