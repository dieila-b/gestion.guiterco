
-- Modifier la vue pour inclure les frais des bons de commande
DROP VIEW IF EXISTS public.vue_marges_articles;

CREATE OR REPLACE VIEW public.vue_marges_articles AS
WITH frais_articles AS (
  SELECT 
    c.id,
    c.nom,
    c.reference,
    c.prix_achat,
    c.prix_vente,
    c.frais_logistique as frais_logistique_direct,
    c.frais_douane as frais_douane_direct,
    c.frais_transport as frais_transport_direct,
    c.autres_frais as autres_frais_direct,
    -- Calculer les frais moyens des bons de commande pour cet article
    COALESCE(AVG(
      CASE 
        WHEN abc.quantite > 0 AND bc.montant_ht > 0
        THEN (bc.frais_livraison + COALESCE(bc.frais_logistique, 0) + COALESCE(bc.transit_douane, 0)) 
             * (abc.montant_ligne / bc.montant_ht)
        ELSE 0
      END
    ), 0) as frais_bon_commande_moyens
  FROM public.catalogue c
  LEFT JOIN public.articles_bon_commande abc ON c.id = abc.article_id
  LEFT JOIN public.bons_de_commande bc ON abc.bon_commande_id = bc.id 
    AND bc.statut IN ('approuve', 'livre', 'receptionne')
  WHERE c.statut = 'actif'
  GROUP BY c.id, c.nom, c.reference, c.prix_achat, c.prix_vente, 
           c.frais_logistique, c.frais_douane, c.frais_transport, c.autres_frais
)
SELECT 
    fa.id,
    fa.nom,
    fa.reference,
    fa.prix_achat,
    fa.prix_vente,
    fa.frais_logistique_direct as frais_logistique,
    fa.frais_douane_direct as frais_douane,
    fa.frais_transport_direct as frais_transport,
    fa.autres_frais_direct as autres_frais,
    -- Calcul du coût total unitaire incluant les frais des bons de commande
    COALESCE(fa.prix_achat, 0) + 
    COALESCE(fa.frais_logistique_direct, 0) + 
    COALESCE(fa.frais_douane_direct, 0) + 
    COALESCE(fa.frais_transport_direct, 0) + 
    COALESCE(fa.autres_frais_direct, 0) +
    fa.frais_bon_commande_moyens AS cout_total_unitaire,
    -- Calcul de la marge unitaire
    COALESCE(fa.prix_vente, 0) - (
        COALESCE(fa.prix_achat, 0) + 
        COALESCE(fa.frais_logistique_direct, 0) + 
        COALESCE(fa.frais_douane_direct, 0) + 
        COALESCE(fa.frais_transport_direct, 0) + 
        COALESCE(fa.autres_frais_direct, 0) +
        fa.frais_bon_commande_moyens
    ) AS marge_unitaire,
    -- Calcul du taux de marge (éviter division par zéro)
    CASE 
        WHEN (COALESCE(fa.prix_achat, 0) + 
              COALESCE(fa.frais_logistique_direct, 0) + 
              COALESCE(fa.frais_douane_direct, 0) + 
              COALESCE(fa.frais_transport_direct, 0) + 
              COALESCE(fa.autres_frais_direct, 0) +
              fa.frais_bon_commande_moyens) > 0
        THEN ROUND(
            ((COALESCE(fa.prix_vente, 0) - (
                COALESCE(fa.prix_achat, 0) + 
                COALESCE(fa.frais_logistique_direct, 0) + 
                COALESCE(fa.frais_douane_direct, 0) + 
                COALESCE(fa.frais_transport_direct, 0) + 
                COALESCE(fa.autres_frais_direct, 0) +
                fa.frais_bon_commande_moyens
            )) / (
                COALESCE(fa.prix_achat, 0) + 
                COALESCE(fa.frais_logistique_direct, 0) + 
                COALESCE(fa.frais_douane_direct, 0) + 
                COALESCE(fa.frais_transport_direct, 0) + 
                COALESCE(fa.autres_frais_direct, 0) +
                fa.frais_bon_commande_moyens
            )) * 100, 2
        )
        ELSE 0
    END AS taux_marge,
    NOW() as created_at,
    NOW() as updated_at
FROM frais_articles fa;
