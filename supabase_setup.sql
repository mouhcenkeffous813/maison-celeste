-- ====================================================================
-- MAISON CÉLESTE — TABLES DE SYNCHRONISATION CLOUD SUPABASE
-- À exécuter dans votre Supabase Dashboard > SQL Editor
-- ====================================================================

-- 1. Table pour la configuration White-Label de la boutique
CREATE TABLE IF NOT EXISTS public.store_config (
  id TEXT PRIMARY KEY DEFAULT 'current',
  store_name TEXT,
  store_tagline TEXT,
  logo_url TEXT,
  currency TEXT DEFAULT 'DA',
  phone TEXT,
  whatsapp_number TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  tiktok_url TEXT,
  free_shipping_threshold NUMERIC DEFAULT 10000,
  theme JSONB,
  meta_pixel_id TEXT,
  tiktok_pixel_id TEXT,
  delivery_time_estimate TEXT,
  announcement_text TEXT,
  admin_pin TEXT DEFAULT '1234',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activation de RLS
ALTER TABLE public.store_config ENABLE ROW LEVEL SECURITY;

-- Lecture publique pour les visiteurs de la boutique
CREATE POLICY "Public read store_config"
  ON public.store_config
  FOR SELECT
  USING (true);

-- Écriture autorisée
CREATE POLICY "Allow update store_config"
  ON public.store_config
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 2. Table pour les intégrations Marketing (Meta & TikTok Pixels)
CREATE TABLE IF NOT EXISTS public.marketing_integrations (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  pixel_id TEXT,
  enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.marketing_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read marketing_integrations"
  ON public.marketing_integrations
  FOR SELECT
  USING (true);

CREATE POLICY "Allow update marketing_integrations"
  ON public.marketing_integrations
  FOR ALL
  USING (true)
  WITH CHECK (true);
