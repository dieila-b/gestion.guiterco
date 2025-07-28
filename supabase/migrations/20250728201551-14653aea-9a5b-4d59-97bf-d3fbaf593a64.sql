-- Corriger les politiques RLS pour le système de permissions (version corrigée)

-- 1. Supprimer la vue existante qui pose problème
DROP VIEW IF EXISTS public.vue_permissions_utilisateurs CASCADE;

-- 2. Activer RLS sur la table roles
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- 3. Supprimer les anciennes politiques restrictives et créer des nouvelles politiques permissives
DROP POLICY IF EXISTS "Permission-based roles read" ON public.roles;
DROP POLICY IF EXISTS "Permission-based roles write" ON public.roles;

CREATE POLICY "Authenticated users can manage roles" 
ON public.roles 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Corriger les politiques pour role_permissions
DROP POLICY IF EXISTS "Permission-based role_permissions read" ON public.role_permissions;
DROP POLICY IF EXISTS "Permission-based role_permissions write" ON public.role_permissions;

CREATE POLICY "Authenticated users can manage role_permissions" 
ON public.role_permissions 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Créer la table user_roles pour la gestion des utilisateurs
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, role_id)
);

-- Activer RLS sur user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage user_roles" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- 6. Recréer la vue permissions utilisateur
CREATE VIEW public.vue_permissions_utilisateurs AS
SELECT 
    ur.user_id,
    r.name as role_name,
    p.menu,
    p.submenu,
    p.action,
    rp.can_access
FROM public.user_roles ur
JOIN public.roles r ON ur.role_id = r.id
JOIN public.role_permissions rp ON r.id = rp.role_id
JOIN public.permissions p ON rp.permission_id = p.id
WHERE rp.can_access = true;

-- 7. Créer la fonction pour vérifier les permissions
CREATE OR REPLACE FUNCTION public.user_has_permission(
    p_menu TEXT,
    p_submenu TEXT DEFAULT NULL,
    p_action TEXT DEFAULT 'read'
) RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
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

-- 8. Trigger pour updated_at sur user_roles
CREATE OR REPLACE FUNCTION public.update_user_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_roles_updated_at ON public.user_roles;
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_roles_updated_at();