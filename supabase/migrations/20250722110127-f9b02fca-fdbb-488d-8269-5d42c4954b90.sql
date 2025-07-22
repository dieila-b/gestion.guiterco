-- Diagnostic et correction définitive des problèmes de création d'utilisateurs internes

-- 1. Nettoyer TOUS les utilisateurs avec l'email en question
DELETE FROM public.user_roles 
WHERE user_id IN (
    SELECT ui.user_id 
    FROM public.utilisateurs_internes ui 
    WHERE ui.email = 'universalconnext@outlook.com'
);

DELETE FROM public.utilisateurs_internes 
WHERE email = 'universalconnext@outlook.com';

-- 2. Nettoyer TOUS les utilisateurs orphelins et doublons
DELETE FROM public.utilisateurs_internes 
WHERE user_id NOT IN (SELECT id FROM auth.users)
   OR user_id IS NULL;

DELETE FROM public.user_roles 
WHERE user_id NOT IN (SELECT id FROM auth.users)
   OR user_id IS NULL;

-- 3. Vérifier et corriger les clés étrangères
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

-- 4. S'assurer que les politiques RLS sont complètement permissives pour la service_role
DROP POLICY IF EXISTS "Service role can access utilisateurs_internes" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Service role can access user_roles" ON public.user_roles;

-- Politiques ultra-permissives pour utilisateurs_internes
CREATE POLICY "Allow all operations on utilisateurs_internes" 
ON public.utilisateurs_internes 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Politiques ultra-permissives pour user_roles
CREATE POLICY "Allow all operations on user_roles" 
ON public.user_roles 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 5. Fonction de nettoyage renforcée
CREATE OR REPLACE FUNCTION public.cleanup_duplicate_users(p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Supprimer TOUS les user_roles liés à cet email
  DELETE FROM public.user_roles 
  WHERE user_id IN (
    SELECT ui.user_id 
    FROM public.utilisateurs_internes ui 
    WHERE ui.email = p_email
  );

  -- Supprimer TOUS les utilisateurs internes avec cet email
  DELETE FROM public.utilisateurs_internes 
  WHERE email = p_email;
  
  -- Supprimer les user_roles orphelins
  DELETE FROM public.user_roles 
  WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_roles.user_id);
  
  -- Supprimer les utilisateurs internes orphelins
  DELETE FROM public.utilisateurs_internes
  WHERE user_id IS NULL 
  OR NOT EXISTS (SELECT 1 FROM auth.users WHERE id = utilisateurs_internes.user_id);
END;
$$;

-- 6. Recharger le cache PostgREST
NOTIFY pgrst, 'reload schema';