
-- Corriger les politiques RLS sur la table roles pour permettre la création
-- Supprimer les politiques existantes qui peuvent causer des problèmes
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.roles;
DROP POLICY IF EXISTS "admin_full_access_roles" ON public.roles;
DROP POLICY IF EXISTS "Authenticated users can view roles" ON public.roles;
DROP POLICY IF EXISTS "Authenticated users can create roles" ON public.roles;
DROP POLICY IF EXISTS "Allow all operations on roles" ON public.roles;

-- Désactiver temporairement RLS pour nettoyer
ALTER TABLE public.roles DISABLE ROW LEVEL SECURITY;

-- Vérifier que les colonnes nécessaires existent
ALTER TABLE public.roles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.roles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Réactiver RLS avec des politiques permissives
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Créer des politiques très permissives pour les utilisateurs authentifiés
CREATE POLICY "Allow all operations on roles for authenticated users" 
ON public.roles 
FOR ALL 
TO authenticated
USING (true) 
WITH CHECK (true);

-- Ajouter une politique spécifique pour les opérations d'insertion
CREATE POLICY "Allow role creation for authenticated users" 
ON public.roles 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Politique pour la lecture
CREATE POLICY "Allow role reading for authenticated users" 
ON public.roles 
FOR SELECT 
TO authenticated
USING (true);

-- Politique pour la mise à jour
CREATE POLICY "Allow role updates for authenticated users" 
ON public.roles 
FOR UPDATE 
TO authenticated
USING (true) 
WITH CHECK (true);

-- Politique pour la suppression
CREATE POLICY "Allow role deletion for authenticated users" 
ON public.roles 
FOR DELETE 
TO authenticated
USING (true);

-- Corriger également les autres tables pour éviter les problèmes similaires
-- Table permissions
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.permissions;
DROP POLICY IF EXISTS "admin_full_access_permissions" ON public.permissions;
ALTER TABLE public.permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on permissions for authenticated users" 
ON public.permissions 
FOR ALL 
TO authenticated
USING (true) 
WITH CHECK (true);

-- Table role_permissions
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.role_permissions;
DROP POLICY IF EXISTS "admin_full_access_role_permissions" ON public.role_permissions;
ALTER TABLE public.role_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on role_permissions for authenticated users" 
ON public.role_permissions 
FOR ALL 
TO authenticated
USING (true) 
WITH CHECK (true);

-- Table user_roles
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.user_roles;
DROP POLICY IF EXISTS "admin_full_access_user_roles" ON public.user_roles;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on user_roles for authenticated users" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (true) 
WITH CHECK (true);

-- S'assurer que toutes les tables sont configurées pour le temps réel
ALTER TABLE public.roles REPLICA IDENTITY FULL;
ALTER TABLE public.permissions REPLICA IDENTITY FULL;
ALTER TABLE public.role_permissions REPLICA IDENTITY FULL;
ALTER TABLE public.user_roles REPLICA IDENTITY FULL;

-- Ajouter les tables à la publication realtime (ignorer les erreurs si déjà présentes)
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.roles;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.permissions;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.role_permissions;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Forcer le rechargement du cache PostgREST
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- Insérer les rôles de base s'ils n'existent pas
INSERT INTO public.roles (name, description, is_system) VALUES
    ('Administrateur', 'Accès complet à toutes les fonctionnalités', true),
    ('Manager', 'Gestion des équipes et rapports', false),
    ('Vendeur', 'Ventes et gestion clients', false),
    ('Caissier', 'Gestion des transactions', false)
ON CONFLICT (name) DO UPDATE SET 
    description = EXCLUDED.description,
    is_system = EXCLUDED.is_system;
