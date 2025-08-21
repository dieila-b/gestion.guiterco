
-- Mettre à jour la table catalogue pour ajouter les foreign keys manquantes
ALTER TABLE public.catalogue 
ADD CONSTRAINT fk_catalogue_categorie 
FOREIGN KEY (categorie_id) REFERENCES public.categories_catalogue(id);

ALTER TABLE public.catalogue 
ADD CONSTRAINT fk_catalogue_unite 
FOREIGN KEY (unite_id) REFERENCES public.unites(id);

-- Mettre à jour la table stock_principal pour ajouter les foreign keys
ALTER TABLE public.stock_principal 
ADD CONSTRAINT fk_stock_principal_article 
FOREIGN KEY (article_id) REFERENCES public.catalogue(id);

ALTER TABLE public.stock_principal 
ADD CONSTRAINT fk_stock_principal_entrepot 
FOREIGN KEY (entrepot_id) REFERENCES public.entrepots(id);

-- Mettre à jour la table stock_pdv pour ajouter les foreign keys
ALTER TABLE public.stock_pdv 
ADD CONSTRAINT fk_stock_pdv_article 
FOREIGN KEY (article_id) REFERENCES public.catalogue(id);

ALTER TABLE public.stock_pdv 
ADD CONSTRAINT fk_stock_pdv_point_vente 
FOREIGN KEY (point_vente_id) REFERENCES public.points_de_vente(id);

-- Créer ou recréer la vue matérialisée optimisée pour le stock complet
DROP MATERIALIZED VIEW IF EXISTS public.vue_stock_complet;

CREATE MATERIALIZED VIEW public.vue_stock_complet AS
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
    'entrepot'::text as type_stock,
    c.reference as article_reference,
    c.nom as article_nom,
    c.prix_vente,
    c.prix_achat,
    c.statut as article_statut,
    cat.nom as categorie_nom,
    u.nom as unite_nom,
    u.symbole as unite_symbole,
    e.nom as location_nom,
    jsonb_build_object('nom', cat.nom) as categories,
    jsonb_build_object('nom', u.nom, 'symbole', u.symbole) as unites
FROM public.stock_principal sp
LEFT JOIN public.catalogue c ON sp.article_id = c.id
LEFT JOIN public.categories_catalogue cat ON c.categorie_id = cat.id
LEFT JOIN public.unites u ON c.unite_id = u.id
LEFT JOIN public.entrepots e ON sp.entrepot_id = e.id
WHERE sp.quantite_disponible > 0

UNION ALL

SELECT 
    spv.id,
    spv.article_id,
    NULL::uuid as entrepot_id,
    spv.point_vente_id,
    spv.quantite_disponible,
    0 as quantite_reservee,
    NULL::text as emplacement,
    spv.derniere_livraison as derniere_entree,
    NULL::timestamp as derniere_sortie,
    spv.created_at,
    spv.updated_at,
    'point_vente'::text as type_stock,
    c.reference as article_reference,
    c.nom as article_nom,
    c.prix_vente,
    c.prix_achat,
    c.statut as article_statut,
    cat.nom as categorie_nom,
    u.nom as unite_nom,
    u.symbole as unite_symbole,
    pdv.nom as location_nom,
    jsonb_build_object('nom', cat.nom) as categories,
    jsonb_build_object('nom', u.nom, 'symbole', u.symbole) as unites
FROM public.stock_pdv spv
LEFT JOIN public.catalogue c ON spv.article_id = c.id
LEFT JOIN public.categories_catalogue cat ON c.categorie_id = cat.id
LEFT JOIN public.unites u ON c.unite_id = u.id
LEFT JOIN public.points_de_vente pdv ON spv.point_vente_id = pdv.id
WHERE spv.quantite_disponible > 0;

-- Créer un index unique pour permettre REFRESH CONCURRENTLY
CREATE UNIQUE INDEX idx_vue_stock_complet_unique ON public.vue_stock_complet (id, type_stock);

-- Créer ou recréer la vue matérialisée pour le catalogue optimisé
DROP MATERIALIZED VIEW IF EXISTS public.vue_catalogue_optimise;

CREATE MATERIALIZED VIEW public.vue_catalogue_optimise AS
SELECT 
    c.id,
    c.reference,
    c.nom,
    c.description,
    c.prix_achat,
    c.prix_vente,
    c.prix_unitaire,
    c.seuil_alerte,
    c.image_url,
    c.statut,
    c.created_at,
    c.updated_at,
    c.categorie_id,
    c.unite_id,
    c.frais_logistique,
    c.frais_douane,
    c.frais_transport,
    c.autres_frais,
    cat.nom as categorie,
    cat.couleur as categorie_couleur,
    u.nom as unite_mesure,
    u.symbole as unite_symbole,
    jsonb_build_object('nom', cat.nom, 'couleur', cat.couleur) as categories,
    jsonb_build_object('nom', u.nom, 'symbole', u.symbole) as unites
FROM public.catalogue c
LEFT JOIN public.categories_catalogue cat ON c.categorie_id = cat.id
LEFT JOIN public.unites u ON c.unite_id = u.id
WHERE c.statut = 'actif';

-- Créer un index unique pour le catalogue
CREATE UNIQUE INDEX idx_vue_catalogue_optimise_unique ON public.vue_catalogue_optimise (id);

-- Fonction pour rafraîchir les vues matérialisées
CREATE OR REPLACE FUNCTION public.refresh_stock_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.vue_stock_complet;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.vue_catalogue_optimise;
END;
$$;

-- Trigger pour rafraîchir automatiquement les vues lors des modifications
CREATE OR REPLACE FUNCTION public.trigger_refresh_stock_views()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Rafraîchir les vues de manière asynchrone
    PERFORM public.refresh_stock_views();
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Supprimer les anciens triggers s'ils existent
DROP TRIGGER IF EXISTS tr_refresh_views_on_catalogue_change ON public.catalogue;
DROP TRIGGER IF EXISTS tr_refresh_views_on_stock_principal_change ON public.stock_principal;
DROP TRIGGER IF EXISTS tr_refresh_views_on_stock_pdv_change ON public.stock_pdv;
DROP TRIGGER IF EXISTS tr_refresh_views_on_categories_change ON public.categories_catalogue;
DROP TRIGGER IF EXISTS tr_refresh_views_on_unites_change ON public.unites;

-- Créer les nouveaux triggers
CREATE TRIGGER tr_refresh_views_on_catalogue_change
    AFTER INSERT OR UPDATE OR DELETE ON public.catalogue
    FOR EACH STATEMENT
    EXECUTE FUNCTION public.trigger_refresh_stock_views();

CREATE TRIGGER tr_refresh_views_on_stock_principal_change
    AFTER INSERT OR UPDATE OR DELETE ON public.stock_principal
    FOR EACH STATEMENT
    EXECUTE FUNCTION public.trigger_refresh_stock_views();

CREATE TRIGGER tr_refresh_views_on_stock_pdv_change
    AFTER INSERT OR UPDATE OR DELETE ON public.stock_pdv
    FOR EACH STATEMENT
    EXECUTE FUNCTION public.trigger_refresh_stock_views();

CREATE TRIGGER tr_refresh_views_on_categories_change
    AFTER INSERT OR UPDATE OR DELETE ON public.categories_catalogue
    FOR EACH STATEMENT
    EXECUTE FUNCTION public.trigger_refresh_stock_views();

CREATE TRIGGER tr_refresh_views_on_unites_change
    AFTER INSERT OR UPDATE OR DELETE ON public.unites
    FOR EACH STATEMENT
    EXECUTE FUNCTION public.trigger_refresh_stock_views();

-- Rafraîchir immédiatement les vues
SELECT public.refresh_stock_views();
