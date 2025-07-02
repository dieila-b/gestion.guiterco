
-- Créer une table pour les modules de l'application
CREATE TABLE IF NOT EXISTS public.modules_application (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nom text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Créer une table pour les types de permissions
CREATE TABLE IF NOT EXISTS public.types_permissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nom text NOT NULL UNIQUE, -- 'lecture', 'ecriture', 'suppression', 'administration'
  description text,
  created_at timestamp with time zone DEFAULT now()
);

-- Créer une table pour les permissions spécifiques (module + type)
CREATE TABLE IF NOT EXISTS public.permissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id uuid REFERENCES public.modules_application(id) ON DELETE CASCADE,
  type_permission_id uuid REFERENCES public.types_permissions(id) ON DELETE CASCADE,
  nom text NOT NULL, -- Nom complet ex: "ventes_lecture", "stocks_ecriture"
  description text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(module_id, type_permission_id)
);

-- Créer une table pour associer les rôles aux permissions
CREATE TABLE IF NOT EXISTS public.roles_permissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  role_id uuid REFERENCES public.roles_utilisateurs(id) ON DELETE CASCADE,
  permission_id uuid REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(role_id, permission_id)
);

-- Insérer les modules de base de l'application
INSERT INTO public.modules_application (nom, description) VALUES 
  ('dashboard', 'Tableau de bord et statistiques'),
  ('ventes', 'Gestion des ventes et factures'),
  ('stocks', 'Gestion des stocks et catalogue'),
  ('achats', 'Gestion des achats et fournisseurs'),
  ('clients', 'Gestion des clients'),
  ('caisse', 'Gestion de la caisse'),
  ('marges', 'Analyse des marges'),
  ('rapports', 'Génération de rapports'),
  ('parametres', 'Paramètres système')
ON CONFLICT (nom) DO NOTHING;

-- Insérer les types de permissions
INSERT INTO public.types_permissions (nom, description) VALUES 
  ('lecture', 'Consulter et voir les données'),
  ('ecriture', 'Créer et modifier les données'),
  ('suppression', 'Supprimer les données'),
  ('administration', 'Administrer le module')
ON CONFLICT (nom) DO NOTHING;

-- Créer les permissions complètes (module + type)
INSERT INTO public.permissions (module_id, type_permission_id, nom, description)
SELECT 
  m.id, 
  t.id, 
  m.nom || '_' || t.nom,
  'Permission ' || t.description || ' pour le module ' || m.description
FROM public.modules_application m
CROSS JOIN public.types_permissions t
ON CONFLICT (module_id, type_permission_id) DO NOTHING;

-- Ajouter des permissions complètes aux rôles existants
-- Administrateur : toutes les permissions
INSERT INTO public.roles_permissions (role_id, permission_id)
SELECT 
  r.id,
  p.id
FROM public.roles_utilisateurs r
CROSS JOIN public.permissions p
WHERE r.nom = 'administrateur'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Manager : permissions lecture/écriture sur la plupart des modules
INSERT INTO public.roles_permissions (role_id, permission_id)
SELECT 
  r.id,
  p.id
FROM public.roles_utilisateurs r
CROSS JOIN public.permissions p
JOIN public.modules_application m ON p.module_id = m.id
JOIN public.types_permissions t ON p.type_permission_id = t.id
WHERE r.nom = 'manager'
AND (
  t.nom IN ('lecture', 'ecriture') 
  OR (m.nom = 'rapports' AND t.nom = 'administration')
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Employé : permissions lecture sur la plupart des modules, écriture sur ventes/stocks/clients
INSERT INTO public.roles_permissions (role_id, permission_id)
SELECT 
  r.id,
  p.id
FROM public.roles_utilisateurs r
CROSS JOIN public.permissions p
JOIN public.modules_application m ON p.module_id = m.id
JOIN public.types_permissions t ON p.type_permission_id = t.id
WHERE r.nom = 'employe'
AND (
  t.nom = 'lecture' 
  OR (m.nom IN ('ventes', 'stocks', 'clients', 'caisse') AND t.nom = 'ecriture')
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Fonction pour vérifier si un utilisateur a une permission spécifique
CREATE OR REPLACE FUNCTION public.user_has_permission(user_id uuid, permission_name text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.utilisateurs_internes ui
    JOIN public.roles_permissions rp ON ui.role_id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ui.user_id = user_id 
    AND ui.statut = 'actif'
    AND ui.type_compte = 'interne'
    AND p.nom = permission_name
  );
$$;

-- Fonction pour obtenir toutes les permissions d'un utilisateur
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_id uuid)
RETURNS TABLE(
  module_nom text,
  type_permission text,
  permission_nom text,
  permission_description text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    m.nom as module_nom,
    t.nom as type_permission,
    p.nom as permission_nom,
    p.description as permission_description
  FROM public.utilisateurs_internes ui
  JOIN public.roles_permissions rp ON ui.role_id = rp.role_id
  JOIN public.permissions p ON rp.permission_id = p.id
  JOIN public.modules_application m ON p.module_id = m.id
  JOIN public.types_permissions t ON p.type_permission_id = t.id
  WHERE ui.user_id = user_id 
  AND ui.statut = 'actif'
  AND ui.type_compte = 'interne'
  ORDER BY m.nom, t.nom;
$$;

-- Politiques RLS pour les nouvelles tables
ALTER TABLE public.modules_application ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.types_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles_permissions ENABLE ROW LEVEL SECURITY;

-- Permettre la lecture des modules et types de permissions à tous les utilisateurs internes
CREATE POLICY "Internal users can view modules" ON public.modules_application
  FOR SELECT USING (public.get_user_role_for_rls() IN ('administrateur', 'employe', 'manager'));

CREATE POLICY "Internal users can view permission types" ON public.types_permissions
  FOR SELECT USING (public.get_user_role_for_rls() IN ('administrateur', 'employe', 'manager'));

CREATE POLICY "Internal users can view permissions" ON public.permissions
  FOR SELECT USING (public.get_user_role_for_rls() IN ('administrateur', 'employe', 'manager'));

-- Seuls les administrateurs peuvent modifier les permissions des rôles
CREATE POLICY "Admins can view role permissions" ON public.roles_permissions
  FOR SELECT USING (public.get_user_role_for_rls() IN ('administrateur', 'employe', 'manager'));

CREATE POLICY "Admins can modify role permissions" ON public.roles_permissions
  FOR ALL USING (public.get_user_role_for_rls() = 'administrateur');

-- Triggers pour updated_at
CREATE TRIGGER update_modules_application_updated_at 
  BEFORE UPDATE ON public.modules_application 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
