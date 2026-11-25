import React, { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, Sparkles } from 'lucide-react';
import { useCommerce } from '../../store/CommerceContext';
import { ProductCard } from '../ProductCard';
import type { Product } from '../../types/commerce';

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating';

export function ProductCatalogSection() {
  const { products, categories } = useCommerce();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  // Listen to hash changes (e.g. #catalog-watches) to auto-select category
  React.useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#catalog-')) {
        const catSlug = hash.replace('#catalog-', '');
        setSelectedCategory(catSlug);
        const el = document.getElementById('collection');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Filter active products
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => p.status === 'active');

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.categorySlug === selectedCategory);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brandName.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q)
      );
    }

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result = [...result].sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0));
        break;
      case 'featured':
      default:
        result = [...result].sort(
          (a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0)
        );
        break;
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <section id="collection" className="relative w-full bg-[#F7F4EE] text-[#171717] py-20 lg:py-28 border-t border-[#E5DFD5]">
      <div className="max-w-[1380px] w-full mx-auto px-4 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-[#E5DFD5]">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A46D]" />
              <span className="text-[11px] font-mono tracking-[0.28em] text-[#C5A46D] uppercase font-semibold">
                CURATED COLLECTION
              </span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight mt-1 text-[#171717]">
              SHOP THE <span className="italic font-normal text-[#C5A46D]">CATALOGUE</span>
            </h2>
          </div>

          <p className="max-w-md text-xs sm:text-sm font-body text-[#6B645A] font-light leading-relaxed">
            Every object in our permanent collection is produced in disciplined studio runs. Transparent pricing, all-inclusive delivery, and Pan-India insured fulfillment.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-8 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-xs font-nav uppercase tracking-wider whitespace-nowrap transition-all duration-200 cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#171717] text-[#F7F4EE]'
                  : 'bg-white border border-[#E5DFD5] text-[#6B645A] hover:border-[#171717]'
              }`}
            >
              All Objects ({products.filter((p) => p.status === 'active').length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-full text-xs font-nav uppercase tracking-wider whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  selectedCategory === cat.slug
                    ? 'bg-[#171717] text-[#F7F4EE]'
                    : 'bg-white border border-[#E5DFD5] text-[#6B645A] hover:border-[#171717]'
                }`}
              >
                {cat.shortName}
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#8C8478] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter objects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-[#E5DFD5] rounded-full text-xs font-nav focus:outline-none focus:border-[#C5A46D]"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none pl-4 pr-9 py-2 bg-white border border-[#E5DFD5] rounded-full text-xs font-nav uppercase tracking-wider text-[#171717] focus:outline-none focus:border-[#C5A46D] cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Trending</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-[#8C8478] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-20 text-center max-w-md mx-auto">
            <p className="font-editorial text-2xl text-[#171717]">
              {selectedCategory === 'watches'
                ? 'No products currently available in Watches.'
                : 'No objects found matching your criteria.'}
            </p>
            <p className="font-body text-xs text-[#8C8478] mt-2 tracking-wide">
              {selectedCategory === 'watches'
                ? 'Our horological collection is currently in studio development. New timepiece editions will be released shortly.'
                : 'Please try searching for another object or resetting filters.'}
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-6 px-6 py-2.5 bg-[#171717] hover:bg-[#C5A46D] hover:text-[#0B0B0B] text-[#F7F4EE] rounded-full text-xs font-nav uppercase tracking-widest cursor-pointer transition-colors"
            >
              Browse All Available Objects
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
