
-- Vérifier et compléter la structure des tables de permissions

-- S'assurer que la table roles a les colonnes nécessaires
ALTER TABLE public.roles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.roles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- S'assurer que la table permissions est correctement structurée
ALTER TABLE public.permissions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- S'assurer que la table role_permissions existe avec la bonne structure
CREATE TABLE IF NOT EXISTS public.role_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE NOT NULL,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE NOT NULL,
    can_access BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(role_id, permission_id)
);

-- S'assurer que la table user_roles existe avec la bonne structure
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    assigned_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, role_id)
);

-- Ajouter des triggers pour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour les tables
DROP TRIGGER IF EXISTS update_roles_updated_at ON public.roles;
CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON public.roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_permissions_updated_at ON public.permissions;
CREATE TRIGGER update_permissions_updated_at
    BEFORE UPDATE ON public.permissions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_role_permissions_updated_at ON public.role_permissions;
CREATE TRIGGER update_role_permissions_updated_at
    BEFORE UPDATE ON public.role_permissions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_roles_updated_at ON public.user_roles;
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Activer RLS sur toutes les tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Créer des politiques RLS simples et permissives pour les utilisateurs authentifiés
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.roles;
CREATE POLICY "Allow all for authenticated users" ON public.roles FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.permissions;
CREATE POLICY "Allow all for authenticated users" ON public.permissions FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.role_permissions;
CREATE POLICY "Allow all for authenticated users" ON public.role_permissions FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.user_roles;
CREATE POLICY "Allow all for authenticated users" ON public.user_roles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Activer les réplication pour le temps réel
ALTER TABLE public.roles REPLICA IDENTITY FULL;
ALTER TABLE public.permissions REPLICA IDENTITY FULL;
ALTER TABLE public.role_permissions REPLICA IDENTITY FULL;
ALTER TABLE public.user_roles REPLICA IDENTITY FULL;

-- Ajouter les tables à la publication realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.roles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.permissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.role_permissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;

-- Recharger le cache PostgREST
NOTIFY pgrst, 'reload schema';
