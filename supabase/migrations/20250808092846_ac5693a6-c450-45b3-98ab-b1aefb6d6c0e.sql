
-- 1. S'assurer que tous les menus de base existent
INSERT INTO public.menus (nom, icone, ordre, statut) VALUES
('Dashboard', 'BarChart3', 1, 'actif'),
('Catalogue', 'Package', 2, 'actif'),
('Stock', 'Warehouse', 3, 'actif'),
('Achats', 'ShoppingCart', 4, 'actif'),
('Ventes', 'TrendingUp', 5, 'actif'),
('Clients', 'Users', 6, 'actif'),
('Caisse', 'CreditCard', 7, 'actif'),
('Rapports', 'FileText', 8, 'actif'),
('Paramètres', 'Settings', 9, 'actif')
ON CONFLICT (nom) DO UPDATE SET
icone = EXCLUDED.icone,
ordre = EXCLUDED.ordre,
statut = EXCLUDED.statut;

-- 2. Créer la table sous_menus si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.sous_menus (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    menu_id uuid REFERENCES public.menus(id) ON DELETE CASCADE,
    nom text NOT NULL,
    ordre integer DEFAULT 0,
    statut text DEFAULT 'actif',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(menu_id, nom)
);

-- Enable RLS on sous_menus
ALTER TABLE public.sous_menus ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for sous_menus
CREATE POLICY IF NOT EXISTS "Authenticated users can read sous_menus" ON public.sous_menus
FOR SELECT TO authenticated USING (true);

CREATE POLICY IF NOT EXISTS "Admins can manage sous_menus" ON public.sous_menus
FOR ALL TO authenticated 
USING (check_user_permission_strict('Paramètres', 'Rôles et permissions', 'write'))
WITH CHECK (check_user_permission_strict('Paramètres', 'Rôles et permissions', 'write'));

-- 3. Insérer tous les sous-menus
WITH menu_ids AS (
    SELECT id, nom FROM public.menus
)
INSERT INTO public.sous_menus (menu_id, nom, ordre) 
SELECT 
    m.id,
    sous_menu.nom,
    sous_menu.ordre
FROM menu_ids m
CROSS JOIN (
    VALUES
    -- Stock sous-menus
    ('Stock', 'Entrepôts', 1),
    ('Stock', 'PDV', 2),
    ('Stock', 'Transferts', 3),
    ('Stock', 'Mouvements', 4),
    -- Achats sous-menus
    ('Achats', 'Bons de commande', 1),
    ('Achats', 'Bons de livraison', 2),
    ('Achats', 'Factures', 3),
    -- Ventes sous-menus
    ('Ventes', 'Factures', 1),
    ('Ventes', 'Précommandes', 2),
    ('Ventes', 'Devis', 3),
    ('Ventes', 'Vente au Comptoir', 4),
    -- Caisse sous-menus
    ('Caisse', 'Opérations', 1),
    ('Caisse', 'Clôtures', 2),
    ('Caisse', 'États', 3),
    -- Rapports sous-menus
    ('Rapports', 'Ventes', 1),
    ('Rapports', 'Stock', 2),
    ('Rapports', 'Marges', 3),
    ('Rapports', 'Clients', 4),
    -- Paramètres sous-menus
    ('Paramètres', 'Utilisateurs', 1),
    ('Paramètres', 'Rôles et permissions', 2),
    ('Paramètres', 'Fournisseurs', 3),
    ('Paramètres', 'Configuration', 4)
) AS sous_menu(menu_nom, nom, ordre)
WHERE m.nom = sous_menu.menu_nom
ON CONFLICT (menu_id, nom) DO UPDATE SET
ordre = EXCLUDED.ordre,
statut = EXCLUDED.statut;

-- 4. Supprimer toutes les permissions existantes pour éviter les doublons
DELETE FROM public.permissions;

-- 5. Insérer toutes les permissions complètes
WITH menu_sous_menu AS (
    SELECT 
        m.nom as menu_nom,
        sm.nom as sous_menu_nom,
        m.id as menu_id,
        sm.id as sous_menu_id
    FROM public.menus m
    LEFT JOIN public.sous_menus sm ON m.id = sm.menu_id
)
INSERT INTO public.permissions (menu, submenu, action, description, menu_id, sous_menu_id)
SELECT 
    msk.menu_nom,
    msk.sous_menu_nom,
    perm.action,
    msk.menu_nom || COALESCE(' > ' || msk.sous_menu_nom, '') || ' - ' || 
    CASE perm.action
        WHEN 'read' THEN 'Consulter'
        WHEN 'write' THEN 'Créer/Modifier'
        WHEN 'delete' THEN 'Supprimer'
        WHEN 'validate' THEN 'Valider'
        WHEN 'cancel' THEN 'Annuler'
        WHEN 'convert' THEN 'Convertir'
        WHEN 'export' THEN 'Exporter'
        WHEN 'import' THEN 'Importer'
        WHEN 'print' THEN 'Imprimer'
        WHEN 'close' THEN 'Clôturer'
        WHEN 'reopen' THEN 'Rouvrir'
        WHEN 'transfer' THEN 'Transférer'
        WHEN 'receive' THEN 'Réceptionner'
        WHEN 'deliver' THEN 'Livrer'
        WHEN 'invoice' THEN 'Facturer'
        WHEN 'payment' THEN 'Paiement'
        ELSE perm.action
    END as description,
    msk.menu_id,
    msk.sous_menu_id
FROM menu_sous_menu msk
CROSS JOIN (
    -- Permissions de base pour tous
    VALUES 
    ('read'),
    ('write'),
    ('delete'),
    -- Permissions spécifiques selon le contexte
    ('validate'),
    ('cancel'),
    ('convert'),
    ('export'),
    ('import'),
    ('print'),
    ('close'),
    ('reopen'),
    ('transfer'),
    ('receive'),
    ('deliver'),
    ('invoice'),
    ('payment')
) AS perm(action)
-- Filtrer les permissions pertinentes par menu/sous-menu
WHERE (
    -- Dashboard: lecture seule principalement
    (msk.menu_nom = 'Dashboard' AND msk.sous_menu_nom IS NULL AND perm.action IN ('read', 'export')) OR
    
    -- Catalogue: gestion complète
    (msk.menu_nom = 'Catalogue' AND msk.sous_menu_nom IS NULL AND perm.action IN ('read', 'write', 'delete', 'export', 'import')) OR
    
    -- Stock - Entrepôts
    (msk.menu_nom = 'Stock' AND msk.sous_menu_nom = 'Entrepôts' AND perm.action IN ('read', 'write', 'delete', 'transfer', 'export')) OR
    
    -- Stock - PDV
    (msk.menu_nom = 'Stock' AND msk.sous_menu_nom = 'PDV' AND perm.action IN ('read', 'write', 'transfer', 'export')) OR
    
    -- Stock - Transferts
    (msk.menu_nom = 'Stock' AND msk.sous_menu_nom = 'Transferts' AND perm.action IN ('read', 'write', 'validate', 'cancel', 'export')) OR
    
    -- Stock - Mouvements
    (msk.menu_nom = 'Stock' AND msk.sous_menu_nom = 'Mouvements' AND perm.action IN ('read', 'write', 'export')) OR
    
    -- Achats - Bons de commande
    (msk.menu_nom = 'Achats' AND msk.sous_menu_nom = 'Bons de commande' AND perm.action IN ('read', 'write', 'delete', 'validate', 'cancel', 'export', 'print')) OR
    
    -- Achats - Bons de livraison
    (msk.menu_nom = 'Achats' AND msk.sous_menu_nom = 'Bons de livraison' AND perm.action IN ('read', 'write', 'receive', 'validate', 'export', 'print')) OR
    
    -- Achats - Factures
    (msk.menu_nom = 'Achats' AND msk.sous_menu_nom = 'Factures' AND perm.action IN ('read', 'write', 'validate', 'payment', 'export', 'print')) OR
    
    -- Ventes - Factures
    (msk.menu_nom = 'Ventes' AND msk.sous_menu_nom = 'Factures' AND perm.action IN ('read', 'write', 'delete', 'validate', 'cancel', 'deliver', 'payment', 'export', 'print')) OR
    
    -- Ventes - Précommandes
    (msk.menu_nom = 'Ventes' AND msk.sous_menu_nom = 'Précommandes' AND perm.action IN ('read', 'write', 'delete', 'validate', 'cancel', 'deliver', 'convert', 'export', 'print')) OR
    
    -- Ventes - Devis
    (msk.menu_nom = 'Ventes' AND msk.sous_menu_nom = 'Devis' AND perm.action IN ('read', 'write', 'delete', 'validate', 'convert', 'export', 'print')) OR
    
    -- Ventes - Vente au Comptoir
    (msk.menu_nom = 'Ventes' AND msk.sous_menu_nom = 'Vente au Comptoir' AND perm.action IN ('read', 'write', 'payment', 'print')) OR
    
    -- Clients
    (msk.menu_nom = 'Clients' AND msk.sous_menu_nom IS NULL AND perm.action IN ('read', 'write', 'delete', 'export', 'import')) OR
    
    -- Caisse - Opérations
    (msk.menu_nom = 'Caisse' AND msk.sous_menu_nom = 'Opérations' AND perm.action IN ('read', 'write', 'export')) OR
    
    -- Caisse - Clôtures
    (msk.menu_nom = 'Caisse' AND msk.sous_menu_nom = 'Clôtures' AND perm.action IN ('read', 'write', 'close', 'reopen', 'export', 'print')) OR
    
    -- Caisse - États
    (msk.menu_nom = 'Caisse' AND msk.sous_menu_nom = 'États' AND perm.action IN ('read', 'export', 'print')) OR
    
    -- Rapports (lecture et export principalement)
    (msk.menu_nom = 'Rapports' AND perm.action IN ('read', 'export', 'print')) OR
    
    -- Paramètres - Utilisateurs
    (msk.menu_nom = 'Paramètres' AND msk.sous_menu_nom = 'Utilisateurs' AND perm.action IN ('read', 'write', 'delete', 'export')) OR
    
    -- Paramètres - Rôles et permissions
    (msk.menu_nom = 'Paramètres' AND msk.sous_menu_nom = 'Rôles et permissions' AND perm.action IN ('read', 'write', 'delete')) OR
    
    -- Paramètres - Fournisseurs
    (msk.menu_nom = 'Paramètres' AND msk.sous_menu_nom = 'Fournisseurs' AND perm.action IN ('read', 'write', 'delete', 'export', 'import')) OR
    
    -- Paramètres - Configuration
    (msk.menu_nom = 'Paramètres' AND msk.sous_menu_nom = 'Configuration' AND perm.action IN ('read', 'write'))
);

-- 6. Créer/Mettre à jour les rôles de base
INSERT INTO public.roles (name, description, is_system) VALUES
('Administrateur', 'Accès complet à toutes les fonctionnalités', true),
('Manager', 'Accès étendu avec gestion d''équipe', false),
('Vendeur', 'Accès aux ventes et clients', false),
('Caissier', 'Accès à la caisse et ventes comptoir', false)
ON CONFLICT (name) DO UPDATE SET
description = EXCLUDED.description;

-- 7. Attribuer TOUTES les permissions au rôle Administrateur
WITH admin_role AS (
    SELECT id FROM public.roles WHERE name = 'Administrateur'
),
all_permissions AS (
    SELECT id FROM public.permissions
)
INSERT INTO public.role_permissions (role_id, permission_id, can_access)
SELECT ar.id, ap.id, true
FROM admin_role ar
CROSS JOIN all_permissions ap
ON CONFLICT (role_id, permission_id) DO UPDATE SET
can_access = true;

-- 8. Configuration des permissions pour le rôle Manager
WITH manager_role AS (
    SELECT id FROM public.roles WHERE name = 'Manager'
)
INSERT INTO public.role_permissions (role_id, permission_id, can_access)
SELECT mr.id, p.id, true
FROM manager_role mr
CROSS JOIN public.permissions p
WHERE 
-- Accès complet sauf configuration système
(p.menu != 'Paramètres' OR p.submenu != 'Rôles et permissions') AND
(p.menu != 'Paramètres' OR p.submenu != 'Configuration')
ON CONFLICT (role_id, permission_id) DO UPDATE SET
can_access = true;

-- 9. Configuration des permissions pour le rôle Vendeur
WITH vendeur_role AS (
    SELECT id FROM public.roles WHERE name = 'Vendeur'
)
INSERT INTO public.role_permissions (role_id, permission_id, can_access)
SELECT vr.id, p.id, true
FROM vendeur_role vr
CROSS JOIN public.permissions p
WHERE 
-- Accès aux ventes, clients, catalogue (lecture), stock (lecture), rapports (lecture)
(p.menu = 'Dashboard' AND p.action = 'read') OR
(p.menu = 'Catalogue' AND p.action IN ('read', 'export')) OR
(p.menu = 'Stock' AND p.action IN ('read', 'export')) OR
(p.menu = 'Ventes') OR
(p.menu = 'Clients') OR
(p.menu = 'Rapports' AND p.submenu IN ('Ventes', 'Clients') AND p.action IN ('read', 'export', 'print'))
ON CONFLICT (role_id, permission_id) DO UPDATE SET
can_access = true;

-- 10. Configuration des permissions pour le rôle Caissier
WITH caissier_role AS (
    SELECT id FROM public.roles WHERE name = 'Caissier'
)
INSERT INTO public.role_permissions (role_id, permission_id, can_access)
SELECT cr.id, p.id, true
FROM caissier_role cr
CROSS JOIN public.permissions p
WHERE 
-- Accès à la caisse, vente comptoir, clients (lecture), catalogue (lecture)
(p.menu = 'Dashboard' AND p.action = 'read') OR
(p.menu = 'Catalogue' AND p.action = 'read') OR
(p.menu = 'Ventes' AND p.submenu = 'Vente au Comptoir') OR
(p.menu = 'Clients' AND p.action IN ('read', 'write')) OR
(p.menu = 'Caisse')
ON CONFLICT (role_id, permission_id) DO UPDATE SET
can_access = true;

-- 11. Mettre à jour la fonction get_permissions_structure pour inclure les sous-menus
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
SECURITY DEFINER
AS $$
    SELECT 
        m.id as menu_id,
        m.nom as menu_nom,
        m.icone as menu_icone,
        m.ordre as menu_ordre,
        NULL as menu_description,
        sm.id as sous_menu_id,
        sm.nom as sous_menu_nom,
        NULL as sous_menu_description,
        sm.ordre as sous_menu_ordre,
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
    ORDER BY m.ordre, sm.ordre, 
        CASE p.action
            WHEN 'read' THEN 1
            WHEN 'write' THEN 2
            WHEN 'delete' THEN 3
            WHEN 'validate' THEN 4
            WHEN 'cancel' THEN 5
            ELSE 99
        END;
$$;

-- 12. Créer une fonction pour obtenir les permissions d'un utilisateur
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_uuid uuid)
RETURNS TABLE(
    menu text,
    submenu text,
    action text,
    can_access boolean
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        p.menu,
        p.submenu,
        p.action,
        COALESCE(rp.can_access, false) as can_access
    FROM public.permissions p
    LEFT JOIN public.role_permissions rp ON p.id = rp.permission_id
    LEFT JOIN public.roles r ON rp.role_id = r.id
    LEFT JOIN public.utilisateurs_internes ui ON ui.role_id = r.id
    WHERE ui.user_id = user_uuid
    AND ui.statut = 'actif'
    ORDER BY p.menu, p.submenu, p.action;
$$;
