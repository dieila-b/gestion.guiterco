-- ========================================
-- SYSTÈME DE PERMISSIONS STRICT - FINALISATION
-- ========================================

-- 1. Créer une fonction sécurisée pour vérifier les permissions utilisateur
CREATE OR REPLACE FUNCTION public.user_has_permission(p_menu text, p_submenu text DEFAULT NULL, p_action text DEFAULT 'read')
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

-- 2. Fonction pour obtenir le rôle de l'utilisateur connecté
CREATE OR REPLACE FUNCTION public.get_user_role()
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

-- 3. Fonction pour vérifier si l'utilisateur est administrateur
CREATE OR REPLACE FUNCTION public.is_admin()
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

-- 4. Vue sécurisée pour les permissions utilisateur
CREATE OR REPLACE VIEW public.vue_permissions_utilisateurs AS
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

-- 5. APPLIQUER LES RLS STRICTES SUR TOUTES LES TABLES MÉTIER

-- CLIENTS
DROP POLICY IF EXISTS "Permission-based clients read" ON public.clients;
DROP POLICY IF EXISTS "Permission-based clients write" ON public.clients;
DROP POLICY IF EXISTS "Clients are publicly readable" ON public.clients;
DROP POLICY IF EXISTS "Clients are publicly writable" ON public.clients;
DROP POLICY IF EXISTS "Clients are publicly updatable" ON public.clients;
DROP POLICY IF EXISTS "Clients are publicly deletable" ON public.clients;
DROP POLICY IF EXISTS "select_all_clients" ON public.clients;

CREATE POLICY "Permission-based clients read" ON public.clients
FOR SELECT USING (user_has_permission('Clients', NULL, 'read'));

CREATE POLICY "Permission-based clients write" ON public.clients
FOR ALL USING (user_has_permission('Clients', NULL, 'write'))
WITH CHECK (user_has_permission('Clients', NULL, 'write'));

CREATE POLICY "Permission-based clients delete" ON public.clients
FOR DELETE USING (user_has_permission('Clients', NULL, 'delete'));

-- CATALOGUE
DROP POLICY IF EXISTS "Ultra permissive catalogue access" ON public.catalogue;
DROP POLICY IF EXISTS "Debug: Allow all access to catalogue" ON public.catalogue;
DROP POLICY IF EXISTS "Debug: Allow public read access to catalogue" ON public.catalogue;

CREATE POLICY "Permission-based catalogue read" ON public.catalogue
FOR SELECT USING (user_has_permission('Catalogue', NULL, 'read'));

CREATE POLICY "Permission-based catalogue write" ON public.catalogue
FOR ALL USING (user_has_permission('Catalogue', NULL, 'write'))
WITH CHECK (user_has_permission('Catalogue', NULL, 'write'));

CREATE POLICY "Permission-based catalogue delete" ON public.catalogue
FOR DELETE USING (user_has_permission('Catalogue', NULL, 'delete'));

-- FACTURES VENTE
DROP POLICY IF EXISTS "ULTRA_PERMISSIVE_factures_vente" ON public.factures_vente;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.factures_vente;

CREATE POLICY "Permission-based factures_vente read" ON public.factures_vente
FOR SELECT USING (
  user_has_permission('Ventes', 'Factures', 'read') OR 
  user_has_permission('Rapports', 'Ventes', 'read') OR
  user_has_permission('Rapports', 'Marges', 'read')
);

CREATE POLICY "Permission-based factures_vente write" ON public.factures_vente
FOR ALL USING (user_has_permission('Ventes', 'Factures', 'write'))
WITH CHECK (user_has_permission('Ventes', 'Factures', 'write'));

-- LIGNES FACTURE VENTE
DROP POLICY IF EXISTS "Ultra permissive lignes_facture_vente access" ON public.lignes_facture_vente;

CREATE POLICY "Permission-based lignes_facture_vente read" ON public.lignes_facture_vente
FOR SELECT USING (
  user_has_permission('Ventes', 'Factures', 'read') OR 
  user_has_permission('Rapports', 'Ventes', 'read') OR
  user_has_permission('Rapports', 'Marges', 'read')
);

CREATE POLICY "Permission-based lignes_facture_vente write" ON public.lignes_facture_vente
FOR ALL USING (user_has_permission('Ventes', 'Factures', 'write'))
WITH CHECK (user_has_permission('Ventes', 'Factures', 'write'));

-- PRECOMMANDES
CREATE POLICY "Permission-based precommandes read" ON public.precommandes
FOR SELECT USING (user_has_permission('Ventes', 'Précommandes', 'read'));

CREATE POLICY "Permission-based precommandes write" ON public.precommandes
FOR ALL USING (user_has_permission('Ventes', 'Précommandes', 'write'))
WITH CHECK (user_has_permission('Ventes', 'Précommandes', 'write'));

-- BONS DE COMMANDE
CREATE POLICY "Permission-based bons_de_commande read" ON public.bons_de_commande
FOR SELECT USING (user_has_permission('Achats', 'Bons de commande', 'read'));

CREATE POLICY "Permission-based bons_de_commande write" ON public.bons_de_commande
FOR ALL USING (user_has_permission('Achats', 'Bons de commande', 'write'))
WITH CHECK (user_has_permission('Achats', 'Bons de commande', 'write'));

-- ENTREES STOCK
CREATE POLICY "Permission-based entrees_stock read" ON public.entrees_stock
FOR SELECT USING (user_has_permission('Stock', NULL, 'read'));

CREATE POLICY "Permission-based entrees_stock write" ON public.entrees_stock
FOR ALL USING (user_has_permission('Stock', NULL, 'write'))
WITH CHECK (user_has_permission('Stock', NULL, 'write'));

-- CASH REGISTERS
DROP POLICY IF EXISTS "Allow all operations on cash_registers" ON public.cash_registers;

CREATE POLICY "Permission-based cash_registers read" ON public.cash_registers
FOR SELECT USING (
  user_has_permission('Caisse', 'Opérations', 'read') OR
  user_has_permission('Caisse', 'Clôtures', 'read') OR
  user_has_permission('Caisse', 'États', 'read')
);

CREATE POLICY "Permission-based cash_registers write" ON public.cash_registers
FOR ALL USING (user_has_permission('Caisse', 'Opérations', 'write'))
WITH CHECK (user_has_permission('Caisse', 'Opérations', 'write'));

-- CASH OPERATIONS
DROP POLICY IF EXISTS "Tout le monde peut voir les opérations de caisse" ON public.cash_operations;

CREATE POLICY "Permission-based cash_operations read" ON public.cash_operations
FOR SELECT USING (user_has_permission('Caisse', 'Opérations', 'read'));

CREATE POLICY "Permission-based cash_operations write" ON public.cash_operations
FOR ALL USING (user_has_permission('Caisse', 'Opérations', 'write'))
WITH CHECK (user_has_permission('Caisse', 'Opérations', 'write'));

-- PERMISSIONS ET ROLES (uniquement pour les admins)
DROP POLICY IF EXISTS "Authenticated users can read permissions" ON public.permissions;
DROP POLICY IF EXISTS "Authenticated users can write permissions" ON public.permissions;
DROP POLICY IF EXISTS "Utilisateurs internes peuvent lire les permissions" ON public.permissions;
DROP POLICY IF EXISTS "Seuls les admins peuvent modifier les permissions" ON public.permissions;

CREATE POLICY "Admins only can access permissions" ON public.permissions
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admins only can access roles" ON public.roles
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admins only can access role_permissions" ON public.role_permissions
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- UTILISATEURS INTERNES (admins et managers)
CREATE POLICY "Permission-based utilisateurs_internes read" ON public.utilisateurs_internes
FOR SELECT USING (user_has_permission('Paramètres', 'Utilisateurs', 'read'));

CREATE POLICY "Permission-based utilisateurs_internes write" ON public.utilisateurs_internes
FOR ALL USING (user_has_permission('Paramètres', 'Utilisateurs', 'write'))
WITH CHECK (user_has_permission('Paramètres', 'Utilisateurs', 'write'));

-- 6. Créer des politiques spécifiques pour le dashboard selon les rôles
CREATE POLICY "Dashboard access based on role" ON public.factures_vente
FOR SELECT USING (
  (user_has_permission('Dashboard', NULL, 'read') AND 
   (get_user_role() IN ('Administrateur', 'Manager'))) OR
  user_has_permission('Ventes', 'Factures', 'read')
);

-- 7. Accès en lecture seule pour certains rôles sur certaines données
CREATE POLICY "Caissier read-only factures" ON public.factures_vente
FOR SELECT USING (
  get_user_role() = 'Caissier' AND 
  user_has_permission('Caisse', 'Opérations', 'read')
);

CREATE POLICY "Vendeur own data access" ON public.factures_vente
FOR SELECT USING (
  get_user_role() = 'Vendeur' AND 
  user_has_permission('Ventes', 'Factures', 'read')
);

-- 8. Vue sécurisée des utilisateurs avec leurs rôles (pour les admins uniquement)
CREATE OR REPLACE VIEW public.vue_utilisateurs_avec_roles AS
SELECT 
    ui.id,
    ui.user_id,
    ui.nom,
    ui.prenom,
    ui.email,
    ui.matricule,
    ui.statut,
    ui.type_compte,
    r.id as role_id,
    r.name as role_nom,
    r.description as role_description,
    ui.created_at,
    ui.updated_at
FROM utilisateurs_internes ui
LEFT JOIN roles r ON ui.role_id = r.id
WHERE is_admin(); -- Seuls les admins peuvent voir cette vue

-- 9. Assurer que toutes les tables ont RLS activé
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.factures_vente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lignes_facture_vente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.precommandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lignes_precommande ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bons_de_commande ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entrees_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_registers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utilisateurs_internes ENABLE ROW LEVEL SECURITY;

COMMENT ON FUNCTION public.user_has_permission IS 'Vérifie si l''utilisateur connecté a une permission spécifique';
COMMENT ON FUNCTION public.get_user_role IS 'Retourne le rôle de l''utilisateur connecté';
COMMENT ON FUNCTION public.is_admin IS 'Vérifie si l''utilisateur connecté est administrateur';