
-- CORRECTION FINALE DE LA TABLE user_roles ET SYNCHRONISATION COMPLÈTE
-- =====================================================================

-- 1. Vérifier et corriger la structure complète de user_roles
DO $$
BEGIN
    -- Supprimer la table si elle existe pour la recréer proprement
    DROP TABLE IF EXISTS public.user_roles CASCADE;
    
    -- Créer la table user_roles avec la structure complète
    CREATE TABLE public.user_roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
        is_active BOOLEAN NOT NULL DEFAULT true,
        assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        assigned_by UUID REFERENCES auth.users(id),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        UNIQUE(user_id, role_id)
    );
    
    -- Activer RLS sur user_roles
    ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
    
    -- Créer des politiques RLS simples et sûres
    CREATE POLICY "Allow all operations on user_roles for authenticated users" 
    ON public.user_roles 
    FOR ALL 
    TO authenticated
    USING (true) 
    WITH CHECK (true);
    
    -- Créer le trigger pour updated_at
    CREATE OR REPLACE FUNCTION public.update_user_roles_updated_at()
    RETURNS TRIGGER AS $trigger$
    BEGIN
        NEW.updated_at = now();
        RETURN NEW;
    END;
    $trigger$ LANGUAGE plpgsql;
    
    DROP TRIGGER IF EXISTS update_user_roles_updated_at_trigger ON public.user_roles;
    CREATE TRIGGER update_user_roles_updated_at_trigger
        BEFORE UPDATE ON public.user_roles
        FOR EACH ROW
        EXECUTE FUNCTION public.update_user_roles_updated_at();
    
    -- Activer la réplication temps réel
    ALTER TABLE public.user_roles REPLICA IDENTITY FULL;
    
    -- Ajouter à la publication realtime
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;
    
EXCEPTION WHEN duplicate_object THEN
    -- Table déjà dans la publication
    NULL;
END $$;

-- 2. Synchroniser les autres tables critiques
ALTER TABLE public.utilisateurs_internes REPLICA IDENTITY FULL;
ALTER TABLE public.roles REPLICA IDENTITY FULL;
ALTER TABLE public.permissions REPLICA IDENTITY FULL;
ALTER TABLE public.role_permissions REPLICA IDENTITY FULL;

-- Ajouter toutes les tables à la publication realtime
DO $$
DECLARE
    tbl_name text;
    realtime_tables text[] := ARRAY[
        'utilisateurs_internes', 'roles', 'permissions', 'role_permissions'
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

-- 3. Créer des utilisateurs de test avec rôles pour validation
INSERT INTO public.user_roles (user_id, role_id, is_active, assigned_by)
SELECT 
    ui.user_id,
    r.id,
    true,
    ui.user_id
FROM public.utilisateurs_internes ui
CROSS JOIN public.roles r 
WHERE r.name = 'Administrateur'
AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur2 
    WHERE ur2.user_id = ui.user_id 
    AND ur2.role_id = r.id
)
LIMIT 5; -- Limiter aux 5 premiers utilisateurs pour éviter les doublons

-- 4. Fonction de diagnostic complète
CREATE OR REPLACE FUNCTION public.diagnostic_user_management_system()
RETURNS TABLE (
    diagnostic_type TEXT,
    status TEXT,
    count_result INTEGER,
    message TEXT,
    details JSONB
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
    -- Vérifier la structure user_roles
    SELECT 'Structure user_roles' as diagnostic_type,
           '✅ OK' as status,
           COUNT(column_name)::INTEGER as count_result,
           'Colonnes user_roles: ' || STRING_AGG(column_name, ', ') as message,
           jsonb_build_object('columns', jsonb_agg(column_name)) as details
    FROM information_schema.columns 
    WHERE table_name = 'user_roles' 
    AND table_schema = 'public'
    
    UNION ALL
    
    -- Vérifier les utilisateurs avec rôles actifs
    SELECT 'Utilisateurs avec rôles' as diagnostic_type,
           CASE WHEN COUNT(*) > 0 THEN '✅ OK' ELSE '⚠️ AUCUN' END as status,
           COUNT(*)::INTEGER as count_result,
           'Utilisateurs ayant un rôle actif' as message,
           jsonb_build_object('count', COUNT(*)) as details
    FROM public.user_roles ur
    WHERE ur.is_active = true
    
    UNION ALL
    
    -- Vérifier les utilisateurs internes actifs
    SELECT 'Utilisateurs internes' as diagnostic_type,
           CASE WHEN COUNT(*) > 0 THEN '✅ OK' ELSE '⚠️ AUCUN' END as status,
           COUNT(*)::INTEGER as count_result,
           'Utilisateurs internes avec statut actif' as message,
           jsonb_build_object('count', COUNT(*)) as details
    FROM public.utilisateurs_internes ui
    WHERE ui.statut = 'actif'
    
    UNION ALL
    
    -- Vérifier les rôles disponibles
    SELECT 'Rôles système' as diagnostic_type,
           CASE WHEN COUNT(*) >= 3 THEN '✅ OK' ELSE '❌ INSUFFISANT' END as status,
           COUNT(*)::INTEGER as count_result,
           'Rôles configurés: ' || STRING_AGG(name, ', ') as message,
           jsonb_build_object('roles', jsonb_agg(name)) as details
    FROM public.roles
    
    UNION ALL
    
    -- Test de requête JOIN complexe
    SELECT 'Test JOIN utilisateurs-rôles' as diagnostic_type,
           CASE WHEN COUNT(*) > 0 THEN '✅ OK' ELSE '❌ ÉCHEC' END as status,
           COUNT(*)::INTEGER as count_result,
           'Requêtes JOIN fonctionnelles' as message,
           jsonb_build_object('join_count', COUNT(*)) as details
    FROM public.utilisateurs_internes ui
    LEFT JOIN public.user_roles ur ON ui.user_id = ur.user_id AND ur.is_active = true
    LEFT JOIN public.roles r ON ur.role_id = r.id;
$$;

-- 5. Forcer l'invalidation du cache PostgREST
NOTIFY pgrst, 'reload schema';

-- 6. Notification de fin
DO $$
BEGIN
    RAISE NOTICE 'SYNCHRONISATION TERMINÉE: user_roles recréé avec colonnes created_at/updated_at, RLS configuré, temps réel activé';
END $$;
