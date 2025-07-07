
-- Mettre à jour la vue des factures impayées pour inclure le nombre d'articles
DROP VIEW IF EXISTS public.vue_factures_impayees;

CREATE OR REPLACE VIEW public.vue_factures_impayees AS
SELECT
  f.id                AS facture_id,
  f.numero_facture    AS numero_facture,
  f.date_facture::date AS date_facture,
  COALESCE(c.nom, 'Client non défini') AS client,
  f.montant_ttc       AS total,
  (
    SELECT COALESCE(SUM(v.montant), 0)
    FROM versements_clients v
    WHERE v.facture_id = f.id
  )                   AS paye,
  (f.montant_ttc - (
    SELECT COALESCE(SUM(v2.montant), 0)
    FROM versements_clients v2
    WHERE v2.facture_id = f.id
  ))                  AS restant,
  f.statut_paiement,
  f.statut_livraison,
  -- Ajouter le nombre d'articles
  COALESCE((
    SELECT COUNT(*)::integer
    FROM lignes_facture_vente lfv
    WHERE lfv.facture_vente_id = f.id
  ), 0) AS nb_articles
FROM factures_vente f
LEFT JOIN clients c ON c.id = f.client_id
WHERE f.statut_paiement IN ('en_attente', 'partiellement_payee');

-- Maintenir les droits d'accès à la vue
GRANT SELECT ON public.vue_factures_impayees TO anon, authenticated;
