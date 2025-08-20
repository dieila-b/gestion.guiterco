
-- Créer la table roles si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Créer la table permissions si elle n'existe pas (elle existe déjà selon le schema)
-- Elle existe déjà, nous allons juste insérer les données

-- Créer la table role_permissions si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  can_access BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role_id, permission_id)
);

-- Ajouter la colonne role_id à utilisateurs_internes si elle n'existe pas
ALTER TABLE public.utilisateurs_internes 
ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES public.roles(id);

-- Créer les rôles de base
INSERT INTO public.roles (name, description, is_system) VALUES 
('Super Administrateur', 'Accès complet à toutes les fonctionnalités', true),
('Administrateur', 'Accès administratif avec restrictions', true),
('Manager', 'Gestion des opérations courantes', false),
('Employé', 'Accès limité aux opérations de base', false),
('Caissier', 'Accès aux opérations de caisse uniquement', false)
ON CONFLICT (name) DO NOTHING;

-- Insérer toutes les permissions complètes selon la structure des menus
INSERT INTO public.permissions (menu, submenu, action, description) VALUES 
-- Dashboard
('Dashboard', NULL, 'read', 'Lecture du tableau de bord'),
('Dashboard', NULL, 'write', 'Modification du tableau de bord'),

-- Catalogue
('Catalogue', NULL, 'read', 'Lecture du catalogue'),
('Catalogue', NULL, 'write', 'Modification du catalogue'),
('Catalogue', NULL, 'delete', 'Suppression d''articles du catalogue'),
('Catalogue', 'Catégories', 'read', 'Lecture des catégories'),
('Catalogue', 'Catégories', 'write', 'Modification des catégories'),
('Catalogue', 'Catégories', 'delete', 'Suppression des catégories'),

-- Stock
('Stock', 'Entrepôts', 'read', 'Lecture du stock des entrepôts'),
('Stock', 'Entrepôts', 'write', 'Modification du stock des entrepôts'),
('Stock', 'PDV', 'read', 'Lecture du stock des points de vente'),
('Stock', 'PDV', 'write', 'Modification du stock des points de vente'),
('Stock', 'Transferts', 'read', 'Lecture des transferts de stock'),
('Stock', 'Transferts', 'write', 'Gestion des transferts de stock'),
('Stock', 'Entrées', 'read', 'Lecture des entrées de stock'),
('Stock', 'Entrées', 'write', 'Saisie des entrées de stock'),
('Stock', 'Sorties', 'read', 'Lecture des sorties de stock'),
('Stock', 'Sorties', 'write', 'Saisie des sorties de stock'),
('Stock', 'Mouvements', 'read', 'Lecture des mouvements de stock'),
('Stock', 'Inventaire', 'read', 'Lecture des inventaires'),
('Stock', 'Inventaire', 'write', 'Gestion des inventaires'),

-- Achats
('Achats', 'Bons de commande', 'read', 'Lecture des bons de commande'),
('Achats', 'Bons de commande', 'write', 'Création et modification des bons de commande'),
('Achats', 'Bons de livraison', 'read', 'Lecture des bons de livraison'),
('Achats', 'Bons de livraison', 'write', 'Gestion des bons de livraison'),
('Achats', 'Factures', 'read', 'Lecture des factures d''achat'),
('Achats', 'Factures', 'write', 'Gestion des factures d''achat'),
('Achats', 'Fournisseurs', 'read', 'Lecture des fournisseurs'),
('Achats', 'Fournisseurs', 'write', 'Gestion des fournisseurs'),

-- Ventes
('Ventes', 'Vente au Comptoir', 'read', 'Accès à la vente au comptoir'),
('Ventes', 'Vente au Comptoir', 'write', 'Réalisation de ventes au comptoir'),
('Ventes', 'Factures', 'read', 'Lecture des factures de vente'),
('Ventes', 'Factures', 'write', 'Création et modification des factures de vente'),
('Ventes', 'Précommandes', 'read', 'Lecture des précommandes'),
('Ventes', 'Précommandes', 'write', 'Gestion des précommandes'),
('Ventes', 'Devis', 'read', 'Lecture des devis'),
('Ventes', 'Devis', 'write', 'Création et modification des devis'),
('Ventes', 'Factures impayées', 'read', 'Lecture des factures impayées'),
('Ventes', 'Retours Clients', 'read', 'Lecture des retours clients'),
('Ventes', 'Retours Clients', 'write', 'Gestion des retours clients'),

-- Clients
('Clients', NULL, 'read', 'Lecture de la liste des clients'),
('Clients', NULL, 'write', 'Création et modification des clients'),
('Clients', NULL, 'delete', 'Suppression des clients'),

-- Caisse
('Caisse', 'Opérations', 'read', 'Lecture des opérations de caisse'),
('Caisse', 'Opérations', 'write', 'Réalisation d''opérations de caisse'),
('Caisse', 'Dépenses', 'read', 'Lecture des dépenses'),
('Caisse', 'Dépenses', 'write', 'Saisie des dépenses'),
('Caisse', 'Clôtures', 'read', 'Lecture des clôtures de caisse'),
('Caisse', 'Clôtures', 'write', 'Réalisation des clôtures de caisse'),
('Caisse', 'États', 'read', 'Lecture des états de caisse'),
('Caisse', 'Aperçu du jour', 'read', 'Aperçu des opérations du jour'),

-- Finance
('Finance', 'Revenus', 'read', 'Lecture des revenus'),
('Finance', 'Dépenses', 'read', 'Lecture des dépenses financières'),
('Finance', 'Rapports', 'read', 'Lecture des rapports financiers'),
('Finance', 'Trésorerie', 'read', 'Lecture de la trésorerie'),

-- Marges
('Marges', NULL, 'read', 'Lecture des analyses de marges'),

-- Rapports
('Rapports', 'Ventes', 'read', 'Rapports de ventes'),
('Rapports', 'Stock', 'read', 'Rapports de stock'),
('Rapports', 'Marges', 'read', 'Rapports de marges'),
('Rapports', 'Clients', 'read', 'Rapports clients'),

-- Paramètres
('Paramètres', 'Profil', 'read', 'Lecture du profil utilisateur'),
('Paramètres', 'Profil', 'write', 'Modification du profil utilisateur'),
('Paramètres', 'Zone Géographique', 'read', 'Lecture des zones géographiques'),
('Paramètres', 'Zone Géographique', 'write', 'Gestion des zones géographiques'),
('Paramètres', 'Fournisseurs', 'read', 'Paramètres des fournisseurs'),
('Paramètres', 'Fournisseurs', 'write', 'Gestion des paramètres fournisseurs'),
('Paramètres', 'Dépôts Stock', 'read', 'Paramètres des dépôts de stock'),
('Paramètres', 'Dépôts Stock', 'write', 'Gestion des dépôts de stock'),
('Paramètres', 'Dépôts PDV', 'read', 'Paramètres des dépôts PDV'),
('Paramètres', 'Dépôts PDV', 'write', 'Gestion des dépôts PDV'),
('Paramètres', 'Utilisateurs', 'read', 'Lecture des utilisateurs'),
('Paramètres', 'Utilisateurs', 'write', 'Gestion des utilisateurs'),
('Paramètres', 'Rôles et permissions', 'read', 'Lecture des rôles et permissions'),
('Paramètres', 'Rôles et permissions', 'write', 'Gestion des rôles et permissions'),
('Paramètres', 'Permissions', 'read', 'Lecture des permissions'),
('Paramètres', 'Permissions', 'write', 'Gestion des permissions')
ON CONFLICT (menu, COALESCE(submenu, ''), action) DO NOTHING;

-- Attribuer toutes les permissions au rôle Super Administrateur
INSERT INTO public.role_permissions (role_id, permission_id, can_access)
SELECT r.id, p.id, true
FROM public.roles r, public.permissions p
WHERE r.name = 'Super Administrateur'
ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;

-- Créer une fonction RPC pour récupérer les permissions utilisateur
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_uuid UUID)
RETURNS TABLE (
    menu TEXT,
    submenu TEXT,
    action TEXT,
    can_access BOOLEAN
) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT 
        p.menu,
        p.submenu,
        p.action,
        rp.can_access
    FROM public.permissions p
    JOIN public.role_permissions rp ON p.id = rp.permission_id
    JOIN public.roles r ON rp.role_id = r.id
    JOIN public.utilisateurs_internes ui ON r.id = ui.role_id
    WHERE ui.user_id = user_uuid
    AND rp.can_access = true
    ORDER BY p.menu, p.submenu, p.action;
$$;

-- Créer des index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON public.role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_utilisateurs_internes_role_id ON public.utilisateurs_internes(role_id);
CREATE INDEX IF NOT EXISTS idx_permissions_menu_submenu_action ON public.permissions(menu, submenu, action);

-- Activer RLS sur les nouvelles tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour roles
CREATE POLICY "Authenticated users can read roles" ON public.roles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Internal users can manage roles" ON public.roles FOR ALL USING (is_internal_user());

-- Politiques RLS pour role_permissions  
CREATE POLICY "Authenticated users can read role_permissions" ON public.role_permissions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Internal users can manage role_permissions" ON public.role_permissions FOR ALL USING (is_internal_user());
