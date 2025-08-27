-- Synchronisation complète des données factures d'achat

-- 1. Synchroniser les factures d'achat manquantes pour les bons de livraison reçus
INSERT INTO public.factures_achat (
    numero_facture,
    fournisseur,
    fournisseur_id,
    bon_livraison_id,
    bon_commande_id,
    date_facture,
    montant_ht,
    tva,
    montant_ttc,
    transit_douane,
    taux_tva,
    statut_paiement,
    observations,
    created_at
)
SELECT 
    'FA-' || TO_CHAR(bl.date_reception, 'YY-MM-DD-') || LPAD((EXTRACT(EPOCH FROM bl.date_reception)::INTEGER % 10000)::TEXT, 4, '0') as numero_facture,
    bl.fournisseur,
    bc.fournisseur_id,
    bl.id as bon_livraison_id,
    bl.bon_commande_id,
    bl.date_reception as date_facture,
    COALESCE(bc.montant_ht, 0) as montant_ht,
    COALESCE(bc.tva, 0) as tva,
    COALESCE(bc.montant_total, 0) as montant_ttc,
    COALESCE(bl.transit_douane, 0) as transit_douane,
    COALESCE(bl.taux_tva, 20) as taux_tva,
    'en_attente' as statut_paiement,
    'Facture générée automatiquement depuis le bon de livraison ' || bl.numero_bon as observations,
    bl.date_reception as created_at
FROM public.bons_de_livraison bl
JOIN public.bons_de_commande bc ON bl.bon_commande_id = bc.id
WHERE bl.statut = 'receptionne'
AND bl.id NOT IN (SELECT DISTINCT bon_livraison_id FROM public.factures_achat WHERE bon_livraison_id IS NOT NULL)
ON CONFLICT DO NOTHING;

-- 2. Synchroniser les articles des factures d'achat avec les articles des bons de livraison
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
    COALESCE(abl.quantite_recue, abl.quantite_commandee) as quantite,
    abl.prix_unitaire,
    COALESCE(abl.quantite_recue, abl.quantite_commandee) * abl.prix_unitaire as montant_ligne,
    fa.created_at
FROM public.factures_achat fa
JOIN public.articles_bon_livraison abl ON fa.bon_livraison_id = abl.bon_livraison_id
WHERE fa.id NOT IN (
    SELECT DISTINCT facture_achat_id 
    FROM public.articles_facture_achat 
    WHERE facture_achat_id IS NOT NULL
)
ON CONFLICT DO NOTHING;

-- 3. Créer un trigger pour maintenir la synchronisation future
CREATE OR REPLACE FUNCTION sync_facture_achat_on_reception()
RETURNS TRIGGER AS $$
DECLARE
    new_facture_id UUID;
BEGIN
    -- Créer la facture d'achat si elle n'existe pas déjà
    IF NOT EXISTS (
        SELECT 1 FROM public.factures_achat 
        WHERE bon_livraison_id = NEW.id
    ) THEN
        INSERT INTO public.factures_achat (
            numero_facture,
            fournisseur,
            fournisseur_id,
            bon_livraison_id,
            bon_commande_id,
            date_facture,
            montant_ht,
            tva,
            montant_ttc,
            transit_douane,
            taux_tva,
            statut_paiement,
            observations
        )
        SELECT 
            'FA-' || TO_CHAR(NEW.date_reception, 'YY-MM-DD-') || LPAD((EXTRACT(EPOCH FROM NEW.date_reception)::INTEGER % 10000)::TEXT, 4, '0'),
            NEW.fournisseur,
            bc.fournisseur_id,
            NEW.id,
            NEW.bon_commande_id,
            NEW.date_reception,
            COALESCE(bc.montant_ht, 0),
            COALESCE(bc.tva, 0),
            COALESCE(bc.montant_total, 0),
            COALESCE(NEW.transit_douane, 0),
            COALESCE(NEW.taux_tva, 20),
            'en_attente',
            'Facture générée automatiquement depuis le bon de livraison ' || NEW.numero_bon
        FROM public.bons_de_commande bc 
        WHERE bc.id = NEW.bon_commande_id
        RETURNING id INTO new_facture_id;
        
        -- Créer automatiquement les articles de la facture
        INSERT INTO public.articles_facture_achat (
            facture_achat_id,
            article_id,
            quantite,
            prix_unitaire,
            montant_ligne
        )
        SELECT 
            new_facture_id,
            abl.article_id,
            COALESCE(abl.quantite_recue, abl.quantite_commandee),
            abl.prix_unitaire,
            COALESCE(abl.quantite_recue, abl.quantite_commandee) * abl.prix_unitaire
        FROM public.articles_bon_livraison abl
        WHERE abl.bon_livraison_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Supprimer l'ancien trigger s'il existe et créer le nouveau
DROP TRIGGER IF EXISTS trigger_sync_facture_achat ON public.bons_de_livraison;
CREATE TRIGGER trigger_sync_facture_achat
    AFTER UPDATE OF statut ON public.bons_de_livraison
    FOR EACH ROW
    WHEN (NEW.statut = 'receptionne' AND OLD.statut != 'receptionne')
    EXECUTE FUNCTION sync_facture_achat_on_reception();