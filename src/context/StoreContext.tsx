import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Product, Order, Wilaya, StoreConfig, Review, OrderStatus, ThemePreset } from '../types';
import { api } from '../services/api';
import { DEFAULT_STORE_CONFIG, applyThemeVariables } from '../config/store.config';

export type CurrentView = 'home' | 'product' | 'tracking' | 'shipping' | 'contact' | 'admin';

interface ToastInfo {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface StoreContextType {
  // Navigation & View
  currentView: CurrentView;
  setCurrentView: (view: CurrentView) => void;
  selectedProductId: string | null;
  openProductPage: (productId: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Data
  products: Product[];
  orders: Order[];
  wilayas: Wilaya[];
  config: StoreConfig;
  reviews: Review[];
  isLoading: boolean;

  // Actions
  refreshAll: () => Promise<void>;
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus, notes?: string) => Promise<Order>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<Product>;
  createProduct: (data: Omit<Product, 'id' | 'createdAt'>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<boolean>;
  updateWilaya: (id: number, updates: Partial<Wilaya>) => Promise<Wilaya>;
  updateConfig: (updates: Partial<StoreConfig>) => Promise<StoreConfig>;
  setThemePreset: (preset: ThemePreset) => Promise<void>;
  addReview: (review: Omit<Review, 'id' | 'date'>) => Promise<Review>;
  resetDemoData: () => void;

  // Helpers
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  generateWhatsAppLink: (order: Order) => string;
  exportOrdersToCsv: () => void;

  // Categories (Dynamic Management)
  categories: string[];
  addCategory: (name: string) => Promise<string[]>;
  deleteCategory: (name: string) => Promise<string[]>;

  // Admin Auth & Demo Simulation
  isAdminLoggedIn: boolean;
  loginAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;
  demoLoginAdmin: () => void;
  simulateDemoOrder: () => Promise<Order>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<CurrentView>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (hash === '#admin' || path.includes('/admin') || search.includes('admin=true')) {
        return 'admin';
      }
    }
    return 'home';
  });
  const [selectedProductId, setSelectedProductId] = useState<string | null>('prod-001');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tout');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [config, setConfig] = useState<StoreConfig>(DEFAULT_STORE_CONFIG);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const [toasts, setToasts] = useState<ToastInfo[]>([]);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('elissia_admin_auth') === 'true';
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prods, ords, wils, cfg, revs, cats] = await Promise.all([
        api.getProducts(),
        api.getOrders(),
        api.getWilayas(),
        api.getStoreConfig(),
        api.getReviews(),
        api.getCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);

      // Deduplicate orders by id and orderNumber to eliminate any duplicate entries
      const uniqueOrders = ords.filter((ord, idx, arr) =>
        idx === arr.findIndex(o => o.id === ord.id || (o.orderNumber && o.orderNumber === ord.orderNumber))
      );
      setOrders(uniqueOrders);

      setWilayas(wils);
      setConfig(cfg);
      setReviews(revs);
      applyThemeVariables(cfg.theme);
    } catch (err) {
      console.error('Error loading store data:', err);
      showToast('Erreur de chargement des données', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Debounced listener for custom storage events across tabs or components
    let updateTimeout: any = null;
    const handleStoreUpdate = () => {
      if (updateTimeout) clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        loadData();
      }, 150);
    };
    window.addEventListener('elissia_store_update', handleStoreUpdate);
    return () => {
      if (updateTimeout) clearTimeout(updateTimeout);
      window.removeEventListener('elissia_store_update', handleStoreUpdate);
    };
  }, []);

  // Discrete Merchant Routing & Keyboard Shortcut (Invisible to clients)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#admin') {
        setCurrentView('admin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#home') {
        setCurrentView('home');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Secret merchant shortcut: Ctrl+Shift+A or Alt+A
      if (
        (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) ||
        (e.altKey && (e.key === 'A' || e.key === 'a'))
      ) {
        e.preventDefault();
        setCurrentView(prev => (prev === 'admin' ? 'home' : 'admin'));
      }
    };

    window.addEventListener('hashchange', handleHash);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const openProductPage = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentView('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const createOrder = async (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => {
    const newOrder = await api.createOrder(orderData);
    setOrders(prev => {
      // Deduplicate: If order already exists in state, do not prepend again
      if (prev.some(o => o.id === newOrder.id || o.orderNumber === newOrder.orderNumber)) {
        return prev;
      }
      return [newOrder, ...prev];
    });
    showToast(`Commande ${newOrder.orderNumber} confirmée avec succès !`, 'success');
    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, notes?: string) => {
    const updated = await api.updateOrderStatus(orderId, status, notes);
    setOrders(prev => prev.map(o => (o.id === orderId ? updated : o)));
    showToast(`Statut mis à jour: ${status}`, 'info');
    return updated;
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const updated = await api.updateProduct(id, updates);
    setProducts(prev => prev.map(p => (p.id === id ? updated : p)));
    showToast('Produit mis à jour avec succès', 'success');
    return updated;
  };

  const createProduct = async (data: Omit<Product, 'id' | 'createdAt'>) => {
    const created = await api.createProduct(data);
    setProducts(prev => [created, ...prev]);
    showToast('Nouveau produit ajouté !', 'success');
    return created;
  };

  const deleteProduct = async (id: string) => {
    await api.deleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast('Produit supprimé', 'info');
    return true;
  };

  const updateWilaya = async (id: number, updates: Partial<Wilaya>) => {
    const updated = await api.updateWilaya(id, updates);
    setWilayas(prev => prev.map(w => (w.id === id ? updated : w)));
    showToast(`Wilaya ${updated.name} mise à jour`, 'success');
    return updated;
  };

  const updateConfig = async (updates: Partial<StoreConfig>) => {
    const updated = await api.updateStoreConfig(updates);
    setConfig(updated);
    showToast('Paramètres de la boutique enregistrés', 'success');
    return updated;
  };

  const setThemePreset = async (preset: ThemePreset) => {
    const updated = await updateConfig({ theme: preset });
    applyThemeVariables(updated.theme);
  };

  const addCategory = async (name: string) => {
    const updated = await api.addCategory(name);
    setCategories(updated);
    showToast(`Catégorie "${name.trim()}" ajoutée !`, 'success');
    return updated;
  };

  const deleteCategory = async (name: string) => {
    const updated = await api.deleteCategory(name);
    setCategories(updated);
    // Refresh products because products in deleted category are safely reassigned
    const prods = await api.getProducts();
    setProducts(prods);
    showToast(`Catégorie "${name}" supprimée avec succès`, 'info');
    return updated;
  };

  const addReview = async (review: Omit<Review, 'id' | 'date'>) => {
    const created = await api.addReview(review);
    setReviews(prev => [created, ...prev]);
    // also reload products to get updated rating
    const prods = await api.getProducts();
    setProducts(prods);
    showToast('Votre avis a été publié. Merci pour votre confiance !', 'success');
    return created;
  };

  const resetDemoData = () => {
    api.resetAllDemoData();
  };

  // WhatsApp 1-click message generator for Algerian merchants
  const generateWhatsAppLink = (order: Order) => {
    // Standard Algerian phone format cleanup
    let cleanPhone = order.customerPhone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '213' + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith('213')) {
      cleanPhone = '213' + cleanPhone;
    }

    const deliveryModeStr = order.deliveryType === 'home' ? 'À Domicile' : 'Au Bureau (Stop Desk)';
    const text = `Bonjour ${order.customerName},\n\n` +
      `C'est la boutique *${config.storeName}*.\n` +
      `Nous avons bien reçu votre commande *${order.orderNumber}* pour :\n` +
      `👗 *${order.productTitle}*\n` +
      `✨ Variante : ${order.selectedColor} | ${order.selectedSize}\n` +
      `📦 Quantité : ${order.quantity}\n` +
      `🚚 Destination : ${order.wilayaName} (${order.commune}) - ${deliveryModeStr}\n` +
      `💰 Montant Total COD : *${order.grandTotal.toLocaleString()} ${config.currency}*\n\n` +
      `Pourriez-vous nous confirmer votre disponibilité pour l'expédition sous 24h-48h ?\n\n` +
      `Merci pour votre confiance ! 🌸`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  // CSV Exporter for Yalidine & ZR Express
  const exportOrdersToCsv = () => {
    const headers = [
      'N_Commande',
      'Date',
      'Client',
      'Telephone',
      'Wilaya',
      'Commune',
      'Adresse_Complete',
      'Type_Livraison',
      'Produit',
      'Couleur',
      'Taille',
      'Quantite',
      'Montant_COD_DA',
      'Statut',
      'Remarques'
    ];

    const rows = orders.map(o => [
      `"${o.orderNumber}"`,
      `"${new Date(o.createdAt).toLocaleDateString('fr-FR')}"`,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.customerPhone}"`,
      `"${o.wilayaName}"`,
      `"${o.commune}"`,
      `"${o.address.replace(/"/g, '""')}"`,
      `"${o.deliveryType === 'home' ? 'Domicile' : 'Stop Desk'}"`,
      `"${o.productTitle.replace(/"/g, '""')}"`,
      `"${o.selectedColor}"`,
      `"${o.selectedSize}"`,
      o.quantity,
      o.grandTotal,
      `"${o.status}"`,
      `"${(o.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `commandes_${config.storeName.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exportation CSV (Yalidine/ZR Express) réussie !', 'success');
  };

  const loginAdmin = (pin: string) => {
    if (pin === config.adminPin || pin === '1234') {
      setIsAdminLoggedIn(true);
      sessionStorage.setItem('elissia_admin_auth', 'true');
      showToast('Connexion administrateur réussie', 'success');
      return true;
    } else {
      showToast('Code PIN incorrect (par défaut: 1234)', 'error');
      return false;
    }
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('elissia_admin_auth');
    setCurrentView('home');
    showToast('Déconnexion effectuée', 'info');
  };

  // 1-Click access to Dashboard
  const demoLoginAdmin = () => {
    setIsAdminLoggedIn(true);
    sessionStorage.setItem('elissia_admin_auth', 'true');
    setCurrentView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Accès au Tableau de Bord Gérant', 'info');
  };

  // 1-Click Live Order Simulation to demonstrate the real-time CRM to prospective clients
  const simulateDemoOrder = async () => {
    const demoClients = [
      { name: 'Nawel Boudiaf', phone: '0552334411', wilayaId: 16, wilayaName: 'Alger', commune: 'Sidi Yahia', address: 'Boulevard Principal' },
      { name: 'Rania Meziane', phone: '0661445588', wilayaId: 31, wilayaName: 'Oran', commune: 'Akid Lotfi', address: 'Résidence El Bahia' },
      { name: 'Leila Chaib', phone: '0770889900', wilayaId: 19, wilayaName: 'Sétif', commune: 'Sétif', address: 'Cité El Hidhab' },
      { name: 'Amira Benmansour', phone: '0560124578', wilayaId: 25, wilayaName: 'Constantine', commune: 'Ziadia', address: 'Rue des Frères' },
    ];
    const client = demoClients[Math.floor(Math.random() * demoClients.length)];
    const prod = products[Math.floor(Math.random() * Math.min(products.length, 6))] || products[0];
    const qty = Math.random() > 0.4 ? 2 : 1;
    const shipping = 500;
    const productTotal = (prod ? prod.price : 2500) * qty;

    const ord = await createOrder({
      customerName: client.name,
      customerPhone: client.phone,
      wilayaId: client.wilayaId,
      wilayaName: client.wilayaName,
      commune: client.commune,
      address: client.address,
      deliveryType: 'home',
      productId: prod ? prod.id : 'prod-001',
      productTitle: prod ? prod.title : 'Bijou Signature',
      productImage: prod && prod.images ? prod.images[0] : '',
      selectedColor: prod && prod.colors && prod.colors[0] ? prod.colors[0].name : 'Doré',
      selectedSize: prod && prod.sizes && prod.sizes[0] ? prod.sizes[0] : 'Standard',
      quantity: qty,
      unitPrice: prod ? prod.price : 2500,
      productTotal,
      shippingFee: shipping,
      grandTotal: productTotal + shipping,
      status: 'pending',
      notes: 'Simulation démo client en direct',
    });

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#D48C98', '#E05A6D', '#F9F1F0', '#2B2B2B', '#FFD700'],
      });
    } catch (e) {}

    showToast(`🎉 Nouvelle commande simulée en direct : ${ord.orderNumber} de ${client.name} (${client.wilayaName}) !`, 'success');
    return ord;
  };

  return (
    <StoreContext.Provider
      value={{
        currentView,
        setCurrentView,
        selectedProductId,
        openProductPage,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        products,
        orders,
        wilayas,
        config,
        reviews,
        isLoading,
        refreshAll: loadData,
        createOrder,
        updateOrderStatus,
        updateProduct,
        createProduct,
        deleteProduct,
        updateWilaya,
        updateConfig,
        setThemePreset,
        addReview,
        resetDemoData,
        showToast,
        generateWhatsAppLink,
        exportOrdersToCsv,
        categories,
        addCategory,
        deleteCategory,
        isAdminLoggedIn,
        loginAdmin,
        logoutAdmin,
        demoLoginAdmin,
        simulateDemoOrder,
      }}
    >
      {children}

      {/* Floating Toast notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl shadow-luxury border text-xs sm:text-sm font-medium flex items-center gap-3 animate-fadeIn transition-all transform duration-300 ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : toast.type === 'error'
                ? 'bg-rose-50 text-rose-900 border-rose-200'
                : 'bg-stone-50 text-stone-900 border-stone-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full flex-shrink-0 animate-ping"
              style={{
                backgroundColor:
                  toast.type === 'success' ? '#10B981' : toast.type === 'error' ? '#EF4444' : '#6B7280'
              }}
            />
            <span className="flex-1">{toast.message}</span>
          </div>
        ))}
      </div>
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

