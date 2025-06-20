
-- Vérifier et corriger les contraintes de clés étrangères dans entrees_stock
-- D'abord, vérifier la contrainte existante
SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    confrelid::regclass AS foreign_table_name,
    a.attname AS column_name,
    af.attname AS foreign_column_name
FROM pg_constraint c
JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
JOIN pg_attribute af ON af.attrelid = c.confrelid AND af.attnum = ANY(c.confkey)
WHERE c.contype = 'f' AND c.conrelid = 'entrees_stock'::regclass;

-- Supprimer la contrainte problématique si elle existe
ALTER TABLE public.entrees_stock 
DROP CONSTRAINT IF EXISTS entrees_stock_article_id_fkey;

-- Recréer la contrainte correctement
ALTER TABLE public.entrees_stock 
ADD CONSTRAINT entrees_stock_article_id_fkey 
FOREIGN KEY (article_id) REFERENCES public.catalogue(id) ON DELETE CASCADE;

-- Vérifier que les données existantes respectent la contrainte
SELECT 
    es.id as entree_id,
    es.article_id,
    c.id as catalogue_id,
    c.nom as article_nom
FROM public.entrees_stock es
LEFT JOIN public.catalogue c ON es.article_id = c.id
WHERE c.id IS NULL;

-- Nettoyer les données orphelines s'il y en a
DELETE FROM public.entrees_stock 
WHERE article_id NOT IN (SELECT id FROM public.catalogue);
