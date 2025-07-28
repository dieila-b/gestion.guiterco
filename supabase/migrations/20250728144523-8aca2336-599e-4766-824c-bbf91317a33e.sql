-- Insert default roles if they don't exist
INSERT INTO public.roles (name, description, is_system) VALUES 
('Administrateur', 'Accès complet à toutes les fonctionnalités', true),
('Manager', 'Gestion des ventes, stocks et rapports', true),
('Vendeur', 'Gestion des ventes et clients', true),
('Caissier', 'Gestion des caisses et transactions', true)
ON CONFLICT (name) DO NOTHING;

-- Insert comprehensive permissions for all application menus
INSERT INTO public.permissions (menu, submenu, action, description) VALUES 
-- Dashboard
('Tableau de bord', NULL, 'read', 'Consulter le tableau de bord'),

-- Ventes
('Ventes', 'Factures', 'read', 'Consulter les factures de vente'),
('Ventes', 'Factures', 'write', 'Créer et modifier les factures de vente'),
('Ventes', 'Factures', 'delete', 'Supprimer les factures de vente'),
('Ventes', 'Précommandes', 'read', 'Consulter les précommandes'),
('Ventes', 'Précommandes', 'write', 'Créer et modifier les précommandes'),
('Ventes', 'Précommandes', 'delete', 'Supprimer les précommandes'),
('Ventes', 'Devis', 'read', 'Consulter les devis'),
('Ventes', 'Devis', 'write', 'Créer et modifier les devis'),
('Ventes', 'Devis', 'delete', 'Supprimer les devis'),
('Ventes', 'Commandes', 'read', 'Consulter les commandes clients'),
('Ventes', 'Commandes', 'write', 'Créer et modifier les commandes clients'),
('Ventes', 'Commandes', 'delete', 'Supprimer les commandes clients'),

-- Achats
('Achats', 'Bons de commande', 'read', 'Consulter les bons de commande'),
('Achats', 'Bons de commande', 'write', 'Créer et modifier les bons de commande'),
('Achats', 'Bons de commande', 'delete', 'Supprimer les bons de commande'),
('Achats', 'Bons de livraison', 'read', 'Consulter les bons de livraison'),
('Achats', 'Bons de livraison', 'write', 'Créer et modifier les bons de livraison'),
('Achats', 'Bons de livraison', 'delete', 'Supprimer les bons de livraison'),
('Achats', 'Factures fournisseurs', 'read', 'Consulter les factures fournisseurs'),
('Achats', 'Factures fournisseurs', 'write', 'Créer et modifier les factures fournisseurs'),
('Achats', 'Factures fournisseurs', 'delete', 'Supprimer les factures fournisseurs'),

-- Stock
('Stock', 'Entrepôts', 'read', 'Consulter les stocks entrepôts'),
('Stock', 'Entrepôts', 'write', 'Gérer les stocks entrepôts'),
('Stock', 'Entrepôts', 'delete', 'Supprimer des entrées de stock'),
('Stock', 'PDV', 'read', 'Consulter les stocks points de vente'),
('Stock', 'PDV', 'write', 'Gérer les stocks points de vente'),
('Stock', 'PDV', 'delete', 'Supprimer des entrées de stock PDV'),
('Stock', 'Transferts', 'read', 'Consulter les transferts de stock'),
('Stock', 'Transferts', 'write', 'Créer et gérer les transferts'),
('Stock', 'Transferts', 'delete', 'Supprimer les transferts'),
('Stock', 'Inventaires', 'read', 'Consulter les inventaires'),
('Stock', 'Inventaires', 'write', 'Réaliser des inventaires'),
('Stock', 'Inventaires', 'delete', 'Supprimer des inventaires'),

-- Catalogue
('Catalogue', NULL, 'read', 'Consulter le catalogue produits'),
('Catalogue', NULL, 'write', 'Modifier le catalogue produits'),
('Catalogue', NULL, 'delete', 'Supprimer des produits du catalogue'),

-- Clients
('Clients', NULL, 'read', 'Consulter les clients'),
('Clients', NULL, 'write', 'Créer et modifier les clients'),
('Clients', NULL, 'delete', 'Supprimer les clients'),

-- Caisse
('Caisse', 'Transactions', 'read', 'Consulter les transactions'),
('Caisse', 'Transactions', 'write', 'Effectuer des transactions'),
('Caisse', 'Clotures', 'read', 'Consulter les clôtures de caisse'),
('Caisse', 'Clotures', 'write', 'Effectuer les clôtures de caisse'),
('Caisse', 'Comptages', 'read', 'Consulter les comptages'),
('Caisse', 'Comptages', 'write', 'Effectuer les comptages'),

-- Finances
('Finances', 'Recettes', 'read', 'Consulter les recettes'),
('Finances', 'Recettes', 'write', 'Gérer les recettes'),
('Finances', 'Dépenses', 'read', 'Consulter les dépenses'),
('Finances', 'Dépenses', 'write', 'Gérer les dépenses'),
('Finances', 'Rapports', 'read', 'Consulter les rapports financiers'),

-- Paramètres
('Paramètres', 'Zone géographique', 'read', 'Consulter la configuration géographique'),
('Paramètres', 'Zone géographique', 'write', 'Modifier la configuration géographique'),
('Paramètres', 'Fournisseurs', 'read', 'Consulter les fournisseurs'),
('Paramètres', 'Fournisseurs', 'write', 'Gérer les fournisseurs'),
('Paramètres', 'Dépôts de stockage', 'read', 'Consulter les dépôts'),
('Paramètres', 'Dépôts de stockage', 'write', 'Gérer les dépôts'),
('Paramètres', 'Points de vente', 'read', 'Consulter les points de vente'),
('Paramètres', 'Points de vente', 'write', 'Gérer les points de vente'),
('Paramètres', 'Rôles et permissions', 'read', 'Consulter les rôles et permissions'),
('Paramètres', 'Rôles et permissions', 'write', 'Gérer les rôles et permissions'),
('Paramètres', 'Utilisateurs', 'read', 'Consulter les utilisateurs'),
('Paramètres', 'Utilisateurs', 'write', 'Gérer les utilisateurs');