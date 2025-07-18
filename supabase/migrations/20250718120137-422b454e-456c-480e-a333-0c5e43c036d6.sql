
-- Ajouter une clé étrangère pour relier user_roles à utilisateurs_internes
-- D'abord, s'assurer que la colonne user_id existe dans user_roles
DO $$
BEGIN
    -- Vérifier si la contrainte existe déjà
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_roles_user_id_fkey' 
        AND table_name = 'user_roles'
    ) THEN
        -- Ajouter la contrainte de clé étrangère si elle n'existe pas
        ALTER TABLE public.user_roles 
        ADD CONSTRAINT user_roles_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- S'assurer que la table utilisateurs_internes a aussi une bonne relation avec auth.users
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'utilisateurs_internes_user_id_fkey' 
        AND table_name = 'utilisateurs_internes'
    ) THEN
        ALTER TABLE public.utilisateurs_internes 
        ADD CONSTRAINT utilisateurs_internes_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- S'assurer que role_permissions a les bonnes contraintes
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'role_permissions_role_id_fkey' 
        AND table_name = 'role_permissions'
    ) THEN
        ALTER TABLE public.role_permissions 
        ADD CONSTRAINT role_permissions_role_id_fkey 
        FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'role_permissions_permission_id_fkey' 
        AND table_name = 'role_permissions'
    ) THEN
        ALTER TABLE public.role_permissions 
        ADD CONSTRAINT role_permissions_permission_id_fkey 
        FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Créer un index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_utilisateurs_internes_user_id ON public.utilisateurs_internes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles(role_id);

-- Forcer le rechargement du cache PostgREST
NOTIFY pgrst, 'reload schema';
