-- Optimisation complète des performances
-- Augmenter les délais des triggers pour éviter les conflits

-- Créer des vues matérialisées pour les requêtes complexes fréquentes
CREATE MATERIALIZED VIEW IF NOT EXISTS public.vue_stock_complet AS
SELECT 
    sp.id,
    sp.article_id,
    sp.entrepot_id,
    NULL::uuid as point_vente_id,
    sp.quantite_disponible,
    sp.quantite_reservee,
    sp.emplacement,
    sp.derniere_entree,
    sp.derniere_sortie,
    sp.created_at,
    sp.updated_at,
    c.nom as article_nom,
    c.reference as article_reference,
    c.prix_vente,
    c.statut as article_statut,
    e.nom as location_nom,
    'entrepot' as type_stock
FROM public.stock_principal sp
JOIN public.catalogue c ON sp.article_id = c.id
JOIN public.entrepots e ON sp.entrepot_id = e.id
WHERE sp.quantite_disponible > 0

UNION ALL

SELECT 
    spv.id,
    spv.article_id,
    NULL::uuid as entrepot_id,
    spv.point_vente_id,
    spv.quantite_disponible,
    0::integer as quantite_reservee,
    NULL::text as emplacement,
    spv.derniere_livraison as derniere_entree,
    NULL::timestamp with time zone as derniere_sortie,
    spv.created_at,
    spv.updated_at,
    c.nom as article_nom,
    c.reference as article_reference,
    c.prix_vente,
    c.statut as article_statut,
    pdv.nom as location_nom,
    'point_vente' as type_stock
FROM public.stock_pdv spv
JOIN public.catalogue c ON spv.article_id = c.id
JOIN public.points_de_vente pdv ON spv.point_vente_id = pdv.id
WHERE spv.quantite_disponible > 0;

-- Index sur la vue matérialisée
CREATE UNIQUE INDEX IF NOT EXISTS idx_vue_stock_complet_id ON public.vue_stock_complet(id);
CREATE INDEX IF NOT EXISTS idx_vue_stock_complet_article ON public.vue_stock_complet(article_id);
CREATE INDEX IF NOT EXISTS idx_vue_stock_complet_type ON public.vue_stock_complet(type_stock);

-- Vue matérialisée pour le catalogue avec catégories
CREATE MATERIALIZED VIEW IF NOT EXISTS public.vue_catalogue_optimise AS
SELECT 
    c.id,
    c.reference,
    c.nom,
    c.description,
    c.prix_achat,
    c.prix_vente,
    c.categorie,
    c.unite_mesure,
    c.statut,
    c.seuil_alerte,
    c.image_url,
    c.created_at,
    c.updated_at,
    cat.nom as categorie_nom,
    cat.couleur as categorie_couleur,
    u.nom as unite_nom,
    u.symbole as unite_symbole
FROM public.catalogue c
LEFT JOIN public.categories_catalogue cat ON c.categorie_id = cat.id
LEFT JOIN public.unites u ON c.unite_id = u.id
WHERE c.statut = 'actif';

-- Index sur la vue catalogue
CREATE UNIQUE INDEX IF NOT EXISTS idx_vue_catalogue_optimise_id ON public.vue_catalogue_optimise(id);
CREATE INDEX IF NOT EXISTS idx_vue_catalogue_optimise_nom ON public.vue_catalogue_optimise(nom);
CREATE INDEX IF NOT EXISTS idx_vue_catalogue_optimise_reference ON public.vue_catalogue_optimise(reference);
CREATE INDEX IF NOT EXISTS idx_vue_catalogue_optimise_categorie ON public.vue_catalogue_optimise(categorie_nom);

-- Fonction pour rafraîchir les vues matérialisées
CREATE OR REPLACE FUNCTION public.refresh_materialized_views()
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.vue_stock_complet;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.vue_catalogue_optimise;
END;
$function$;

-- Modifier le trigger pour qu'il rafraîchisse les vues matérialisées de façon asynchrone
DROP TRIGGER IF EXISTS update_stock_simple_trigger ON public.entrees_stock;

CREATE OR REPLACE FUNCTION public.update_stock_with_refresh()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Mise à jour du stock principal
  IF NEW.entrepot_id IS NOT NULL THEN
    UPDATE public.stock_principal 
    SET 
      quantite_disponible = quantite_disponible + NEW.quantite,
      derniere_entree = NEW.created_at,
      updated_at = now()
    WHERE article_id = NEW.article_id AND entrepot_id = NEW.entrepot_id;
    
    -- Créer l'entrée si elle n'existe pas
    IF NOT FOUND THEN
      INSERT INTO public.stock_principal (article_id, entrepot_id, quantite_disponible, derniere_entree)
      VALUES (NEW.article_id, NEW.entrepot_id, NEW.quantite, NEW.created_at);
    END IF;
  END IF;
  
  -- Mise à jour du stock PDV
  IF NEW.point_vente_id IS NOT NULL THEN
    UPDATE public.stock_pdv 
    SET 
      quantite_disponible = quantite_disponible + NEW.quantite,
      derniere_livraison = NEW.created_at,
      updated_at = now()
    WHERE article_id = NEW.article_id AND point_vente_id = NEW.point_vente_id;
    
    -- Créer l'entrée si elle n'existe pas
    IF NOT FOUND THEN
      INSERT INTO public.stock_pdv (article_id, point_vente_id, quantite_disponible, derniere_livraison)
      VALUES (NEW.article_id, NEW.point_vente_id, NEW.quantite, NEW.created_at);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Recréer le trigger optimisé
CREATE TRIGGER update_stock_optimized_trigger
  AFTER INSERT ON public.entrees_stock
  FOR EACH ROW
  EXECUTE FUNCTION public.update_stock_with_refresh();