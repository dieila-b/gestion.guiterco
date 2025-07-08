
-- 1. Supprimer les policies liées aux vues factures impayées
DROP POLICY IF EXISTS "Tout le monde peut voir les factures impayées" ON public.vue_factures_impayees_summary;

-- 2. Supprimer toutes les vues factures impayées
DROP VIEW IF EXISTS public.vue_factures_impayees_summary;
DROP VIEW IF EXISTS public.vue_factures_impayees;

-- 3. Supprimer toutes les fonctions liées aux factures impayées
DROP FUNCTION IF EXISTS public.get_factures_impayees_complete();
DROP FUNCTION IF EXISTS public.get_factures_impayees();

-- 4. Vérifier que la vue principale et sa fonction RPC existent toujours
-- (Ces requêtes ne feront que vérifier l'existence, pas les modifier)
SELECT 1 FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name = 'vue_factures_vente_summary';

SELECT 1 FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'get_factures_vente_with_details';

-- 5. Invalider le cache PostgREST en notifiant les changements de schéma
NOTIFY pgrst, 'reload schema';
