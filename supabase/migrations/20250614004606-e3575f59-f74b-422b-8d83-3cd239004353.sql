
-- Ajouter la colonne point_vente_id si elle n'existe pas
ALTER TABLE public.entrees_stock 
ADD COLUMN IF NOT EXISTS point_vente_id UUID REFERENCES public.points_de_vente(id) ON DELETE CASCADE;

-- Ajouter une contrainte pour s'assurer qu'un seul type d'emplacement est renseigné
ALTER TABLE public.entrees_stock 
DROP CONSTRAINT IF EXISTS check_entrepot_or_pdv;

ALTER TABLE public.entrees_stock 
ADD CONSTRAINT check_entrepot_or_pdv CHECK (
  (entrepot_id IS NOT NULL AND point_vente_id IS NULL) OR 
  (entrepot_id IS NULL AND point_vente_id IS NOT NULL)
);

-- Mettre à jour le trigger pour gérer les entrées vers les points de vente
CREATE OR REPLACE FUNCTION public.update_stock_on_entree()
RETURNS TRIGGER AS $$
BEGIN
  -- Si c'est une entrée vers un entrepôt
  IF NEW.entrepot_id IS NOT NULL THEN
    UPDATE public.stock_principal 
    SET 
      quantite_disponible = quantite_disponible + NEW.quantite,
      derniere_entree = NEW.created_at,
      updated_at = now()
    WHERE article_id = NEW.article_id AND entrepot_id = NEW.entrepot_id;
    
    -- Si l'article n'existe pas dans le stock principal, l'ajouter
    IF NOT FOUND THEN
      INSERT INTO public.stock_principal (article_id, entrepot_id, quantite_disponible, derniere_entree)
      VALUES (NEW.article_id, NEW.entrepot_id, NEW.quantite, NEW.created_at);
    END IF;
  END IF;
  
  -- Si c'est une entrée vers un point de vente
  IF NEW.point_vente_id IS NOT NULL THEN
    UPDATE public.stock_pdv 
    SET 
      quantite_disponible = quantite_disponible + NEW.quantite,
      derniere_livraison = NEW.created_at,
      updated_at = now()
    WHERE article_id = NEW.article_id AND point_vente_id = NEW.point_vente_id;
    
    -- Si l'article n'existe pas dans le stock PDV, l'ajouter
    IF NOT FOUND THEN
      INSERT INTO public.stock_pdv (article_id, point_vente_id, quantite_disponible, derniere_livraison)
      VALUES (NEW.article_id, NEW.point_vente_id, NEW.quantite, NEW.created_at);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
