
-- Migration corrective pour forcer la mise à jour de get_factures_vente_with_details
-- Supprimer explicitement toutes les versions de la fonction
DROP FUNCTION IF EXISTS public.get_factures_vente_with_details();
DROP FUNCTION IF EXISTS public.get_factures_vente_with_details(void);

-- Recréer la fonction avec un nom légèrement différent pour forcer le refresh
CREATE OR REPLACE FUNCTION public.get_factures_vente_with_details()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
AS $$
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
      'lignes_facture', COALESCE(lignes_data.lignes, '[]'::jsonb),
      'versements', COALESCE(versements_data.versements, '[]'::jsonb),
      'nb_articles', COALESCE(lignes_data.nb_articles, 0),
      'statut_livraison',
        CASE
          WHEN lignes_data.nb_total_lignes = 0 THEN 'livree'
          WHEN lignes_data.nb_livree = lignes_data.nb_total_lignes THEN 'livree'
          WHEN lignes_data.nb_livree > 0 AND lignes_data.nb_livree < lignes_data.nb_total_lignes THEN 'partiellement_livree'
          WHEN lignes_data.nb_livree = 0 AND lignes_data.nb_total_lignes > 0 THEN 'en_attente'
          ELSE 'en_attente'
        END
    )
  )
FROM
  public.factures_vente fv
  JOIN public.clients c ON fv.client_id = c.id
  LEFT JOIN public.commandes_clients cc ON fv.commande_id = cc.id
  LEFT JOIN (
    SELECT
      lfv.facture_vente_id,
      jsonb_agg(
        jsonb_build_object(
          'id', lfv.id,
          'facture_vente_id', lfv.facture_vente_id,
          'article_id', lfv.article_id,
          'quantite', lfv.quantite,
          'quantite_livree', COALESCE(lfv.quantite_livree, 0),
          'prix_unitaire_brut', COALESCE(lfv.prix_unitaire_brut, 0),
          'remise_unitaire', COALESCE(lfv.remise_unitaire, 0),
          'montant_ligne', lfv.montant_ligne,
          'created_at', lfv.created_at,
          'statut_livraison', lfv.statut_livraison,
          'article', (
              SELECT jsonb_build_object('id', cat.id, 'nom', cat.nom, 'reference', cat.reference)
              FROM public.catalogue cat
              WHERE cat.id = lfv.article_id
          )
        )
      ) AS lignes,
      COUNT(*) as nb_articles,
      COUNT(*) as nb_total_lignes,
      COUNT(*) FILTER (WHERE lfv.statut_livraison = 'livree') as nb_livree
    FROM public.lignes_facture_vente lfv
    GROUP BY lfv.facture_vente_id
  ) lignes_data ON lignes_data.facture_vente_id = fv.id
  LEFT JOIN (
    SELECT
      vc.facture_id,
      jsonb_agg(to_jsonb(vc)) AS versements
    FROM public.versements_clients vc
    GROUP BY vc.facture_id
  ) versements_data ON versements_data.facture_id = fv.id
ORDER BY fv.date_facture DESC, fv.created_at DESC;
$$;
