
-- Supprimer TOUTES les entrées de type "Correction" automatiques existantes
DELETE FROM public.entrees_stock 
WHERE type_entree = 'correction' 
AND (
    fournisseur LIKE '%Réception bon livraison%' OR
    fournisseur LIKE '%Réception bon%' OR
    observations LIKE '%Réception automatique%' OR
    observations LIKE '%Achat automatique%' OR
    observations LIKE '%bon de livraison%'
);

-- Supprimer également les corrections avec des numéros de bon de type BL-
DELETE FROM public.entrees_stock 
WHERE type_entree = 'correction' 
AND numero_bon LIKE 'BL-%';

-- Mettre à jour la fonction trigger pour être plus stricte
CREATE OR REPLACE FUNCTION public.handle_bon_livraison_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour le stock uniquement si le statut passe à 'receptionne' ou 'livre'
  IF NEW.statut IN ('receptionne', 'livre') AND OLD.statut != NEW.statut THEN
    
    -- Vérifier qu'il n'y a pas déjà des entrées de stock pour ce bon de livraison
    IF NOT EXISTS (
        SELECT 1 FROM public.entrees_stock 
        WHERE numero_bon = NEW.numero_bon 
        AND type_entree = 'achat'
        AND DATE(created_at) = CURRENT_DATE
    ) THEN
        -- Créer UNIQUEMENT des entrées de type 'achat' - JAMAIS autre chose
        INSERT INTO public.entrees_stock (
          article_id,
          entrepot_id,
          point_vente_id,
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
          NEW.entrepot_destination_id,
          NEW.point_vente_destination_id,
          abl.quantite_recue,
          'achat', -- EXCLUSIVEMENT 'achat' - JAMAIS 'correction'
          NEW.numero_bon,
          NEW.fournisseur, -- Utiliser le vrai fournisseur du bon
          abl.prix_unitaire,
          'Achat automatique suite à réception BL ' || NEW.numero_bon,
          NEW.created_by
        FROM public.articles_bon_livraison abl
        WHERE abl.bon_livraison_id = NEW.id
          AND abl.quantite_recue > 0
          AND (NEW.entrepot_destination_id IS NOT NULL OR NEW.point_vente_destination_id IS NOT NULL);
    END IF;

    -- Générer automatiquement une facture d'achat (si elle n'existe pas déjà)
    IF NOT EXISTS (
        SELECT 1 FROM public.factures_achat 
        WHERE bon_livraison_id = NEW.id
    ) THEN
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
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer un trigger ultra-strict pour empêcher les corrections automatiques
DROP TRIGGER IF EXISTS prevent_automatic_corrections ON public.entrees_stock;

CREATE OR REPLACE FUNCTION public.prevent_automatic_corrections()
RETURNS TRIGGER AS $$
BEGIN
    -- Bloquer TOUTE tentative de création de correction automatique
    IF NEW.type_entree = 'correction' AND (
        NEW.fournisseur LIKE '%Réception%' OR
        NEW.fournisseur LIKE '%bon%' OR
        NEW.observations LIKE '%automatique%' OR
        NEW.observations LIKE '%Réception%' OR
        NEW.observations LIKE '%BL%' OR
        NEW.numero_bon LIKE 'BL-%'
    ) THEN
        RAISE EXCEPTION 'CRÉATION DE CORRECTION AUTOMATIQUE INTERDITE - Utilisez uniquement le type "achat" pour les réceptions de bons de livraison';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_automatic_corrections
    BEFORE INSERT ON public.entrees_stock
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_automatic_corrections();

-- Fonction de vérification finale
CREATE OR REPLACE FUNCTION public.verifier_nettoyage_corrections()
RETURNS TABLE(
    type_verification text,
    nombre integer,
    statut text
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 'Corrections automatiques restantes' as type_verification,
           COUNT(*)::integer as nombre,
           CASE WHEN COUNT(*) = 0 THEN '✅ NETTOYAGE RÉUSSI' ELSE '❌ CORRECTIONS RESTANTES' END as statut
    FROM public.entrees_stock
    WHERE type_entree = 'correction'
    AND (
        fournisseur LIKE '%Réception%' OR
        fournisseur LIKE '%bon%' OR
        observations LIKE '%automatique%' OR
        numero_bon LIKE 'BL-%'
    )
    
    UNION ALL
    
    SELECT 'Total entrées Achat' as type_verification,
           COUNT(*)::integer as nombre,
           '✅ ENTRÉES VALIDES' as statut
    FROM public.entrees_stock
    WHERE type_entree = 'achat'
    
    UNION ALL
    
    SELECT 'Total entrées Correction manuelles' as type_verification,
           COUNT(*)::integer as nombre,
           '✅ CORRECTIONS MANUELLES AUTORISÉES' as statut
    FROM public.entrees_stock
    WHERE type_entree = 'correction'
    AND NOT (
        fournisseur LIKE '%Réception%' OR
        fournisseur LIKE '%bon%' OR
        observations LIKE '%automatique%' OR
        numero_bon LIKE 'BL-%'
    );
$$;

-- Exécuter la vérification
SELECT * FROM public.verifier_nettoyage_corrections();
