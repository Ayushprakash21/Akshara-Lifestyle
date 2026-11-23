import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CommerceProvider } from './store/CommerceContext';
import { StorefrontLayout } from './layouts/StorefrontLayout';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ForgotPasswordPage, LoginPage, RegisterPage } from './pages/AuthPages';
import { AccountPage } from './pages/AccountPage';
import { NotFoundPage, WishlistPage } from './pages/WishlistAndNotFoundPages';
import { AdminPage } from './pages/AdminPage';

export default function App() {
  return (
    <ErrorBoundary>
      <CommerceProvider>
        <BrowserRouter>
          <Routes>
            {/* Dedicated role-protected Admin Console */}
            <Route path="/admin/*" element={<AdminPage />} />

            {/* Customer Storefront Routes */}
            <Route element={<StorefrontLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<CatalogPage mode="shop" />} />
              <Route path="/category/:slug" element={<CatalogPage mode="category" />} />
              <Route path="/search" element={<CatalogPage mode="search" />} />
              <Route path="/product/:slug" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/checkout/*" element={<CheckoutPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/account" element={<AccountPage />} />
            </Route>

            {/* Dedicated Luxury Editorial 404 Experience */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </CommerceProvider>
    </ErrorBoundary>
  );
}
