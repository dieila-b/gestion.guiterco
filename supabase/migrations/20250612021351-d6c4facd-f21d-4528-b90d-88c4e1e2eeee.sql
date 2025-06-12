
-- Créer la table articles_bon_livraison pour lier les articles aux bons de livraison
CREATE TABLE public.articles_bon_livraison (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bon_livraison_id UUID REFERENCES public.bons_de_livraison(id) ON DELETE CASCADE,
  article_id UUID REFERENCES public.catalogue(id),
  quantite_commandee INTEGER NOT NULL DEFAULT 0,
  quantite_recue INTEGER DEFAULT 0,
  prix_unitaire NUMERIC(20,2) NOT NULL DEFAULT 0,
  montant_ligne NUMERIC(20,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ajouter un champ pour l'entrepôt/point de vente de destination
ALTER TABLE public.bons_de_livraison 
ADD COLUMN entrepot_destination_id UUID REFERENCES public.entrepots(id),
ADD COLUMN point_vente_destination_id UUID REFERENCES public.points_de_vente(id);

-- Ajouter des index pour améliorer les performances
CREATE INDEX idx_articles_bon_livraison_bon_id ON public.articles_bon_livraison(bon_livraison_id);
CREATE INDEX idx_articles_bon_livraison_article_id ON public.articles_bon_livraison(article_id);

-- Ajouter un trigger pour mettre à jour updated_at
CREATE TRIGGER update_articles_bon_livraison_updated_at 
  BEFORE UPDATE ON public.articles_bon_livraison 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
