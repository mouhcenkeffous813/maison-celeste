import { Product, Order, OrderStatus, Wilaya, StoreConfig, Review } from '../types';
import { INITIAL_PRODUCTS } from '../data/mockProducts';
import { INITIAL_ORDERS } from '../data/mockOrders';
import { INITIAL_REVIEWS } from '../data/mockReviews';
import { DEFAULT_STORE_CONFIG, applyThemeVariables } from '../config/store.config';
import rawWilayas from '../config/wilayas.json';

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
    const raw = loadFromStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    // Deduplicate in case any past duplicate exists
    const seen = new Set<string>();
    const cleaned: Order[] = [];
    for (const ord of raw) {
      const key = ord.id || ord.orderNumber;
      if (key && !seen.has(key)) {
        seen.add(key);
        cleaned.push(ord);
      }
    }
    // If duplicates were pruned, update localStorage silently
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
    const orders = await this.getOrders();
    return orders.find(o => o.id === id) || null;
  },

  async getOrdersByPhone(phone: string): Promise<Order[]> {
    const orders = await this.getOrders();
    const cleanQuery = phone.replace(/\s+/g, '');
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

    // Filter out any potential collision
    const updated = [
      newOrder,
      ...orders.filter(o => o.id !== uniqueId && o.orderNumber !== orderNumber),
    ];
    saveToStorage(STORAGE_KEYS.ORDERS, updated);

    // Deduct stock if matching variant is found
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
    return updatedOrder;
  },

  async deleteOrder(orderId: string): Promise<boolean> {
    const orders = await this.getOrders();
    const filtered = orders.filter(o => o.id !== orderId);
    saveToStorage(STORAGE_KEYS.ORDERS, filtered);
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
    const config = loadFromStorage<StoreConfig>(STORAGE_KEYS.CONFIG, DEFAULT_STORE_CONFIG);
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

