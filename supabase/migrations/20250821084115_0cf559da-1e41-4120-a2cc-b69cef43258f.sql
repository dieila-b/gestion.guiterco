-- Rafraîchir immédiatement les vues matérialisées pour éviter les erreurs
REFRESH MATERIALIZED VIEW CONCURRENTLY public.vue_stock_complet;
REFRESH MATERIALIZED VIEW CONCURRENTLY public.vue_catalogue_optimise;

-- Créer des index additionnels pour les requêtes les plus fréquentes
CREATE INDEX IF NOT EXISTS idx_catalogue_prix_vente ON public.catalogue(prix_vente) WHERE prix_vente IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_stock_pdv_point_vente_article ON public.stock_pdv(point_vente_id, article_id);
CREATE INDEX IF NOT EXISTS idx_stock_principal_article_entrepot ON public.stock_principal(article_id, entrepot_id);

-- Optimiser les requêtes de configuration
CREATE INDEX IF NOT EXISTS idx_entrepots_statut_nom ON public.entrepots(statut, nom);
CREATE INDEX IF NOT EXISTS idx_points_de_vente_statut_nom ON public.points_de_vente(statut, nom);
CREATE INDEX IF NOT EXISTS idx_unites_nom ON public.unites(nom);

-- Créer une fonction pour les statistiques rapides
CREATE OR REPLACE FUNCTION public.get_quick_stats()
RETURNS TABLE(
    total_articles bigint,
    total_stock_entrepots bigint,
    total_stock_pdv bigint,
    total_entrepots bigint,
    total_pdv bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM catalogue WHERE statut = 'actif') as total_articles,
        (SELECT COALESCE(SUM(quantite_disponible), 0) FROM stock_principal) as total_stock_entrepots,
        (SELECT COALESCE(SUM(quantite_disponible), 0) FROM stock_pdv) as total_stock_pdv,
        (SELECT COUNT(*) FROM entrepots WHERE statut = 'actif') as total_entrepots,
        (SELECT COUNT(*) FROM points_de_vente WHERE statut = 'actif') as total_pdv;
END;
$function$;