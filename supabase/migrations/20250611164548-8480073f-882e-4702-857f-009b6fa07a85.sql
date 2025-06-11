
-- Créer la table des catégories
CREATE TABLE public.categories_catalogue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom VARCHAR NOT NULL,
  description TEXT,
  couleur VARCHAR(7) DEFAULT '#6366f1',
  statut VARCHAR DEFAULT 'actif',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table des unités
CREATE TABLE public.unites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom VARCHAR NOT NULL,
  symbole VARCHAR(10) NOT NULL,
  type_unite VARCHAR DEFAULT 'quantite',
  statut VARCHAR DEFAULT 'actif',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ajouter des données de base pour les catégories
INSERT INTO public.categories_catalogue (nom, description, couleur) VALUES
('Biscuits', 'Produits de biscuiterie', '#8b5cf6'),
('Boissons', 'Boissons diverses', '#06b6d4'),
('Produits laitiers', 'Lait et dérivés', '#f59e0b'),
('Fruits et légumes', 'Produits frais', '#10b981');

-- Ajouter des données de base pour les unités
INSERT INTO public.unites (nom, symbole, type_unite) VALUES
('Pièce', 'pcs', 'quantite'),
('Kilogramme', 'kg', 'poids'),
('Litre', 'L', 'volume'),
('Mètre', 'm', 'longueur'),
('Carton', 'ctn', 'emballage'),
('Gramme', 'g', 'poids'),
('Centilitre', 'cl', 'volume');

-- Ajouter des clés étrangères pour lier les produits aux catégories et unités
ALTER TABLE public.catalogue 
ADD COLUMN categorie_id UUID REFERENCES public.categories_catalogue(id),
ADD COLUMN unite_id UUID REFERENCES public.unites(id);

-- Créer des index pour améliorer les performances
CREATE INDEX idx_catalogue_categorie_id ON public.catalogue(categorie_id);
CREATE INDEX idx_catalogue_unite_id ON public.catalogue(unite_id);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_catalogue_updated_at 
  BEFORE UPDATE ON public.categories_catalogue 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_unites_updated_at 
  BEFORE UPDATE ON public.unites 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
