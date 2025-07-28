-- Corriger les politiques RLS pour la vue vue_utilisateurs_avec_roles

-- Supprimer toutes les politiques existantes sur la vue
DROP POLICY IF EXISTS "Permission-based vue_utilisateurs_avec_roles read" ON public.vue_utilisateurs_avec_roles;
DROP POLICY IF EXISTS "Permission-based vue_utilisateurs_avec_roles write" ON public.vue_utilisateurs_avec_roles;
DROP POLICY IF EXISTS "Authenticated users can read vue_utilisateurs_avec_roles" ON public.vue_utilisateurs_avec_roles;

-- Activer RLS sur la vue (si pas déjà activé)
ALTER TABLE public.vue_utilisateurs_avec_roles ENABLE ROW LEVEL SECURITY;

-- Créer une politique permissive pour permettre la lecture à tous les utilisateurs authentifiés
CREATE POLICY "Allow all authenticated users to read vue_utilisateurs_avec_roles" 
ON public.vue_utilisateurs_avec_roles
FOR SELECT 
USING (true);

-- Vérifier aussi les politiques sur la table user_roles si elle existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles' AND table_schema = 'public') THEN
        -- Activer RLS sur user_roles
        ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
        
        -- Supprimer les anciennes politiques
        DROP POLICY IF EXISTS "Allow all authenticated users to read user_roles" ON public.user_roles;
        DROP POLICY IF EXISTS "Allow all authenticated users to write user_roles" ON public.user_roles;
        
        -- Créer des politiques permissives
        CREATE POLICY "Allow all authenticated users to read user_roles" ON public.user_roles
        FOR SELECT USING (true);

        CREATE POLICY "Allow all authenticated users to write user_roles" ON public.user_roles
        FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;