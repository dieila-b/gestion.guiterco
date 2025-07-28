-- Finaliser la correction du système de permissions

-- 1. Créer la vue des permissions utilisateurs si elle n'existe pas ou la recréer
DROP VIEW IF EXISTS public.vue_permissions_utilisateurs;

CREATE VIEW public.vue_permissions_utilisateurs AS
SELECT 
    ui.user_id,
    ui.id as utilisateur_interne_id,
    ui.prenom,
    ui.nom,
    ui.email,
    r.id as role_id,
    r.name as role_name,
    p.id as permission_id,
    p.menu,
    p.submenu,
    p.action,
    p.description as permission_description,
    rp.can_access
FROM public.utilisateurs_internes ui
JOIN public.roles r ON ui.role_id = r.id
JOIN public.role_permissions rp ON r.id = rp.role_id
JOIN public.permissions p ON rp.permission_id = p.id
WHERE ui.statut = 'actif' 
AND ui.type_compte IN ('admin', 'gestionnaire', 'employe', 'interne');

-- 2. Supprimer les politiques ultra-permissives problématiques et les remplacer par des politiques basées sur les permissions

-- SUPPRESSION DES POLITIQUES ULTRA-PERMISSIVES
DROP POLICY IF EXISTS "ULTRA_PERMISSIVE_roles" ON public.roles;
DROP POLICY IF EXISTS "bypass_rls_for_authenticated_users" ON public.roles;
DROP POLICY IF EXISTS "bypass_rls_for_authenticated_users" ON public.permissions;
DROP POLICY IF EXISTS "bypass_rls_for_authenticated_users" ON public.role_permissions;
DROP POLICY IF EXISTS "allow_all_for_edge_function_roles" ON public.roles;

-- NOUVELLES POLITIQUES BASÉES SUR LES PERMISSIONS

-- Politiques pour la table roles
CREATE POLICY "Permission-based roles read"
ON public.roles FOR SELECT
USING (user_has_permission('Paramètres', 'Rôles et permissions', 'read'));

CREATE POLICY "Permission-based roles write"
ON public.roles FOR ALL
USING (user_has_permission('Paramètres', 'Rôles et permissions', 'write'))
WITH CHECK (user_has_permission('Paramètres', 'Rôles et permissions', 'write'));

-- Politiques pour la table permissions
CREATE POLICY "Permission-based permissions read"
ON public.permissions FOR SELECT
USING (user_has_permission('Paramètres', 'Rôles et permissions', 'read'));

CREATE POLICY "Permission-based permissions write"
ON public.permissions FOR ALL
USING (user_has_permission('Paramètres', 'Rôles et permissions', 'write'))
WITH CHECK (user_has_permission('Paramètres', 'Rôles et permissions', 'write'));

-- Politiques pour la table role_permissions
CREATE POLICY "Permission-based role_permissions read"
ON public.role_permissions FOR SELECT
USING (user_has_permission('Paramètres', 'Rôles et permissions', 'read'));

CREATE POLICY "Permission-based role_permissions write"
ON public.role_permissions FOR ALL
USING (user_has_permission('Paramètres', 'Rôles et permissions', 'write'))
WITH CHECK (user_has_permission('Paramètres', 'Rôles et permissions', 'write'));

-- 3. Assigner automatiquement toutes les permissions au rôle Administrateur
DO $$
DECLARE
    admin_role_id UUID;
    perm RECORD;
BEGIN
    -- Récupérer l'ID du rôle Administrateur
    SELECT id INTO admin_role_id FROM public.roles WHERE name = 'Administrateur';
    
    IF admin_role_id IS NOT NULL THEN
        -- Attribuer toutes les permissions au rôle Administrateur
        FOR perm IN SELECT id FROM public.permissions LOOP
            INSERT INTO public.role_permissions (role_id, permission_id, can_access)
            VALUES (admin_role_id, perm.id, true)
            ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;
        END LOOP;
    END IF;
END;
$$;

-- 4. Vérifier que tous les utilisateurs actifs ont bien un rôle
UPDATE public.utilisateurs_internes 
SET role_id = (SELECT id FROM public.roles WHERE name = 'Vendeur' LIMIT 1)
WHERE role_id IS NULL 
AND statut = 'actif' 
AND type_compte IN ('employe', 'gestionnaire')
AND EXISTS(SELECT 1 FROM public.roles WHERE name = 'Vendeur');

-- 5. Grant des permissions nécessaires
GRANT SELECT ON public.vue_permissions_utilisateurs TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_permission(text, text, text) TO authenticated;