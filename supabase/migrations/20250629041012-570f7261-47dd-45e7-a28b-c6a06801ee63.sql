
-- Analyser les doublons actuels (Achat + Correction pour les mêmes données)
WITH doublons_achat_correction AS (
    SELECT 
        article_id,
        entrepot_id,
        point_vente_id,
        quantite,
        COALESCE(fournisseur, 'N/A') as fournisseur_clean,
        DATE(created_at) as date_entree,
        COUNT(*) as nombre_occurrences,
        STRING_AGG(type_entree, ', ' ORDER BY type_entree) as types,
        ARRAY_AGG(id ORDER BY created_at) as tous_ids
    FROM public.entrees_stock
    GROUP BY article_id, entrepot_id, point_vente_id, quantite, COALESCE(fournisseur, 'N/A'), DATE(created_at)
    HAVING COUNT(*) > 1 
    AND COUNT(DISTINCT type_entree) > 1
    AND 'achat' = ANY(ARRAY_AGG(type_entree))
    AND 'correction' = ANY(ARRAY_AGG(type_entree))
)
SELECT 
    c.nom as article_nom,
    COALESCE(e.nom, pdv.nom) as lieu_nom,
    da.quantite,
    da.types,
    da.fournisseur_clean,
    da.date_entree,
    da.nombre_occurrences,
    da.tous_ids
FROM doublons_achat_correction da
LEFT JOIN public.catalogue c ON da.article_id = c.id
LEFT JOIN public.entrepots e ON da.entrepot_id = e.id
LEFT JOIN public.points_de_vente pdv ON da.point_vente_id = pdv.id
ORDER BY da.nombre_occurrences DESC, c.nom;

-- Supprimer les entrées de type "correction" qui sont des doublons d'achats
WITH doublons_correction_a_supprimer AS (
    SELECT es_correction.id
    FROM public.entrees_stock es_correction
    WHERE es_correction.type_entree = 'correction'
    AND EXISTS (
        SELECT 1 
        FROM public.entrees_stock es_achat
        WHERE es_achat.type_entree = 'achat'
        AND es_achat.article_id = es_correction.article_id
        AND COALESCE(es_achat.entrepot_id, es_achat.point_vente_id) = COALESCE(es_correction.entrepot_id, es_correction.point_vente_id)
        AND es_achat.quantite = es_correction.quantite
        AND COALESCE(es_achat.fournisseur, '') = COALESCE(es_correction.fournisseur, '')
        AND DATE(es_achat.created_at) = DATE(es_correction.created_at)
        AND es_achat.created_at < es_correction.created_at -- Garder l'achat, supprimer la correction
    )
)
DELETE FROM public.entrees_stock 
WHERE id IN (SELECT id FROM doublons_correction_a_supprimer);

-- Remplacer la fonction de trigger existante pour empêcher les doublons Achat/Correction
CREATE OR REPLACE FUNCTION public.check_duplicate_entree_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Vérifier s'il existe déjà une entrée similaire le même jour
    IF EXISTS (
        SELECT 1 
        FROM public.entrees_stock 
        WHERE article_id = NEW.article_id
        AND (
            (NEW.entrepot_id IS NOT NULL AND entrepot_id = NEW.entrepot_id) OR
            (NEW.point_vente_id IS NOT NULL AND point_vente_id = NEW.point_vente_id)
        )
        AND quantite = NEW.quantite
        AND type_entree = NEW.type_entree
        AND COALESCE(fournisseur, '') = COALESCE(NEW.fournisseur, '')
        AND DATE(created_at) = DATE(NEW.created_at)
        AND id != COALESCE(NEW.id, gen_random_uuid())
    ) THEN
        RAISE EXCEPTION 'Entrée de stock dupliquée détectée pour l''article le %', DATE(NEW.created_at);
    END IF;
    
    -- Empêcher spécifiquement les doublons Achat/Correction
    IF NEW.type_entree = 'correction' AND EXISTS (
        SELECT 1 
        FROM public.entrees_stock 
        WHERE article_id = NEW.article_id
        AND (
            (NEW.entrepot_id IS NOT NULL AND entrepot_id = NEW.entrepot_id) OR
            (NEW.point_vente_id IS NOT NULL AND point_vente_id = NEW.point_vente_id)
        )
        AND quantite = NEW.quantite
        AND type_entree = 'achat'
        AND COALESCE(fournisseur, '') = COALESCE(NEW.fournisseur, '')
        AND DATE(created_at) = DATE(NEW.created_at)
    ) THEN
        RAISE EXCEPTION 'Une entrée d''achat existe déjà pour cet article le %. Correction automatique bloquée.', DATE(NEW.created_at);
    END IF;
    
    IF NEW.type_entree = 'achat' AND EXISTS (
        SELECT 1 
        FROM public.entrees_stock 
        WHERE article_id = NEW.article_id
        AND (
            (NEW.entrepot_id IS NOT NULL AND entrepot_id = NEW.entrepot_id) OR
            (NEW.point_vente_id IS NOT NULL AND point_vente_id = NEW.point_vente_id)
        )
        AND quantite = NEW.quantite
        AND type_entree = 'correction'
        AND COALESCE(fournisseur, '') = COALESCE(NEW.fournisseur, '')
        AND DATE(created_at) = DATE(NEW.created_at)
    ) THEN
        RAISE EXCEPTION 'Une entrée de correction existe déjà pour cet article le %. Achat bloqué pour éviter le doublon.', DATE(NEW.created_at);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir un rapport du nettoyage effectué
CREATE OR REPLACE FUNCTION public.rapport_nettoyage_doublons()
RETURNS TABLE(
    statut text,
    message text,
    nombre integer
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 'Nettoyage effectué' as statut,
           'Entrées de type correction supprimées (doublons d''achats)' as message,
           0 as nombre -- Le nombre sera affiché après exécution
    
    UNION ALL
    
    SELECT 'État actuel' as statut,
           'Total entrées restantes' as message,
           COUNT(*)::integer as nombre
    FROM public.entrees_stock
    
    UNION ALL
    
    SELECT 'Vérification' as statut,
           'Doublons Achat/Correction restants' as message,
           COUNT(*)::integer as nombre
    FROM (
        SELECT article_id, entrepot_id, point_vente_id, quantite, 
               COALESCE(fournisseur, ''), DATE(created_at)
        FROM public.entrees_stock
        GROUP BY article_id, entrepot_id, point_vente_id, quantite, 
                 COALESCE(fournisseur, ''), DATE(created_at)
        HAVING COUNT(DISTINCT type_entree) > 1
        AND 'achat' = ANY(ARRAY_AGG(type_entree))
        AND 'correction' = ANY(ARRAY_AGG(type_entree))
    ) as doublons_restants;
$$;
