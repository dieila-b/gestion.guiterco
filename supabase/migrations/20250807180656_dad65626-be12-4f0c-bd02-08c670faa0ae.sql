
-- Mise à jour de la table roles pour inclure les rôles de base
INSERT INTO public.roles (name, description, is_system) VALUES
('Administrateur', 'Accès complet à toutes les fonctionnalités', true),
('Caissier', 'Accès à la caisse et aux ventes comptoir', true),
('Manager', 'Gestion des ventes et du stock', true),
('Vendeur', 'Accès aux ventes et consultation du stock', true)
ON CONFLICT (name) DO UPDATE SET 
  description = EXCLUDED.description,
  is_system = EXCLUDED.is_system;

-- Vérifier et corriger la structure de la table utilisateurs_internes
ALTER TABLE public.utilisateurs_internes 
ADD COLUMN IF NOT EXISTS role_id uuid REFERENCES public.roles(id);

-- Créer un index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_utilisateurs_internes_role_id ON public.utilisateurs_internes(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON public.role_permissions(role_id);

-- Fonction pour vérifier si un utilisateur est admin
CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.utilisateurs_internes ui
    JOIN public.roles r ON ui.role_id = r.id
    WHERE ui.user_id = auth.uid()
    AND r.name = 'Administrateur'
    AND ui.statut = 'actif'
  );
$$;

-- Fonction RPC pour récupérer les permissions utilisateur
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_uuid uuid)
RETURNS TABLE(menu text, submenu text, action text, can_access boolean)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    p.menu,
    p.submenu,
    p.action,
    rp.can_access
  FROM public.utilisateurs_internes ui
  JOIN public.roles r ON ui.role_id = r.id
  JOIN public.role_permissions rp ON r.id = rp.role_id
  JOIN public.permissions p ON rp.permission_id = p.id
  WHERE ui.user_id = user_uuid
  AND ui.statut = 'actif'
  AND rp.can_access = true;
$$;

-- Permissions de base pour tous les rôles
INSERT INTO public.permissions (menu, submenu, action, description) VALUES
('Dashboard', NULL, 'read', 'Accès au tableau de bord'),
('Catalogue', NULL, 'read', 'Consultation du catalogue'),
('Catalogue', NULL, 'write', 'Modification du catalogue'),
('Catalogue', NULL, 'delete', 'Suppression d''articles'),
('Stock', 'Entrepôts', 'read', 'Consultation stock entrepôts'),
('Stock', 'Entrepôts', 'write', 'Modification stock entrepôts'),
('Stock', 'PDV', 'read', 'Consultation stock PDV'),
('Stock', 'PDV', 'write', 'Modification stock PDV'),
('Ventes', 'Factures', 'read', 'Consultation factures'),
('Ventes', 'Factures', 'write', 'Création/modification factures'),
('Ventes', 'Précommandes', 'read', 'Consultation précommandes'),
('Ventes', 'Précommandes', 'write', 'Création/modification précommandes'),
('Clients', NULL, 'read', 'Consultation clients'),
('Clients', NULL, 'write', 'Modification clients'),
('Caisse', 'Opérations', 'read', 'Consultation opérations caisse'),
('Caisse', 'Opérations', 'write', 'Opérations de caisse'),
('Rapports', 'Ventes', 'read', 'Consultation rapports ventes'),
('Rapports', 'Marges', 'read', 'Consultation rapports marges'),
('Paramètres', 'Rôles et permissions', 'read', 'Consultation permissions'),
('Paramètres', 'Rôles et permissions', 'write', 'Gestion permissions')
ON CONFLICT (menu, COALESCE(submenu, ''), action) DO NOTHING;

-- Attribution des permissions aux rôles
DO $$
DECLARE
    admin_id uuid;
    caissier_id uuid;
    manager_id uuid;
    vendeur_id uuid;
    perm_id uuid;
BEGIN
    -- Récupérer les IDs des rôles
    SELECT id INTO admin_id FROM public.roles WHERE name = 'Administrateur';
    SELECT id INTO caissier_id FROM public.roles WHERE name = 'Caissier';
    SELECT id INTO manager_id FROM public.roles WHERE name = 'Manager';
    SELECT id INTO vendeur_id FROM public.roles WHERE name = 'Vendeur';
    
    -- Administrateur : toutes les permissions
    FOR perm_id IN SELECT id FROM public.permissions LOOP
        INSERT INTO public.role_permissions (role_id, permission_id, can_access)
        VALUES (admin_id, perm_id, true)
        ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;
    END LOOP;
    
    -- Caissier : caisse et ventes
    INSERT INTO public.role_permissions (role_id, permission_id, can_access)
    SELECT caissier_id, id, true FROM public.permissions 
    WHERE (menu = 'Dashboard' AND action = 'read')
       OR (menu = 'Catalogue' AND action = 'read')
       OR (menu = 'Ventes' AND action IN ('read', 'write'))
       OR (menu = 'Clients' AND action = 'read')
       OR (menu = 'Caisse' AND action IN ('read', 'write'))
    ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;
    
    -- Manager : gestion ventes et stock
    INSERT INTO public.role_permissions (role_id, permission_id, can_access)
    SELECT manager_id, id, true FROM public.permissions 
    WHERE (menu = 'Dashboard' AND action = 'read')
       OR (menu = 'Catalogue' AND action IN ('read', 'write'))
       OR (menu = 'Stock' AND action IN ('read', 'write'))
       OR (menu = 'Ventes' AND action IN ('read', 'write'))
       OR (menu = 'Clients' AND action IN ('read', 'write'))
       OR (menu = 'Rapports' AND action = 'read')
    ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;
    
    -- Vendeur : ventes et consultation stock
    INSERT INTO public.role_permissions (role_id, permission_id, can_access)
    SELECT vendeur_id, id, true FROM public.permissions 
    WHERE (menu = 'Dashboard' AND action = 'read')
       OR (menu = 'Catalogue' AND action = 'read')
       OR (menu = 'Stock' AND action = 'read')
       OR (menu = 'Ventes' AND action IN ('read', 'write'))
       OR (menu = 'Clients' AND action = 'read')
    ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;
END $$;
