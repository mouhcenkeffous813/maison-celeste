import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Product, Order, Wilaya, StoreConfig, Review, OrderStatus, ThemePreset, CartItem } from '../types';
import { api } from '../services/api';
import { DEFAULT_STORE_CONFIG, applyThemeVariables } from '../config/store.config';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

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

  // Cart Management
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotalCount: number;
  cartSubtotal: number;

  // Actions
  refreshAll: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  lastSyncTime: Date | null;
  isSyncing: boolean;
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

  // Dark Mode
  isDarkMode: boolean;
  toggleDarkMode: () => void;
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

  // Dark Mode State with localStorage persistence
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('maison_celeste_dark_mode');
      if (stored !== null) return stored === 'true';
    }
    return false;
  });

  useEffect(() => {
    try {
      localStorage.setItem('maison_celeste_dark_mode', String(isDarkMode));
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {
      // ignore
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // Cart State (Persisted in localStorage)
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('maison_celeste_cart');
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('maison_celeste_cart', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  const cartTotalCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }, [cart]);

  const addToCart = (item: Omit<CartItem, 'id'>) => {
    const cartItemId = `${item.productId}-${item.selectedColor || 'def'}-${item.selectedSize || 'def'}`;
    setCart(prev => {
      const existing = prev.find(i => i.id === cartItemId);
      if (existing) {
        const newQty = Math.min(existing.quantity + item.quantity, item.maxStock || 99);
        return prev.map(i => (i.id === cartItemId ? { ...i, quantity: newQty } : i));
      }
      return [...prev, { ...item, id: cartItemId }];
    });
    showToast(`${item.productTitle} ajouté au panier !`, 'success');
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === cartItemId
          ? { ...item, quantity: Math.min(quantity, item.maxStock || 99) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const isFetchingRef = useRef(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(() => new Date());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const previousOrdersCountRef = useRef<number | null>(null);

  // Discrete merchant audio chime for new orders
  const playOrderChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio autoplay policy may suppress in background without user gesture
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const loadData = async (isSilent = false) => {
    // Éviter les appels concurrents en double
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (!isSilent) {
      setIsLoading(true);
    }
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
      setLastSyncTime(new Date());

      setWilayas(wils);
      setConfig(cfg);
      setReviews(revs);
      try {
        applyThemeVariables(cfg.theme);
      } catch (themeErr) {
        console.warn('Theme apply fallback:', themeErr);
      }
    } catch (err) {
      console.error('Error loading store data:', err);
      if (!isSilent) {
        showToast('Erreur de chargement des données', 'error');
      }
    } finally {
      if (!isSilent) {
        setIsLoading(false);
      }
      isFetchingRef.current = false;
    }
  };

  // Dedicated lightweight fast order refresh (from Supabase Cloud)
  const refreshOrders = async () => {
    try {
      setIsSyncing(true);
      const ords = await api.getOrders();
      const uniqueOrders = ords.filter((ord, idx, arr) =>
        idx === arr.findIndex(o => o.id === ord.id || (o.orderNumber && o.orderNumber === ord.orderNumber))
      );
      setOrders(uniqueOrders);
      setLastSyncTime(new Date());
      showToast(`Commandes synchronisées (${uniqueOrders.length} trouvées)`, 'success');
    } catch (err) {
      console.error('Error refreshing orders:', err);
      showToast('Échec de la synchronisation des commandes', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Realtime Supabase Channel: auto-update when new order arrives from any client
  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) return;

    let channel: any = null;
    try {
      channel = supabase
        .channel('public:orders-realtime-sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          (payload) => {
            console.log('[Supabase Realtime] Changement détecté sur les commandes:', payload);
            loadData(true);
          }
        )
        .subscribe((status) => {
          console.log('[Supabase Realtime] Statut abonnement commandes:', status);
        });
    } catch (err) {
      console.warn('[Supabase Realtime] Erreur abonnement:', err);
    }

    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // Cross-Tab local synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'celeste_orders_v10' || e.key === 'celeste_config_v10' || e.key === 'celeste_products_v11') {
        loadData(true);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Ultra-fast live orders polling (every 3.5s) so new orders appear live without any page refresh!
  useEffect(() => {
    if (!isAdminLoggedIn && currentView !== 'admin') return;

    // Immediately fetch once
    api.getOrders().then(ords => {
      const uniqueOrders = ords.filter((ord, idx, arr) =>
        idx === arr.findIndex(o => o.id === ord.id || (o.orderNumber && o.orderNumber === ord.orderNumber))
      );
      setOrders(uniqueOrders);
      setLastSyncTime(new Date());
    }).catch(() => {});

    const interval = setInterval(async () => {
      try {
        const ords = await api.getOrders();
        const uniqueOrders = ords.filter((ord, idx, arr) =>
          idx === arr.findIndex(o => o.id === ord.id || (o.orderNumber && o.orderNumber === ord.orderNumber))
        );
        setOrders(prev => {
          if (uniqueOrders.length !== prev.length || uniqueOrders[0]?.id !== prev[0]?.id) {
            return uniqueOrders;
          }
          return prev;
        });
        setLastSyncTime(new Date());
      } catch (e) {
        // silent
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [isAdminLoggedIn, currentView]);

  // Instantly fetch fresh orders from Supabase when admin tab regains focus or becomes visible
  useEffect(() => {
    const handleFocusOrVisible = () => {
      if (document.visibilityState === 'visible' && isAdminLoggedIn) {
        loadData(true);
      }
    };
    window.addEventListener('focus', handleFocusOrVisible);
    document.addEventListener('visibilitychange', handleFocusOrVisible);
    return () => {
      window.removeEventListener('focus', handleFocusOrVisible);
      document.removeEventListener('visibilitychange', handleFocusOrVisible);
    };
  }, [isAdminLoggedIn]);

  // Audio alert and notification when a new order appears in admin view
  useEffect(() => {
    if (orders.length > 0) {
      if (previousOrdersCountRef.current !== null && orders.length > previousOrdersCountRef.current && isAdminLoggedIn) {
        const diff = orders.length - previousOrdersCountRef.current;
        const newest = orders[0];
        playOrderChime();
        showToast(
          `🔔 ${diff > 1 ? `${diff} nouvelles commandes reçues !` : `Nouvelle commande reçue : ${newest.orderNumber} (${newest.customerName})`}`,
          'success'
        );
      }
      previousOrdersCountRef.current = orders.length;
    }
  }, [orders, isAdminLoggedIn]);

  useEffect(() => {
    // Premier chargement initial
    loadData(false);

    // Écouteur avec temporisation de sécurité (mise à jour silencieuse)
    let updateTimeout: any = null;
    const handleStoreUpdate = () => {
      if (updateTimeout) clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        loadData(true); // Mise à jour silencieuse en arrière-plan sans écran de chargement
      }, 300);
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
    
    let articlesDetail = `👗 *${order.productTitle}*\n` +
      `✨ Variante : ${order.selectedColor} | ${order.selectedSize}\n` +
      `📦 Quantité : ${order.quantity}\n`;

    if (order.items && order.items.length > 1) {
      articlesDetail = `🛍️ *Détail de votre Panier (${order.items.length} articles) :*\n` +
        order.items.map((it, idx) => `  ${idx + 1}. *${it.productTitle}* (${it.selectedColor} ${it.selectedSize ? `• ${it.selectedSize}` : ''}) × ${it.quantity} = ${it.totalPrice.toLocaleString()} ${config.currency}`).join('\n') + '\n';
    }

    const text = `Bonjour ${order.customerName},\n\n` +
      `C'est la boutique *${config.storeName}*.\n` +
      `Nous avons bien reçu votre commande *${order.orderNumber}* pour :\n\n` +
      articlesDetail + '\n' +
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
      loadData(true);
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
    loadData(true);
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
        // Cart
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotalCount,
        cartSubtotal,

        isLoading,
        refreshAll: () => loadData(true),
        refreshOrders,
        lastSyncTime,
        isSyncing,
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
        isDarkMode,
        toggleDarkMode,
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

