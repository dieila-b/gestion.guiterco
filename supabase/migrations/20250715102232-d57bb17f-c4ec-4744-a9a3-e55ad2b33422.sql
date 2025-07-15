-- Créer une vue pour les marges globales de stock
CREATE OR REPLACE VIEW public.vue_marges_globales_stock AS
SELECT 
    c.id,
    c.nom,
    c.reference,
    -- Agrégation des stocks par article
    COALESCE(SUM(sp.quantite_disponible), 0) + COALESCE(SUM(spv.quantite_disponible), 0) as stock_total,
    -- Données de marge depuis la vue existante
    vma.prix_achat,
    vma.prix_vente,
    vma.cout_total_unitaire,
    vma.marge_unitaire,
    vma.taux_marge,
    -- Calcul de la marge totale pour cet article
    CASE 
        WHEN (COALESCE(SUM(sp.quantite_disponible), 0) + COALESCE(SUM(spv.quantite_disponible), 0)) > 0
        THEN (COALESCE(SUM(sp.quantite_disponible), 0) + COALESCE(SUM(spv.quantite_disponible), 0)) * COALESCE(vma.marge_unitaire, 0)
        ELSE 0
    END as marge_totale_article,
    -- Valeur du stock au coût d'achat
    CASE 
        WHEN (COALESCE(SUM(sp.quantite_disponible), 0) + COALESCE(SUM(spv.quantite_disponible), 0)) > 0
        THEN (COALESCE(SUM(sp.quantite_disponible), 0) + COALESCE(SUM(spv.quantite_disponible), 0)) * COALESCE(vma.cout_total_unitaire, 0)
        ELSE 0
    END as valeur_stock_cout,
    -- Valeur du stock au prix de vente
    CASE 
        WHEN (COALESCE(SUM(sp.quantite_disponible), 0) + COALESCE(SUM(spv.quantite_disponible), 0)) > 0
        THEN (COALESCE(SUM(sp.quantite_disponible), 0) + COALESCE(SUM(spv.quantite_disponible), 0)) * COALESCE(vma.prix_vente, 0)
        ELSE 0
    END as valeur_stock_vente
FROM public.catalogue c
LEFT JOIN public.vue_marges_articles vma ON c.id = vma.id
LEFT JOIN public.stock_principal sp ON c.id = sp.article_id
LEFT JOIN public.stock_pdv spv ON c.id = spv.article_id
WHERE c.statut = 'actif'
GROUP BY c.id, c.nom, c.reference, vma.prix_achat, vma.prix_vente, vma.cout_total_unitaire, vma.marge_unitaire, vma.taux_marge
HAVING (COALESCE(SUM(sp.quantite_disponible), 0) + COALESCE(SUM(spv.quantite_disponible), 0)) > 0
ORDER BY c.nom;

-- Créer une fonction pour obtenir le résumé global des marges de stock
CREATE OR REPLACE FUNCTION public.get_resume_marges_globales_stock()
RETURNS TABLE(
    total_articles_en_stock bigint,
    valeur_totale_stock_cout numeric,
    valeur_totale_stock_vente numeric,
    marge_totale_globale numeric,
    taux_marge_moyen_pondere numeric
) 
LANGUAGE sql
SECURITY DEFINER
AS $function$
    SELECT 
        COUNT(*) as total_articles_en_stock,
        COALESCE(SUM(valeur_stock_cout), 0) as valeur_totale_stock_cout,
        COALESCE(SUM(valeur_stock_vente), 0) as valeur_totale_stock_vente,
        COALESCE(SUM(marge_totale_article), 0) as marge_totale_globale,
        CASE 
            WHEN COALESCE(SUM(valeur_stock_cout), 0) > 0
            THEN ROUND((COALESCE(SUM(marge_totale_article), 0) / COALESCE(SUM(valeur_stock_cout), 1)) * 100, 2)
            ELSE 0
        END as taux_marge_moyen_pondere
    FROM public.vue_marges_globales_stock;
$function$;