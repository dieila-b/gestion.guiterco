-- Supprimer complètement la table utilisateurs_internes et toutes ses dépendances

-- 1. Supprimer les triggers liés à la table utilisateurs_internes
DROP TRIGGER IF EXISTS update_utilisateurs_internes_updated_at ON public.utilisateurs_internes;

-- 2. Supprimer les contraintes de clés étrangères qui référencent utilisateurs_internes
-- (Vérifier s'il y en a dans d'autres tables)
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- Supprimer toutes les contraintes de clés étrangères qui référencent utilisateurs_internes
    FOR r IN (
        SELECT conname, conrelid::regclass as table_name
        FROM pg_constraint 
        WHERE confrelid = 'public.utilisateurs_internes'::regclass
    )
    LOOP
        EXECUTE 'ALTER TABLE ' || r.table_name || ' DROP CONSTRAINT IF EXISTS ' || r.conname;
    END LOOP;
END $$;

-- 3. Supprimer les index spécifiques à la table
DROP INDEX IF EXISTS idx_utilisateurs_internes_user_id;
DROP INDEX IF EXISTS idx_utilisateurs_internes_email;
DROP INDEX IF EXISTS idx_utilisateurs_internes_role_id;

-- 4. Supprimer toutes les politiques RLS de la table
DROP POLICY IF EXISTS "Authenticated users can access utilisateurs_internes" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Admins can manage all internal users" ON public.utilisateurs_internes;

-- 5. Supprimer définitivement la table utilisateurs_internes
DROP TABLE IF EXISTS public.utilisateurs_internes CASCADE;

-- 6. Nettoyer les fonctions qui pourraient référencer cette table
DROP FUNCTION IF EXISTS public.get_internal_user_by_id(uuid);
DROP FUNCTION IF EXISTS public.create_internal_user_with_auth(text, text, text, text, text, uuid);
DROP FUNCTION IF EXISTS public.check_internal_user(uuid);

-- 7. Vérification finale - Afficher le statut de nettoyage
SELECT 
    'Table utilisateurs_internes supprimée' as status,
    NOT EXISTS(
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'utilisateurs_internes'
    ) as table_deleted;