import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Copy, Mail } from 'lucide-react';
import { useCommerce } from '../store/CommerceContext';
import { validateNewsletterSubscription } from '../utils/commerceLogic';
import { BrandLogo } from './BrandLogo';

const WELCOME_OFFER_CODE = 'WELCOME500';

export function Footer() {
  const { categories, newsletterSubscribers, subscribeNewsletter, pushToast } = useCommerce();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [subscribedEmail, setSubscribedEmail] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateNewsletterSubscription(email, newsletterSubscribers);

    if (validation.status === 'invalid') {
      setError(validation.message ?? 'Please enter a valid email address.');
      setNotice('');
      return;
    }

    if (validation.status === 'duplicate') {
      setError('');
      setNotice(
        validation.message ?? `${validation.normalizedEmail} is already subscribed to promotional updates.`,
      );
      return;
    }

    const ok = subscribeNewsletter(validation.normalizedEmail);
    if (!ok) {
      setError('Please enter a valid email address.');
      setNotice('');
      return;
    }

    setError('');
    setNotice('');
    setSubscribedEmail(validation.normalizedEmail);
    setEmail('');
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(WELCOME_OFFER_CODE);
      setCopiedCode(true);
      pushToast('Code copied', `${WELCOME_OFFER_CODE} is ready to apply at checkout.`, 'success');
      window.setTimeout(() => setCopiedCode(false), 2400);
    } catch {
      pushToast('Welcome code', `Use ${WELCOME_OFFER_CODE} at checkout for ₹500 off.`);
    }
  };

  const feedbackId = error
    ? 'footer-newsletter-error'
    : notice
      ? 'footer-newsletter-notice'
      : 'footer-newsletter-hint';

  return (
    <footer className="bg-[#0B0B0B] text-[#E9E1D5] border-t border-[#22201E]">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Newsletter Subscription Band */}
        <section
          aria-labelledby="footer-newsletter-heading"
          className="py-12 lg:py-14 border-b border-[#1F1D1B] grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
        >
          <div className="lg:col-span-6 space-y-2.5">
            <p className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.26em] text-[#C5A46D] font-medium">
              <Mail className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
              Newsletter Subscription
            </p>
            <h2
              id="footer-newsletter-heading"
              className="font-editorial text-2xl sm:text-3xl text-[#F7F4EE] font-light tracking-[0.01em]"
            >
              Private Releases &amp; Promotional Updates
            </h2>
            <p className="text-sm text-[#A8A39C] leading-relaxed max-w-xl">
              Join the AKSHARA Journal to receive early access to seasonal capsules, studio editions, and member-only promotional offers.
            </p>
          </div>

          <div className="lg:col-span-6">
            {subscribedEmail ? (
              <div
                role="status"
                aria-live="polite"
                className="bg-[#141413] border border-[#2F2D2A] p-5 sm:p-6 space-y-4"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 w-6 h-6 shrink-0 border border-[#C5A46D]/60 bg-[#C5A46D]/10 text-[#C5A46D] flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <div className="space-y-1 min-w-0">
                    <p className="text-sm font-medium text-[#F7F4EE]">
                      You&apos;re subscribed to AKSHARA promotional updates.
                    </p>
                    <p className="text-xs text-[#A8A39C] break-all">
                      Updates will be sent to{' '}
                      <span className="text-[#E9E1D5]">{subscribedEmail}</span>.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#22201E] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-xs text-[#A8A39C]">
                    <span>Welcome privilege:</span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      aria-label={`Copy welcome promo code ${WELCOME_OFFER_CODE}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1C1B19] border border-[#34312C] hover:border-[#C5A46D] text-[#C5A46D] font-mono tracking-[0.12em] text-[11px] transition-colors"
                    >
                      {WELCOME_OFFER_CODE}
                      {copiedCode ? (
                        <Check className="w-3 h-3" strokeWidth={1.8} aria-hidden="true" />
                      ) : (
                        <Copy className="w-3 h-3" strokeWidth={1.6} aria-hidden="true" />
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSubscribedEmail(null);
                      setNotice('');
                      setError('');
                    }}
                    className="text-[11px] uppercase tracking-[0.16em] text-[#A8A39C] hover:text-[#F7F4EE] underline underline-offset-4 transition-colors"
                  >
                    Subscribe another email
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="flex flex-col sm:flex-row gap-2.5"
                >
                  <label htmlFor="footer-newsletter" className="sr-only">
                    Email address for promotional updates
                  </label>
                  <input
                    id="footer-newsletter"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                      if (notice) setNotice('');
                    }}
                    placeholder="Enter your email address"
                    aria-invalid={Boolean(error)}
                    aria-describedby={feedbackId}
                    className="flex-1 min-w-0 bg-[#171717] border border-[#2F2D2A] px-4 py-3.5 text-sm text-[#F7F4EE] placeholder:text-[#85817B] focus:border-[#C5A46D] focus:outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3.5 bg-[#C5A46D] hover:bg-[#D4B680] text-[#0B0B0B] text-xs tracking-[0.16em] uppercase font-semibold inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Subscribe
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.7} aria-hidden="true" />
                  </button>
                </form>

                {error ? (
                  <p
                    id="footer-newsletter-error"
                    role="alert"
                    className="mt-2.5 text-xs text-[#E5989B]"
                  >
                    {error}
                  </p>
                ) : notice ? (
                  <p
                    id="footer-newsletter-notice"
                    role="status"
                    aria-live="polite"
                    className="mt-2.5 text-xs text-[#C5A46D]"
                  >
                    {notice}
                  </p>
                ) : (
                  <p id="footer-newsletter-hint" className="mt-2.5 text-xs text-[#85817B]">
                    Receive ₹500 off your first order above ₹3,000 with code{' '}
                    <span className="text-[#C9C3BA] font-medium">{WELCOME_OFFER_CODE}</span>. Unsubscribe anytime.
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Main Footer Navigation Grid */}
        <div className="py-12 lg:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-5">
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
          <div className="lg:col-span-3">
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
                  My Account &amp; Orders
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="hover:text-white transition-colors">
                  Track Order
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

          {/* Concierge & Flagship */}
          <div className="lg:col-span-3">
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-[#C5A46D] font-medium mb-4">
              Concierge
            </h3>
            <ul className="space-y-2.5 text-sm text-[#C9C3BA]">
              <li>
                <a
                  href="mailto:concierge@aksharalifestyle.in"
                  className="hover:text-white transition-colors"
                >
                  concierge@aksharalifestyle.in
                </a>
              </li>
              <li className="text-[#A8A39C]">Mon–Sat · 10:00 – 19:00 IST</li>
              <li className="text-[#A8A39C]">Kala Ghoda, Mumbai 400001</li>
              <li className="text-xs text-[#85817B] pt-1 max-w-xs">
                14-day complimentary exchanges across serviceable Indian PIN codes.
              </li>
            </ul>
          </div>
        </div>

        <div className="py-7 border-t border-[#1F1D1B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#85817B]">
          <p>© {new Date().getFullYear()} AKSHARA LIFESTYLE. All rights reserved. Prices inclusive of applicable Indian GST.</p>
          <div className="flex flex-wrap items-center gap-5">
            <span>UPI · Cards · Net Banking · COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

