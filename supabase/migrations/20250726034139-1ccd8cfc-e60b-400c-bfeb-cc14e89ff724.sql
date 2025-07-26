-- Créer la table utilisateurs_internes
CREATE TABLE public.utilisateurs_internes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  prenom TEXT NOT NULL,
  nom TEXT NOT NULL,
  matricule TEXT UNIQUE,
  role_id UUID REFERENCES public.roles(id),
  statut TEXT NOT NULL DEFAULT 'actif' CHECK (statut IN ('actif', 'inactif', 'suspendu')),
  type_compte TEXT NOT NULL DEFAULT 'employe' CHECK (type_compte IN ('employe', 'gestionnaire', 'admin')),
  photo_url TEXT,
  telephone TEXT,
  date_embauche DATE,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.utilisateurs_internes ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS
CREATE POLICY "Authenticated users can access utilisateurs_internes"
ON public.utilisateurs_internes
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Créer la table de liaison utilisateur-rôle pour permissions multiples
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.utilisateurs_internes(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by TEXT,
  UNIQUE(user_id, role_id)
);

-- Activer RLS sur user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can access user_roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Créer une vue pour faciliter les requêtes
CREATE VIEW public.vue_utilisateurs_avec_roles AS
SELECT 
  ui.*,
  r.name as role_name,
  r.description as role_description
FROM public.utilisateurs_internes ui
LEFT JOIN public.roles r ON ui.role_id = r.id;

-- Créer une vue pour les permissions des utilisateurs
CREATE VIEW public.vue_permissions_utilisateurs AS
SELECT DISTINCT
  ui.id as user_id,
  ui.email,
  ui.prenom,
  ui.nom,
  p.menu,
  p.submenu,
  p.action,
  p.description,
  rp.can_access
FROM public.utilisateurs_internes ui
JOIN public.user_roles ur ON ui.id = ur.user_id
JOIN public.role_permissions rp ON ur.role_id = rp.role_id
JOIN public.permissions p ON rp.permission_id = p.id
WHERE ui.statut = 'actif';

-- Fonction pour vérifier les permissions utilisateur
CREATE OR REPLACE FUNCTION public.user_has_permission(
  p_menu TEXT,
  p_submenu TEXT DEFAULT NULL,
  p_action TEXT DEFAULT 'read'
) RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.vue_permissions_utilisateurs
    WHERE user_id = auth.uid()
    AND menu = p_menu
    AND (p_submenu IS NULL OR submenu = p_submenu)
    AND action = p_action
    AND can_access = true
  );
$$;

-- Trigger pour updated_at
CREATE TRIGGER update_utilisateurs_internes_updated_at
BEFORE UPDATE ON public.utilisateurs_internes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();