
-- Diagnostic complet de l'état actuel des politiques RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('utilisateurs_internes', 'user_roles', 'roles', 'roles_utilisateurs')
ORDER BY tablename, policyname;

-- Diagnostic des fonctions qui pourraient causer des récursions
SELECT 
    routine_name,
    routine_type,
    security_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%user%' OR routine_name LIKE '%role%' OR routine_name LIKE '%auth%'
ORDER BY routine_name;

-- Nettoyage radical - Supprimer TOUTES les politiques sur utilisateurs_internes
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Supprimer toutes les politiques existantes sur utilisateurs_internes
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'utilisateurs_internes'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.utilisateurs_internes', policy_record.policyname);
    END LOOP;
END $$;

-- Supprimer toutes les fonctions liées aux utilisateurs qui pourraient causer des récursions
DROP FUNCTION IF EXISTS public.get_user_role_for_rls();
DROP FUNCTION IF EXISTS public.is_internal_user_active(uuid);
DROP FUNCTION IF EXISTS public.check_user_is_internal();
DROP FUNCTION IF EXISTS public.check_user_is_admin();
DROP FUNCTION IF EXISTS public.is_admin_or_manager();
DROP FUNCTION IF EXISTS public.check_user_authorization();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Désactiver complètement RLS temporairement pour diagnostic
ALTER TABLE public.utilisateurs_internes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles DISABLE ROW LEVEL SECURITY;

-- Supprimer les triggers problématiques
DROP TRIGGER IF EXISTS check_user_authorization_trigger ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Réactiver RLS avec des politiques ultra-permissives pour le développement
ALTER TABLE public.utilisateurs_internes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Créer des politiques de développement ultra-simples (pas de logique complexe)
CREATE POLICY "dev_full_access_utilisateurs_internes" 
ON public.utilisateurs_internes 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "dev_full_access_user_roles" 
ON public.user_roles 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "dev_full_access_roles" 
ON public.roles 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Nettoyer aussi roles_utilisateurs si elle existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'roles_utilisateurs' AND table_schema = 'public') THEN
        ALTER TABLE public.roles_utilisateurs DISABLE ROW LEVEL SECURITY;
        ALTER TABLE public.roles_utilisateurs ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "dev_full_access_roles_utilisateurs" 
        ON public.roles_utilisateurs 
        FOR ALL 
        USING (true) 
        WITH CHECK (true);
    END IF;
END $$;

-- Invalider complètement le cache PostgREST
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- Vérification finale - lister toutes les politiques restantes
SELECT 
    'FINAL CHECK' as status,
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('utilisateurs_internes', 'user_roles', 'roles', 'roles_utilisateurs')
ORDER BY tablename, policyname;
