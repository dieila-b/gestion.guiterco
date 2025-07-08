
-- 1. Vérifier les statuts de paiement existants en base
SELECT DISTINCT statut_paiement, COUNT(*) as nb_factures
FROM public.factures_vente 
GROUP BY statut_paiement
ORDER BY statut_paiement;

-- 2. Recréer la vue vue_factures_impayees_summary avec les bons filtres
DROP VIEW IF EXISTS public.vue_factures_impayees_summary;

CREATE VIEW public.vue_factures_impayees_summary AS
SELECT 
    fv.id as facture_id,
    fv.numero_facture,
    TO_CHAR(fv.date_facture, 'YYYY-MM-DD') as date_iso,
    fv.date_facture as date,
    c.nom as client,
    fv.client_id,
    fv.montant_ttc as total,
    COALESCE(versements.total_paye, 0) as paye,
    fv.montant_ttc - COALESCE(versements.total_paye, 0) as restant,
    fv.statut_paiement,
    fv.statut_livraison,
    COALESCE(lignes.nb_articles, 0) as articles
FROM public.factures_vente fv
LEFT JOIN public.clients c ON fv.client_id = c.id
LEFT JOIN (
    SELECT 
        facture_id,
        SUM(montant) as total_paye
    FROM public.versements_clients
    GROUP BY facture_id
) versements ON fv.id = versements.facture_id
LEFT JOIN (
    SELECT 
        facture_vente_id,
        COUNT(*) as nb_articles
    FROM public.lignes_facture_vente
    GROUP BY facture_vente_id
) lignes ON fv.id = lignes.facture_vente_id
WHERE fv.statut_paiement IN ('en_attente', 'En attente', 'partiellement_payee', 'Partiellement payée')
   OR (COALESCE(versements.total_paye, 0) < fv.montant_ttc AND fv.statut_paiement != 'payee' AND fv.statut_paiement != 'Payée')
ORDER BY fv.date_facture DESC;

-- 3. Recréer la fonction get_factures_impayees_complete avec les bons filtres
CREATE OR REPLACE FUNCTION public.get_factures_impayees_complete()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
AS $$
SELECT
  jsonb_agg(
    jsonb_build_object(
      'id', fv.id,
      'numero_facture', fv.numero_facture,
      'date_facture', fv.date_facture,
      'client_id', fv.client_id,
      'montant_ttc', fv.montant_ttc,
      'statut_paiement', fv.statut_paiement,
      'statut_livraison', fv.statut_livraison,
      'client', to_jsonb(c),
      'lignes_facture', COALESCE(lignes_data.lignes, '[]'::jsonb),
      'versements', COALESCE(versements_data.versements, '[]'::jsonb),
      'nb_articles', COALESCE(lignes_data.nb_articles, 0),
      'total_paye', COALESCE(versements_data.total_paye, 0),
      'reste_a_payer', fv.montant_ttc - COALESCE(versements_data.total_paye, 0)
    )
  )
FROM
  public.factures_vente fv
  JOIN public.clients c ON fv.client_id = c.id
  LEFT JOIN (
    SELECT
      lfv.facture_vente_id,
      jsonb_agg(
        jsonb_build_object(
          'id', lfv.id,
          'article_id', lfv.article_id,
          'quantite', lfv.quantite,
          'quantite_livree', COALESCE(lfv.quantite_livree, 0),
          'prix_unitaire_brut', COALESCE(lfv.prix_unitaire_brut, 0),
          'remise_unitaire', COALESCE(lfv.remise_unitaire, 0),
          'montant_ligne', lfv.montant_ligne,
          'statut_livraison', lfv.statut_livraison,
          'article', (
              SELECT jsonb_build_object('id', cat.id, 'nom', cat.nom, 'reference', cat.reference)
              FROM public.catalogue cat
              WHERE cat.id = lfv.article_id
          )
        )
      ) AS lignes,
      COUNT(*) as nb_articles
    FROM public.lignes_facture_vente lfv
    GROUP BY lfv.facture_vente_id
  ) lignes_data ON lignes_data.facture_vente_id = fv.id
  LEFT JOIN (
    SELECT
      vc.facture_id,
      jsonb_agg(to_jsonb(vc)) AS versements,
      SUM(vc.montant) as total_paye
    FROM public.versements_clients vc
    GROUP BY vc.facture_id
  ) versements_data ON versements_data.facture_id = fv.id
WHERE fv.statut_paiement IN ('en_attente', 'En attente', 'partiellement_payee', 'Partiellement payée')
   OR (COALESCE(versements_data.total_paye, 0) < fv.montant_ttc AND fv.statut_paiement NOT IN ('payee', 'Payée'))
ORDER BY fv.date_facture DESC;
$$;

-- 4. Accorder les permissions nécessaires
GRANT SELECT ON public.vue_factures_impayees_summary TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_factures_impayees_complete() TO anon, authenticated;

-- 5. Vérifier que la vue retourne bien des données
SELECT COUNT(*) as nb_factures_impayees FROM public.vue_factures_impayees_summary;
