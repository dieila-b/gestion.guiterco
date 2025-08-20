-- Désactiver temporairement RLS pour le développement et permettre l'accès aux données

-- Politique permissive temporaire pour le catalogue
DROP POLICY IF EXISTS "SECURE_catalogue_read" ON public.catalogue;
DROP POLICY IF EXISTS "SECURE_catalogue_insert" ON public.catalogue;
DROP POLICY IF EXISTS "SECURE_catalogue_update" ON public.catalogue;
DROP POLICY IF EXISTS "SECURE_catalogue_delete" ON public.catalogue;

CREATE POLICY "DEV_catalogue_full_access" ON public.catalogue
FOR ALL
USING (true)
WITH CHECK (true);

-- Politique permissive temporaire pour les clients
DROP POLICY IF EXISTS "SECURE_clients_read" ON public.clients;
DROP POLICY IF EXISTS "SECURE_clients_insert" ON public.clients;
DROP POLICY IF EXISTS "SECURE_clients_update" ON public.clients;
DROP POLICY IF EXISTS "SECURE_clients_delete" ON public.clients;

CREATE POLICY "DEV_clients_full_access" ON public.clients
FOR ALL
USING (true)
WITH CHECK (true);

-- Politique permissive temporaire pour les entrepôts
DROP POLICY IF EXISTS "Debug: Allow all access to entrepots" ON public.entrepots;
DROP POLICY IF EXISTS "Debug: Allow public read access to entrepots" ON public.entrepots;

CREATE POLICY "DEV_entrepots_full_access" ON public.entrepots
FOR ALL
USING (true)
WITH CHECK (true);

-- Politique permissive temporaire pour stock_principal
DROP POLICY IF EXISTS "STRICT_entrees_stock_read" ON public.stock_principal;
DROP POLICY IF EXISTS "STRICT_entrees_stock_write" ON public.stock_principal;

CREATE POLICY "DEV_stock_principal_full_access" ON public.stock_principal
FOR ALL
USING (true)
WITH CHECK (true);

-- Politique permissive temporaire pour stock_pdv
CREATE POLICY "DEV_stock_pdv_full_access" ON public.stock_pdv
FOR ALL
USING (true)
WITH CHECK (true);

-- Politique permissive temporaire pour points_de_vente
CREATE POLICY "DEV_points_de_vente_full_access" ON public.points_de_vente
FOR ALL
USING (true)
WITH CHECK (true);

-- Corriger la fonction checkDataIntegrity pour éviter les erreurs SQL
CREATE OR REPLACE FUNCTION public.check_orphaned_stock()
RETURNS TABLE(
  article_id uuid,
  quantite_disponible integer,
  entrepot_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.article_id,
    sp.quantite_disponible::integer,
    sp.entrepot_id
  FROM public.stock_principal sp
  LEFT JOIN public.catalogue c ON sp.article_id = c.id
  WHERE c.id IS NULL OR c.statut != 'actif';
END;
$$;