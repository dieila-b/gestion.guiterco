
-- Vider et repeupler les permissions selon la capture
TRUNCATE TABLE permissions CASCADE;

-- Permissions Dashboard
INSERT INTO permissions (menu, submenu, action, description) VALUES 
('Dashboard', NULL, 'read', 'Consulter le tableau de bord');

-- Permissions Catalogue  
INSERT INTO permissions (menu, submenu, action, description) VALUES 
('Catalogue', NULL, 'read', 'Consulter le catalogue'),
('Catalogue', NULL, 'write', 'Modifier le catalogue'),
('Catalogue', NULL, 'delete', 'Supprimer des articles du catalogue');

-- Permissions Stock
INSERT INTO permissions (menu, submenu, action, description) VALUES 
('Stock', 'Entrepôts', 'read', 'Consulter les stocks entrepôts'),
('Stock', 'Entrepôts', 'write', 'Modifier les stocks entrepôts'),
('Stock', 'PDV', 'read', 'Consulter les stocks points de vente'),
('Stock', 'PDV', 'write', 'Modifier les stocks points de vente'),
('Stock', 'Transferts', 'read', 'Consulter les transferts'),
('Stock', 'Transferts', 'write', 'Gérer les transferts'),
('Stock', 'Entrées', 'read', 'Consulter les entrées de stock'),
('Stock', 'Entrées', 'write', 'Créer des entrées de stock'),
('Stock', 'Sorties', 'read', 'Consulter les sorties de stock'),
('Stock', 'Sorties', 'write', 'Créer des sorties de stock');

-- Permissions Achats
INSERT INTO permissions (menu, submenu, action, description) VALUES 
('Achats', 'Bons de commande', 'read', 'Consulter les bons de commande'),
('Achats', 'Bons de commande', 'write', 'Créer/modifier les bons de commande'),
('Achats', 'Bons de livraison', 'read', 'Consulter les bons de livraison'),
('Achats', 'Bons de livraison', 'write', 'Gérer les bons de livraison'),
('Achats', 'Factures', 'read', 'Consulter les factures d''achat'),
('Achats', 'Factures', 'write', 'Créer/modifier les factures d''achat');

-- Permissions Ventes
INSERT INTO permissions (menu, submenu, action, description) VALUES 
('Ventes', 'Factures', 'read', 'Consulter les factures de vente'),
('Ventes', 'Factures', 'write', 'Créer/modifier les factures de vente'),
('Ventes', 'Précommandes', 'read', 'Consulter les précommandes'),
('Ventes', 'Précommandes', 'write', 'Gérer les précommandes'),
('Ventes', 'Devis', 'read', 'Consulter les devis'),
('Ventes', 'Devis', 'write', 'Créer/modifier les devis'),
('Ventes', 'Vente au Comptoir', 'read', 'Consulter les ventes comptoir'),
('Ventes', 'Vente au Comptoir', 'write', 'Effectuer des ventes comptoir'),
('Ventes', 'Factures impayées', 'read', 'Consulter les factures impayées'),
('Ventes', 'Factures impayées', 'write', 'Gérer les factures impayées'),
('Ventes', 'Retours Clients', 'read', 'Consulter les retours clients'),
('Ventes', 'Retours Clients', 'write', 'Gérer les retours clients');

-- Permissions Clients
INSERT INTO permissions (menu, submenu, action, description) VALUES 
('Clients', NULL, 'read', 'Consulter les clients'),
('Clients', NULL, 'write', 'Créer/modifier les clients'),
('Clients', 'Clients', 'read', 'Consulter les détails clients'),
('Clients', 'Clients', 'write', 'Gérer les informations clients');

-- Permissions Caisse
INSERT INTO permissions (menu, submenu, action, description) VALUES 
('Caisse', NULL, 'read', 'Consulter la caisse'),
('Caisse', NULL, 'write', 'Gérer la caisse'),
('Caisse', 'Dépenses', 'read', 'Consulter les dépenses'),
('Caisse', 'Dépenses', 'write', 'Créer/modifier les dépenses'),
('Caisse', 'Aperçu du jour', 'read', 'Consulter l''aperçu journalier');

-- Permissions Finance
INSERT INTO permissions (menu, submenu, action, description) VALUES 
('Finance', 'Marges', 'read', 'Consulter les marges'),
('Finance', 'Rapports financiers', 'read', 'Consulter les rapports financiers');

-- Permissions Rapports
INSERT INTO permissions (menu, submenu, action, description) VALUES 
('Rapports', NULL, 'read', 'Consulter les rapports'),
('Rapports', NULL, 'write', 'Générer/exporter les rapports');

-- Permissions Paramètres
INSERT INTO permissions (menu, submenu, action, description) VALUES 
('Paramètres', NULL, 'read', 'Accéder aux paramètres'),
('Paramètres', 'Utilisateurs', 'read', 'Consulter les utilisateurs'),
('Paramètres', 'Utilisateurs', 'write', 'Gérer les utilisateurs'),
('Paramètres', 'Permissions', 'read', 'Consulter les permissions'),
('Paramètres', 'Permissions', 'write', 'Gérer les permissions'),
('Paramètres', 'Fournisseurs', 'read', 'Consulter les fournisseurs'),
('Paramètres', 'Fournisseurs', 'write', 'Gérer les fournisseurs');

-- S'assurer que les rôles existent
INSERT INTO roles (name, description, is_system) VALUES 
('Administrateur', 'Accès complet à toutes les fonctionnalités', true),
('Manager', 'Gestion des ventes et du stock', true),
('Vendeur', 'Accès aux ventes et consultation du stock', true),
('Caissier', 'Accès à la caisse et aux ventes comptoir', true)
ON CONFLICT (name) DO NOTHING;

-- Assigner toutes les permissions à l'Administrateur
INSERT INTO role_permissions (role_id, permission_id, can_access)
SELECT r.id, p.id, true
FROM roles r, permissions p
WHERE r.name = 'Administrateur'
ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;

-- Permissions Manager (toutes sauf administration)
INSERT INTO role_permissions (role_id, permission_id, can_access)
SELECT r.id, p.id, true
FROM roles r, permissions p
WHERE r.name = 'Manager'
AND NOT (p.menu = 'Paramètres' AND p.submenu IN ('Utilisateurs', 'Permissions'))
ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;

-- Permissions Vendeur (ventes, clients, stock en lecture)
INSERT INTO role_permissions (role_id, permission_id, can_access)
SELECT r.id, p.id, true
FROM roles r, permissions p
WHERE r.name = 'Vendeur'
AND (
    (p.menu = 'Dashboard' AND p.action = 'read') OR
    (p.menu = 'Catalogue' AND p.action = 'read') OR
    (p.menu = 'Stock' AND p.action = 'read') OR
    (p.menu = 'Ventes') OR
    (p.menu = 'Clients') OR
    (p.menu = 'Rapports' AND p.action = 'read')
)
ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;

-- Permissions Caissier (caisse, ventes comptoir)
INSERT INTO role_permissions (role_id, permission_id, can_access)
SELECT r.id, p.id, true
FROM roles r, permissions p
WHERE r.name = 'Caissier'
AND (
    (p.menu = 'Dashboard' AND p.action = 'read') OR
    (p.menu = 'Catalogue' AND p.action = 'read') OR
    (p.menu = 'Caisse') OR
    (p.menu = 'Ventes' AND p.submenu = 'Vente au Comptoir') OR
    (p.menu = 'Clients' AND p.action = 'read')
)
ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;

-- Créer ou mettre à jour la vue des permissions utilisateurs
CREATE OR REPLACE VIEW vue_permissions_utilisateurs AS
SELECT 
    ui.user_id,
    ui.id as utilisateur_interne_id,
    ui.email,
    ui.prenom,
    ui.nom,
    r.name as role_name,
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

-- Mettre à jour les politiques RLS pour utiliser les permissions strictes
DROP POLICY IF EXISTS "STRICT_permissions_access" ON permissions;
CREATE POLICY "STRICT_permissions_access" ON permissions
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM vue_permissions_utilisateurs vpu
    WHERE vpu.user_id = auth.uid()
    AND vpu.menu = 'Paramètres'
    AND vpu.submenu = 'Permissions'
    AND vpu.action IN ('read', 'write')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM vue_permissions_utilisateurs vpu
    WHERE vpu.user_id = auth.uid()
    AND vpu.menu = 'Paramètres'
    AND vpu.submenu = 'Permissions'
    AND vpu.action = 'write'
  )
);

DROP POLICY IF EXISTS "STRICT_roles_access" ON roles;
CREATE POLICY "STRICT_roles_access" ON roles
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM vue_permissions_utilisateurs vpu
    WHERE vpu.user_id = auth.uid()
    AND vpu.menu = 'Paramètres'
    AND vpu.submenu = 'Permissions'
    AND vpu.action IN ('read', 'write')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM vue_permissions_utilisateurs vpu
    WHERE vpu.user_id = auth.uid()
    AND vpu.menu = 'Paramètres'
    AND vpu.submenu = 'Permissions'
    AND vpu.action = 'write'
  )
);

DROP POLICY IF EXISTS "STRICT_role_permissions_access" ON role_permissions;
CREATE POLICY "STRICT_role_permissions_access" ON role_permissions
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM vue_permissions_utilisateurs vpu
    WHERE vpu.user_id = auth.uid()
    AND vpu.menu = 'Paramètres'
    AND vpu.submenu = 'Permissions'
    AND vpu.action IN ('read', 'write')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM vue_permissions_utilisateurs vpu
    WHERE vpu.user_id = auth.uid()
    AND vpu.menu = 'Paramètres'
    AND vpu.submenu = 'Permissions'
    AND vpu.action = 'write'
  )
);
