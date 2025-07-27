-- Corriger l'assignation des rôles pour les utilisateurs existants
-- D'abord, récupérer les IDs des rôles
DO $$
DECLARE
    admin_role_id UUID;
    employee_role_id UUID;
    manager_role_id UUID;
BEGIN
    -- Récupérer les IDs des rôles
    SELECT id INTO admin_role_id FROM public.roles WHERE name = 'Administrateur';
    SELECT id INTO employee_role_id FROM public.roles WHERE name = 'Employé';
    SELECT id INTO manager_role_id FROM public.roles WHERE name = 'Manager';
    
    -- Assigner le rôle Administrateur aux utilisateurs admin
    INSERT INTO public.user_roles (user_id, role_id, assigned_by, is_active)
    SELECT ui.id, admin_role_id, ui.id, true
    FROM public.utilisateurs_internes ui
    WHERE ui.type_compte = 'admin' 
    AND ui.statut = 'actif'
    ON CONFLICT (user_id, role_id) DO UPDATE SET is_active = true;
    
    -- Assigner le rôle Employé aux utilisateurs employe
    INSERT INTO public.user_roles (user_id, role_id, assigned_by, is_active)
    SELECT ui.id, employee_role_id, ui.id, true
    FROM public.utilisateurs_internes ui
    WHERE ui.type_compte = 'employe'
    AND ui.statut = 'actif'
    ON CONFLICT (user_id, role_id) DO UPDATE SET is_active = true;
    
    -- Assigner le rôle Manager aux utilisateurs gestionnaire
    INSERT INTO public.user_roles (user_id, role_id, assigned_by, is_active)
    SELECT ui.id, manager_role_id, ui.id, true
    FROM public.utilisateurs_internes ui
    WHERE ui.type_compte = 'gestionnaire'
    AND ui.statut = 'actif'
    ON CONFLICT (user_id, role_id) DO UPDATE SET is_active = true;
END $$;

-- Assurer que tous les administrateurs ont toutes les permissions
SELECT public.assign_all_permissions_to_admin();