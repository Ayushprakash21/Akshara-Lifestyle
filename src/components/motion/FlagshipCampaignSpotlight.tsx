import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Check, Sparkles, ArrowRight, ShieldCheck, RefreshCw, Truck } from 'lucide-react';
import { useCommerce } from '../../store/CommerceContext';
import { formatINR } from '../../utils/commerceLogic';
import { ASSETS } from '../../services/seedData';
import { SafeImage } from '../SafeImage';

export function FlagshipCampaignSpotlight() {
  const { products, addToCart } = useCommerce();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<'XS' | 'S' | 'M' | 'L'>('S');
  const [added, setAdded] = useState(false);

  const product =
    products.find((p) => p.slug === 'rainbow-elegance-handloom-organza-silk-ensemble') ||
    products[0];

  const galleryImages = [
    { src: ASSETS.rainbowPage1, label: 'Full Look · Rainbow Elegance' },
    { src: ASSETS.rainbowPage4, label: 'The Finishing Touch · Gossamer Dupatta' },
    { src: ASSETS.rainbowPage2, label: 'A Spectrum of Color · Fluid Layers' },
    { src: ASSETS.rainbowPage5, label: 'Poised Grace · Atelier Jaipur' },
  ];

  const handleAddToCart = () => {
    if (!product) return;
    const variant = product.variants.find((v) => v.size === selectedSize) || product.variants[0];
    addToCart(product.id, variant?.id, 1, true);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  return (
    <section className="bg-[#F7F4EE] text-[#171717] py-20 lg:py-28 border-t border-[#E8E1D5]">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 border-b border-[#E0D7C9] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C6A15B]/15 border border-[#C6A15B]/30 rounded-full mb-3">
              <Sparkles className="w-3 h-3 text-[#C6A15B]" />
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#8C6D2D] font-semibold">
                AUTUMN / WINTER 2026 CAMPAIGN EDIT
              </span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-5xl text-[#171717] tracking-[-0.01em]">
              Rainbow Elegance Haute Couture
            </h2>
          </div>
          <Link
            to="/category/fashion-clothing"
            className="text-xs font-mono tracking-[0.16em] uppercase text-[#171717] hover:text-[#C6A15B] inline-flex items-center gap-1.5 transition-colors self-start sm:self-auto font-semibold"
          >
            <span>Explore All Fashion</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Two-Column Interactive Campaign Showcase */}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left: Interactive Multi-View Gallery (7 Columns) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[3/4] max-h-[640px] w-full overflow-hidden rounded-sm bg-[#EDE8E0] border border-[#DDD5C7] shadow-lg">
              <SafeImage
                src={galleryImages[activeImageIndex].src}
                alt={galleryImages[activeImageIndex].label}
                priority
                className="w-full h-full object-cover object-top transition-opacity duration-300"
              />
              <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-[#171717]/80 backdrop-blur-sm rounded-sm text-white text-[11px] font-mono tracking-wider">
                {galleryImages[activeImageIndex].label}
              </div>
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-3">
              {galleryImages.map((img, idx) => (
                <button
                  key={img.label}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative aspect-[3/4] overflow-hidden rounded-sm border transition-all cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-[#C6A15B] ring-2 ring-[#C6A15B]/30'
                      : 'border-[#DDD5C7] opacity-70 hover:opacity-100'
                  }`}
                >
                  <SafeImage
                    src={img.src}
                    alt={img.label}
                    className="w-full h-full object-cover object-top"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Narrative, Real Specifications & Add to Cart (5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#8C6D2D] font-semibold">
                AKSHARA ATELIER · FESTIVE EDITION
              </p>
              <h1 className="mt-1 font-editorial text-2xl sm:text-4xl text-[#171717] leading-tight">
                {product.name}
              </h1>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="font-editorial text-2xl sm:text-3xl font-semibold text-[#171717]">
                  {formatINR(product.price)}
                </span>
                <span className="text-sm line-through text-[#8C8375]">
                  {formatINR(product.originalPrice)}
                </span>
                <span className="px-2 py-0.5 bg-[#C6A15B]/20 text-[#8C6D2D] text-[10px] font-mono font-semibold uppercase tracking-wider rounded-sm">
                  16% PRIVILEGE
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#57524B] leading-relaxed">
              {product.description}
            </p>

            {/* Size Selector */}
            <div className="space-y-2 pt-2 border-t border-[#E0D7C9]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[#171717] font-semibold">
                  SELECT SIZE
                </span>
                <span className="text-[11px] font-mono text-[#8C6D2D]">In Stock · Dispatch in 24h</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {(['XS', 'S', 'M', 'L'] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`py-2.5 text-xs font-mono uppercase rounded-sm border transition-all cursor-pointer ${
                      selectedSize === sz
                        ? 'bg-[#171717] text-white border-[#171717] font-bold shadow-sm'
                        : 'bg-white hover:bg-[#F2ECE3] text-[#171717] border-[#D4CBBF]'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full py-4 bg-[#171717] hover:bg-[#000] text-white text-xs font-mono uppercase tracking-[0.2em] font-semibold transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4 text-[#C6A15B]" />
                    <span>ADDED TO SHOPPING BAG</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-[#C6A15B]" />
                    <span>ACQUIRE ENSEMBLE — {formatINR(product.price)}</span>
                  </>
                )}
              </button>

              <Link
                to={`/product/${product.slug}`}
                className="w-full py-3 bg-white hover:bg-[#F0EBE3] text-[#171717] text-xs font-mono uppercase tracking-[0.16em] font-medium transition-colors border border-[#D4CBBF] flex items-center justify-center gap-1.5"
              >
                <span>View Complete Product Details & Sizing Guide</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#8C6D2D]" />
              </Link>
            </div>

            {/* Product Specifications List */}
            <div className="pt-4 border-t border-[#E0D7C9] space-y-2.5">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8C6D2D] font-semibold">
                PRODUCT SPECIFICATIONS
              </p>
              <div className="grid grid-cols-1 gap-2 text-xs">
                {product.specifications.map((spec) => (
                  <div key={spec.label} className="flex justify-between py-1 border-b border-[#EBE4D8]">
                    <span className="text-[#8C8375] font-mono">{spec.label}</span>
                    <span className="font-medium text-[#171717] text-right">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reassurance Guarantees */}
            <div className="pt-4 border-t border-[#E0D7C9] grid grid-cols-3 gap-3 text-center text-xs font-mono text-[#57524B]">
              <div className="p-2.5 bg-white rounded-sm border border-[#E0D7C9]">
                <Truck className="w-4 h-4 mx-auto text-[#C6A15B] mb-1" />
                <p className="text-[10px] font-semibold text-[#171717]">All-Inclusive</p>
                <p className="text-[9px] text-[#8C8375]">Delivery Included</p>
              </div>
              <div className="p-2.5 bg-white rounded-sm border border-[#E0D7C9]">
                <RefreshCw className="w-4 h-4 mx-auto text-[#C6A15B] mb-1" />
                <p className="text-[10px] font-semibold text-[#171717]">14-Day Return</p>
                <p className="text-[9px] text-[#8C8375]">Effortless Pickup</p>
              </div>
              <div className="p-2.5 bg-white rounded-sm border border-[#E0D7C9]">
                <ShieldCheck className="w-4 h-4 mx-auto text-[#C6A15B] mb-1" />
                <p className="text-[10px] font-semibold text-[#171717]">Authentic</p>
                <p className="text-[9px] text-[#8C8375]">Jaipur Atelier</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
