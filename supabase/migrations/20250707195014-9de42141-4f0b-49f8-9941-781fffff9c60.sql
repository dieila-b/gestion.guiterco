
-- Vue SQL pour lister les factures impayées
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
  f.statut_livraison
FROM factures_vente f
LEFT JOIN clients c ON c.id = f.client_id
WHERE f.statut_paiement IN ('en_attente', 'partiellement_payee');

-- Accorder les droits d'accès à la vue
GRANT SELECT ON public.vue_factures_impayees TO anon, authenticated;
