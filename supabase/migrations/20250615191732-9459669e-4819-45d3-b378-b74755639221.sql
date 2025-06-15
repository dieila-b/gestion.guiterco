
-- Corriger la fonction pour récupérer correctement les lignes de facture
CREATE OR REPLACE FUNCTION public.get_factures_vente_with_details()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
AS $$
SELECT
  jsonb_agg(facture_details)
FROM (
  SELECT
    jsonb_build_object(
      'id', fv.id,
      'numero_facture', fv.numero_facture,
      'commande_id', fv.commande_id,
      'client_id', fv.client_id,
      'date_facture', fv.date_facture,
      'date_echeance', fv.date_echeance,
      'montant_ht', fv.montant_ht,
      'tva', fv.tva,
      'montant_ttc', fv.montant_ttc,
      'taux_tva', fv.taux_tva,
      'statut_paiement', fv.statut_paiement,
      'mode_paiement', fv.mode_paiement,
      'date_paiement', fv.date_paiement,
      'observations', fv.observations,
      'created_at', fv.created_at,
      'updated_at', fv.updated_at,
      'client', to_jsonb(c),
      'commande', to_jsonb(cc),
      'lignes_facture', COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', lfv.id,
              'facture_vente_id', lfv.facture_vente_id,
              'article_id', lfv.article_id,
              'quantite', lfv.quantite,
              'prix_unitaire', lfv.prix_unitaire,
              'montant_ligne', lfv.montant_ligne,
              'created_at', lfv.created_at,
              'statut_livraison', lfv.statut_livraison,
              'article', (
                SELECT jsonb_build_object('id', cat.id, 'nom', cat.nom, 'reference', cat.reference)
                FROM public.catalogue cat
                WHERE cat.id = lfv.article_id
              )
            )
          )
          FROM public.lignes_facture_vente lfv
          WHERE lfv.facture_vente_id = fv.id
        ), 
        '[]'::jsonb
      ),
      'versements', COALESCE(
        (
          SELECT jsonb_agg(to_jsonb(vc))
          FROM public.versements_clients vc
          WHERE vc.facture_id = fv.id
        ), 
        '[]'::jsonb
      ),
      'nb_articles', COALESCE(
        (
          SELECT COUNT(*)
          FROM public.lignes_facture_vente lfv
          WHERE lfv.facture_vente_id = fv.id
        ), 
        0
      ),
      'statut_livraison', COALESCE(
        CASE
          WHEN (SELECT COUNT(*) FROM public.lignes_facture_vente WHERE facture_vente_id = fv.id) = 0 THEN 'livree'
          WHEN (SELECT COUNT(*) FROM public.lignes_facture_vente WHERE facture_vente_id = fv.id AND statut_livraison = 'livree') = 
               (SELECT COUNT(*) FROM public.lignes_facture_vente WHERE facture_vente_id = fv.id) THEN 'livree'
          WHEN (SELECT COUNT(*) FROM public.lignes_facture_vente WHERE facture_vente_id = fv.id AND statut_livraison = 'livree') > 0 THEN 'partiellement_livree'
          ELSE 'en_attente'
        END,
        fv.statut_livraison
      )
    ) AS facture_details
  FROM
    public.factures_vente fv
    JOIN public.clients c ON fv.client_id = c.id
    LEFT JOIN public.commandes_clients cc ON fv.commande_id = cc.id
  ORDER BY fv.date_facture DESC, fv.created_at DESC
) AS factures_with_details;
$$;
