
-- Nettoyer toutes les politiques RLS problématiques sur utilisateurs_internes
DROP POLICY IF EXISTS "Utilisateurs internes peuvent modifier les utilisateurs" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Utilisateurs internes peuvent voir tous les utilisateurs" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Les utilisateurs internes peuvent voir les utilisateurs" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Seuls les utilisateurs internes peuvent voir les utilisateurs" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Seuls les administrateurs peuvent créer des utilisateurs" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Seuls les administrateurs peuvent modifier des utilisateurs" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Seuls les administrateurs peuvent supprimer des utilisateurs" ON public.utilisateurs_internes;

-- Supprimer les anciennes fonctions qui causent la récursion
DROP FUNCTION IF EXISTS public.get_user_role_for_rls();
DROP FUNCTION IF EXISTS public.is_admin_or_manager();

-- Créer une fonction security definer simple sans récursion
CREATE OR REPLACE FUNCTION public.check_user_is_internal()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users au
    WHERE au.id = auth.uid()
    AND au.email_confirmed_at IS NOT NULL
  );
$$;

-- Créer une fonction pour vérifier le rôle administrateur sans récursion
CREATE OR REPLACE FUNCTION public.check_user_is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND ur.is_active = true
    AND r.name IN ('Administrateur', 'administrateur')
  );
$$;

-- Désactiver temporairement RLS sur utilisateurs_internes
ALTER TABLE public.utilisateurs_internes DISABLE ROW LEVEL SECURITY;

-- Réactiver RLS avec des politiques simples
ALTER TABLE public.utilisateurs_internes ENABLE ROW LEVEL SECURITY;

-- Politique très simple pour la lecture - accessible à tous les utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to read utilisateurs_internes" 
ON public.utilisateurs_internes 
FOR SELECT 
TO authenticated
USING (true);

-- Politique simple pour la création - accessible à tous les utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to create utilisateurs_internes" 
ON public.utilisateurs_internes 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Politique simple pour la modification - accessible à tous les utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to update utilisateurs_internes" 
ON public.utilisateurs_internes 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- Politique simple pour la suppression - accessible à tous les utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to delete utilisateurs_internes" 
ON public.utilisateurs_internes 
FOR DELETE 
TO authenticated
USING (true);

-- Vérifier que les autres tables ont des politiques simples aussi
-- Table roles_utilisateurs
ALTER TABLE public.roles_utilisateurs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles_utilisateurs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read roles_utilisateurs" 
ON public.roles_utilisateurs 
FOR SELECT 
TO authenticated
USING (true);

-- Table roles (unifiée)
ALTER TABLE public.roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read unified roles" 
ON public.roles 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to manage unified roles" 
ON public.roles 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Table user_roles
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to manage user_roles" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Forcer le rechargement du cache PostgREST
NOTIFY pgrst, 'reload schema';
