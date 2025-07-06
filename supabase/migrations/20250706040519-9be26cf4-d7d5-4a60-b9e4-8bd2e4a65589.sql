
-- Mise à jour de la fonction get_factures_vente_with_details pour utiliser prix_unitaire_brut
CREATE OR REPLACE FUNCTION public.get_factures_vente_with_details()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
AS $$
WITH factures AS (
  SELECT * FROM public.factures_vente ORDER BY created_at DESC
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
      'remise_totale', COALESCE(fv.remise_totale, 0),
      'taux_tva', fv.taux_tva,
      'statut_paiement', fv.statut_paiement,
      'mode_paiement', fv.mode_paiement,
      'date_paiement', fv.date_paiement,
      'observations', fv.observations,
      'created_at', fv.created_at,
      'updated_at', fv.updated_at,
      'client', to_jsonb(c),
      'commande', to_jsonb(cc),
      'lignes_facture', COALESCE(lfv.lignes, '[]'::jsonb),
      'versements', COALESCE(vc.versements, '[]'::jsonb),
      'nb_articles', COALESCE(lfv.nb_articles, 0),
      'statut_livraison',
        CASE
          WHEN lfv.nb_total_lignes = 0 THEN 'livree'
          WHEN lfv.nb_livree = lfv.nb_total_lignes THEN 'livree'
          WHEN lfv.nb_livree > 0 AND lfv.nb_livree < lfv.nb_total_lignes THEN 'partiellement_livree'
          WHEN lfv.nb_livree = 0 AND lfv.nb_total_lignes > 0 THEN 'en_attente'
          ELSE 'en_attente'
        END
    )
  )
FROM
  factures fv
  JOIN public.clients c ON fv.client_id = c.id
  LEFT JOIN public.commandes_clients cc ON fv.commande_id = cc.id
  LEFT JOIN (
    SELECT
      lfv_inner.facture_vente_id,
      jsonb_agg(
        jsonb_build_object(
          'id', lfv_inner.id,
          'facture_vente_id', lfv_inner.facture_vente_id,
          'article_id', lfv_inner.article_id,
          'quantite', lfv_inner.quantite,
          'quantite_livree', COALESCE(lfv_inner.quantite_livree, 0),
          'prix_unitaire_brut', COALESCE(lfv_inner.prix_unitaire_brut, 0),
          'remise_unitaire', COALESCE(lfv_inner.remise_unitaire, 0),
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
    GROUP BY lfv_inner.facture_vente_id
  ) lfv ON lfv.facture_vente_id = fv.id
  LEFT JOIN (
    SELECT
      vc_inner.facture_id,
      jsonb_agg(to_jsonb(vc_inner)) AS versements
    FROM public.versements_clients vc_inner
    GROUP BY vc_inner.facture_id
  ) vc ON vc.facture_id = fv.id
ORDER BY fv.date_facture DESC, fv.created_at DESC;
$$;
