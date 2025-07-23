
-- Supprimer toutes les politiques RLS liées aux utilisateurs internes
DROP POLICY IF EXISTS "ULTRA_PERMISSIVE_utilisateurs_internes" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "ULTRA_PERMISSIVE_user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow all operations on utilisateurs_internes" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "admin_full_access_utilisateurs_internes" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "allow_all_for_edge_function_utilisateurs_internes" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Service role can access utilisateurs_internes" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Les utilisateurs internes peuvent voir tous les utilisateurs" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Seuls les administrateurs peuvent créer des utilisateurs" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Seuls les administrateurs peuvent modifier des utilisateurs" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Seuls les administrateurs peuvent supprimer des utilisateurs" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Seuls les utilisateurs internes peuvent voir les utilisateurs" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Allow all operations on user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "allow_all_for_edge_function_user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "bypass_rls_for_authenticated_users" ON public.user_roles;
DROP POLICY IF EXISTS "Service role can access user_roles" ON public.user_roles;

-- Supprimer les triggers liés aux utilisateurs internes
DROP TRIGGER IF EXISTS trigger_generate_matricule ON public.utilisateurs_internes;
DROP TRIGGER IF EXISTS update_utilisateurs_internes_updated_at ON public.utilisateurs_internes;
DROP TRIGGER IF EXISTS check_user_authorization_trigger ON auth.users;

-- Supprimer les fonctions liées aux utilisateurs internes
DROP FUNCTION IF EXISTS public.generate_matricule(text, text);
DROP FUNCTION IF EXISTS public.generate_matricule_if_needed();
DROP FUNCTION IF EXISTS public.auto_generate_matricule();
DROP FUNCTION IF EXISTS public.get_user_role_for_rls();
DROP FUNCTION IF EXISTS public.is_internal_user_active(uuid);
DROP FUNCTION IF EXISTS public.check_user_authorization();
DROP FUNCTION IF EXISTS public.cleanup_duplicate_users(text);
DROP FUNCTION IF EXISTS public.verify_user_creation_ready(text);
DROP FUNCTION IF EXISTS public.email_exists_in_auth(text);
DROP FUNCTION IF EXISTS public.diagnostic_user_management_system();

-- Supprimer les tables dans l'ordre correct (en tenant compte des dépendances)
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.utilisateurs_internes CASCADE;
DROP TABLE IF EXISTS public.roles_utilisateurs CASCADE;

-- Supprimer les vues liées aux utilisateurs internes
DROP VIEW IF EXISTS public.vue_permissions_utilisateurs CASCADE;
DROP VIEW IF EXISTS public.vue_marges_globales_stock CASCADE;

-- Supprimer les types personnalisés liés aux utilisateurs internes
DROP TYPE IF EXISTS public.user_status CASCADE;
DROP TYPE IF EXISTS public.account_type CASCADE;

-- Supprimer les contraintes orphelines qui pourraient subsister
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Supprimer toutes les contraintes de clé étrangère qui référencent les tables supprimées
    FOR constraint_record IN 
        SELECT constraint_name, table_name 
        FROM information_schema.table_constraints 
        WHERE constraint_type = 'FOREIGN KEY' 
        AND constraint_name LIKE '%utilisateurs_internes%'
        OR constraint_name LIKE '%user_roles%'
        OR constraint_name LIKE '%roles_utilisateurs%'
    LOOP
        EXECUTE format('ALTER TABLE IF EXISTS public.%I DROP CONSTRAINT IF EXISTS %I', 
                      constraint_record.table_name, constraint_record.constraint_name);
    END LOOP;
END $$;

-- Nettoyer les index orphelins
DROP INDEX IF EXISTS public.idx_utilisateurs_internes_matricule;
DROP INDEX IF EXISTS public.idx_utilisateurs_internes_user_id;
DROP INDEX IF EXISTS public.idx_utilisateurs_internes_email;
DROP INDEX IF EXISTS public.idx_user_roles_user_id;
DROP INDEX IF EXISTS public.idx_user_roles_role_id;

-- Supprimer les buckets de stockage liés aux utilisateurs internes
DELETE FROM storage.objects WHERE bucket_id = 'user-photos';
DELETE FROM storage.objects WHERE bucket_id = 'avatars';
DELETE FROM storage.buckets WHERE id IN ('user-photos', 'avatars');

-- Vérification finale - afficher les tables restantes
SELECT 'Tables restantes après nettoyage:' as status;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%utilisateur%' 
OR table_name LIKE '%user_role%' 
OR table_name LIKE '%roles_utilisateur%';
