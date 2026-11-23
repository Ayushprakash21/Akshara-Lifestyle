import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Home, Search, ShoppingBag } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';
import { ProductCard } from '../components/ProductCard';
import { CartDrawer } from '../components/CartDrawer';
import { SearchOverlay } from '../components/SearchOverlay';
import { ToastViewport } from '../components/ToastViewport';
import { useCommerce } from '../store/CommerceContext';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

/**
 * Editorial Luxury 404 Experience for AKSHARA LIFESTYLE
 *
 * Visual Palette:
 * - Deep Charcoal: #171717
 * - Deep Black: #0B0B0B
 * - Warm Ivory: #F7F4EE
 * - Muted Champagne Gold: #C5A46D
 * - Warm Beige: #E9E1D5
 */
export function NotFoundPage() {
  const { products, openCartDrawer, openSearch, cartTotals } = useCommerce();

  useDocumentMeta({
    title: '404 — Page Not Found | AKSHARA LIFESTYLE',
    description:
      'This page has taken a different path. Explore the AKSHARA LIFESTYLE catalog of artisanal apparel, heirloom jewellery, and everyday elevated luxury.',
  });

  // Curate 4 featured pieces (trending or bestsellers)
  const curatedProducts = useMemo(() => {
    const featured = products.filter(
      (p) => p.isTrending || p.isBestSeller || p.badge === 'BESTSELLER',
    );
    return (featured.length >= 4 ? featured : products).slice(0, 4);
  }, [products]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F4EE] text-[#171717] selection:bg-[#C5A46D]/20 selection:text-[#171717]">
      {/* 1. Minimal Header with Official Brand Identity */}
      <header className="sticky top-0 z-40 bg-[#F7F4EE]/95 backdrop-blur-md border-b border-[#E9E1D5] transition-colors">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-10 h-18 sm:h-20 flex items-center justify-between">
          <Link
            to="/"
            className="group flex items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C5A46D]"
            aria-label="AKSHARA LIFESTYLE Home"
          >
            <BrandLogo variant="dark" layout="horizontal" mobileResponsive />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-[0.2em] text-[#55524E]">
            <Link to="/shop" className="hover:text-[#171717] transition-colors">
              Collection
            </Link>
            <Link to="/category/fashion-clothing" className="hover:text-[#171717] transition-colors">
              Apparel
            </Link>
            <Link to="/category/jewellery" className="hover:text-[#171717] transition-colors">
              Jewellery
            </Link>
            <Link to="/category/home-decor" className="hover:text-[#171717] transition-colors">
              Living
            </Link>
          </nav>

          <div className="flex items-center gap-4 sm:gap-6">
            <button
              type="button"
              onClick={openSearch}
              className="p-2 text-[#55524E] hover:text-[#171717] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C5A46D]"
              aria-label="Search collection"
            >
              <Search className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={openCartDrawer}
              className="relative p-2 text-[#55524E] hover:text-[#171717] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C5A46D]"
              aria-label={`Shopping bag with ${cartTotals.itemCount} items`}
            >
              <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
              {cartTotals.itemCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#171717] text-[#F7F4EE] text-[9px] font-mono flex items-center justify-center">
                  {cartTotals.itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 2. Spacious Editorial Central 404 Hero */}
      <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-10 flex-1 flex flex-col justify-center items-center text-center">
        {/* Subtle background ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 50% 30%, rgba(197, 164, 109, 0.12) 0%, rgba(247, 244, 238, 0) 70%)',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
          {/* Subtle category badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E9E1D5]/60 border border-[#D9D0C2] text-[10px] uppercase tracking-[0.25em] text-[#85817B]">
            <Compass className="w-3 h-3 text-[#C5A46D]" strokeWidth={1.5} />
            <span>Navigation Advisory</span>
          </div>

          {/* Oversized Editorial 404 Typography */}
          <div className="relative select-none">
            <h1 className="font-editorial text-[90px] sm:text-[140px] md:text-[180px] lg:text-[210px] leading-none text-[#171717] font-light tracking-tight">
              404
            </h1>
            <span
              className="absolute -bottom-2 sm:-bottom-4 left-1/2 -translate-x-1/2 font-mono text-[9px] sm:text-[11px] uppercase tracking-[0.35em] text-[#C5A46D] whitespace-nowrap bg-[#F7F4EE] px-4"
              aria-hidden="true"
            >
              ARCHIVAL NOTATION
            </span>
          </div>

          {/* Champagne gold decorative accent rule */}
          <div className="w-20 sm:w-28 h-[1px] bg-[#C5A46D] mx-auto my-6" aria-hidden="true" />

          {/* Headline & Editorial Copy */}
          <div className="space-y-4 max-w-xl mx-auto">
            <h2 className="font-editorial text-2xl sm:text-3xl lg:text-4xl text-[#171717] uppercase tracking-[0.14em] font-normal">
              This page has taken a different path.
            </h2>
            <p className="text-sm sm:text-base text-[#55524E] font-light leading-relaxed">
              The page you're looking for isn't here, but something beautiful is waiting to be
              discovered.
            </p>
          </div>

          {/* Brand Signature and Tagline */}
          <div className="pt-2 text-center select-none" aria-label="Brand Signature">
            <BrandLogo variant="dark" layout="emblem" size="md" className="mx-auto mb-2.5 opacity-90" />
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#171717]">
              AKSHARA LIFESTYLE
            </p>
            <p className="text-[10px] uppercase tracking-[0.32em] text-[#C5A46D] font-medium mt-1">
              EVERYDAY, ELEVATED.
            </p>
          </div>

          {/* Interaction CTAs */}
          <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#171717] hover:bg-[#0B0B0B] text-[#F7F4EE] text-xs uppercase tracking-[0.18em] font-medium transition-all duration-300 border border-[#171717] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C5A46D]"
            >
              <Home className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Return Home</span>
            </Link>

            <Link
              to="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-transparent hover:bg-[#171717] text-[#171717] hover:text-[#F7F4EE] text-xs uppercase tracking-[0.18em] font-medium transition-all duration-300 border border-[#171717] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C5A46D]"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Curated Discoveries (Featured Products) */}
      {curatedProducts.length > 0 && (
        <section className="py-16 sm:py-20 border-t border-[#E9E1D5] bg-[#F3EFE7]/50">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 border-b border-[#E9E1D5] pb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-[#C5A46D] font-medium">
                  Curated Perspective
                </p>
                <h3 className="font-editorial text-2xl sm:text-3xl text-[#171717] mt-1">
                  Remarkable Discoveries
                </h3>
              </div>
              <Link
                to="/shop"
                className="mt-3 sm:mt-0 text-xs text-[#55524E] hover:text-[#171717] tracking-[0.14em] uppercase inline-flex items-center gap-1 group"
              >
                <span>View Full Atelier</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {curatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Premium Editorial Footer Navigation */}
      <footer className="bg-[#171717] text-[#E9E1D5] border-t border-[#2A2825] py-12 sm:py-16">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-[#2A2825]">
            <div className="space-y-4 md:col-span-1">
              <BrandLogo variant="light" layout="horizontal" />
              <p className="text-xs text-[#9E9A93] leading-relaxed pt-2">
                A modern Indian luxury house crafting elevated wardrobe staples, heirloom jewellery,
                and mindful sanctuaries.
              </p>
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#C5A46D]">
                EVERYDAY, ELEVATED.
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#C5A46D] font-medium mb-4">
                Atelier Categories
              </p>
              <ul className="space-y-2.5 text-xs text-[#C9C3BA]">
                <li>
                  <Link to="/category/fashion-clothing" className="hover:text-white transition-colors">
                    Artisanal Apparel
                  </Link>
                </li>
                <li>
                  <Link to="/category/jewellery" className="hover:text-white transition-colors">
                    Fine Jewellery
                  </Link>
                </li>
                <li>
                  <Link to="/category/watches" className="hover:text-white transition-colors">
                    Timepieces & Horology
                  </Link>
                </li>
                <li>
                  <Link to="/category/beauty-cosmetics" className="hover:text-white transition-colors">
                    Haute Parfumerie & Skincare
                  </Link>
                </li>
                <li>
                  <Link to="/category/home-decor" className="hover:text-white transition-colors">
                    Sculptural Objects & Decor
                  </Link>
                </li>
                <li>
                  <Link to="/category/bags-accessories" className="hover:text-white transition-colors">
                    Handcrafted Leather & Silk
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#C5A46D] font-medium mb-4">
                Client Concierge
              </p>
              <ul className="space-y-2.5 text-xs text-[#C9C3BA]">
                <li>
                  <Link to="/account" className="hover:text-white transition-colors">
                    Personal Account
                  </Link>
                </li>
                <li>
                  <Link to="/cart" className="hover:text-white transition-colors">
                    Shopping Bag
                  </Link>
                </li>
                <li>
                  <Link to="/wishlist" className="hover:text-white transition-colors">
                    Saved Wishlist
                  </Link>
                </li>
                <li>
                  <Link to="/checkout" className="hover:text-white transition-colors">
                    Express Checkout
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#C5A46D] font-medium mb-4">
                Heritage & Assurance
              </p>
              <p className="text-xs text-[#9E9A93] leading-relaxed">
                All domestic deliveries include tamper-proof insured transit, complimentary pan-India
                shipping on orders above ₹2,000, and a 15-day return privilege.
              </p>
              <div className="pt-4 text-xs font-mono text-[#C5A46D]">
                Concierge: +91 (0) 22 4988 2000
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#85817B] gap-4">
            <p>© {new Date().getFullYear()} AKSHARA LIFESTYLE PRIVATE LIMITED. All rights reserved.</p>
            <p className="text-[#9E9A93]">Designed & Engineered for Elevated Living.</p>
          </div>
        </div>
      </footer>

      <CartDrawer />
      <SearchOverlay />
      <ToastViewport />
    </div>
  );
}
