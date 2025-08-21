-- Optimisation des performances : suppression des triggers problématiques et recréation optimisée
-- Désactiver temporairement certains triggers pour améliorer les performances

-- Supprimer les anciens triggers qui causent des lenteurs
DROP TRIGGER IF EXISTS update_stock_on_entree_trigger ON public.entrees_stock;
DROP TRIGGER IF EXISTS process_precommandes_on_stock_entry_trigger ON public.entrees_stock;
DROP TRIGGER IF EXISTS check_duplicate_entree_stock_trigger ON public.entrees_stock;
DROP TRIGGER IF EXISTS update_stock_on_reception_trigger ON public.articles_bon_livraison;

-- Créer des index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_catalogue_statut ON public.catalogue(statut);
CREATE INDEX IF NOT EXISTS idx_catalogue_nom ON public.catalogue(nom);
CREATE INDEX IF NOT EXISTS idx_catalogue_reference ON public.catalogue(reference);
CREATE INDEX IF NOT EXISTS idx_stock_principal_article ON public.stock_principal(article_id);
CREATE INDEX IF NOT EXISTS idx_stock_principal_entrepot ON public.stock_principal(entrepot_id);
CREATE INDEX IF NOT EXISTS idx_stock_pdv_article ON public.stock_pdv(article_id);
CREATE INDEX IF NOT EXISTS idx_stock_pdv_point_vente ON public.stock_pdv(point_vente_id);
CREATE INDEX IF NOT EXISTS idx_entrees_stock_article ON public.entrees_stock(article_id);
CREATE INDEX IF NOT EXISTS idx_entrees_stock_entrepot ON public.entrees_stock(entrepot_id);
CREATE INDEX IF NOT EXISTS idx_clients_nom ON public.clients(nom);
CREATE INDEX IF NOT EXISTS idx_factures_vente_client ON public.factures_vente(client_id);
CREATE INDEX IF NOT EXISTS idx_factures_vente_date ON public.factures_vente(date_facture);

-- Recreer un trigger simplifié pour les entrées de stock
CREATE OR REPLACE FUNCTION public.update_stock_simple()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Mise à jour simple du stock principal
  IF NEW.entrepot_id IS NOT NULL THEN
    UPDATE public.stock_principal 
    SET 
      quantite_disponible = quantite_disponible + NEW.quantite,
      derniere_entree = NEW.created_at,
      updated_at = now()
    WHERE article_id = NEW.article_id AND entrepot_id = NEW.entrepot_id;
    
    -- Créer l'entrée si elle n'existe pas
    IF NOT FOUND THEN
      INSERT INTO public.stock_principal (article_id, entrepot_id, quantite_disponible, derniere_entree)
      VALUES (NEW.article_id, NEW.entrepot_id, NEW.quantite, NEW.created_at);
    END IF;
  END IF;
  
  -- Mise à jour simple du stock PDV
  IF NEW.point_vente_id IS NOT NULL THEN
    UPDATE public.stock_pdv 
    SET 
      quantite_disponible = quantite_disponible + NEW.quantite,
      derniere_livraison = NEW.created_at,
      updated_at = now()
    WHERE article_id = NEW.article_id AND point_vente_id = NEW.point_vente_id;
    
    -- Créer l'entrée si elle n'existe pas
    IF NOT FOUND THEN
      INSERT INTO public.stock_pdv (article_id, point_vente_id, quantite_disponible, derniere_livraison)
      VALUES (NEW.article_id, NEW.point_vente_id, NEW.quantite, NEW.created_at);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Créer le nouveau trigger simplifié
CREATE TRIGGER update_stock_simple_trigger
  AFTER INSERT ON public.entrees_stock
  FOR EACH ROW
  EXECUTE FUNCTION public.update_stock_simple();

-- Optimiser la table unites si elle n'a pas les bonnes colonnes
ALTER TABLE public.unites ADD COLUMN IF NOT EXISTS type_unite VARCHAR;
ALTER TABLE public.unites ADD COLUMN IF NOT EXISTS statut VARCHAR DEFAULT 'actif';

-- Insérer les unités de base si elles n'existent pas
INSERT INTO public.unites (nom, symbole, type_unite, statut) 
VALUES 
  ('Unité', 'U', 'quantite', 'actif'),
  ('Kilogramme', 'kg', 'poids', 'actif'),
  ('Gramme', 'g', 'poids', 'actif'),
  ('Litre', 'L', 'volume', 'actif'),
  ('Mètre', 'm', 'longueur', 'actif'),
  ('Centimètre', 'cm', 'longueur', 'actif'),
  ('Pièce', 'pcs', 'quantite', 'actif')
ON CONFLICT (nom) DO NOTHING;