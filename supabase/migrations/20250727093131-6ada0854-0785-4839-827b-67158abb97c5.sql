-- Créer une approche simplifiée en utilisant directement la colonne role_id dans utilisateurs_internes
-- D'abord, ajouter une colonne role_id à utilisateurs_internes si elle n'existe pas
ALTER TABLE public.utilisateurs_internes 
ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES public.roles(id);

-- Assigner les rôles directement via la colonne role_id
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
    
    -- Assigner les rôles directement aux utilisateurs
    UPDATE public.utilisateurs_internes 
    SET role_id = admin_role_id
    WHERE type_compte = 'admin' AND statut = 'actif';
    
    UPDATE public.utilisateurs_internes 
    SET role_id = employee_role_id
    WHERE type_compte = 'employe' AND statut = 'actif';
    
    UPDATE public.utilisateurs_internes 
    SET role_id = manager_role_id
    WHERE type_compte = 'gestionnaire' AND statut = 'actif';
END $$;

-- Mettre à jour la vue permissions_utilisateurs pour utiliser role_id directement
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
LEFT JOIN public.roles r ON ui.role_id = r.id
LEFT JOIN public.role_permissions rp ON r.id = rp.role_id
LEFT JOIN public.permissions p ON rp.permission_id = p.id
WHERE ui.statut = 'actif' AND ui.type_compte = 'interne';