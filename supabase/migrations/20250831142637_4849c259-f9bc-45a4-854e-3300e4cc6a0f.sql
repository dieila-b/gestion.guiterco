
-- Corriger les politiques RLS pour permettre l'accès en développement et production
-- 1. Assurer que les utilisateurs internes peuvent accéder aux données

-- Mettre à jour les politiques pour le catalogue
DROP POLICY IF EXISTS "ALLOW_ALL_catalogue" ON public.catalogue;
CREATE POLICY "ALLOW_ALL_catalogue" ON public.catalogue
FOR ALL USING (true) WITH CHECK (true);

-- Mettre à jour les politiques pour les clients
DROP POLICY IF EXISTS "ALLOW_ALL_clients" ON public.clients;
CREATE POLICY "ALLOW_ALL_clients" ON public.clients
FOR ALL USING (true) WITH CHECK (true);

-- Mettre à jour les politiques pour les entrepôts
DROP POLICY IF EXISTS "ALLOW_ALL_entrepots" ON public.entrepots;
CREATE POLICY "ALLOW_ALL_entrepots" ON public.entrepots
FOR ALL USING (true) WITH CHECK (true);

-- Mettre à jour les politiques pour les points de vente
DROP POLICY IF EXISTS "ALLOW_ALL_points_de_vente" ON public.points_de_vente;
CREATE POLICY "ALLOW_ALL_points_de_vente" ON public.points_de_vente
FOR ALL USING (true) WITH CHECK (true);

-- Mettre à jour les politiques pour les catégories
DROP POLICY IF EXISTS "ALLOW_ALL_categories_catalogue" ON public.categories_catalogue;
CREATE POLICY "ALLOW_ALL_categories_catalogue" ON public.categories_catalogue
FOR ALL USING (true) WITH CHECK (true);

-- Assurer que les utilisateurs internes peuvent être lus
DROP POLICY IF EXISTS "Allow internal users to read their data" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Allow internal users to update their data" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Utilisateurs internes peuvent lire leurs données" ON public.utilisateurs_internes;

CREATE POLICY "Allow all operations on utilisateurs_internes" ON public.utilisateurs_internes
FOR ALL USING (true) WITH CHECK (true);

-- Assurer que les rôles peuvent être lus
DROP POLICY IF EXISTS "Allow reading roles" ON public.roles;
CREATE POLICY "Allow reading roles" ON public.roles
FOR SELECT USING (true);

-- Assurer que les permissions peuvent être lues
DROP POLICY IF EXISTS "Authenticated users can read permissions" ON public.permissions;
CREATE POLICY "Authenticated users can read permissions" ON public.permissions
FOR SELECT USING (true);

-- Assurer que les relations rôle-permissions peuvent être lues
DROP POLICY IF EXISTS "Allow reading role permissions" ON public.role_permissions;
CREATE POLICY "Allow reading role permissions" ON public.role_permissions
FOR SELECT USING (true);

-- Créer une vue pour simplifier l'accès aux permissions utilisateurs
DROP VIEW IF EXISTS public.vue_permissions_utilisateurs;
CREATE VIEW public.vue_permissions_utilisateurs AS
SELECT 
    ui.user_id,
    ui.email,
    ui.prenom,
    ui.nom,
    r.name as role_name,
    p.menu,
    p.submenu,
    p.action,
    rp.can_access
FROM public.utilisateurs_internes ui
JOIN public.roles r ON ui.role_id = r.id
JOIN public.role_permissions rp ON r.id = rp.role_id
JOIN public.permissions p ON rp.permission_id = p.id
WHERE ui.statut = 'actif';

-- Accorder l'accès à la vue
GRANT SELECT ON public.vue_permissions_utilisateurs TO authenticated;
GRANT SELECT ON public.vue_permissions_utilisateurs TO anon;

-- Créer ou mettre à jour la fonction get_user_permissions pour qu'elle fonctionne même sans auth
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_uuid uuid)
RETURNS TABLE(menu text, submenu text, action text, can_access boolean)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    p.menu,
    p.submenu,
    p.action,
    COALESCE(rp.can_access, false) as can_access
  FROM public.permissions p
  LEFT JOIN public.role_permissions rp ON p.id = rp.permission_id
  LEFT JOIN public.roles r ON rp.role_id = r.id
  LEFT JOIN public.utilisateurs_internes ui ON r.id = ui.role_id
  WHERE (ui.user_id = user_uuid OR ui.id::text = user_uuid::text)
    AND ui.statut = 'actif'
    AND rp.can_access = true;
$$;

-- Fonction pour vérifier si un utilisateur interne existe
CREATE OR REPLACE FUNCTION public.check_internal_user_exists(email_input text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.utilisateurs_internes ui
    WHERE ui.email = email_input 
    AND ui.statut = 'actif'
  );
$$;

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_utilisateurs_internes_user_id ON public.utilisateurs_internes(user_id);
CREATE INDEX IF NOT EXISTS idx_utilisateurs_internes_email ON public.utilisateurs_internes(email);
CREATE INDEX IF NOT EXISTS idx_utilisateurs_internes_statut ON public.utilisateurs_internes(statut);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON public.role_permissions(permission_id);

-- Mettre à jour les politiques pour les stocks
DROP POLICY IF EXISTS "STRICT_stock_principal_read" ON public.stock_principal;
DROP POLICY IF EXISTS "STRICT_stock_principal_write" ON public.stock_principal;
CREATE POLICY "Allow all operations on stock_principal" ON public.stock_principal
FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "STRICT_stock_pdv_read" ON public.stock_pdv;
DROP POLICY IF EXISTS "STRICT_stock_pdv_write" ON public.stock_pdv;
CREATE POLICY "Allow all operations on stock_pdv" ON public.stock_pdv
FOR ALL USING (true) WITH CHECK (true);

-- Assurer que les tables de base sont accessibles
ALTER TABLE public.catalogue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY; 
ALTER TABLE public.entrepots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_de_vente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories_catalogue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utilisateurs_internes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Assurer l'accès public aux tables de référence critiques
GRANT SELECT ON public.catalogue TO anon, authenticated;
GRANT SELECT ON public.clients TO anon, authenticated;
GRANT SELECT ON public.entrepots TO anon, authenticated;
GRANT SELECT ON public.points_de_vente TO anon, authenticated;
GRANT SELECT ON public.categories_catalogue TO anon, authenticated;
GRANT SELECT ON public.utilisateurs_internes TO anon, authenticated;
GRANT SELECT ON public.roles TO anon, authenticated;
GRANT SELECT ON public.permissions TO anon, authenticated;
GRANT SELECT ON public.role_permissions TO anon, authenticated;
