
-- Créer la table sous_menus si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.sous_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID REFERENCES public.menus(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  ordre INTEGER DEFAULT 0,
  statut TEXT DEFAULT 'actif',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activer RLS sur sous_menus
ALTER TABLE public.sous_menus ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour sous_menus
CREATE POLICY "Authenticated users can read sous_menus" ON public.sous_menus FOR SELECT USING (true);
CREATE POLICY "Admins can manage sous_menus" ON public.sous_menus FOR ALL 
USING (check_user_permission_strict('Paramètres', 'Rôles et permissions', 'write'))
WITH CHECK (check_user_permission_strict('Paramètres', 'Rôles et permissions', 'write'));

-- Insérer les menus principaux s'ils n'existent pas
INSERT INTO public.menus (nom, icone, ordre, statut) VALUES
('Dashboard', 'dashboard', 1, 'actif'),
('Catalogue', 'package', 2, 'actif'),
('Stock', 'warehouse', 3, 'actif'),
('Ventes', 'shopping-cart', 4, 'actif'),
('Achats', 'shopping-bag', 5, 'actif'),
('Clients', 'users', 6, 'actif'),
('Rapports', 'bar-chart', 7, 'actif'),
('Paramètres', 'settings', 8, 'actif')
ON CONFLICT (nom) DO UPDATE SET 
icone = EXCLUDED.icone,
ordre = EXCLUDED.ordre,
statut = EXCLUDED.statut;

-- Insérer les sous-menus
INSERT INTO public.sous_menus (menu_id, nom, ordre, statut)
SELECT m.id, sous_menu.nom, sous_menu.ordre, 'actif'
FROM public.menus m
CROSS JOIN (VALUES
  ('Stock', 'Entrepôts', 1),
  ('Stock', 'PDV', 2),
  ('Stock', 'Mouvements', 3),
  ('Ventes', 'Factures', 1),
  ('Ventes', 'Précommandes', 2),
  ('Achats', 'Bons de commande', 1),
  ('Achats', 'Bons de livraison', 2),
  ('Achats', 'Factures', 3),
  ('Rapports', 'Ventes', 1),
  ('Rapports', 'Stock', 2),
  ('Rapports', 'Marges', 3),
  ('Paramètres', 'Utilisateurs', 1),
  ('Paramètres', 'Rôles et permissions', 2),
  ('Paramètres', 'Système', 3)
) AS sous_menu(menu_nom, nom, ordre)
WHERE m.nom = sous_menu.menu_nom
ON CONFLICT DO NOTHING;

-- Supprimer toutes les permissions existantes pour éviter les doublons
DELETE FROM public.permissions;

-- Insérer toutes les permissions nécessaires
INSERT INTO public.permissions (menu, submenu, action, description) VALUES
-- Dashboard
('Dashboard', NULL, 'read', 'Consulter le tableau de bord'),

-- Catalogue
('Catalogue', NULL, 'read', 'Consulter le catalogue produits'),
('Catalogue', NULL, 'write', 'Gérer le catalogue produits'),
('Catalogue', NULL, 'delete', 'Supprimer des produits du catalogue'),

-- Stock
('Stock', 'Entrepôts', 'read', 'Consulter les stocks en entrepôt'),
('Stock', 'Entrepôts', 'write', 'Gérer les stocks en entrepôt'),
('Stock', 'PDV', 'read', 'Consulter les stocks en point de vente'),
('Stock', 'PDV', 'write', 'Gérer les stocks en point de vente'),
('Stock', 'Mouvements', 'read', 'Consulter les mouvements de stock'),
('Stock', 'Mouvements', 'write', 'Enregistrer des mouvements de stock'),

-- Ventes
('Ventes', 'Factures', 'read', 'Consulter les factures de vente'),
('Ventes', 'Factures', 'write', 'Créer et modifier les factures de vente'),
('Ventes', 'Factures', 'delete', 'Supprimer les factures de vente'),
('Ventes', 'Précommandes', 'read', 'Consulter les précommandes'),
('Ventes', 'Précommandes', 'write', 'Gérer les précommandes'),
('Ventes', 'Précommandes', 'validate', 'Valider les précommandes'),

-- Achats
('Achats', 'Bons de commande', 'read', 'Consulter les bons de commande'),
('Achats', 'Bons de commande', 'write', 'Créer et modifier les bons de commande'),
('Achats', 'Bons de commande', 'validate', 'Valider les bons de commande'),
('Achats', 'Bons de livraison', 'read', 'Consulter les bons de livraison'),
('Achats', 'Bons de livraison', 'write', 'Gérer les bons de livraison'),
('Achats', 'Factures', 'read', 'Consulter les factures d''achat'),
('Achats', 'Factures', 'write', 'Gérer les factures d''achat'),

-- Clients
('Clients', NULL, 'read', 'Consulter la liste des clients'),
('Clients', NULL, 'write', 'Gérer les clients'),
('Clients', NULL, 'delete', 'Supprimer des clients'),

-- Rapports
('Rapports', 'Ventes', 'read', 'Consulter les rapports de vente'),
('Rapports', 'Ventes', 'export', 'Exporter les rapports de vente'),
('Rapports', 'Stock', 'read', 'Consulter les rapports de stock'),
('Rapports', 'Stock', 'export', 'Exporter les rapports de stock'),
('Rapports', 'Marges', 'read', 'Consulter les rapports de marges'),
('Rapports', 'Marges', 'export', 'Exporter les rapports de marges'),

-- Paramètres
('Paramètres', 'Utilisateurs', 'read', 'Consulter les utilisateurs'),
('Paramètres', 'Utilisateurs', 'write', 'Gérer les utilisateurs'),
('Paramètres', 'Rôles et permissions', 'read', 'Consulter les rôles et permissions'),
('Paramètres', 'Rôles et permissions', 'write', 'Gérer les rôles et permissions'),
('Paramètres', 'Système', 'read', 'Consulter les paramètres système'),
('Paramètres', 'Système', 'write', 'Modifier les paramètres système');

-- Mettre à jour la fonction get_permissions_structure pour inclure les sous-menus
CREATE OR REPLACE FUNCTION public.get_permissions_structure()
RETURNS TABLE(
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
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    m.id as menu_id,
    m.nom as menu_nom,
    m.icone as menu_icone,
    m.ordre as menu_ordre,
    NULL::text as menu_description,
    sm.id as sous_menu_id,
    COALESCE(sm.nom, '(Menu principal)') as sous_menu_nom,
    NULL::text as sous_menu_description,
    COALESCE(sm.ordre, 0) as sous_menu_ordre,
    p.id as permission_id,
    p.action,
    p.description as permission_description
  FROM public.menus m
  LEFT JOIN public.sous_menus sm ON m.id = sm.menu_id
  LEFT JOIN public.permissions p ON (
    p.menu = m.nom AND 
    (p.submenu = sm.nom OR (p.submenu IS NULL AND sm.nom IS NULL))
  )
  WHERE m.statut = 'actif'
  ORDER BY m.ordre, COALESCE(sm.ordre, 0), p.action;
$$;

-- Attribuer toutes les permissions au rôle Administrateur
DO $$
DECLARE
    admin_role_id UUID;
    perm RECORD;
BEGIN
    -- Récupérer l'ID du rôle Administrateur
    SELECT id INTO admin_role_id FROM public.roles WHERE name = 'Administrateur';
    
    IF admin_role_id IS NOT NULL THEN
        -- Supprimer les anciennes permissions
        DELETE FROM public.role_permissions WHERE role_id = admin_role_id;
        
        -- Attribuer toutes les permissions
        FOR perm IN SELECT id FROM public.permissions LOOP
            INSERT INTO public.role_permissions (role_id, permission_id, can_access)
            VALUES (admin_role_id, perm.id, true);
        END LOOP;
    END IF;
END $$;

-- Créer une vue pour faciliter les requêtes de permissions
CREATE OR REPLACE VIEW public.vue_permissions_utilisateurs AS
SELECT DISTINCT
    ui.user_id,
    p.menu,
    p.submenu,
    p.action,
    rp.can_access
FROM public.utilisateurs_internes ui
JOIN public.roles r ON ui.role_id = r.id
JOIN public.role_permissions rp ON r.id = rp.role_id
JOIN public.permissions p ON rp.permission_id = p.id
WHERE ui.statut = 'actif';
