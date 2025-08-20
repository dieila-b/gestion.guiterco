-- Correction simple des politiques RLS pour permettre l'accès aux données
-- Supprimer toutes les politiques restrictives et permettre l'accès complet

-- Points de vente
DROP POLICY IF EXISTS "Allow authenticated users to read points_de_vente" ON public.points_de_vente;
DROP POLICY IF EXISTS "Allow authorized users to write points_de_vente" ON public.points_de_vente;
DROP POLICY IF EXISTS "DEV_points_de_vente_full_access" ON public.points_de_vente;
DROP POLICY IF EXISTS "Dev: Allow all operations on points_de_vente" ON public.points_de_vente;
DROP POLICY IF EXISTS "DEV_points_de_vente_ultra_permissive" ON public.points_de_vente;
DROP POLICY IF EXISTS "DEV_points_de_vente_final" ON public.points_de_vente;

CREATE POLICY "ALLOW_ALL_points_de_vente" 
ON public.points_de_vente 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Catalogue
DROP POLICY IF EXISTS "DEV_catalogue_full_access" ON public.catalogue;
DROP POLICY IF EXISTS "DEV_catalogue_ultra_permissive" ON public.catalogue;
DROP POLICY IF EXISTS "DEV_catalogue_final" ON public.catalogue;

CREATE POLICY "ALLOW_ALL_catalogue" 
ON public.catalogue 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Clients
DROP POLICY IF EXISTS "DEV_clients_full_access" ON public.clients;
DROP POLICY IF EXISTS "DEV_clients_ultra_permissive" ON public.clients;
DROP POLICY IF EXISTS "DEV_clients_final" ON public.clients;

CREATE POLICY "ALLOW_ALL_clients" 
ON public.clients 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Stock PDV
DROP POLICY IF EXISTS "STRICT_stock_pdv_read" ON public.stock_pdv;
DROP POLICY IF EXISTS "STRICT_stock_pdv_write" ON public.stock_pdv;
DROP POLICY IF EXISTS "DEV_stock_pdv_ultra_permissive" ON public.stock_pdv;
DROP POLICY IF EXISTS "DEV_stock_pdv_final" ON public.stock_pdv;

CREATE POLICY "ALLOW_ALL_stock_pdv" 
ON public.stock_pdv 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Stock principal
DROP POLICY IF EXISTS "STRICT_stock_principal_read" ON public.stock_principal;
DROP POLICY IF EXISTS "STRICT_stock_principal_write" ON public.stock_principal;
DROP POLICY IF EXISTS "DEV_stock_principal_ultra_permissive" ON public.stock_principal;
DROP POLICY IF EXISTS "DEV_stock_principal_final" ON public.stock_principal;

CREATE POLICY "ALLOW_ALL_stock_principal" 
ON public.stock_principal 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Entrepots
DROP POLICY IF EXISTS "DEV_entrepots_full_access" ON public.entrepots;
DROP POLICY IF EXISTS "DEV_entrepots_ultra_permissive" ON public.entrepots;
DROP POLICY IF EXISTS "DEV_entrepots_final" ON public.entrepots;

CREATE POLICY "ALLOW_ALL_entrepots" 
ON public.entrepots 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Categories catalogue
DROP POLICY IF EXISTS "Authenticated users can access categories_catalogue" ON public.categories_catalogue;
DROP POLICY IF EXISTS "Dev: Allow all operations on categories_catalogue" ON public.categories_catalogue;
DROP POLICY IF EXISTS "DEV_categories_catalogue_ultra_permissive" ON public.categories_catalogue;
DROP POLICY IF EXISTS "DEV_categories_catalogue_final" ON public.categories_catalogue;

CREATE POLICY "ALLOW_ALL_categories_catalogue" 
ON public.categories_catalogue 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Unites
DROP POLICY IF EXISTS "DEV_unites_ultra_permissive" ON public.unites;
DROP POLICY IF EXISTS "DEV_unites_final" ON public.unites;

CREATE POLICY "ALLOW_ALL_unites" 
ON public.unites 
FOR ALL 
USING (true) 
WITH CHECK (true);