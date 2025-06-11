
-- Table des entrepôts
CREATE TABLE public.entrepots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  adresse TEXT,
  capacite_max INTEGER,
  gestionnaire VARCHAR(255),
  statut VARCHAR(50) DEFAULT 'actif',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des points de vente
CREATE TABLE public.points_de_vente (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  adresse TEXT,
  type_pdv VARCHAR(100),
  responsable VARCHAR(255),
  statut VARCHAR(50) DEFAULT 'actif',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table du catalogue des articles
CREATE TABLE public.catalogue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reference VARCHAR(100) UNIQUE NOT NULL,
  nom VARCHAR(255) NOT NULL,
  description TEXT,
  categorie VARCHAR(100),
  unite_mesure VARCHAR(50),
  prix_unitaire DECIMAL(10,2),
  seuil_alerte INTEGER DEFAULT 10,
  statut VARCHAR(50) DEFAULT 'actif',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table du stock principal (entrepôt)
CREATE TABLE public.stock_principal (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.catalogue(id) ON DELETE CASCADE,
  entrepot_id UUID REFERENCES public.entrepots(id) ON DELETE CASCADE,
  quantite_disponible INTEGER NOT NULL DEFAULT 0,
  quantite_reservee INTEGER NOT NULL DEFAULT 0,
  emplacement VARCHAR(100),
  derniere_entree TIMESTAMP WITH TIME ZONE,
  derniere_sortie TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(article_id, entrepot_id)
);

-- Table du stock PDV
CREATE TABLE public.stock_pdv (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.catalogue(id) ON DELETE CASCADE,
  point_vente_id UUID REFERENCES public.points_de_vente(id) ON DELETE CASCADE,
  quantite_disponible INTEGER NOT NULL DEFAULT 0,
  quantite_minimum INTEGER DEFAULT 5,
  derniere_livraison TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(article_id, point_vente_id)
);

-- Table des entrées de stock
CREATE TABLE public.entrees_stock (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.catalogue(id) ON DELETE CASCADE,
  entrepot_id UUID REFERENCES public.entrepots(id) ON DELETE CASCADE,
  quantite INTEGER NOT NULL,
  type_entree VARCHAR(50) NOT NULL, -- 'achat', 'retour', 'transfert', 'correction'
  numero_bon VARCHAR(100),
  fournisseur VARCHAR(255),
  prix_unitaire DECIMAL(10,2),
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by VARCHAR(255) -- Utilisateur qui a créé l'entrée
);

-- Table des sorties de stock
CREATE TABLE public.sorties_stock (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.catalogue(id) ON DELETE CASCADE,
  entrepot_id UUID REFERENCES public.entrepots(id) ON DELETE CASCADE,
  quantite INTEGER NOT NULL,
  type_sortie VARCHAR(50) NOT NULL, -- 'vente', 'transfert', 'perte', 'correction'
  destination VARCHAR(255), -- Point de vente ou autre destination
  numero_bon VARCHAR(100),
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by VARCHAR(255) -- Utilisateur qui a créé la sortie
);

-- Table des transferts entre entrepôts/PDV
CREATE TABLE public.transferts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.catalogue(id) ON DELETE CASCADE,
  entrepot_source_id UUID REFERENCES public.entrepots(id),
  entrepot_destination_id UUID REFERENCES public.entrepots(id),
  pdv_destination_id UUID REFERENCES public.points_de_vente(id),
  quantite INTEGER NOT NULL,
  statut VARCHAR(50) DEFAULT 'en_cours', -- 'en_cours', 'expedie', 'recu', 'annule'
  numero_transfert VARCHAR(100),
  date_expedition TIMESTAMP WITH TIME ZONE,
  date_reception TIMESTAMP WITH TIME ZONE,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by VARCHAR(255)
);

-- Trigger pour mettre à jour les stocks lors des entrées
CREATE OR REPLACE FUNCTION update_stock_on_entree()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.stock_principal 
  SET 
    quantite_disponible = quantite_disponible + NEW.quantite,
    derniere_entree = NEW.created_at,
    updated_at = now()
  WHERE article_id = NEW.article_id AND entrepot_id = NEW.entrepot_id;
  
  -- Si l'article n'existe pas dans le stock, l'ajouter
  IF NOT FOUND THEN
    INSERT INTO public.stock_principal (article_id, entrepot_id, quantite_disponible, derniere_entree)
    VALUES (NEW.article_id, NEW.entrepot_id, NEW.quantite, NEW.created_at);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stock_on_entree
  AFTER INSERT ON public.entrees_stock
  FOR EACH ROW
  EXECUTE FUNCTION update_stock_on_entree();

-- Trigger pour mettre à jour les stocks lors des sorties
CREATE OR REPLACE FUNCTION update_stock_on_sortie()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.stock_principal 
  SET 
    quantite_disponible = GREATEST(0, quantite_disponible - NEW.quantite),
    derniere_sortie = NEW.created_at,
    updated_at = now()
  WHERE article_id = NEW.article_id AND entrepot_id = NEW.entrepot_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stock_on_sortie
  AFTER INSERT ON public.sorties_stock
  FOR EACH ROW
  EXECUTE FUNCTION update_stock_on_sortie();

-- Activer RLS sur toutes les tables
ALTER TABLE public.entrepots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_de_vente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_principal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_pdv ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entrees_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sorties_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transferts ENABLE ROW LEVEL SECURITY;

-- Créer des politiques RLS basiques (accès public pour l'instant)
CREATE POLICY "Enable read access for all users" ON public.entrepots FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.entrepots FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.entrepots FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.entrepots FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.points_de_vente FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.points_de_vente FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.points_de_vente FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.points_de_vente FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.catalogue FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.catalogue FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.catalogue FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.catalogue FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.stock_principal FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.stock_principal FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.stock_principal FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.stock_principal FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.stock_pdv FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.stock_pdv FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.stock_pdv FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.stock_pdv FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.entrees_stock FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.entrees_stock FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.entrees_stock FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.entrees_stock FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.sorties_stock FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.sorties_stock FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.sorties_stock FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.sorties_stock FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.transferts FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.transferts FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.transferts FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.transferts FOR DELETE USING (true);
