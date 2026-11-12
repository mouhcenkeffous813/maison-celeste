-- ====================================================================
-- MAISON CÉLESTE — MARKETING INTEGRATIONS TABLE
-- Exécutez ce script SQL dans votre Supabase Dashboard > SQL Editor
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.marketing_integrations (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  pixel_id TEXT,
  enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activation de Row Level Security (RLS)
ALTER TABLE public.marketing_integrations ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité (Lecture publique pour initialiser les pixels dans la boutique)
CREATE POLICY "Public read marketing_integrations"
  ON public.marketing_integrations
  FOR SELECT
  USING (true);

-- Modification autorisée (Insertion / Mise à jour par admin ou clé de service)
CREATE POLICY "Admin update marketing_integrations"
  ON public.marketing_integrations
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Données initiales par défaut
INSERT INTO public.marketing_integrations (id, platform, pixel_id, enabled)
VALUES
  ('meta-pixel', 'meta', '', false),
  ('tiktok-pixel', 'tiktok', '', false)
ON CONFLICT (id) DO NOTHING;
