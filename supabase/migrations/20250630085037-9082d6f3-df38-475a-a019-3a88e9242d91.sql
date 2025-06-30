
-- Analyser les entrées récentes pour identifier la source des doublons
SELECT 
    es.type_entree,
    es.created_at,
    es.numero_bon,
    es.fournisseur,
    es.observations,
    c.nom as article_nom,
    es.quantite,
    COALESCE(e.nom, pdv.nom) as emplacement
FROM public.entrees_stock es
LEFT JOIN public.catalogue c ON es.article_id = c.id
LEFT JOIN public.entrepots e ON es.entrepot_id = e.id
LEFT JOIN public.points_de_vente pdv ON es.point_vente_id = pdv.id
WHERE es.created_at >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY es.article_id, es.created_at DESC;

-- Corriger la fonction handle_bon_livraison_approval pour éviter les doublons
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
        -- Créer UNIQUEMENT des entrées de type 'achat' (pas de correction)
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
          'achat', -- TOUJOURS 'achat', jamais 'correction'
          NEW.numero_bon,
          NEW.fournisseur,
          abl.prix_unitaire,
          'Réception automatique du bon de livraison ' || NEW.numero_bon,
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

-- Nettoyer les doublons récents créés par le processus automatique
WITH doublons_recents AS (
    SELECT es_correction.id
    FROM public.entrees_stock es_correction
    WHERE es_correction.type_entree = 'correction'
    AND es_correction.created_at >= CURRENT_DATE - INTERVAL '7 days'
    AND es_correction.observations LIKE '%Réception automatique du bon de livraison%'
    AND EXISTS (
        SELECT 1 
        FROM public.entrees_stock es_achat
        WHERE es_achat.type_entree = 'achat'
        AND es_achat.article_id = es_correction.article_id
        AND es_achat.numero_bon = es_correction.numero_bon
        AND es_achat.quantite = es_correction.quantite
        AND COALESCE(es_achat.entrepot_id, es_achat.point_vente_id) = COALESCE(es_correction.entrepot_id, es_correction.point_vente_id)
        AND DATE(es_achat.created_at) = DATE(es_correction.created_at)
    )
)
DELETE FROM public.entrees_stock 
WHERE id IN (SELECT id FROM doublons_recents);

-- Fonction pour vérifier l'intégrité des données après correction
CREATE OR REPLACE FUNCTION public.verifier_integrite_entrees_stock()
RETURNS TABLE(
    article_nom text,
    nombre_entrees bigint,
    types_entrees text,
    total_quantite bigint,
    statut_verification text
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        c.nom as article_nom,
        COUNT(es.id) as nombre_entrees,
        STRING_AGG(DISTINCT es.type_entree, ', ' ORDER BY es.type_entree) as types_entrees,
        SUM(es.quantite) as total_quantite,
        CASE 
            WHEN COUNT(es.id) = COUNT(DISTINCT es.type_entree || es.numero_bon || es.article_id::text || DATE(es.created_at)::text) 
            THEN 'OK - Pas de doublons détectés'
            ELSE 'ATTENTION - Doublons potentiels détectés'
        END as statut_verification
    FROM public.catalogue c
    LEFT JOIN public.entrees_stock es ON c.id = es.article_id
    WHERE es.created_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY c.id, c.nom
    HAVING COUNT(es.id) > 0
    ORDER BY nombre_entrees DESC;
$$;
