-- Correction pour l'affichage des utilisateurs internes dans le contrôle d'accès
-- Même problème de RLS que pour les rôles et catégories

-- Ajouter une politique temporaire pour permettre l'accès aux utilisateurs_internes en mode développement
DROP POLICY IF EXISTS "Dev: Allow all operations on utilisateurs_internes" ON public.utilisateurs_internes;

CREATE POLICY "Dev: Allow all operations on utilisateurs_internes"
ON public.utilisateurs_internes
FOR ALL
USING (true)
WITH CHECK (true);