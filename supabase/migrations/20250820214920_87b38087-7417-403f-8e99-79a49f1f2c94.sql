-- Correction complète des politiques RLS pour le développement
-- Supprimer toutes les politiques restrictives et permettre l'accès complet

-- Table points_de_vente
DROP POLICY IF EXISTS "Allow authenticated users to read points_de_vente" ON public.points_de_vente;
DROP POLICY IF EXISTS "Allow authorized users to write points_de_vente" ON public.points_de_vente;
DROP POLICY IF EXISTS "DEV_points_de_vente_full_access" ON public.points_de_vente;
DROP POLICY IF EXISTS "Dev: Allow all operations on points_de_vente" ON public.points_de_vente;

CREATE POLICY "DEV_points_de_vente_ultra_permissive" 
ON public.points_de_vente 
FOR ALL 
TO authenticated, anon 
USING (true) 
WITH CHECK (true);

-- Table stock_pdv
DROP POLICY IF EXISTS "STRICT_stock_pdv_read" ON public.stock_pdv;
DROP POLICY IF EXISTS "STRICT_stock_pdv_write" ON public.stock_pdv;

CREATE POLICY "DEV_stock_pdv_ultra_permissive" 
ON public.stock_pdv 
FOR ALL 
TO authenticated, anon 
USING (true) 
WITH CHECK (true);

-- Table stock_principal
DROP POLICY IF EXISTS "STRICT_stock_principal_read" ON public.stock_principal;
DROP POLICY IF EXISTS "STRICT_stock_principal_write" ON public.stock_principal;

CREATE POLICY "DEV_stock_principal_ultra_permissive" 
ON public.stock_principal 
FOR ALL 
TO authenticated, anon 
USING (true) 
WITH CHECK (true);

-- Table catalogue
DROP POLICY IF EXISTS "DEV_catalogue_full_access" ON public.catalogue;

CREATE POLICY "DEV_catalogue_ultra_permissive" 
ON public.catalogue 
FOR ALL 
TO authenticated, anon 
USING (true) 
WITH CHECK (true);

-- Table clients
DROP POLICY IF EXISTS "DEV_clients_full_access" ON public.clients;

CREATE POLICY "DEV_clients_ultra_permissive" 
ON public.clients 
FOR ALL 
TO authenticated, anon 
USING (true) 
WITH CHECK (true);

-- Table entrepots
DROP POLICY IF EXISTS "DEV_entrepots_full_access" ON public.entrepots;

CREATE POLICY "DEV_entrepots_ultra_permissive" 
ON public.entrepots 
FOR ALL 
TO authenticated, anon 
USING (true) 
WITH CHECK (true);

-- Table categories_catalogue
DROP POLICY IF EXISTS "Authenticated users can access categories_catalogue" ON public.categories_catalogue;
DROP POLICY IF EXISTS "Dev: Allow all operations on categories_catalogue" ON public.categories_catalogue;

CREATE POLICY "DEV_categories_catalogue_ultra_permissive" 
ON public.categories_catalogue 
FOR ALL 
TO authenticated, anon 
USING (true) 
WITH CHECK (true);

-- Créer une table unites si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.unites (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    nom character varying NOT NULL,
    symbole character varying,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Activer RLS sur la table unites
ALTER TABLE public.unites ENABLE ROW LEVEL SECURITY;

-- Politique permissive pour unites
CREATE POLICY "DEV_unites_ultra_permissive" 
ON public.unites 
FOR ALL 
TO authenticated, anon 
USING (true) 
WITH CHECK (true);

-- Insérer quelques unités de base
INSERT INTO public.unites (nom, symbole, description) 
VALUES 
('Pièce', 'pce', 'Unité par pièce'),
('Kilogramme', 'kg', 'Unité de poids'),
('Litre', 'l', 'Unité de volume'),
('Mètre', 'm', 'Unité de longueur')
ON CONFLICT DO NOTHING;

-- S'assurer que RLS est activé sur toutes les tables
ALTER TABLE public.points_de_vente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_pdv ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_principal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entrepots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories_catalogue ENABLE ROW LEVEL SECURITY;