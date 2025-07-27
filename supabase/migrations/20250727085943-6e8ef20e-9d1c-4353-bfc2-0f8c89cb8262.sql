-- Corriger la table user_roles pour référencer utilisateurs_internes
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- Recréer la table user_roles avec la bonne référence
CREATE TABLE public.user_roles (
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
        JOIN public.user_roles ur ON ui.id = ur.user_id
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ui.id = auth.uid() AND r.name = 'Administrateur' AND ur.is_active = true
    )
);

-- Assigner les rôles aux utilisateurs existants
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
    AND ui.statut = 'actif';
    
    -- Assigner le rôle Employé aux utilisateurs employe
    INSERT INTO public.user_roles (user_id, role_id, assigned_by, is_active)
    SELECT ui.id, employee_role_id, ui.id, true
    FROM public.utilisateurs_internes ui
    WHERE ui.type_compte = 'employe'
    AND ui.statut = 'actif';
    
    -- Assigner le rôle Manager aux utilisateurs gestionnaire
    INSERT INTO public.user_roles (user_id, role_id, assigned_by, is_active)
    SELECT ui.id, manager_role_id, ui.id, true
    FROM public.utilisateurs_internes ui
    WHERE ui.type_compte = 'gestionnaire'
    AND ui.statut = 'actif';
END $$;