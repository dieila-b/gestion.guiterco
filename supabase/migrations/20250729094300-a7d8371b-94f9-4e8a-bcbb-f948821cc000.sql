-- Migration de correction : Politiques RLS sécurisées pour les tables existantes

-- 1. Fonction sécurisée pour vérifier les rôles administrateurs
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.utilisateurs_internes ui
    JOIN public.roles r ON ui.role_id = r.id
    WHERE ui.user_id = auth.uid()
      AND ui.statut = 'actif'
      AND r.name = 'Administrateur'
  );
$$;

-- 2. Fonction sécurisée pour vérifier si l'utilisateur est interne actif
CREATE OR REPLACE FUNCTION public.is_internal_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.utilisateurs_internes
    WHERE user_id = auth.uid()
      AND statut = 'actif'
  );
$$;

-- 3. Politiques RLS sécurisées pour utilisateurs_internes
DROP POLICY IF EXISTS "Utilisateurs peuvent voir leurs propres données" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Admins peuvent gérer tous les utilisateurs" ON public.utilisateurs_internes;

CREATE POLICY "Utilisateurs peuvent voir leurs données et admins tout"
ON public.utilisateurs_internes
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR public.is_admin()
);

CREATE POLICY "Seuls les admins peuvent insérer des utilisateurs"
ON public.utilisateurs_internes
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Utilisateurs peuvent modifier leurs données, admins tout"
ON public.utilisateurs_internes
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() OR public.is_admin()
);

CREATE POLICY "Seuls les admins peuvent supprimer des utilisateurs"
ON public.utilisateurs_internes
FOR DELETE
TO authenticated
USING (public.is_admin());

-- 4. Politiques pour les rôles (lecture pour utilisateurs internes, écriture pour admins)
DROP POLICY IF EXISTS "Utilisateurs internes peuvent lire les rôles" ON public.roles;
DROP POLICY IF EXISTS "Seuls les admins peuvent modifier les rôles" ON public.roles;

CREATE POLICY "Utilisateurs internes peuvent lire les rôles"
ON public.roles
FOR SELECT
TO authenticated
USING (public.is_internal_user());

CREATE POLICY "Seuls les admins peuvent modifier les rôles"
ON public.roles
FOR ALL
TO authenticated
USING (public.is_admin());

-- 5. Politiques pour les permissions
DROP POLICY IF EXISTS "Utilisateurs internes peuvent lire les permissions" ON public.permissions;
DROP POLICY IF EXISTS "Seuls les admins peuvent modifier les permissions" ON public.permissions;

CREATE POLICY "Utilisateurs internes peuvent lire les permissions"
ON public.permissions
FOR SELECT
TO authenticated
USING (public.is_internal_user());

CREATE POLICY "Seuls les admins peuvent modifier les permissions"
ON public.permissions
FOR ALL
TO authenticated
USING (public.is_admin());

-- 6. Politiques pour role_permissions
DROP POLICY IF EXISTS "Utilisateurs internes peuvent lire role_permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Seuls les admins peuvent modifier role_permissions" ON public.role_permissions;

CREATE POLICY "Utilisateurs internes peuvent lire role_permissions"
ON public.role_permissions
FOR SELECT
TO authenticated
USING (public.is_internal_user());

CREATE POLICY "Seuls les admins peuvent modifier role_permissions"
ON public.role_permissions
FOR ALL
TO authenticated
USING (public.is_admin());