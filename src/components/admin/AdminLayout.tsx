import React, { useState } from 'react';
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
  X
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { AdminLogin } from './AdminLogin';
import { AdminOverview } from './AdminOverview';
import { AdminOrders } from './AdminOrders';
import { AdminProducts } from './AdminProducts';
import { AdminShipping } from './AdminShipping';
import { AdminSettings } from './AdminSettings';

type AdminTab = 'overview' | 'orders' | 'products' | 'shipping' | 'settings';

export const AdminLayout: React.FC = () => {
  const { isAdminLoggedIn, logoutAdmin, setCurrentView, config, orders, simulateDemoOrder } = useStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-700"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div>
            <h2 className="font-serif font-bold text-xs text-stone-900">{config.storeName}</h2>
            <span className="text-[9px] text-store-primary font-bold uppercase">Administration</span>
          </div>
        </div>

        <button
          onClick={() => setCurrentView('home')}
          className="px-3 py-1.5 rounded-xl bg-stone-900 text-white text-xs font-medium flex items-center gap-1.5"
        >
          <Store className="w-3.5 h-3.5" />
          <span>Boutique</span>
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 p-3 space-y-1 animate-fadeIn">
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
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                  isActive ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
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
        </div>
      )}

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
        {activeTab === 'settings' && <AdminSettings />}
      </main>
    </div>
  );
};

