-- Vérifier et corriger les factures d'achat manquantes

-- 1. Créer les factures d'achat manquantes pour les bons de livraison réceptionnés
INSERT INTO public.factures_achat (
    numero_facture,
    bon_livraison_id,
    bon_commande_id,
    fournisseur,
    date_facture,
    montant_ht,
    tva,
    montant_ttc,
    transit_douane,
    taux_tva,
    statut_paiement,
    observations,
    created_by,
    created_at,
    updated_at
)
SELECT 
    'FA-' || REPLACE(bl.numero_bon, 'BL-', '') as numero_facture,
    bl.id as bon_livraison_id,
    bl.bon_commande_id,
    bl.fournisseur,
    bl.date_livraison as date_facture,
    COALESCE(bc.montant_ht, 0) as montant_ht,
    COALESCE(bc.tva, 0) as tva,
    COALESCE(bc.montant_total, 0) as montant_ttc,
    bl.transit_douane,
    bl.taux_tva,
    'en_attente' as statut_paiement,
    'Facture générée automatiquement suite à réception BL ' || bl.numero_bon as observations,
    bl.created_by,
    bl.created_at,
    bl.updated_at
FROM public.bons_de_livraison bl
LEFT JOIN public.bons_de_commande bc ON bl.bon_commande_id = bc.id
WHERE bl.statut IN ('receptionne', 'livre')
AND NOT EXISTS (
    SELECT 1 FROM public.factures_achat fa 
    WHERE fa.bon_livraison_id = bl.id
);

-- 2. Créer les articles de factures d'achat basés sur les articles des bons de livraison
INSERT INTO public.articles_facture_achat (
    facture_achat_id,
    article_id,
    quantite,
    prix_unitaire,
    montant_ligne,
    created_at
)
SELECT 
    fa.id as facture_achat_id,
    abl.article_id,
    abl.quantite_recue as quantite,
    abl.prix_unitaire,
    abl.montant_ligne,
    fa.created_at
FROM public.factures_achat fa
JOIN public.bons_de_livraison bl ON fa.bon_livraison_id = bl.id
JOIN public.articles_bon_livraison abl ON bl.id = abl.bon_livraison_id
WHERE NOT EXISTS (
    SELECT 1 FROM public.articles_facture_achat afa 
    WHERE afa.facture_achat_id = fa.id 
    AND afa.article_id = abl.article_id
);

-- 3. Mettre à jour le trigger pour s'assurer qu'il fonctionne correctement
CREATE OR REPLACE FUNCTION public.handle_bon_livraison_approval()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  -- Mettre à jour le stock uniquement si le statut passe à 'receptionne' ou 'livre'
  IF NEW.statut IN ('receptionne', 'livre') AND OLD.statut != NEW.statut THEN
    
    -- Créer UNIQUEMENT des entrées de type 'achat' pour le stock
    IF NOT EXISTS (
        SELECT 1 FROM public.entrees_stock 
        WHERE numero_bon = NEW.numero_bon 
        AND type_entree = 'achat'
        AND DATE(created_at) = CURRENT_DATE
    ) THEN
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
          'achat',
          NEW.numero_bon,
          NEW.fournisseur,
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
          bon_commande_id,
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
          NEW.bon_commande_id,
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
        
        -- Créer les articles de la facture basés sur le bon de livraison
        INSERT INTO public.articles_facture_achat (
            facture_achat_id,
            article_id,
            quantite,
            prix_unitaire,
            montant_ligne
        )
        SELECT 
            (SELECT id FROM public.factures_achat WHERE bon_livraison_id = NEW.id),
            abl.article_id,
            abl.quantite_recue,
            abl.prix_unitaire,
            abl.montant_ligne
        FROM public.articles_bon_livraison abl
        WHERE abl.bon_livraison_id = NEW.id
        AND abl.quantite_recue > 0;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;