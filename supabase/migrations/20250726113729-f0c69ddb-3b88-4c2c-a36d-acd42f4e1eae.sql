-- Créer la vue vue_marges_globales_stock manquante
CREATE OR REPLACE VIEW public.vue_marges_globales_stock AS
SELECT 
    c.id,
    c.nom,
    c.reference,
    COALESCE(sp.quantite_disponible, 0) + COALESCE(spv.quantite_disponible, 0) as stock_total,
    c.prix_achat,
    c.prix_vente,
    COALESCE(vma.cout_total_unitaire, c.prix_achat, 0) as cout_total_unitaire,
    COALESCE(vma.marge_unitaire, GREATEST(c.prix_vente - c.prix_achat, 0), 0) as marge_unitaire,
    COALESCE(vma.taux_marge, 
        CASE 
            WHEN COALESCE(c.prix_achat, 0) > 0 
            THEN ROUND(((c.prix_vente - c.prix_achat) / c.prix_achat * 100), 2)
            ELSE 0
        END, 0) as taux_marge,
    COALESCE(vma.marge_unitaire, GREATEST(c.prix_vente - c.prix_achat, 0), 0) * 
    (COALESCE(sp.quantite_disponible, 0) + COALESCE(spv.quantite_disponible, 0)) as marge_totale_article,
    COALESCE(vma.cout_total_unitaire, c.prix_achat, 0) * 
    (COALESCE(sp.quantite_disponible, 0) + COALESCE(spv.quantite_disponible, 0)) as valeur_stock_cout,
    COALESCE(c.prix_vente, 0) * 
    (COALESCE(sp.quantite_disponible, 0) + COALESCE(spv.quantite_disponible, 0)) as valeur_stock_vente
FROM public.catalogue c
LEFT JOIN (
    SELECT article_id, SUM(quantite_disponible) as quantite_disponible
    FROM public.stock_principal 
    GROUP BY article_id
) sp ON c.id = sp.article_id
LEFT JOIN (
    SELECT article_id, SUM(quantite_disponible) as quantite_disponible
    FROM public.stock_pdv 
    GROUP BY article_id
) spv ON c.id = spv.article_id
LEFT JOIN public.vue_marges_articles vma ON c.id = vma.id
WHERE c.statut = 'actif'
AND (COALESCE(sp.quantite_disponible, 0) + COALESCE(spv.quantite_disponible, 0)) > 0;