-- Ajouter une politique RLS plus permissive pour les articles de bons de livraison en développement
CREATE POLICY "Dev: Allow all operations on articles_bon_livraison"
ON public.articles_bon_livraison
FOR ALL
USING (true)
WITH CHECK (true);

-- Fonction pour synchroniser les articles lors de la génération d'un bon de livraison depuis un bon de commande
CREATE OR REPLACE FUNCTION sync_articles_bon_livraison()
RETURNS TRIGGER AS $$
BEGIN
  -- Si le bon de livraison a un bon_commande_id et qu'il n'y a pas encore d'articles associés
  IF NEW.bon_commande_id IS NOT NULL THEN
    -- Copier les articles du bon de commande vers le bon de livraison
    INSERT INTO public.articles_bon_livraison (
      bon_livraison_id,
      article_id,
      quantite_commandee,
      quantite_recue,
      prix_unitaire,
      montant_ligne,
      created_at,
      updated_at
    )
    SELECT 
      NEW.id as bon_livraison_id,
      abc.article_id,
      abc.quantite as quantite_commandee,
      0 as quantite_recue, -- Par défaut, rien n'est encore reçu
      abc.prix_unitaire,
      abc.montant_ligne,
      now() as created_at,
      now() as updated_at
    FROM public.articles_bon_commande abc
    WHERE abc.bon_commande_id = NEW.bon_commande_id
    AND NOT EXISTS (
      -- Éviter les doublons si des articles existent déjà
      SELECT 1 FROM public.articles_bon_livraison abl 
      WHERE abl.bon_livraison_id = NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour synchroniser automatiquement les articles
DROP TRIGGER IF EXISTS trigger_sync_articles_bon_livraison ON public.bons_de_livraison;
CREATE TRIGGER trigger_sync_articles_bon_livraison
  AFTER INSERT ON public.bons_de_livraison
  FOR EACH ROW
  EXECUTE FUNCTION sync_articles_bon_livraison();