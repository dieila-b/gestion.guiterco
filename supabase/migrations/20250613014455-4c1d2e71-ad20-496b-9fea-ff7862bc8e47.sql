
-- Créer la table articles_facture_achat pour lier les articles aux factures d'achat
CREATE TABLE public.articles_facture_achat (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  facture_achat_id UUID REFERENCES public.factures_achat(id) ON DELETE CASCADE,
  article_id UUID REFERENCES public.catalogue(id),
  quantite INTEGER NOT NULL DEFAULT 0,
  prix_unitaire NUMERIC(20,2) NOT NULL DEFAULT 0,
  montant_ligne NUMERIC(20,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ajouter des index pour améliorer les performances
CREATE INDEX idx_articles_facture_achat_facture_id ON public.articles_facture_achat(facture_achat_id);
CREATE INDEX idx_articles_facture_achat_article_id ON public.articles_facture_achat(article_id);

-- Ajouter un trigger pour mettre à jour updated_at
CREATE TRIGGER update_articles_facture_achat_updated_at 
  BEFORE UPDATE ON public.articles_facture_achat 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Modifier la fonction de génération automatique des factures pour inclure les articles
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

    -- Copier les articles du bon de livraison vers la facture d'achat
    INSERT INTO public.articles_facture_achat (
      facture_achat_id,
      article_id,
      quantite,
      prix_unitaire,
      montant_ligne
    )
    SELECT 
      fa.id,
      abl.article_id,
      abl.quantite_recue,
      abl.prix_unitaire,
      abl.quantite_recue * abl.prix_unitaire
    FROM public.factures_achat fa
    JOIN public.articles_bon_livraison abl ON abl.bon_livraison_id = NEW.id
    WHERE fa.bon_livraison_id = NEW.id
      AND fa.numero_facture = 'FA-' || REPLACE(NEW.numero_bon, 'BL-', '');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
