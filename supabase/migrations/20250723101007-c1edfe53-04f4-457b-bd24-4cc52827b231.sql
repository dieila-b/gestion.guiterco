
-- Corriger les politiques RLS pour permettre la création d'utilisateurs internes
-- Supprimer les anciennes politiques restrictives
DROP POLICY IF EXISTS "Admins peuvent tout voir sur utilisateurs_internes" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Admins peuvent créer des utilisateurs_internes" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Admins peuvent modifier des utilisateurs_internes" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Admins peuvent supprimer des utilisateurs_internes" ON public.utilisateurs_internes;

-- Supprimer aussi les anciennes politiques permissives s'il y en a
DROP POLICY IF EXISTS "Utilisateurs authentifiés peuvent voir utilisateurs_internes" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Utilisateurs authentifiés peuvent créer utilisateurs_internes" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Utilisateurs authentifiés peuvent modifier utilisateurs_internes" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Utilisateurs authentifiés peuvent supprimer utilisateurs_internes" ON public.utilisateurs_internes;

-- Créer des politiques plus permissives pour permettre la gestion des utilisateurs internes
-- Permettre aux utilisateurs authentifiés de voir tous les utilisateurs internes
CREATE POLICY "Utilisateurs authentifiés peuvent voir tous les utilisateurs internes" 
ON public.utilisateurs_internes 
FOR SELECT 
TO authenticated 
USING (true);

-- Permettre aux utilisateurs authentifiés de créer des utilisateurs internes
CREATE POLICY "Utilisateurs authentifiés peuvent créer des utilisateurs internes" 
ON public.utilisateurs_internes 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Permettre aux utilisateurs authentifiés de modifier des utilisateurs internes
CREATE POLICY "Utilisateurs authentifiés peuvent modifier des utilisateurs internes" 
ON public.utilisateurs_internes 
FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

-- Permettre aux utilisateurs authentifiés de supprimer des utilisateurs internes
CREATE POLICY "Utilisateurs authentifiés peuvent supprimer des utilisateurs internes" 
ON public.utilisateurs_internes 
FOR DELETE 
TO authenticated 
USING (true);

-- Vérifier que RLS est bien activé sur la table
ALTER TABLE public.utilisateurs_internes ENABLE ROW LEVEL SECURITY;
