-- Corriger les politiques RLS pour la table entrepots

-- Supprimer les anciennes politiques restrictives
DROP POLICY IF EXISTS "Allow authenticated users to read entrepots" ON public.entrepots;
DROP POLICY IF EXISTS "Allow authorized users to write entrepots" ON public.entrepots;

-- Créer des politiques permissives temporaires pour le debug
CREATE POLICY "Debug: Allow all access to entrepots"
ON public.entrepots
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Ajouter une politique publique en lecture pour le debug
CREATE POLICY "Debug: Allow public read access to entrepots"
ON public.entrepots
FOR SELECT
TO public
USING (true);