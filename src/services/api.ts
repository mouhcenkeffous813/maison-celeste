import { Product, Order, OrderStatus, Wilaya, StoreConfig, Review } from '../types';
import { INITIAL_PRODUCTS } from '../data/mockProducts';
import { INITIAL_ORDERS } from '../data/mockOrders';
import { INITIAL_REVIEWS } from '../data/mockReviews';
import { DEFAULT_STORE_CONFIG, applyThemeVariables } from '../config/store.config';
import rawWilayas from '../config/wilayas.json';
import { supabase, isSupabaseConfigured } from './supabaseClient';

function mapDbToOrder(row: any): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    wilayaId: Number(row.wilaya_id),
    wilayaName: row.wilaya_name,
    commune: row.commune,
    address: row.address,
    deliveryType: (row.delivery_type as 'home' | 'desk') || 'home',
    productId: row.product_id,
    productTitle: row.product_title,
    productImage: row.product_image,
    selectedColor: row.selected_color || '',
    selectedSize: row.selected_size || '',
    quantity: Number(row.quantity) || 1,
    unitPrice: Number(row.unit_price) || 0,
    productTotal: Number(row.product_total) || 0,
    shippingFee: Number(row.shipping_fee) || 0,
    grandTotal: Number(row.grand_total) || 0,
    status: (row.status as OrderStatus) || 'pending',
    trackingCode: row.tracking_code || undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

function mapOrderToDb(order: Order) {
  return {
    id: order.id,
    order_number: order.orderNumber,
    customer_name: order.customerName,
    customer_phone: order.customerPhone,
    wilaya_id: order.wilayaId,
    wilaya_name: order.wilayaName,
    commune: order.commune,
    address: order.address,
    delivery_type: order.deliveryType,
    product_id: order.productId,
    product_title: order.productTitle,
    product_image: order.productImage,
    selected_color: order.selectedColor,
    selected_size: order.selectedSize,
    quantity: order.quantity,
    unit_price: order.unitPrice,
    product_total: order.productTotal,
    shipping_fee: order.shippingFee,
    grand_total: order.grandTotal,
    status: order.status,
    tracking_code: order.trackingCode || null,
    notes: order.notes || null,
    created_at: order.createdAt,
    updated_at: order.updatedAt,
  };
}

const STORAGE_KEYS = {
  PRODUCTS: 'celeste_products_v11',
  ORDERS: 'celeste_orders_v10',
  WILAYAS: 'orlea_wilayas_v7',
  CONFIG: 'celeste_config_v10',
  REVIEWS: 'celeste_reviews_v10',
  CATEGORIES: 'celeste_categories_v10',
};

export const INITIAL_CATEGORIES: string[] = [
  'Colliers & Pendentifs',
  'Bracelets & Joncs',
  'Bagues & Alliances',
  'Coffrets & Packs',
  'Montres & Accessoires',
  'Caftans & Prêt-à-Porter',
];

// Helper: load from localStorage with fallback
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`[Storage] Failed to read ${key}, using fallback`, e);
    return fallback;
  }
}

// Helper: save to localStorage and dispatch custom event for instant cross-component updates
function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('elissia_store_update', { detail: { key, data } }));
  } catch (e) {
    console.error(`[Storage] Failed to save ${key}`, e);
  }
}

/**
 * Abstract API service
 * Ready for drop-in Supabase / Firebase / REST backend replacement
 */
export const api = {
  // ===================== PRODUCTS =====================
  async getProducts(): Promise<Product[]> {
    return loadFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  },

  async getProductById(id: string): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find(p => p.id === id) || null;
  },

  async createProduct(data: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const products = await this.getProducts();
    const newProduct: Product = {
      ...data,
      id: `prod-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updated = [newProduct, ...products];
    saveToStorage(STORAGE_KEYS.PRODUCTS, updated);
    return newProduct;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const products = await this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error(`Product ${id} not found`);

    const updatedProduct = { ...products[index], ...updates };
    products[index] = updatedProduct;
    saveToStorage(STORAGE_KEYS.PRODUCTS, [...products]);
    return updatedProduct;
  },

  async deleteProduct(id: string): Promise<boolean> {
    const products = await this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    saveToStorage(STORAGE_KEYS.PRODUCTS, filtered);
    return true;
  },

  // ===================== CATEGORIES (DYNAMIC CRUD) =====================
  async getCategories(): Promise<string[]> {
    const prods = await this.getProducts();
    const fallback = Array.from(
      new Set([...INITIAL_CATEGORIES, ...prods.map(p => p.category).filter(Boolean)])
    );
    return loadFromStorage<string[]>(STORAGE_KEYS.CATEGORIES, fallback);
  },

  async addCategory(name: string): Promise<string[]> {
    const cats = await this.getCategories();
    const clean = name.trim();
    if (!clean || cats.includes(clean)) return cats;
    const updated = [...cats, clean];
    saveToStorage(STORAGE_KEYS.CATEGORIES, updated);
    return updated;
  },

  async deleteCategory(name: string): Promise<string[]> {
    const cats = await this.getCategories();
    const filtered = cats.filter(c => c !== name);
    saveToStorage(STORAGE_KEYS.CATEGORIES, filtered);

    // Also reassign any products with this category to the first available category or 'Général'
    const fallbackCategory = filtered[0] || 'Général';
    const prods = await this.getProducts();
    let hasChanges = false;
    const updatedProds = prods.map(p => {
      if (p.category === name) {
        hasChanges = true;
        return { ...p, category: fallbackCategory };
      }
      return p;
    });
    if (hasChanges) {
      saveToStorage(STORAGE_KEYS.PRODUCTS, updatedProds);
    }

    return filtered;
  },

  // ===================== ORDERS (COD ALGERIA) =====================
  async getOrders(): Promise<Order[]> {
    // 1. Tenter la récupération depuis Supabase Cloud si connecté
    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          const cloudOrders = data.map(mapDbToOrder);
          // Mise en cache silencieuse dans localStorage SANS déclencher d'événement récursif
          try {
            localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(cloudOrders));
          } catch (e) {
            // Ignorer si quota plein
          }
          return cloudOrders;
        }
      } catch (err) {
        console.warn('[Supabase] Erreur de lecture des commandes distantes, bascule locale', err);
      }
    }

    // 2. Repli automatique sur le stockage local
    const raw = loadFromStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const seen = new Set<string>();
    const cleaned: Order[] = [];
    for (const ord of raw) {
      const key = ord.id || ord.orderNumber;
      if (key && !seen.has(key)) {
        seen.add(key);
        cleaned.push(ord);
      }
    }
    if (cleaned.length !== raw.length) {
      try {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(cleaned));
      } catch (e) {
        console.warn('Failed to prune duplicate orders in storage', e);
      }
    }
    return cleaned;
  },

  async getOrderById(id: string): Promise<Order | null> {
    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
        if (!error && data) return mapDbToOrder(data);
      } catch (e) {
        // Fallback
      }
    }
    const orders = await this.getOrders();
    return orders.find(o => o.id === id) || null;
  },

  async getOrdersByPhone(phone: string): Promise<Order[]> {
    const cleanQuery = phone.replace(/\s+/g, '');
    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .ilike('customer_phone', `%${cleanQuery}%`)
          .order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) return data.map(mapDbToOrder);
      } catch (e) {
        // Fallback
      }
    }
    const orders = await this.getOrders();
    return orders.filter(o => o.customerPhone.replace(/\s+/g, '').includes(cleanQuery));
  },

  async createOrder(
    data: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>
  ): Promise<Order> {
    const orders = await this.getOrders();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const uniqueId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const orderNumber = `CMD-DZ-${randomSuffix}`;

    const newOrder: Order = {
      ...data,
      id: uniqueId,
      orderNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Sauvegarde dans le Cloud Supabase
    if (supabase && isSupabaseConfigured) {
      try {
        const payload = mapOrderToDb(newOrder);
        const { error } = await supabase.from('orders').insert([payload]);
        if (error) {
          console.warn('[Supabase] Erreur insertion commande distante:', error.message);
        } else {
          console.log('[Supabase] Commande synchronisée dans le Cloud avec succès !', orderNumber);
        }
      } catch (err) {
        console.warn('[Supabase] Exception réseau lors de la création de la commande:', err);
      }
    }

    // 2. Cache local réactif
    const updated = [
      newOrder,
      ...orders.filter(o => o.id !== uniqueId && o.orderNumber !== orderNumber),
    ];
    saveToStorage(STORAGE_KEYS.ORDERS, updated);

    // Déduction automatique du stock de variante
    try {
      const products = await this.getProducts();
      const product = products.find(p => p.id === data.productId);
      if (product) {
        const variantIdx = product.variants.findIndex(
          v => v.colorName === data.selectedColor && v.size === data.selectedSize
        );
        if (variantIdx !== -1) {
          product.variants[variantIdx].stock = Math.max(
            0,
            product.variants[variantIdx].stock - data.quantity
          );
          product.totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
          await this.updateProduct(product.id, {
            variants: product.variants,
            totalStock: product.totalStock,
          });
        }
      }
    } catch (err) {
      console.warn('Failed to auto-decrement stock', err);
    }

    return newOrder;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus, notes?: string): Promise<Order> {
    const orders = await this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) throw new Error(`Order ${orderId} not found`);

    const updatedOrder: Order = {
      ...orders[index],
      status,
      ...(notes !== undefined ? { notes } : {}),
      updatedAt: new Date().toISOString(),
    };
    orders[index] = updatedOrder;
    saveToStorage(STORAGE_KEYS.ORDERS, [...orders]);

    // Synchronisation Supabase
    if (supabase && isSupabaseConfigured) {
      try {
        await supabase
          .from('orders')
          .update({
            status,
            ...(notes !== undefined ? { notes } : {}),
            updated_at: updatedOrder.updatedAt,
          })
          .eq('id', orderId);
      } catch (e) {
        console.warn('[Supabase] Erreur de mise à jour du statut distant:', e);
      }
    }

    return updatedOrder;
  },

  async deleteOrder(orderId: string): Promise<boolean> {
    const orders = await this.getOrders();
    const filtered = orders.filter(o => o.id !== orderId);
    saveToStorage(STORAGE_KEYS.ORDERS, filtered);

    // Suppression Supabase
    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from('orders').delete().eq('id', orderId);
      } catch (e) {
        console.warn('[Supabase] Erreur suppression commande distante:', e);
      }
    }

    return true;
  },

  // ===================== WILAYAS (58) =====================
  async getWilayas(): Promise<Wilaya[]> {
    return loadFromStorage<Wilaya[]>(STORAGE_KEYS.WILAYAS, rawWilayas as Wilaya[]);
  },

  async updateWilaya(id: number, updates: Partial<Wilaya>): Promise<Wilaya> {
    const wilayas = await this.getWilayas();
    const index = wilayas.findIndex(w => w.id === id);
    if (index === -1) throw new Error(`Wilaya ${id} not found`);

    const updatedWilaya = { ...wilayas[index], ...updates };
    wilayas[index] = updatedWilaya;
    saveToStorage(STORAGE_KEYS.WILAYAS, [...wilayas]);
    return updatedWilaya;
  },

  async bulkUpdateWilayas(updatedWilayas: Wilaya[]): Promise<void> {
    saveToStorage(STORAGE_KEYS.WILAYAS, updatedWilayas);
  },

  // ===================== STORE CONFIG (WHITE-LABEL) =====================
  async getStoreConfig(): Promise<StoreConfig> {
    let config = loadFromStorage<StoreConfig>(STORAGE_KEYS.CONFIG, DEFAULT_STORE_CONFIG);

    // Synchronisation depuis le Cloud Supabase (si configuré)
    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('store_config')
          .select('*')
          .eq('id', 'current')
          .maybeSingle();

        if (!error && data) {
          config = {
            storeName: data.store_name ?? config.storeName,
            storeTagline: data.store_tagline ?? config.storeTagline,
            logoUrl: data.logo_url ?? config.logoUrl,
            currency: data.currency ?? config.currency,
            phone: data.phone ?? config.phone,
            whatsappNumber: data.whatsapp_number ?? config.whatsappNumber,
            instagramUrl: data.instagram_url ?? config.instagramUrl,
            facebookUrl: data.facebook_url ?? config.facebookUrl,
            tiktokUrl: data.tiktok_url ?? config.tiktokUrl,
            freeShippingThreshold: Number(data.free_shipping_threshold ?? config.freeShippingThreshold),
            theme: data.theme ?? config.theme,
            metaPixelId: data.meta_pixel_id ?? config.metaPixelId,
            tiktokPixelId: data.tiktok_pixel_id ?? config.tiktokPixelId,
            deliveryTimeEstimate: data.delivery_time_estimate ?? config.deliveryTimeEstimate,
            announcementText: data.announcement_text ?? config.announcementText,
            adminPin: data.admin_pin ?? config.adminPin,
          };
          // Mise en cache locale silencieuse
          try {
            localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
          } catch (e) {
            // Ignorer si quota plein
          }
        }
      } catch (err) {
        // Table non créée ou indisponible, fallback transparent sur le stockage local
      }
    }

    applyThemeVariables(config.theme);
    return config;
  },

  async updateStoreConfig(updates: Partial<StoreConfig>): Promise<StoreConfig> {
    const current = await this.getStoreConfig();
    const updated: StoreConfig = { ...current, ...updates };
    saveToStorage(STORAGE_KEYS.CONFIG, updated);
    if (updates.theme) {
      applyThemeVariables(updates.theme);
    }

    // Synchronisation vers Supabase Cloud
    if (supabase && isSupabaseConfigured) {
      try {
        const cloudPayload = {
          id: 'current',
          store_name: updated.storeName,
          store_tagline: updated.storeTagline,
          logo_url: updated.logoUrl,
          currency: updated.currency,
          phone: updated.phone,
          whatsapp_number: updated.whatsappNumber,
          instagram_url: updated.instagramUrl,
          facebook_url: updated.facebookUrl,
          tiktok_url: updated.tiktokUrl,
          free_shipping_threshold: updated.freeShippingThreshold,
          theme: updated.theme,
          meta_pixel_id: updated.metaPixelId,
          tiktok_pixel_id: updated.tiktokPixelId,
          delivery_time_estimate: updated.deliveryTimeEstimate,
          announcement_text: updated.announcementText,
          admin_pin: updated.adminPin,
          updated_at: new Date().toISOString(),
        };

        await supabase
          .from('store_config')
          .upsert(cloudPayload, { onConflict: 'id' });
      } catch (err) {
        console.warn('Supabase store_config sync not ready, saved in localStorage only');
      }
    }

    return updated;
  },

  // ===================== REVIEWS =====================
  async getReviews(productId?: string): Promise<Review[]> {
    const reviews = loadFromStorage<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    if (productId) {
      return reviews.filter(r => r.productId === productId);
    }
    return reviews;
  },

  async addReview(data: Omit<Review, 'id' | 'date'>): Promise<Review> {
    const reviews = await this.getReviews();
    const dateStr = new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date());

    const newReview: Review = {
      ...data,
      id: `rev-${Date.now()}`,
      date: dateStr,
    };
    const updated = [newReview, ...reviews];
    saveToStorage(STORAGE_KEYS.REVIEWS, updated);

    // Recalculate product rating
    try {
      const prodReviews = updated.filter(r => r.productId === data.productId);
      const avgRating = Number(
        (prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length).toFixed(1)
      );
      await this.updateProduct(data.productId, {
        rating: avgRating,
        reviewCount: prodReviews.length,
      });
    } catch (e) {
      console.warn('Failed to update product rating', e);
    }

    return newReview;
  },

  // Reset to factory defaults for demo
  resetAllDemoData(): void {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.WILAYAS);
    localStorage.removeItem(STORAGE_KEYS.CONFIG);
    localStorage.removeItem(STORAGE_KEYS.REVIEWS);
    window.location.reload();
  },
};

