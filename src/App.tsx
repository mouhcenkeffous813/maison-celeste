import React, { useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/storefront/Navbar';
import { HomePage } from './components/storefront/HomePage';
import { ProductPage } from './components/storefront/ProductPage';
import { OrderTracking } from './components/storefront/OrderTracking';
import { ShippingRates } from './components/storefront/ShippingRates';
import { ContactPage } from './components/storefront/ContactPage';
import { Footer } from './components/storefront/Footer';
import { AdminLayout } from './components/admin/AdminLayout';
import { CookieConsentBanner } from './components/storefront/CookieConsentBanner';
import { CartDrawer } from './components/storefront/CartDrawer';
import { trackingManager } from './services/trackingManager';

const AppContent: React.FC = () => {
  const { currentView, selectedProductId, isLoading } = useStore();
  const [maxLoadingReached, setMaxLoadingReached] = React.useState(false);

  // Safety watchdog: ensure loading spinner never blocks the user for more than 1.8s
  useEffect(() => {
    const timer = setTimeout(() => {
      setMaxLoadingReached(true);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  // Track PageView on SPA view changes (with deduplication)
  useEffect(() => {
    if (currentView !== 'admin') {
      const pageTitle =
        currentView === 'home'
          ? 'Accueil Boutique'
          : currentView === 'product'
          ? `Produit: ${selectedProductId || 'Détail'}`
          : currentView === 'tracking'
          ? 'Suivi de Commande'
          : currentView === 'shipping'
          ? 'Grille des Tarifs Livraison'
          : 'Page Contact';

      trackingManager.trackPageView(pageTitle);
    }
  }, [currentView, selectedProductId]);

  if (isLoading && !maxLoadingReached) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-store-base">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-store-primary border-t-transparent animate-spin" />
          <p className="font-serif text-stone-700 tracking-wider text-sm animate-pulse">
            Chargement de la boutique...
          </p>
        </div>
      </div>
    );
  }

  // Admin View
  if (currentView === 'admin') {
    return <AdminLayout />;
  }

  // Storefront Views
  return (
    <div className="min-h-screen flex flex-col bg-store-base text-store-text">
      <Navbar />

      <main className="flex-1">
        {currentView === 'home' && <HomePage />}
        {currentView === 'product' && (
          <ProductPage productId={selectedProductId || 'prod-001'} />
        )}
        {currentView === 'tracking' && <OrderTracking />}
        {currentView === 'shipping' && <ShippingRates />}
        {currentView === 'contact' && <ContactPage />}
      </main>

      <Footer />
      <CookieConsentBanner />
      <CartDrawer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
};

export default App;

