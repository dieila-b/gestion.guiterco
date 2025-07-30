-- Correction pour l'affichage des catégories du catalogue
-- Même problème que les bons de commande : politiques RLS bloquées par UUID invalide

-- Ajouter une politique temporaire pour permettre l'accès aux catégories en mode développement
DROP POLICY IF EXISTS "Dev: Allow all operations on categories_catalogue" ON public.categories_catalogue;

CREATE POLICY "Dev: Allow all operations on categories_catalogue"
ON public.categories_catalogue
FOR ALL
USING (true)
WITH CHECK (true);