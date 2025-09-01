
-- Désactiver temporairement les politiques strictes et créer des politiques de développement
DROP POLICY IF EXISTS "STRICT_entrees_stock_read" ON public.entrees_stock;
DROP POLICY IF EXISTS "STRICT_entrees_stock_write" ON public.entrees_stock;

-- Créer des politiques de développement très permissives
CREATE POLICY "DEV_entrees_stock_all" 
  ON public.entrees_stock 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Vérifier que RLS est activé sur la table
ALTER TABLE public.entrees_stock ENABLE ROW LEVEL SECURITY;

-- Créer également des politiques permissives pour les tables liées si nécessaire
DROP POLICY IF EXISTS "STRICT_catalogue_read" ON public.catalogue;
CREATE POLICY "DEV_catalogue_all" 
  ON public.catalogue 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

DROP POLICY IF EXISTS "STRICT_entrepots_read" ON public.entrepots;
CREATE POLICY "DEV_entrepots_all" 
  ON public.entrepots 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

DROP POLICY IF EXISTS "STRICT_points_de_vente_read" ON public.points_de_vente;
CREATE POLICY "DEV_points_de_vente_all" 
  ON public.points_de_vente 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);
