-- Créer le système complet de gestion des permissions
-- 1. Table des rôles utilisateurs
CREATE TABLE public.roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  is_system_role BOOLEAN DEFAULT FALSE, -- Pour les rôles système non modifiables
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Table des permissions/actions possibles
CREATE TABLE public.permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  menu VARCHAR(100) NOT NULL,
  submenu VARCHAR(100),
  action VARCHAR(50) NOT NULL, -- 'read', 'write', 'delete'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Table de liaison rôles-permissions
CREATE TABLE public.role_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  can_access BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(role_id, permission_id)
);

-- 4. Table de liaison utilisateurs-rôles
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, role_id)
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS pour les rôles
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

-- Créer les politiques RLS pour les permissions
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

-- Créer les politiques RLS pour role_permissions
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

-- Créer les politiques RLS pour user_roles
CREATE POLICY "Utilisateurs peuvent voir leurs propres rôles" ON public.user_roles 
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins peuvent voir tous les rôles utilisateurs" ON public.user_roles 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      JOIN public.roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() 
      AND r.name = 'Administrateur' 
      AND ur.is_active = true
    )
  );
CREATE POLICY "Seuls les admins peuvent modifier les rôles utilisateurs" ON public.user_roles 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      JOIN public.roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() 
      AND r.name = 'Administrateur' 
      AND ur.is_active = true
    )
  );

-- Insérer les rôles par défaut
INSERT INTO public.roles (name, description, is_system_role) VALUES
('Administrateur', 'Accès complet à toutes les fonctionnalités', true),
('Manager', 'Gestion et supervision des opérations', false),
('Vendeur', 'Gestion des ventes et clients', false),
('Caissier', 'Opérations de caisse et transactions', false);

-- Insérer les permissions de base pour tous les menus de l'application
INSERT INTO public.permissions (menu, submenu, action, description) VALUES
-- Tableau de bord
('dashboard', NULL, 'read', 'Consulter le tableau de bord'),

-- Ventes
('ventes', 'factures', 'read', 'Consulter les factures de vente'),
('ventes', 'factures', 'write', 'Créer/modifier les factures de vente'),
('ventes', 'factures', 'delete', 'Supprimer les factures de vente'),
('ventes', 'precommandes', 'read', 'Consulter les précommandes'),
('ventes', 'precommandes', 'write', 'Créer/modifier les précommandes'),
('ventes', 'precommandes', 'delete', 'Supprimer les précommandes'),
('ventes', 'retours', 'read', 'Consulter les retours clients'),
('ventes', 'retours', 'write', 'Créer/modifier les retours clients'),
('ventes', 'retours', 'delete', 'Supprimer les retours clients'),

-- Stock
('stock', 'catalogue', 'read', 'Consulter le catalogue'),
('stock', 'catalogue', 'write', 'Créer/modifier les articles'),
('stock', 'catalogue', 'delete', 'Supprimer les articles'),
('stock', 'entrees', 'read', 'Consulter les entrées de stock'),
('stock', 'entrees', 'write', 'Créer/modifier les entrées de stock'),
('stock', 'entrees', 'delete', 'Supprimer les entrées de stock'),
('stock', 'sorties', 'read', 'Consulter les sorties de stock'),
('stock', 'sorties', 'write', 'Créer/modifier les sorties de stock'),
('stock', 'sorties', 'delete', 'Supprimer les sorties de stock'),

-- Achats
('achats', 'commandes', 'read', 'Consulter les bons de commande'),
('achats', 'commandes', 'write', 'Créer/modifier les bons de commande'),
('achats', 'commandes', 'delete', 'Supprimer les bons de commande'),
('achats', 'livraisons', 'read', 'Consulter les bons de livraison'),
('achats', 'livraisons', 'write', 'Créer/modifier les bons de livraison'),
('achats', 'livraisons', 'delete', 'Supprimer les bons de livraison'),
('achats', 'factures', 'read', 'Consulter les factures d''achat'),
('achats', 'factures', 'write', 'Créer/modifier les factures d''achat'),
('achats', 'factures', 'delete', 'Supprimer les factures d''achat'),

-- Caisse
('caisse', 'transactions', 'read', 'Consulter les transactions'),
('caisse', 'transactions', 'write', 'Créer/modifier les transactions'),
('caisse', 'transactions', 'delete', 'Supprimer les transactions'),
('caisse', 'clotures', 'read', 'Consulter les clôtures de caisse'),
('caisse', 'clotures', 'write', 'Effectuer les clôtures de caisse'),

-- Rapports et analyses
('rapports', 'ventes', 'read', 'Consulter les rapports de ventes'),
('rapports', 'stock', 'read', 'Consulter les rapports de stock'),
('rapports', 'marges', 'read', 'Consulter les rapports de marges'),
('rapports', 'financier', 'read', 'Consulter les rapports financiers'),

-- Paramètres
('parametres', 'clients', 'read', 'Consulter les clients'),
('parametres', 'clients', 'write', 'Créer/modifier les clients'),
('parametres', 'clients', 'delete', 'Supprimer les clients'),
('parametres', 'fournisseurs', 'read', 'Consulter les fournisseurs'),
('parametres', 'fournisseurs', 'write', 'Créer/modifier les fournisseurs'),
('parametres', 'fournisseurs', 'delete', 'Supprimer les fournisseurs'),
('parametres', 'utilisateurs', 'read', 'Consulter les utilisateurs'),
('parametres', 'utilisateurs', 'write', 'Créer/modifier les utilisateurs'),
('parametres', 'utilisateurs', 'delete', 'Supprimer les utilisateurs'),
('parametres', 'permissions', 'read', 'Consulter les permissions'),
('parametres', 'permissions', 'write', 'Modifier les permissions'),
('parametres', 'permissions', 'delete', 'Supprimer les permissions');

-- Créer une fonction pour attribuer toutes les permissions au rôle Administrateur
CREATE OR REPLACE FUNCTION assign_all_permissions_to_admin()
RETURNS void AS $$
DECLARE
    admin_role_id UUID;
    perm RECORD;
BEGIN
    -- Récupérer l'ID du rôle Administrateur
    SELECT id INTO admin_role_id FROM public.roles WHERE name = 'Administrateur';
    
    -- Attribuer toutes les permissions au rôle Administrateur
    FOR perm IN SELECT id FROM public.permissions LOOP
        INSERT INTO public.role_permissions (role_id, permission_id, can_access)
        VALUES (admin_role_id, perm.id, true)
        ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Exécuter la fonction pour attribuer toutes les permissions à l'administrateur
SELECT assign_all_permissions_to_admin();

-- Fonction pour vérifier les permissions d'un utilisateur
CREATE OR REPLACE FUNCTION user_has_permission(user_uuid UUID, menu_name TEXT, submenu_name TEXT DEFAULT NULL, action_name TEXT DEFAULT 'read')
RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour mettre à jour le timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON public.roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();