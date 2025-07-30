-- Correction urgente : RLS trop restrictives pour les stocks
-- Permettre l'accès aux données nécessaires pour l'affichage des stocks

-- 1. Politique temporaire plus permissive pour stock_principal
DROP POLICY IF EXISTS "Authenticated users can access stock_principal" ON public.stock_principal;
CREATE POLICY "Stock principal readable by authenticated users"
ON public.stock_principal
FOR SELECT
TO authenticated
USING (true);

-- 2. Politique temporaire plus permissive pour stock_pdv  
DROP POLICY IF EXISTS "Authenticated users can access stock_pdv" ON public.stock_pdv;
CREATE POLICY "Stock PDV readable by authenticated users"
ON public.stock_pdv
FOR SELECT
TO authenticated
USING (true);

-- 3. Permettre la lecture du catalogue pour les relations de stock
DROP POLICY IF EXISTS "Permission-based catalogue read" ON public.catalogue;
CREATE POLICY "Catalogue readable for stock operations"
ON public.catalogue
FOR SELECT
TO authenticated
USING (true);

-- 4. Garder la policy d'écriture restrictive pour le catalogue
CREATE POLICY "Permission-based catalogue write"
ON public.catalogue
FOR ALL
TO authenticated
USING (user_has_permission('Catalogue', NULL, 'write'))
WITH CHECK (user_has_permission('Catalogue', NULL, 'write'));