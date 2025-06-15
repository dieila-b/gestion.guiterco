
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
      'lignes_facture', COALESCE(lf.lignes, '[]'::jsonb),
      'versements', COALESCE(v.versements, '[]'::jsonb),
      'nb_articles', COALESCE(lf.nb_articles, 0),
      'statut_livraison',
        CASE
          WHEN lf.nb_total_lignes = 0 THEN 'livree'
          WHEN lf.nb_livree = lf.nb_total_lignes THEN 'livree'
          WHEN lf.nb_livree > 0 AND lf.nb_livree < lf.nb_total_lignes THEN 'partiellement_livree'
          WHEN lf.nb_livree = 0 AND lf.nb_total_lignes > 0 THEN 'en_attente'
          ELSE 'en_attente'
        END
    ) AS facture_details
  FROM
    public.factures_vente fv
    JOIN public.clients c ON fv.client_id = c.id
    LEFT JOIN public.commandes_clients cc ON fv.commande_id = cc.id
    LEFT JOIN LATERAL (
      SELECT
        jsonb_agg(
          jsonb_build_object(
            'id', lfv_inner.id,
            'facture_vente_id', lfv_inner.facture_vente_id,
            'article_id', lfv_inner.article_id,
            'quantite', lfv_inner.quantite,
            'prix_unitaire', lfv_inner.prix_unitaire,
            'montant_ligne', lfv_inner.montant_ligne,
            'created_at', lfv_inner.created_at,
            'statut_livraison', lfv_inner.statut_livraison,
            'article', (
                SELECT jsonb_build_object('id', cat.id, 'nom', cat.nom, 'reference', cat.reference)
                FROM public.catalogue cat
                WHERE cat.id = lfv_inner.article_id
            )
          )
        ) AS lignes,
        COUNT(*) as nb_articles,
        COUNT(*) as nb_total_lignes,
        COUNT(*) FILTER (WHERE lfv_inner.statut_livraison = 'livree') as nb_livree
      FROM public.lignes_facture_vente lfv_inner
      WHERE lfv_inner.facture_vente_id = fv.id
    ) lf ON true
    LEFT JOIN LATERAL (
      SELECT jsonb_agg(to_jsonb(vc_inner)) AS versements
      FROM public.versements_clients vc_inner
      WHERE vc_inner.facture_id = fv.id
    ) v ON true
  ORDER BY fv.date_facture DESC, fv.created_at DESC
) AS factures_with_details;
$$;
