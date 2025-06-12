
-- Ajouter le champ updated_at manquant à la table articles_bon_livraison
ALTER TABLE public.articles_bon_livraison 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- Créer le trigger pour mettre à jour updated_at automatiquement
DROP TRIGGER IF EXISTS update_articles_bon_livraison_updated_at ON public.articles_bon_livraison;
CREATE TRIGGER update_articles_bon_livraison_updated_at 
  BEFORE UPDATE ON public.articles_bon_livraison 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- S'assurer que les triggers pour la mise à jour du stock sont bien en place
DROP TRIGGER IF EXISTS trigger_update_stock_on_entree ON public.entrees_stock;
CREATE TRIGGER trigger_update_stock_on_entree
  AFTER INSERT ON public.entrees_stock
  FOR EACH ROW EXECUTE FUNCTION public.update_stock_on_entree();

-- Vérifier et créer un trigger pour la mise à jour du stock lors de la réception
CREATE OR REPLACE FUNCTION public.update_stock_on_reception()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer une entrée de stock automatiquement lors de la réception
  INSERT INTO public.entrees_stock (
    article_id,
    entrepot_id,
    quantite,
    type_entree,
    numero_bon,
    fournisseur,
    prix_unitaire,
    observations,
    created_by
  )
  SELECT 
    abl.article_id,
    bl.entrepot_destination_id,
    NEW.quantite_recue,
    'achat',
    bl.numero_bon,
    bl.fournisseur,
    abl.prix_unitaire,
    'Réception automatique du bon de livraison ' || bl.numero_bon,
    bl.created_by
  FROM public.articles_bon_livraison abl
  JOIN public.bons_de_livraison bl ON bl.id = abl.bon_livraison_id
  WHERE abl.id = NEW.id
    AND NEW.quantite_recue > 0
    AND bl.entrepot_destination_id IS NOT NULL;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour la réception automatique
DROP TRIGGER IF EXISTS trigger_auto_stock_reception ON public.articles_bon_livraison;
CREATE TRIGGER trigger_auto_stock_reception
  AFTER UPDATE OF quantite_recue ON public.articles_bon_livraison
  FOR EACH ROW 
  WHEN (NEW.quantite_recue IS DISTINCT FROM OLD.quantite_recue AND NEW.quantite_recue > 0)
  EXECUTE FUNCTION public.update_stock_on_reception();
