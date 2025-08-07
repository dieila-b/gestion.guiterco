
-- Création des tables pour structurer les menus et sous-menus
CREATE TABLE IF NOT EXISTS public.menus (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom text NOT NULL UNIQUE,
  icone text,
  ordre integer DEFAULT 0,
  statut text DEFAULT 'actif',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sous_menus (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_id uuid NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
  nom text NOT NULL,
  description text,
  ordre integer DEFAULT 0,
  statut text DEFAULT 'actif',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(menu_id, nom)
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_sous_menus_menu_id ON public.sous_menus(menu_id);
CREATE INDEX IF NOT EXISTS idx_menus_ordre ON public.menus(ordre);
CREATE INDEX IF NOT EXISTS idx_sous_menus_ordre ON public.sous_menus(ordre);

-- Insertion des menus principaux
INSERT INTO public.menus (nom, icone, ordre) VALUES
('Dashboard', 'LayoutDashboard', 1),
('Catalogue', 'Package', 2),
('Stock', 'Warehouse', 3),
('Achats', 'ShoppingCart', 4),
('Ventes', 'TrendingUp', 5),
('Clients', 'Users', 6),
('Caisse', 'Calculator', 7),
('Rapports', 'BarChart3', 8),
('Paramètres', 'Settings', 9)
ON CONFLICT (nom) DO UPDATE SET 
  icone = EXCLUDED.icone,
  ordre = EXCLUDED.ordre;

-- Insertion des sous-menus pour chaque menu
DO $$
DECLARE
  menu_id_var uuid;
BEGIN
  -- Stock
  SELECT id INTO menu_id_var FROM public.menus WHERE nom = 'Stock';
  INSERT INTO public.sous_menus (menu_id, nom, description, ordre) VALUES
  (menu_id_var, 'Entrepôts', 'Gestion des stocks en entrepôt', 1),
  (menu_id_var, 'PDV', 'Gestion des stocks points de vente', 2),
  (menu_id_var, 'Transferts', 'Transferts entre entrepôts et PDV', 3),
  (menu_id_var, 'Entrées', 'Entrées de stock', 4),
  (menu_id_var, 'Sorties', 'Sorties de stock', 5),
  (menu_id_var, 'Mouvements', 'Historique des mouvements', 6)
  ON CONFLICT (menu_id, nom) DO NOTHING;

  -- Achats
  SELECT id INTO menu_id_var FROM public.menus WHERE nom = 'Achats';
  INSERT INTO public.sous_menus (menu_id, nom, description, ordre) VALUES
  (menu_id_var, 'Bons de commande', 'Gestion des commandes fournisseurs', 1),
  (menu_id_var, 'Bons de livraison', 'Réception des marchandises', 2),
  (menu_id_var, 'Factures d''Achats', 'Facturation fournisseurs', 3),
  (menu_id_var, 'Retours Fournisseurs', 'Gestion des retours', 4)
  ON CONFLICT (menu_id, nom) DO NOTHING;

  -- Ventes
  SELECT id INTO menu_id_var FROM public.menus WHERE nom = 'Ventes';
  INSERT INTO public.sous_menus (menu_id, nom, description, ordre) VALUES
  (menu_id_var, 'Factures', 'Facturation clients', 1),
  (menu_id_var, 'Précommandes', 'Gestion des précommandes', 2),
  (menu_id_var, 'Devis', 'Création et suivi des devis', 3),
  (menu_id_var, 'Vente au Comptoir', 'Ventes directes', 4),
  (menu_id_var, 'Retours', 'Gestion des retours clients', 5)
  ON CONFLICT (menu_id, nom) DO NOTHING;

  -- Caisse
  SELECT id INTO menu_id_var FROM public.menus WHERE nom = 'Caisse';
  INSERT INTO public.sous_menus (menu_id, nom, description, ordre) VALUES
  (menu_id_var, 'Opérations', 'Opérations de caisse', 1),
  (menu_id_var, 'Clôtures', 'Clôtures de caisse', 2),
  (menu_id_var, 'Dépenses', 'Dépenses et sorties', 3)
  ON CONFLICT (menu_id, nom) DO NOTHING;

  -- Rapports
  SELECT id INTO menu_id_var FROM public.menus WHERE nom = 'Rapports';
  INSERT INTO public.sous_menus (menu_id, nom, description, ordre) VALUES
  (menu_id_var, 'Ventes', 'Rapports de ventes', 1),
  (menu_id_var, 'Stock', 'Rapports de stock', 2),
  (menu_id_var, 'Marges', 'Analyses de marges', 3),
  (menu_id_var, 'Clients', 'Analyses clientèle', 4),
  (menu_id_var, 'Achats', 'Rapports d''achats', 5)
  ON CONFLICT (menu_id, nom) DO NOTHING;

  -- Paramètres
  SELECT id INTO menu_id_var FROM public.menus WHERE nom = 'Paramètres';
  INSERT INTO public.sous_menus (menu_id, nom, description, ordre) VALUES
  (menu_id_var, 'Utilisateurs', 'Gestion des utilisateurs', 1),
  (menu_id_var, 'Rôles et permissions', 'Gestion des accès', 2),
  (menu_id_var, 'Fournisseurs', 'Gestion des fournisseurs', 3),
  (menu_id_var, 'Système', 'Configuration système', 4)
  ON CONFLICT (menu_id, nom) DO NOTHING;
END $$;

-- Mise à jour de la table permissions pour utiliser les nouvelles références
ALTER TABLE public.permissions 
ADD COLUMN IF NOT EXISTS menu_id uuid REFERENCES public.menus(id),
ADD COLUMN IF NOT EXISTS sous_menu_id uuid REFERENCES public.sous_menus(id);

-- Migration des données existantes vers les nouvelles structures
DO $$
DECLARE
  perm_record RECORD;
  menu_id_found uuid;
  sous_menu_id_found uuid;
BEGIN
  FOR perm_record IN SELECT * FROM public.permissions WHERE menu_id IS NULL LOOP
    -- Trouver le menu correspondant
    SELECT id INTO menu_id_found FROM public.menus WHERE nom = perm_record.menu;
    
    -- Trouver le sous-menu correspondant si il existe
    IF perm_record.submenu IS NOT NULL THEN
      SELECT sm.id INTO sous_menu_id_found 
      FROM public.sous_menus sm 
      JOIN public.menus m ON sm.menu_id = m.id 
      WHERE m.nom = perm_record.menu AND sm.nom = perm_record.submenu;
    END IF;
    
    -- Mettre à jour la permission
    UPDATE public.permissions 
    SET 
      menu_id = menu_id_found,
      sous_menu_id = sous_menu_id_found
    WHERE id = perm_record.id;
  END LOOP;
END $$;

-- Fonction pour récupérer la structure complète des permissions
CREATE OR REPLACE FUNCTION public.get_permissions_structure()
RETURNS TABLE(
  menu_id uuid,
  menu_nom text,
  menu_icone text,
  menu_ordre integer,
  sous_menu_id uuid,
  sous_menu_nom text,
  sous_menu_description text,
  sous_menu_ordre integer,
  permission_id uuid,
  action text,
  permission_description text
)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    m.id as menu_id,
    m.nom as menu_nom,
    m.icone as menu_icone,
    m.ordre as menu_ordre,
    sm.id as sous_menu_id,
    sm.nom as sous_menu_nom,
    sm.description as sous_menu_description,
    sm.ordre as sous_menu_ordre,
    p.id as permission_id,
    p.action,
    p.description as permission_description
  FROM public.menus m
  LEFT JOIN public.sous_menus sm ON m.id = sm.menu_id AND sm.statut = 'actif'
  LEFT JOIN public.permissions p ON (
    (sm.id IS NOT NULL AND p.sous_menu_id = sm.id) OR 
    (sm.id IS NULL AND p.menu_id = m.id AND p.sous_menu_id IS NULL)
  )
  WHERE m.statut = 'actif'
  ORDER BY m.ordre, sm.ordre, p.action;
$$;

-- RLS pour les nouvelles tables
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sous_menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read menus" ON public.menus FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read sous_menus" ON public.sous_menus FOR SELECT TO authenticated USING (true);

-- Permissions d'écriture pour les administrateurs
CREATE POLICY "Admins can manage menus" ON public.menus FOR ALL TO authenticated 
USING (check_user_permission_strict('Paramètres', 'Rôles et permissions', 'write'))
WITH CHECK (check_user_permission_strict('Paramètres', 'Rôles et permissions', 'write'));

CREATE POLICY "Admins can manage sous_menus" ON public.sous_menus FOR ALL TO authenticated 
USING (check_user_permission_strict('Paramètres', 'Rôles et permissions', 'write'))
WITH CHECK (check_user_permission_strict('Paramètres', 'Rôles et permissions', 'write'));
