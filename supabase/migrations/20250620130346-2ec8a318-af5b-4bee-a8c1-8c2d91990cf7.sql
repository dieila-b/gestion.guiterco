
-- Corriger la vue des marges articles pour mieux calculer les frais des bons de commande
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
    -- Utiliser une moyenne pondérée basée sur les montants de ligne
    COALESCE(
      SUM(
        CASE 
          WHEN abc.montant_ligne > 0 AND bc.montant_ht > 0
          THEN (
            COALESCE(bc.frais_livraison, 0) + 
            COALESCE(bc.frais_logistique, 0) + 
            COALESCE(bc.transit_douane, 0)
          ) * (abc.montant_ligne / bc.montant_ht)
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
    fa.frais_bon_commande,
    -- Calcul du coût total unitaire incluant les frais des bons de commande
    COALESCE(fa.prix_achat, 0) + 
    COALESCE(fa.frais_logistique_direct, 0) + 
    COALESCE(fa.frais_douane_direct, 0) + 
    COALESCE(fa.frais_transport_direct, 0) + 
    COALESCE(fa.autres_frais_direct, 0) +
    COALESCE(fa.frais_bon_commande, 0) AS cout_total_unitaire,
    -- Calcul de la marge unitaire
    COALESCE(fa.prix_vente, 0) - (
        COALESCE(fa.prix_achat, 0) + 
        COALESCE(fa.frais_logistique_direct, 0) + 
        COALESCE(fa.frais_douane_direct, 0) + 
        COALESCE(fa.frais_transport_direct, 0) + 
        COALESCE(fa.autres_frais_direct, 0) +
        COALESCE(fa.frais_bon_commande, 0)
    ) AS marge_unitaire,
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

-- Améliorer la fonction de debug pour donner plus de détails
CREATE OR REPLACE FUNCTION public.debug_frais_articles_detaille()
RETURNS TABLE(
    article_nom text,
    article_id uuid,
    bon_commande_numero text,
    bc_statut text,
    frais_livraison numeric,
    frais_logistique numeric,
    transit_douane numeric,
    montant_ht numeric,
    quantite integer,
    prix_unitaire numeric,
    montant_ligne numeric,
    frais_total_bc numeric,
    part_frais numeric
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        c.nom as article_nom,
        c.id as article_id,
        bc.numero_bon as bon_commande_numero,
        bc.statut as bc_statut,
        bc.frais_livraison,
        bc.frais_logistique,
        bc.transit_douane,
        bc.montant_ht,
        abc.quantite,
        abc.prix_unitaire,
        abc.montant_ligne,
        (COALESCE(bc.frais_livraison, 0) + COALESCE(bc.frais_logistique, 0) + COALESCE(bc.transit_douane, 0)) as frais_total_bc,
        CASE 
            WHEN bc.montant_ht > 0 
            THEN (COALESCE(bc.frais_livraison, 0) + COALESCE(bc.frais_logistique, 0) + COALESCE(bc.transit_douane, 0)) * (abc.montant_ligne / bc.montant_ht)
            ELSE 0
        END as part_frais
    FROM public.catalogue c
    JOIN public.articles_bon_commande abc ON c.id = abc.article_id
    JOIN public.bons_de_commande bc ON abc.bon_commande_id = bc.id
    WHERE c.statut = 'actif'
    ORDER BY c.nom, bc.numero_bon;
$$;

-- Créer une fonction pour vérifier spécifiquement les frais dans la vue
CREATE OR REPLACE FUNCTION public.debug_vue_marges_frais()
RETURNS TABLE(
    article_nom text,
    frais_bon_commande numeric,
    cout_total_unitaire numeric,
    nb_bons_commande bigint
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        vma.nom as article_nom,
        vma.frais_bon_commande,
        vma.cout_total_unitaire,
        COUNT(abc.id) as nb_bons_commande
    FROM public.vue_marges_articles vma
    LEFT JOIN public.articles_bon_commande abc ON vma.id = abc.article_id
    LEFT JOIN public.bons_de_commande bc ON abc.bon_commande_id = bc.id 
        AND bc.statut IN ('approuve', 'livre', 'receptionne')
    GROUP BY vma.id, vma.nom, vma.frais_bon_commande, vma.cout_total_unitaire
    ORDER BY vma.nom;
$$;
