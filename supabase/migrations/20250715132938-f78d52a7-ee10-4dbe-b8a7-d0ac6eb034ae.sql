-- Création de l'architecture complète de gestion des permissions et rôles

-- Table des rôles
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des permissions
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  menu VARCHAR(100) NOT NULL,
  submenu VARCHAR(100),
  action VARCHAR(50) NOT NULL DEFAULT 'read',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table de liaison rôles-permissions avec granularité fine
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  can_access BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(role_id, permission_id)
);

-- Table de liaison utilisateurs-rôles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID,
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(user_id, role_id)
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON public.role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles(role_id);

-- Insertion des rôles par défaut
INSERT INTO public.roles (name, description, is_system) VALUES
  ('Administrateur', 'Accès complet à toutes les fonctionnalités', true),
  ('Manager', 'Gestion des équipes et accès aux rapports', false),
  ('Vendeur', 'Accès aux ventes et gestion clients', false),
  ('Caissier', 'Accès aux transactions et encaissements', false)
ON CONFLICT (name) DO NOTHING;

-- Insertion des permissions de base
INSERT INTO public.permissions (menu, submenu, action, description) VALUES
  ('Dashboard', NULL, 'read', 'Consultation du tableau de bord'),
  ('Catalogue', NULL, 'read', 'Consultation du catalogue'),
  ('Catalogue', NULL, 'write', 'Modification du catalogue'),
  ('Catalogue', NULL, 'delete', 'Suppression d''articles'),
  ('Stock', 'Entrepôts', 'read', 'Consultation des stocks entrepôts'),
  ('Stock', 'Entrepôts', 'write', 'Modification des stocks entrepôts'),
  ('Stock', 'PDV', 'read', 'Consultation des stocks PDV'),
  ('Stock', 'PDV', 'write', 'Modification des stocks PDV'),
  ('Achats', 'Bons de commande', 'read', 'Consultation des bons de commande'),
  ('Achats', 'Bons de commande', 'write', 'Création/modification des bons de commande'),
  ('Achats', 'Bons de livraison', 'read', 'Consultation des bons de livraison'),
  ('Achats', 'Bons de livraison', 'write', 'Réception des livraisons'),
  ('Ventes', 'Factures', 'read', 'Consultation des factures'),
  ('Ventes', 'Factures', 'write', 'Création/modification des factures'),
  ('Ventes', 'Précommandes', 'read', 'Consultation des précommandes'),
  ('Ventes', 'Précommandes', 'write', 'Gestion des précommandes'),
  ('Clients', NULL, 'read', 'Consultation des clients'),
  ('Clients', NULL, 'write', 'Gestion des clients'),
  ('Paramètres', 'Utilisateurs', 'read', 'Consultation des utilisateurs'),
  ('Paramètres', 'Utilisateurs', 'write', 'Gestion des utilisateurs'),
  ('Paramètres', 'Permissions', 'read', 'Consultation des permissions'),
  ('Paramètres', 'Permissions', 'write', 'Gestion des permissions')
ON CONFLICT DO NOTHING;

-- Attribution de toutes les permissions au rôle Administrateur
INSERT INTO public.role_permissions (role_id, permission_id, can_access)
SELECT r.id, p.id, true
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'Administrateur'
ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;

-- Politiques RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Politiques pour les rôles
CREATE POLICY "Tous peuvent voir les rôles" ON public.roles FOR SELECT USING (true);
CREATE POLICY "Seuls les admins peuvent modifier les rôles" ON public.roles 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() 
      AND r.name = 'Administrateur'
      AND ur.is_active = true
    )
  );

-- Politiques pour les permissions
CREATE POLICY "Tous peuvent voir les permissions" ON public.permissions FOR SELECT USING (true);
CREATE POLICY "Seuls les admins peuvent modifier les permissions" ON public.permissions 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() 
      AND r.name = 'Administrateur'
      AND ur.is_active = true
    )
  );

-- Politiques pour les role_permissions
CREATE POLICY "Tous peuvent voir les permissions des rôles" ON public.role_permissions FOR SELECT USING (true);
CREATE POLICY "Seuls les admins peuvent modifier les permissions des rôles" ON public.role_permissions 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() 
      AND r.name = 'Administrateur'
      AND ur.is_active = true
    )
  );

-- Politiques pour les user_roles
CREATE POLICY "Tous peuvent voir les rôles utilisateurs" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "Seuls les admins peuvent modifier les rôles utilisateurs" ON public.user_roles 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() 
      AND r.name = 'Administrateur'
      AND ur.is_active = true
    )
  );

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON public.roles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction utilitaire pour vérifier les permissions utilisateur
CREATE OR REPLACE FUNCTION public.user_has_permission(
  user_uuid UUID,
  menu_name TEXT,
  submenu_name TEXT DEFAULT NULL,
  action_name TEXT DEFAULT 'read'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.user_roles ur
        JOIN public.role_permissions rp ON ur.role_id = rp.role_id
        JOIN public.permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = user_uuid
        AND ur.is_active = true
        AND rp.can_access = true
        AND p.menu = menu_name
        AND (submenu_name IS NULL OR p.submenu = submenu_name)
        AND p.action = action_name
    );
END;
$$;