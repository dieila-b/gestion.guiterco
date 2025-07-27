-- Créer le rôle Employé manquant
INSERT INTO public.roles (name, description, is_system, is_system_role)
VALUES ('Employé', 'Accès aux fonctionnalités de base', false, false)
ON CONFLICT (name) DO NOTHING;

-- Maintenant assigner les rôles correctement
DO $$
DECLARE
    admin_role_id UUID;
    employee_role_id UUID;
    manager_role_id UUID;
    vendeur_role_id UUID;
    caissier_role_id UUID;
BEGIN
    -- Récupérer les IDs des rôles
    SELECT id INTO admin_role_id FROM public.roles WHERE name = 'Administrateur';
    SELECT id INTO employee_role_id FROM public.roles WHERE name = 'Employé';
    SELECT id INTO manager_role_id FROM public.roles WHERE name = 'Manager';
    SELECT id INTO vendeur_role_id FROM public.roles WHERE name = 'Vendeur';
    SELECT id INTO caissier_role_id FROM public.roles WHERE name = 'Caissier';
    
    -- Nettoyer les anciennes assignations
    DELETE FROM public.user_roles;
    
    -- Assigner le rôle Administrateur aux utilisateurs admin
    INSERT INTO public.user_roles (user_id, role_id, assigned_by, is_active)
    SELECT ui.id, admin_role_id, ui.id, true
    FROM public.utilisateurs_internes ui
    WHERE ui.type_compte = 'admin' 
    AND ui.statut = 'actif'
    AND admin_role_id IS NOT NULL;
    
    -- Assigner le rôle Employé aux utilisateurs employe
    INSERT INTO public.user_roles (user_id, role_id, assigned_by, is_active)
    SELECT ui.id, employee_role_id, ui.id, true
    FROM public.utilisateurs_internes ui
    WHERE ui.type_compte = 'employe'
    AND ui.statut = 'actif'
    AND employee_role_id IS NOT NULL;
    
    -- Assigner le rôle Manager aux utilisateurs gestionnaire
    INSERT INTO public.user_roles (user_id, role_id, assigned_by, is_active)
    SELECT ui.id, manager_role_id, ui.id, true
    FROM public.utilisateurs_internes ui
    WHERE ui.type_compte = 'gestionnaire'
    AND ui.statut = 'actif'
    AND manager_role_id IS NOT NULL;
END $$;