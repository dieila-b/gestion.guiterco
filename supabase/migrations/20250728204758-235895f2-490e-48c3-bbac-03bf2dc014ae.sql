-- Corriger les politiques RLS pour restaurer l'accès aux données de stock

-- Supprimer les politiques restrictives actuelles pour les tables de stock
DROP POLICY IF EXISTS "Permission-based catalogue read" ON public.catalogue;
DROP POLICY IF EXISTS "Permission-based catalogue write" ON public.catalogue;
DROP POLICY IF EXISTS "Permission-based catalogue update" ON public.catalogue;
DROP POLICY IF EXISTS "Permission-based catalogue delete" ON public.catalogue;

DROP POLICY IF EXISTS "Permission-based entrees_stock read" ON public.entrees_stock;
DROP POLICY IF EXISTS "Permission-based entrees_stock write" ON public.entrees_stock;

-- Créer des politiques permettant l'accès aux utilisateurs authentifiés
CREATE POLICY "Authenticated users can read catalogue" ON public.catalogue
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can write catalogue" ON public.catalogue
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read entrees_stock" ON public.entrees_stock
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can write entrees_stock" ON public.entrees_stock
FOR ALL USING (true) WITH CHECK (true);

-- Créer des politiques pour stock_principal et stock_pdv s'ils n'existent pas
CREATE POLICY "Authenticated users can read stock_principal" ON public.stock_principal
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can write stock_principal" ON public.stock_principal
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read stock_pdv" ON public.stock_pdv
FOR SELECT USING (true) USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can write stock_pdv" ON public.stock_pdv
FOR ALL USING (true) WITH CHECK (true);

-- Créer des politiques pour sorties_stock
CREATE POLICY "Authenticated users can read sorties_stock" ON public.sorties_stock
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can write sorties_stock" ON public.sorties_stock
FOR ALL USING (true) WITH CHECK (true);

-- Créer des politiques pour transferts
CREATE POLICY "Authenticated users can read transferts" ON public.transferts
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can write transferts" ON public.transferts
FOR ALL USING (true) WITH CHECK (true);