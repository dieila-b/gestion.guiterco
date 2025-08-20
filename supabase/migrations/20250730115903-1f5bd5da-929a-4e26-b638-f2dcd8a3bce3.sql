-- ========================================
-- SYSTÈME DE PERMISSIONS STRICT - FINAL
-- ========================================

-- 1. Supprimer les anciennes fonctions et en créer de nouvelles avec des noms uniques
DROP FUNCTION IF EXISTS public.user_has_permission(text, text, text);
DROP FUNCTION IF EXISTS public.get_user_role();
DROP FUNCTION IF EXISTS public.is_admin();

-- 2. Créer des fonctions sécurisées avec des noms uniques
CREATE OR REPLACE FUNCTION public.check_user_permission_strict(p_menu text, p_submenu text DEFAULT NULL, p_action text DEFAULT 'read')
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM utilisateurs_internes ui
    JOIN roles r ON ui.role_id = r.id
    JOIN role_permissions rp ON r.id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ui.user_id = auth.uid()
    AND ui.statut = 'actif'
    AND p.menu = p_menu
    AND (p_submenu IS NULL OR p.submenu = p_submenu)
    AND p.action = p_action
    AND rp.can_access = true
  );
$$;

-- 3. Fonction pour obtenir le rôle de l'utilisateur connecté
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.name
  FROM utilisateurs_internes ui
  JOIN roles r ON ui.role_id = r.id
  WHERE ui.user_id = auth.uid()
  AND ui.statut = 'actif';
$$;

-- 4. Fonction pour vérifier si l'utilisateur est administrateur
CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM utilisateurs_internes ui
    JOIN roles r ON ui.role_id = r.id
    WHERE ui.user_id = auth.uid()
    AND ui.statut = 'actif'
    AND r.name = 'Administrateur'
  );
$$;

-- 5. Supprimer et recréer la vue des permissions utilisateur
DROP VIEW IF EXISTS public.vue_permissions_utilisateurs;

CREATE VIEW public.vue_permissions_utilisateurs AS
SELECT 
    ui.user_id,
    p.menu,
    p.submenu,
    p.action,
    rp.can_access
FROM utilisateurs_internes ui
JOIN roles r ON ui.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE ui.statut = 'actif'
AND rp.can_access = true;

-- 6. NETTOYER TOUTES LES POLITIQUES EXISTANTES ET APPLIQUER DES POLITIQUES STRICTES

-- CLIENTS
DROP POLICY IF EXISTS "Strict clients read access" ON public.clients;
DROP POLICY IF EXISTS "Strict clients write access" ON public.clients;
DROP POLICY IF EXISTS "Strict clients update access" ON public.clients;
DROP POLICY IF EXISTS "Strict clients delete access" ON public.clients;
DROP POLICY IF EXISTS "Permission-based clients read" ON public.clients;
DROP POLICY IF EXISTS "Permission-based clients write" ON public.clients;
DROP POLICY IF EXISTS "Permission-based clients delete" ON public.clients;

-- Politiques strictes pour clients
CREATE POLICY "STRICT_clients_read" ON public.clients
FOR SELECT USING (check_user_permission_strict('Clients', NULL, 'read'));

CREATE POLICY "STRICT_clients_insert" ON public.clients
FOR INSERT WITH CHECK (check_user_permission_strict('Clients', NULL, 'write'));

CREATE POLICY "STRICT_clients_update" ON public.clients
FOR UPDATE USING (check_user_permission_strict('Clients', NULL, 'write'));

CREATE POLICY "STRICT_clients_delete" ON public.clients
FOR DELETE USING (check_user_permission_strict('Clients', NULL, 'delete'));

-- CATALOGUE
DROP POLICY IF EXISTS "Strict catalogue read access" ON public.catalogue;
DROP POLICY IF EXISTS "Strict catalogue write access" ON public.catalogue;
DROP POLICY IF EXISTS "Strict catalogue update access" ON public.catalogue;
DROP POLICY IF EXISTS "Strict catalogue delete access" ON public.catalogue;

-- Politiques strictes pour catalogue
CREATE POLICY "STRICT_catalogue_read" ON public.catalogue
FOR SELECT USING (check_user_permission_strict('Catalogue', NULL, 'read'));

CREATE POLICY "STRICT_catalogue_insert" ON public.catalogue
FOR INSERT WITH CHECK (check_user_permission_strict('Catalogue', NULL, 'write'));

CREATE POLICY "STRICT_catalogue_update" ON public.catalogue
FOR UPDATE USING (check_user_permission_strict('Catalogue', NULL, 'write'));

CREATE POLICY "STRICT_catalogue_delete" ON public.catalogue
FOR DELETE USING (check_user_permission_strict('Catalogue', NULL, 'delete'));

-- FACTURES VENTE
DROP POLICY IF EXISTS "Strict factures_vente read access" ON public.factures_vente;
DROP POLICY IF EXISTS "Strict factures_vente write access" ON public.factures_vente;
DROP POLICY IF EXISTS "Strict factures_vente update access" ON public.factures_vente;
DROP POLICY IF EXISTS "Strict factures_vente delete access" ON public.factures_vente;
DROP POLICY IF EXISTS "Dashboard access based on role" ON public.factures_vente;
DROP POLICY IF EXISTS "Caissier read-only factures" ON public.factures_vente;
DROP POLICY IF EXISTS "Vendeur own data access" ON public.factures_vente;

-- Politiques strictes pour factures vente
CREATE POLICY "STRICT_factures_vente_read" ON public.factures_vente
FOR SELECT USING (
  check_user_permission_strict('Ventes', 'Factures', 'read') OR 
  check_user_permission_strict('Rapports', 'Ventes', 'read') OR
  check_user_permission_strict('Rapports', 'Marges', 'read') OR
  check_user_permission_strict('Dashboard', NULL, 'read')
);

CREATE POLICY "STRICT_factures_vente_insert" ON public.factures_vente
FOR INSERT WITH CHECK (check_user_permission_strict('Ventes', 'Factures', 'write'));

CREATE POLICY "STRICT_factures_vente_update" ON public.factures_vente
FOR UPDATE USING (check_user_permission_strict('Ventes', 'Factures', 'write'));

CREATE POLICY "STRICT_factures_vente_delete" ON public.factures_vente
FOR DELETE USING (check_user_permission_strict('Ventes', 'Factures', 'write'));

-- LIGNES FACTURE VENTE
DROP POLICY IF EXISTS "Strict lignes_facture_vente read access" ON public.lignes_facture_vente;
DROP POLICY IF EXISTS "Strict lignes_facture_vente write access" ON public.lignes_facture_vente;
DROP POLICY IF EXISTS "Strict lignes_facture_vente update access" ON public.lignes_facture_vente;
DROP POLICY IF EXISTS "Strict lignes_facture_vente delete access" ON public.lignes_facture_vente;

-- Politiques strictes pour lignes facture vente
CREATE POLICY "STRICT_lignes_facture_vente_read" ON public.lignes_facture_vente
FOR SELECT USING (
  check_user_permission_strict('Ventes', 'Factures', 'read') OR 
  check_user_permission_strict('Rapports', 'Ventes', 'read') OR
  check_user_permission_strict('Rapports', 'Marges', 'read') OR
  check_user_permission_strict('Dashboard', NULL, 'read')
);

CREATE POLICY "STRICT_lignes_facture_vente_insert" ON public.lignes_facture_vente
FOR INSERT WITH CHECK (check_user_permission_strict('Ventes', 'Factures', 'write'));

CREATE POLICY "STRICT_lignes_facture_vente_update" ON public.lignes_facture_vente
FOR UPDATE USING (check_user_permission_strict('Ventes', 'Factures', 'write'));

CREATE POLICY "STRICT_lignes_facture_vente_delete" ON public.lignes_facture_vente
FOR DELETE USING (check_user_permission_strict('Ventes', 'Factures', 'write'));

-- PRECOMMANDES
DROP POLICY IF EXISTS "Strict precommandes read access" ON public.precommandes;
DROP POLICY IF EXISTS "Strict precommandes write access" ON public.precommandes;
DROP POLICY IF EXISTS "Strict precommandes update access" ON public.precommandes;
DROP POLICY IF EXISTS "Strict precommandes delete access" ON public.precommandes;

-- Politiques strictes pour précommandes
CREATE POLICY "STRICT_precommandes_read" ON public.precommandes
FOR SELECT USING (check_user_permission_strict('Ventes', 'Précommandes', 'read'));

CREATE POLICY "STRICT_precommandes_insert" ON public.precommandes
FOR INSERT WITH CHECK (check_user_permission_strict('Ventes', 'Précommandes', 'write'));

CREATE POLICY "STRICT_precommandes_update" ON public.precommandes
FOR UPDATE USING (check_user_permission_strict('Ventes', 'Précommandes', 'write'));

CREATE POLICY "STRICT_precommandes_delete" ON public.precommandes
FOR DELETE USING (check_user_permission_strict('Ventes', 'Précommandes', 'write'));

-- LIGNES PRECOMMANDE
DROP POLICY IF EXISTS "Strict lignes_precommande read access" ON public.lignes_precommande;
DROP POLICY IF EXISTS "Strict lignes_precommande write access" ON public.lignes_precommande;
DROP POLICY IF EXISTS "Strict lignes_precommande update access" ON public.lignes_precommande;
DROP POLICY IF EXISTS "Strict lignes_precommande delete access" ON public.lignes_precommande;

-- Politiques strictes pour lignes précommande
CREATE POLICY "STRICT_lignes_precommande_read" ON public.lignes_precommande
FOR SELECT USING (check_user_permission_strict('Ventes', 'Précommandes', 'read'));

CREATE POLICY "STRICT_lignes_precommande_insert" ON public.lignes_precommande
FOR INSERT WITH CHECK (check_user_permission_strict('Ventes', 'Précommandes', 'write'));

CREATE POLICY "STRICT_lignes_precommande_update" ON public.lignes_precommande
FOR UPDATE USING (check_user_permission_strict('Ventes', 'Précommandes', 'write'));

CREATE POLICY "STRICT_lignes_precommande_delete" ON public.lignes_precommande
FOR DELETE USING (check_user_permission_strict('Ventes', 'Précommandes', 'write'));

-- PERMISSIONS ET ROLES (uniquement pour les admins)
DROP POLICY IF EXISTS "Admin only permissions access" ON public.permissions;
DROP POLICY IF EXISTS "Admin only roles access" ON public.roles;
DROP POLICY IF EXISTS "Admin only role_permissions access" ON public.role_permissions;

CREATE POLICY "ADMIN_ONLY_permissions" ON public.permissions
FOR ALL USING (is_user_admin()) WITH CHECK (is_user_admin());

CREATE POLICY "ADMIN_ONLY_roles" ON public.roles
FOR ALL USING (is_user_admin()) WITH CHECK (is_user_admin());

CREATE POLICY "ADMIN_ONLY_role_permissions" ON public.role_permissions
FOR ALL USING (is_user_admin()) WITH CHECK (is_user_admin());

-- UTILISATEURS INTERNES
DROP POLICY IF EXISTS "Strict utilisateurs_internes read access" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Strict utilisateurs_internes write access" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Strict utilisateurs_internes update access" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Strict utilisateurs_internes delete access" ON public.utilisateurs_internes;

CREATE POLICY "STRICT_utilisateurs_internes_read" ON public.utilisateurs_internes
FOR SELECT USING (check_user_permission_strict('Paramètres', 'Utilisateurs', 'read'));

CREATE POLICY "STRICT_utilisateurs_internes_insert" ON public.utilisateurs_internes
FOR INSERT WITH CHECK (check_user_permission_strict('Paramètres', 'Utilisateurs', 'write'));

CREATE POLICY "STRICT_utilisateurs_internes_update" ON public.utilisateurs_internes
FOR UPDATE USING (check_user_permission_strict('Paramètres', 'Utilisateurs', 'write'));

CREATE POLICY "STRICT_utilisateurs_internes_delete" ON public.utilisateurs_internes
FOR DELETE USING (check_user_permission_strict('Paramètres', 'Utilisateurs', 'write'));

-- Assurer que toutes les tables ont RLS activé
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.factures_vente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lignes_facture_vente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.precommandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lignes_precommande ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utilisateurs_internes ENABLE ROW LEVEL SECURITY;

-- Commentaires pour documentation
COMMENT ON FUNCTION public.check_user_permission_strict IS 'Vérifie strictement les permissions utilisateur selon son rôle actif';
COMMENT ON FUNCTION public.get_current_user_role IS 'Retourne le rôle de l''utilisateur connecté actif';
COMMENT ON FUNCTION public.is_user_admin IS 'Vérifie si l''utilisateur connecté est administrateur actif';

-- Message de confirmation
SELECT 'SYSTÈME DE PERMISSIONS STRICT APPLIQUÉ' as status;