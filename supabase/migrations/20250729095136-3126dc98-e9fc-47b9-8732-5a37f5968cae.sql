-- Correction critique : Recréer la vue vue_permissions_utilisateurs et corriger la fonction user_has_permission

-- 1. Supprimer et recréer la vue vue_permissions_utilisateurs
DROP VIEW IF EXISTS public.vue_permissions_utilisateurs;

CREATE OR REPLACE VIEW public.vue_permissions_utilisateurs AS
SELECT 
    ui.user_id,
    ui.id as internal_user_id,
    ui.email,
    ui.prenom,
    ui.nom,
    r.name as role_name,
    p.menu,
    p.submenu,
    p.action,
    rp.can_access
FROM public.utilisateurs_internes ui
JOIN public.roles r ON ui.role_id = r.id
JOIN public.role_permissions rp ON r.id = rp.role_id
JOIN public.permissions p ON rp.permission_id = p.id
WHERE ui.statut = 'actif';

-- 2. Créer/corriger la fonction user_has_permission pour qu'elle marche avec auth.uid()
CREATE OR REPLACE FUNCTION public.user_has_permission(
    p_menu text,
    p_submenu text DEFAULT NULL,
    p_action text DEFAULT 'read'
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.vue_permissions_utilisateurs
        WHERE user_id = auth.uid()
        AND menu = p_menu
        AND (p_submenu IS NULL OR submenu = p_submenu)
        AND action = p_action
        AND can_access = true
    );
$$;

-- 3. Corriger les fonctions RLS existantes pour qu'elles utilisent le bon user_id
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

-- 4. Grant des permissions nécessaires
GRANT SELECT ON public.vue_permissions_utilisateurs TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_permission(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_internal_user() TO authenticated;