
-- 1. Créer la table sous_menus si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.sous_menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id uuid REFERENCES public.menus(id) ON DELETE CASCADE,
  nom text NOT NULL,
  description text,
  ordre integer DEFAULT 0,
  statut text DEFAULT 'actif',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. Activer RLS sur sous_menus
ALTER TABLE public.sous_menus ENABLE ROW LEVEL SECURITY;

-- 3. Politique RLS pour sous_menus
CREATE POLICY "Authenticated users can read sous_menus" 
  ON public.sous_menus 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage sous_menus" 
  ON public.sous_menus 
  FOR ALL 
  USING (check_user_permission_strict('Paramètres', 'Rôles et permissions', 'write'))
  WITH CHECK (check_user_permission_strict('Paramètres', 'Rôles et permissions', 'write'));

-- 4. Ajouter une colonne description à la table menus si elle n'existe pas
ALTER TABLE public.menus ADD COLUMN IF NOT EXISTS description text;

-- 5. Insérer tous les menus principaux
INSERT INTO public.menus (nom, icone, ordre, description) VALUES
('Dashboard', 'BarChart3', 1, 'Tableau de bord principal avec indicateurs clés'),
('Catalogue', 'Package', 2, 'Gestion du catalogue produits et articles'),
('Stock', 'Warehouse', 3, 'Gestion complète des stocks et mouvements'),
('Achats', 'ShoppingCart', 4, 'Gestion des achats et approvisionnements'),
('Ventes', 'TrendingUp', 5, 'Gestion des ventes et facturation'),
('Clients', 'Users', 6, 'Gestion de la relation client'),
('Caisse', 'Calculator', 7, 'Gestion de caisse et paiements'),
('Rapports', 'FileText', 8, 'Génération de rapports et analyses'),
('Paramètres', 'Settings', 9, 'Configuration et administration système')
ON CONFLICT (nom) DO UPDATE SET 
  icone = EXCLUDED.icone,
  ordre = EXCLUDED.ordre,
  description = EXCLUDED.description;

-- 6. Insérer tous les sous-menus
WITH menu_ids AS (
  SELECT id, nom FROM public.menus
)
INSERT INTO public.sous_menus (menu_id, nom, description, ordre) 
SELECT m.id, sm.nom, sm.description, sm.ordre
FROM menu_ids m
CROSS JOIN (VALUES
  -- Dashboard (pas de sous-menus, accès direct)
  
  -- Catalogue (pas de sous-menus, accès direct)
  
  -- Stock
  ('Stock', 'Entrepôts', 'Gestion des stocks en entrepôts', 1),
  ('Stock', 'PDV', 'Gestion des stocks points de vente', 2),
  ('Stock', 'Transferts', 'Transferts entre entrepôts et PDV', 3),
  ('Stock', 'Entrées', 'Entrées de stock et réceptions', 4),
  ('Stock', 'Sorties', 'Sorties de stock et expéditions', 5),
  ('Stock', 'Mouvements', 'Historique des mouvements de stock', 6),
  ('Stock', 'Inventaires', 'Gestion des inventaires physiques', 7),
  
  -- Achats
  ('Achats', 'Bons de commande', 'Création et suivi des bons de commande', 1),
  ('Achats', 'Bons de livraison', 'Réception et validation des livraisons', 2),
  ('Achats', 'Factures', 'Gestion des factures fournisseurs', 3),
  ('Achats', 'Fournisseurs', 'Gestion des fournisseurs', 4),
  
  -- Ventes
  ('Ventes', 'Factures', 'Facturation clients', 1),
  ('Ventes', 'Précommandes', 'Gestion des précommandes', 2),
  ('Ventes', 'Devis', 'Création et suivi des devis', 3),
  ('Ventes', 'Vente au Comptoir', 'Ventes directes en magasin', 4),
  ('Ventes', 'Factures impayées', 'Suivi des impayés clients', 5),
  ('Ventes', 'Retours Clients', 'Gestion des retours produits', 6),
  
  -- Clients (pas de sous-menus, accès direct)
  
  -- Caisse
  ('Caisse', 'Dépenses', 'Gestion des dépenses de caisse', 1),
  ('Caisse', 'Aperçu du jour', 'Consultation de l\'aperçu journalier', 2),
  ('Caisse', 'Clôtures', 'Clôtures de caisse quotidiennes', 3),
  ('Caisse', 'Comptages', 'Comptages physiques de caisse', 4),
  
  -- Rapports
  ('Rapports', 'Ventes', 'Rapports de ventes et chiffre d\'affaires', 1),
  ('Rapports', 'Achats', 'Rapports d\'achats et approvisionnements', 2),
  ('Rapports', 'Stock', 'Rapports de stock et inventaires', 3),
  ('Rapports', 'Marges', 'Analyse des marges bénéficiaires', 4),
  ('Rapports', 'Clients', 'Statistiques clients', 5),
  ('Rapports', 'Caisse', 'Rapports de caisse et trésorerie', 6),
  
  -- Paramètres
  ('Paramètres', 'Utilisateurs', 'Gestion des comptes utilisateurs', 1),
  ('Paramètres', 'Rôles et permissions', 'Configuration des droits d\'accès', 2),
  ('Paramètres', 'Fournisseurs', 'Configuration des fournisseurs', 3),
  ('Paramètres', 'Entrepôts', 'Configuration des entrepôts', 4),
  ('Paramètres', 'Points de vente', 'Configuration des points de vente', 5),
  ('Paramètres', 'Système', 'Configuration système générale', 6)
) AS sm(menu_nom, nom, description, ordre)
WHERE m.nom = sm.menu_nom
ON CONFLICT (menu_id, nom) DO UPDATE SET 
  description = EXCLUDED.description,
  ordre = EXCLUDED.ordre;

-- 7. Insérer toutes les permissions de manière exhaustive
WITH menu_sous_menu AS (
  SELECT 
    m.id as menu_id,
    m.nom as menu_nom,
    sm.id as sous_menu_id,
    sm.nom as sous_menu_nom
  FROM public.menus m
  LEFT JOIN public.sous_menus sm ON m.id = sm.menu_id
),
permissions_to_create AS (
  SELECT 
    mss.menu_id,
    mss.sous_menu_id,
    mss.menu_nom as menu,
    mss.sous_menu_nom as submenu,
    p.action,
    p.description
  FROM menu_sous_menu mss
  CROSS JOIN (VALUES
    -- Actions de base pour tous
    ('read', 'Consulter et visualiser'),
    ('write', 'Créer et modifier'),
    ('delete', 'Supprimer'),
    
    -- Actions spécifiques selon le contexte
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
    -- Filtrer les actions selon le contexte métier
    CASE 
      -- Dashboard : lecture uniquement
      WHEN mss.menu_nom = 'Dashboard' THEN p.action IN ('read', 'export')
      
      -- Catalogue : CRUD + export/import
      WHEN mss.menu_nom = 'Catalogue' THEN p.action IN ('read', 'write', 'delete', 'export', 'import', 'print')
      
      -- Stock : toutes actions logistiques
      WHEN mss.menu_nom = 'Stock' THEN p.action IN ('read', 'write', 'delete', 'export', 'transfer', 'receive', 'deliver', 'validate', 'print')
      
      -- Achats : workflow complet d'achat
      WHEN mss.menu_nom = 'Achats' THEN p.action IN ('read', 'write', 'delete', 'validate', 'cancel', 'export', 'print', 'receive', 'payment')
      
      -- Ventes : workflow complet de vente
      WHEN mss.menu_nom = 'Ventes' THEN p.action IN ('read', 'write', 'delete', 'validate', 'cancel', 'export', 'print', 'convert', 'deliver', 'invoice', 'payment')
      
      -- Clients : CRM complet
      WHEN mss.menu_nom = 'Clients' THEN p.action IN ('read', 'write', 'delete', 'export', 'import', 'print')
      
      -- Caisse : gestion financière
      WHEN mss.menu_nom = 'Caisse' THEN p.action IN ('read', 'write', 'close', 'reopen', 'export', 'print', 'validate', 'payment')
      
      -- Rapports : consultation et export
      WHEN mss.menu_nom = 'Rapports' THEN p.action IN ('read', 'export', 'print')
      
      -- Paramètres : administration complète
      WHEN mss.menu_nom = 'Paramètres' THEN p.action IN ('read', 'write', 'delete', 'export', 'import', 'validate')
      
      ELSE FALSE
    END
)
INSERT INTO public.permissions (menu_id, sous_menu_id, menu, submenu, action, description)
SELECT 
  menu_id,
  sous_menu_id,
  menu,
  submenu,
  action,
  description || CASE 
    WHEN submenu IS NOT NULL THEN ' - ' || menu || ' > ' || submenu
    ELSE ' - ' || menu
  END
FROM permissions_to_create
ON CONFLICT (menu, COALESCE(submenu, ''), action) DO UPDATE SET 
  description = EXCLUDED.description,
  menu_id = EXCLUDED.menu_id,
  sous_menu_id = EXCLUDED.sous_menu_id;

-- 8. Attribuer automatiquement TOUTES les permissions au rôle Administrateur
INSERT INTO public.role_permissions (role_id, permission_id, can_access)
SELECT 
  r.id as role_id,
  p.id as permission_id,
  true as can_access
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'Administrateur'
ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;

-- 9. Mettre à jour la fonction get_permissions_structure pour être exhaustive
CREATE OR REPLACE FUNCTION public.get_permissions_structure()
RETURNS TABLE (
  menu_id uuid,
  menu_nom text,
  menu_icone text,
  menu_ordre integer,
  menu_description text,
  sous_menu_id uuid,
  sous_menu_nom text,
  sous_menu_description text,
  sous_menu_ordre integer,
  permission_id uuid,
  action text,
  permission_description text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id as menu_id,
    m.nom as menu_nom,
    COALESCE(m.icone, 'Menu') as menu_icone,
    COALESCE(m.ordre, 0) as menu_ordre,
    m.description as menu_description,
    sm.id as sous_menu_id,
    sm.nom as sous_menu_nom,
    sm.description as sous_menu_description,
    COALESCE(sm.ordre, 0) as sous_menu_ordre,
    p.id as permission_id,
    p.action,
    p.description as permission_description
  FROM public.menus m
  LEFT JOIN public.sous_menus sm ON m.id = sm.menu_id
  LEFT JOIN public.permissions p ON (
    (sm.id IS NOT NULL AND p.sous_menu_id = sm.id) OR
    (sm.id IS NULL AND p.menu_id = m.id AND p.sous_menu_id IS NULL)
  )
  WHERE m.statut = 'actif' 
    AND (sm.statut IS NULL OR sm.statut = 'actif')
  ORDER BY m.ordre, COALESCE(sm.ordre, 0), p.action;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Créer une vue pour faciliter la gestion des permissions utilisateurs
CREATE OR REPLACE VIEW public.vue_permissions_utilisateurs AS
SELECT 
  ui.user_id,
  ui.id as utilisateur_interne_id,
  ui.email,
  ui.prenom,
  ui.nom,
  ui.matricule,
  r.id as role_id,
  r.name as role_name,
  p.id as permission_id,
  p.menu,
  p.submenu,
  p.action,
  p.description as permission_description,
  rp.can_access,
  m.nom as menu_nom,
  sm.nom as sous_menu_nom
FROM public.utilisateurs_internes ui
JOIN public.roles r ON ui.role_id = r.id
JOIN public.role_permissions rp ON r.id = rp.role_id
JOIN public.permissions p ON rp.permission_id = p.id
LEFT JOIN public.menus m ON p.menu_id = m.id
LEFT JOIN public.sous_menus sm ON p.sous_menu_id = sm.id
WHERE ui.statut = 'actif';

-- 11. Fonction utilitaire pour vérifier les permissions d'un utilisateur
CREATE OR REPLACE FUNCTION public.user_has_permission(
  p_user_id uuid,
  p_menu text,
  p_submenu text DEFAULT NULL,
  p_action text DEFAULT 'read'
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.vue_permissions_utilisateurs
    WHERE user_id = p_user_id
      AND menu = p_menu
      AND (p_submenu IS NULL OR submenu = p_submenu)
      AND action = p_action
      AND can_access = true
  );
$$;

-- 12. Fonction pour obtenir toutes les permissions d'un rôle
CREATE OR REPLACE FUNCTION public.get_role_permissions(p_role_id uuid)
RETURNS TABLE (
  permission_id uuid,
  menu text,
  submenu text,
  action text,
  description text,
  can_access boolean
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    p.id as permission_id,
    p.menu,
    p.submenu,
    p.action,
    p.description,
    COALESCE(rp.can_access, false) as can_access
  FROM public.permissions p
  LEFT JOIN public.role_permissions rp ON p.id = rp.permission_id AND rp.role_id = p_role_id
  ORDER BY p.menu, p.submenu NULLS FIRST, p.action;
$$;
