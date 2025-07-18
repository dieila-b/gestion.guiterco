
-- Corriger les politiques RLS problématiques sur user_roles
-- D'abord supprimer toutes les politiques existantes qui causent la récursion
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow all operations on user_roles for authenticated users" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their roles" ON public.user_roles;

-- Créer une fonction security definer pour vérifier les permissions administrateur
-- sans causer de récursion RLS
CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.utilisateurs_internes ui
    JOIN public.roles_utilisateurs ru ON ui.role_id = ru.id
    WHERE ui.user_id = auth.uid() 
    AND ui.statut = 'actif'
    AND ru.nom IN ('administrateur', 'manager')
  );
$$;

-- Créer des politiques RLS simples et sûres pour user_roles
-- Permettre aux utilisateurs de voir leurs propres rôles
CREATE POLICY "Users can view their own user roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Permettre aux admins et managers de voir tous les rôles d'utilisateurs
CREATE POLICY "Admins can view all user roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (public.is_admin_or_manager());

-- Permettre aux admins et managers de créer des assignations de rôles
CREATE POLICY "Admins can create user roles" 
ON public.user_roles 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin_or_manager());

-- Permettre aux admins et managers de modifier les assignations de rôles
CREATE POLICY "Admins can update user roles" 
ON public.user_roles 
FOR UPDATE 
TO authenticated
USING (public.is_admin_or_manager())
WITH CHECK (public.is_admin_or_manager());

-- Permettre aux admins et managers de supprimer des assignations de rôles
CREATE POLICY "Admins can delete user roles" 
ON public.user_roles 
FOR DELETE 
TO authenticated
USING (public.is_admin_or_manager());

-- Vérifier que la table user_roles existe et a la bonne structure
-- Si elle n'existe pas, la créer
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role_id uuid REFERENCES public.roles(id) ON DELETE CASCADE NOT NULL,
  assigned_at timestamp with time zone DEFAULT now(),
  assigned_by uuid REFERENCES auth.users(id),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, role_id)
);

-- S'assurer que RLS est activé sur user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Créer un trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_user_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_roles_updated_at ON public.user_roles;
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE PROCEDURE public.update_user_roles_updated_at();

-- Forcer le rechargement du cache PostgREST
NOTIFY pgrst, 'reload schema';
