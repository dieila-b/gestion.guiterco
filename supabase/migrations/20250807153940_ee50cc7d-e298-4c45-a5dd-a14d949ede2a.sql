
-- Nettoyer et recréer la structure des permissions
TRUNCATE TABLE role_permissions, permissions, roles CASCADE;

-- Recréer les rôles système
INSERT INTO roles (name, description, is_system) VALUES 
('Administrateur', 'Accès complet à toutes les fonctionnalités', true),
('Manager', 'Gestion des ventes et du stock', true),
('Vendeur', 'Accès aux ventes et consultation du stock', true),
('Caissier', 'Accès à la caisse et aux ventes comptoir', true);

-- Créer les permissions de base essentielles
INSERT INTO permissions (menu, submenu, action, description) VALUES 
-- Dashboard (essentiel)
('Dashboard', NULL, 'read', 'Accéder au tableau de bord'),

-- Catalogue
('Catalogue', NULL, 'read', 'Consulter le catalogue'),
('Catalogue', NULL, 'write', 'Modifier le catalogue'),
('Catalogue', NULL, 'delete', 'Supprimer des articles'),

-- Stock
('Stock', 'Entrepôts', 'read', 'Consulter les stocks entrepôts'),
('Stock', 'Entrepôts', 'write', 'Modifier les stocks entrepôts'),
('Stock', 'PDV', 'read', 'Consulter les stocks PDV'),
('Stock', 'PDV', 'write', 'Modifier les stocks PDV'),

-- Ventes
('Ventes', 'Factures', 'read', 'Consulter les factures'),
('Ventes', 'Factures', 'write', 'Créer/modifier les factures'),
('Ventes', 'Précommandes', 'read', 'Consulter les précommandes'),
('Ventes', 'Précommandes', 'write', 'Gérer les précommandes'),

-- Achats
('Achats', 'Bons de commande', 'read', 'Consulter les bons de commande'),
('Achats', 'Bons de commande', 'write', 'Gérer les bons de commande'),

-- Clients
('Clients', NULL, 'read', 'Consulter les clients'),
('Clients', NULL, 'write', 'Gérer les clients'),

-- Caisse
('Caisse', NULL, 'read', 'Accéder à la caisse'),
('Caisse', NULL, 'write', 'Gérer la caisse'),

-- Rapports
('Rapports', NULL, 'read', 'Consulter les rapports'),
('Rapports', 'Marges', 'read', 'Consulter les marges'),

-- Paramètres
('Paramètres', NULL, 'read', 'Accéder aux paramètres'),
('Paramètres', 'Rôles et permissions', 'read', 'Consulter les permissions'),
('Paramètres', 'Rôles et permissions', 'write', 'Gérer les permissions');

-- Donner TOUTES les permissions à l'Administrateur
INSERT INTO role_permissions (role_id, permission_id, can_access)
SELECT r.id, p.id, true
FROM roles r, permissions p
WHERE r.name = 'Administrateur';

-- Donner les permissions de base aux autres rôles
-- Manager : tout sauf gestion des permissions
INSERT INTO role_permissions (role_id, permission_id, can_access)
SELECT r.id, p.id, true
FROM roles r, permissions p
WHERE r.name = 'Manager'
AND NOT (p.menu = 'Paramètres' AND p.submenu = 'Rôles et permissions' AND p.action = 'write');

-- Vendeur : Dashboard + Ventes + Clients + Catalogue (lecture)
INSERT INTO role_permissions (role_id, permission_id, can_access)
SELECT r.id, p.id, true
FROM roles r, permissions p
WHERE r.name = 'Vendeur'
AND (
    p.menu = 'Dashboard' OR
    p.menu = 'Ventes' OR
    p.menu = 'Clients' OR
    (p.menu = 'Catalogue' AND p.action = 'read') OR
    (p.menu = 'Stock' AND p.action = 'read')
);

-- Caissier : Dashboard + Caisse + Ventes comptoir
INSERT INTO role_permissions (role_id, permission_id, can_access)
SELECT r.id, p.id, true
FROM roles r, permissions p
WHERE r.name = 'Caissier'
AND (
    p.menu = 'Dashboard' OR
    p.menu = 'Caisse' OR
    (p.menu = 'Ventes' AND p.submenu IN ('Factures', 'Vente au Comptoir'))
);

-- Créer ou mettre à jour la vue des permissions utilisateurs
DROP VIEW IF EXISTS vue_permissions_utilisateurs;
CREATE VIEW vue_permissions_utilisateurs AS
SELECT 
    ui.user_id,
    ui.id as utilisateur_interne_id,
    ui.email,
    ui.prenom,
    ui.nom,
    r.name as role_name,
    r.id as role_id,
    p.menu,
    p.submenu,
    p.action,
    p.description,
    rp.can_access
FROM utilisateurs_internes ui
JOIN roles r ON ui.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE ui.statut = 'actif'
AND rp.can_access = true;

-- S'assurer qu'il y a au moins un utilisateur Administrateur
UPDATE utilisateurs_internes 
SET role_id = (SELECT id FROM roles WHERE name = 'Administrateur' LIMIT 1)
WHERE email LIKE '%admin%' OR type_compte = 'admin'
OR id = (SELECT id FROM utilisateurs_internes WHERE statut = 'actif' LIMIT 1);

-- Fonction pour vérifier les permissions utilisateur
CREATE OR REPLACE FUNCTION public.has_user_permission(p_menu text, p_submenu text DEFAULT NULL, p_action text DEFAULT 'read')
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM vue_permissions_utilisateurs vpu
    WHERE vpu.user_id = auth.uid()
    AND vpu.menu = p_menu
    AND (p_submenu IS NULL OR vpu.submenu = p_submenu OR vpu.submenu IS NULL)
    AND vpu.action = p_action
    AND vpu.can_access = true
  );
$$;

-- Fonction pour obtenir les permissions d'un utilisateur
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_uuid uuid DEFAULT auth.uid())
RETURNS TABLE(
  menu text,
  submenu text,
  action text,
  can_access boolean
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    vpu.menu::text,
    vpu.submenu::text,
    vpu.action::text,
    vpu.can_access
  FROM vue_permissions_utilisateurs vpu
  WHERE vpu.user_id = user_uuid
  AND vpu.can_access = true;
$$;
