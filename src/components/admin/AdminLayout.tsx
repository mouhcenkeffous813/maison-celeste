import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  Truck,
  Settings,
  Store,
  LogOut,
  Sparkles,
  Menu,
  X,
  Target,
  Sun,
  Moon
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { AdminLogin } from './AdminLogin';
import { AdminOverview } from './AdminOverview';
import { AdminOrders } from './AdminOrders';
import { AdminProducts } from './AdminProducts';
import { AdminShipping } from './AdminShipping';
import { AdminSettings } from './AdminSettings';
import { AdminMarketing } from './AdminMarketing';

type AdminTab = 'overview' | 'orders' | 'products' | 'shipping' | 'marketing' | 'settings';

export const AdminLayout: React.FC = () => {
  const { isAdminLoggedIn, logoutAdmin, setCurrentView, config, orders, simulateDemoOrder, isDarkMode, toggleDarkMode } = useStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Empêcher le scroll d'arrière-plan quand la sidebar mobile est ouverte
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Fermeture au clavier avec la touche Échap (Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  // If not logged in, display the login gate
  if (!isAdminLoggedIn) {
    return <AdminLogin />;
  }

  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

  const navItems = [
    {
      id: 'overview',
      label: "Vue d'ensemble",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'orders',
      label: 'Commandes (CRM COD)',
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : null,
    },
    {
      id: 'products',
      label: 'Produits & Variantes',
      icon: Layers,
      badge: null,
    },
    {
      id: 'shipping',
      label: 'Tarifs Livraison (58 Wilayas)',
      icon: Truck,
      badge: null,
    },
    {
      id: 'marketing',
      label: 'Marketing & Tracking',
      icon: Target,
      badge: null,
    },
    {
      id: 'settings',
      label: 'Paramètres White-Label',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col md:flex-row">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-stone-200/80 min-h-screen p-4 justify-between sticky top-0 h-screen">
        <div className="space-y-6">
          {/* Logo & Store Info */}
          <div className="px-2 pt-2 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-900 text-white flex items-center justify-center font-serif text-lg font-bold shadow-sm">
              É
            </div>
            <div className="min-w-0">
              <h2 className="font-serif font-bold text-sm text-stone-900 truncate">
                {config.storeName}
              </h2>
              <span className="text-[10px] text-store-primary font-bold tracking-wider uppercase">
                Admin Dashboard
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as AdminTab)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-store-primary' : 'text-stone-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions: View Storefront & Logout */}
        <div className="space-y-2 pt-4 border-t border-stone-100">
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-stone-500" />}
              <span>{isDarkMode ? 'Mode Clair' : 'Mode Sombre'}</span>
            </div>
            <span className="text-[10px] text-stone-400 font-bold">{isDarkMode ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setCurrentView('home')}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <Store className="w-4 h-4 text-stone-500" />
            <span>Voir la Boutique</span>
          </button>

          <button
            onClick={logoutAdmin}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-stone-200 p-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-700 transition-colors"
            aria-label="Ouvrir la navigation latérale"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <img
              src={config.logoUrl || '/orlea-logo.svg'}
              alt={config.storeName}
              className="w-7 h-7 rounded-lg object-cover border border-stone-200"
            />
            <div>
              <h2 className="font-serif font-bold text-xs text-stone-900 leading-tight">{config.storeName}</h2>
              <span className="text-[9px] text-store-primary font-bold uppercase tracking-wider">ADMINISTRATION</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setCurrentView('home')}
          className="px-3 py-1.5 rounded-xl bg-stone-900 text-white text-xs font-medium flex items-center gap-1.5 shadow-xs"
        >
          <Store className="w-3.5 h-3.5" />
          <span>Boutique</span>
        </button>
      </div>

      {/* Mobile Lateral Navigation Drawer (Sidebar latérale superposée avec fond sombre) */}
      <div
        className={`md:hidden fixed inset-0 z-50 transition-all duration-300 ${
          isMobileMenuOpen ? 'pointer-events-auto visible' : 'pointer-events-none invisible'
        }`}
        aria-hidden={!isMobileMenuOpen}
      >
        {/* Fond sombre semi-transparent (Backdrop avec flou) */}
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className={`absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Panneau latéral coulissant (Sidebar ~280px) */}
        <div
          className={`absolute inset-y-0 left-0 w-[280px] max-w-[85vw] bg-white text-stone-900 shadow-2xl flex flex-col justify-between z-10 transition-transform duration-300 ease-out border-r border-stone-200 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Header de la Sidebar */}
          <div>
            <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={config.logoUrl || '/orlea-logo.svg'}
                  alt={config.storeName}
                  className="w-9 h-9 rounded-2xl object-cover border border-stone-200 shadow-xs shrink-0"
                />
                <div className="min-w-0">
                  <h2 className="font-serif font-bold text-sm text-stone-900 truncate">
                    {config.storeName}
                  </h2>
                  <span className="text-[10px] text-store-primary font-bold uppercase tracking-wider block">
                    ADMINISTRATION
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-200/70 text-stone-500 transition-colors shrink-0"
                aria-label="Fermer le menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Rubriques de navigation verticales */}
            <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-230px)]">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as AdminTab);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-stone-900 text-white shadow-sm'
                        : 'text-stone-700 hover:bg-stone-100 active:scale-[0.98]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-store-primary' : 'text-stone-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-bold font-mono">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Footer de la Sidebar Mobile : Mode Sombre, Voir Boutique, Déconnexion */}
          <div className="p-3 border-t border-stone-100 bg-stone-50/70 space-y-1.5">
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-stone-500" />}
                <span>{isDarkMode ? 'Mode Clair' : 'Mode Sombre'}</span>
              </div>
              <span className="text-[10px] text-stone-400 font-bold">{isDarkMode ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setCurrentView('home');
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <Store className="w-4 h-4 text-stone-500" />
              <span>Voir la Boutique</span>
            </button>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                logoutAdmin();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-5">
        
        {/* Dashboard Actions Banner with Simuler 1 Commande */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white rounded-3xl p-4 sm:p-5 shadow-luxury border border-stone-700/60 flex flex-col md:flex-row md:items-center justify-between gap-3.5 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-store-primary/20 text-rose-300 flex items-center justify-center shrink-0 border border-store-primary/40">
              <Sparkles className="w-5 h-5 text-store-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-sm sm:text-base text-white">
                  Tableau de Bord & Gestion des Commandes
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-emerald-500/30">
                  En direct
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                Boutique : <strong className="text-white">{config.storeName}</strong> • Cliquez sur « + Simuler 1 Commande » pour tester le flux de commandes en direct.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* 1-Click Simulated Order */}
            <button
              onClick={simulateDemoOrder}
              className="px-4 py-2.5 rounded-2xl bg-store-primary hover:bg-store-primary-hover text-white text-xs font-bold flex items-center gap-2 shadow-soft active:scale-95 transition-all"
              title="Générer une commande test en direct"
            >
              <Sparkles className="w-4 h-4" />
              <span>+ Simuler 1 Commande</span>
            </button>

            {/* Back to Storefront */}
            <button
              onClick={() => {
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-stone-200 text-xs font-bold flex items-center gap-1.5 transition-all"
              title="Retourner voir la boutique côté client"
            >
              <Store className="w-3.5 h-3.5 text-rose-300" />
              <span>Voir Boutique</span>
            </button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <AdminOverview onNavigateToOrders={() => setActiveTab('orders')} />
        )}
        {activeTab === 'orders' && <AdminOrders />}
        {activeTab === 'products' && <AdminProducts />}
        {activeTab === 'shipping' && <AdminShipping />}
        {activeTab === 'marketing' && <AdminMarketing />}
        {activeTab === 'settings' && <AdminSettings />}
      </main>
    </div>
  );
};

