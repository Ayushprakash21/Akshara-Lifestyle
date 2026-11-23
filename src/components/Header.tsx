import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { useCommerce } from '../store/CommerceContext';
import { BrandLogo } from './BrandLogo';

export function Header() {
  const {
    categories,
    cartTotals,
    wishlist,
    currentUser,
    homepageConfig,
    openCartDrawer,
    openSearch,
  } = useCommerce();
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  return (
    <>
      {/* Slim dismissible announcement bar (<= 36px) */}
      {showAnnouncement && (
        <div className="bg-[#171717] text-[#F7F4EE] text-[11px] tracking-[0.06em] px-4 py-2 relative">
          <div className="max-w-[1380px] mx-auto flex items-center justify-center gap-3 pr-7">
            <p className="truncate text-center">{homepageConfig.announcementText}</p>
          </div>
          <button
            type="button"
            onClick={() => setShowAnnouncement(false)}
            aria-label="Dismiss announcement"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8A39C] hover:text-white p-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </div>
      )}

      {/* Sticky Luxury Navigation Header — clean single-row 3-zone contract */}
      <header className="sticky top-0 z-40 bg-[#F7F4EE]/95 backdrop-blur-sm border-b border-[#E9E1D5]">
        <div className="max-w-[1380px] mx-auto px-3 sm:px-6 lg:px-10 h-16 lg:h-[72px] flex items-center justify-between gap-2 sm:gap-6">
          {/* Left: Mobile Menu + Brand Wordmark */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-1.5 -ml-1 text-[#171717] hover:text-[#C5A46D] transition-colors"
            >
              <Menu className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <Link
              to="/"
              className="inline-flex items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C5A46D]"
            >
              <BrandLogo variant="dark" layout="horizontal" mobileResponsive />
            </Link>
          </div>

          {/* Center: Clean single-line Category Navigation */}
          <nav
            aria-label="Primary categories"
            className="hidden lg:flex items-center gap-7 text-[13px] tracking-[0.04em] text-[#171717]"
          >
            {categories.map((cat) => (
              <NavLink
                key={cat.id}
                to={`/category/${cat.slug}`}
                className={({ isActive }) =>
                  `relative py-1 whitespace-nowrap shrink-0 transition-colors hover:text-[#9A7A45] ${
                    isActive
                      ? 'text-[#171717] font-medium after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-[1.5px] after:bg-[#C5A46D]'
                      : 'text-[#44423F]'
                  }`
                }
              >
                {cat.shortName}
              </NavLink>
            ))}
          </nav>

          {/* Right: Search, Account, Wishlist, Shopping Bag */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={openSearch}
              aria-label="Search catalog"
              className="inline-flex items-center gap-2 p-2 sm:px-2.5 text-xs text-[#171717] hover:text-[#9A7A45] transition-colors whitespace-nowrap"
            >
              <Search className="w-[18px] h-[18px]" strokeWidth={1.5} />
              <span className="hidden xl:inline tracking-[0.04em]">Search</span>
            </button>

            <Link
              to="/wishlist"
              aria-label={`Wishlist (${wishlist.length} items)`}
              className="hidden sm:inline-flex relative p-2 text-[#171717] hover:text-[#9A7A45] transition-colors"
            >
              <Heart className="w-[18px] h-[18px]" strokeWidth={1.5} />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-0.5 min-w-[15px] h-[15px] px-1 bg-[#C5A46D] text-[#0B0B0B] text-[10px] font-semibold flex items-center justify-center tabular-nums">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link
              to={currentUser ? '/account' : '/login'}
              aria-label={currentUser ? `Account (${currentUser.name})` : 'Sign in'}
              className="p-2 text-[#171717] hover:text-[#9A7A45] transition-colors inline-flex items-center gap-1.5"
            >
              <User className="w-[18px] h-[18px]" strokeWidth={1.5} />
              {currentUser && (
                <span className="hidden xl:inline text-xs font-medium text-[#171717] max-w-[90px] truncate">
                  {currentUser.name.split(' ')[0]}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={openCartDrawer}
              aria-label={`Shopping bag (${cartTotals.itemCount} items)`}
              className="relative inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:pl-2.5 sm:pr-3 py-2 bg-[#171717] hover:bg-[#0B0B0B] text-[#F7F4EE] text-xs tracking-[0.08em] uppercase transition-colors whitespace-nowrap shrink-0"
            >
              <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
              <span className="hidden sm:inline">Bag</span>
              <span className="tabular-nums font-semibold text-[#C5A46D]">
                {cartTotals.itemCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div
            className="fixed inset-0 bg-[#0B0B0B]/50 backdrop-blur-[2px]"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-[85vw] max-w-sm bg-[#F7F4EE] h-full flex flex-col border-r border-[#E9E1D5]">
            <div className="h-16 px-5 flex items-center justify-between border-b border-[#E9E1D5]">
              <BrandLogo variant="dark" layout="horizontal" />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="p-2 text-[#171717]"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-6">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openSearch();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-[#E9E1D5] text-sm text-[#85817B]"
              >
                <Search className="w-4 h-4 text-[#171717]" strokeWidth={1.5} />
                <span>Search products, brands...</span>
              </button>

              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#85817B] mb-3">
                  Shop by Category
                </p>
                <div className="divide-y divide-[#E9E1D5] border-y border-[#E9E1D5]">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/category/${cat.slug}`}
                      className="flex items-center justify-between py-3.5 text-sm font-medium text-[#171717] hover:text-[#9A7A45]"
                    >
                      <span>{cat.name}</span>
                      <span className="text-xs text-[#85817B]">Explore</span>
                    </Link>
                  ))}
                  <Link
                    to="/shop"
                    className="flex items-center justify-between py-3.5 text-sm font-medium text-[#171717]"
                  >
                    <span>All Collections</span>
                    <span className="text-xs text-[#C5A46D]">View All</span>
                  </Link>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <Link
                  to={currentUser ? '/account' : '/login'}
                  className="block w-full py-3 px-4 text-center bg-[#171717] text-white text-xs tracking-[0.14em] uppercase"
                >
                  {currentUser ? `My Account (${currentUser.name.split(' ')[0]})` : 'Sign In / Register'}
                </Link>
                <Link
                  to="/wishlist"
                  className="block w-full py-3 px-4 text-center border border-[#171717] text-[#171717] text-xs tracking-[0.14em] uppercase"
                >
                  Saved Wishlist ({wishlist.length})
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
