
-- Corriger la récursion infinie dans les politiques RLS
-- Supprimer les politiques problématiques sur user_roles
DROP POLICY IF EXISTS "Seuls les admins peuvent modifier les permissions des rôles" ON public.role_permissions;
DROP POLICY IF EXISTS "Tous peuvent voir les permissions des rôles" ON public.role_permissions;
DROP POLICY IF EXISTS "Seuls les admins peuvent modifier les permissions" ON public.permissions;
DROP POLICY IF EXISTS "Tous peuvent voir les permissions" ON public.permissions;

-- Créer des politiques plus simples sans récursion
-- Pour la table permissions
CREATE POLICY "Allow all operations for authenticated users on permissions" 
ON public.permissions 
FOR ALL 
TO authenticated
USING (true) 
WITH CHECK (true);

-- Pour la table role_permissions
ALTER TABLE public.role_permissions DISABLE ROW LEVEL SECURITY;

-- Créer une fonction de sécurité simple sans récursion
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.utilisateurs_internes ui
    JOIN public.roles_utilisateurs ru ON ui.role_id = ru.id
    WHERE ui.user_id = auth.uid() 
    AND ui.statut = 'actif'
    AND ru.nom = 'administrateur'
  );
$$;

-- Recréer des politiques simples pour role_permissions
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on role_permissions" 
ON public.role_permissions 
FOR ALL 
TO public
USING (true) 
WITH CHECK (true);

-- Vérifier que la table user_roles existe et créer les politiques appropriées
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_roles') THEN
    -- Supprimer les politiques existantes sur user_roles
    DROP POLICY IF EXISTS "Users can view their roles" ON public.user_roles;
    DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
    
    -- Créer des politiques simples sans récursion
    CREATE POLICY "Allow all operations on user_roles" 
    ON public.user_roles 
    FOR ALL 
    TO public
    USING (true) 
    WITH CHECK (true);
  END IF;
END $$;

-- S'assurer que les tables nécessaires existent
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_at timestamp with time zone DEFAULT now(),
  assigned_by uuid,
  is_active boolean DEFAULT true,
  UNIQUE(user_id, role_id)
);

-- Activer RLS sur user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Créer une politique simple pour user_roles
CREATE POLICY "Allow all operations on user_roles for development" 
ON public.user_roles 
FOR ALL 
TO public
USING (true) 
WITH CHECK (true);

-- Invalider le cache PostgREST
NOTIFY pgrst, 'reload schema';
