
-- Première étape : S'assurer que la table 'roles' existe et a les bonnes politiques
DO $$
BEGIN
    -- Vérifier si la table roles existe, sinon la créer
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'roles' AND table_schema = 'public') THEN
        CREATE TABLE public.roles (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            name text NOT NULL UNIQUE,
            description text,
            is_system boolean DEFAULT false,
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
        );
    END IF;
    
    -- Ajouter la colonne is_system si elle n'existe pas
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'roles' AND column_name = 'is_system') THEN
        ALTER TABLE public.roles ADD COLUMN is_system boolean DEFAULT false;
    END IF;
END $$;

-- Supprimer TOUTES les politiques existantes sur roles
DROP POLICY IF EXISTS "Authenticated users can view roles" ON public.roles;
DROP POLICY IF EXISTS "Authenticated users can create roles" ON public.roles;
DROP POLICY IF EXISTS "Authenticated users can update non-system roles" ON public.roles;
DROP POLICY IF EXISTS "Authenticated users can delete non-system roles" ON public.roles;
DROP POLICY IF EXISTS "Allow all operations for all users on roles" ON public.roles;

-- Désactiver RLS sur roles
ALTER TABLE public.roles DISABLE ROW LEVEL SECURITY;

-- Réactiver RLS avec une politique ultra-permissive
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Politique permissive pour toutes les opérations
CREATE POLICY "Allow all operations on roles" 
ON public.roles 
FOR ALL 
TO public
USING (true) 
WITH CHECK (true);

-- Faire de même pour roles_utilisateurs si elle existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'roles_utilisateurs' AND table_schema = 'public') THEN
        -- Supprimer toutes les politiques existantes
        DROP POLICY IF EXISTS "Allow all operations on roles_utilisateurs" ON public.roles_utilisateurs;
        
        -- Désactiver et réactiver RLS
        ALTER TABLE public.roles_utilisateurs DISABLE ROW LEVEL SECURITY;
        ALTER TABLE public.roles_utilisateurs ENABLE ROW LEVEL SECURITY;
        
        -- Politique permissive
        CREATE POLICY "Allow all operations on roles_utilisateurs" 
        ON public.roles_utilisateurs 
        FOR ALL 
        TO public
        USING (true) 
        WITH CHECK (true);
    END IF;
END $$;

-- Insérer quelques rôles de base si la table est vide
INSERT INTO public.roles (name, description, is_system) VALUES
    ('Administrateur', 'Accès complet à toutes les fonctionnalités', true),
    ('Manager', 'Gestion des équipes et accès aux rapports', false),
    ('Vendeur', 'Accès aux ventes et gestion clients', false),
    ('Caissier', 'Accès aux transactions et encaissements', false)
ON CONFLICT (name) DO NOTHING;

-- Forcer le rechargement du cache PostgREST
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
