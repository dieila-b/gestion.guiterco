
-- Nettoyer complètement les politiques RLS problématiques
-- Supprimer toutes les politiques existantes sur les tables concernées
DROP POLICY IF EXISTS "Seuls les admins peuvent modifier les rôles" ON public.roles;
DROP POLICY IF EXISTS "Tous peuvent voir les rôles" ON public.roles;
DROP POLICY IF EXISTS "Allow all operations on user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow all operations on user_roles for development" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

-- Supprimer également les politiques sur role_permissions et permissions
DROP POLICY IF EXISTS "Allow all operations on role_permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on permissions" ON public.permissions;

-- Désactiver temporairement RLS sur toutes les tables concernées
ALTER TABLE public.roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Recréer des politiques très simples et sûres
-- Pour la table roles - permettre la lecture à tous les utilisateurs authentifiés
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to roles for authenticated users" 
ON public.roles 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Allow all operations on roles for authenticated users" 
ON public.roles 
FOR ALL 
TO authenticated
USING (true) 
WITH CHECK (true);

-- Pour la table permissions - permettre la lecture à tous
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on permissions for authenticated users" 
ON public.permissions 
FOR ALL 
TO authenticated
USING (true) 
WITH CHECK (true);

-- Pour la table role_permissions - permettre toutes les opérations
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on role_permissions for authenticated users" 
ON public.role_permissions 
FOR ALL 
TO authenticated
USING (true) 
WITH CHECK (true);

-- Pour la table user_roles - politiques simples basées sur auth.uid() UNIQUEMENT
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Allow all operations on user_roles for authenticated users" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (true) 
WITH CHECK (true);

-- Supprimer la fonction is_admin_user qui pourrait causer la récursion
DROP FUNCTION IF EXISTS public.is_admin_user();

-- Invalider le cache PostgREST
NOTIFY pgrst, 'reload schema';
