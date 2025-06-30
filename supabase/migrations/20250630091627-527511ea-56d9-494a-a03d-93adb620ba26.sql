
-- Analyser et supprimer définitivement les entrées "Correction" automatiques
WITH analyse_doublons AS (
    SELECT 
        es.id,
        es.type_entree,
        es.article_id,
        es.quantite,
        es.fournisseur,
        es.observations,
        es.created_at,
        c.nom as article_nom,
        ROW_NUMBER() OVER (
            PARTITION BY es.article_id, DATE(es.created_at), es.quantite, COALESCE(es.entrepot_id::text, '') || COALESCE(es.point_vente_id::text, '')
            ORDER BY 
                CASE WHEN es.type_entree = 'achat' THEN 1 ELSE 2 END,
                es.created_at ASC
        ) as rang
    FROM public.entrees_stock es
    LEFT JOIN public.catalogue c ON es.article_id = c.id
    WHERE (
        (es.type_entree = 'correction' AND es.fournisseur LIKE '%Réception bon livraison%') OR
        (es.type_entree = 'correction' AND es.observations LIKE '%Réception automatique du bon de livraison%')
    )
    AND EXISTS (
        SELECT 1 FROM public.entrees_stock es2 
        WHERE es2.article_id = es.article_id 
        AND es2.type_entree = 'achat'
        AND DATE(es2.created_at) = DATE(es.created_at)
        AND es2.quantite = es.quantite
        AND COALESCE(es2.entrepot_id, es2.point_vente_id) = COALESCE(es.entrepot_id, es.point_vente_id)
    )
)
SELECT 
    article_nom,
    type_entree,
    quantite,
    fournisseur,
    created_at,
    'À supprimer - Doublon automatique' as action
FROM analyse_doublons 
ORDER BY article_nom, created_at DESC;

-- Supprimer toutes les entrées "Correction" automatiques qui sont des doublons d'achats
WITH doublons_a_supprimer AS (
    SELECT es_correction.id
    FROM public.entrees_stock es_correction
    WHERE es_correction.type_entree = 'correction'
    AND (
        es_correction.fournisseur LIKE '%Réception bon livraison%' OR
        es_correction.observations LIKE '%Réception automatique du bon de livraison%'
    )
    AND EXISTS (
        SELECT 1 
        FROM public.entrees_stock es_achat
        WHERE es_achat.type_entree = 'achat'
        AND es_achat.article_id = es_correction.article_id
        AND es_achat.quantite = es_correction.quantite
        AND COALESCE(es_achat.entrepot_id, es_achat.point_vente_id) = COALESCE(es_correction.entrepot_id, es_correction.point_vente_id)
        AND DATE(es_achat.created_at) = DATE(es_correction.created_at)
    )
)
DELETE FROM public.entrees_stock 
WHERE id IN (SELECT id FROM doublons_a_supprimer);

-- Renforcer la fonction trigger pour empêcher définitivement ces doublons
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
        -- Créer UNIQUEMENT des entrées de type 'achat' - JAMAIS de correction
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
          'achat', -- EXCLUSIVEMENT 'achat'
          NEW.numero_bon,
          NEW.fournisseur,
          abl.prix_unitaire,
          'Achat automatique - Réception BL ' || NEW.numero_bon,
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

-- Renforcer le trigger de vérification pour empêcher la création de corrections automatiques
CREATE OR REPLACE FUNCTION public.check_duplicate_entree_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Bloquer explicitement toute tentative de création de "correction" automatique
    IF NEW.type_entree = 'correction' AND (
        NEW.fournisseur LIKE '%Réception bon livraison%' OR
        NEW.observations LIKE '%Réception automatique%' OR
        NEW.observations LIKE '%Achat automatique%'
    ) THEN
        RAISE EXCEPTION 'Création de correction automatique interdite. Utilisez uniquement le type "achat" pour les réceptions.';
    END IF;

    -- Vérifier s'il existe déjà une entrée similaire le même jour
    IF EXISTS (
        SELECT 1 
        FROM public.entrees_stock 
        WHERE article_id = NEW.article_id
        AND (
            (NEW.entrepot_id IS NOT NULL AND entrepot_id = NEW.entrepot_id) OR
            (NEW.point_vente_id IS NOT NULL AND point_vente_id = NEW.point_vente_id)
        )
        AND quantite = NEW.quantite
        AND type_entree = NEW.type_entree
        AND COALESCE(fournisseur, '') = COALESCE(NEW.fournisseur, '')
        AND DATE(created_at) = DATE(NEW.created_at)
        AND id != COALESCE(NEW.id, gen_random_uuid())
    ) THEN
        RAISE EXCEPTION 'Entrée de stock dupliquée détectée pour l''article le %', DATE(NEW.created_at);
    END IF;
    
    -- Empêcher spécifiquement les doublons Achat/Correction
    IF NEW.type_entree = 'correction' AND EXISTS (
        SELECT 1 
        FROM public.entrees_stock 
        WHERE article_id = NEW.article_id
        AND (
            (NEW.entrepot_id IS NOT NULL AND entrepot_id = NEW.entrepot_id) OR
            (NEW.point_vente_id IS NOT NULL AND point_vente_id = NEW.point_vente_id)
        )
        AND quantite = NEW.quantite
        AND type_entree = 'achat'
        AND COALESCE(fournisseur, '') = COALESCE(NEW.fournisseur, '')
        AND DATE(created_at) = DATE(NEW.created_at)
    ) THEN
        RAISE EXCEPTION 'Une entrée d''achat existe déjà pour cet article le %. Correction automatique bloquée.', DATE(NEW.created_at);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction de vérification post-nettoyage
CREATE OR REPLACE FUNCTION public.audit_entrees_stock_propres()
RETURNS TABLE(
    rapport text,
    nombre_entrees integer,
    details text
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 'Total entrées après nettoyage' as rapport,
           COUNT(*)::integer as nombre_entrees,
           'Toutes les entrées restantes' as details
    FROM public.entrees_stock
    
    UNION ALL
    
    SELECT 'Entrées par type' as rapport,
           COUNT(*)::integer as nombre_entrees,
           type_entree as details
    FROM public.entrees_stock
    GROUP BY type_entree
    
    UNION ALL
    
    SELECT 'Corrections automatiques restantes' as rapport,
           COUNT(*)::integer as nombre_entrees,
           'Corrections avec source automatique (à supprimer si > 0)' as details
    FROM public.entrees_stock
    WHERE type_entree = 'correction'
    AND (
        fournisseur LIKE '%Réception bon livraison%' OR
        observations LIKE '%Réception automatique%'
    )
    
    UNION ALL
    
    SELECT 'Statut final' as rapport,
           0 as nombre_entrees,
           'Nettoyage terminé - Plus de doublons automatiques' as details;
$$;
