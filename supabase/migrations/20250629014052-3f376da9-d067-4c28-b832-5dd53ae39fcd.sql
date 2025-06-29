
-- Corriger la vue des marges pour une répartition correcte des frais BC par quantité
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
    -- Calculer les frais moyens des bons de commande par UNITE de cet article
    -- Répartition basée sur la quantité réelle commandée
    COALESCE(
      SUM(
        CASE 
          WHEN abc.quantite > 0 AND bc.montant_ht > 0
          THEN (
            COALESCE(bc.frais_livraison, 0) + 
            COALESCE(bc.frais_logistique, 0) + 
            COALESCE(bc.transit_douane, 0)
          ) * (abc.montant_ligne / bc.montant_ht) / abc.quantite
          ELSE 0
        END
      ) / NULLIF(COUNT(abc.id), 0), 0
    ) as frais_bon_commande
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
    fa.id,
    fa.nom,
    fa.reference,
    fa.prix_achat,
    fa.prix_vente,
    fa.frais_logistique_direct as frais_logistique,
    fa.frais_douane_direct as frais_douane,
    fa.frais_transport_direct as frais_transport,
    fa.autres_frais_direct as autres_frais,
    ROUND(fa.frais_bon_commande::numeric, 2) as frais_bon_commande,
    -- Calcul du coût total unitaire incluant les frais des bons de commande répartis
    ROUND((
      COALESCE(fa.prix_achat, 0) + 
      COALESCE(fa.frais_logistique_direct, 0) + 
      COALESCE(fa.frais_douane_direct, 0) + 
      COALESCE(fa.frais_transport_direct, 0) + 
      COALESCE(fa.autres_frais_direct, 0) +
      COALESCE(fa.frais_bon_commande, 0)
    )::numeric, 2) AS cout_total_unitaire,
    -- Calcul de la marge unitaire
    ROUND((
      COALESCE(fa.prix_vente, 0) - (
          COALESCE(fa.prix_achat, 0) + 
          COALESCE(fa.frais_logistique_direct, 0) + 
          COALESCE(fa.frais_douane_direct, 0) + 
          COALESCE(fa.frais_transport_direct, 0) + 
          COALESCE(fa.autres_frais_direct, 0) +
          COALESCE(fa.frais_bon_commande, 0)
      )
    )::numeric, 2) AS marge_unitaire,
    -- Calcul du taux de marge (éviter division par zéro)
    CASE 
        WHEN (COALESCE(fa.prix_achat, 0) + 
              COALESCE(fa.frais_logistique_direct, 0) + 
              COALESCE(fa.frais_douane_direct, 0) + 
              COALESCE(fa.frais_transport_direct, 0) + 
              COALESCE(fa.autres_frais_direct, 0) +
              COALESCE(fa.frais_bon_commande, 0)) > 0
        THEN ROUND(
            ((COALESCE(fa.prix_vente, 0) - (
                COALESCE(fa.prix_achat, 0) + 
                COALESCE(fa.frais_logistique_direct, 0) + 
                COALESCE(fa.frais_douane_direct, 0) + 
                COALESCE(fa.frais_transport_direct, 0) + 
                COALESCE(fa.autres_frais_direct, 0) +
                COALESCE(fa.frais_bon_commande, 0)
            )) / (
                COALESCE(fa.prix_achat, 0) + 
                COALESCE(fa.frais_logistique_direct, 0) + 
                COALESCE(fa.frais_douane_direct, 0) + 
                COALESCE(fa.frais_transport_direct, 0) + 
                COALESCE(fa.autres_frais_direct, 0) +
                COALESCE(fa.frais_bon_commande, 0)
            )) * 100, 2
        )
        ELSE 0
    END AS taux_marge,
    NOW() as created_at,
    NOW() as updated_at
FROM frais_articles fa;

-- Améliorer la fonction de debug pour vérifier les calculs par unité
CREATE OR REPLACE FUNCTION public.debug_frais_repartition_unitaire()
RETURNS TABLE(
    article_nom text,
    article_id uuid,
    bon_commande_numero text,
    quantite_commandee integer,
    montant_ligne numeric,
    part_montant_ligne_pct numeric,
    frais_total_bc numeric,
    frais_unitaire_reparti numeric,
    frais_total_article numeric
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        c.nom as article_nom,
        c.id as article_id,
        bc.numero_bon as bon_commande_numero,
        abc.quantite as quantite_commandee,
        abc.montant_ligne,
        ROUND((abc.montant_ligne / NULLIF(bc.montant_ht, 0) * 100)::numeric, 2) as part_montant_ligne_pct,
        (COALESCE(bc.frais_livraison, 0) + COALESCE(bc.frais_logistique, 0) + COALESCE(bc.transit_douane, 0)) as frais_total_bc,
        ROUND(
            (CASE 
                WHEN abc.quantite > 0 AND bc.montant_ht > 0
                THEN (COALESCE(bc.frais_livraison, 0) + COALESCE(bc.frais_logistique, 0) + COALESCE(bc.transit_douane, 0)) 
                     * (abc.montant_ligne / bc.montant_ht) / abc.quantite
                ELSE 0
            END)::numeric, 4
        ) as frais_unitaire_reparti,
        ROUND(
            (CASE 
                WHEN abc.quantite > 0 AND bc.montant_ht > 0
                THEN (COALESCE(bc.frais_livraison, 0) + COALESCE(bc.frais_logistique, 0) + COALESCE(bc.transit_douane, 0)) 
                     * (abc.montant_ligne / bc.montant_ht)
                ELSE 0
            END)::numeric, 2
        ) as frais_total_article
    FROM public.catalogue c
    JOIN public.articles_bon_commande abc ON c.id = abc.article_id
    JOIN public.bons_de_commande bc ON abc.bon_commande_id = bc.id
    WHERE c.statut = 'actif' AND bc.statut IN ('approuve', 'livre', 'receptionne')
    ORDER BY c.nom, bc.numero_bon;
$$;
