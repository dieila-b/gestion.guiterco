-- Nettoyage COMPLET et DÉFINITIF des politiques RLS récursives

-- 1. Supprimer TOUTES les politiques sur utilisateurs_internes
DROP POLICY IF EXISTS "Les administrateurs peuvent créer des utilisateurs" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Les administrateurs peuvent supprimer des utilisateurs" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Les utilisateurs internes peuvent voir tous les utilisateurs" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Tous peuvent voir les utilisateurs internes" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Utilisateurs internes peuvent modifier les utilisateurs" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Utilisateurs internes peuvent voir tous les utilisateurs" ON public.utilisateurs_internes;

-- 2. Supprimer TOUTES les politiques récursives sur user_roles
DROP POLICY IF EXISTS "Administrateurs peuvent gérer les rôles utilisateurs" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can create user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins peuvent voir tous les rôles utilisateurs" ON public.user_roles;
DROP POLICY IF EXISTS "Seuls les admins peuvent modifier les rôles utilisateurs" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Utilisateurs peuvent voir leurs propres rôles" ON public.user_roles;

-- 3. Supprimer TOUTES les politiques récursives sur roles et roles_utilisateurs
DROP POLICY IF EXISTS "Utilisateurs internes peuvent voir les rôles unifiés" ON public.roles;
DROP POLICY IF EXISTS "Utilisateurs internes peuvent voir les rôles" ON public.roles_utilisateurs;

-- 4. Supprimer définitivement toutes les fonctions récursives restantes
DROP FUNCTION IF EXISTS public.get_user_role_for_rls() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin_or_manager() CASCADE;
DROP FUNCTION IF EXISTS public.is_internal_user_active(uuid) CASCADE;

-- 5. Désactiver complètement RLS sur toutes les tables
ALTER TABLE public.utilisateurs_internes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles_utilisateurs DISABLE ROW LEVEL SECURITY;

-- 6. Réactiver RLS avec des politiques ultra-permissives SANS AUCUNE RÉFÉRENCE RÉCURSIVE
ALTER TABLE public.utilisateurs_internes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles_utilisateurs ENABLE ROW LEVEL SECURITY;

-- 7. Créer UNIQUEMENT des politiques permissives simples
CREATE POLICY "dev_allow_all_utilisateurs_internes" 
ON public.utilisateurs_internes 
FOR ALL 
TO public
USING (true) 
WITH CHECK (true);

CREATE POLICY "dev_allow_all_user_roles" 
ON public.user_roles 
FOR ALL 
TO public
USING (true) 
WITH CHECK (true);

CREATE POLICY "dev_allow_all_roles" 
ON public.roles 
FOR ALL 
TO public
USING (true) 
WITH CHECK (true);

CREATE POLICY "dev_allow_all_roles_utilisateurs" 
ON public.roles_utilisateurs 
FOR ALL 
TO public
USING (true) 
WITH CHECK (true);

-- 8. Forcer le rechargement de PostgREST
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- 9. Vérification finale
SELECT 
    'POLICIES_AFTER_CLEANUP' as check_type,
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('utilisateurs_internes', 'user_roles', 'roles', 'roles_utilisateurs')
ORDER BY tablename, policyname;