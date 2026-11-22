import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useCommerce } from '../store/CommerceContext';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { ProductCard } from '../components/ProductCard';

export function WishlistPage() {
  const { wishlist, products } = useCommerce();
  useDocumentMeta({ title: 'Saved Wishlist' });

  const items = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-10 py-12 lg:py-16">
      <div className="pb-6 border-b border-[#E9E1D5] flex items-end justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#85817B]">Personal Curation</p>
          <h1 className="mt-1 font-editorial text-4xl text-[#171717]">Saved Wishlist</h1>
        </div>
        <span className="text-sm text-[#85817B] tabular-nums">{items.length} saved</span>
      </div>

      {items.length === 0 ? (
        <div className="py-20 text-center max-w-md mx-auto">
          <Heart className="w-9 h-9 text-[#85817B] mx-auto" strokeWidth={1.25} />
          <h2 className="mt-4 font-editorial text-3xl text-[#171717]">Your wishlist is empty</h2>
          <p className="mt-2 text-sm text-[#85817B]">
            Save pieces you admire while browsing so you can revisit them anytime.
          </p>
          <Link
            to="/shop"
            className="mt-6 inline-block px-7 py-3 bg-[#171717] text-white text-xs tracking-[0.16em] uppercase"
          >
            Explore Collection
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export function NotFoundPage() {
  useDocumentMeta({ title: 'Page Not Found' });
  return (
    <div className="max-w-xl mx-auto px-6 py-24 text-center">
      <p className="font-mono text-xs tracking-[0.22em] text-[#C5A46D]">404</p>
      <h1 className="mt-3 font-editorial text-4xl sm:text-5xl text-[#171717]">
        This page is unavailable
      </h1>
      <p className="mt-3 text-sm text-[#85817B]">
        The link may have moved or been archived. Return to the storefront to continue exploring AKSHARA LIFESTYLE.
      </p>
      <Link
        to="/"
        className="mt-7 inline-block px-7 py-3.5 bg-[#171717] text-white text-xs tracking-[0.16em] uppercase"
      >
        Return Home
      </Link>
    </div>
  );
}
