-- ==============================================================================
-- SCHÉMA DE BASE DE DONNÉES SUPABASE POUR MAISON CÉLESTE (ORLEA JEWELS)
-- ==============================================================================
-- Exécutez ce script dans le "SQL Editor" de votre tableau de bord Supabase.

-- 1. Table des Commandes (Cash on Delivery - Algérie)
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  wilaya_id INTEGER NOT NULL,
  wilaya_name TEXT NOT NULL,
  commune TEXT NOT NULL,
  address TEXT NOT NULL,
  delivery_type TEXT NOT NULL DEFAULT 'home', -- 'home' ou 'desk'
  product_id TEXT NOT NULL,
  product_title TEXT NOT NULL,
  product_image TEXT NOT NULL,
  selected_color TEXT,
  selected_size TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  product_total NUMERIC NOT NULL,
  shipping_fee NUMERIC NOT NULL DEFAULT 0,
  grand_total NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'
  tracking_code TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Index pour accélérer la recherche par téléphone et par Wilaya
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders (customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_wilaya ON orders (wilaya_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);

-- 2. Activer la Sécurité au Niveau des Lignes (Row Level Security - RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Règle A : N'importe quel visiteur peut enregistrer une commande depuis la boutique (INSERT public)
CREATE POLICY "Public insert orders" ON orders
  FOR INSERT
  WITH CHECK (true);

-- Règle B : Accès complet pour la lecture et la mise à jour (gérant / admin)
CREATE POLICY "Public select orders" ON orders
  FOR SELECT
  USING (true);

CREATE POLICY "Public update orders" ON orders
  FOR UPDATE
  USING (true);

CREATE POLICY "Public delete orders" ON orders
  FOR DELETE
  USING (true);

-- 3. Activer la réplication en temps réel (Realtime)
-- Permet au tableau de bord d'afficher instantanément les nouvelles commandes sans recharger la page
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
