-- Supprimer toutes les politiques RLS existantes sur roles_permissions
DROP POLICY IF EXISTS "Authenticated users can view role permissions" ON public.roles_permissions;
DROP POLICY IF EXISTS "Authenticated users can manage role permissions" ON public.roles_permissions;

-- Désactiver temporairement RLS pour permettre la gestion des permissions
-- (Solution temporaire pour le développement)
ALTER TABLE public.roles_permissions DISABLE ROW LEVEL SECURITY;

-- Ou créer une politique plus simple qui permet tout pour les utilisateurs authentifiés
-- ALTER TABLE public.roles_permissions ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all operations for authenticated users" 
-- ON public.roles_permissions 
-- FOR ALL 
-- USING (true) 
-- WITH CHECK (true);