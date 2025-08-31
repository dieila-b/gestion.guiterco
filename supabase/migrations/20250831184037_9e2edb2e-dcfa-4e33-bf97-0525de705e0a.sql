
-- 1. Supprimer les permissions en doublon ou incorrectes
DELETE FROM public.role_permissions WHERE permission_id IN (
  SELECT id FROM public.permissions WHERE menu = 'Stock' AND submenu IS NULL
);

DELETE FROM public.permissions WHERE menu = 'Stock' AND submenu IS NULL;

-- 2. Insérer toutes les permissions complètes de l'application
INSERT INTO public.permissions (menu, submenu, action, description) VALUES
-- Dashboard
('Dashboard', NULL, 'read', 'Accès au tableau de bord principal'),

-- Catalogue
('Catalogue', NULL, 'read', 'Consultation du catalogue produits'),
('Catalogue', NULL, 'write', 'Modification du catalogue produits'),
('Catalogue', NULL, 'delete', 'Suppression d''articles du catalogue'),

-- Stock avec tous ses sous-menus
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

-- Ventes avec tous ses sous-menus
('Ventes', 'Factures', 'read', 'Consultation des factures de vente'),
('Ventes', 'Factures', 'write', 'Création/modification des factures de vente'),
('Ventes', 'Factures', 'delete', 'Suppression des factures de vente'),
('Ventes', 'Précommandes', 'read', 'Consultation des précommandes'),
('Ventes', 'Précommandes', 'write', 'Création/modification des précommandes'),
('Ventes', 'Précommandes', 'delete', 'Suppression des précommandes'),
('Ventes', 'Devis', 'read', 'Consultation des devis'),
('Ventes', 'Devis', 'write', 'Création/modification des devis'),
('Ventes', 'Devis', 'delete', 'Suppression des devis'),

-- Achats avec tous ses sous-menus
('Achats', 'Bons de commande', 'read', 'Consultation des bons de commande'),
('Achats', 'Bons de commande', 'write', 'Création/modification des bons de commande'),
('Achats', 'Bons de commande', 'delete', 'Suppression des bons de commande'),
('Achats', 'Bons de livraison', 'read', 'Consultation des bons de livraison'),
('Achats', 'Bons de livraison', 'write', 'Création/modification des bons de livraison'),
('Achats', 'Bons de livraison', 'delete', 'Suppression des bons de livraison'),
('Achats', 'Factures fournisseurs', 'read', 'Consultation des factures fournisseurs'),
('Achats', 'Factures fournisseurs', 'write', 'Création/modification des factures fournisseurs'),

-- Clients
('Clients', NULL, 'read', 'Consultation de la liste des clients'),
('Clients', NULL, 'write', 'Création/modification des clients'),
('Clients', NULL, 'delete', 'Suppression des clients'),

-- Caisse
('Caisse', NULL, 'read', 'Accès aux fonctionnalités de caisse'),
('Caisse', NULL, 'write', 'Utilisation de la caisse (ventes, encaissements)'),
('Caisse', 'Clôtures', 'read', 'Consultation des clôtures de caisse'),
('Caisse', 'Clôtures', 'write', 'Réalisation des clôtures de caisse'),
('Caisse', 'Comptages', 'read', 'Consultation des comptages de caisse'),
('Caisse', 'Comptages', 'write', 'Réalisation des comptages de caisse'),

-- Rapports avec tous ses sous-menus
('Rapports', 'Ventes', 'read', 'Consultation des rapports de vente'),
('Rapports', 'Achats', 'read', 'Consultation des rapports d''achats'),
('Rapports', 'Stock', 'read', 'Consultation des rapports de stock'),
('Rapports', 'Clients', 'read', 'Consultation des rapports clients'),
('Rapports', 'Marges', 'read', 'Consultation des rapports de marges'),
('Rapports', 'Financiers', 'read', 'Consultation des rapports financiers'),
('Rapports', 'Caisse', 'read', 'Consultation des rapports de caisse'),

-- Marges avec tous ses sous-menus
('Marges', 'Articles', 'read', 'Consultation des marges par article'),
('Marges', 'Catégories', 'read', 'Consultation des marges par catégorie'),
('Marges', 'Globales', 'read', 'Consultation des marges globales'),
('Marges', 'Factures', 'read', 'Consultation des marges par facture'),
('Marges', 'Périodes', 'read', 'Consultation des marges par période'),

-- Paramètres avec tous ses sous-menus
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
('Paramètres', 'Permissions', 'write', 'Modification des rôles et permissions'),
('Paramètres', 'Rôles et permissions', 'read', 'Consultation des rôles et permissions (legacy)'),
('Paramètres', 'Rôles et permissions', 'write', 'Modification des rôles et permissions (legacy)')

ON CONFLICT (menu, COALESCE(submenu, ''), action) DO UPDATE SET
description = EXCLUDED.description;

-- 3. Assigner automatiquement TOUTES les permissions au rôle Admin
INSERT INTO public.role_permissions (role_id, permission_id, can_access)
SELECT 
  '550e8400-e29b-41d4-a716-446655440000' as role_id,
  p.id as permission_id,
  true as can_access
FROM public.permissions p
WHERE NOT EXISTS (
  SELECT 1 FROM public.role_permissions rp 
  WHERE rp.role_id = '550e8400-e29b-41d4-a716-446655440000' 
  AND rp.permission_id = p.id
);

-- 4. Mettre à jour les permissions existantes pour le rôle Admin
UPDATE public.role_permissions 
SET can_access = true 
WHERE role_id = '550e8400-e29b-41d4-a716-446655440000';

-- 5. Vérification - Compter toutes les permissions par menu
SELECT 
  p.menu,
  p.submenu,
  COUNT(*) as nombre_permissions,
  STRING_AGG(p.action, ', ' ORDER BY p.action) as actions_disponibles
FROM public.permissions p
GROUP BY p.menu, p.submenu
ORDER BY p.menu, p.submenu;

-- 6. Vérification - Permissions assignées au rôle Admin
SELECT 
  COUNT(*) as total_permissions_admin,
  COUNT(CASE WHEN rp.can_access = true THEN 1 END) as permissions_accordees
FROM public.permissions p
LEFT JOIN public.role_permissions rp ON p.id = rp.permission_id 
  AND rp.role_id = '550e8400-e29b-41d4-a716-446655440000';
