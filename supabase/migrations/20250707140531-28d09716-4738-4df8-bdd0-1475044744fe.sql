
-- Correction de la vue vue_factures_vente_summary qui cause l'erreur
-- Supprimer l'ancienne vue problématique
DROP VIEW IF EXISTS public.vue_factures_vente_summary CASCADE;

-- Recréer la vue avec les bonnes colonnes
CREATE VIEW public.vue_factures_vente_summary AS
SELECT 
    fv.id as facture_id,
    fv.numero_facture,
    TO_CHAR(fv.date_facture, 'DD/MM/YYYY') as date,
    fv.date_facture::text as date_iso,
    COALESCE(c.nom, 'Client supprimé') as client,
    COALESCE(ligne_counts.nb_articles, 0) as articles,
    fv.montant_ttc as total,
    COALESCE(versement_totals.total_paye, 0) as paye,
    GREATEST(0, fv.montant_ttc - COALESCE(versement_totals.total_paye, 0)) as restant,
    CASE 
        WHEN COALESCE(versement_totals.total_paye, 0) = 0 THEN 'en_attente'
        WHEN COALESCE(versement_totals.total_paye, 0) >= fv.montant_ttc THEN 'payee'
        ELSE 'partiellement_payee'
    END as statut_paiement,
    COALESCE(fv.statut_livraison::text, 'en_attente') as statut_livraison
FROM public.factures_vente fv
LEFT JOIN public.clients c ON fv.client_id = c.id
LEFT JOIN (
    SELECT 
        facture_vente_id,
        COUNT(*) as nb_articles
    FROM public.lignes_facture_vente
    GROUP BY facture_vente_id
) ligne_counts ON ligne_counts.facture_vente_id = fv.id
LEFT JOIN (
    SELECT 
        facture_id,
        SUM(montant) as total_paye
    FROM public.versements_clients
    GROUP BY facture_id
) versement_totals ON versement_totals.facture_id = fv.id
ORDER BY fv.date_facture DESC, fv.created_at DESC;

-- Accorder les permissions nécessaires
GRANT SELECT ON public.vue_factures_vente_summary TO anon, authenticated;

-- Vérifier que la fonction get_factures_vente utilise bien cette vue
CREATE OR REPLACE FUNCTION public.get_factures_vente()
RETURNS TABLE(
    facture_id uuid, 
    numero_facture character varying, 
    date_iso text, 
    client text, 
    articles integer, 
    total numeric, 
    paye numeric, 
    restant numeric, 
    statut_paiement text, 
    statut_livraison text
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT
        facture_id,
        numero_facture,
        date_iso,
        client,
        articles,
        total,
        paye,
        restant,
        statut_paiement,
        statut_livraison
    FROM public.vue_factures_vente_summary;
$$;

-- Accorder les permissions à la fonction
GRANT EXECUTE ON FUNCTION public.get_factures_vente() TO anon, authenticated;
