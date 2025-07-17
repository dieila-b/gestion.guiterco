
-- Supprimer les politiques RLS restrictives existantes sur la table roles
DROP POLICY IF EXISTS "Allow read access to roles for authenticated users" ON public.roles;
DROP POLICY IF EXISTS "Allow all operations on roles for authenticated users" ON public.roles;

-- Désactiver temporairement RLS pour nettoyer
ALTER TABLE public.roles DISABLE ROW LEVEL SECURITY;

-- Réactiver RLS avec des politiques plus permissives
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture des rôles à tous les utilisateurs authentifiés
CREATE POLICY "Authenticated users can view roles" 
ON public.roles 
FOR SELECT 
TO authenticated
USING (true);

-- Politique pour permettre la création de rôles à tous les utilisateurs authentifiés
CREATE POLICY "Authenticated users can create roles" 
ON public.roles 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Politique pour permettre la modification des rôles (sauf les rôles système)
CREATE POLICY "Authenticated users can update non-system roles" 
ON public.roles 
FOR UPDATE 
TO authenticated
USING (NOT is_system OR is_system IS NULL)
WITH CHECK (NOT is_system OR is_system IS NULL);

-- Politique pour permettre la suppression des rôles (sauf les rôles système)
CREATE POLICY "Authenticated users can delete non-system roles" 
ON public.roles 
FOR DELETE 
TO authenticated
USING (NOT is_system OR is_system IS NULL);

-- Invalider le cache PostgREST pour appliquer les changements
NOTIFY pgrst, 'reload schema';
