
-- CORRECTION DES DYSFONCTIONNEMENTS CRITIQUES
-- =============================================

-- 1. CORRECTION DE LA COLONNE MANQUANTE 'updated_at' DANS user_roles
-- ====================================================================
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Créer le trigger pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION public.update_user_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger à la table user_roles
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON public.user_roles;
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_roles_updated_at();

-- 2. CORRIGER ET SYNCHRONISER LES PERMISSIONS COMPLÈTES
-- =====================================================

-- Supprimer et recréer les permissions avec la structure complète synchronisée
DELETE FROM public.permissions;

-- Insérer la liste complète et synchronisée des permissions (identique à PermissionsMatrix et PermissionsManagement)
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
('Stock', 'Entrées', 'read', 'Consultation des entrées de stock'),
('Stock', 'Entrées', 'write', 'Gestion des entrées de stock'),
('Stock', 'Sorties', 'read', 'Consultation des sorties de stock'),
('Stock', 'Sorties', 'write', 'Gestion des sorties de stock'),

-- Achats
('Achats', 'Bons de commande', 'read', 'Consultation des bons de commande'),
('Achats', 'Bons de commande', 'write', 'Gestion des bons de commande'),
('Achats', 'Bons de livraison', 'read', 'Consultation des bons de livraison'),
('Achats', 'Bons de livraison', 'write', 'Gestion des bons de livraison'),
('Achats', 'Factures', 'read', 'Consultation des factures d''achat'),
('Achats', 'Factures', 'write', 'Gestion des factures d''achat'),

-- Ventes
('Ventes', 'Factures', 'read', 'Consultation des factures de vente'),
('Ventes', 'Factures', 'write', 'Gestion des factures de vente'),
('Ventes', 'Précommandes', 'read', 'Consultation des précommandes'),
('Ventes', 'Précommandes', 'write', 'Gestion des précommandes'),
('Ventes', 'Devis', 'read', 'Consultation des devis'),
('Ventes', 'Devis', 'write', 'Gestion des devis'),
('Ventes', 'Vente au Comptoir', 'read', 'Consultation des ventes au comptoir'),
('Ventes', 'Vente au Comptoir', 'write', 'Gestion des ventes au comptoir'),
('Ventes', 'Factures impayées', 'read', 'Consultation des factures impayées'),
('Ventes', 'Factures impayées', 'write', 'Gestion des factures impayées'),
('Ventes', 'Retours Clients', 'read', 'Consultation des retours clients'),
('Ventes', 'Retours Clients', 'write', 'Gestion des retours clients'),

-- Clients
('Clients', NULL, 'read', 'Consultation des clients'),
('Clients', NULL, 'write', 'Gestion des clients'),
('Clients', 'Clients', 'read', 'Consultation détaillée des clients'),
('Clients', 'Clients', 'write', 'Gestion détaillée des clients'),

-- Caisse
('Caisse', NULL, 'read', 'Consultation de la caisse'),
('Caisse', NULL, 'write', 'Gestion de la caisse'),
('Caisse', 'Dépenses', 'read', 'Consultation des dépenses de caisse'),
('Caisse', 'Dépenses', 'write', 'Gestion des dépenses de caisse'),
('Caisse', 'Aperçu du jour', 'read', 'Consultation de l''aperçu journalier'),

-- Marges
('Marges', NULL, 'read', 'Consultation des marges'),

-- Rapports
('Rapports', NULL, 'read', 'Consultation des rapports'),
('Rapports', NULL, 'write', 'Génération de rapports'),

-- Paramètres
('Paramètres', NULL, 'read', 'Accès aux paramètres généraux'),
('Paramètres', NULL, 'write', 'Modification des paramètres généraux'),
('Paramètres', 'Utilisateurs', 'read', 'Consultation des utilisateurs'),
('Paramètres', 'Utilisateurs', 'write', 'Gestion des utilisateurs'),
('Paramètres', 'Permissions', 'read', 'Consultation des permissions'),
('Paramètres', 'Permissions', 'write', 'Gestion des permissions'),
('Paramètres', 'Fournisseurs', 'read', 'Consultation des fournisseurs'),
('Paramètres', 'Fournisseurs', 'write', 'Gestion des fournisseurs');

-- 3. RÉASSIGNER TOUTES LES PERMISSIONS À L'ADMINISTRATEUR
-- =======================================================
DELETE FROM public.role_permissions 
WHERE role_id = (SELECT id FROM public.roles WHERE name = 'Administrateur');

INSERT INTO public.role_permissions (role_id, permission_id, can_access)
SELECT r.id, p.id, true
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'Administrateur';

-- 4. CORRIGER LA VUE DES PERMISSIONS UTILISATEURS
-- ===============================================
DROP VIEW IF EXISTS public.vue_permissions_utilisateurs;

CREATE OR REPLACE VIEW public.vue_permissions_utilisateurs AS
SELECT DISTINCT
    ui.user_id,
    p.id as permission_id,
    p.menu,
    p.submenu,
    p.action,
    p.description,
    rp.can_access
FROM public.utilisateurs_internes ui
JOIN public.user_roles ur ON ui.user_id = ur.user_id AND ur.is_active = true
JOIN public.roles r ON ur.role_id = r.id
JOIN public.role_permissions rp ON r.id = rp.role_id AND rp.can_access = true
JOIN public.permissions p ON rp.permission_id = p.id
WHERE ui.statut = 'actif';

-- 5. OPTIMISER LA FONCTION DE VÉRIFICATION DES PERMISSIONS
-- ========================================================
CREATE OR REPLACE FUNCTION public.user_has_permission(
    user_uuid uuid, 
    menu_name text, 
    submenu_name text DEFAULT NULL, 
    action_name text DEFAULT 'read'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.vue_permissions_utilisateurs vpu
        WHERE vpu.user_id = user_uuid
        AND vpu.menu = menu_name
        AND (submenu_name IS NULL OR vpu.submenu = submenu_name)
        AND vpu.action = action_name
        AND vpu.can_access = true
    );
END;
$$;

-- 6. ACTIVER LA RÉPLICATION TEMPS RÉEL POUR TOUTES LES TABLES CRITIQUES
-- =====================================================================
ALTER TABLE public.user_roles REPLICA IDENTITY FULL;
ALTER TABLE public.roles REPLICA IDENTITY FULL;
ALTER TABLE public.permissions REPLICA IDENTITY FULL;
ALTER TABLE public.role_permissions REPLICA IDENTITY FULL;
ALTER TABLE public.utilisateurs_internes REPLICA IDENTITY FULL;

-- Ajouter les tables à la publication realtime si pas déjà fait
DO $$
DECLARE
    tbl_name text;
    realtime_tables text[] := ARRAY[
        'user_roles', 'roles', 'permissions', 'role_permissions', 'utilisateurs_internes'
    ];
BEGIN
    FOREACH tbl_name IN ARRAY realtime_tables
    LOOP
        BEGIN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', tbl_name);
        EXCEPTION WHEN duplicate_object THEN
            -- Table déjà dans la publication, continuer
            NULL;
        END;
    END LOOP;
END $$;

-- 7. FONCTION DE DIAGNOSTIC POUR VÉRIFIER L'ÉTAT DU SYSTÈME
-- =========================================================
CREATE OR REPLACE FUNCTION public.diagnostic_permissions_system()
RETURNS TABLE (
    check_name TEXT,
    status TEXT,
    count_value INTEGER,
    details TEXT
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
    -- Vérifier les permissions totales
    SELECT 'Permissions totales' as check_name,
           '✅ OK' as status,
           COUNT(*)::INTEGER as count_value,
           'Permissions configurées dans le système' as details
    FROM public.permissions
    
    UNION ALL
    
    -- Vérifier les rôles
    SELECT 'Rôles système' as check_name,
           CASE WHEN COUNT(*) >= 3 THEN '✅ OK' ELSE '❌ MANQUANT' END as status,
           COUNT(*)::INTEGER as count_value,
           'Rôles configurés' as details
    FROM public.roles
    
    UNION ALL
    
    -- Vérifier les permissions de l'Administrateur
    SELECT 'Permissions Administrateur' as check_name,
           CASE WHEN COUNT(*) >= 40 THEN '✅ OK' ELSE '❌ INSUFFISANT' END as status,
           COUNT(*)::INTEGER as count_value,
           'Permissions attribuées au rôle Administrateur' as details
    FROM public.role_permissions rp
    JOIN public.roles r ON rp.role_id = r.id
    WHERE r.name = 'Administrateur' AND rp.can_access = true
    
    UNION ALL
    
    -- Vérifier les utilisateurs avec rôles
    SELECT 'Utilisateurs avec rôles' as check_name,
           CASE WHEN COUNT(*) > 0 THEN '✅ OK' ELSE '⚠️ AUCUN' END as status,
           COUNT(*)::INTEGER as count_value,
           'Utilisateurs ayant un rôle actif' as details
    FROM public.user_roles ur
    JOIN public.utilisateurs_internes ui ON ur.user_id = ui.user_id
    WHERE ur.is_active = true AND ui.statut = 'actif'
    
    UNION ALL
    
    -- Vérifier la vue des permissions utilisateurs
    SELECT 'Vue permissions utilisateurs' as check_name,
           CASE WHEN COUNT(*) > 0 THEN '✅ OK' ELSE '❌ VIDE' END as status,
           COUNT(*)::INTEGER as count_value,
           'Entrées dans la vue des permissions utilisateurs' as details
    FROM public.vue_permissions_utilisateurs;
$$;

-- Invalider le cache PostgREST
NOTIFY pgrst, 'reload schema';
