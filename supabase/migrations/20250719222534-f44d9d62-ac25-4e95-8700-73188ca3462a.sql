-- SYNCHRONISATION GLOBALE FINALE - CORRECTION DE L'AMBIGUÏTÉ
-- ==========================================================

-- 1. CORRECTIONS DES POLITIQUES RLS AVEC NOMS DE VARIABLES CORRECTS
-- ==================================================================

DO $$
DECLARE
    tbl_name text;
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
    FOREACH tbl_name IN ARRAY tables_to_secure
    LOOP
        -- Vérifier que c'est bien une table et pas une vue
        IF EXISTS (
            SELECT 1 
            FROM information_schema.tables t
            WHERE t.table_name = tbl_name 
            AND t.table_schema = 'public' 
            AND t.table_type = 'BASE TABLE'
        ) THEN
            -- Activer RLS
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl_name);
            
            -- Supprimer les anciennes politiques
            EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can access %s" ON public.%I', tbl_name, tbl_name);
            
            -- Créer les nouvelles politiques permissives
            EXECUTE format('CREATE POLICY "Authenticated users can access %s" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', tbl_name, tbl_name);
        END IF;
    END LOOP;
END $$;

-- 2. MISE À JOUR DE LA FONCTION DE RÉCUPÉRATION DES UTILISATEURS PAR RÔLE
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

-- 3. OPTIMISATION DE LA SYNCHRONISATION TEMPS RÉEL (CORRIGÉE)
-- ===========================================================

DO $$
DECLARE
    tbl_name text;
    realtime_tables text[] := ARRAY[
        'utilisateurs_internes', 'user_roles', 'roles', 'permissions', 
        'role_permissions', 'catalogue', 'stock_principal', 'stock_pdv',
        'factures_vente', 'precommandes', 'clients', 'entrepots', 'points_de_vente'
    ];
BEGIN
    FOREACH tbl_name IN ARRAY realtime_tables
    LOOP
        -- Vérifier que la table existe
        IF EXISTS (
            SELECT 1 
            FROM information_schema.tables t
            WHERE t.table_name = tbl_name 
            AND t.table_schema = 'public' 
            AND t.table_type = 'BASE TABLE'
        ) THEN
            -- Ajouter à la publication realtime si pas déjà fait
            BEGIN
                EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', tbl_name);
            EXCEPTION WHEN duplicate_object THEN
                -- Table déjà dans la publication, continuer
                NULL;
            END;
            
            -- S'assurer que la table a REPLICA IDENTITY FULL pour les updates complets
            EXECUTE format('ALTER TABLE public.%I REPLICA IDENTITY FULL', tbl_name);
        END IF;
    END LOOP;
END $$;

-- 4. MISE À JOUR DES HOOKS DE GESTION DES UTILISATEURS
-- ====================================================

-- Fonction pour créer automatiquement un profil utilisateur interne
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_matricule TEXT;
BEGIN
    -- Générer un matricule automatique
    SELECT generate_matricule(
        COALESCE(NEW.raw_user_meta_data->>'prenom', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'nom', 'Unknown')
    ) INTO new_matricule;

    -- Insérer dans utilisateurs_internes
    INSERT INTO public.utilisateurs_internes (
        user_id,
        matricule,
        prenom,
        nom,
        email,
        statut
    ) VALUES (
        NEW.id,
        new_matricule,
        COALESCE(NEW.raw_user_meta_data->>'prenom', 'Utilisateur'),
        COALESCE(NEW.raw_user_meta_data->>'nom', 'Nouveau'),
        NEW.email,
        'actif'
    );
    
    RETURN NEW;
END;
$$;

-- Recréer le trigger pour les nouveaux utilisateurs
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_signup();

-- 5. FONCTION DE VALIDATION DU SYSTÈME (CORRIGÉE)
-- ===============================================

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
           CASE WHEN COUNT(*) >= 7 THEN '✅ OK' ELSE '❌ MANQUANT' END as status,
           COUNT(*)::TEXT || ' tables trouvées' as details
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('catalogue', 'clients', 'factures_vente', 'utilisateurs_internes', 'user_roles', 'roles', 'permissions')
    
    UNION ALL
    
    -- Vérifier les foreign keys
    SELECT 'Relations (Foreign Keys)' as check_name,
           CASE WHEN COUNT(*) >= 10 THEN '✅ OK' ELSE '❌ INCOMPLET' END as status,
           COUNT(*)::TEXT || ' foreign keys actives' as details
    FROM information_schema.table_constraints 
    WHERE constraint_type = 'FOREIGN KEY' 
    AND table_schema = 'public'
    
    UNION ALL
    
    -- Vérifier les politiques RLS
    SELECT 'Politiques RLS' as check_name,
           CASE WHEN COUNT(*) >= 15 THEN '✅ OK' ELSE '❌ INSUFFISANT' END as status,
           COUNT(*)::TEXT || ' politiques actives' as details
    FROM pg_policies 
    WHERE schemaname = 'public'
    
    UNION ALL
    
    -- Vérifier les permissions de base
    SELECT 'Permissions système' as check_name,
           CASE WHEN COUNT(*) >= 20 THEN '✅ OK' ELSE '❌ MANQUANT' END as status,
           COUNT(*)::TEXT || ' permissions configurées' as details
    FROM public.permissions
    
    UNION ALL
    
    -- Vérifier les rôles de base
    SELECT 'Rôles système' as check_name,
           CASE WHEN COUNT(*) >= 3 THEN '✅ OK' ELSE '❌ MANQUANT' END as status,
           COUNT(*)::TEXT || ' rôles configurés' as details
    FROM public.roles
    
    UNION ALL
    
    -- Vérifier l'attribution des permissions à l'admin
    SELECT 'Permissions Administrateur' as check_name,
           CASE WHEN COUNT(*) >= 20 THEN '✅ OK' ELSE '❌ MANQUANT' END as status,
           COUNT(*)::TEXT || ' permissions attribuées' as details
    FROM public.role_permissions rp
    JOIN public.roles r ON rp.role_id = r.id
    WHERE r.name = 'Administrateur' AND rp.can_access = true;
$$;

-- 6. FINALISATION ET INVALIDATION DU CACHE
-- ========================================

-- Invalider complètement le cache PostgREST
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- Message de fin
SELECT 'SYNCHRONISATION GLOBALE TERMINÉE AVEC SUCCÈS' as message,
       '✅ Base de données entièrement synchronisée avec l''interface' as status;

-- Exécuter la validation finale
SELECT * FROM public.validate_system_sync() ORDER BY check_name;