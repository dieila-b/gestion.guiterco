
-- Ajouter les colonnes de frais à la table catalogue pour les coûts unitaires
ALTER TABLE public.catalogue 
ADD COLUMN frais_logistique NUMERIC DEFAULT 0,
ADD COLUMN frais_douane NUMERIC DEFAULT 0,
ADD COLUMN frais_transport NUMERIC DEFAULT 0,
ADD COLUMN autres_frais NUMERIC DEFAULT 0;

-- Créer une vue pour calculer automatiquement les marges des articles
CREATE OR REPLACE VIEW public.vue_marges_articles AS
SELECT 
    c.id,
    c.nom,
    c.reference,
    c.prix_achat,
    c.prix_vente,
    c.frais_logistique,
    c.frais_douane,
    c.frais_transport,
    c.autres_frais,
    -- Calcul du coût total unitaire
    COALESCE(c.prix_achat, 0) + 
    COALESCE(c.frais_logistique, 0) + 
    COALESCE(c.frais_douane, 0) + 
    COALESCE(c.frais_transport, 0) + 
    COALESCE(c.autres_frais, 0) AS cout_total_unitaire,
    -- Calcul de la marge unitaire
    COALESCE(c.prix_vente, 0) - (
        COALESCE(c.prix_achat, 0) + 
        COALESCE(c.frais_logistique, 0) + 
        COALESCE(c.frais_douane, 0) + 
        COALESCE(c.frais_transport, 0) + 
        COALESCE(c.autres_frais, 0)
    ) AS marge_unitaire,
    -- Calcul du taux de marge (éviter division par zéro)
    CASE 
        WHEN (COALESCE(c.prix_achat, 0) + 
              COALESCE(c.frais_logistique, 0) + 
              COALESCE(c.frais_douane, 0) + 
              COALESCE(c.frais_transport, 0) + 
              COALESCE(c.autres_frais, 0)) > 0
        THEN ROUND(
            ((COALESCE(c.prix_vente, 0) - (
                COALESCE(c.prix_achat, 0) + 
                COALESCE(c.frais_logistique, 0) + 
                COALESCE(c.frais_douane, 0) + 
                COALESCE(c.frais_transport, 0) + 
                COALESCE(c.autres_frais, 0)
            )) / (
                COALESCE(c.prix_achat, 0) + 
                COALESCE(c.frais_logistique, 0) + 
                COALESCE(c.frais_douane, 0) + 
                COALESCE(c.frais_transport, 0) + 
                COALESCE(c.autres_frais, 0)
            )) * 100, 2
        )
        ELSE 0
    END AS taux_marge,
    c.created_at,
    c.updated_at
FROM public.catalogue c
WHERE c.statut = 'actif';

-- Créer une fonction pour calculer les bénéfices par facture
CREATE OR REPLACE FUNCTION public.get_factures_avec_marges()
RETURNS TABLE(
    facture_id uuid,
    numero_facture text,
    date_facture timestamp with time zone,
    client_nom text,
    montant_ttc numeric,
    cout_total numeric,
    benefice_total numeric,
    taux_marge_global numeric
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        fv.id as facture_id,
        fv.numero_facture,
        fv.date_facture,
        c.nom as client_nom,
        fv.montant_ttc,
        COALESCE(SUM(
            lfv.quantite * (
                COALESCE(vma.cout_total_unitaire, 0)
            )
        ), 0) as cout_total,
        COALESCE(SUM(
            lfv.quantite * COALESCE(vma.marge_unitaire, 0)
        ), 0) as benefice_total,
        CASE 
            WHEN COALESCE(SUM(
                lfv.quantite * (
                    COALESCE(vma.cout_total_unitaire, 0)
                )
            ), 0) > 0
            THEN ROUND(
                (COALESCE(SUM(
                    lfv.quantite * COALESCE(vma.marge_unitaire, 0)
                ), 0) / COALESCE(SUM(
                    lfv.quantite * (
                        COALESCE(vma.cout_total_unitaire, 0)
                    )
                ), 1)) * 100, 2
            )
            ELSE 0
        END as taux_marge_global
    FROM public.factures_vente fv
    JOIN public.clients c ON fv.client_id = c.id
    LEFT JOIN public.lignes_facture_vente lfv ON fv.id = lfv.facture_vente_id
    LEFT JOIN public.vue_marges_articles vma ON lfv.article_id = vma.id
    GROUP BY fv.id, fv.numero_facture, fv.date_facture, c.nom, fv.montant_ttc
    ORDER BY fv.date_facture DESC;
$$;

-- Créer une fonction pour les rapports de marge par période
CREATE OR REPLACE FUNCTION public.get_rapport_marges_periode(
    date_debut timestamp with time zone,
    date_fin timestamp with time zone
)
RETURNS TABLE(
    total_ventes numeric,
    total_couts numeric,
    benefice_total numeric,
    taux_marge_moyen numeric,
    nombre_factures bigint
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        COALESCE(SUM(fv.montant_ttc), 0) as total_ventes,
        COALESCE(SUM(
            lfv.quantite * (
                COALESCE(vma.cout_total_unitaire, 0)
            )
        ), 0) as total_couts,
        COALESCE(SUM(
            lfv.quantite * COALESCE(vma.marge_unitaire, 0)
        ), 0) as benefice_total,
        CASE 
            WHEN COALESCE(SUM(
                lfv.quantite * (
                    COALESCE(vma.cout_total_unitaire, 0)
                )
            ), 0) > 0
            THEN ROUND(
                (COALESCE(SUM(
                    lfv.quantite * COALESCE(vma.marge_unitaire, 0)
                ), 0) / COALESCE(SUM(
                    lfv.quantite * (
                        COALESCE(vma.cout_total_unitaire, 0)
                    )
                ), 1)) * 100, 2
            )
            ELSE 0
        END as taux_marge_moyen,
        COUNT(DISTINCT fv.id) as nombre_factures
    FROM public.factures_vente fv
    LEFT JOIN public.lignes_facture_vente lfv ON fv.id = lfv.facture_vente_id
    LEFT JOIN public.vue_marges_articles vma ON lfv.article_id = vma.id
    WHERE fv.date_facture >= date_debut 
    AND fv.date_facture <= date_fin;
$$;
