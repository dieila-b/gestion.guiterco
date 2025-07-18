
-- Nettoyer complètement toutes les politiques RLS problématiques
-- Supprimer toutes les politiques existantes sur utilisateurs_internes
DROP POLICY IF EXISTS "Allow authenticated users to read utilisateurs_internes" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Allow authenticated users to create utilisateurs_internes" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Allow authenticated users to update utilisateurs_internes" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Allow authenticated users to delete utilisateurs_internes" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Utilisateurs internes peuvent voir tous les utilisateurs" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Les administrateurs peuvent créer des utilisateurs" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Les administrateurs peuvent modifier des utilisateurs" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Les administrateurs peuvent supprimer des utilisateurs" ON public.utilisateurs_internes;

-- Supprimer toutes les fonctions qui pourraient causer la récursion
DROP FUNCTION IF EXISTS public.check_user_is_internal();
DROP FUNCTION IF EXISTS public.check_user_is_admin();
DROP FUNCTION IF EXISTS public.get_user_role_for_rls();
DROP FUNCTION IF EXISTS public.is_admin_or_manager();
DROP FUNCTION IF EXISTS public.is_internal_user_active(uuid);

-- Désactiver complètement RLS sur utilisateurs_internes
ALTER TABLE public.utilisateurs_internes DISABLE ROW LEVEL SECURITY;

-- Réactiver RLS avec des politiques ultra-simples
ALTER TABLE public.utilisateurs_internes ENABLE ROW LEVEL SECURITY;

-- Politique ultra-simple pour toutes les opérations - accessible à tous les utilisateurs authentifiés
CREATE POLICY "Full access for authenticated users" 
ON public.utilisateurs_internes 
FOR ALL 
TO authenticated
USING (true) 
WITH CHECK (true);

-- Nettoyer aussi les politiques sur les tables liées
-- Table user_roles
DROP POLICY IF EXISTS "Allow authenticated users to manage user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow all operations on user_roles for authenticated users" ON public.user_roles;

ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Full access user_roles for authenticated" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (true) 
WITH CHECK (true);

-- Table roles
DROP POLICY IF EXISTS "Allow authenticated users to read unified roles" ON public.roles;
DROP POLICY IF EXISTS "Allow authenticated users to manage unified roles" ON public.roles;
DROP POLICY IF EXISTS "Allow all operations on roles for authenticated users" ON public.roles;

ALTER TABLE public.roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Full access roles for authenticated" 
ON public.roles 
FOR ALL 
TO authenticated
USING (true) 
WITH CHECK (true);

-- Table roles_utilisateurs (si elle existe encore)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'roles_utilisateurs' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Allow authenticated users to read roles_utilisateurs" ON public.roles_utilisateurs;
        ALTER TABLE public.roles_utilisateurs DISABLE ROW LEVEL SECURITY;
        ALTER TABLE public.roles_utilisateurs ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Full access roles_utilisateurs for authenticated" 
        ON public.roles_utilisateurs 
        FOR ALL 
        TO authenticated
        USING (true) 
        WITH CHECK (true);
    END IF;
END $$;

-- Forcer le rechargement complet du cache PostgREST
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- Vérifier qu'il n'y a plus de politiques récursives
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('utilisateurs_internes', 'user_roles', 'roles', 'roles_utilisateurs')
ORDER BY tablename, policyname;
