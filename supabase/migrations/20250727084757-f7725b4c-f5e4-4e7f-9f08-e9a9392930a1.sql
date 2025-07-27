
-- Créer la table user_roles pour lier les utilisateurs internes aux rôles
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.utilisateurs_internes(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    assigned_by UUID REFERENCES public.utilisateurs_internes(id),
    is_active BOOLEAN NOT NULL DEFAULT true,
    UNIQUE(user_id, role_id)
);

-- Activer RLS sur user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture des rôles utilisateur
CREATE POLICY "Users can view user roles" ON public.user_roles
FOR SELECT USING (true);

-- Politique pour permettre la gestion des rôles utilisateur (admin seulement)
CREATE POLICY "Admins can manage user roles" ON public.user_roles
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.utilisateurs_internes ui
        JOIN public.roles r ON ui.role_id = r.id
        WHERE ui.id = auth.uid() AND r.name = 'Administrateur'
    )
);

-- Créer une vue pour les permissions utilisateur
CREATE OR REPLACE VIEW public.vue_permissions_utilisateurs AS
SELECT 
    ui.id as user_id,
    ui.email,
    ui.prenom,
    ui.nom,
    p.id as permission_id,
    p.menu,
    p.submenu,
    p.action,
    p.description,
    rp.can_access,
    r.name as role_name
FROM public.utilisateurs_internes ui
LEFT JOIN public.user_roles ur ON ui.id = ur.user_id AND ur.is_active = true
LEFT JOIN public.roles r ON ur.role_id = r.id
LEFT JOIN public.role_permissions rp ON r.id = rp.role_id
LEFT JOIN public.permissions p ON rp.permission_id = p.id
WHERE ui.statut = 'actif' AND ui.type_compte = 'interne';

-- Fonction pour vérifier les permissions utilisateur
CREATE OR REPLACE FUNCTION public.user_has_permission(
    p_menu TEXT,
    p_submenu TEXT DEFAULT NULL,
    p_action TEXT DEFAULT 'read'
) RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.vue_permissions_utilisateurs
        WHERE user_id = auth.uid()
        AND menu = p_menu
        AND (p_submenu IS NULL OR submenu = p_submenu)
        AND action = p_action
        AND can_access = true
    );
$$;

-- Fonction pour assigner un rôle à un utilisateur
CREATE OR REPLACE FUNCTION public.assign_user_role(
    p_user_id UUID,
    p_role_id UUID
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, role_id, assigned_by)
    VALUES (p_user_id, p_role_id, auth.uid())
    ON CONFLICT (user_id, role_id) DO UPDATE SET
        is_active = true,
        assigned_at = now(),
        assigned_by = auth.uid();
END;
$$;

-- Fonction pour révoquer un rôle d'un utilisateur
CREATE OR REPLACE FUNCTION public.revoke_user_role(
    p_user_id UUID,
    p_role_id UUID
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.user_roles 
    SET is_active = false
    WHERE user_id = p_user_id AND role_id = p_role_id;
END;
$$;

-- Assigner automatiquement le rôle Administrateur aux utilisateurs admin existants
INSERT INTO public.user_roles (user_id, role_id, assigned_by)
SELECT 
    ui.id,
    r.id,
    ui.id
FROM public.utilisateurs_internes ui
CROSS JOIN public.roles r
WHERE ui.type_compte = 'admin' 
AND r.name = 'Administrateur'
AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = ui.id AND ur.role_id = r.id
);

-- Assigner automatiquement le rôle Employé aux utilisateurs employés existants
INSERT INTO public.user_roles (user_id, role_id, assigned_by)
SELECT 
    ui.id,
    r.id,
    ui.id
FROM public.utilisateurs_internes ui
CROSS JOIN public.roles r
WHERE ui.type_compte = 'employe' 
AND r.name = 'Employé'
AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = ui.id AND ur.role_id = r.id
);

-- Assigner automatiquement le rôle Manager aux utilisateurs gestionnaires existants
INSERT INTO public.user_roles (user_id, role_id, assigned_by)
SELECT 
    ui.id,
    r.id,
    ui.id
FROM public.utilisateurs_internes ui
CROSS JOIN public.roles r
WHERE ui.type_compte = 'gestionnaire' 
AND r.name = 'Manager'
AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = ui.id AND ur.role_id = r.id
);
