import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { CartDrawer } from '../components/CartDrawer';
import { SearchOverlay } from '../components/SearchOverlay';
import { ToastViewport } from '../components/ToastViewport';

export function StorefrontLayout() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, search]);

  // Route-aware layout check: hide storefront navigation and overlays on checkout
  const isCheckout = pathname === '/checkout' || pathname.startsWith('/checkout/');

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F4EE] text-[#171717]">
      {/* Hide full storefront navigation header on checkout to avoid duplicate header */}
      {!isCheckout && <Header />}
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {!isCheckout && <CartDrawer />}
      {!isCheckout && <SearchOverlay />}
      <ToastViewport />
    </div>
  );
}
