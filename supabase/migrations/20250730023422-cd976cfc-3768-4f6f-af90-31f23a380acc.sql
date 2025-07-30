-- Créer une policy temporaire pour permettre l'accès libre au catalogue pour le debug

-- Supprimer temporairement la policy restrictive
DROP POLICY IF EXISTS "Catalogue readable for stock operations" ON public.catalogue;

-- Créer une policy très permissive pour le debug
CREATE POLICY "Debug: Allow all access to catalogue"
ON public.catalogue
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Activer la policy temporaire aussi pour les utilisateurs non authentifiés (si nécessaire)
CREATE POLICY "Debug: Allow public read access to catalogue"
ON public.catalogue
FOR SELECT
TO public
USING (true);