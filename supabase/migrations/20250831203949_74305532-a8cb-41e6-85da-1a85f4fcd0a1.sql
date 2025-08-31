-- =============================================
-- CORRECTION ET SYNCHRONISATION DU SYSTÈME DE PERMISSIONS
-- =============================================

-- 1. S'assurer que toutes les contraintes sont en place
ALTER TABLE public.utilisateurs_internes 
ADD CONSTRAINT IF NOT EXISTS fk_utilisateurs_internes_role_id 
FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE SET NULL;

ALTER TABLE public.role_permissions 
ADD CONSTRAINT IF NOT EXISTS fk_role_permissions_role_id 
FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;

ALTER TABLE public.role_permissions 
ADD CONSTRAINT IF NOT EXISTS fk_role_permissions_permission_id 
FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;

-- 2. Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON public.role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_utilisateurs_internes_user_id ON public.utilisateurs_internes(user_id);
CREATE INDEX IF NOT EXISTS idx_utilisateurs_internes_role_id ON public.utilisateurs_internes(role_id);

-- 3. Recréer la vue pour s'assurer qu'elle est optimale
DROP VIEW IF EXISTS public.vue_permissions_utilisateurs;

CREATE VIEW public.vue_permissions_utilisateurs AS
SELECT DISTINCT 
    ui.user_id,
    p.menu,
    p.submenu,
    p.action,
    rp.can_access
FROM public.utilisateurs_internes ui
INNER JOIN public.roles r ON ui.role_id = r.id
INNER JOIN public.role_permissions rp ON r.id = rp.role_id
INNER JOIN public.permissions p ON rp.permission_id = p.id
WHERE ui.statut = 'actif'
  AND rp.can_access = true;

-- 4. Créer une fonction pour vérifier les permissions d'un utilisateur
CREATE OR REPLACE FUNCTION public.check_user_permission_detailed(
    p_user_id uuid,
    p_menu text,
    p_submenu text DEFAULT NULL,
    p_action text DEFAULT 'read'
)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.vue_permissions_utilisateurs vpu
        WHERE vpu.user_id = p_user_id
        AND vpu.menu = p_menu
        AND (p_submenu IS NULL OR vpu.submenu = p_submenu)
        AND vpu.action = p_action
        AND vpu.can_access = true
    );
$$;

-- 5. Créer une fonction pour obtenir toutes les permissions d'un utilisateur
CREATE OR REPLACE FUNCTION public.get_user_all_permissions(p_user_id uuid)
RETURNS TABLE(
    menu text,
    submenu text,
    action text,
    can_access boolean
)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
    SELECT 
        vpu.menu,
        vpu.submenu,
        vpu.action,
        vpu.can_access
    FROM public.vue_permissions_utilisateurs vpu
    WHERE vpu.user_id = p_user_id
    ORDER BY vpu.menu, vpu.submenu, vpu.action;
$$;

-- 6. Mettre à jour la fonction existante pour plus de précision
CREATE OR REPLACE FUNCTION public.check_user_permission_strict(
    p_menu text, 
    p_submenu text DEFAULT NULL::text, 
    p_action text DEFAULT 'read'::text
)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM utilisateurs_internes ui
        INNER JOIN roles r ON ui.role_id = r.id
        INNER JOIN role_permissions rp ON r.id = rp.role_id
        INNER JOIN permissions p ON rp.permission_id = p.id
        WHERE ui.user_id = auth.uid()
        AND ui.statut = 'actif'
        AND p.menu = p_menu
        AND (p_submenu IS NULL OR p.submenu = p_submenu)
        AND p.action = p_action
        AND rp.can_access = true
    );
$$;

-- 7. Créer des politiques RLS plus précises pour les permissions
DROP POLICY IF EXISTS "Authenticated users can read permissions" ON public.permissions;
DROP POLICY IF EXISTS "Authenticated users can write permissions" ON public.permissions;

CREATE POLICY "Users can read permissions"
ON public.permissions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage permissions"
ON public.permissions FOR ALL
TO authenticated
USING (check_user_permission_strict('Paramètres', 'Rôles et permissions', 'write'))
WITH CHECK (check_user_permission_strict('Paramètres', 'Rôles et permissions', 'write'));

-- 8. Créer des politiques RLS pour role_permissions
DROP POLICY IF EXISTS "ADMIN_ONLY_permissions" ON public.role_permissions;

CREATE POLICY "Users can read role_permissions"
ON public.role_permissions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage role_permissions"
ON public.role_permissions FOR ALL
TO authenticated
USING (check_user_permission_strict('Paramètres', 'Rôles et permissions', 'write'))
WITH CHECK (check_user_permission_strict('Paramètres', 'Rôles et permissions', 'write'));

-- 9. Assurer que tous les rôles ont au moins une permission de base
INSERT INTO public.role_permissions (role_id, permission_id, can_access)
SELECT 
    r.id as role_id,
    p.id as permission_id,
    true as can_access
FROM public.roles r
CROSS JOIN public.permissions p
WHERE p.menu = 'Dashboard' AND p.action = 'read'
AND NOT EXISTS (
    SELECT 1 FROM public.role_permissions rp 
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 10. Fonction de diagnostic pour déboguer les permissions
CREATE OR REPLACE FUNCTION public.debug_user_permissions(p_user_id uuid DEFAULT auth.uid())
RETURNS TABLE(
    user_email text,
    role_name text,
    menu text,
    submenu text,
    action text,
    has_permission boolean
)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
    SELECT 
        ui.email,
        r.name as role_name,
        vpu.menu,
        vpu.submenu,
        vpu.action,
        vpu.can_access as has_permission
    FROM public.utilisateurs_internes ui
    LEFT JOIN public.roles r ON ui.role_id = r.id
    LEFT JOIN public.vue_permissions_utilisateurs vpu ON ui.user_id = vpu.user_id
    WHERE ui.user_id = p_user_id
    ORDER BY vpu.menu, vpu.submenu, vpu.action;
$$;