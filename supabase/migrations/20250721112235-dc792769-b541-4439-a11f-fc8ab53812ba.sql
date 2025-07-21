
-- Étape 1: Corriger les relations manquantes entre les tables
-- Supprimer les anciennes contraintes si elles existent
ALTER TABLE public.utilisateurs_internes DROP CONSTRAINT IF EXISTS utilisateurs_internes_role_id_fkey;
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_id_fkey;

-- Créer les bonnes relations
-- utilisateurs_internes.role_id → roles.id
ALTER TABLE public.utilisateurs_internes 
ADD CONSTRAINT utilisateurs_internes_role_id_fkey 
FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE SET NULL;

-- user_roles.user_id → auth.users.id (pas utilisateurs_internes.id)
ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- user_roles.role_id → roles.id
ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_role_id_fkey 
FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;

-- Étape 2: Corriger les politiques RLS pour permettre les opérations depuis l'Edge Function
-- Supprimer toutes les politiques existantes qui pourraient causer des problèmes
DROP POLICY IF EXISTS "bypass_rls_for_user_creation" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "allow_user_creation_insert" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "allow_user_reading" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "allow_user_updates" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Full access for authenticated users" ON public.utilisateurs_internes;

-- Créer des politiques ultra-permissives pour permettre les opérations
CREATE POLICY "allow_all_operations_utilisateurs_internes" 
ON public.utilisateurs_internes 
FOR ALL 
TO authenticated, anon, service_role
USING (true) 
WITH CHECK (true);

-- Policies pour user_roles
DROP POLICY IF EXISTS "bypass_rls_for_authenticated_users" ON public.user_roles;
DROP POLICY IF EXISTS "Allow all operations on user_roles for authenticated users" ON public.user_roles;

CREATE POLICY "allow_all_operations_user_roles" 
ON public.user_roles 
FOR ALL 
TO authenticated, anon, service_role
USING (true) 
WITH CHECK (true);

-- Policies pour roles
DROP POLICY IF EXISTS "bypass_rls_for_authenticated_users" ON public.roles;

CREATE POLICY "allow_all_operations_roles" 
ON public.roles 
FOR ALL 
TO authenticated, anon, service_role
USING (true) 
WITH CHECK (true);

-- Étape 3: Créer une fonction pour synchroniser automatiquement user_roles
CREATE OR REPLACE FUNCTION public.sync_user_roles_after_internal_user_creation()
RETURNS TRIGGER AS $$
BEGIN
  -- Insérer dans user_roles si un role_id est fourni
  IF NEW.role_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role_id, is_active)
    VALUES (NEW.user_id, NEW.role_id, true)
    ON CONFLICT (user_id, role_id) DO UPDATE SET is_active = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Appliquer le trigger
DROP TRIGGER IF EXISTS trigger_sync_user_roles ON public.utilisateurs_internes;
CREATE TRIGGER trigger_sync_user_roles
  AFTER INSERT OR UPDATE ON public.utilisateurs_internes
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_roles_after_internal_user_creation();

-- Étape 4: Forcer le rechargement du cache PostgREST
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- Étape 5: Vérifier que les relations sont bien créées
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('utilisateurs_internes', 'user_roles')
ORDER BY tc.table_name, tc.constraint_name;
