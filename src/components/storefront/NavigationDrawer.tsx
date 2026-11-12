import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Home,
  Layers,
  Truck,
  PhoneCall,
  SearchCheck,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Lock,
  LayoutDashboard
} from 'lucide-react';
import { useStore, CurrentView } from '../../context/StoreContext';
import { searchMatches } from '../../utils/formatters';
import { trackingManager } from '../../services/trackingManager';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({ isOpen, onClose }) => {
  const { config, products, setCurrentView, setSelectedCategory, openProductPage, isAdminLoggedIn, demoLoginAdmin, categories } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const allCategories = ['Tout', ...categories];

  // Filter products by instant search (accent-insensitive)
  const filteredProducts = searchQuery.trim()
    ? products.filter(
        p =>
          searchMatches(p.title, searchQuery) ||
          searchMatches(p.category, searchQuery) ||
          searchMatches(p.shortDescription, searchQuery)
      )
    : [];

  const handleNav = (view: CurrentView, category?: string) => {
    if (category) {
      setSelectedCategory(category);
    }
    setCurrentView(view);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div className="absolute inset-y-0 left-0 max-w-xs w-full bg-store-base shadow-2xl flex flex-col z-10 animate-slideRight">
        {/* Header */}
        <div className="p-4 border-b border-store-border flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <img
              src={config.logoUrl || '/orlea-logo.svg'}
              alt={config.storeName}
              className="w-9 h-9 rounded-2xl object-cover border border-stone-200 shadow-xs flex-shrink-0"
            />
            <div>
              <h2 className="font-serif font-bold text-stone-900 text-sm tracking-wide">
                {config.storeName}
              </h2>
              <p className="text-[10px] text-stone-500 uppercase tracking-widest">
                Menu de Navigation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 transition-colors"
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-store-border bg-store-secondary/30">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  trackingManager.trackEvent({
                    eventName: 'Search',
                    searchQuery: searchQuery.trim(),
                  });
                }
              }}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-lg border border-store-border focus:outline-none focus:border-store-primary shadow-xs"
            />
          </div>

          {/* Instant Search Results */}
          {searchQuery.trim() && (
            <div className="mt-2 max-h-48 overflow-y-auto bg-white rounded-lg border border-store-border shadow-md divide-y divide-stone-100">
              {filteredProducts.length === 0 ? (
                <div className="p-3 text-center text-xs text-stone-400">
                  Aucun produit trouvé pour "{searchQuery}"
                </div>
              ) : (
                filteredProducts.map(prod => (
                  <button
                    key={prod.id}
                    onClick={() => {
                      openProductPage(prod.id);
                      onClose();
                    }}
                    className="w-full p-2 flex items-center gap-2.5 text-left hover:bg-store-secondary transition-colors"
                  >
                    <img
                      src={prod.images[0]}
                      alt={prod.title}
                      className="w-9 h-9 object-cover rounded-md border border-stone-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-stone-900 truncate">{prod.title}</p>
                      <p className="text-[11px] font-bold text-store-primary">
                        {prod.price.toLocaleString()} {config.currency}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Links List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Main Navigation */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">
              Navigation
            </p>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => handleNav('home', 'Tout')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white text-store-primary text-xs font-bold transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Home className="w-4 h-4 text-store-primary" />
                    <span>Accueil</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-300" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('home')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white text-stone-800 text-xs font-semibold transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Layers className="w-4 h-4 text-stone-500" />
                    <span>Catégories</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-300" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('tracking')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white text-stone-800 text-xs font-semibold transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <SearchCheck className="w-4 h-4 text-stone-500" />
                    <span>État de commande</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-stone-100 text-stone-600 font-bold">
                    Suivi
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('shipping')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white text-stone-800 text-xs font-semibold transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Truck className="w-4 h-4 text-stone-500" />
                    <span>Tarifs de livraison</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-300" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('contact')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white text-stone-800 text-xs font-semibold transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <PhoneCall className="w-4 h-4 text-stone-500" />
                    <span>Contactez-nous</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-300" />
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">
              Collections
            </p>
            <div className="grid grid-cols-1 gap-1">
              {allCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleNav('home', cat)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg hover:bg-white text-stone-700 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-store-primary/60" />
                    {cat}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    {cat === 'Tout'
                      ? products.length
                      : products.filter(p => p.category === cat).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Admin Dashboard Access */}
          <div className="pt-2 border-t border-store-border">
            <button
              onClick={() => {
                demoLoginAdmin();
                onClose();
              }}
              className="w-full p-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold flex items-center justify-between hover:bg-stone-800 transition-colors shadow-sm"
            >
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4 text-store-primary" />
                <span>Dashboard Gérant</span>
              </div>
              <span className="text-[10px] bg-stone-800 px-2 py-0.5 rounded text-stone-300 font-mono">
                {isAdminLoggedIn ? 'Connecté' : 'Accès PIN'}
              </span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-store-border bg-store-secondary/40 text-[11px] text-stone-500 space-y-1">
          <div className="flex items-center gap-1.5 font-medium text-stone-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Paiement à la livraison garanti</span>
          </div>
          <p className="text-[10px] text-stone-400">
            Vérifiez votre colis avant de régler le livreur.
          </p>
        </div>
      </div>
    </div>
  );
};

