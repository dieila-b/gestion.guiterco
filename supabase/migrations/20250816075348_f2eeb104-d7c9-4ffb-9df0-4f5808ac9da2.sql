
-- 1. Vérifier la présence des données dans les tables principales
SELECT 'catalogue' as table_name, count(*) as count FROM public.catalogue
UNION ALL
SELECT 'categories_catalogue' as table_name, count(*) as count FROM public.categories_catalogue
UNION ALL
SELECT 'unites' as table_name, count(*) as count FROM public.unites
UNION ALL
SELECT 'stock_principal' as table_name, count(*) as count FROM public.stock_principal
UNION ALL
SELECT 'stock_pdv' as table_name, count(*) as count FROM public.stock_pdv;

-- 2. Examiner quelques produits du catalogue
SELECT id, nom, reference, statut, prix_vente, categorie, created_at 
FROM public.catalogue 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. Vérifier les statuts des produits
SELECT statut, count(*) as count 
FROM public.catalogue 
GROUP BY statut;

-- 4. Vérifier l'état RLS et les policies sur la table catalogue
SELECT schemaname, tablename, rowsecurity, policies
FROM (
    SELECT schemaname, tablename, rowsecurity,
           array_agg(policyname) as policies
    FROM pg_tables 
    LEFT JOIN pg_policies ON pg_tables.tablename = pg_policies.tablename
    WHERE pg_tables.tablename = 'catalogue'
    GROUP BY schemaname, pg_tables.tablename, rowsecurity
) t;

-- 5. Corriger les politiques RLS sur la table catalogue
-- Supprimer les anciennes politiques restrictives
DROP POLICY IF EXISTS "SECURE_catalogue_delete" ON public.catalogue;
DROP POLICY IF EXISTS "SECURE_catalogue_insert" ON public.catalogue;
DROP POLICY IF EXISTS "SECURE_catalogue_read" ON public.catalogue;
DROP POLICY IF EXISTS "SECURE_catalogue_update" ON public.catalogue;

-- Créer des politiques plus permissives pour la lecture (temporaire pour diagnostic)
CREATE POLICY "Authenticated users can read catalogue"
ON public.catalogue
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Politiques strictes pour modification (seulement utilisateurs avec permissions)
CREATE POLICY "Internal users can manage catalogue"
ON public.catalogue
FOR ALL
USING (
  auth.uid() IS NOT NULL 
  AND is_internal_user() 
  AND check_user_permission_strict('Catalogue', NULL, 'write')
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND is_internal_user() 
  AND check_user_permission_strict('Catalogue', NULL, 'write')
);

-- 6. Vérifier les relations et contraintes
SELECT 
  c.nom as article_nom,
  cat.nom as categorie_nom,
  u.nom as unite_nom,
  c.statut,
  c.prix_vente
FROM public.catalogue c
LEFT JOIN public.categories_catalogue cat ON c.categorie_id = cat.id
LEFT JOIN public.unites u ON c.unite_id = u.id
LIMIT 5;

-- 7. Vérifier le stock associé
SELECT 
  c.nom as article_nom,
  sp.quantite_disponible as stock_entrepot,
  spv.quantite_disponible as stock_pdv
FROM public.catalogue c
LEFT JOIN public.stock_principal sp ON c.id = sp.article_id
LEFT JOIN public.stock_pdv spv ON c.id = spv.article_id
WHERE c.statut = 'actif'
LIMIT 5;

-- 8. Ajouter des commentaires de sécurité
COMMENT ON POLICY "Authenticated users can read catalogue" ON public.catalogue 
IS 'Permet la lecture du catalogue pour tous les utilisateurs authentifiés - Policy temporaire pour diagnostic';

COMMENT ON POLICY "Internal users can manage catalogue" ON public.catalogue 
IS 'Permet la gestion complète du catalogue seulement aux utilisateurs internes avec permissions appropriées';
