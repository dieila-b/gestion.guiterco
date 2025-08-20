
-- Corriger les permissions manquantes pour tous les sous-menus
-- D'abord, supprimer les permissions orphelines qui pourraient causer des conflits
DELETE FROM public.permissions 
WHERE menu_id IS NULL AND sous_menu_id IS NULL;

-- Insérer toutes les permissions manquantes de manière exhaustive
WITH menu_sous_menu_complet AS (
  SELECT 
    m.id as menu_id,
    m.nom as menu_nom,
    sm.id as sous_menu_id,
    sm.nom as sous_menu_nom
  FROM public.menus m
  LEFT JOIN public.sous_menus sm ON m.id = sm.menu_id
  WHERE m.statut = 'actif' 
    AND (sm.statut IS NULL OR sm.statut = 'actif')
),
permissions_completes AS (
  SELECT 
    msc.menu_id,
    msc.sous_menu_id,
    msc.menu_nom as menu,
    msc.sous_menu_nom as submenu,
    p.action,
    p.description || CASE 
      WHEN msc.sous_menu_nom IS NOT NULL THEN ' - ' || msc.menu_nom || ' > ' || msc.sous_menu_nom
      ELSE ' - ' || msc.menu_nom
    END as description
  FROM menu_sous_menu_complet msc
  CROSS JOIN (VALUES
    ('read', 'Consulter et visualiser'),
    ('write', 'Créer et modifier'),
    ('delete', 'Supprimer'),
    ('validate', 'Valider et approuver'),
    ('cancel', 'Annuler'),
    ('export', 'Exporter les données'),
    ('import', 'Importer les données'),
    ('convert', 'Convertir (ex: devis en facture)'),
    ('print', 'Imprimer les documents'),
    ('close', 'Clôturer (ex: caisse, période)'),
    ('reopen', 'Rouvrir'),
    ('transfer', 'Effectuer des transferts'),
    ('receive', 'Réceptionner'),
    ('deliver', 'Livrer'),
    ('invoice', 'Facturer'),
    ('payment', 'Gérer les paiements')
  ) AS p(action, description)
  WHERE 
    CASE 
      -- Dashboard : lecture et export uniquement
      WHEN msc.menu_nom = 'Dashboard' THEN 
        p.action IN ('read', 'export')
      
      -- Catalogue : CRUD complet + import/export
      WHEN msc.menu_nom = 'Catalogue' THEN 
        p.action IN ('read', 'write', 'delete', 'export', 'import', 'print')
      
      -- Stock : toutes actions selon le sous-menu
      WHEN msc.menu_nom = 'Stock' THEN 
        CASE 
          WHEN msc.sous_menu_nom = 'Entrepôts' THEN 
            p.action IN ('read', 'write', 'delete', 'export', 'print', 'receive', 'transfer', 'validate')
          WHEN msc.sous_menu_nom = 'PDV' THEN 
            p.action IN ('read', 'write', 'delete', 'export', 'print', 'receive', 'transfer', 'validate')
          WHEN msc.sous_menu_nom = 'Transferts' THEN 
            p.action IN ('read', 'write', 'delete', 'export', 'print', 'transfer', 'validate', 'cancel')
          WHEN msc.sous_menu_nom = 'Entrées' THEN 
            p.action IN ('read', 'write', 'delete', 'export', 'print', 'receive', 'validate')
          WHEN msc.sous_menu_nom = 'Sorties' THEN 
            p.action IN ('read', 'write', 'delete', 'export', 'print', 'deliver', 'validate')
          WHEN msc.sous_menu_nom = 'Mouvements' THEN 
            p.action IN ('read', 'export', 'print')
          WHEN msc.sous_menu_nom = 'Inventaires' THEN 
            p.action IN ('read', 'write', 'delete', 'export', 'print', 'validate', 'close')
          ELSE p.action IN ('read', 'write', 'delete', 'export', 'print')
        END
      
      -- Achats : workflow complet selon le sous-menu
      WHEN msc.menu_nom = 'Achats' THEN 
        CASE 
          WHEN msc.sous_menu_nom = 'Bons de commande' THEN 
            p.action IN ('read', 'write', 'delete', 'validate', 'cancel', 'export', 'print', 'convert')
          WHEN msc.sous_menu_nom = 'Bons de livraison' THEN 
            p.action IN ('read', 'write', 'delete', 'validate', 'export', 'print', 'receive', 'convert')
          WHEN msc.sous_menu_nom = 'Factures' THEN 
            p.action IN ('read', 'write', 'delete', 'validate', 'export', 'print', 'payment')
          WHEN msc.sous_menu_nom = 'Fournisseurs' THEN 
            p.action IN ('read', 'write', 'delete', 'export', 'import', 'print')
          ELSE p.action IN ('read', 'write', 'delete', 'export', 'print')
        END
      
      -- Ventes : workflow complet selon le sous-menu
      WHEN msc.menu_nom = 'Ventes' THEN 
        CASE 
          WHEN msc.sous_menu_nom = 'Factures' THEN 
            p.action IN ('read', 'write', 'delete', 'validate', 'cancel', 'export', 'print', 'deliver', 'payment')
          WHEN msc.sous_menu_nom = 'Précommandes' THEN 
            p.action IN ('read', 'write', 'delete', 'validate', 'cancel', 'export', 'print', 'convert', 'deliver')
          WHEN msc.sous_menu_nom = 'Devis' THEN 
            p.action IN ('read', 'write', 'delete', 'validate', 'cancel', 'export', 'print', 'convert')
          WHEN msc.sous_menu_nom = 'Vente au Comptoir' THEN 
            p.action IN ('read', 'write', 'delete', 'export', 'print', 'payment')
          WHEN msc.sous_menu_nom = 'Factures impayées' THEN 
            p.action IN ('read', 'export', 'print', 'payment', 'cancel')
          WHEN msc.sous_menu_nom = 'Retours Clients' THEN 
            p.action IN ('read', 'write', 'delete', 'validate', 'export', 'print')
          ELSE p.action IN ('read', 'write', 'delete', 'export', 'print')
        END
      
      -- Clients : CRM complet (pas de sous-menus)
      WHEN msc.menu_nom = 'Clients' AND msc.sous_menu_nom IS NULL THEN 
        p.action IN ('read', 'write', 'delete', 'export', 'import', 'print')
      
      -- Caisse : gestion financière selon le sous-menu
      WHEN msc.menu_nom = 'Caisse' THEN 
        CASE 
          WHEN msc.sous_menu_nom = 'Dépenses' THEN 
            p.action IN ('read', 'write', 'delete', 'validate', 'export', 'print')
          WHEN msc.sous_menu_nom = 'Aperçu du jour' THEN 
            p.action IN ('read', 'export', 'print')
          WHEN msc.sous_menu_nom = 'Clôtures' THEN 
            p.action IN ('read', 'write', 'close', 'reopen', 'export', 'print', 'validate')
          WHEN msc.sous_menu_nom = 'Comptages' THEN 
            p.action IN ('read', 'write', 'delete', 'validate', 'export', 'print')
          ELSE p.action IN ('read', 'write', 'export', 'print')
        END
      
      -- Rapports : consultation et export selon le sous-menu
      WHEN msc.menu_nom = 'Rapports' THEN 
        p.action IN ('read', 'export', 'print')
      
      -- Paramètres : administration selon le sous-menu
      WHEN msc.menu_nom = 'Paramètres' THEN 
        CASE 
          WHEN msc.sous_menu_nom = 'Utilisateurs' THEN 
            p.action IN ('read', 'write', 'delete', 'export', 'import', 'validate')
          WHEN msc.sous_menu_nom = 'Rôles et permissions' THEN 
            p.action IN ('read', 'write', 'delete', 'export', 'validate')
          WHEN msc.sous_menu_nom = 'Fournisseurs' THEN 
            p.action IN ('read', 'write', 'delete', 'export', 'import', 'validate')
          WHEN msc.sous_menu_nom = 'Entrepôts' THEN 
            p.action IN ('read', 'write', 'delete', 'export', 'validate')
          WHEN msc.sous_menu_nom = 'Points de vente' THEN 
            p.action IN ('read', 'write', 'delete', 'export', 'validate')
          WHEN msc.sous_menu_nom = 'Système' THEN 
            p.action IN ('read', 'write', 'validate')
          ELSE p.action IN ('read', 'write', 'delete', 'export')
        END
      
      ELSE TRUE -- Par défaut, toutes les actions pour les cas non prévus
    END
)
INSERT INTO public.permissions (menu_id, sous_menu_id, menu, submenu, action, description)
SELECT 
  menu_id,
  sous_menu_id,
  menu,
  submenu,
  action,
  description
FROM permissions_completes
ON CONFLICT (menu, COALESCE(submenu, ''), action) DO UPDATE SET 
  description = EXCLUDED.description,
  menu_id = EXCLUDED.menu_id,
  sous_menu_id = EXCLUDED.sous_menu_id;

-- S'assurer que le rôle Administrateur a TOUTES les permissions (y compris les nouvelles)
INSERT INTO public.role_permissions (role_id, permission_id, can_access)
SELECT 
  r.id as role_id,
  p.id as permission_id,
  true as can_access
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'Administrateur'
ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;

-- Attribuer des permissions de base aux autres rôles existants
-- Manager : permissions complètes sauf suppression système
INSERT INTO public.role_permissions (role_id, permission_id, can_access)
SELECT 
  r.id as role_id,
  p.id as permission_id,
  true as can_access
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'Manager'
  AND p.action IN ('read', 'write', 'validate', 'export', 'print', 'transfer', 'receive', 'deliver', 'invoice', 'payment', 'convert', 'close')
ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;

-- Vendeur : permissions de vente et consultation
INSERT INTO public.role_permissions (role_id, permission_id, can_access)
SELECT 
  r.id as role_id,
  p.id as permission_id,
  true as can_access
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'Vendeur'
  AND (
    (p.menu IN ('Dashboard', 'Catalogue', 'Clients', 'Ventes') AND p.action IN ('read', 'write', 'export', 'print', 'convert', 'payment')) OR
    (p.menu = 'Stock' AND p.submenu = 'PDV' AND p.action IN ('read', 'write')) OR
    (p.menu = 'Caisse' AND p.action IN ('read', 'write', 'payment')) OR
    (p.menu = 'Rapports' AND p.submenu IN ('Ventes', 'Clients') AND p.action IN ('read', 'export', 'print'))
  )
ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;

-- Caissier : permissions de caisse et vente comptoir
INSERT INTO public.role_permissions (role_id, permission_id, can_access)
SELECT 
  r.id as role_id,
  p.id as permission_id,
  true as can_access
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'Caissier'
  AND (
    (p.menu = 'Dashboard' AND p.action IN ('read')) OR
    (p.menu = 'Catalogue' AND p.action IN ('read')) OR
    (p.menu = 'Clients' AND p.action IN ('read', 'write')) OR
    (p.menu = 'Ventes' AND p.submenu = 'Vente au Comptoir' AND p.action IN ('read', 'write', 'payment', 'print')) OR
    (p.menu = 'Caisse' AND p.action IN ('read', 'write', 'close', 'export', 'print', 'payment', 'validate')) OR
    (p.menu = 'Stock' AND p.submenu = 'PDV' AND p.action IN ('read')) OR
    (p.menu = 'Rapports' AND p.submenu = 'Caisse' AND p.action IN ('read', 'export', 'print'))
  )
ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;

-- Vérifier que toutes les permissions ont été créées correctement
-- Cette requête permet de voir les sous-menus qui pourraient encore manquer de permissions
DO $$
BEGIN
  RAISE NOTICE 'Vérification des permissions par sous-menu:';
  RAISE NOTICE 'Total permissions créées: %', (SELECT COUNT(*) FROM public.permissions);
  RAISE NOTICE 'Total sous-menus: %', (SELECT COUNT(*) FROM public.sous_menus WHERE statut = 'actif');
  RAISE NOTICE 'Sous-menus sans permissions: %', (
    SELECT COUNT(*)
    FROM public.sous_menus sm
    LEFT JOIN public.permissions p ON sm.id = p.sous_menu_id
    WHERE sm.statut = 'actif' AND p.id IS NULL
  );
END $$;
