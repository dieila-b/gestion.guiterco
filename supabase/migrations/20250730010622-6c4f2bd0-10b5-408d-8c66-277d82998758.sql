-- Correction pour l'affichage des rôles dans les permissions
-- Même problème : politiques RLS bloquées par UUID invalide en mode développement

-- Ajouter une politique temporaire pour permettre l'accès aux rôles en mode développement
DROP POLICY IF EXISTS "Dev: Allow all operations on roles" ON public.roles;

CREATE POLICY "Dev: Allow all operations on roles"
ON public.roles
FOR ALL
USING (true)
WITH CHECK (true);