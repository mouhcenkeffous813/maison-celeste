import React, { useState } from 'react';
import { Menu, Search, Phone, ShoppingBag, ShieldCheck, Sparkles, Settings, Lock, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { NavigationDrawer } from './NavigationDrawer';

export const Navbar: React.FC = () => {
  const {
    config,
    currentView,
    setCurrentView,
    products,
    isAdminLoggedIn,
    demoLoginAdmin,
    cartTotalCount,
    setIsCartOpen,
    isDarkMode,
    toggleDarkMode,
  } = useStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      // Find matching product
      const match = products.find(p =>
        p.title.toLowerCase().includes(searchVal.toLowerCase()) ||
        p.category.toLowerCase().includes(searchVal.toLowerCase())
      );
      if (match) {
        setIsSearchOpen(false);
        // Navigate
      }
    }
  };

  return (
    <>
      {/* Top Luxury Announcement Bar */}
      {config.announcementText && (
        <div className="bg-stone-900 text-stone-200 text-[10px] sm:text-xs font-medium py-1.5 px-3 tracking-widest uppercase text-center overflow-hidden border-b border-stone-800">
          <div className="flex items-center justify-center gap-2 truncate">
            <Sparkles className="w-3 h-3 text-store-accent animate-pulse flex-shrink-0" />
            <span className="truncate">{config.announcementText}</span>
            <Sparkles className="w-3 h-3 text-store-accent animate-pulse flex-shrink-0" />
          </div>
        </div>
      )}

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-store-border transition-all duration-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-2.5 sm:px-4 h-14 sm:h-20 flex items-center justify-between gap-1.5 sm:gap-2">
          
          {/* Left: Burger Menu & Brand */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1 sm:flex-initial">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-1.5 sm:p-2.5 rounded-xl hover:bg-stone-100 text-stone-800 transition-colors focus:outline-none shrink-0"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
            </button>

            {/* Brand Logo & Name */}
            <button
              onClick={() => setCurrentView('home')}
              className="flex items-center gap-1.5 sm:gap-2.5 text-left group cursor-pointer focus:outline-none select-none min-w-0"
            >
              <img
                src={config.logoUrl || '/orlea-logo.svg'}
                alt={config.storeName}
                className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl object-cover border border-stone-200/80 shadow-xs shrink-0"
              />
              <div className="min-w-0">
                <h1 className="font-sans font-bold text-xs sm:text-xl tracking-tight text-stone-900 group-hover:text-store-primary transition-colors truncate">
                  {config.storeName}
                </h1>
                <p className="text-[9px] text-stone-400 font-sans hidden md:block -mt-0.5 truncate max-w-[200px]">
                  {config.storeTagline}
                </p>
              </div>
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 transition-all active:scale-90 border border-stone-200 flex items-center justify-center shrink-0"
              title={isDarkMode ? 'Passer au mode clair' : 'Passer au mode sombre'}
              aria-label="Basculer le mode sombre"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-600" />}
            </button>

            {/* Quick WhatsApp / Call */}
            <a
              href={`https://wa.me/${config.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent('Bonjour, j\'ai une question sur vos produits.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 sm:w-auto sm:px-3 sm:py-2 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0"
              title="Discuter sur WhatsApp"
              aria-label="Contacter sur WhatsApp"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">WhatsApp</span>
            </a>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative w-8 h-8 sm:w-auto sm:px-3.5 sm:py-2 rounded-full bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 shrink-0"
              title="Voir mon panier"
              aria-label="Voir mon panier"
            >
              <ShoppingBag className="w-4 h-4 text-store-primary" />
              <span className="hidden sm:inline">Panier</span>
              {cartTotalCount > 0 && (
                <span className="absolute -top-1 -right-1 sm:relative sm:top-auto sm:right-auto w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-store-primary text-white text-[9px] sm:text-[11px] font-black font-mono flex items-center justify-center shadow-xs">
                  {cartTotalCount}
                </span>
              )}
            </button>

            {/* Bouton Accès Dashboard Gérant (Toujours visible, adaptatif mobile) */}
            <button
              onClick={demoLoginAdmin}
              className="h-8 px-2.5 sm:h-10 sm:px-3.5 rounded-full bg-stone-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm hover:bg-stone-800 active:scale-95 transition-all border border-stone-800 shrink-0"
              title="Accéder au Tableau de Bord Gérant"
              aria-label="Accéder au Dashboard Administrateur"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-store-primary shrink-0" />
              <span className="hidden md:inline">Dashboard</span>
            </button>
          </div>
        </div>

        {/* Search Bar Drawer / Dropdown */}
        {isSearchOpen && (
          <div className="border-t border-store-border bg-white px-4 py-3 animate-fadeIn">
            <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher une robe, sac, bijou, parfum..."
                  value={searchVal}
                  onChange={e => setSearchVal(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-store-secondary/50 rounded-full border border-store-border focus:outline-none focus:border-store-primary"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-store-primary text-white text-xs font-semibold rounded-full hover:bg-store-primary-hover transition-colors"
              >
                Trouver
              </button>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="text-xs text-stone-500 hover:text-stone-800 px-2"
              >
                Fermer
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Navigation Drawer Component */}
      <NavigationDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
};

