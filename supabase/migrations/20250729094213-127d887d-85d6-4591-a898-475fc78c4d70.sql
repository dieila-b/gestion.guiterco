-- Migration critique : Correction des politiques RLS et des permissions

-- 1. Activer RLS sur les tables manquantes (errors 89-91)
ALTER TABLE IF EXISTS public.zones_geographiques ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.depots_stockage ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.fournisseurs ENABLE ROW LEVEL SECURITY;

-- 2. Fonction sécurisée pour vérifier les rôles administrateurs
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

-- 3. Fonction sécurisée pour vérifier si l'utilisateur est interne actif
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

-- 4. Politiques RLS sécurisées pour utilisateurs_internes
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

-- 5. Politiques pour les rôles (lecture pour tous, écriture pour admins)
DROP POLICY IF EXISTS "Tous peuvent lire les rôles" ON public.roles;
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

-- 6. Politiques pour les permissions
DROP POLICY IF EXISTS "Tous peuvent lire les permissions" ON public.permissions;
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

-- 7. Politiques pour role_permissions
DROP POLICY IF EXISTS "Tous peuvent lire role_permissions" ON public.role_permissions;
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

-- 8. Politiques de base pour les nouvelles tables avec RLS
CREATE POLICY "Seuls utilisateurs internes accès zones géographiques"
ON public.zones_geographiques
FOR ALL
TO authenticated
USING (public.is_internal_user());

CREATE POLICY "Seuls utilisateurs internes accès dépôts stockage"
ON public.depots_stockage
FOR ALL
TO authenticated
USING (public.is_internal_user());

CREATE POLICY "Seuls utilisateurs internes accès fournisseurs"
ON public.fournisseurs
FOR ALL
TO authenticated
USING (public.is_internal_user());