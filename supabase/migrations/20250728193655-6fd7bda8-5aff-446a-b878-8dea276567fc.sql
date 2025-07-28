-- Migration pour compléter le système de permissions

-- Nettoyer les relations avant de reconstruire
DELETE FROM public.role_permissions;

-- Insérer seulement les rôles manquants
INSERT INTO public.roles (name, description, is_system) 
SELECT * FROM (VALUES 
    ('Administrateur', 'Accès complet à toutes les fonctionnalités', true),
    ('Manager', 'Gestion et supervision des opérations', true),
    ('Vendeur', 'Gestion des ventes et clients', true),
    ('Caissier', 'Gestion de la caisse et paiements', true)
) AS v(name, description, is_system)
WHERE NOT EXISTS (SELECT 1 FROM public.roles WHERE roles.name = v.name);

-- Nettoyer et recréer toutes les permissions
DELETE FROM public.permissions;

INSERT INTO public.permissions (menu, submenu, action, description) VALUES
-- Dashboard
('Dashboard', NULL, 'read', 'Voir le tableau de bord'),

-- Catalogue
('Catalogue', NULL, 'read', 'Consulter le catalogue'),
('Catalogue', NULL, 'write', 'Modifier le catalogue'),
('Catalogue', NULL, 'delete', 'Supprimer des articles'),
('Catalogue', 'Catégories', 'read', 'Voir les catégories'),
('Catalogue', 'Catégories', 'write', 'Gérer les catégories'),

-- Stock
('Stock', 'Entrepôts', 'read', 'Consulter les stocks entrepôts'),
('Stock', 'Entrepôts', 'write', 'Gérer les stocks entrepôts'),
('Stock', 'PDV', 'read', 'Consulter les stocks PDV'),
('Stock', 'PDV', 'write', 'Gérer les stocks PDV'),
('Stock', 'Transferts', 'read', 'Voir les transferts'),
('Stock', 'Transferts', 'write', 'Créer des transferts'),
('Stock', 'Mouvements', 'read', 'Consulter les mouvements'),
('Stock', 'Inventaire', 'read', 'Voir les inventaires'),
('Stock', 'Inventaire', 'write', 'Effectuer les inventaires'),

-- Achats
('Achats', 'Bons de commande', 'read', 'Consulter les bons de commande'),
('Achats', 'Bons de commande', 'write', 'Créer/modifier les bons de commande'),
('Achats', 'Bons de livraison', 'read', 'Consulter les bons de livraison'),
('Achats', 'Bons de livraison', 'write', 'Gérer les bons de livraison'),
('Achats', 'Factures', 'read', 'Consulter les factures d''achat'),
('Achats', 'Factures', 'write', 'Gérer les factures d''achat'),
('Achats', 'Fournisseurs', 'read', 'Consulter les fournisseurs'),
('Achats', 'Fournisseurs', 'write', 'Gérer les fournisseurs'),

-- Ventes
('Ventes', 'Factures', 'read', 'Consulter les factures de vente'),
('Ventes', 'Factures', 'write', 'Créer/modifier les factures'),
('Ventes', 'Précommandes', 'read', 'Consulter les précommandes'),
('Ventes', 'Précommandes', 'write', 'Gérer les précommandes'),
('Ventes', 'Devis', 'read', 'Consulter les devis'),
('Ventes', 'Devis', 'write', 'Créer/modifier les devis'),

-- Clients
('Clients', NULL, 'read', 'Consulter les clients'),
('Clients', NULL, 'write', 'Gérer les clients'),
('Clients', NULL, 'delete', 'Supprimer des clients'),

-- Caisse
('Caisse', 'Opérations', 'read', 'Consulter les opérations de caisse'),
('Caisse', 'Opérations', 'write', 'Effectuer des opérations de caisse'),
('Caisse', 'Clôtures', 'read', 'Consulter les clôtures'),
('Caisse', 'Clôtures', 'write', 'Effectuer les clôtures'),
('Caisse', 'États', 'read', 'Consulter les états de caisse'),

-- Finance
('Finance', 'Revenus', 'read', 'Consulter les revenus'),
('Finance', 'Dépenses', 'read', 'Consulter les dépenses'),
('Finance', 'Dépenses', 'write', 'Gérer les dépenses'),
('Finance', 'Rapports', 'read', 'Consulter les rapports financiers'),
('Finance', 'Trésorerie', 'read', 'Consulter la trésorerie'),

-- Rapports
('Rapports', 'Ventes', 'read', 'Rapports de ventes'),
('Rapports', 'Stock', 'read', 'Rapports de stock'),
('Rapports', 'Marges', 'read', 'Rapports de marges'),
('Rapports', 'Clients', 'read', 'Rapports clients'),

-- Paramètres
('Paramètres', 'Profil', 'read', 'Voir le profil'),
('Paramètres', 'Profil', 'write', 'Modifier le profil'),
('Paramètres', 'Utilisateurs', 'read', 'Consulter les utilisateurs'),
('Paramètres', 'Utilisateurs', 'write', 'Gérer les utilisateurs'),
('Paramètres', 'Rôles et permissions', 'read', 'Consulter les rôles et permissions'),
('Paramètres', 'Rôles et permissions', 'write', 'Gérer les rôles et permissions'),
('Paramètres', 'Général', 'read', 'Consulter les paramètres généraux'),
('Paramètres', 'Général', 'write', 'Modifier les paramètres généraux');

-- Attribution des permissions par rôle
INSERT INTO public.role_permissions (role_id, permission_id, can_access)
-- Administrateur : toutes les permissions
SELECT r.id, p.id, true
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'Administrateur'

UNION ALL

-- Manager : tout sauf gestion rôles/permissions
SELECT r.id, p.id, true
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'Manager'
AND NOT (p.menu = 'Paramètres' AND p.submenu = 'Rôles et permissions')

UNION ALL

-- Vendeur : Ventes, Clients, Catalogue, Stock lecture, Dashboard, Profil
SELECT r.id, p.id, true
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'Vendeur'
AND (p.menu IN ('Dashboard', 'Catalogue', 'Ventes', 'Clients')
     OR (p.menu = 'Stock' AND p.action = 'read')
     OR (p.menu = 'Paramètres' AND p.submenu = 'Profil'))

UNION ALL

-- Caissier : Caisse, Dashboard, Clients, Factures lecture, Profil
SELECT r.id, p.id, true
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'Caissier'
AND (p.menu IN ('Dashboard', 'Caisse', 'Clients')
     OR (p.menu = 'Ventes' AND p.submenu = 'Factures' AND p.action = 'read')
     OR (p.menu = 'Paramètres' AND p.submenu = 'Profil'));