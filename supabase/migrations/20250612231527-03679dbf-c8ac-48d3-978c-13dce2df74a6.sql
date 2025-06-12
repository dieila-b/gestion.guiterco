
-- Corriger la fonction trigger avec les bonnes échappements de guillemets
CREATE OR REPLACE FUNCTION public.handle_bon_livraison_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour le stock uniquement si le statut passe à 'receptionne' ou 'livre'
  IF NEW.statut IN ('receptionne', 'livre') AND OLD.statut != NEW.statut THEN
    -- Mettre à jour le stock pour chaque article du bon de livraison
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
      COALESCE(NEW.entrepot_destination_id, NEW.point_vente_destination_id),
      abl.quantite_recue,
      'achat',
      NEW.numero_bon,
      NEW.fournisseur,
      abl.prix_unitaire,
      'Réception automatique du bon de livraison ' || NEW.numero_bon,
      NEW.created_by
    FROM public.articles_bon_livraison abl
    WHERE abl.bon_livraison_id = NEW.id
      AND abl.quantite_recue > 0
      AND (NEW.entrepot_destination_id IS NOT NULL OR NEW.point_vente_destination_id IS NOT NULL);

    -- Générer automatiquement une facture d'achat
    INSERT INTO public.factures_achat (
      numero_facture,
      bon_livraison_id,
      fournisseur,
      date_facture,
      montant_ht,
      tva,
      montant_ttc,
      transit_douane,
      taux_tva,
      statut_paiement,
      observations,
      created_by
    )
    SELECT 
      'FA-' || REPLACE(NEW.numero_bon, 'BL-', ''),
      NEW.id,
      NEW.fournisseur,
      NEW.date_livraison,
      COALESCE(bc.montant_ht, 0),
      COALESCE(bc.tva, 0),
      COALESCE(bc.montant_total, 0),
      NEW.transit_douane,
      NEW.taux_tva,
      'en_attente',
      'Facture générée automatiquement lors de l''approbation du BL ' || NEW.numero_bon,
      NEW.created_by
    FROM public.bons_de_commande bc
    WHERE bc.id = NEW.bon_commande_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_bon_livraison_approval ON public.bons_de_livraison;
CREATE TRIGGER trigger_bon_livraison_approval
  AFTER UPDATE ON public.bons_de_livraison
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_bon_livraison_approval();

-- S'assurer que les contraintes de clés étrangères existent
ALTER TABLE public.bons_de_livraison 
DROP CONSTRAINT IF EXISTS fk_bons_livraison_entrepot_destination;

ALTER TABLE public.bons_de_livraison 
ADD CONSTRAINT fk_bons_livraison_entrepot_destination 
FOREIGN KEY (entrepot_destination_id) REFERENCES public.entrepots(id) ON DELETE SET NULL;

ALTER TABLE public.bons_de_livraison 
DROP CONSTRAINT IF EXISTS fk_bons_livraison_point_vente_destination;

ALTER TABLE public.bons_de_livraison 
ADD CONSTRAINT fk_bons_livraison_point_vente_destination 
FOREIGN KEY (point_vente_destination_id) REFERENCES public.points_de_vente(id) ON DELETE SET NULL;
