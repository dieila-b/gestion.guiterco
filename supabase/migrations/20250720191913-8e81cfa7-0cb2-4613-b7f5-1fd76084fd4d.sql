
-- RENFORCEMENT COMPLET DU SYSTÈME DE PERMISSIONS
-- =====================================================

-- 1. Corriger les politiques RLS pour être strictes et cohérentes
-- Supprimer toutes les politiques permissives existantes
DROP POLICY IF EXISTS "Dev: Allow all operations on catalogue" ON public.catalogue;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.catalogue;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.catalogue;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.catalogue;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.catalogue;

DROP POLICY IF EXISTS "Dev: Allow all operations on stock_principal" ON public.stock_principal;
DROP POLICY IF EXISTS "Dev: Allow all operations on stock_pdv" ON public.stock_pdv;
DROP POLICY IF EXISTS "Dev: Allow all operations on entrees_stock" ON public.entrees_stock;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.entrees_stock;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.entrees_stock;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.entrees_stock;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.entrees_stock;

DROP POLICY IF EXISTS "Dev: Allow all operations on factures_vente" ON public.factures_vente;
DROP POLICY IF EXISTS "Dev: Allow all operations on lignes_facture_vente" ON public.lignes_facture_vente;
DROP POLICY IF EXISTS "Dev: Allow all operations on clients" ON public.clients;

-- 2. Créer une fonction pour vérifier les permissions spécifiques
CREATE OR REPLACE FUNCTION public.user_has_permission(
  p_menu TEXT,
  p_submenu TEXT DEFAULT NULL,
  p_action TEXT DEFAULT 'read'
)
RETURNS BOOLEAN
LANGUAGE sql
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

-- 3. Appliquer des politiques RLS strictes basées sur les permissions

-- CATALOGUE - Accès basé sur les permissions
CREATE POLICY "Permission-based catalogue read" 
ON public.catalogue 
FOR SELECT 
TO authenticated
USING (public.user_has_permission('Catalogue', NULL, 'read'));

CREATE POLICY "Permission-based catalogue write" 
ON public.catalogue 
FOR INSERT 
TO authenticated
WITH CHECK (public.user_has_permission('Catalogue', NULL, 'write'));

CREATE POLICY "Permission-based catalogue update" 
ON public.catalogue 
FOR UPDATE 
TO authenticated
USING (public.user_has_permission('Catalogue', NULL, 'write'));

CREATE POLICY "Permission-based catalogue delete" 
ON public.catalogue 
FOR DELETE 
TO authenticated
USING (public.user_has_permission('Catalogue', NULL, 'delete'));

-- STOCK PRINCIPAL - Accès basé sur les permissions Stock/Entrepôts
CREATE POLICY "Permission-based stock_principal read" 
ON public.stock_principal 
FOR SELECT 
TO authenticated
USING (public.user_has_permission('Stock', 'Entrepôts', 'read'));

CREATE POLICY "Permission-based stock_principal write" 
ON public.stock_principal 
FOR ALL 
TO authenticated
USING (public.user_has_permission('Stock', 'Entrepôts', 'write'))
WITH CHECK (public.user_has_permission('Stock', 'Entrepôts', 'write'));

-- STOCK PDV - Accès basé sur les permissions Stock/PDV
CREATE POLICY "Permission-based stock_pdv read" 
ON public.stock_pdv 
FOR SELECT 
TO authenticated
USING (public.user_has_permission('Stock', 'PDV', 'read'));

CREATE POLICY "Permission-based stock_pdv write" 
ON public.stock_pdv 
FOR ALL 
TO authenticated
USING (public.user_has_permission('Stock', 'PDV', 'write'))
WITH CHECK (public.user_has_permission('Stock', 'PDV', 'write'));

-- ENTREES STOCK - Accès basé sur les permissions Stock
CREATE POLICY "Permission-based entrees_stock read" 
ON public.entrees_stock 
FOR SELECT 
TO authenticated
USING (
  public.user_has_permission('Stock', 'Entrepôts', 'read') OR 
  public.user_has_permission('Stock', 'PDV', 'read')
);

CREATE POLICY "Permission-based entrees_stock write" 
ON public.entrees_stock 
FOR ALL 
TO authenticated
USING (
  public.user_has_permission('Stock', 'Entrepôts', 'write') OR 
  public.user_has_permission('Stock', 'PDV', 'write')
)
WITH CHECK (
  public.user_has_permission('Stock', 'Entrepôts', 'write') OR 
  public.user_has_permission('Stock', 'PDV', 'write')
);

-- FACTURES VENTE - Accès basé sur les permissions Ventes/Factures
CREATE POLICY "Permission-based factures_vente read" 
ON public.factures_vente 
FOR SELECT 
TO authenticated
USING (public.user_has_permission('Ventes', 'Factures', 'read'));

CREATE POLICY "Permission-based factures_vente write" 
ON public.factures_vente 
FOR ALL 
TO authenticated
USING (public.user_has_permission('Ventes', 'Factures', 'write'))
WITH CHECK (public.user_has_permission('Ventes', 'Factures', 'write'));

-- LIGNES FACTURE VENTE
CREATE POLICY "Permission-based lignes_facture_vente read" 
ON public.lignes_facture_vente 
FOR SELECT 
TO authenticated
USING (public.user_has_permission('Ventes', 'Factures', 'read'));

CREATE POLICY "Permission-based lignes_facture_vente write" 
ON public.lignes_facture_vente 
FOR ALL 
TO authenticated
USING (public.user_has_permission('Ventes', 'Factures', 'write'))
WITH CHECK (public.user_has_permission('Ventes', 'Factures', 'write'));

-- CLIENTS - Accès basé sur les permissions Clients
CREATE POLICY "Permission-based clients read" 
ON public.clients 
FOR SELECT 
TO authenticated
USING (public.user_has_permission('Clients', NULL, 'read'));

CREATE POLICY "Permission-based clients write" 
ON public.clients 
FOR ALL 
TO authenticated
USING (public.user_has_permission('Clients', NULL, 'write'))
WITH CHECK (public.user_has_permission('Clients', NULL, 'write'));

-- PRECOMMANDES - Accès basé sur les permissions Ventes/Précommandes
CREATE POLICY "Permission-based precommandes read" 
ON public.precommandes 
FOR SELECT 
TO authenticated
USING (public.user_has_permission('Ventes', 'Précommandes', 'read'));

CREATE POLICY "Permission-based precommandes write" 
ON public.precommandes 
FOR ALL 
TO authenticated
USING (public.user_has_permission('Ventes', 'Précommandes', 'write'))
WITH CHECK (public.user_has_permission('Ventes', 'Précommandes', 'write'));

-- BONS DE COMMANDE - Accès basé sur les permissions Achats
CREATE POLICY "Permission-based bons_de_commande read" 
ON public.bons_de_commande 
FOR SELECT 
TO authenticated
USING (public.user_has_permission('Achats', 'Bons de commande', 'read'));

CREATE POLICY "Permission-based bons_de_commande write" 
ON public.bons_de_commande 
FOR ALL 
TO authenticated
USING (public.user_has_permission('Achats', 'Bons de commande', 'write'))
WITH CHECK (public.user_has_permission('Achats', 'Bons de commande', 'write'));

-- 4. Activer la réplication temps réel pour toutes les tables de permissions
ALTER TABLE public.user_roles REPLICA IDENTITY FULL;
ALTER TABLE public.role_permissions REPLICA IDENTITY FULL;

-- Ajouter toutes les tables critiques à la publication realtime
DO $$
DECLARE
    tbl_name text;
    permission_tables text[] := ARRAY[
        'user_roles', 'role_permissions', 'permissions', 'roles',
        'utilisateurs_internes', 'catalogue', 'stock_principal', 
        'stock_pdv', 'factures_vente', 'clients', 'precommandes'
    ];
BEGIN
    FOREACH tbl_name IN ARRAY permission_tables
    LOOP
        BEGIN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', tbl_name);
        EXCEPTION WHEN duplicate_object THEN
            -- Table déjà dans la publication, continuer
            NULL;
        END;
    END LOOP;
END $$;

-- 5. Forcer l'invalidation du cache PostgREST
NOTIFY pgrst, 'reload schema';
