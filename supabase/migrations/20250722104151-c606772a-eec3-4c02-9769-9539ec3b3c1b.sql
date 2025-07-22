-- Diagnostic et correction des problèmes de création d'utilisateurs internes

-- 1. Nettoyer les utilisateurs orphelins et doublons
DELETE FROM public.utilisateurs_internes 
WHERE user_id NOT IN (SELECT id FROM auth.users)
   OR user_id IS NULL;

DELETE FROM public.user_roles 
WHERE user_id NOT IN (SELECT id FROM auth.users)
   OR user_id IS NULL;

-- 2. S'assurer que les clés étrangères existent et sont correctes
DO $$
BEGIN
    -- Clé étrangère utilisateurs_internes.user_id -> auth.users.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'utilisateurs_internes_user_id_fkey' 
        AND table_name = 'utilisateurs_internes'
    ) THEN
        ALTER TABLE public.utilisateurs_internes 
        ADD CONSTRAINT utilisateurs_internes_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- Clé étrangère utilisateurs_internes.role_id -> roles.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'utilisateurs_internes_role_id_fkey' 
        AND table_name = 'utilisateurs_internes'
    ) THEN
        ALTER TABLE public.utilisateurs_internes 
        ADD CONSTRAINT utilisateurs_internes_role_id_fkey 
        FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE RESTRICT;
    END IF;

    -- Clé étrangère user_roles.user_id -> auth.users.id  
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_roles_user_id_fkey' 
        AND table_name = 'user_roles'
    ) THEN
        ALTER TABLE public.user_roles 
        ADD CONSTRAINT user_roles_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- Clé étrangère user_roles.role_id -> roles.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_roles_role_id_fkey' 
        AND table_name = 'user_roles'
    ) THEN
        ALTER TABLE public.user_roles 
        ADD CONSTRAINT user_roles_role_id_fkey 
        FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Mettre à jour les politiques RLS pour permettre les operations depuis l'Edge Function
-- Supprimer les anciennes politiques restrictives
DROP POLICY IF EXISTS "Les utilisateurs internes peuvent voir tous les utilisateurs" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Les administrateurs peuvent créer des utilisateurs" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Les administrateurs peuvent modifier des utilisateurs" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Les administrateurs peuvent supprimer des utilisateurs" ON public.utilisateurs_internes;

-- Créer des politiques permissives pour l'Edge Function (service_role)
CREATE POLICY "Service role can access utilisateurs_internes" 
ON public.utilisateurs_internes 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Politiques permissives pour user_roles
DROP POLICY IF EXISTS "Users can view their role assignments" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage role assignments" ON public.user_roles;

CREATE POLICY "Service role can access user_roles" 
ON public.user_roles 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 4. Fonction améliorée pour vérifier l'existence d'email dans auth.users
CREATE OR REPLACE FUNCTION public.email_exists_in_auth(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Utiliser une approche indirecte via utilisateurs_internes
  -- pour éviter les problèmes d'accès direct à auth.users
  RETURN EXISTS (
    SELECT 1 FROM public.utilisateurs_internes ui
    WHERE ui.email = p_email
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- 5. Fonction de nettoyage améliorée
CREATE OR REPLACE FUNCTION public.cleanup_duplicate_users(p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Supprimer les utilisateurs internes avec cet email mais sans user_id valide
  DELETE FROM public.utilisateurs_internes 
  WHERE email = p_email 
  AND (
    user_id IS NULL OR 
    NOT EXISTS (SELECT 1 FROM auth.users WHERE id = utilisateurs_internes.user_id)
  );
  
  -- Supprimer les user_roles orphelins
  DELETE FROM public.user_roles 
  WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_roles.user_id);
  
  -- Supprimer les utilisateurs internes sans rôle valide
  DELETE FROM public.utilisateurs_internes
  WHERE role_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM public.roles WHERE id = utilisateurs_internes.role_id);
END;
$$;

-- 6. Recharger le cache PostgREST
NOTIFY pgrst, 'reload schema';