
-- 1. Vérifier l'état actuel des permissions
SELECT 
  menu,
  submenu, 
  action,
  COUNT(*) as count
FROM public.permissions 
GROUP BY menu, submenu, action
ORDER BY menu, submenu, action;

-- 2. Supprimer toutes les permissions existantes pour recommencer proprement
DELETE FROM public.role_permissions;
DELETE FROM public.permissions;

-- 3. Insérer TOUTES les permissions de l'application de manière systématique
INSERT INTO public.permissions (menu, submenu, action, description) VALUES
-- Dashboard (1 permission)
('Dashboard', NULL, 'read', 'Accès au tableau de bord principal'),

-- Catalogue (3 permissions)
('Catalogue', NULL, 'read', 'Consultation du catalogue produits'),
('Catalogue', NULL, 'write', 'Modification du catalogue produits'), 
('Catalogue', NULL, 'delete', 'Suppression d''articles du catalogue'),

-- Stock avec TOUS ses sous-menus (11 permissions)
('Stock', 'Entrepôts', 'read', 'Consultation du stock des entrepôts'),
('Stock', 'Entrepôts', 'write', 'Modification du stock des entrepôts'),
('Stock', 'Entrepôts', 'delete', 'Suppression d''entrées de stock entrepôts'),
('Stock', 'PDV', 'read', 'Consultation du stock des points de vente'),
('Stock', 'PDV', 'write', 'Modification du stock des points de vente'),
('Stock', 'PDV', 'delete', 'Suppression d''entrées de stock PDV'),
('Stock', 'Mouvements', 'read', 'Consultation des mouvements de stock'),
('Stock', 'Mouvements', 'write', 'Création de mouvements de stock'),
('Stock', 'Inventaire', 'read', 'Consultation des inventaires'),
('Stock', 'Inventaire', 'write', 'Réalisation d''inventaires'),

-- Ventes avec TOUS ses sous-menus (9 permissions)
('Ventes', 'Factures', 'read', 'Consultation des factures de vente'),
('Ventes', 'Factures', 'write', 'Création/modification des factures de vente'),
('Ventes', 'Factures', 'delete', 'Suppression des factures de vente'),
('Ventes', 'Précommandes', 'read', 'Consultation des précommandes'),
('Ventes', 'Précommandes', 'write', 'Création/modification des précommandes'),
('Ventes', 'Précommandes', 'delete', 'Suppression des précommandes'),
('Ventes', 'Devis', 'read', 'Consultation des devis'),
('Ventes', 'Devis', 'write', 'Création/modification des devis'),
('Ventes', 'Devis', 'delete', 'Suppression des devis'),

-- Achats avec TOUS ses sous-menus (8 permissions)
('Achats', 'Bons de commande', 'read', 'Consultation des bons de commande'),
('Achats', 'Bons de commande', 'write', 'Création/modification des bons de commande'),
('Achats', 'Bons de commande', 'delete', 'Suppression des bons de commande'),
('Achats', 'Bons de livraison', 'read', 'Consultation des bons de livraison'),
('Achats', 'Bons de livraison', 'write', 'Création/modification des bons de livraison'),
('Achats', 'Bons de livraison', 'delete', 'Suppression des bons de livraison'),
('Achats', 'Factures fournisseurs', 'read', 'Consultation des factures fournisseurs'),
('Achats', 'Factures fournisseurs', 'write', 'Création/modification des factures fournisseurs'),

-- Clients (3 permissions)
('Clients', NULL, 'read', 'Consultation de la liste des clients'),
('Clients', NULL, 'write', 'Création/modification des clients'),
('Clients', NULL, 'delete', 'Suppression des clients'),

-- Caisse avec TOUS ses sous-menus (6 permissions)
('Caisse', NULL, 'read', 'Accès aux fonctionnalités de caisse'),
('Caisse', NULL, 'write', 'Utilisation de la caisse (ventes, encaissements)'),
('Caisse', 'Clôtures', 'read', 'Consultation des clôtures de caisse'),
('Caisse', 'Clôtures', 'write', 'Réalisation des clôtures de caisse'),
('Caisse', 'Comptages', 'read', 'Consultation des comptages de caisse'),
('Caisse', 'Comptages', 'write', 'Réalisation des comptages de caisse'),

-- Rapports avec TOUS ses sous-menus (7 permissions)
('Rapports', 'Ventes', 'read', 'Consultation des rapports de vente'),
('Rapports', 'Achats', 'read', 'Consultation des rapports d''achats'),
('Rapports', 'Stock', 'read', 'Consultation des rapports de stock'),
('Rapports', 'Clients', 'read', 'Consultation des rapports clients'),
('Rapports', 'Marges', 'read', 'Consultation des rapports de marges'),
('Rapports', 'Financiers', 'read', 'Consultation des rapports financiers'),
('Rapports', 'Caisse', 'read', 'Consultation des rapports de caisse'),

-- Marges avec TOUS ses sous-menus (5 permissions)
('Marges', 'Articles', 'read', 'Consultation des marges par article'),
('Marges', 'Catégories', 'read', 'Consultation des marges par catégorie'),
('Marges', 'Globales', 'read', 'Consultation des marges globales'),
('Marges', 'Factures', 'read', 'Consultation des marges par facture'),
('Marges', 'Périodes', 'read', 'Consultation des marges par période'),

-- Paramètres avec TOUS ses sous-menus (12 permissions)
('Paramètres', 'Zone Géographique', 'read', 'Consultation des zones géographiques'),
('Paramètres', 'Zone Géographique', 'write', 'Modification des zones géographiques'),
('Paramètres', 'Fournisseurs', 'read', 'Consultation des paramètres fournisseurs'),
('Paramètres', 'Fournisseurs', 'write', 'Modification des paramètres fournisseurs'),
('Paramètres', 'Entrepôts', 'read', 'Consultation des paramètres entrepôts'),
('Paramètres', 'Entrepôts', 'write', 'Modification des paramètres entrepôts'),
('Paramètres', 'Points de vente', 'read', 'Consultation des paramètres PDV'),
('Paramètres', 'Points de vente', 'write', 'Modification des paramètres PDV'),
('Paramètres', 'Utilisateurs', 'read', 'Consultation des utilisateurs internes'),
('Paramètres', 'Utilisateurs', 'write', 'Gestion des utilisateurs internes'),
('Paramètres', 'Permissions', 'read', 'Consultation des rôles et permissions'),
('Paramètres', 'Permissions', 'write', 'Modification des rôles et permissions');

-- 4. Vérifier qu'on a bien toutes les permissions (devrait être 65 au total)
SELECT 
  COUNT(*) as total_permissions,
  COUNT(DISTINCT menu) as nombre_menus,
  COUNT(DISTINCT CONCAT(menu, '-', COALESCE(submenu, 'PRINCIPAL'))) as nombre_sous_menus
FROM public.permissions;

-- 5. Assigner TOUTES les permissions au rôle Admin
INSERT INTO public.role_permissions (role_id, permission_id, can_access)
SELECT 
  r.id as role_id,
  p.id as permission_id,
  true as can_access
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'Admin';

-- 6. Vérification finale - Structure complète des permissions
SELECT 
  p.menu,
  p.submenu,
  COUNT(*) as nombre_actions,
  STRING_AGG(p.action, ', ' ORDER BY p.action) as actions
FROM public.permissions p
GROUP BY p.menu, p.submenu
ORDER BY p.menu, 
  CASE WHEN p.submenu IS NULL THEN 0 ELSE 1 END,
  p.submenu;

-- 7. Vérifier les permissions assignées au rôle Admin
SELECT 
  COUNT(*) as permissions_admin_total,
  COUNT(CASE WHEN rp.can_access = true THEN 1 END) as permissions_accordees
FROM public.permissions p
JOIN public.role_permissions rp ON p.id = rp.permission_id
JOIN public.roles r ON rp.role_id = r.id
WHERE r.name = 'Admin';
