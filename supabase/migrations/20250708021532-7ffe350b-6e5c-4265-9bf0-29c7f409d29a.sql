
-- 1) Vérifier les données existantes
SELECT 
  id, numero_facture, statut_paiement, montant_ttc
FROM public.factures_vente 
WHERE statut_paiement IN ('en_attente', 'partiellement_payee')
LIMIT 5;

-- 2) Créer/recréer la vue complète avec la bonne structure
DROP VIEW IF EXISTS public.vue_factures_impayees;
DROP VIEW IF EXISTS public.vue_factures_impayees_summary; 

-- 3) Création de la vue "Factures impayées"
CREATE VIEW public.vue_factures_impayees_summary AS
SELECT *
FROM public.vue_factures_vente_summary
WHERE statut_paiement IN ('En attente','Partiellement payée');

-- 4) Droits d'accès
GRANT SELECT ON public.vue_factures_vente_summary    TO anon, authenticated;
GRANT SELECT ON public.vue_factures_impayees_summary TO anon, authenticated;
