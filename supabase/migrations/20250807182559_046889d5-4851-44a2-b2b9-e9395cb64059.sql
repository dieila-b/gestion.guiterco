
-- Synchronisation des tables principales du système de permissions

-- Table des rôles
INSERT INTO public.roles (name, description, is_system) VALUES
('Administrateur', 'Accès complet à toutes les fonctionnalités du système', true),
('Caissier', 'Accès limité à la caisse et aux ventes au comptoir', true),
('Manager', 'Gestion des ventes, stock et supervision d''équipe', true),
('Vendeur', 'Accès aux ventes et consultation du catalogue/stock', true)
ON CONFLICT (name) DO UPDATE SET 
  description = EXCLUDED.description,
  is_system = EXCLUDED.is_system;

-- Vérifier les contraintes FK sur utilisateurs_internes
ALTER TABLE public.utilisateurs_internes 
ADD COLUMN IF NOT EXISTS role_id uuid REFERENCES public.roles(id);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_utilisateurs_internes_role_id ON public.utilisateurs_internes(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_permissions_menu_action ON public.permissions(menu, action);

-- Permissions détaillées du système
INSERT INTO public.permissions (menu, submenu, action, description) VALUES
-- Dashboard
('Dashboard', NULL, 'read', 'Accès au tableau de bord principal'),

-- Catalogue
('Catalogue', NULL, 'read', 'Consultation du catalogue produits'),
('Catalogue', NULL, 'write', 'Création et modification d''articles'),
('Catalogue', NULL, 'delete', 'Suppression d''articles du catalogue'),

-- Stock
('Stock', 'Entrepôts', 'read', 'Consultation des stocks entrepôts'),
('Stock', 'Entrepôts', 'write', 'Modification des stocks entrepôts'),
('Stock', 'PDV', 'read', 'Consultation des stocks points de vente'),
('Stock', 'PDV', 'write', 'Modification des stocks points de vente'),
('Stock', 'Transferts', 'read', 'Consultation des transferts de stock'),
('Stock', 'Transferts', 'write', 'Création et modification de transferts'),

-- Achats
('Achats', 'Bons de commande', 'read', 'Consultation des bons de commande'),
('Achats', 'Bons de commande', 'write', 'Création et modification de bons de commande'),
('Achats', 'Bons de livraison', 'read', 'Consultation des bons de livraison'),
('Achats', 'Bons de livraison', 'write', 'Gestion des réceptions'),

-- Ventes
('Ventes', 'Factures', 'read', 'Consultation des factures de vente'),
('Ventes', 'Factures', 'write', 'Création et modification de factures'),
('Ventes', 'Précommandes', 'read', 'Consultation des précommandes'),
('Ventes', 'Précommandes', 'write', 'Gestion des précommandes'),
('Ventes', 'Devis', 'read', 'Consultation des devis'),
('Ventes', 'Devis', 'write', 'Création et modification de devis'),
('Ventes', 'Vente au Comptoir', 'read', 'Consultation ventes comptoir'),
('Ventes', 'Vente au Comptoir', 'write', 'Réalisation de ventes comptoir'),

-- Clients
('Clients', NULL, 'read', 'Consultation de la base clients'),
('Clients', NULL, 'write', 'Création et modification de clients'),
('Clients', NULL, 'delete', 'Suppression de clients'),

-- Caisse
('Caisse', 'Opérations', 'read', 'Consultation des opérations de caisse'),
('Caisse', 'Opérations', 'write', 'Réalisation d''opérations de caisse'),
('Caisse', 'Clôtures', 'read', 'Consultation des clôtures de caisse'),
('Caisse', 'Clôtures', 'write', 'Réalisation de clôtures de caisse'),

-- Rapports
('Rapports', 'Ventes', 'read', 'Accès aux rapports de ventes'),
('Rapports', 'Stock', 'read', 'Accès aux rapports de stock'),
('Rapports', 'Marges', 'read', 'Accès aux rapports de marges'),
('Rapports', 'Clients', 'read', 'Accès aux rapports clients'),

-- Paramètres
('Paramètres', 'Utilisateurs', 'read', 'Consultation des utilisateurs'),
('Paramètres', 'Utilisateurs', 'write', 'Gestion des utilisateurs'),
('Paramètres', 'Rôles et permissions', 'read', 'Consultation des permissions'),
('Paramètres', 'Rôles et permissions', 'write', 'Gestion des rôles et permissions'),
('Paramètres', 'Fournisseurs', 'read', 'Consultation des fournisseurs'),
('Paramètres', 'Fournisseurs', 'write', 'Gestion des fournisseurs')
ON CONFLICT (menu, COALESCE(submenu, ''), action) DO NOTHING;

-- Attribution des permissions par rôle
DO $$
DECLARE
    admin_id uuid;
    caissier_id uuid;
    manager_id uuid;
    vendeur_id uuid;
    perm_id uuid;
BEGIN
    -- Récupération des IDs des rôles
    SELECT id INTO admin_id FROM public.roles WHERE name = 'Administrateur';
    SELECT id INTO caissier_id FROM public.roles WHERE name = 'Caissier';
    SELECT id INTO manager_id FROM public.roles WHERE name = 'Manager';
    SELECT id INTO vendeur_id FROM public.roles WHERE name = 'Vendeur';
    
    -- ADMINISTRATEUR : Accès total
    FOR perm_id IN SELECT id FROM public.permissions LOOP
        INSERT INTO public.role_permissions (role_id, permission_id, can_access)
        VALUES (admin_id, perm_id, true)
        ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;
    END LOOP;
    
    -- CAISSIER : Caisse + Ventes comptoir + Clients
    INSERT INTO public.role_permissions (role_id, permission_id, can_access)
    SELECT caissier_id, id, true FROM public.permissions 
    WHERE (menu = 'Dashboard' AND action = 'read')
       OR (menu = 'Catalogue' AND action = 'read')
       OR (menu = 'Ventes' AND submenu = 'Vente au Comptoir')
       OR (menu = 'Ventes' AND submenu = 'Factures' AND action = 'write')
       OR (menu = 'Clients' AND action IN ('read', 'write'))
       OR (menu = 'Caisse' AND action IN ('read', 'write'))
    ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;
    
    -- MANAGER : Gestion ventes, stock, rapports
    INSERT INTO public.role_permissions (role_id, permission_id, can_access)
    SELECT manager_id, id, true FROM public.permissions 
    WHERE (menu = 'Dashboard' AND action = 'read')
       OR (menu = 'Catalogue' AND action IN ('read', 'write'))
       OR (menu = 'Stock' AND action IN ('read', 'write'))
       OR (menu = 'Achats' AND action = 'read')
       OR (menu = 'Ventes' AND action IN ('read', 'write'))
       OR (menu = 'Clients' AND action IN ('read', 'write'))
       OR (menu = 'Caisse' AND action = 'read')
       OR (menu = 'Rapports' AND action = 'read')
    ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;
    
    -- VENDEUR : Ventes + consultation stock/catalogue
    INSERT INTO public.role_permissions (role_id, permission_id, can_access)
    SELECT vendeur_id, id, true FROM public.permissions 
    WHERE (menu = 'Dashboard' AND action = 'read')
       OR (menu = 'Catalogue' AND action = 'read')
       OR (menu = 'Stock' AND action = 'read')
       OR (menu = 'Ventes' AND action IN ('read', 'write'))
       OR (menu = 'Clients' AND action = 'read')
    ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;
END $$;

-- Fonction RPC pour récupérer les permissions d'un utilisateur
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

-- Fonction pour récupérer les utilisateurs par rôle
CREATE OR REPLACE FUNCTION public.get_users_by_role(role_uuid uuid)
RETURNS TABLE(
  user_id uuid,
  prenom text,
  nom text,
  email text,
  matricule text,
  statut text,
  created_at timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    ui.user_id,
    ui.prenom,
    ui.nom,
    ui.email,
    ui.matricule,
    ui.statut,
    ui.created_at
  FROM public.utilisateurs_internes ui
  WHERE ui.role_id = role_uuid
  ORDER BY ui.nom, ui.prenom;
$$;

-- Vue pour les permissions utilisateurs (optimisation)
CREATE OR REPLACE VIEW public.vue_permissions_utilisateurs AS
SELECT 
  ui.user_id,
  ui.prenom,
  ui.nom,
  ui.email,
  r.name as role_name,
  p.menu,
  p.submenu,
  p.action,
  rp.can_access
FROM public.utilisateurs_internes ui
JOIN public.roles r ON ui.role_id = r.id
JOIN public.role_permissions rp ON r.id = rp.role_id
JOIN public.permissions p ON rp.permission_id = p.id
WHERE ui.statut = 'actif';
