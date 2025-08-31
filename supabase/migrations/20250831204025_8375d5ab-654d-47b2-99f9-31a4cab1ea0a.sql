-- =============================================
-- CORRECTION ET SYNCHRONISATION DU SYSTÈME DE PERMISSIONS
-- =============================================

-- 1. S'assurer que toutes les contraintes sont en place (sans IF NOT EXISTS)
DO $$
BEGIN
    -- Ajouter les contraintes de clé étrangère si elles n'existent pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_utilisateurs_internes_role_id') THEN
        ALTER TABLE public.utilisateurs_internes 
        ADD CONSTRAINT fk_utilisateurs_internes_role_id 
        FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_role_permissions_role_id') THEN
        ALTER TABLE public.role_permissions 
        ADD CONSTRAINT fk_role_permissions_role_id 
        FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_role_permissions_permission_id') THEN
        ALTER TABLE public.role_permissions 
        ADD CONSTRAINT fk_role_permissions_permission_id 
        FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;
    END IF;
END
$$;

-- 2. Créer des index pour améliorer les performances
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