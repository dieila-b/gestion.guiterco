-- Migration pour appliquer strictement les permissions basées sur les rôles
-- Mise à jour des RLS policies pour utiliser le système de permissions

-- 1. Créer une fonction helper pour vérifier les permissions
CREATE OR REPLACE FUNCTION user_has_permission(p_menu text, p_submenu text DEFAULT NULL, p_action text DEFAULT 'read')
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.vue_permissions_utilisateurs vpu
    WHERE vpu.user_id = auth.uid()
    AND vpu.menu = p_menu
    AND (p_submenu IS NULL OR vpu.submenu = p_submenu)
    AND vpu.action = p_action
    AND vpu.can_access = true
  );
$$;

-- 2. Mise à jour des policies pour le catalogue (plus strictes)
DROP POLICY IF EXISTS "Authenticated users can read catalogue" ON public.catalogue;
DROP POLICY IF EXISTS "Authenticated users can write catalogue" ON public.catalogue;

CREATE POLICY "Permission-based catalogue read"
ON public.catalogue
FOR SELECT
TO authenticated
USING (user_has_permission('Catalogue', NULL, 'read'));

CREATE POLICY "Permission-based catalogue write"
ON public.catalogue
FOR ALL
TO authenticated
USING (user_has_permission('Catalogue', NULL, 'write'))
WITH CHECK (user_has_permission('Catalogue', NULL, 'write'));

-- 3. Mise à jour des policies pour les entrepôts
DROP POLICY IF EXISTS "Enable read access for all users" ON public.entrepots;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.entrepots;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.entrepots;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.entrepots;

CREATE POLICY "Permission-based entrepots read"
ON public.entrepots
FOR SELECT
TO authenticated
USING (user_has_permission('Paramètres', 'Entrepôts', 'read'));

CREATE POLICY "Permission-based entrepots write"
ON public.entrepots
FOR ALL
TO authenticated
USING (user_has_permission('Paramètres', 'Entrepôts', 'write'))
WITH CHECK (user_has_permission('Paramètres', 'Entrepôts', 'write'));

-- 4. Mise à jour des policies pour les points de vente
DROP POLICY IF EXISTS "Enable read access for all users" ON public.points_de_vente;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.points_de_vente;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.points_de_vente;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.points_de_vente;

CREATE POLICY "Permission-based points_de_vente read"
ON public.points_de_vente
FOR SELECT
TO authenticated
USING (user_has_permission('Paramètres', 'Points de vente', 'read'));

CREATE POLICY "Permission-based points_de_vente write"
ON public.points_de_vente
FOR ALL
TO authenticated
USING (user_has_permission('Paramètres', 'Points de vente', 'write'))
WITH CHECK (user_has_permission('Paramètres', 'Points de vente', 'write'));

-- 5. Mise à jour des policies pour les stocks
DROP POLICY IF EXISTS "Authenticated users can read entrees_stock" ON public.entrees_stock;
DROP POLICY IF EXISTS "Authenticated users can write entrees_stock" ON public.entrees_stock;

CREATE POLICY "Permission-based entrees_stock read"
ON public.entrees_stock
FOR SELECT
TO authenticated
USING (user_has_permission('Stocks', NULL, 'read'));

CREATE POLICY "Permission-based entrees_stock write"
ON public.entrees_stock
FOR ALL
TO authenticated
USING (user_has_permission('Stocks', NULL, 'write'))
WITH CHECK (user_has_permission('Stocks', NULL, 'write'));

-- 6. Politique stricte pour les rapports
CREATE POLICY "Permission-based rapports access"
ON public.factures_vente
FOR SELECT
TO authenticated
USING (user_has_permission('Rapports', NULL, 'read'));

-- 7. Politique pour les marges (accès restreint)
CREATE POLICY "Permission-based marges access"
ON public.factures_vente
FOR SELECT
TO authenticated
USING (user_has_permission('Marges', NULL, 'read'));

-- 8. Garder les policies de développement pour les tests
-- Ces policies seront automatiquement moins prioritaires que les policies strictes ci-dessus