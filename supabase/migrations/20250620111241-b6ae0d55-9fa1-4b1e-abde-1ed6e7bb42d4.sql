
-- Vérifier et corriger le calcul des frais dans la vue
DROP VIEW IF EXISTS public.vue_marges_articles;

CREATE OR REPLACE VIEW public.vue_marges_articles AS
WITH frais_par_article AS (
  SELECT 
    c.id as article_id,
    c.nom,
    c.reference,
    c.prix_achat,
    c.prix_vente,
    c.frais_logistique as frais_logistique_direct,
    c.frais_douane as frais_douane_direct,
    c.frais_transport as frais_transport_direct,
    c.autres_frais as autres_frais_direct,
    -- Calculer la somme des frais répartis pour chaque article
    COALESCE(SUM(
      CASE 
        WHEN abc.montant_ligne > 0 AND bc.montant_ht > 0
        THEN (
          COALESCE(bc.frais_livraison, 0) + 
          COALESCE(bc.frais_logistique, 0) + 
          COALESCE(bc.transit_douane, 0)
        ) * (abc.montant_ligne / bc.montant_ht)
        ELSE 0
      END
    ) / NULLIF(COUNT(abc.id), 0), 0) as frais_bon_commande_unitaire
  FROM public.catalogue c
  LEFT JOIN public.articles_bon_commande abc ON c.id = abc.article_id
  LEFT JOIN public.bons_de_commande bc ON abc.bon_commande_id = bc.id 
    AND bc.statut IN ('approuve', 'livre', 'receptionne')
    AND bc.montant_ht > 0
  WHERE c.statut = 'actif'
  GROUP BY c.id, c.nom, c.reference, c.prix_achat, c.prix_vente, 
           c.frais_logistique, c.frais_douane, c.frais_transport, c.autres_frais
)
SELECT 
    fa.article_id as id,
    fa.nom,
    fa.reference,
    fa.prix_achat,
    fa.prix_vente,
    fa.frais_logistique_direct as frais_logistique,
    fa.frais_douane_direct as frais_douane,
    fa.frais_transport_direct as frais_transport,
    fa.autres_frais_direct as autres_frais,
    -- Frais des bons de commande répartis (arrondi à 2 décimales)
    ROUND(fa.frais_bon_commande_unitaire, 2) as frais_bon_commande,
    -- Calcul du coût total unitaire
    COALESCE(fa.prix_achat, 0) + 
    COALESCE(fa.frais_logistique_direct, 0) + 
    COALESCE(fa.frais_douane_direct, 0) + 
    COALESCE(fa.frais_transport_direct, 0) + 
    COALESCE(fa.autres_frais_direct, 0) +
    ROUND(fa.frais_bon_commande_unitaire, 2) AS cout_total_unitaire,
    -- Calcul de la marge unitaire
    COALESCE(fa.prix_vente, 0) - (
        COALESCE(fa.prix_achat, 0) + 
        COALESCE(fa.frais_logistique_direct, 0) + 
        COALESCE(fa.frais_douane_direct, 0) + 
        COALESCE(fa.frais_transport_direct, 0) + 
        COALESCE(fa.autres_frais_direct, 0) +
        ROUND(fa.frais_bon_commande_unitaire, 2)
    ) AS marge_unitaire,
    -- Calcul du taux de marge
    CASE 
        WHEN (COALESCE(fa.prix_achat, 0) + 
              COALESCE(fa.frais_logistique_direct, 0) + 
              COALESCE(fa.frais_douane_direct, 0) + 
              COALESCE(fa.frais_transport_direct, 0) + 
              COALESCE(fa.autres_frais_direct, 0) +
              ROUND(fa.frais_bon_commande_unitaire, 2)) > 0
        THEN ROUND(
            ((COALESCE(fa.prix_vente, 0) - (
                COALESCE(fa.prix_achat, 0) + 
                COALESCE(fa.frais_logistique_direct, 0) + 
                COALESCE(fa.frais_douane_direct, 0) + 
                COALESCE(fa.frais_transport_direct, 0) + 
                COALESCE(fa.autres_frais_direct, 0) +
                ROUND(fa.frais_bon_commande_unitaire, 2)
            )) / (
                COALESCE(fa.prix_achat, 0) + 
                COALESCE(fa.frais_logistique_direct, 0) + 
                COALESCE(fa.frais_douane_direct, 0) + 
                COALESCE(fa.frais_transport_direct, 0) + 
                COALESCE(fa.autres_frais_direct, 0) +
                ROUND(fa.frais_bon_commande_unitaire, 2)
            )) * 100, 2
        )
        ELSE 0
    END AS taux_marge,
    NOW() as created_at,
    NOW() as updated_at
FROM frais_par_article fa;

-- Fonction pour forcer la mise à jour de la vue (utile pour le debugging)
CREATE OR REPLACE FUNCTION public.refresh_marges_view()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
    -- Cette fonction peut être appelée pour forcer un recalcul
    -- La vue se mettra automatiquement à jour lors de la prochaine requête
    SELECT 1;
$$;
