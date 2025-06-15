
-- Corriger la fonction pour s'assurer que nb_articles est correctement calculé

CREATE OR REPLACE FUNCTION public.get_factures_vente_with_details()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
AS $$
WITH factures AS (
  SELECT * FROM public.factures_vente ORDER BY date_facture DESC, created_at DESC
),
lignes_count AS (
  SELECT 
    facture_vente_id,
    COUNT(*) as nb_articles_count
  FROM public.lignes_facture_vente 
  GROUP BY facture_vente_id
)
SELECT
  jsonb_agg(
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
      'statut_livraison', fv.statut_livraison,
      'observations', fv.observations,
      'created_at', fv.created_at,
      'updated_at', fv.updated_at,
      'client', to_jsonb(c),
      'commande', to_jsonb(cc),
      'lignes_facture', COALESCE(lfv.lignes, '[]'::jsonb),
      'nb_articles', COALESCE(lc.nb_articles_count, 0),
      'versements', COALESCE(vc.versements, '[]'::jsonb)
    )
  )
FROM
  factures fv
  JOIN public.clients c ON fv.client_id = c.id
  LEFT JOIN public.commandes_clients cc ON fv.commande_id = cc.id
  LEFT JOIN lignes_count lc ON lc.facture_vente_id = fv.id
  LEFT JOIN (
    SELECT
      lfv_inner.facture_vente_id,
      jsonb_agg(
        jsonb_build_object(
          'id', lfv_inner.id,
          'facture_vente_id', lfv_inner.facture_vente_id,
          'article_id', lfv_inner.article_id,
          'quantite', lfv_inner.quantite,
          'prix_unitaire', lfv_inner.prix_unitaire,
          'montant_ligne', lfv_inner.montant_ligne,
          'created_at', lfv_inner.created_at,
          'article', (SELECT jsonb_build_object('id', cat.id, 'nom', cat.nom, 'reference', cat.reference) FROM public.catalogue cat WHERE cat.id = lfv_inner.article_id)
        )
      ) AS lignes
    FROM public.lignes_facture_vente lfv_inner
    GROUP BY lfv_inner.facture_vente_id
  ) lfv ON lfv.facture_vente_id = fv.id
  LEFT JOIN (
    SELECT
      vc_inner.facture_id,
      jsonb_agg(to_jsonb(vc_inner)) AS versements
    FROM public.versements_clients vc_inner
    GROUP BY vc_inner.facture_id
  ) vc ON vc.facture_id = fv.id;
$$;
