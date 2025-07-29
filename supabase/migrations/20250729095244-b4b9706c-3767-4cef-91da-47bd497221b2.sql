-- Correction urgente : Problème avec auth.uid() dans les fonctions RLS
-- Il faut créer une fonction de test et diagnostiquer le problème

-- 1. Fonction de diagnostic pour tester auth.uid()
CREATE OR REPLACE FUNCTION public.debug_auth_context()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT json_build_object(
        'auth_uid', auth.uid(),
        'auth_role', auth.role(),
        'current_user', current_user,
        'session_user', session_user
    );
$$;

-- 2. Corriger la fonction user_has_permission avec plus de debugging
CREATE OR REPLACE FUNCTION public.user_has_permission(
    p_menu text,
    p_submenu text DEFAULT NULL,
    p_action text DEFAULT 'read'
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    user_auth_id UUID;
    permission_exists BOOLEAN := FALSE;
BEGIN
    -- Récupérer l'ID utilisateur authentifié
    user_auth_id := auth.uid();
    
    -- Si pas d'utilisateur authentifié, retourner false
    IF user_auth_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Vérifier la permission
    SELECT EXISTS (
        SELECT 1 
        FROM public.vue_permissions_utilisateurs
        WHERE user_id = user_auth_id
        AND menu = p_menu
        AND (p_submenu IS NULL OR submenu = p_submenu)
        AND action = p_action
        AND can_access = true
    ) INTO permission_exists;
    
    RETURN permission_exists;
END;
$$;

-- 3. Fonction alternative qui utilise directement les tables
CREATE OR REPLACE FUNCTION public.user_has_permission_direct(
    p_menu text,
    p_submenu text DEFAULT NULL,
    p_action text DEFAULT 'read'
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    user_auth_id UUID;
    permission_exists BOOLEAN := FALSE;
BEGIN
    user_auth_id := auth.uid();
    
    IF user_auth_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Vérification directe sur les tables
    SELECT EXISTS (
        SELECT 1 
        FROM public.utilisateurs_internes ui
        JOIN public.roles r ON ui.role_id = r.id
        JOIN public.role_permissions rp ON r.id = rp.role_id
        JOIN public.permissions p ON rp.permission_id = p.id
        WHERE ui.user_id = user_auth_id
        AND ui.statut = 'actif'
        AND p.menu = p_menu
        AND (p_submenu IS NULL OR p.submenu = p_submenu)
        AND p.action = p_action
        AND rp.can_access = true
    ) INTO permission_exists;
    
    RETURN permission_exists;
END;
$$;

-- 4. Grant des permissions
GRANT EXECUTE ON FUNCTION public.debug_auth_context() TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_permission_direct(text, text, text) TO authenticated;