
-- Créer la table profiles si elle n'existe pas déjà
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,
  first_name text,
  last_name text,
  avatar_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Activer RLS sur profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id);

-- Créer la table user_roles pour lier les utilisateurs aux rôles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  role_id uuid REFERENCES public.roles ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, role_id)
);

-- Activer RLS sur user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour user_roles - seuls les admins peuvent gérer les rôles
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage user roles" ON public.user_roles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.utilisateurs_internes ui
    JOIN public.roles r ON ui.role_id = r.id
    WHERE ui.user_id = auth.uid() 
    AND r.name = 'Administrateur'
    AND ui.statut = 'actif'
  )
);

-- Mettre à jour la vue des permissions utilisateurs pour une meilleure performance
DROP VIEW IF EXISTS public.vue_permissions_utilisateurs;

CREATE VIEW public.vue_permissions_utilisateurs AS
SELECT DISTINCT
  ui.user_id,
  p.menu,
  p.submenu,
  p.action,
  COALESCE(rp.can_access, false) as can_access
FROM public.utilisateurs_internes ui
JOIN public.roles r ON ui.role_id = r.id
JOIN public.role_permissions rp ON r.id = rp.role_id
JOIN public.permissions p ON rp.permission_id = p.id
WHERE ui.statut = 'actif'
  AND rp.can_access = true;

-- Créer une fonction pour vérifier les permissions d'un utilisateur spécifique
CREATE OR REPLACE FUNCTION public.check_user_permission_by_id(
  p_user_id uuid,
  p_menu text,
  p_submenu text DEFAULT NULL,
  p_action text DEFAULT 'read'
)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.vue_permissions_utilisateurs vpu
    WHERE vpu.user_id = p_user_id
    AND vpu.menu = p_menu
    AND (p_submenu IS NULL OR vpu.submenu = p_submenu)
    AND vpu.action = p_action
    AND vpu.can_access = true
  );
$$;

-- Fonction pour obtenir tous les rôles d'un utilisateur
CREATE OR REPLACE FUNCTION public.get_user_roles(p_user_id uuid)
RETURNS TABLE(role_id uuid, role_name text, role_description text)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    r.id as role_id,
    r.name as role_name,
    r.description as role_description
  FROM public.user_roles ur
  JOIN public.roles r ON ur.role_id = r.id
  WHERE ur.user_id = p_user_id;
$$;

-- Fonction pour obtenir toutes les permissions d'un utilisateur
CREATE OR REPLACE FUNCTION public.get_user_permissions_by_id(p_user_id uuid)
RETURNS TABLE(menu text, submenu text, action text, can_access boolean)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    vpu.menu,
    vpu.submenu,
    vpu.action,
    vpu.can_access
  FROM public.vue_permissions_utilisateurs vpu
  WHERE vpu.user_id = p_user_id
    AND vpu.can_access = true
  ORDER BY vpu.menu, vpu.submenu, vpu.action;
$$;

-- Trigger pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$;

-- Créer le trigger s'il n'existe pas
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Synchroniser les utilisateurs_internes avec les rôles dans user_roles
INSERT INTO public.user_roles (user_id, role_id)
SELECT DISTINCT ui.user_id, ui.role_id
FROM public.utilisateurs_internes ui
WHERE ui.user_id IS NOT NULL 
  AND ui.role_id IS NOT NULL
  AND ui.statut = 'actif'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = ui.user_id AND ur.role_id = ui.role_id
  );

-- Accorder les permissions nécessaires
GRANT SELECT ON public.vue_permissions_utilisateurs TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_permission_by_id(uuid, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_roles(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_permissions_by_id(uuid) TO authenticated;
