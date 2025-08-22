
-- Fonction pour rafraîchir toutes les vues matérialisées et synchroniser les données
CREATE OR REPLACE FUNCTION public.refresh_stock_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Rafraîchir les vues matérialisées si elles existent
    BEGIN
        REFRESH MATERIALIZED VIEW CONCURRENTLY public.vue_stock_complet;
    EXCEPTION 
        WHEN undefined_table THEN
            -- La vue n'existe pas, on la crée
            CREATE MATERIALIZED VIEW IF NOT EXISTS public.vue_stock_complet AS
            SELECT 
                COALESCE(sp.id, spv.id) as id,
                COALESCE(sp.article_id, spv.article_id) as article_id,
                sp.entrepot_id,
                spv.point_vente_id,
                CASE 
                    WHEN sp.id IS NOT NULL THEN 'entrepot'
                    ELSE 'point_vente'
                END as type_stock,
                COALESCE(sp.quantite_disponible, spv.quantite_disponible, 0) as quantite_disponible,
                sp.quantite_reservee,
                sp.emplacement,
                sp.derniere_entree,
                sp.derniere_sortie,
                spv.quantite_minimum,
                spv.derniere_livraison,
                COALESCE(sp.created_at, spv.created_at) as created_at,
                COALESCE(sp.updated_at, spv.updated_at) as updated_at,
                -- Données article
                c.reference as article_reference,
                c.nom as article_nom,
                c.prix_vente,
                c.prix_achat,
                c.statut as article_statut,
                -- Données catégorie
                cc.nom as categorie_nom,
                -- Données unité
                u.nom as unite_nom,
                u.symbole as unite_symbole,
                -- Données localisation
                COALESCE(e.nom, pdv.nom) as location_nom
            FROM public.stock_principal sp
            FULL OUTER JOIN public.stock_pdv spv ON sp.article_id = spv.article_id
            LEFT JOIN public.catalogue c ON COALESCE(sp.article_id, spv.article_id) = c.id
            LEFT JOIN public.categories_catalogue cc ON c.categorie_id = cc.id
            LEFT JOIN public.unites u ON c.unite_id = u.id
            LEFT JOIN public.entrepots e ON sp.entrepot_id = e.id
            LEFT JOIN public.points_de_vente pdv ON spv.point_vente_id = pdv.id
            WHERE COALESCE(sp.quantite_disponible, spv.quantite_disponible, 0) > 0;
            
            -- Créer l'index unique pour le rafraîchissement concurrent
            CREATE UNIQUE INDEX IF NOT EXISTS vue_stock_complet_idx ON public.vue_stock_complet (id);
    END;
    
    BEGIN
        REFRESH MATERIALIZED VIEW CONCURRENTLY public.vue_catalogue_optimise;
    EXCEPTION 
        WHEN undefined_table THEN
            -- La vue n'existe pas, on la crée
            CREATE MATERIALIZED VIEW IF NOT EXISTS public.vue_catalogue_optimise AS
            SELECT 
                c.id,
                c.reference,
                c.nom,
                c.description,
                c.prix_vente,
                c.prix_achat,
                c.prix_unitaire,
                c.statut,
                c.seuil_alerte,
                c.image_url,
                c.created_at,
                c.updated_at,
                -- Données catégorie
                cc.nom as categorie,
                cc.couleur as categorie_couleur,
                -- Données unité
                u.nom as unite_mesure,
                u.symbole as unite_symbole,
                -- Relations pour compatibilité
                jsonb_build_object('nom', cc.nom, 'couleur', cc.couleur) as categories,
                jsonb_build_object('nom', u.nom, 'symbole', u.symbole, 'type_unite', u.type_unite) as unites
            FROM public.catalogue c
            LEFT JOIN public.categories_catalogue cc ON c.categorie_id = cc.id
            LEFT JOIN public.unites u ON c.unite_id = u.id
            WHERE c.statut = 'actif';
            
            -- Créer l'index unique pour le rafraîchissement concurrent
            CREATE UNIQUE INDEX IF NOT EXISTS vue_catalogue_optimise_idx ON public.vue_catalogue_optimise (id);
    END;
    
    RAISE NOTICE 'Vues matérialisées rafraîchies avec succès';
END;
$$;

-- Fonction pour obtenir les statistiques complètes du tableau de bord
CREATE OR REPLACE FUNCTION public.get_dashboard_complete_stats()
RETURNS TABLE(
    total_catalogue bigint,
    stock_global bigint,
    valeur_stock_achat numeric,
    valeur_stock_vente numeric,
    marge_globale_stock numeric,
    marge_pourcentage numeric,
    nb_entrepots bigint,
    nb_pdv bigint,
    nb_clients bigint,
    nb_fournisseurs bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        -- Articles en catalogue
        (SELECT COUNT(*) FROM public.catalogue WHERE statut = 'actif')::bigint as total_catalogue,
        
        -- Stock global (entrepôts + PDV)
        (COALESCE(
            (SELECT SUM(quantite_disponible) FROM public.stock_principal), 0
        ) + COALESCE(
            (SELECT SUM(quantite_disponible) FROM public.stock_pdv), 0
        ))::bigint as stock_global,
        
        -- Valeur stock achat
        COALESCE((
            SELECT SUM(sp.quantite_disponible * COALESCE(c.prix_achat, c.prix_unitaire, 0))
            FROM public.stock_principal sp
            JOIN public.catalogue c ON sp.article_id = c.id
            WHERE sp.quantite_disponible > 0
        ), 0) + COALESCE((
            SELECT SUM(spv.quantite_disponible * COALESCE(c.prix_achat, c.prix_unitaire, 0))
            FROM public.stock_pdv spv
            JOIN public.catalogue c ON spv.article_id = c.id
            WHERE spv.quantite_disponible > 0
        ), 0) as valeur_stock_achat,
        
        -- Valeur stock vente
        COALESCE((
            SELECT SUM(sp.quantite_disponible * COALESCE(c.prix_vente, c.prix_unitaire, 0))
            FROM public.stock_principal sp
            JOIN public.catalogue c ON sp.article_id = c.id
            WHERE sp.quantite_disponible > 0
        ), 0) + COALESCE((
            SELECT SUM(spv.quantite_disponible * COALESCE(c.prix_vente, c.prix_unitaire, 0))
            FROM public.stock_pdv spv
            JOIN public.catalogue c ON spv.article_id = c.id
            WHERE spv.quantite_disponible > 0
        ), 0) as valeur_stock_vente,
        
        -- Marge globale (calculée côté serveur)
        COALESCE((
            SELECT SUM(sp.quantite_disponible * (COALESCE(c.prix_vente, c.prix_unitaire, 0) - COALESCE(c.prix_achat, c.prix_unitaire, 0)))
            FROM public.stock_principal sp
            JOIN public.catalogue c ON sp.article_id = c.id
            WHERE sp.quantite_disponible > 0
        ), 0) + COALESCE((
            SELECT SUM(spv.quantite_disponible * (COALESCE(c.prix_vente, c.prix_unitaire, 0) - COALESCE(c.prix_achat, c.prix_unitaire, 0)))
            FROM public.stock_pdv spv
            JOIN public.catalogue c ON spv.article_id = c.id
            WHERE spv.quantite_disponible > 0
        ), 0) as marge_globale_stock,
        
        -- Pourcentage de marge
        CASE 
            WHEN (COALESCE((
                SELECT SUM(sp.quantite_disponible * COALESCE(c.prix_achat, c.prix_unitaire, 0))
                FROM public.stock_principal sp
                JOIN public.catalogue c ON sp.article_id = c.id
                WHERE sp.quantite_disponible > 0
            ), 0) + COALESCE((
                SELECT SUM(spv.quantite_disponible * COALESCE(c.prix_achat, c.prix_unitaire, 0))
                FROM public.stock_pdv spv
                JOIN public.catalogue c ON spv.article_id = c.id
                WHERE spv.quantite_disponible > 0
            ), 0)) > 0
            THEN ROUND(((COALESCE((
                SELECT SUM(sp.quantite_disponible * (COALESCE(c.prix_vente, c.prix_unitaire, 0) - COALESCE(c.prix_achat, c.prix_unitaire, 0)))
                FROM public.stock_principal sp
                JOIN public.catalogue c ON sp.article_id = c.id
                WHERE sp.quantite_disponible > 0
            ), 0) + COALESCE((
                SELECT SUM(spv.quantite_disponible * (COALESCE(c.prix_vente, c.prix_unitaire, 0) - COALESCE(c.prix_achat, c.prix_unitaire, 0)))
                FROM public.stock_pdv spv
                JOIN public.catalogue c ON spv.article_id = c.id
                WHERE spv.quantite_disponible > 0
            ), 0)) / (COALESCE((
                SELECT SUM(sp.quantite_disponible * COALESCE(c.prix_achat, c.prix_unitaire, 0))
                FROM public.stock_principal sp
                JOIN public.catalogue c ON sp.article_id = c.id
                WHERE sp.quantite_disponible > 0
            ), 0) + COALESCE((
                SELECT SUM(spv.quantite_disponible * COALESCE(c.prix_achat, c.prix_unitaire, 0))
                FROM public.stock_pdv spv
                JOIN public.catalogue c ON spv.article_id = c.id
                WHERE spv.quantite_disponible > 0
            ), 0))) * 100, 2)
            ELSE 0
        END as marge_pourcentage,
        
        -- Nombre d'entrepôts actifs
        (SELECT COUNT(*) FROM public.entrepots WHERE statut = 'actif')::bigint as nb_entrepots,
        
        -- Nombre de points de vente actifs
        (SELECT COUNT(*) FROM public.points_de_vente WHERE statut = 'actif')::bigint as nb_pdv,
        
        -- Nombre de clients actifs
        (SELECT COUNT(*) FROM public.clients WHERE statut_client = 'actif')::bigint as nb_clients,
        
        -- Nombre de fournisseurs
        (SELECT COUNT(*) FROM public.fournisseurs)::bigint as nb_fournisseurs;
END;
$$;
