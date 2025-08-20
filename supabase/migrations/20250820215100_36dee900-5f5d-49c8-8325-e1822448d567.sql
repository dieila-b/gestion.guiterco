-- Correction des politiques RLS pour le développement - Version corrigée
-- Supprimer toutes les politiques restrictives et permettre l'accès complet

-- Table points_de_vente
DROP POLICY IF EXISTS "Allow authenticated users to read points_de_vente" ON public.points_de_vente;
DROP POLICY IF EXISTS "Allow authorized users to write points_de_vente" ON public.points_de_vente;
DROP POLICY IF EXISTS "DEV_points_de_vente_full_access" ON public.points_de_vente;
DROP POLICY IF EXISTS "Dev: Allow all operations on points_de_vente" ON public.points_de_vente;
DROP POLICY IF EXISTS "DEV_points_de_vente_ultra_permissive" ON public.points_de_vente;

CREATE POLICY "DEV_points_de_vente_final" 
ON public.points_de_vente 
FOR ALL 
TO authenticated, anon 
USING (true) 
WITH CHECK (true);

-- Table stock_pdv - Créer la table si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.stock_pdv (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id uuid REFERENCES public.catalogue(id),
    point_vente_id uuid REFERENCES public.points_de_vente(id),
    quantite_disponible integer DEFAULT 0,
    derniere_livraison timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.stock_pdv ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "STRICT_stock_pdv_read" ON public.stock_pdv;
DROP POLICY IF EXISTS "STRICT_stock_pdv_write" ON public.stock_pdv;
DROP POLICY IF EXISTS "DEV_stock_pdv_ultra_permissive" ON public.stock_pdv;

CREATE POLICY "DEV_stock_pdv_final" 
ON public.stock_pdv 
FOR ALL 
TO authenticated, anon 
USING (true) 
WITH CHECK (true);

-- Table stock_principal - Créer la table si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.stock_principal (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id uuid REFERENCES public.catalogue(id),
    entrepot_id uuid REFERENCES public.entrepots(id),
    quantite_disponible integer DEFAULT 0,
    derniere_entree timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.stock_principal ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "STRICT_stock_principal_read" ON public.stock_principal;
DROP POLICY IF EXISTS "STRICT_stock_principal_write" ON public.stock_principal;
DROP POLICY IF EXISTS "DEV_stock_principal_ultra_permissive" ON public.stock_principal;

CREATE POLICY "DEV_stock_principal_final" 
ON public.stock_principal 
FOR ALL 
TO authenticated, anon 
USING (true) 
WITH CHECK (true);

-- Table catalogue
DROP POLICY IF EXISTS "DEV_catalogue_full_access" ON public.catalogue;
DROP POLICY IF EXISTS "DEV_catalogue_ultra_permissive" ON public.catalogue;

CREATE POLICY "DEV_catalogue_final" 
ON public.catalogue 
FOR ALL 
TO authenticated, anon 
USING (true) 
WITH CHECK (true);

-- Table clients
DROP POLICY IF EXISTS "DEV_clients_full_access" ON public.clients;
DROP POLICY IF EXISTS "DEV_clients_ultra_permissive" ON public.clients;

CREATE POLICY "DEV_clients_final" 
ON public.clients 
FOR ALL 
TO authenticated, anon 
USING (true) 
WITH CHECK (true);

-- Table entrepots
DROP POLICY IF EXISTS "DEV_entrepots_full_access" ON public.entrepots;
DROP POLICY IF EXISTS "DEV_entrepots_ultra_permissive" ON public.entrepots;

CREATE POLICY "DEV_entrepots_final" 
ON public.entrepots 
FOR ALL 
TO authenticated, anon 
USING (true) 
WITH CHECK (true);

-- Table categories_catalogue
DROP POLICY IF EXISTS "Authenticated users can access categories_catalogue" ON public.categories_catalogue;
DROP POLICY IF EXISTS "Dev: Allow all operations on categories_catalogue" ON public.categories_catalogue;
DROP POLICY IF EXISTS "DEV_categories_catalogue_ultra_permissive" ON public.categories_catalogue;

CREATE POLICY "DEV_categories_catalogue_final" 
ON public.categories_catalogue 
FOR ALL 
TO authenticated, anon 
USING (true) 
WITH CHECK (true);

-- Table unites - Gérer correctement
ALTER TABLE public.unites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "DEV_unites_ultra_permissive" ON public.unites;

CREATE POLICY "DEV_unites_final" 
ON public.unites 
FOR ALL 
TO authenticated, anon 
USING (true) 
WITH CHECK (true);

-- Insérer quelques unités de base si elles n'existent pas déjà
INSERT INTO public.unites (nom, symbole) 
VALUES 
('Pièce', 'pce'),
('Kilogramme', 'kg'),
('Litre', 'l'),
('Mètre', 'm')
ON CONFLICT (nom) DO NOTHING;