import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useCommerce } from '../store/CommerceContext';
import { BrandLogo } from './BrandLogo';

export function Footer() {
  const { categories, subscribeNewsletter } = useCommerce();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscribeNewsletter(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setEmail('');
  };

  return (
    <footer className="bg-[#0B0B0B] text-[#E9E1D5] border-t border-[#22201E]">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-10 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-5">
            <Link to="/" className="inline-block">
              <BrandLogo variant="light" layout="horizontal" showSubword />
            </Link>
            <p className="text-sm text-[#A8A39C] leading-relaxed max-w-sm">
              Contemporary Indian accessible luxury across fashion, jewellery, botanical beauty, architectural home objects, personal audio, and structured leather carry.
            </p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#C5A46D] font-medium">
              EVERYDAY, ELEVATED.
            </p>
            <p className="text-xs text-[#85817B]">
              Mumbai Flagship Office · Pan-India Insured Delivery · GST Compliant Invoicing
            </p>
          </div>

          {/* Categories */}
          <div className="lg:col-span-2">
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-[#C5A46D] font-medium mb-4">
              Departments
            </h3>
            <ul className="space-y-2.5 text-sm text-[#C9C3BA]">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/category/${cat.slug}`}
                    className="hover:text-white transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Client Services */}
          <div className="lg:col-span-2">
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-[#C5A46D] font-medium mb-4">
              Client Care
            </h3>
            <ul className="space-y-2.5 text-sm text-[#C9C3BA]">
              <li>
                <Link to="/account" className="hover:text-white transition-colors">
                  My Account & Orders
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-white transition-colors">
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">
                  Shopping Bag
                </Link>
              </li>
              <li>
                <Link to="/shop?sort=newest" className="hover:text-white transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/shop?offers=true" className="hover:text-white transition-colors">
                  Limited Offers
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-4">
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-[#C5A46D] font-medium mb-4">
              The AKSHARA Journal
            </h3>
            <p className="text-sm text-[#A8A39C] leading-relaxed">
              Receive private access to seasonal capsules, studio editions, and archival offers.
            </p>
            <form onSubmit={handleSubmit} className="mt-4 flex flex-col sm:flex-row gap-2">
              <label htmlFor="footer-newsletter" className="sr-only">
                Email address
              </label>
              <input
                id="footer-newsletter"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter your email"
                className="flex-1 bg-[#171717] border border-[#2F2D2A] px-4 py-3 text-sm text-white placeholder:text-[#85817B] focus:border-[#C5A46D] focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-3 bg-[#C5A46D] hover:bg-[#D4B680] text-[#0B0B0B] text-xs tracking-[0.14em] uppercase font-semibold inline-flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
              >
                Subscribe
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.6} />
              </button>
            </form>
            {error && <p className="mt-2 text-xs text-[#E5989B]">{error}</p>}
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-[#1F1D1B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#85817B]">
          <p>© {new Date().getFullYear()} AKSHARA LIFESTYLE. All rights reserved. Prices inclusive of applicable Indian GST.</p>
          <div className="flex flex-wrap items-center gap-5">
            <span>UPI · Cards · Net Banking · COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
