
-- Corriger l'architecture des permissions et ajouter les données manquantes

-- D'abord, nettoyer et recréer la structure des permissions
TRUNCATE TABLE public.role_permissions CASCADE;
TRUNCATE TABLE public.permissions CASCADE;

-- Insérer les permissions complètes par menu et action
INSERT INTO public.permissions (menu, submenu, action, description) VALUES
  -- Dashboard
  ('Dashboard', NULL, 'read', 'Consultation du tableau de bord'),
  
  -- Catalogue
  ('Catalogue', NULL, 'read', 'Consultation du catalogue'),
  ('Catalogue', NULL, 'write', 'Modification du catalogue'),
  ('Catalogue', NULL, 'delete', 'Suppression d''articles'),
  
  -- Stock
  ('Stock', 'Entrepôts', 'read', 'Consultation des stocks entrepôts'),
  ('Stock', 'Entrepôts', 'write', 'Modification des stocks entrepôts'),
  ('Stock', 'PDV', 'read', 'Consultation des stocks PDV'),
  ('Stock', 'PDV', 'write', 'Modification des stocks PDV'),
  ('Stock', 'Transferts', 'read', 'Consultation des transferts'),
  ('Stock', 'Transferts', 'write', 'Gestion des transferts'),
  
  -- Achats
  ('Achats', 'Bons de commande', 'read', 'Consultation des bons de commande'),
  ('Achats', 'Bons de commande', 'write', 'Création/modification des bons de commande'),
  ('Achats', 'Bons de livraison', 'read', 'Consultation des bons de livraison'),
  ('Achats', 'Bons de livraison', 'write', 'Réception des livraisons'),
  ('Achats', 'Factures', 'read', 'Consultation des factures d''achat'),
  ('Achats', 'Factures', 'write', 'Gestion des factures d''achat'),
  
  -- Ventes
  ('Ventes', 'Factures', 'read', 'Consultation des factures'),
  ('Ventes', 'Factures', 'write', 'Création/modification des factures'),
  ('Ventes', 'Précommandes', 'read', 'Consultation des précommandes'),
  ('Ventes', 'Précommandes', 'write', 'Gestion des précommandes'),
  ('Ventes', 'Devis', 'read', 'Consultation des devis'),
  ('Ventes', 'Devis', 'write', 'Création/modification des devis'),
  
  -- Clients
  ('Clients', NULL, 'read', 'Consultation des clients'),
  ('Clients', NULL, 'write', 'Gestion des clients'),
  
  -- Caisse
  ('Caisse', NULL, 'read', 'Consultation de la caisse'),
  ('Caisse', NULL, 'write', 'Gestion de la caisse'),
  
  -- Marges
  ('Marges', NULL, 'read', 'Consultation des marges'),
  
  -- Rapports
  ('Rapports', NULL, 'read', 'Consultation des rapports'),
  ('Rapports', NULL, 'write', 'Génération de rapports'),
  
  -- Paramètres
  ('Paramètres', 'Utilisateurs', 'read', 'Consultation des utilisateurs'),
  ('Paramètres', 'Utilisateurs', 'write', 'Gestion des utilisateurs'),
  ('Paramètres', 'Permissions', 'read', 'Consultation des permissions'),
  ('Paramètres', 'Permissions', 'write', 'Gestion des permissions');

-- Attribution de toutes les permissions au rôle Administrateur
INSERT INTO public.role_permissions (role_id, permission_id, can_access)
SELECT r.id, p.id, true
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'Administrateur'
ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;

-- Attribution des permissions Manager (lecture/écriture sur la plupart des modules)
INSERT INTO public.role_permissions (role_id, permission_id, can_access)
SELECT r.id, p.id, true
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'Manager'
AND (
  p.action = 'read' 
  OR (p.menu IN ('Catalogue', 'Stock', 'Ventes', 'Clients', 'Caisse') AND p.action = 'write')
)
ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;

-- Attribution des permissions Vendeur (lecture générale + écriture ventes/clients)
INSERT INTO public.role_permissions (role_id, permission_id, can_access)
SELECT r.id, p.id, true
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'Vendeur'
AND (
  p.action = 'read' 
  OR (p.menu IN ('Ventes', 'Clients') AND p.action = 'write')
)
ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;

-- Attribution des permissions Caissier (lecture + écriture caisse/ventes)
INSERT INTO public.role_permissions (role_id, permission_id, can_access)
SELECT r.id, p.id, true
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'Caissier'
AND (
  p.action = 'read' 
  OR (p.menu IN ('Caisse', 'Ventes') AND p.action = 'write')
)
ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;

-- Créer une vue pour faciliter les requêtes de permissions utilisateur
CREATE OR REPLACE VIEW public.vue_permissions_utilisateurs AS
SELECT 
  ui.user_id,
  ui.prenom,
  ui.nom,
  ui.email,
  r.name as role_name,
  r.description as role_description,
  p.menu,
  p.submenu,
  p.action,
  p.description as permission_description,
  rp.can_access
FROM public.utilisateurs_internes ui
JOIN public.roles r ON ui.role_id = r.id
LEFT JOIN public.role_permissions rp ON r.id = rp.role_id
LEFT JOIN public.permissions p ON rp.permission_id = p.id
WHERE ui.statut = 'actif'
AND rp.can_access = true;

-- Fonction pour vérifier les permissions d'un utilisateur spécifique
CREATE OR REPLACE FUNCTION public.check_user_permission(
  p_user_id UUID,
  p_menu TEXT,
  p_submenu TEXT DEFAULT NULL,
  p_action TEXT DEFAULT 'read'
)
RETURNS BOOLEAN
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

-- Invalider le cache PostgREST pour forcer la mise à jour
NOTIFY pgrst, 'reload schema';
