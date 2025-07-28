-- Corriger les politiques RLS pour les tables de permissions et utilisateurs

-- Supprimer les politiques restrictives sur permissions
DROP POLICY IF EXISTS "Permission-based permissions read" ON public.permissions;
DROP POLICY IF EXISTS "Permission-based permissions write" ON public.permissions;

-- Supprimer les politiques restrictives sur role_permissions s'il existe
DROP POLICY IF EXISTS "Permission-based role_permissions read" ON public.role_permissions;
DROP POLICY IF EXISTS "Permission-based role_permissions write" ON public.role_permissions;

-- Supprimer les politiques restrictives sur roles
DROP POLICY IF EXISTS "Permission-based roles read" ON public.roles;
DROP POLICY IF EXISTS "Permission-based roles write" ON public.roles;

-- Créer des politiques ouvertes pour permissions
CREATE POLICY "Authenticated users can read permissions" ON public.permissions
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can write permissions" ON public.permissions
FOR ALL USING (true) WITH CHECK (true);

-- Créer des politiques ouvertes pour role_permissions
CREATE POLICY "Authenticated users can read role_permissions" ON public.role_permissions
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can write role_permissions" ON public.role_permissions
FOR ALL USING (true) WITH CHECK (true);

-- Créer des politiques ouvertes pour roles
CREATE POLICY "Authenticated users can read roles" ON public.roles
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can write roles" ON public.roles
FOR ALL USING (true) WITH CHECK (true);

-- Créer des politiques ouvertes pour utilisateurs_internes
DROP POLICY IF EXISTS "Permission-based utilisateurs_internes read" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Permission-based utilisateurs_internes write" ON public.utilisateurs_internes;

CREATE POLICY "Authenticated users can read utilisateurs_internes" ON public.utilisateurs_internes
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can write utilisateurs_internes" ON public.utilisateurs_internes
FOR ALL USING (true) WITH CHECK (true);

-- Créer des politiques pour user_roles si elle existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Authenticated users can read user_roles" ON public.user_roles;
        DROP POLICY IF EXISTS "Authenticated users can write user_roles" ON public.user_roles;
        
        CREATE POLICY "Authenticated users can read user_roles" ON public.user_roles
        FOR SELECT USING (true);

        CREATE POLICY "Authenticated users can write user_roles" ON public.user_roles
        FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;