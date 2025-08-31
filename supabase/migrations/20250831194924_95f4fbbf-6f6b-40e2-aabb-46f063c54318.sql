-- Migration complète pour synchroniser tous les menus et sous-menus

-- 1. Supprimer toutes les permissions existantes pour éviter les conflits
DELETE FROM public.role_permissions;
DELETE FROM public.permissions;

-- 2. Insérer toutes les permissions selon la structure réelle de l'application

-- Dashboard
INSERT INTO public.permissions (menu, submenu, action, description) VALUES
('Dashboard', NULL, 'read', 'Accès au tableau de bord');

-- Catalogue (menu principal séparé)
INSERT INTO public.permissions (menu, submenu, action, description) VALUES
('Catalogue', NULL, 'read', 'Consultation du catalogue'),
('Catalogue', NULL, 'write', 'Modification du catalogue'),
('Catalogue', NULL, 'delete', 'Suppression d''articles du catalogue');

-- Stocks (avec tous les sous-menus utilisés dans le code)
INSERT INTO public.permissions (menu, submenu, action, description) VALUES
('Stocks', 'Entrepôts', 'read', 'Consultation des stocks en entrepôt'),
('Stocks', 'Entrepôts', 'write', 'Gestion des stocks en entrepôt'),
('Stocks', 'Entrepôts', 'delete', 'Suppression des entrées de stock entrepôt'),
('Stocks', 'PDV', 'read', 'Consultation des stocks PDV'),
('Stocks', 'PDV', 'write', 'Gestion des stocks PDV'),
('Stocks', 'PDV', 'delete', 'Suppression des entrées de stock PDV'),
('Stocks', 'Mouvements', 'read', 'Consultation des mouvements de stock'),
('Stocks', 'Mouvements', 'write', 'Gestion des mouvements de stock'),
('Stocks', 'Inventaire', 'read', 'Consultation des inventaires'),
('Stocks', 'Inventaire', 'write', 'Gestion des inventaires');

-- Ventes (avec tous les sous-menus utilisés)
INSERT INTO public.permissions (menu, submenu, action, description) VALUES
('Ventes', 'Vente au Comptoir', 'read', 'Accès aux ventes comptoir'),
('Ventes', 'Vente au Comptoir', 'write', 'Gestion des ventes comptoir'),
('Ventes', 'Factures', 'read', 'Consultation des factures de vente'),
('Ventes', 'Factures', 'write', 'Gestion des factures de vente'),
('Ventes', 'Factures', 'delete', 'Suppression des factures de vente'),
('Ventes', 'Factures Impayées', 'read', 'Consultation des factures impayées'),
('Ventes', 'Factures Impayées', 'write', 'Gestion des factures impayées'),
('Ventes', 'Précommandes', 'read', 'Consultation des précommandes'),
('Ventes', 'Précommandes', 'write', 'Gestion des précommandes'),
('Ventes', 'Précommandes', 'delete', 'Suppression des précommandes'),
('Ventes', 'Versements', 'read', 'Consultation des versements clients'),
('Ventes', 'Versements', 'write', 'Gestion des versements clients'),
('Ventes', 'Devis', 'read', 'Consultation des devis'),
('Ventes', 'Devis', 'write', 'Gestion des devis'),
('Ventes', 'Devis', 'delete', 'Suppression des devis'),
('Ventes', 'Retours clients', 'read', 'Consultation des retours clients'),
('Ventes', 'Retours clients', 'write', 'Gestion des retours clients');

-- Achats (avec correction des noms)
INSERT INTO public.permissions (menu, submenu, action, description) VALUES
('Achats', 'Bons de commande', 'read', 'Consultation des bons de commande'),
('Achats', 'Bons de commande', 'write', 'Gestion des bons de commande'),
('Achats', 'Bons de commande', 'delete', 'Suppression des bons de commande'),
('Achats', 'Bons de livraison', 'read', 'Consultation des bons de livraison'),
('Achats', 'Bons de livraison', 'write', 'Gestion des bons de livraison'),
('Achats', 'Bons de livraison', 'delete', 'Suppression des bons de livraison'),
('Achats', 'Factures fournisseurs', 'read', 'Consultation des factures fournisseurs'),
('Achats', 'Factures fournisseurs', 'write', 'Gestion des factures fournisseurs'),
('Achats', 'Retours fournisseurs', 'read', 'Consultation des retours fournisseurs'),
('Achats', 'Retours fournisseurs', 'write', 'Gestion des retours fournisseurs');

-- Clients (avec sous-menus)
INSERT INTO public.permissions (menu, submenu, action, description) VALUES
('Clients', NULL, 'read', 'Consultation des clients'),
('Clients', NULL, 'write', 'Gestion des clients'),
('Clients', NULL, 'delete', 'Suppression des clients'),
('Clients', 'Liste', 'read', 'Consultation de la liste des clients'),
('Clients', 'Liste', 'write', 'Gestion de la liste des clients'),
('Clients', 'Meilleurs Clients', 'read', 'Consultation des meilleurs clients'),
('Clients', 'Clients Endettés', 'read', 'Consultation des clients endettés'),
('Clients', 'Clients Endettés', 'write', 'Gestion des dettes clients');

-- Caisse (avec tous les sous-menus)
INSERT INTO public.permissions (menu, submenu, action, description) VALUES
('Caisse', NULL, 'read', 'Accès à la caisse'),
('Caisse', NULL, 'write', 'Gestion de la caisse'),
('Caisse', 'Aperçu du jour', 'read', 'Consultation de l''aperçu du jour'),
('Caisse', 'Aperçu du jour', 'write', 'Gestion de l''aperçu du jour'),
('Caisse', 'Historique complet', 'read', 'Consultation de l''historique complet'),
('Caisse', 'Clôtures', 'read', 'Consultation des clôtures de caisse'),
('Caisse', 'Clôtures', 'write', 'Gestion des clôtures de caisse'),
('Caisse', 'Comptages', 'read', 'Consultation des comptages de caisse'),
('Caisse', 'Comptages', 'write', 'Gestion des comptages de caisse'),
('Caisse', 'Dépenses - Sorties', 'read', 'Consultation des sorties de caisse'),
('Caisse', 'Dépenses - Sorties', 'write', 'Gestion des sorties de caisse'),
('Caisse', 'Dépenses - Sorties', 'delete', 'Suppression des sorties de caisse'),
('Caisse', 'Dépenses - Entrées', 'read', 'Consultation des entrées de caisse'),
('Caisse', 'Dépenses - Entrées', 'write', 'Gestion des entrées de caisse'),
('Caisse', 'Dépenses - Catégories', 'read', 'Consultation des catégories de dépenses'),
('Caisse', 'Dépenses - Catégories', 'write', 'Gestion des catégories de dépenses'),
('Caisse', 'Dépenses - Catégories', 'delete', 'Suppression des catégories de dépenses');

-- Rapports (avec sous-menus)
INSERT INTO public.permissions (menu, submenu, action, description) VALUES
('Rapports', NULL, 'read', 'Accès aux rapports'),
('Rapports', 'Ventes', 'read', 'Rapports de ventes'),
('Rapports', 'Achats', 'read', 'Rapports d''achats'),
('Rapports', 'Stock', 'read', 'Rapports de stock'),
('Rapports', 'Clients', 'read', 'Rapports clients'),
('Rapports', 'Caisse', 'read', 'Rapports de caisse'),
('Rapports', 'Financiers', 'read', 'Rapports financiers'),
('Rapports', 'Marges', 'read', 'Rapports de marges');

-- Marges (menu séparé)
INSERT INTO public.permissions (menu, submenu, action, description) VALUES
('Marges', NULL, 'read', 'Accès aux marges'),
('Marges', 'Articles', 'read', 'Marges par article'),
('Marges', 'Catégories', 'read', 'Marges par catégorie'),
('Marges', 'Factures', 'read', 'Marges par facture'),
('Marges', 'Globales', 'read', 'Marges globales'),
('Marges', 'Périodes', 'read', 'Marges par période');

-- Paramètres (avec tous les sous-menus)
INSERT INTO public.permissions (menu, submenu, action, description) VALUES
('Paramètres', NULL, 'read', 'Accès aux paramètres'),
('Paramètres', NULL, 'write', 'Gestion des paramètres'),
('Paramètres', 'Zone Géographique', 'read', 'Consultation des zones géographiques'),
('Paramètres', 'Zone Géographique', 'write', 'Gestion des zones géographiques'),
('Paramètres', 'Fournisseurs', 'read', 'Consultation des fournisseurs'),
('Paramètres', 'Fournisseurs', 'write', 'Gestion des fournisseurs'),
('Paramètres', 'Entrepôts', 'read', 'Consultation des entrepôts'),
('Paramètres', 'Entrepôts', 'write', 'Gestion des entrepôts'),
('Paramètres', 'Points de vente', 'read', 'Consultation des points de vente'),
('Paramètres', 'Points de vente', 'write', 'Gestion des points de vente'),
('Paramètres', 'Utilisateurs', 'read', 'Consultation des utilisateurs'),
('Paramètres', 'Utilisateurs', 'write', 'Gestion des utilisateurs'),
('Paramètres', 'Rôles et permissions', 'read', 'Consultation des permissions'),
('Paramètres', 'Rôles et permissions', 'write', 'Gestion des permissions');