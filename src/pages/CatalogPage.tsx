import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, SlidersHorizontal, X } from 'lucide-react';
import type { CategorySlug, FilterState } from '../types/commerce';
import { useCommerce } from '../store/CommerceContext';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { filterAndSortProducts, formatINR } from '../utils/commerceLogic';
import { ProductCard } from '../components/ProductCard';
import { SafeImage } from '../components/SafeImage';

const DEFAULT_FILTERS: FilterState = {
  categorySlug: 'all',
  subcategory: 'All',
  searchQuery: '',
  minPrice: undefined,
  maxPrice: undefined,
  brands: [],
  colors: [],
  sizes: [],
  inStockOnly: false,
  minRating: 0,
  minDiscount: 0,
  newArrivalsOnly: false,
  sortBy: 'recommended',
};

export function CatalogPage({ mode = 'shop' }: { mode?: 'shop' | 'category' | 'search' }) {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, categories, reviews, addSearchHistory } = useCommerce();

  const currentCategory = useMemo(
    () => (mode === 'category' && slug ? categories.find((c) => c.slug === slug) : undefined),
    [categories, mode, slug],
  );

  const urlQuery = searchParams.get('q') ?? '';
  const urlSort = (searchParams.get('sort') as FilterState['sortBy']) ?? 'recommended';
  const urlOffers = searchParams.get('offers') === 'true';

  const [filters, setFilters] = useState<FilterState>(() => ({
    ...DEFAULT_FILTERS,
    categorySlug: (currentCategory?.slug as CategorySlug) ?? 'all',
    searchQuery: urlQuery,
    sortBy: urlSort,
    minDiscount: urlOffers ? 10 : 0,
  }));
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync route changes cleanly into filter state
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      categorySlug: (currentCategory?.slug as CategorySlug) ?? 'all',
      subcategory: 'All',
      searchQuery: mode === 'search' ? urlQuery : '',
      sortBy: urlSort || 'recommended',
      minDiscount: urlOffers ? 10 : 0,
    }));
  }, [currentCategory?.slug, mode, urlQuery, urlSort, urlOffers]);

  useDocumentMeta({
    title: currentCategory
      ? currentCategory.name
      : mode === 'search' && urlQuery
        ? `Search: ${urlQuery}`
        : 'All Collections',
    description:
      currentCategory?.description ??
      'Explore thoughtfully selected fashion, jewellery, beauty, home décor, electronics, and leather carry.',
  });

  // Derive available facet options from current scope
  const scopedCatalog = useMemo(() => {
    return products.filter(
      (p) =>
        p.status === 'active' &&
        (filters.categorySlug === 'all' || !filters.categorySlug
          ? true
          : p.categorySlug === filters.categorySlug),
    );
  }, [products, filters.categorySlug]);

  const facetOptions = useMemo(() => {
    const brands = Array.from(new Set(scopedCatalog.map((p) => p.brandName))).sort();
    const colors = Array.from(
      new Set(scopedCatalog.flatMap((p) => p.variants.map((v) => v.colorName))),
    ).sort();
    const sizes = Array.from(
      new Set(
        scopedCatalog.flatMap((p) => p.variants.map((v) => v.size).filter(Boolean) as string[]),
      ),
    );
    return { brands, colors, sizes };
  }, [scopedCatalog]);

  const filteredProducts = useMemo(
    () => filterAndSortProducts(products, filters, reviews),
    [products, filters, reviews],
  );

  const relatedCategories = useMemo(
    () => categories.filter((c) => c.slug !== currentCategory?.slug).slice(0, 3),
    [categories, currentCategory?.slug],
  );

  const toggleArrayFilter = (key: 'brands' | 'colors' | 'sizes', value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  };

  const resetFilters = () => {
    setFilters({
      ...DEFAULT_FILTERS,
      categorySlug: (currentCategory?.slug as CategorySlug) ?? 'all',
      searchQuery: mode === 'search' ? urlQuery : '',
    });
  };

  const activeFilterCount =
    filters.brands.length +
    filters.colors.length +
    filters.sizes.length +
    (filters.inStockOnly ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.minDiscount > 0 ? 1 : 0) +
    (filters.newArrivalsOnly ? 1 : 0) +
    (filters.minPrice !== undefined || filters.maxPrice !== undefined ? 1 : 0) +
    (filters.subcategory && filters.subcategory !== 'All' ? 1 : 0);

  const filterPanelContent = (
    <div className="space-y-7 text-sm">
      {/* Category selector (only on /shop or /search) */}
      {mode !== 'category' && (
        <div>
          <h3 className="text-[11px] uppercase tracking-[0.18em] text-[#85817B] font-medium mb-3">
            Department
          </h3>
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => setFilters((p) => ({ ...p, categorySlug: 'all', subcategory: 'All' }))}
              className={`block w-full text-left py-1 text-sm transition-colors ${
                filters.categorySlug === 'all'
                  ? 'font-semibold text-[#171717]'
                  : 'text-[#55524E] hover:text-[#171717]'
              }`}
            >
              All Departments
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() =>
                  setFilters((p) => ({ ...p, categorySlug: cat.slug, subcategory: 'All' }))
                }
                className={`block w-full text-left py-1 text-sm transition-colors ${
                  filters.categorySlug === cat.slug
                    ? 'font-semibold text-[#171717]'
                    : 'text-[#55524E] hover:text-[#171717]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price range */}
      <div className="pt-5 border-t border-[#E9E1D5]">
        <h3 className="text-[11px] uppercase tracking-[0.18em] text-[#85817B] font-medium mb-3">
          Price Range (INR)
        </h3>
        <div className="space-y-2">
          {[
            { label: 'All Prices', min: undefined, max: undefined },
            { label: 'Under ₹5,000', min: 0, max: 5000 },
            { label: '₹5,000 – ₹10,000', min: 5000, max: 10000 },
            { label: '₹10,000 – ₹15,000', min: 10000, max: 15000 },
            { label: 'Above ₹15,000', min: 15000, max: undefined },
          ].map((range) => {
            const active = filters.minPrice === range.min && filters.maxPrice === range.max;
            return (
              <button
                key={range.label}
                type="button"
                onClick={() =>
                  setFilters((p) => ({ ...p, minPrice: range.min, maxPrice: range.max }))
                }
                className={`block w-full text-left py-1 text-sm tabular-nums ${
                  active ? 'font-semibold text-[#171717]' : 'text-[#55524E] hover:text-[#171717]'
                }`}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Brands */}
      {facetOptions.brands.length > 0 && (
        <div className="pt-5 border-t border-[#E9E1D5]">
          <h3 className="text-[11px] uppercase tracking-[0.18em] text-[#85817B] font-medium mb-3">
            House / Brand
          </h3>
          <div className="space-y-2">
            {facetOptions.brands.map((brand) => (
              <label key={brand} className="flex items-center gap-2.5 cursor-pointer text-[#171717]">
                <input
                  type="checkbox"
                  checked={filters.brands.includes(brand)}
                  onChange={() => toggleArrayFilter('brands', brand)}
                  className="accent-[#171717] w-4 h-4"
                />
                <span>{brand}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Colours */}
      {facetOptions.colors.length > 0 && (
        <div className="pt-5 border-t border-[#E9E1D5]">
          <h3 className="text-[11px] uppercase tracking-[0.18em] text-[#85817B] font-medium mb-3">
            Colour
          </h3>
          <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
            {facetOptions.colors.map((color) => (
              <label key={color} className="flex items-center gap-2.5 cursor-pointer text-[#171717]">
                <input
                  type="checkbox"
                  checked={filters.colors.includes(color)}
                  onChange={() => toggleArrayFilter('colors', color)}
                  className="accent-[#171717] w-4 h-4"
                />
                <span>{color}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Sizes */}
      {facetOptions.sizes.length > 0 && (
        <div className="pt-5 border-t border-[#E9E1D5]">
          <h3 className="text-[11px] uppercase tracking-[0.18em] text-[#85817B] font-medium mb-3">
            Size / Edition
          </h3>
          <div className="flex flex-wrap gap-2">
            {facetOptions.sizes.map((size) => {
              const active = filters.sizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleArrayFilter('sizes', size)}
                  className={`px-3 py-1.5 text-xs border transition-colors ${
                    active
                      ? 'bg-[#171717] text-white border-[#171717]'
                      : 'bg-white text-[#171717] border-[#D9D0C2] hover:border-[#171717]'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Availability, Discount, Rating, New Arrivals */}
      <div className="pt-5 border-t border-[#E9E1D5] space-y-3">
        <h3 className="text-[11px] uppercase tracking-[0.18em] text-[#85817B] font-medium">
          Refine
        </h3>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => setFilters((p) => ({ ...p, inStockOnly: e.target.checked }))}
            className="accent-[#171717] w-4 h-4"
          />
          <span>In Stock Only</span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.newArrivalsOnly}
            onChange={(e) => setFilters((p) => ({ ...p, newArrivalsOnly: e.target.checked }))}
            className="accent-[#171717] w-4 h-4"
          />
          <span>New Arrivals</span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.minDiscount >= 15}
            onChange={(e) =>
              setFilters((p) => ({ ...p, minDiscount: e.target.checked ? 15 : 0 }))
            }
            className="accent-[#171717] w-4 h-4"
          />
          <span>15% Off & Above</span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.minRating >= 4}
            onChange={(e) =>
              setFilters((p) => ({ ...p, minRating: e.target.checked ? 4 : 0 }))
            }
            className="accent-[#171717] w-4 h-4"
          />
          <span>Rated 4★ & Above</span>
        </label>
      </div>

      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={resetFilters}
          className="w-full py-2.5 border border-[#171717] text-xs tracking-[0.14em] uppercase text-[#171717] hover:bg-[#171717] hover:text-white transition-colors"
        >
          Reset All Filters
        </button>
      )}
    </div>
  );

  return (
    <div>
      {/* Category Hero Banner or Shop/Search Header */}
      {currentCategory ? (
        <section className="relative bg-[#171717] text-[#F7F4EE] overflow-hidden">
          <div className="max-w-[1380px] mx-auto grid lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-7 px-4 sm:px-6 lg:px-10 py-14 lg:py-20 flex flex-col justify-center">
              <nav aria-label="Breadcrumb" className="text-xs text-[#A8A39C] flex items-center gap-2">
                <Link to="/" className="hover:text-white">
                  Home
                </Link>
                <span>/</span>
                <span className="text-[#C5A46D]">{currentCategory.name}</span>
              </nav>
              <h1 className="mt-4 font-editorial text-4xl sm:text-5xl text-white">
                {currentCategory.name}
              </h1>
              <p className="mt-3 text-sm sm:text-base text-[#E9E1D5]/85 max-w-xl leading-relaxed">
                {currentCategory.description}
              </p>
              <p className="mt-5 text-xs tracking-[0.14em] uppercase text-[#C5A46D]">
                {currentCategory.featuredCollectionTitle} · {currentCategory.featuredCollectionNote}
              </p>
            </div>
            <div className="lg:col-span-5 relative min-h-[240px] lg:min-h-[340px] bg-[#24221F]">
              <SafeImage
                src={currentCategory.heroImage}
                alt={currentCategory.name}
                priority
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-white border-b border-[#E9E1D5]">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-14">
            <nav aria-label="Breadcrumb" className="text-xs text-[#85817B] flex items-center gap-2">
              <Link to="/" className="hover:text-[#171717]">
                Home
              </Link>
              <span>/</span>
              <span className="text-[#171717]">
                {mode === 'search' ? 'Search' : 'All Collections'}
              </span>
            </nav>
            <div className="mt-3 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="font-editorial text-4xl sm:text-5xl text-[#171717]">
                  {mode === 'search' && urlQuery
                    ? `Results for "${urlQuery}"`
                    : urlOffers
                      ? 'Limited-Time Archive Offers'
                      : 'All Collections'}
                </h1>
                <p className="mt-2 text-sm text-[#85817B] max-w-xl">
                  Thoughtfully selected pieces across fashion, jewellery, beauty, home décor, audio, and leather carry.
                </p>
              </div>
              {mode === 'search' && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    const nextQ = String(fd.get('q') || '').trim();
                    if (nextQ) {
                      addSearchHistory(nextQ);
                      setSearchParams({ q: nextQ });
                    }
                  }}
                  className="flex gap-2 w-full md:w-96"
                >
                  <input
                    name="q"
                    defaultValue={urlQuery}
                    placeholder="Refine search..."
                    aria-label="Search query"
                    className="flex-1 bg-[#F7F4EE] border border-[#D9D0C2] px-4 py-2.5 text-sm text-[#171717] focus:border-[#171717] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#171717] text-white text-xs tracking-[0.14em] uppercase"
                  >
                    Search
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Subcategory Strip for Category Pages */}
      {currentCategory && (
        <div className="bg-white border-b border-[#E9E1D5]">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-10 py-3.5 flex items-center gap-2 overflow-x-auto">
            {currentCategory.subcategories.map((sub) => {
              const active = (filters.subcategory ?? 'All') === sub;
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setFilters((p) => ({ ...p, subcategory: sub }))}
                  className={`px-4 py-1.5 text-xs tracking-[0.1em] uppercase transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#171717] text-[#F7F4EE] font-medium'
                      : 'text-[#55524E] hover:text-[#171717]'
                  }`}
                >
                  {sub}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Discovery Body */}
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-14">
        {/* Toolbar: Count, Mobile Filters Trigger, Sorting */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E9E1D5]">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#D9D0C2] text-xs tracking-[0.12em] uppercase text-[#171717]"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={1.5} />
              Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
            </button>
            <p className="text-sm text-[#85817B] tabular-nums">
              Showing <span className="font-medium text-[#171717]">{filteredProducts.length}</span>{' '}
              {filteredProducts.length === 1 ? 'piece' : 'pieces'}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <label htmlFor="catalog-sort" className="text-xs uppercase tracking-[0.12em] text-[#85817B]">
              Sort
            </label>
            <select
              id="catalog-sort"
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((p) => ({
                  ...p,
                  sortBy: e.target.value as FilterState['sortBy'],
                }))
              }
              className="bg-white border border-[#D9D0C2] px-3.5 py-2 text-xs sm:text-sm text-[#171717] focus:border-[#171717] focus:outline-none"
            >
              <option value="recommended">Recommended</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="bestselling">Best Selling</option>
              <option value="top-rated">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Grid + Desktop Filter Sidebar */}
        <div className="mt-8 grid lg:grid-cols-12 gap-10">
          <aside className="hidden lg:block lg:col-span-3 pr-2" aria-label="Product filters">
            {filterPanelContent}
          </aside>

          <div className="lg:col-span-9">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-10">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-[#E9E1D5] p-10 text-center space-y-4">
                <h2 className="font-editorial text-3xl text-[#171717]">
                  No pieces match your current selection
                </h2>
                <p className="text-sm text-[#85817B] max-w-md mx-auto">
                  Adjust or clear one of your filters to view our full curated assortment.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-6 py-3 bg-[#171717] text-white text-xs tracking-[0.14em] uppercase"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Related Collections Strip */}
        <section className="mt-20 pt-14 border-t border-[#E9E1D5]">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#85817B]">
                Continue Exploring
              </p>
              <h2 className="mt-1 font-editorial text-3xl text-[#171717]">
                Related Collections
              </h2>
            </div>
            <Link
              to="/shop"
              className="text-xs tracking-[0.14em] uppercase text-[#171717] hover:text-[#9A7A45] inline-flex items-center gap-1"
            >
              All Departments
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {relatedCategories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="group flex items-center gap-4 bg-white border border-[#E9E1D5] p-4 hover:border-[#171717] transition-colors"
              >
                <SafeImage
                  src={cat.heroImage}
                  alt={cat.name}
                  className="w-20 h-24 object-cover bg-[#E9E1D5] shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="font-editorial text-xl text-[#171717] group-hover:text-[#9A7A45] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="mt-1 text-xs text-[#85817B] line-clamp-2">{cat.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFiltersOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Filter products"
        >
          <div
            className="fixed inset-0 bg-[#0B0B0B]/50"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="relative z-10 w-[86vw] max-w-sm bg-[#F7F4EE] h-full flex flex-col">
            <div className="px-5 py-4 bg-white border-b border-[#E9E1D5] flex items-center justify-between">
              <span className="font-editorial text-2xl text-[#171717]">Filters</span>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
                className="p-1.5 text-[#171717]"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="p-5 flex-1 overflow-y-auto">{filterPanelContent}</div>
            <div className="p-4 bg-white border-t border-[#E9E1D5]">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-3 bg-[#171717] text-white text-xs tracking-[0.14em] uppercase"
              >
                Show {filteredProducts.length} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
