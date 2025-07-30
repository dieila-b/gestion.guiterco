-- ========================================
-- FINALISATION SYSTÈME DE PERMISSIONS STRICT
-- ========================================

-- 1. Supprimer toutes les politiques qui dépendent de user_has_permission
DROP POLICY IF EXISTS "Permission-based stock_principal read" ON public.stock_principal;
DROP POLICY IF EXISTS "Permission-based stock_principal write" ON public.stock_principal;
DROP POLICY IF EXISTS "Permission-based stock_pdv read" ON public.stock_pdv;
DROP POLICY IF EXISTS "Permission-based stock_pdv write" ON public.stock_pdv;
DROP POLICY IF EXISTS "Permission-based factures_vente read" ON public.factures_vente;
DROP POLICY IF EXISTS "Permission-based factures_vente write" ON public.factures_vente;
DROP POLICY IF EXISTS "Permission-based clients read" ON public.clients;
DROP POLICY IF EXISTS "Permission-based clients write" ON public.clients;
DROP POLICY IF EXISTS "Permission-based precommandes read" ON public.precommandes;
DROP POLICY IF EXISTS "Permission-based precommandes write" ON public.precommandes;
DROP POLICY IF EXISTS "Permission-based bons_de_commande read" ON public.bons_de_commande;
DROP POLICY IF EXISTS "Permission-based bons_de_commande write" ON public.bons_de_commande;
DROP POLICY IF EXISTS "Permission-based entrees_stock read" ON public.entrees_stock;
DROP POLICY IF EXISTS "Permission-based entrees_stock write" ON public.entrees_stock;
DROP POLICY IF EXISTS "Permission-based rapports access" ON public.factures_vente;
DROP POLICY IF EXISTS "Permission-based marges access" ON public.factures_vente;

-- 2. Maintenant on peut supprimer et recréer les fonctions
DROP FUNCTION IF EXISTS public.user_has_permission(text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

-- 3. Créer les nouvelles fonctions strictes
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

-- 4. Recréer la vue des permissions
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

-- 5. CRÉER TOUTES LES POLITIQUES STRICTES

-- CLIENTS
CREATE POLICY "STRICT_clients_read" ON public.clients
FOR SELECT USING (check_user_permission_strict('Clients', NULL, 'read'));

CREATE POLICY "STRICT_clients_insert" ON public.clients
FOR INSERT WITH CHECK (check_user_permission_strict('Clients', NULL, 'write'));

CREATE POLICY "STRICT_clients_update" ON public.clients
FOR UPDATE USING (check_user_permission_strict('Clients', NULL, 'write'));

CREATE POLICY "STRICT_clients_delete" ON public.clients
FOR DELETE USING (check_user_permission_strict('Clients', NULL, 'delete'));

-- CATALOGUE
CREATE POLICY "STRICT_catalogue_read" ON public.catalogue
FOR SELECT USING (check_user_permission_strict('Catalogue', NULL, 'read'));

CREATE POLICY "STRICT_catalogue_insert" ON public.catalogue
FOR INSERT WITH CHECK (check_user_permission_strict('Catalogue', NULL, 'write'));

CREATE POLICY "STRICT_catalogue_update" ON public.catalogue
FOR UPDATE USING (check_user_permission_strict('Catalogue', NULL, 'write'));

CREATE POLICY "STRICT_catalogue_delete" ON public.catalogue
FOR DELETE USING (check_user_permission_strict('Catalogue', NULL, 'delete'));

-- FACTURES VENTE
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
CREATE POLICY "STRICT_precommandes_read" ON public.precommandes
FOR SELECT USING (check_user_permission_strict('Ventes', 'Précommandes', 'read'));

CREATE POLICY "STRICT_precommandes_insert" ON public.precommandes
FOR INSERT WITH CHECK (check_user_permission_strict('Ventes', 'Précommandes', 'write'));

CREATE POLICY "STRICT_precommandes_update" ON public.precommandes
FOR UPDATE USING (check_user_permission_strict('Ventes', 'Précommandes', 'write'));

CREATE POLICY "STRICT_precommandes_delete" ON public.precommandes
FOR DELETE USING (check_user_permission_strict('Ventes', 'Précommandes', 'write'));

-- LIGNES PRECOMMANDE
CREATE POLICY "STRICT_lignes_precommande_read" ON public.lignes_precommande
FOR SELECT USING (check_user_permission_strict('Ventes', 'Précommandes', 'read'));

CREATE POLICY "STRICT_lignes_precommande_insert" ON public.lignes_precommande
FOR INSERT WITH CHECK (check_user_permission_strict('Ventes', 'Précommandes', 'write'));

CREATE POLICY "STRICT_lignes_precommande_update" ON public.lignes_precommande
FOR UPDATE USING (check_user_permission_strict('Ventes', 'Précommandes', 'write'));

CREATE POLICY "STRICT_lignes_precommande_delete" ON public.lignes_precommande
FOR DELETE USING (check_user_permission_strict('Ventes', 'Précommandes', 'write'));

-- BONS DE COMMANDE
CREATE POLICY "STRICT_bons_de_commande_read" ON public.bons_de_commande
FOR SELECT USING (check_user_permission_strict('Achats', 'Bons de commande', 'read'));

CREATE POLICY "STRICT_bons_de_commande_insert" ON public.bons_de_commande
FOR INSERT WITH CHECK (check_user_permission_strict('Achats', 'Bons de commande', 'write'));

CREATE POLICY "STRICT_bons_de_commande_update" ON public.bons_de_commande
FOR UPDATE USING (check_user_permission_strict('Achats', 'Bons de commande', 'write'));

CREATE POLICY "STRICT_bons_de_commande_delete" ON public.bons_de_commande
FOR DELETE USING (check_user_permission_strict('Achats', 'Bons de commande', 'write'));

-- STOCK PRINCIPAL
CREATE POLICY "STRICT_stock_principal_read" ON public.stock_principal
FOR SELECT USING (
  check_user_permission_strict('Stock', 'Entrepôts', 'read') OR
  check_user_permission_strict('Stock', 'Mouvements', 'read')
);

CREATE POLICY "STRICT_stock_principal_write" ON public.stock_principal
FOR ALL USING (check_user_permission_strict('Stock', 'Entrepôts', 'write'))
WITH CHECK (check_user_permission_strict('Stock', 'Entrepôts', 'write'));

-- STOCK PDV
CREATE POLICY "STRICT_stock_pdv_read" ON public.stock_pdv
FOR SELECT USING (
  check_user_permission_strict('Stock', 'PDV', 'read') OR
  check_user_permission_strict('Stock', 'Mouvements', 'read')
);

CREATE POLICY "STRICT_stock_pdv_write" ON public.stock_pdv
FOR ALL USING (check_user_permission_strict('Stock', 'PDV', 'write'))
WITH CHECK (check_user_permission_strict('Stock', 'PDV', 'write'));

-- ENTREES STOCK
CREATE POLICY "STRICT_entrees_stock_read" ON public.entrees_stock
FOR SELECT USING (
  check_user_permission_strict('Stock', 'Mouvements', 'read') OR
  check_user_permission_strict('Stock', 'Entrepôts', 'read') OR
  check_user_permission_strict('Stock', 'PDV', 'read')
);

CREATE POLICY "STRICT_entrees_stock_write" ON public.entrees_stock
FOR ALL USING (
  check_user_permission_strict('Stock', 'Entrepôts', 'write') OR
  check_user_permission_strict('Stock', 'PDV', 'write')
) WITH CHECK (
  check_user_permission_strict('Stock', 'Entrepôts', 'write') OR
  check_user_permission_strict('Stock', 'PDV', 'write')
);

-- PERMISSIONS ET ROLES (uniquement pour les admins)
CREATE POLICY "ADMIN_ONLY_permissions" ON public.permissions
FOR ALL USING (is_user_admin()) WITH CHECK (is_user_admin());

CREATE POLICY "ADMIN_ONLY_roles" ON public.roles
FOR ALL USING (is_user_admin()) WITH CHECK (is_user_admin());

CREATE POLICY "ADMIN_ONLY_role_permissions" ON public.role_permissions
FOR ALL USING (is_user_admin()) WITH CHECK (is_user_admin());

-- UTILISATEURS INTERNES
CREATE POLICY "STRICT_utilisateurs_internes_read" ON public.utilisateurs_internes
FOR SELECT USING (check_user_permission_strict('Paramètres', 'Utilisateurs', 'read'));

CREATE POLICY "STRICT_utilisateurs_internes_write" ON public.utilisateurs_internes
FOR ALL USING (check_user_permission_strict('Paramètres', 'Utilisateurs', 'write'))
WITH CHECK (check_user_permission_strict('Paramètres', 'Utilisateurs', 'write'));

-- 6. Assurer que toutes les tables ont RLS activé
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.factures_vente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lignes_facture_vente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.precommandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lignes_precommande ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bons_de_commande ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entrees_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_principal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_pdv ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utilisateurs_internes ENABLE ROW LEVEL SECURITY;

-- Message de confirmation
SELECT '✅ SYSTÈME DE PERMISSIONS STRICT FINALISÉ AVEC SUCCÈS' as message;