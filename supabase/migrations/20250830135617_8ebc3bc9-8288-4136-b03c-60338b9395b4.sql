
-- Tables pour le système de permissions

-- Table des rôles
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table des permissions
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu VARCHAR(100) NOT NULL,
    submenu VARCHAR(100),
    action VARCHAR(50) NOT NULL DEFAULT 'read',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(menu, submenu, action)
);

-- Table de liaison rôles-permissions
CREATE TABLE IF NOT EXISTS public.role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    can_access BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(role_id, permission_id)
);

-- Modification de la table utilisateurs_internes pour inclure role_id
ALTER TABLE public.utilisateurs_internes 
ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES public.roles(id);

-- Activer RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Politique pour les rôles (lecture pour tous les utilisateurs authentifiés)
CREATE POLICY "Allow read access to roles" ON public.roles
    FOR SELECT TO authenticated USING (true);

-- Politique pour les permissions (lecture pour tous les utilisateurs authentifiés)
CREATE POLICY "Allow read access to permissions" ON public.permissions
    FOR SELECT TO authenticated USING (true);

-- Politique pour role_permissions (lecture pour tous les utilisateurs authentifiés)
CREATE POLICY "Allow read access to role_permissions" ON public.role_permissions
    FOR SELECT TO authenticated USING (true);

-- Insérer les rôles de base
INSERT INTO public.roles (nom, description, is_system) VALUES
('Administrateur', 'Accès complet à toutes les fonctionnalités', true),
('Gestionnaire', 'Accès aux fonctions de gestion courantes', true),
('Vendeur', 'Accès limité aux ventes et stock PDV', true),
('Consultant', 'Accès lecture seule aux rapports', true)
ON CONFLICT (nom) DO NOTHING;

-- Insérer les permissions de base
INSERT INTO public.permissions (menu, submenu, action, description) VALUES
('Dashboard', NULL, 'read', 'Accès au tableau de bord'),
('Catalogue', NULL, 'read', 'Consultation du catalogue'),
('Catalogue', NULL, 'write', 'Modification du catalogue'),
('Stock', 'Entrepôts', 'read', 'Consultation stock entrepôts'),
('Stock', 'Entrepôts', 'write', 'Gestion stock entrepôts'),
('Stock', 'PDV', 'read', 'Consultation stock PDV'),
('Stock', 'PDV', 'write', 'Gestion stock PDV'),
('Ventes', 'Factures', 'read', 'Consultation factures'),
('Ventes', 'Factures', 'write', 'Création/modification factures'),
('Ventes', 'Précommandes', 'read', 'Consultation précommandes'),
('Ventes', 'Précommandes', 'write', 'Gestion précommandes'),
('Achats', 'Bons de commande', 'read', 'Consultation bons de commande'),
('Achats', 'Bons de commande', 'write', 'Gestion bons de commande'),
('Clients', NULL, 'read', 'Consultation clients'),
('Clients', NULL, 'write', 'Gestion clients'),
('Caisse', NULL, 'read', 'Consultation caisse'),
('Caisse', NULL, 'write', 'Gestion caisse'),
('Rapports', NULL, 'read', 'Accès aux rapports'),
('Rapports', 'Marges', 'read', 'Consultation rapports marges'),
('Paramètres', 'Rôles et permissions', 'read', 'Consultation permissions'),
('Paramètres', 'Rôles et permissions', 'write', 'Gestion permissions')
ON CONFLICT (menu, submenu, action) DO NOTHING;

-- Attribuer toutes les permissions à l'administrateur
INSERT INTO public.role_permissions (role_id, permission_id, can_access)
SELECT r.id, p.id, true
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.nom = 'Administrateur'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Permissions pour le rôle Gestionnaire (toutes sauf gestion des permissions)
INSERT INTO public.role_permissions (role_id, permission_id, can_access)
SELECT r.id, p.id, true
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.nom = 'Gestionnaire' 
AND NOT (p.menu = 'Paramètres' AND p.submenu = 'Rôles et permissions' AND p.action = 'write')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Permissions de base pour le rôle Vendeur
INSERT INTO public.role_permissions (role_id, permission_id, can_access)
SELECT r.id, p.id, true
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.nom = 'Vendeur' 
AND (
    (p.menu = 'Stock' AND p.submenu = 'PDV') OR
    (p.menu = 'Ventes') OR
    (p.menu = 'Clients') OR
    (p.menu = 'Caisse') OR
    (p.menu = 'Catalogue' AND p.action = 'read')
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Permissions pour le rôle Consultant (lecture seule)
INSERT INTO public.role_permissions (role_id, permission_id, can_access)
SELECT r.id, p.id, true
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.nom = 'Consultant' 
AND p.action = 'read'
AND p.menu IN ('Dashboard', 'Catalogue', 'Stock', 'Ventes', 'Achats', 'Clients', 'Rapports')
ON CONFLICT (role_id, permission_id) DO NOTHING;
