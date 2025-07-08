
-- Corriger complètement la vue des factures impayées avec toutes les données nécessaires
DROP VIEW IF EXISTS public.vue_factures_impayees;

CREATE OR REPLACE VIEW public.vue_factures_impayees AS
SELECT
  f.id                AS facture_id,
  f.numero_facture    AS numero_facture,
  f.date_facture::date AS date_facture,
  f.client_id         AS client_id,
  COALESCE(c.nom, 'Client non défini') AS client,
  f.montant_ttc       AS total,
  -- Calcul précis des paiements
  COALESCE((
    SELECT SUM(v.montant)
    FROM versements_clients v
    WHERE v.facture_id = f.id
  ), 0) AS paye,
  -- Calcul précis du reste à payer
  (f.montant_ttc - COALESCE((
    SELECT SUM(v2.montant)
    FROM versements_clients v2
    WHERE v2.facture_id = f.id
  ), 0)) AS restant,
  f.statut_paiement,
  f.statut_livraison,
  -- Nombre réel d'articles (lignes de facture)
  COALESCE((
    SELECT COUNT(*)::integer
    FROM lignes_facture_vente lfv
    WHERE lfv.facture_vente_id = f.id
  ), 0) AS nb_articles,
  -- Quantités totales pour la livraison
  COALESCE((
    SELECT SUM(lfv.quantite)::integer
    FROM lignes_facture_vente lfv
    WHERE lfv.facture_vente_id = f.id
  ), 0) AS quantite_totale,
  -- Quantités livrées totales
  COALESCE((
    SELECT SUM(COALESCE(lfv.quantite_livree, 0))::integer
    FROM lignes_facture_vente lfv
    WHERE lfv.facture_vente_id = f.id
  ), 0) AS quantite_livree_totale
FROM factures_vente f
LEFT JOIN clients c ON c.id = f.client_id
WHERE f.statut_paiement IN ('en_attente', 'partiellement_payee');

-- Maintenir les droits d'accès à la vue
GRANT SELECT ON public.vue_factures_impayees TO anon, authenticated;
