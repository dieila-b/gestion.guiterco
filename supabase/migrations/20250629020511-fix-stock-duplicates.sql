
-- Analyser les doublons dans les entrées de stock
WITH doublons_analyse AS (
    SELECT 
        article_id,
        entrepot_id,
        point_vente_id,
        quantite,
        type_entree,
        COALESCE(fournisseur, 'N/A') as fournisseur_clean,
        DATE(created_at) as date_entree,
        COUNT(*) as nombre_occurrences,
        ARRAY_AGG(id ORDER BY created_at) as tous_ids
    FROM public.entrees_stock
    GROUP BY article_id, entrepot_id, point_vente_id, quantite, type_entree, COALESCE(fournisseur, 'N/A'), DATE(created_at)
    HAVING COUNT(*) > 1
)
SELECT 
    c.nom as article_nom,
    COALESCE(e.nom, pdv.nom) as lieu_nom,
    da.quantite,
    da.type_entree,
    da.fournisseur_clean,
    da.date_entree,
    da.nombre_occurrences,
    da.tous_ids
FROM doublons_analyse da
LEFT JOIN public.catalogue c ON da.article_id = c.id
LEFT JOIN public.entrepots e ON da.entrepot_id = e.id
LEFT JOIN public.points_de_vente pdv ON da.point_vente_id = pdv.id
ORDER BY da.nombre_occurrences DESC, c.nom;

-- Supprimer les doublons en gardant le premier enregistrement (par date de création)
WITH doublons_a_supprimer AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (
            PARTITION BY 
                article_id, 
                COALESCE(entrepot_id::text, '') || COALESCE(point_vente_id::text, ''), 
                quantite, 
                type_entree, 
                COALESCE(fournisseur, 'N/A'),
                DATE(created_at)
            ORDER BY created_at ASC
        ) as rang
    FROM public.entrees_stock
)
DELETE FROM public.entrees_stock 
WHERE id IN (
    SELECT id 
    FROM doublons_a_supprimer 
    WHERE rang > 1
);

-- Fonction pour vérifier les doublons potentiels avant insertion
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
        AND id != NEW.id
    ) THEN
        RAISE EXCEPTION 'Entrée de stock dupliquée détectée pour l''article le %', DATE(NEW.created_at);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger de vérification des doublons
DROP TRIGGER IF EXISTS trigger_check_duplicate_entree ON public.entrees_stock;
CREATE TRIGGER trigger_check_duplicate_entree
    BEFORE INSERT OR UPDATE ON public.entrees_stock
    FOR EACH ROW EXECUTE FUNCTION public.check_duplicate_entree_stock();

-- Fonction pour récupérer un rapport de nettoyage
CREATE OR REPLACE FUNCTION public.rapport_nettoyage_entrees_stock()
RETURNS TABLE(
    action text,
    nombre_lignes integer,
    details text
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 'Entrées totales' as action, 
           COUNT(*)::integer as nombre_lignes,
           'Total des entrées dans la base' as details
    FROM public.entrees_stock
    
    UNION ALL
    
    SELECT 'Entrées par type' as action,
           COUNT(*)::integer as nombre_lignes,
           type_entree as details
    FROM public.entrees_stock
    GROUP BY type_entree
    
    UNION ALL
    
    SELECT 'Contraintes actives' as action,
           1 as nombre_lignes,
           'Protection anti-doublons activée' as details;
$$;
