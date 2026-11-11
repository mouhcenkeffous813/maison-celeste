# 07 — Architecture Backend et Roadmap d'Évolution

Ce document détaille la logique serveur/backend de **Maison Céleste**, son fonctionnement actuel sans serveur (Zero-Backend / Local Storage Engine), ainsi que les étapes précises pour brancher un backend distant (Supabase / REST / Node.js).

---

## 1. Fonctionnement Backend Actuel : Zero-Backend Asynchrone

L'application fonctionne actuellement selon le modèle **JAMstack / Client-Side Persistence**. Toute la logique métier que l'on trouve habituellement dans un backend traditionnel a été implémentée de manière modulaire dans la couche de service [`src/services/api.ts`](file:///c:/Users/Mohcen/Desktop/e-commerce/src/services/api.ts) :

1. **Génération d'identifiants uniques et de numéros de commande :**
   ```ts
   const orderNumber = `CMD-DZ-${Math.floor(1000 + Math.random() * 9000)}`;
   const uniqueId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
   ```
2. **Déduction automatique des stocks lors de la commande :**
   Lorsqu'un acheteur valide un article d'une taille et d'une couleur données, `api.createOrder()` recherche le produit correspondant, réduit son stock de variante, recalcule le `totalStock` global et sauvegarde les modifications.
3. **Déduplication des commandes :**
   Le moteur filtre automatiquement les commandes pour garantir qu'aucun identifiant en doublon n'existe dans le stockage.
4. **Calcul dynamique de la note moyenne des produits :**
   Lorsqu'un nouvel avis est posté via `api.addReview()`, la moyenne arithmétique de la note et le compteur d'avis du produit sont recalculés et persistés.
5. **Réattribution sécurisée des produits orphelins :**
   Lorsqu'une catégorie est supprimée via `api.deleteCategory()`, tous les articles associés sont automatiquement réassignés à la première catégorie active restante pour éviter les erreurs 404.

---

## 2. Contrat d'Interface Asynchrone (Pattern Repository)

Toutes les méthodes de `api.ts` retournent des `Promise<T>` :
```ts
export interface ApiContract {
  getProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  createProduct(data: Omit<Product, 'id' | 'createdAt'>): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product>;
  deleteProduct(id: string): Promise<boolean>;

  getCategories(): Promise<string[]>;
  addCategory(name: string): Promise<string[]>;
  deleteCategory(name: string): Promise<string[]>;

  getOrders(): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | null>;
  getOrdersByPhone(phone: string): Promise<Order[]>;
  createOrder(data: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<Order>;
  updateOrderStatus(orderId: string, status: OrderStatus, notes?: string): Promise<Order>;
  deleteOrder(orderId: string): Promise<boolean>;

  getWilayas(): Promise<Wilaya[]>;
  updateWilaya(id: number, updates: Partial<Wilaya>): Promise<Wilaya>;
  
  getStoreConfig(): Promise<StoreConfig>;
  updateStoreConfig(updates: Partial<StoreConfig>): Promise<StoreConfig>;
  
  getReviews(productId?: string): Promise<Review[]>;
  addReview(data: Omit<Review, 'id' | 'date'>): Promise<Review>;
}
```

Grâce à cette abstraction stricte, **aucun composant d'interface utilisateur ne sait d'où viennent les données**.

---

## 3. Roadmap : Transition vers un Backend Distant (Supabase PostgreSQL)

Si le propriétaire de la boutique souhaite centraliser les commandes sur plusieurs ordinateurs ou téléphones en temps réel, l'intégration de **Supabase** (gratuit jusqu'à 500 MB et 50 000 utilisateurs actifs) est immédiate.

### Étape 1 : Créer les tables sur Supabase (SQL)
```sql
-- Table des Produits
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  short_description TEXT,
  description TEXT,
  bullet_points JSONB,
  price NUMERIC NOT NULL,
  compare_at_price NUMERIC,
  images JSONB,
  colors JSONB,
  sizes JSONB,
  variants JSONB,
  total_stock INT DEFAULT 0,
  rating NUMERIC DEFAULT 5.0,
  review_count INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  badge TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des Commandes (COD Algérie)
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  wilaya_id INT NOT NULL,
  wilaya_name TEXT NOT NULL,
  commune TEXT NOT NULL,
  address TEXT NOT NULL,
  delivery_type TEXT NOT NULL,
  product_id TEXT REFERENCES products(id),
  product_title TEXT NOT NULL,
  product_image TEXT NOT NULL,
  selected_color TEXT,
  selected_size TEXT,
  quantity INT NOT NULL,
  unit_price NUMERIC NOT NULL,
  product_total NUMERIC NOT NULL,
  shipping_fee NUMERIC NOT NULL,
  grand_total NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  tracking_code TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Étape 2 : Remplacer l'implémentation dans `src/services/api.ts`
Il suffit d'installer le client officiel (`npm install @supabase/supabase-js`) et de brancher les requêtes distantes :
```ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const api = {
  async getProducts() {
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;
    return data;
  },
  async createOrder(orderPayload) {
    const { data, error } = await supabase.from('orders').insert([orderPayload]).select().single();
    if (error) throw error;
    return data;
  },
  // ... Les composants de l'interface restent 100% inchangés
};
```

