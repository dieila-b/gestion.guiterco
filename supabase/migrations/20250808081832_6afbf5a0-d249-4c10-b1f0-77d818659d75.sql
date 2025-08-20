-- Ajouter toutes les permissions manquantes pour chaque sous-menu
-- Nettoyer d'abord les permissions incomplètes
DELETE FROM public.permissions WHERE id IN (
  SELECT p.id FROM public.permissions p
  LEFT JOIN public.menus m ON p.menu = m.nom
  WHERE m.id IS NULL
);

-- Insérer toutes les permissions manquantes
INSERT INTO public.permissions (menu, submenu, action, description) VALUES
-- Achats - Bons de livraison
('Achats', 'Bons de livraison', 'read', 'Consulter les bons de livraison'),
('Achats', 'Bons de livraison', 'write', 'Créer et modifier les bons de livraison'),
('Achats', 'Bons de livraison', 'delete', 'Supprimer les bons de livraison'),
('Achats', 'Bons de livraison', 'validate', 'Valider les bons de livraison'),
('Achats', 'Bons de livraison', 'receive', 'Réceptionner les livraisons'),

-- Achats - Factures d'Achats
('Achats', 'Factures d''Achats', 'read', 'Consulter les factures d''achat'),
('Achats', 'Factures d''Achats', 'write', 'Créer et modifier les factures d''achat'),
('Achats', 'Factures d''Achats', 'delete', 'Supprimer les factures d''achat'),
('Achats', 'Factures d''Achats', 'validate', 'Valider les factures d''achat'),
('Achats', 'Factures d''Achats', 'payment', 'Gérer les paiements fournisseurs'),

-- Achats - Retours Fournisseurs
('Achats', 'Retours Fournisseurs', 'read', 'Consulter les retours fournisseurs'),
('Achats', 'Retours Fournisseurs', 'write', 'Créer et modifier les retours fournisseurs'),
('Achats', 'Retours Fournisseurs', 'delete', 'Supprimer les retours fournisseurs'),
('Achats', 'Retours Fournisseurs', 'validate', 'Valider les retours fournisseurs'),

-- Stock - Transferts
('Stock', 'Transferts', 'read', 'Consulter les transferts de stock'),
('Stock', 'Transferts', 'write', 'Créer et modifier les transferts'),
('Stock', 'Transferts', 'delete', 'Supprimer les transferts'),
('Stock', 'Transferts', 'validate', 'Valider les transferts'),
('Stock', 'Transferts', 'transfer', 'Effectuer les transferts'),

-- Stock - Entrées
('Stock', 'Entrées', 'read', 'Consulter les entrées de stock'),
('Stock', 'Entrées', 'write', 'Créer et modifier les entrées'),
('Stock', 'Entrées', 'delete', 'Supprimer les entrées'),
('Stock', 'Entrées', 'validate', 'Valider les entrées'),
('Stock', 'Entrées', 'receive', 'Réceptionner du stock'),

-- Stock - Sorties
('Stock', 'Sorties', 'read', 'Consulter les sorties de stock'),
('Stock', 'Sorties', 'write', 'Créer et modifier les sorties'),
('Stock', 'Sorties', 'delete', 'Supprimer les sorties'),
('Stock', 'Sorties', 'validate', 'Valider les sorties'),
('Stock', 'Sorties', 'deliver', 'Effectuer les livraisons'),

-- Stock - Mouvements
('Stock', 'Mouvements', 'read', 'Consulter l''historique des mouvements'),
('Stock', 'Mouvements', 'export', 'Exporter les mouvements'),
('Stock', 'Mouvements', 'print', 'Imprimer les rapports de mouvements'),

-- Ventes - Devis
('Ventes', 'Devis', 'read', 'Consulter les devis'),
('Ventes', 'Devis', 'write', 'Créer et modifier les devis'),
('Ventes', 'Devis', 'delete', 'Supprimer les devis'),
('Ventes', 'Devis', 'validate', 'Valider les devis'),
('Ventes', 'Devis', 'convert', 'Convertir en facture'),

-- Ventes - Vente au Comptoir
('Ventes', 'Vente au Comptoir', 'read', 'Consulter les ventes comptoir'),
('Ventes', 'Vente au Comptoir', 'write', 'Effectuer des ventes comptoir'),
('Ventes', 'Vente au Comptoir', 'payment', 'Encaisser les paiements'),
('Ventes', 'Vente au Comptoir', 'print', 'Imprimer les tickets'),

-- Ventes - Retours
('Ventes', 'Retours', 'read', 'Consulter les retours clients'),
('Ventes', 'Retours', 'write', 'Créer et modifier les retours'),
('Ventes', 'Retours', 'delete', 'Supprimer les retours'),
('Ventes', 'Retours', 'validate', 'Valider les retours'),

-- Caisse - Dépenses
('Caisse', 'Dépenses', 'read', 'Consulter les dépenses'),
('Caisse', 'Dépenses', 'write', 'Créer et modifier les dépenses'),
('Caisse', 'Dépenses', 'delete', 'Supprimer les dépenses'),
('Caisse', 'Dépenses', 'validate', 'Valider les dépenses'),

-- Caisse - Clôtures
('Caisse', 'Clôtures', 'read', 'Consulter les clôtures'),
('Caisse', 'Clôtures', 'write', 'Effectuer les clôtures'),
('Caisse', 'Clôtures', 'close', 'Clôturer la caisse'),
('Caisse', 'Clôtures', 'reopen', 'Rouvrir une clôture'),

-- Caisse - Opérations
('Caisse', 'Opérations', 'read', 'Consulter les opérations de caisse'),
('Caisse', 'Opérations', 'write', 'Effectuer des opérations'),
('Caisse', 'Opérations', 'validate', 'Valider les opérations'),

-- Rapports - Ventes
('Rapports', 'Ventes', 'read', 'Consulter les rapports de ventes'),
('Rapports', 'Ventes', 'export', 'Exporter les rapports de ventes'),
('Rapports', 'Ventes', 'print', 'Imprimer les rapports de ventes'),

-- Rapports - Achats
('Rapports', 'Achats', 'read', 'Consulter les rapports d''achats'),
('Rapports', 'Achats', 'export', 'Exporter les rapports d''achats'),
('Rapports', 'Achats', 'print', 'Imprimer les rapports d''achats'),

-- Rapports - Stock
('Rapports', 'Stock', 'read', 'Consulter les rapports de stock'),
('Rapports', 'Stock', 'export', 'Exporter les rapports de stock'),
('Rapports', 'Stock', 'print', 'Imprimer les rapports de stock'),

-- Rapports - Clients
('Rapports', 'Clients', 'read', 'Consulter les rapports clients'),
('Rapports', 'Clients', 'export', 'Exporter les rapports clients'),
('Rapports', 'Clients', 'print', 'Imprimer les rapports clients'),

-- Paramètres - Utilisateurs
('Paramètres', 'Utilisateurs', 'read', 'Consulter les utilisateurs'),
('Paramètres', 'Utilisateurs', 'write', 'Créer et modifier les utilisateurs'),
('Paramètres', 'Utilisateurs', 'delete', 'Supprimer les utilisateurs'),
('Paramètres', 'Utilisateurs', 'validate', 'Valider les comptes utilisateurs'),

-- Paramètres - Fournisseurs
('Paramètres', 'Fournisseurs', 'read', 'Consulter les fournisseurs'),
('Paramètres', 'Fournisseurs', 'write', 'Créer et modifier les fournisseurs'),
('Paramètres', 'Fournisseurs', 'delete', 'Supprimer les fournisseurs'),
('Paramètres', 'Fournisseurs', 'validate', 'Valider les fournisseurs'),

-- Paramètres - Système
('Paramètres', 'Système', 'read', 'Consulter les paramètres système'),
('Paramètres', 'Système', 'write', 'Modifier les paramètres système'),
('Paramètres', 'Système', 'validate', 'Valider les configurations')

ON CONFLICT (menu, COALESCE(submenu, ''), action) DO NOTHING;

-- Attribuer toutes les nouvelles permissions au rôle Administrateur
INSERT INTO public.role_permissions (role_id, permission_id, can_access)
SELECT 
  r.id as role_id,
  p.id as permission_id,
  true as can_access
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'Administrateur'
ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;

-- Attribuer des permissions spécifiques aux autres rôles
-- Manager : toutes permissions sauf delete système et validate utilisateurs
INSERT INTO public.role_permissions (role_id, permission_id, can_access)
SELECT 
  r.id as role_id,
  p.id as permission_id,
  true as can_access
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'Manager'
  AND NOT (p.menu = 'Paramètres' AND p.submenu = 'Système' AND p.action = 'write')
  AND NOT (p.menu = 'Paramètres' AND p.submenu = 'Utilisateurs' AND p.action IN ('delete', 'validate'))
ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;

-- Vendeur : permissions de vente, clients et consultation
INSERT INTO public.role_permissions (role_id, permission_id, can_access)
SELECT 
  r.id as role_id,
  p.id as permission_id,
  true as can_access
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'Vendeur'
  AND (
    (p.menu IN ('Dashboard', 'Catalogue', 'Clients') AND p.action IN ('read', 'export', 'print')) OR
    (p.menu = 'Ventes' AND p.action IN ('read', 'write', 'validate', 'convert', 'payment', 'print')) OR
    (p.menu = 'Stock' AND p.submenu = 'PDV' AND p.action IN ('read', 'write')) OR
    (p.menu = 'Rapports' AND p.submenu IN ('Ventes', 'Clients') AND p.action IN ('read', 'export', 'print'))
  )
ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;

-- Caissier : permissions de caisse et vente comptoir uniquement
INSERT INTO public.role_permissions (role_id, permission_id, can_access)
SELECT 
  r.id as role_id,
  p.id as permission_id,
  true as can_access
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'Caissier'
  AND (
    (p.menu = 'Dashboard' AND p.action = 'read') OR
    (p.menu = 'Catalogue' AND p.action = 'read') OR
    (p.menu = 'Clients' AND p.action IN ('read', 'write')) OR
    (p.menu = 'Ventes' AND p.submenu = 'Vente au Comptoir' AND p.action IN ('read', 'write', 'payment', 'print')) OR
    (p.menu = 'Caisse' AND p.action IN ('read', 'write', 'close', 'validate', 'export', 'print')) OR
    (p.menu = 'Stock' AND p.submenu = 'PDV' AND p.action = 'read')
  )
ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;