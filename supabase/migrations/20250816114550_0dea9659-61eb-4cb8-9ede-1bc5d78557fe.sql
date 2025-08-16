
-- Créer la table des unités si elle n'existe pas déjà
CREATE TABLE IF NOT EXISTS public.unites_catalogue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR NOT NULL,
    abbreviation VARCHAR,
    description TEXT,
    statut VARCHAR DEFAULT 'actif',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ajouter la contrainte de clé étrangère si elle n'existe pas
ALTER TABLE public.catalogue 
ADD CONSTRAINT fk_catalogue_unite_id 
FOREIGN KEY (unite_id) REFERENCES public.unites_catalogue(id)
ON DELETE SET NULL;

-- Créer la table stock_principal si elle n'existe pas avec les bonnes colonnes
CREATE TABLE IF NOT EXISTS public.stock_principal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES public.catalogue(id),
    entrepot_id UUID REFERENCES public.entrepots(id),
    quantite_disponible INTEGER NOT NULL DEFAULT 0,
    derniere_entree TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Créer la table stock_pdv si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.stock_pdv (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES public.catalogue(id),
    point_vente_id UUID REFERENCES public.points_de_vente(id),
    quantite_disponible INTEGER NOT NULL DEFAULT 0,
    derniere_livraison TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insérer quelques unités de base si elles n'existent pas
INSERT INTO public.unites_catalogue (nom, abbreviation, description) VALUES
('Pièce', 'pcs', 'Unité individuelle'),
('Kilogramme', 'kg', 'Unité de poids'),
('Litre', 'L', 'Unité de volume'),
('Mètre', 'm', 'Unité de longueur'),
('Boîte', 'bte', 'Emballage boîte'),
('Carton', 'ctn', 'Emballage carton')
ON CONFLICT (nom) DO NOTHING;

-- Activer RLS avec des politiques permissives
ALTER TABLE public.unites_catalogue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_principal ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.stock_pdv ENABLE ROW LEVEL SECURITY;

-- Politiques permissives pour le développement
CREATE POLICY "DEV_unites_catalogue_full_access" ON public.unites_catalogue
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "DEV_stock_principal_full_access" ON public.stock_principal
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "DEV_stock_pdv_full_access" ON public.stock_pdv
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);
