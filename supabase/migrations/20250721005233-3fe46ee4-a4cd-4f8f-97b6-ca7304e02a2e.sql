
-- DIAGNOSTIC ET RESTAURATION COMPLÈTE DU SCHÉMA
-- ==============================================

-- 1. DIAGNOSTIC DES TABLES EXISTANTES
SELECT 'DIAGNOSTIC SCHÉMA' as titre;

-- Vérifier les tables principales
SELECT 
    schemaname, 
    tablename, 
    tableowner,
    hasrls as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'utilisateurs_internes', 'roles', 'user_roles', 'permissions', 'role_permissions',
    'catalogue', 'stock_pdv', 'stock_principal', 'clients', 'factures_vente',
    'precommandes', 'transactions', 'cash_registers'
)
ORDER BY tablename;

-- 2. RESTAURATION DU SYSTÈME DE PERMISSIONS COMPLET
-- Créer la table roles si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Créer la table permissions si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu VARCHAR(100) NOT NULL,
    submenu VARCHAR(100),
    action VARCHAR(50) NOT NULL DEFAULT 'read',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(menu, submenu, action)
);

-- Créer la table role_permissions si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    can_access BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(role_id, permission_id)
);

-- Créer la table user_roles si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    assigned_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, role_id)
);

-- 3. INSERTION DES DONNÉES DE BASE
-- Rôles système
INSERT INTO public.roles (name, description, is_system) VALUES
    ('Administrateur', 'Accès complet à toutes les fonctionnalités', true),
    ('Manager', 'Gestion des équipes et rapports', false),
    ('Vendeur', 'Ventes et gestion clients', false),
    ('Caissier', 'Gestion des transactions', false),
    ('Gestionnaire Stock', 'Gestion des stocks et inventaires', false)
ON CONFLICT (name) DO UPDATE SET 
    description = EXCLUDED.description,
    is_system = EXCLUDED.is_system;

-- Permissions système complètes
INSERT INTO public.permissions (menu, submenu, action, description) VALUES
    -- Dashboard
    ('Dashboard', NULL, 'read', 'Consultation du tableau de bord'),
    
    -- Catalogue
    ('Catalogue', NULL, 'read', 'Consultation du catalogue'),
    ('Catalogue', NULL, 'write', 'Modification du catalogue'),
    ('Catalogue', NULL, 'delete', 'Suppression d''articles'),
    
    -- Stock
    ('Stock', 'Entrepôts', 'read', 'Consultation stocks entrepôts'),
    ('Stock', 'Entrepôts', 'write', 'Modification stocks entrepôts'),
    ('Stock', 'PDV', 'read', 'Consultation stocks PDV'),
    ('Stock', 'PDV', 'write', 'Modification stocks PDV'),
    ('Stock', 'Transferts', 'read', 'Consultation transferts'),
    ('Stock', 'Transferts', 'write', 'Gestion transferts'),
    
    -- Ventes
    ('Ventes', 'Factures', 'read', 'Consultation factures vente'),
    ('Ventes', 'Factures', 'write', 'Gestion factures vente'),
    ('Ventes', 'Précommandes', 'read', 'Consultation précommandes'),
    ('Ventes', 'Précommandes', 'write', 'Gestion précommandes'),
    ('Ventes', 'Devis', 'read', 'Consultation devis'),
    ('Ventes', 'Devis', 'write', 'Gestion devis'),
    
    -- Clients
    ('Clients', NULL, 'read', 'Consultation clients'),
    ('Clients', NULL, 'write', 'Gestion clients'),
    
    -- Caisse
    ('Caisse', 'Transactions', 'read', 'Consultation transactions'),
    ('Caisse', 'Transactions', 'write', 'Saisie transactions'),
    ('Caisse', 'Rapports', 'read', 'Rapports de caisse'),
    ('Caisse', 'Clotures', 'read', 'Consultation clôtures'),
    ('Caisse', 'Clotures', 'write', 'Gestion clôtures'),
    
    -- Paramètres
    ('Paramètres', 'Utilisateurs', 'read', 'Consultation utilisateurs'),
    ('Paramètres', 'Utilisateurs', 'write', 'Gestion utilisateurs'),
    ('Paramètres', 'Permissions', 'read', 'Consultation permissions'),
    ('Paramètres', 'Permissions', 'write', 'Gestion permissions'),
    ('Paramètres', 'Zones', 'read', 'Consultation zones'),
    ('Paramètres', 'Zones', 'write', 'Gestion zones'),
    
    -- Rapports
    ('Rapports', 'Ventes', 'read', 'Rapports de ventes'),
    ('Rapports', 'Stocks', 'read', 'Rapports de stocks'),
    ('Rapports', 'Financiers', 'read', 'Rapports financiers')
ON CONFLICT (menu, submenu, action) DO UPDATE SET 
    description = EXCLUDED.description;

-- Attribution complète des permissions à l'Administrateur
INSERT INTO public.role_permissions (role_id, permission_id, can_access)
SELECT r.id, p.id, true
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'Administrateur'
ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;

-- 4. FONCTION DE VÉRIFICATION DES PERMISSIONS
CREATE OR REPLACE FUNCTION public.user_has_permission(
    p_menu TEXT,
    p_submenu TEXT DEFAULT NULL,
    p_action TEXT DEFAULT 'read'
)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.utilisateurs_internes ui
        JOIN public.user_roles ur ON ui.user_id = ur.user_id AND ur.is_active = true
        JOIN public.role_permissions rp ON ur.role_id = rp.role_id AND rp.can_access = true
        JOIN public.permissions p ON rp.permission_id = p.id
        WHERE ui.user_id = auth.uid()
        AND ui.statut = 'actif'
        AND p.menu = p_menu
        AND (p_submenu IS NULL OR p.submenu = p_submenu)
        AND p.action = p_action
    );
$$;

-- 5. POLITIQUES RLS POUR TOUTES LES TABLES CRITIQUES
-- Roles
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_full_access_roles" ON public.roles;
CREATE POLICY "admin_full_access_roles" ON public.roles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Permissions
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_full_access_permissions" ON public.permissions;
CREATE POLICY "admin_full_access_permissions" ON public.permissions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Role_permissions
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_full_access_role_permissions" ON public.role_permissions;
CREATE POLICY "admin_full_access_role_permissions" ON public.role_permissions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- User_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_full_access_user_roles" ON public.user_roles;
CREATE POLICY "admin_full_access_user_roles" ON public.user_roles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Utilisateurs_internes
DROP POLICY IF EXISTS "admin_full_access_utilisateurs_internes" ON public.utilisateurs_internes;
CREATE POLICY "admin_full_access_utilisateurs_internes" ON public.utilisateurs_internes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. ACTIVATION DU TEMPS RÉEL
ALTER TABLE public.roles REPLICA IDENTITY FULL;
ALTER TABLE public.permissions REPLICA IDENTITY FULL;
ALTER TABLE public.role_permissions REPLICA IDENTITY FULL;
ALTER TABLE public.user_roles REPLICA IDENTITY FULL;
ALTER TABLE public.utilisateurs_internes REPLICA IDENTITY FULL;

-- Ajout à la publication realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.roles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.permissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.role_permissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.utilisateurs_internes;

-- 7. FONCTION DE DIAGNOSTIC
CREATE OR REPLACE FUNCTION public.diagnostic_complet()
RETURNS TABLE(
    composant TEXT,
    status TEXT,
    nombre INTEGER,
    details TEXT
)
LANGUAGE SQL
AS $$
    SELECT 'Rôles système' as composant, 'OK' as status, COUNT(*)::INTEGER as nombre, 'Rôles configurés' as details
    FROM public.roles
    
    UNION ALL
    
    SELECT 'Permissions système' as composant, 'OK' as status, COUNT(*)::INTEGER as nombre, 'Permissions configurées' as details
    FROM public.permissions
    
    UNION ALL
    
    SELECT 'Attributions permissions' as composant, 'OK' as status, COUNT(*)::INTEGER as nombre, 'Permissions attribuées' as details
    FROM public.role_permissions WHERE can_access = true
    
    UNION ALL
    
    SELECT 'Utilisateurs internes' as composant, 'OK' as status, COUNT(*)::INTEGER as nombre, 'Utilisateurs actifs' as details
    FROM public.utilisateurs_internes WHERE statut = 'actif'
    
    UNION ALL
    
    SELECT 'Assignations rôles' as composant, 'OK' as status, COUNT(*)::INTEGER as nombre, 'Rôles assignés' as details
    FROM public.user_roles WHERE is_active = true;
$$;

-- 8. INVALIDATION DU CACHE
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- 9. RÉSULTAT FINAL
SELECT 'RESTAURATION TERMINÉE' as message, now() as timestamp;
SELECT * FROM public.diagnostic_complet();
