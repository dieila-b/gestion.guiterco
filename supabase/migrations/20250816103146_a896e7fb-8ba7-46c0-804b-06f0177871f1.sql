
-- 1. Vérifier l'intégrité des données et counts
SELECT 'catalogue' as table_name, count(*) as count FROM public.catalogue
UNION ALL
SELECT 'categories_catalogue' as table_name, count(*) as count FROM public.categories_catalogue  
UNION ALL
SELECT 'unites' as table_name, count(*) as count FROM public.unites
UNION ALL
SELECT 'stock_principal' as table_name, count(*) as count FROM public.stock_principal
UNION ALL
SELECT 'stock_pdv' as table_name, count(*) as count FROM public.stock_pdv
UNION ALL
SELECT 'utilisateurs_internes' as table_name, count(*) as count FROM public.utilisateurs_internes
UNION ALL
SELECT 'clients' as table_name, count(*) as count FROM public.clients
UNION ALL
SELECT 'factures_vente' as table_name, count(*) as count FROM public.factures_vente
UNION ALL
SELECT 'roles' as table_name, count(*) as count FROM public.roles
UNION ALL
SELECT 'permissions' as table_name, count(*) as count FROM public.permissions;

-- 2. Examiner les derniers produits du catalogue
SELECT id, nom, reference, statut, prix_vente, categorie, created_at 
FROM public.catalogue 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. Vérifier les utilisateurs internes 
SELECT id, email, prenom, nom, statut, type_compte, role_id, created_at
FROM public.utilisateurs_internes 
ORDER BY created_at DESC 
LIMIT 10;

-- 4. Vérifier l'état RLS et les policies sur les tables critiques
SELECT 
    schemaname,
    tablename, 
    rowsecurity as rls_enabled,
    array_agg(DISTINCT policyname) as policies
FROM pg_tables 
LEFT JOIN pg_policies ON pg_tables.tablename = pg_policies.tablename
WHERE pg_tables.tablename IN ('catalogue', 'utilisateurs_internes', 'clients', 'factures_vente')
  AND pg_tables.schemaname = 'public'
GROUP BY schemaname, pg_tables.tablename, rowsecurity
ORDER BY tablename;

-- 5. Détail des policies sur catalogue
SELECT 
    polname as policy_name,
    polcmd as command,
    polpermissive as permissive,
    polroles as roles,
    polqual as using_expression,
    polwithcheck as with_check_expression
FROM pg_policy 
WHERE polrelid = 'public.catalogue'::regclass;

-- 6. Détail des policies sur utilisateurs_internes  
SELECT 
    polname as policy_name,
    polcmd as command,
    polpermissive as permissive,
    polroles as roles,
    polqual as using_expression,
    polwithcheck as with_check_expression
FROM pg_policy 
WHERE polrelid = 'public.utilisateurs_internes'::regclass;

-- 7. Vérifier les relations et jointures critiques
SELECT 
    c.nom as article_nom,
    c.reference,
    cat.nom as categorie_nom,
    u.nom as unite_nom,
    c.statut,
    c.prix_vente,
    sp.quantite_disponible as stock_entrepot
FROM public.catalogue c
LEFT JOIN public.categories_catalogue cat ON c.categorie_id = cat.id
LEFT JOIN public.unites u ON c.unite_id = u.id  
LEFT JOIN public.stock_principal sp ON c.id = sp.article_id
WHERE c.statut = 'actif'
LIMIT 5;

-- 8. Vérifier les rôles et permissions des utilisateurs
SELECT 
    ui.email,
    ui.statut,
    r.name as role_name,
    r.description as role_description
FROM public.utilisateurs_internes ui
LEFT JOIN public.roles r ON ui.role_id = r.id
WHERE ui.statut = 'actif'
LIMIT 5;

-- 9. Test d'accès en tant qu'utilisateur authentifié
-- Simuler une requête avec auth.uid() pour voir si les policies bloquent
SELECT 
    'Simulation test access' as test_type,
    count(*) as accessible_products
FROM public.catalogue
WHERE statut = 'actif';

-- 10. Vérifier la fonction is_internal_user()
SELECT 
    'Function test' as test_type,
    public.is_internal_user() as is_internal_result;

-- 11. Créer des policies de debug temporaires pour diagnostic
-- ATTENTION: Ces policies sont temporaires pour le diagnostic uniquement
DROP POLICY IF EXISTS "DEBUG_catalogue_read_all" ON public.catalogue;
CREATE POLICY "DEBUG_catalogue_read_all"
ON public.catalogue
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "DEBUG_utilisateurs_internes_read_all" ON public.utilisateurs_internes;  
CREATE POLICY "DEBUG_utilisateurs_internes_read_all"
ON public.utilisateurs_internes
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "DEBUG_clients_read_all" ON public.clients;
CREATE POLICY "DEBUG_clients_read_all" 
ON public.clients
FOR SELECT
USING (true);

-- 12. Commentaires pour traçabilité
COMMENT ON POLICY "DEBUG_catalogue_read_all" ON public.catalogue 
IS 'POLICY DE DEBUG TEMPORAIRE - Permet lecture libre du catalogue pour diagnostic urgence - À SUPPRIMER après résolution';

COMMENT ON POLICY "DEBUG_utilisateurs_internes_read_all" ON public.utilisateurs_internes
IS 'POLICY DE DEBUG TEMPORAIRE - Permet lecture libre des utilisateurs pour diagnostic urgence - À SUPPRIMER après résolution';

COMMENT ON POLICY "DEBUG_clients_read_all" ON public.clients
IS 'POLICY DE DEBUG TEMPORAIRE - Permet lecture libre des clients pour diagnostic urgence - À SUPPRIMER après résolution';
