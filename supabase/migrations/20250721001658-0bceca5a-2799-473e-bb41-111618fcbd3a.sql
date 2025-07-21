
-- DIAGNOSTIC ET CORRECTION COMPLÈTE DU SYSTÈME DE PERMISSIONS
-- ===========================================================

-- 1. DIAGNOSTIC COMPLET
SELECT 'DIAGNOSTIC SYSTÈME PERMISSIONS' as titre;

-- Vérifier les données existantes
SELECT 'Données roles existantes' as diagnostic, COUNT(*) as nombre FROM public.roles;
SELECT 'Données permissions existantes' as diagnostic, COUNT(*) as nombre FROM public.permissions;
SELECT 'Données role_permissions existantes' as diagnostic, COUNT(*) as nombre FROM public.role_permissions;

-- 2. INSERTION DES RÔLES SYSTÈME DE BASE
INSERT INTO public.roles (name, description, is_system) VALUES
  ('Administrateur', 'Accès complet à toutes les fonctionnalités du système', true),
  ('Manager', 'Gestion des équipes et accès aux rapports avancés', false),
  ('Vendeur', 'Accès aux ventes et gestion des clients', false),
  ('Caissier', 'Accès aux transactions et encaissements', false),
  ('Gestionnaire Stock', 'Gestion des stocks et inventaires', false)
ON CONFLICT (name) DO UPDATE SET 
  description = EXCLUDED.description,
  is_system = EXCLUDED.is_system;

-- 3. INSERTION DES PERMISSIONS SYSTÈME COMPLÈTES
DELETE FROM public.permissions WHERE menu IN ('Dashboard', 'Catalogue', 'Stock', 'Achats', 'Ventes', 'Clients', 'Paramètres');

INSERT INTO public.permissions (menu, submenu, action, description) VALUES
  -- Dashboard
  ('Dashboard', NULL, 'read', 'Consultation du tableau de bord'),
  
  -- Catalogue
  ('Catalogue', NULL, 'read', 'Consultation du catalogue produits'),
  ('Catalogue', NULL, 'write', 'Modification du catalogue produits'),
  ('Catalogue', NULL, 'delete', 'Suppression d''articles du catalogue'),
  
  -- Stock
  ('Stock', 'Entrepôts', 'read', 'Consultation des stocks entrepôts'),
  ('Stock', 'Entrepôts', 'write', 'Modification des stocks entrepôts'),
  ('Stock', 'PDV', 'read', 'Consultation des stocks points de vente'),
  ('Stock', 'PDV', 'write', 'Modification des stocks points de vente'),
  ('Stock', 'Transferts', 'read', 'Consultation des transferts de stock'),
  ('Stock', 'Transferts', 'write', 'Gestion des transferts de stock'),
  
  -- Achats
  ('Achats', 'Bons de commande', 'read', 'Consultation des bons de commande'),
  ('Achats', 'Bons de commande', 'write', 'Création/modification des bons de commande'),
  ('Achats', 'Bons de livraison', 'read', 'Consultation des bons de livraison'),
  ('Achats', 'Bons de livraison', 'write', 'Réception et gestion des livraisons'),
  ('Achats', 'Factures', 'read', 'Consultation des factures d''achat'),
  ('Achats', 'Factures', 'write', 'Gestion des factures d''achat'),
  
  -- Ventes
  ('Ventes', 'Factures', 'read', 'Consultation des factures de vente'),
  ('Ventes', 'Factures', 'write', 'Création/modification des factures de vente'),
  ('Ventes', 'Précommandes', 'read', 'Consultation des précommandes'),
  ('Ventes', 'Précommandes', 'write', 'Gestion des précommandes'),
  ('Ventes', 'Devis', 'read', 'Consultation des devis'),
  ('Ventes', 'Devis', 'write', 'Création/modification des devis'),
  
  -- Clients
  ('Clients', NULL, 'read', 'Consultation de la base clients'),
  ('Clients', NULL, 'write', 'Gestion des clients'),
  
  -- Caisse
  ('Caisse', 'Transactions', 'read', 'Consultation des transactions'),
  ('Caisse', 'Transactions', 'write', 'Saisie des transactions'),
  ('Caisse', 'Rapports', 'read', 'Consultation des rapports de caisse'),
  ('Caisse', 'Clotures', 'read', 'Consultation des clôtures'),
  ('Caisse', 'Clotures', 'write', 'Gestion des clôtures de caisse'),
  
  -- Paramètres
  ('Paramètres', 'Utilisateurs', 'read', 'Consultation des utilisateurs'),
  ('Paramètres', 'Utilisateurs', 'write', 'Gestion des utilisateurs'),
  ('Paramètres', 'Permissions', 'read', 'Consultation des permissions'),
  ('Paramètres', 'Permissions', 'write', 'Gestion des permissions et rôles'),
  ('Paramètres', 'Zones', 'read', 'Consultation des zones géographiques'),
  ('Paramètres', 'Zones', 'write', 'Gestion des zones géographiques'),
  ('Paramètres', 'Fournisseurs', 'read', 'Consultation des fournisseurs'),
  ('Paramètres', 'Fournisseurs', 'write', 'Gestion des fournisseurs'),
  
  -- Rapports
  ('Rapports', 'Ventes', 'read', 'Consultation des rapports de ventes'),
  ('Rapports', 'Stocks', 'read', 'Consultation des rapports de stocks'),
  ('Rapports', 'Financiers', 'read', 'Consultation des rapports financiers'),
  ('Rapports', 'Clients', 'read', 'Consultation des rapports clients');

-- 4. ATTRIBUTION DE TOUTES LES PERMISSIONS AU RÔLE ADMINISTRATEUR
INSERT INTO public.role_permissions (role_id, permission_id, can_access)
SELECT r.id, p.id, true
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'Administrateur'
ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;

-- 5. ATTRIBUTION DE PERMISSIONS SPÉCIFIQUES AUX AUTRES RÔLES
-- Manager (accès étendu mais pas complet)
INSERT INTO public.role_permissions (role_id, permission_id, can_access)
SELECT r.id, p.id, true
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'Manager'
AND p.menu IN ('Dashboard', 'Catalogue', 'Stock', 'Ventes', 'Clients', 'Rapports')
AND p.action IN ('read', 'write')
ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;

-- Vendeur (ventes et clients)
INSERT INTO public.role_permissions (role_id, permission_id, can_access)
SELECT r.id, p.id, true
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'Vendeur'
AND (
  (p.menu = 'Dashboard' AND p.action = 'read') OR
  (p.menu = 'Catalogue' AND p.action = 'read') OR
  (p.menu = 'Ventes' AND p.action IN ('read', 'write')) OR
  (p.menu = 'Clients' AND p.action IN ('read', 'write')) OR
  (p.menu = 'Stock' AND p.submenu = 'PDV' AND p.action = 'read')
)
ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;

-- Caissier (transactions et caisse)
INSERT INTO public.role_permissions (role_id, permission_id, can_access)
SELECT r.id, p.id, true
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'Caissier'
AND (
  (p.menu = 'Dashboard' AND p.action = 'read') OR
  (p.menu = 'Catalogue' AND p.action = 'read') OR
  (p.menu = 'Caisse' AND p.action IN ('read', 'write')) OR
  (p.menu = 'Clients' AND p.action = 'read') OR
  (p.menu = 'Stock' AND p.submenu = 'PDV' AND p.action = 'read')
)
ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;

-- Gestionnaire Stock (stocks et inventaires)
INSERT INTO public.role_permissions (role_id, permission_id, can_access)
SELECT r.id, p.id, true
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'Gestionnaire Stock'
AND (
  (p.menu = 'Dashboard' AND p.action = 'read') OR
  (p.menu = 'Catalogue' AND p.action IN ('read', 'write')) OR
  (p.menu = 'Stock' AND p.action IN ('read', 'write')) OR
  (p.menu = 'Achats' AND p.action IN ('read', 'write')) OR
  (p.menu = 'Rapports' AND p.submenu = 'Stocks' AND p.action = 'read')
)
ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;

-- 6. FONCTION POUR VÉRIFIER LES PERMISSIONS UTILISATEUR
CREATE OR REPLACE FUNCTION public.user_has_permission(
    p_menu TEXT,
    p_submenu TEXT DEFAULT NULL,
    p_action TEXT DEFAULT 'read'
)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.utilisateurs_internes ui
        JOIN public.user_roles ur ON ui.user_id = ur.user_id AND ur.is_active = true
        JOIN public.role_permissions rp ON ur.role_id = rp.role_id AND rp.can_access = true
        JOIN public.permissions p ON rp.permission_id = p.id
        WHERE ui.user_id = auth.uid()
        AND ui.statut = 'actif'
        AND p.menu = p_menu
        AND (p_submenu IS NULL OR p.submenu = p_submenu)
        AND p.action = p_action
    );
$$;

-- 7. VUE POUR LES PERMISSIONS UTILISATEUR
CREATE OR REPLACE VIEW public.vue_permissions_utilisateurs AS
SELECT DISTINCT
    ui.user_id,
    ui.prenom,
    ui.nom,
    ui.email,
    r.name as role_name,
    p.menu,
    p.submenu,
    p.action,
    p.description,
    rp.can_access
FROM public.utilisateurs_internes ui
JOIN public.user_roles ur ON ui.user_id = ur.user_id AND ur.is_active = true
JOIN public.roles r ON ur.role_id = r.id
JOIN public.role_permissions rp ON r.id = rp.role_id
JOIN public.permissions p ON rp.permission_id = p.id
WHERE ui.statut = 'actif';

-- 8. POLITIQUE RLS POUR LA VUE PERMISSIONS
CREATE POLICY "Users can view permissions" 
ON public.vue_permissions_utilisateurs 
FOR SELECT 
TO authenticated 
USING (true);

-- 9. FORCER LA RÉPLICATION TEMPS RÉEL
ALTER TABLE public.roles REPLICA IDENTITY FULL;
ALTER TABLE public.permissions REPLICA IDENTITY FULL;
ALTER TABLE public.role_permissions REPLICA IDENTITY FULL;

-- Ajouter à la publication realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.roles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.permissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.role_permissions;

-- 10. INVALIDATION COMPLÈTE DU CACHE
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- 11. DIAGNOSTIC FINAL
SELECT 'RÉSULTAT FINAL' as titre;

SELECT 'Rôles créés' as diagnostic, COUNT(*) as nombre FROM public.roles;
SELECT 'Permissions créées' as diagnostic, COUNT(*) as nombre FROM public.permissions;
SELECT 'Attributions role_permissions' as diagnostic, COUNT(*) as nombre FROM public.role_permissions;

-- Vérifier les permissions par rôle
SELECT 
    r.name as role_name,
    COUNT(rp.permission_id) as nombre_permissions
FROM public.roles r
LEFT JOIN public.role_permissions rp ON r.id = rp.role_id AND rp.can_access = true
GROUP BY r.id, r.name
ORDER BY r.name;

-- Message final
SELECT 
    'SYSTÈME DE PERMISSIONS RESTAURÉ' as status,
    'Toutes les données de permissions ont été recréées' as message,
    now() as timestamp_correction;
