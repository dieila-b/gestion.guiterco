-- Migration pour rétablir le système de permissions complet (corrigée)

-- Nettoyer d'abord
DELETE FROM public.role_permissions;
DELETE FROM public.permissions;
DELETE FROM public.roles WHERE name NOT IN ('Administrateur', 'Manager', 'Vendeur', 'Caissier');

-- Rôles par défaut
INSERT INTO public.roles (name, description, is_system) VALUES
('Administrateur', 'Accès complet à toutes les fonctionnalités', true),
('Manager', 'Gestion et supervision des opérations', true),
('Vendeur', 'Gestion des ventes et clients', true),
('Caissier', 'Gestion de la caisse et paiements', true);

-- Permissions complètes pour tous les menus de l'application
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

-- Attribuer permissions pour chaque rôle
DO $$
DECLARE
    admin_id UUID;
    manager_id UUID;
    vendeur_id UUID;
    caissier_id UUID;
    perm RECORD;
BEGIN
    -- Récupérer les IDs des rôles
    SELECT id INTO admin_id FROM public.roles WHERE name = 'Administrateur';
    SELECT id INTO manager_id FROM public.roles WHERE name = 'Manager';
    SELECT id INTO vendeur_id FROM public.roles WHERE name = 'Vendeur';
    SELECT id INTO caissier_id FROM public.roles WHERE name = 'Caissier';
    
    -- Donner TOUTES les permissions à l'Administrateur
    FOR perm IN SELECT id FROM public.permissions LOOP
        INSERT INTO public.role_permissions (role_id, permission_id, can_access)
        VALUES (admin_id, perm.id, true);
    END LOOP;
    
    -- Manager : tout sauf gestion des rôles/permissions
    FOR perm IN SELECT id FROM public.permissions 
        WHERE NOT (menu = 'Paramètres' AND submenu = 'Rôles et permissions') LOOP
        INSERT INTO public.role_permissions (role_id, permission_id, can_access)
        VALUES (manager_id, perm.id, true);
    END LOOP;
    
    -- Vendeur : Ventes, Clients, Catalogue, Stock (lecture), Dashboard
    FOR perm IN SELECT id FROM public.permissions 
        WHERE menu IN ('Dashboard', 'Catalogue', 'Ventes', 'Clients')
        OR (menu = 'Stock' AND action = 'read')
        OR (menu = 'Paramètres' AND submenu = 'Profil') LOOP
        INSERT INTO public.role_permissions (role_id, permission_id, can_access)
        VALUES (vendeur_id, perm.id, true);
    END LOOP;
    
    -- Caissier : Caisse, Ventes basiques, Clients, Dashboard
    FOR perm IN SELECT id FROM public.permissions 
        WHERE menu IN ('Dashboard', 'Caisse', 'Clients')
        OR (menu = 'Ventes' AND submenu = 'Factures' AND action = 'read')
        OR (menu = 'Paramètres' AND submenu = 'Profil') LOOP
        INSERT INTO public.role_permissions (role_id, permission_id, can_access)
        VALUES (caissier_id, perm.id, true);
    END LOOP;
END $$;