import React, { useMemo } from 'react';
import { Sparkles, Shield, Truck, RotateCcw, MessageCircle, Star, ArrowRight, ShoppingBag } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { calculateDiscountPercentage, formatPrice } from '../../utils/formatters';

export const HomePage: React.FC = () => {
  const {
    products,
    config,
    selectedCategory,
    setSelectedCategory,
    openProductPage,
    categories,
    addToCart,
    setIsCartOpen,
  } = useStore();

  const allCategories = ['Tout', ...categories];

  // Filter products by category and active status
  const visibleProducts = products.filter(p => {
    if (!p.isActive) return false;
    if (selectedCategory === 'Tout') return true;
    return p.category === selectedCategory;
  });

  return (
    <div className="pb-16">
      {/* Hero Banner with Rose & Classy vibe */}
      <section className="relative overflow-hidden bg-gradient-to-b from-store-secondary/80 via-white to-store-base border-b border-store-border">
        {/* Subtle decorative elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-store-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-store-accent/10 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-14 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-store-border shadow-xs text-xs font-semibold text-store-primary mb-4 animate-bounce-short">
            <Sparkles className="w-3.5 h-3.5 text-store-accent" />
            <span>NOUVELLE COLLECTION 2026 • COD ALGÉRIE</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-extrabold text-stone-900 tracking-tight leading-tight max-w-3xl mx-auto">
            L'Élégance Absolue & Le Raffinement Féminin
          </h1>

          <p className="mt-3 sm:mt-4 text-xs sm:text-base text-stone-600 max-w-xl mx-auto font-light leading-relaxed">
            Découvrez nos pièces signatures pensées pour la femme moderne algérienne.
            Livraison rapide à domicile ou en point relais dans <strong className="text-stone-900 font-semibold">les 58 Wilayas</strong> avec paiement à réception.
          </p>

          {/* Trust Guarantees Bar */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-3xl mx-auto">
            <div className="bg-white/90 backdrop-blur-xs p-3 rounded-2xl border border-store-border/80 shadow-xs flex items-center gap-2.5 text-left">
              <div className="w-8 h-8 rounded-full bg-store-secondary flex items-center justify-center text-store-primary flex-shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-stone-900 leading-tight">58 Wilayas</p>
                <p className="text-[10px] text-stone-500">Livraison express</p>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-xs p-3 rounded-2xl border border-store-border/80 shadow-xs flex items-center gap-2.5 text-left">
              <div className="w-8 h-8 rounded-full bg-store-secondary flex items-center justify-center text-store-primary flex-shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-stone-900 leading-tight">Paiement Cash</p>
                <p className="text-[10px] text-stone-500">À la réception</p>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-xs p-3 rounded-2xl border border-store-border/80 shadow-xs flex items-center gap-2.5 text-left">
              <div className="w-8 h-8 rounded-full bg-store-secondary flex items-center justify-center text-store-primary flex-shrink-0">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-stone-900 leading-tight">Échange Facile</p>
                <p className="text-[10px] text-stone-500">Sous 48h garanti</p>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-xs p-3 rounded-2xl border border-store-border/80 shadow-xs flex items-center gap-2.5 text-left">
              <div className="w-8 h-8 rounded-full bg-store-secondary flex items-center justify-center text-store-primary flex-shrink-0">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-stone-900 leading-tight">Assistance 7j/7</p>
                <p className="text-[10px] text-stone-500">Direct WhatsApp</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills Filter */}
      <section className="sticky top-16 sm:top-20 z-30 bg-store-base/95 backdrop-blur-md border-b border-store-border py-3 shadow-xs">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1">
            {allCategories.map(cat => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-stone-900 text-white shadow-md transform scale-[1.02]'
                      : 'bg-white text-stone-700 border border-store-border hover:border-store-primary/50 hover:bg-store-secondary/50'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product Catalog Grid (2 columns on mobile, 4 on desktop) */}
      <section className="max-w-6xl mx-auto px-3 sm:px-4 mt-6 sm:mt-10">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 flex items-center gap-2">
              <span>{selectedCategory === 'Tout' ? 'Nos produits' : selectedCategory}</span>
              <span className="text-rose-500">❤️</span>
            </h2>
            <p className="text-xs text-stone-600 mt-0.5">
              Découvrez les meilleurs produits aux meilleurs prix 🔥
            </p>
          </div>
          <span className="text-[11px] font-medium text-store-primary bg-store-primary/10 px-2.5 py-1 rounded-full">
            Livraison 58 Wilayas
          </span>
        </div>

        {visibleProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-store-border p-8">
            <p className="text-stone-500 text-sm">Aucun produit dans cette catégorie pour le moment.</p>
            <button
              onClick={() => setSelectedCategory('Tout')}
              className="mt-3 px-4 py-2 bg-store-primary text-white text-xs font-semibold rounded-full hover:bg-store-primary-hover"
            >
              Voir tous les produits
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {visibleProducts.map(product => {
              const discount = calculateDiscountPercentage(product.price, product.compareAtPrice);
              return (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl border border-store-border overflow-hidden shadow-card hover:shadow-luxury transition-all duration-300 flex flex-col"
                >
                  {/* Image Container with Badges */}
                  <div
                    onClick={() => openProductPage(product.id)}
                    className="relative aspect-square overflow-hidden bg-stone-100 cursor-pointer"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      loading="lazy"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Discount Badge in Top Right */}
                    {discount > 0 && (
                      <div className="absolute top-2.5 right-2.5 bg-store-accent text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
                        -{discount}%
                      </div>
                    )}

                    {/* Quality or Special Badge in Top Left (e.g. Coup de cœur, Exclusivité) */}
                    {product.badge && !product.badge.includes('%') && (
                      <div className="absolute top-2.5 left-2.5 bg-stone-900/80 backdrop-blur-xs text-white text-[9px] sm:text-[10px] font-medium px-2 py-0.5 rounded-full">
                        {product.badge}
                      </div>
                    )}

                    {/* Out of stock overlay if all variants 0 */}
                    {product.totalStock <= 0 && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
                        <span className="bg-stone-900 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                          Rupture de Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Rating preview */}
                      <div className="flex items-center gap-1 text-[11px] text-amber-500 mb-1">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="font-semibold text-stone-700">{product.rating}</span>
                        <span className="text-stone-400 text-[10px]">({product.reviewCount})</span>
                      </div>

                      {/* Product Title */}
                      <h3
                        onClick={() => openProductPage(product.id)}
                        className="font-medium text-xs sm:text-sm text-stone-900 line-clamp-2 hover:text-store-primary transition-colors cursor-pointer leading-snug"
                        title={product.title}
                      >
                        {product.title}
                      </h3>

                      {/* Colors Swatches Preview */}
                      {product.colors && product.colors.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          {product.colors.slice(0, 4).map((c, i) => (
                            <span
                              key={i}
                              className="w-3 h-3 rounded-full border border-stone-300 shadow-xs inline-block"
                              style={{ backgroundColor: c.hex }}
                              title={c.name}
                            />
                          ))}
                          {product.colors.length > 4 && (
                            <span className="text-[9px] text-stone-400 font-medium">
                              +{product.colors.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Price and CTA Button */}
                    <div className="mt-3 pt-2.5 border-t border-stone-100">
                      <div className="flex items-baseline gap-1.5 mb-2.5">
                        <span className="font-bold text-sm sm:text-base text-stone-900">
                          {formatPrice(product.price, config.currency)}
                        </span>
                        {product.compareAtPrice > product.price && (
                          <span className="text-[11px] sm:text-xs text-stone-400 line-through">
                            {formatPrice(product.compareAtPrice, config.currency)}
                          </span>
                        )}
                      </div>

                      {/* CTA Buttons: Add to Cart + Commander */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            addToCart({
                              productId: product.id,
                              productTitle: product.title,
                              productImage: product.images[0],
                              selectedColor: product.colors?.[0]?.name || '',
                              selectedSize: product.sizes?.[0] || '',
                              quantity: 1,
                              unitPrice: product.price,
                              maxStock: product.totalStock || 50,
                            });
                            setIsCartOpen(true);
                          }}
                          className="p-2.5 rounded-xl border border-stone-200 hover:border-stone-400 hover:bg-stone-50 text-stone-700 transition-all flex items-center justify-center shrink-0"
                          title="Ajouter au panier"
                        >
                          <ShoppingBag className="w-4 h-4 text-store-primary" />
                        </button>

                        <button
                          onClick={() => openProductPage(product.id)}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-store-primary text-white text-xs sm:text-sm font-bold tracking-wide uppercase hover:bg-store-primary-hover active:scale-[0.98] transition-all shadow-soft flex items-center justify-center gap-1.5"
                        >
                          <span>COMMANDER</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

