
-- Supprimer les politiques RLS restrictives et créer des politiques plus permissives pour le développement

-- Table catalogue : Permettre l'accès complet en mode dev
DROP POLICY IF EXISTS "SECURE_catalogue_read" ON public.catalogue;
DROP POLICY IF EXISTS "SECURE_catalogue_insert" ON public.catalogue;
DROP POLICY IF EXISTS "SECURE_catalogue_update" ON public.catalogue;
DROP POLICY IF EXISTS "SECURE_catalogue_delete" ON public.catalogue;

CREATE POLICY "DEV_catalogue_full_access" ON public.catalogue
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Table clients : Permettre l'accès complet en mode dev
DROP POLICY IF EXISTS "SECURE_clients_read" ON public.clients;
DROP POLICY IF EXISTS "SECURE_clients_insert" ON public.clients;
DROP POLICY IF EXISTS "SECURE_clients_update" ON public.clients;
DROP POLICY IF EXISTS "SECURE_clients_delete" ON public.clients;

CREATE POLICY "DEV_clients_full_access" ON public.clients
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Table stock_principal : Permettre l'accès complet
DROP POLICY IF EXISTS "STRICT_stock_principal_read" ON public.stock_principal;
DROP POLICY IF EXISTS "STRICT_stock_principal_write" ON public.stock_principal;

CREATE POLICY "DEV_stock_principal_full_access" ON public.stock_principal
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Table stock_pdv : Permettre l'accès complet
DROP POLICY IF EXISTS "STRICT_stock_pdv_read" ON public.stock_pdv;
DROP POLICY IF EXISTS "STRICT_stock_pdv_write" ON public.stock_pdv;

CREATE POLICY "DEV_stock_pdv_full_access" ON public.stock_pdv
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Table entrees_stock : Permettre l'accès complet
DROP POLICY IF EXISTS "STRICT_entrees_stock_read" ON public.entrees_stock;
DROP POLICY IF EXISTS "STRICT_entrees_stock_write" ON public.entrees_stock;

CREATE POLICY "DEV_entrees_stock_full_access" ON public.entrees_stock
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Table sorties_stock : Permettre l'accès complet
CREATE POLICY "DEV_sorties_stock_full_access" ON public.sorties_stock
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Table transferts : Permettre l'accès complet
CREATE POLICY "DEV_transferts_full_access" ON public.transferts
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Table categories_catalogue : Déjà accessible mais s'assurer
DROP POLICY IF EXISTS "Authenticated users can access categories_catalogue" ON public.categories_catalogue;
CREATE POLICY "DEV_categories_catalogue_full_access" ON public.categories_catalogue
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Table unites_catalogue : Permettre l'accès complet
CREATE POLICY "DEV_unites_catalogue_full_access" ON public.unites_catalogue
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Vérifier que RLS est activé mais avec des politiques permissives
ALTER TABLE public.catalogue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_principal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_pdv ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entrees_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sorties_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transferts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories_catalogue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unites_catalogue ENABLE ROW LEVEL SECURITY;

-- Créer les tables manquantes si elles n'existent pas
CREATE TABLE IF NOT EXISTS public.sorties_stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES public.catalogue(id),
    entrepot_id UUID REFERENCES public.entrepots(id),
    quantite INTEGER NOT NULL,
    type_sortie VARCHAR NOT NULL,
    destination VARCHAR,
    numero_bon VARCHAR,
    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by VARCHAR
);

CREATE TABLE IF NOT EXISTS public.transferts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference VARCHAR,
    article_id UUID REFERENCES public.catalogue(id),
    entrepot_source_id UUID REFERENCES public.entrepots(id),
    entrepot_destination_id UUID REFERENCES public.entrepots(id),
    pdv_destination_id UUID REFERENCES public.points_de_vente(id),
    quantite INTEGER NOT NULL,
    statut VARCHAR DEFAULT 'en_attente',
    numero_transfert VARCHAR,
    date_expedition TIMESTAMP WITH TIME ZONE,
    date_reception TIMESTAMP WITH TIME ZONE,
    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by VARCHAR
);

CREATE TABLE IF NOT EXISTS public.unites_catalogue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR NOT NULL,
    abbreviation VARCHAR,
    description TEXT,
    statut VARCHAR DEFAULT 'actif',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activer RLS sur les nouvelles tables
ALTER TABLE public.sorties_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transferts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unites_catalogue ENABLE ROW LEVEL SECURITY;

-- Insérer quelques unités de base si la table est vide
INSERT INTO public.unites_catalogue (nom, abbreviation, description) VALUES
('Pièce', 'pcs', 'Unité à l''unité'),
('Kilogramme', 'kg', 'Unité de poids'),
('Litre', 'L', 'Unité de volume'),
('Mètre', 'm', 'Unité de longueur'),
('Boîte', 'bte', 'Emballage en boîte')
ON CONFLICT DO NOTHING;

-- Créer une vue pour les marges si elle n'existe pas
CREATE OR REPLACE VIEW public.vue_marges_articles AS
SELECT 
    c.id,
    c.nom,
    c.reference,
    c.prix_achat,
    c.prix_vente,
    c.frais_logistique,
    c.frais_douane,
    c.frais_transport,
    c.autres_frais,
    (COALESCE(c.prix_achat, 0) + COALESCE(c.frais_logistique, 0) + 
     COALESCE(c.frais_douane, 0) + COALESCE(c.frais_transport, 0) + 
     COALESCE(c.autres_frais, 0)) as cout_total_unitaire,
    (COALESCE(c.prix_vente, 0) - (COALESCE(c.prix_achat, 0) + COALESCE(c.frais_logistique, 0) + 
     COALESCE(c.frais_douane, 0) + COALESCE(c.frais_transport, 0) + 
     COALESCE(c.autres_frais, 0))) as marge_unitaire
FROM public.catalogue c;
