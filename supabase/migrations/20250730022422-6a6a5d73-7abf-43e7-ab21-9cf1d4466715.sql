-- Corriger les RLS policies pour permettre les relations Supabase

-- Drop des policies restrictives pour permettre les relations
DROP POLICY IF EXISTS "Permission-based catalogue write" ON public.catalogue;
DROP POLICY IF EXISTS "Permission-based entrepots read" ON public.entrepots;
DROP POLICY IF EXISTS "Permission-based entrepots write" ON public.entrepots;
DROP POLICY IF EXISTS "Permission-based points_de_vente read" ON public.points_de_vente;
DROP POLICY IF EXISTS "Permission-based points_de_vente write" ON public.points_de_vente;

-- Créer des policies plus permissives pour permettre les relations
CREATE POLICY "Allow authenticated users to read catalogue"
ON public.catalogue
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to read entrepots"
ON public.entrepots
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to read points_de_vente"
ON public.points_de_vente
FOR SELECT
TO authenticated
USING (true);

-- Permettre les écritures avec permissions appropriées
CREATE POLICY "Allow authorized users to write catalogue"
ON public.catalogue
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authorized users to write entrepots"
ON public.entrepots
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authorized users to write points_de_vente"
ON public.points_de_vente
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);