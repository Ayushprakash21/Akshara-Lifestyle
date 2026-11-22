import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, Search, X } from 'lucide-react';
import { useCommerce } from '../store/CommerceContext';
import { POPULAR_SEARCHES } from '../services/seedData';
import { formatINR, scoreProductMatch } from '../utils/commerceLogic';
import { SafeImage } from './SafeImage';

export function SearchOverlay() {
  const {
    isSearchOpen,
    closeSearch,
    products,
    categories,
    searchHistory,
    addSearchHistory,
    clearSearchHistory,
  } = useCommerce();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isSearchOpen) {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 60);
      return () => window.clearTimeout(timer);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) closeSearch();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isSearchOpen, closeSearch]);

  const matchedProducts = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return [];
    return products
      .filter((p) => p.status === 'active')
      .map((p) => ({ product: p, score: scoreProductMatch(p, trimmed) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((entry) => entry.product);
  }, [products, query]);

  const matchedCategories = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(trimmed) ||
        c.subcategories.some((s) => s.toLowerCase().includes(trimmed)),
    );
  }, [categories, query]);

  const fallbackRecommendations = useMemo(
    () => products.filter((p) => p.isBestSeller || p.isTrending).slice(0, 4),
    [products],
  );

  if (!isSearchOpen) return null;

  const executeSearch = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    addSearchHistory(clean);
    closeSearch();
    navigate(`/search?q=${encodeURIComponent(clean)}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-6 sm:pt-14 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Search AKSHARA LIFESTYLE"
    >
      <div
        className="fixed inset-0 bg-[#0B0B0B]/60 backdrop-blur-[2px]"
        onClick={closeSearch}
      />

      <div className="relative z-10 w-full max-w-3xl bg-[#F7F4EE] border border-[#E9E1D5] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Input bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            executeSearch(query);
          }}
          className="flex items-center gap-3 px-5 py-4 bg-white border-b border-[#E9E1D5]"
        >
          <Search className="w-5 h-5 text-[#85817B] shrink-0" strokeWidth={1.5} />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search blazers, lotus pendant, saffron serum, lamps, headphones..."
            aria-label="Search products"
            className="flex-1 bg-transparent text-sm sm:text-base text-[#171717] placeholder:text-[#85817B] focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search text"
              className="text-xs text-[#85817B] hover:text-[#171717]"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={closeSearch}
            aria-label="Close search"
            className="p-1.5 text-[#171717] hover:text-[#9A7A45]"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </form>

        {/* Suggestions body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {!query.trim() ? (
            <div className="grid sm:grid-cols-2 gap-8">
              {/* Recent history */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[#85817B]">
                    Recent Searches
                  </p>
                  {searchHistory.length > 0 && (
                    <button
                      type="button"
                      onClick={clearSearchHistory}
                      className="text-xs text-[#85817B] hover:text-[#171717] underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {searchHistory.length === 0 ? (
                  <p className="text-xs text-[#85817B]">
                    Your recent searches will appear here.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {searchHistory.map((item) => (
                      <li key={item}>
                        <button
                          type="button"
                          onClick={() => executeSearch(item)}
                          className="flex items-center gap-2 text-sm text-[#171717] hover:text-[#9A7A45]"
                        >
                          <Clock className="w-3.5 h-3.5 text-[#85817B]" strokeWidth={1.5} />
                          <span>{item}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Popular searches */}
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-[#85817B] mb-3">
                  Popular Searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => executeSearch(term)}
                      className="px-3 py-1.5 bg-white border border-[#E9E1D5] hover:border-[#171717] text-xs text-[#171717] transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {matchedCategories.length > 0 && (
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[#85817B] mb-2.5">
                    Categories
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {matchedCategories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/category/${cat.slug}`}
                        onClick={closeSearch}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E9E1D5] hover:border-[#171717] text-xs text-[#171717]"
                      >
                        <span>{cat.name}</span>
                        <ArrowRight className="w-3 h-3 text-[#C5A46D]" strokeWidth={1.5} />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {matchedProducts.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#85817B]">
                      Suggested Products
                    </p>
                    <button
                      type="button"
                      onClick={() => executeSearch(query)}
                      className="text-xs font-medium text-[#171717] hover:text-[#9A7A45] inline-flex items-center gap-1"
                    >
                      View all results
                      <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {matchedProducts.map((p) => (
                      <Link
                        key={p.id}
                        to={`/product/${p.slug}`}
                        onClick={() => {
                          addSearchHistory(query);
                          closeSearch();
                        }}
                        className="flex items-center gap-3.5 p-2.5 bg-white border border-[#E9E1D5] hover:border-[#171717] transition-colors"
                      >
                        <SafeImage
                          src={p.images[0]}
                          alt={p.name}
                          className="w-14 h-16 object-cover bg-[#E9E1D5] shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-[11px] uppercase tracking-[0.08em] text-[#85817B]">
                            {p.brandName}
                          </p>
                          <p className="text-sm font-medium text-[#171717] truncate">
                            {p.name}
                          </p>
                          <p className="text-xs font-semibold text-[#171717] tabular-nums mt-0.5">
                            {formatINR(p.price)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="p-4 bg-white border border-[#E9E1D5]">
                    <p className="text-sm font-medium text-[#171717]">
                      No exact pieces matched &ldquo;{query}&rdquo;
                    </p>
                    <p className="mt-1 text-xs text-[#85817B]">
                      Try checking spelling or explore our signature bestsellers below.
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#85817B] mb-3">
                      Curated Recommendations
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {fallbackRecommendations.map((p) => (
                        <Link
                          key={p.id}
                          to={`/product/${p.slug}`}
                          onClick={closeSearch}
                          className="flex items-center gap-3.5 p-2.5 bg-white border border-[#E9E1D5] hover:border-[#171717] transition-colors"
                        >
                          <SafeImage
                            src={p.images[0]}
                            alt={p.name}
                            className="w-14 h-16 object-cover bg-[#E9E1D5] shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#171717] truncate">
                              {p.name}
                            </p>
                            <p className="text-xs font-semibold text-[#171717] tabular-nums mt-0.5">
                              {formatINR(p.price)}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
