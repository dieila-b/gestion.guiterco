-- FINALISATION DE LA SYNCHRONISATION - CORRECTION DES ERREURS
-- ==========================================================

-- 1. ACTIVATION DU RLS UNIQUEMENT SUR LES VRAIES TABLES (PAS LES VUES)
-- ====================================================================

-- Corriger les politiques RLS - Exclure les vues du processus RLS
DO $$
DECLARE
    table_name text;
    tables_to_secure text[] := ARRAY[
        'articles_bon_commande', 'articles_bon_livraison', 'articles_facture_achat', 
        'articles_retour_client', 'bons_de_commande', 'bons_de_livraison', 
        'categories_catalogue', 'commandes_clients', 'devis_vente', 
        'factures_achat', 'factures_precommandes', 'fournisseurs', 
        'lignes_commande', 'lignes_devis', 'notifications_precommandes', 
        'paiements_vente', 'pays', 'reglements_achat', 'retours_clients', 
        'retours_fournisseurs'
    ];
BEGIN
    FOREACH table_name IN ARRAY tables_to_secure
    LOOP
        -- Vérifier que c'est bien une table et pas une vue
        IF EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_name = table_name 
            AND table_schema = 'public' 
            AND table_type = 'BASE TABLE'
        ) THEN
            -- Activer RLS
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
            
            -- Supprimer les anciennes politiques
            EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can access %s" ON public.%I', table_name, table_name);
            
            -- Créer les nouvelles politiques permissives
            EXECUTE format('CREATE POLICY "Authenticated users can access %s" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', table_name, table_name);
        END IF;
    END LOOP;
END $$;

-- Activer RLS sur livraison_statut uniquement si c'est une table
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'livraison_statut' 
        AND table_schema = 'public' 
        AND table_type = 'BASE TABLE'
    ) THEN
        ALTER TABLE public.livraison_statut ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Authenticated users can access livraison_statut" ON public.livraison_statut;
        CREATE POLICY "Authenticated users can access livraison_statut" ON public.livraison_statut FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 2. CORRECTIONS SPÉCIFIQUES POUR LES PERMISSIONS ET RÔLES
-- ========================================================

-- S'assurer que nous avons les permissions de base dans le système
INSERT INTO public.permissions (menu, submenu, action, description) VALUES
('Dashboard', NULL, 'read', 'Accès au tableau de bord'),
('Catalogue', NULL, 'read', 'Lecture du catalogue'),
('Catalogue', NULL, 'write', 'Modification du catalogue'),
('Catalogue', NULL, 'delete', 'Suppression d''articles du catalogue'),
('Stock', 'Entrepôts', 'read', 'Lecture des entrepôts'),
('Stock', 'Entrepôts', 'write', 'Modification des entrepôts'),
('Stock', 'Entrepôts', 'delete', 'Suppression des entrepôts'),
('Stock', 'PDV', 'read', 'Lecture des points de vente'),
('Stock', 'PDV', 'write', 'Modification des points de vente'),
('Stock', 'PDV', 'delete', 'Suppression des points de vente'),
('Stock', 'Transferts', 'read', 'Lecture des transferts de stock'),
('Stock', 'Transferts', 'write', 'Création de transferts de stock'),
('Stock', 'Transferts', 'delete', 'Suppression des transferts'),
('Stock', 'Entrées', 'read', 'Lecture des entrées de stock'),
('Stock', 'Entrées', 'write', 'Saisie d''entrées de stock'),
('Stock', 'Entrées', 'delete', 'Suppression d''entrées de stock'),
('Stock', 'Sorties', 'read', 'Lecture des sorties de stock'),
('Stock', 'Sorties', 'write', 'Saisie de sorties de stock'),
('Stock', 'Sorties', 'delete', 'Suppression de sorties de stock'),
('Ventes', 'Vente au Comptoir', 'read', 'Accès à la vente au comptoir'),
('Ventes', 'Vente au Comptoir', 'write', 'Création de ventes au comptoir'),
('Ventes', 'Factures impayées', 'read', 'Consultation des factures impayées'),
('Ventes', 'Factures impayées', 'write', 'Modification des factures impayées'),
('Ventes', 'Retours Clients', 'read', 'Consultation des retours clients'),
('Ventes', 'Retours Clients', 'write', 'Traitement des retours clients'),
('Achats', 'Bons de Commande', 'read', 'Lecture des bons de commande'),
('Achats', 'Bons de Commande', 'write', 'Création de bons de commande'),
('Achats', 'Bons de Commande', 'delete', 'Suppression de bons de commande'),
('Achats', 'Réceptions', 'read', 'Lecture des réceptions'),
('Achats', 'Réceptions', 'write', 'Traitement des réceptions'),
('Achats', 'Factures', 'read', 'Lecture des factures d''achat'),
('Achats', 'Factures', 'write', 'Saisie des factures d''achat'),
('Finances', 'Caisse', 'read', 'Consultation de la caisse'),
('Finances', 'Caisse', 'write', 'Opérations de caisse'),
('Finances', 'Rapports', 'read', 'Consultation des rapports financiers'),
('Paramètres', 'Utilisateurs', 'read', 'Consultation des utilisateurs'),
('Paramètres', 'Utilisateurs', 'write', 'Gestion des utilisateurs'),
('Paramètres', 'Utilisateurs', 'delete', 'Suppression des utilisateurs'),
('Paramètres', 'Rôles', 'read', 'Consultation des rôles'),
('Paramètres', 'Rôles', 'write', 'Gestion des rôles'),
('Paramètres', 'Rôles', 'delete', 'Suppression des rôles'),
('Paramètres', 'Permissions', 'read', 'Consultation des permissions'),
('Paramètres', 'Permissions', 'write', 'Gestion des permissions')
ON CONFLICT (menu, COALESCE(submenu, ''), action) DO NOTHING;

-- S'assurer que nous avons les rôles de base
INSERT INTO public.roles (name, description, is_system) VALUES
('Administrateur', 'Accès complet à toutes les fonctionnalités', true),
('Manager', 'Accès aux opérations principales et rapports', false),
('Vendeur', 'Accès aux ventes et consultation du stock', false),
('Magasinier', 'Accès à la gestion du stock et des réceptions', false)
ON CONFLICT (name) DO NOTHING;

-- 3. ATTRIBUTIONS DE PERMISSIONS PAR DÉFAUT POUR L'ADMINISTRATEUR
-- ===============================================================

-- Attribuer automatiquement toutes les permissions au rôle Administrateur
DO $$
DECLARE
    admin_role_id UUID;
    permission_record RECORD;
BEGIN
    -- Récupérer l'ID du rôle Administrateur
    SELECT id INTO admin_role_id FROM public.roles WHERE name = 'Administrateur' LIMIT 1;
    
    IF admin_role_id IS NOT NULL THEN
        -- Supprimer les anciennes permissions de l'administrateur
        DELETE FROM public.role_permissions WHERE role_id = admin_role_id;
        
        -- Attribuer toutes les permissions à l'administrateur
        FOR permission_record IN SELECT id FROM public.permissions LOOP
            INSERT INTO public.role_permissions (role_id, permission_id, can_access)
            VALUES (admin_role_id, permission_record.id, true)
            ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;
        END LOOP;
    END IF;
END $$;

-- 4. FONCTION AMÉLIORÉE POUR LA VÉRIFICATION DES PERMISSIONS
-- =========================================================

-- Fonction pour vérifier les permissions utilisateur (mise à jour)
CREATE OR REPLACE FUNCTION public.user_has_permission(
    user_uuid UUID, 
    menu_name TEXT, 
    submenu_name TEXT DEFAULT NULL, 
    action_name TEXT DEFAULT 'read'
)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.user_roles ur
        JOIN public.role_permissions rp ON ur.role_id = rp.role_id
        JOIN public.permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = user_uuid
        AND ur.is_active = true
        AND rp.can_access = true
        AND p.menu = menu_name
        AND (submenu_name IS NULL OR p.submenu = submenu_name)
        AND p.action = action_name
    );
$$;

-- 5. MISE À JOUR DE LA VUE DES PERMISSIONS UTILISATEURS
-- ====================================================

-- Recréer la vue avec une meilleure structure
DROP VIEW IF EXISTS public.vue_permissions_utilisateurs CASCADE;
CREATE VIEW public.vue_permissions_utilisateurs AS
SELECT DISTINCT
    ur.user_id,
    p.menu,
    p.submenu,
    p.action,
    rp.can_access,
    ui.prenom,
    ui.nom,
    ui.email,
    ui.matricule,
    r.name as role_name,
    r.id as role_id
FROM public.user_roles ur
JOIN public.roles r ON ur.role_id = r.id
JOIN public.role_permissions rp ON r.id = rp.role_id
JOIN public.permissions p ON rp.permission_id = p.id
LEFT JOIN public.utilisateurs_internes ui ON ur.user_id = ui.user_id
WHERE ur.is_active = true;

-- 6. CRÉATION D'UNE FONCTION POUR OBTENIR TOUS LES UTILISATEURS D'UN RÔLE
-- =======================================================================

CREATE OR REPLACE FUNCTION public.get_users_by_role(role_uuid UUID)
RETURNS TABLE (
    user_id UUID,
    prenom TEXT,
    nom TEXT,
    email TEXT,
    matricule TEXT,
    statut TEXT,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        ui.user_id,
        ui.prenom,
        ui.nom,
        ui.email,
        ui.matricule,
        ui.statut,
        ui.created_at
    FROM public.utilisateurs_internes ui
    INNER JOIN public.user_roles ur ON ui.user_id = ur.user_id
    WHERE ur.role_id = role_uuid
    AND ur.is_active = true
    AND ui.statut = 'actif'
    ORDER BY ui.nom, ui.prenom;
$$;

-- 7. OPTIMISATION DE LA SYNCHRONISATION TEMPS RÉEL
-- ================================================

-- Activer les publications pour le temps réel sur les tables critiques
DO $$
DECLARE
    table_name text;
    realtime_tables text[] := ARRAY[
        'utilisateurs_internes', 'user_roles', 'roles', 'permissions', 
        'role_permissions', 'catalogue', 'stock_principal', 'stock_pdv',
        'factures_vente', 'precommandes', 'clients', 'entrepots', 'points_de_vente'
    ];
BEGIN
    FOREACH table_name IN ARRAY realtime_tables
    LOOP
        -- Vérifier que la table existe
        IF EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_name = table_name 
            AND table_schema = 'public' 
            AND table_type = 'BASE TABLE'
        ) THEN
            -- Ajouter à la publication realtime si pas déjà fait
            BEGIN
                EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', table_name);
            EXCEPTION WHEN duplicate_object THEN
                -- Table déjà dans la publication, continuer
                NULL;
            END;
            
            -- S'assurer que la table a REPLICA IDENTITY FULL pour les updates complets
            EXECUTE format('ALTER TABLE public.%I REPLICA IDENTITY FULL', table_name);
        END IF;
    END LOOP;
END $$;

-- 8. VALIDATION FINALE DE LA SYNCHRONISATION
-- ==========================================

-- Créer une fonction de validation de l'état du système
CREATE OR REPLACE FUNCTION public.validate_system_sync()
RETURNS TABLE (
    check_name TEXT,
    status TEXT,
    details TEXT
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
    -- Vérifier les tables principales
    SELECT 'Tables principales' as check_name, 
           CASE WHEN COUNT(*) >= 10 THEN '✅ OK' ELSE '❌ MANQUANT' END as status,
           COUNT(*)::TEXT || ' tables trouvées' as details
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('catalogue', 'clients', 'factures_vente', 'utilisateurs_internes', 'user_roles', 'roles', 'permissions')
    
    UNION ALL
    
    -- Vérifier les foreign keys
    SELECT 'Relations (Foreign Keys)' as check_name,
           CASE WHEN COUNT(*) >= 15 THEN '✅ OK' ELSE '❌ INCOMPLET' END as status,
           COUNT(*)::TEXT || ' foreign keys actives' as details
    FROM information_schema.table_constraints 
    WHERE constraint_type = 'FOREIGN KEY' 
    AND table_schema = 'public'
    
    UNION ALL
    
    -- Vérifier les politiques RLS
    SELECT 'Politiques RLS' as check_name,
           CASE WHEN COUNT(*) >= 20 THEN '✅ OK' ELSE '❌ INSUFFISANT' END as status,
           COUNT(*)::TEXT || ' politiques actives' as details
    FROM pg_policies 
    WHERE schemaname = 'public'
    
    UNION ALL
    
    -- Vérifier les permissions de base
    SELECT 'Permissions système' as check_name,
           CASE WHEN COUNT(*) >= 30 THEN '✅ OK' ELSE '❌ MANQUANT' END as status,
           COUNT(*)::TEXT || ' permissions configurées' as details
    FROM public.permissions
    
    UNION ALL
    
    -- Vérifier les rôles de base
    SELECT 'Rôles système' as check_name,
           CASE WHEN COUNT(*) >= 4 THEN '✅ OK' ELSE '❌ MANQUANT' END as status,
           COUNT(*)::TEXT || ' rôles configurés' as details
    FROM public.roles;
$$;

-- 9. INVALIDATION DU CACHE ET FINALISATION
-- ========================================

-- Invalider complètement le cache PostgREST
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- Exécuter la validation finale
SELECT * FROM public.validate_system_sync() ORDER BY check_name;