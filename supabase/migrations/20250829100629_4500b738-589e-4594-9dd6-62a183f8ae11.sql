-- Désactiver temporairement les contraintes pour nettoyer
ALTER TABLE role_permissions DROP CONSTRAINT IF EXISTS role_permissions_role_id_permission_id_key;

-- Vider complètement les tables de permissions
TRUNCATE TABLE role_permissions RESTART IDENTITY CASCADE;
TRUNCATE TABLE permissions RESTART IDENTITY CASCADE;

-- Recréer la contrainte unique
ALTER TABLE role_permissions ADD CONSTRAINT role_permissions_role_id_permission_id_key UNIQUE (role_id, permission_id);

-- Insérer toutes les permissions complètes de l'application

-- Dashboard
INSERT INTO permissions (menu, submenu, action, description) VALUES
('Dashboard', NULL, 'read', 'Accès au tableau de bord');

-- Ventes
INSERT INTO permissions (menu, submenu, action, description) VALUES
('Ventes', 'Vente au Comptoir', 'read', 'Consulter les ventes au comptoir'),
('Ventes', 'Vente au Comptoir', 'write', 'Créer/modifier des ventes au comptoir'),
('Ventes', 'Factures de vente', 'read', 'Consulter les factures de vente'),
('Ventes', 'Factures de vente', 'write', 'Créer/modifier les factures de vente'),
('Ventes', 'Factures de vente', 'delete', 'Supprimer les factures de vente'),
('Ventes', 'Factures Impayées', 'read', 'Consulter les factures impayées'),
('Ventes', 'Factures Impayées', 'write', 'Gérer les factures impayées'),
('Ventes', 'Précommandes', 'read', 'Consulter les précommandes'),
('Ventes', 'Précommandes', 'write', 'Créer/modifier les précommandes'),
('Ventes', 'Précommandes', 'delete', 'Supprimer les précommandes'),
('Ventes', 'Versements', 'read', 'Consulter les versements'),
('Ventes', 'Versements', 'write', 'Créer/modifier les versements'),
('Ventes', 'Devis', 'read', 'Consulter les devis'),
('Ventes', 'Devis', 'write', 'Créer/modifier les devis'),
('Ventes', 'Devis', 'delete', 'Supprimer les devis'),
('Ventes', 'Retours clients', 'read', 'Consulter les retours clients'),
('Ventes', 'Retours clients', 'write', 'Gérer les retours clients');

-- Stock
INSERT INTO permissions (menu, submenu, action, description) VALUES
('Stock', 'Stock Entrepôt', 'read', 'Consulter le stock des entrepôts'),
('Stock', 'Stock Entrepôt', 'write', 'Modifier le stock des entrepôts'),
('Stock', 'Stock PDV', 'read', 'Consulter le stock des points de vente'),
('Stock', 'Stock PDV', 'write', 'Modifier le stock des points de vente'),
('Stock', 'Entrées', 'read', 'Consulter les entrées de stock'),
('Stock', 'Entrées', 'write', 'Créer/modifier les entrées de stock'),
('Stock', 'Sorties', 'read', 'Consulter les sorties de stock'),
('Stock', 'Sorties', 'write', 'Créer/modifier les sorties de stock'),
('Stock', 'Entrepôts', 'read', 'Consulter les entrepôts'),
('Stock', 'Entrepôts', 'write', 'Créer/modifier les entrepôts'),
('Stock', 'Entrepôts', 'delete', 'Supprimer les entrepôts'),
('Stock', 'Points de Vente', 'read', 'Consulter les points de vente'),
('Stock', 'Points de Vente', 'write', 'Créer/modifier les points de vente'),
('Stock', 'Points de Vente', 'delete', 'Supprimer les points de vente'),
('Stock', 'Transferts', 'read', 'Consulter les transferts de stock'),
('Stock', 'Transferts', 'write', 'Créer/modifier les transferts de stock'),
('Stock', 'Catalogue', 'read', 'Consulter le catalogue produits'),
('Stock', 'Catalogue', 'write', 'Créer/modifier le catalogue produits'),
('Stock', 'Catalogue', 'delete', 'Supprimer des produits du catalogue');

-- Achats
INSERT INTO permissions (menu, submenu, action, description) VALUES
('Achats', 'Bons de commande', 'read', 'Consulter les bons de commande'),
('Achats', 'Bons de commande', 'write', 'Créer/modifier les bons de commande'),
('Achats', 'Bons de commande', 'delete', 'Supprimer les bons de commande'),
('Achats', 'Bons de livraison', 'read', 'Consulter les bons de livraison'),
('Achats', 'Bons de livraison', 'write', 'Créer/modifier les bons de livraison'),
('Achats', 'Bons de livraison', 'delete', 'Supprimer les bons de livraison'),
('Achats', 'Factures d''achat', 'read', 'Consulter les factures d''achat'),
('Achats', 'Factures d''achat', 'write', 'Créer/modifier les factures d''achat'),
('Achats', 'Factures d''achat', 'delete', 'Supprimer les factures d''achat'),
('Achats', 'Retours fournisseurs', 'read', 'Consulter les retours fournisseurs'),
('Achats', 'Retours fournisseurs', 'write', 'Gérer les retours fournisseurs');

-- Clients
INSERT INTO permissions (menu, submenu, action, description) VALUES
('Clients', 'Liste', 'read', 'Consulter la liste des clients'),
('Clients', 'Liste', 'write', 'Créer/modifier les clients'),
('Clients', 'Liste', 'delete', 'Supprimer les clients'),
('Clients', 'Meilleurs Clients', 'read', 'Consulter les statistiques des meilleurs clients'),
('Clients', 'Clients Endettés', 'read', 'Consulter la liste des clients endettés'),
('Clients', 'Clients Endettés', 'write', 'Gérer les créances clients');

-- Caisse
INSERT INTO permissions (menu, submenu, action, description) VALUES
('Caisse', 'Aperçu du jour', 'read', 'Consulter l''aperçu quotidien de la caisse'),
('Caisse', 'Historique complet', 'read', 'Consulter l''historique complet des transactions'),
('Caisse', 'Dépenses - Sorties', 'read', 'Consulter les sorties de caisse'),
('Caisse', 'Dépenses - Sorties', 'write', 'Créer/modifier les sorties de caisse'),
('Caisse', 'Dépenses - Entrées', 'read', 'Consulter les entrées de caisse'),
('Caisse', 'Dépenses - Entrées', 'write', 'Créer/modifier les entrées de caisse'),
('Caisse', 'Dépenses - Catégories', 'read', 'Consulter les catégories de dépenses'),
('Caisse', 'Dépenses - Catégories', 'write', 'Créer/modifier les catégories de dépenses'),
('Caisse', 'Dépenses - Catégories', 'delete', 'Supprimer les catégories de dépenses');

-- Rapports
INSERT INTO permissions (menu, submenu, action, description) VALUES
('Rapports', 'Marges', 'read', 'Consulter les rapports de marges'),
('Rapports', 'Rapport Quotidien', 'read', 'Consulter les rapports quotidiens'),
('Rapports', 'Date à Date', 'read', 'Consulter les rapports par période'),
('Rapports', 'Clients', 'read', 'Consulter les rapports clients'),
('Rapports', 'Factures Impayées', 'read', 'Consulter les rapports de factures impayées');

-- Paramètres
INSERT INTO permissions (menu, submenu, action, description) VALUES
('Paramètres', 'Zone Géographique', 'read', 'Consulter les zones géographiques'),
('Paramètres', 'Zone Géographique', 'write', 'Créer/modifier les zones géographiques'),
('Paramètres', 'Zone Géographique', 'delete', 'Supprimer les zones géographiques'),
('Paramètres', 'Fournisseurs', 'read', 'Consulter les fournisseurs'),
('Paramètres', 'Fournisseurs', 'write', 'Créer/modifier les fournisseurs'),
('Paramètres', 'Fournisseurs', 'delete', 'Supprimer les fournisseurs'),
('Paramètres', 'Entrepôts', 'read', 'Consulter les entrepôts'),
('Paramètres', 'Entrepôts', 'write', 'Créer/modifier les entrepôts'),
('Paramètres', 'Entrepôts', 'delete', 'Supprimer les entrepôts'),
('Paramètres', 'Points de vente', 'read', 'Consulter les points de vente'),
('Paramètres', 'Points de vente', 'write', 'Créer/modifier les points de vente'),
('Paramètres', 'Points de vente', 'delete', 'Supprimer les points de vente'),
('Paramètres', 'Clients', 'read', 'Consulter les paramètres clients'),
('Paramètres', 'Clients', 'write', 'Modifier les paramètres clients'),
('Paramètres', 'Utilisateurs', 'read', 'Consulter les utilisateurs internes'),
('Paramètres', 'Utilisateurs', 'write', 'Créer/modifier les utilisateurs internes'),
('Paramètres', 'Utilisateurs', 'delete', 'Supprimer les utilisateurs internes'),
('Paramètres', 'Permissions', 'read', 'Consulter les rôles et permissions'),
('Paramètres', 'Permissions', 'write', 'Créer/modifier les rôles et permissions'),
('Paramètres', 'Permissions', 'delete', 'Supprimer les rôles et permissions');

-- Créer quelques rôles par défaut si ils n'existent pas
INSERT INTO roles (name, description, is_system) 
SELECT * FROM (VALUES 
  ('Administrateur', 'Accès complet à toutes les fonctionnalités', true),
  ('Manager', 'Accès à la gestion des ventes, stock et rapports', false),
  ('Vendeur', 'Accès aux ventes et consultation du stock', false),
  ('Magasinier', 'Accès à la gestion du stock et des entrées/sorties', false)
) AS v(name, description, is_system)
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE roles.name = v.name);

-- Donner tous les droits à l'administrateur
INSERT INTO role_permissions (role_id, permission_id, can_access)
SELECT r.id, p.id, true
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Administrateur';