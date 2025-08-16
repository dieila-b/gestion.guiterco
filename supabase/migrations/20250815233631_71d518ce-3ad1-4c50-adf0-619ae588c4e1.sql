-- SECURITY FIX: Remove dangerous SECURITY DEFINER functions that bypass RLS policies
-- These functions expose sensitive data without proper authorization checks

-- Remove debug functions that expose sensitive margin data
DROP FUNCTION IF EXISTS public.debug_vue_marges_frais();
DROP FUNCTION IF EXISTS public.debug_frais_articles();
DROP FUNCTION IF EXISTS public.debug_frais_articles_detaille();
DROP FUNCTION IF EXISTS public.debug_frais_repartition_unitaire();

-- Create secure alternatives that respect RLS and require proper permissions
CREATE OR REPLACE FUNCTION public.get_margin_debug_data()
RETURNS TABLE(
  article_nom text, 
  frais_bon_commande numeric, 
  cout_total_unitaire numeric, 
  nb_bons_commande bigint
)
LANGUAGE sql
STABLE
SET search_path = public
AS $function$
  -- Only allow access if user has permission to view margin reports
  SELECT 
    vma.nom as article_nom,
    vma.frais_bon_commande,
    vma.cout_total_unitaire,
    COUNT(abc.id) as nb_bons_commande
  FROM public.vue_marges_articles vma
  LEFT JOIN public.articles_bon_commande abc ON vma.id = abc.article_id
  LEFT JOIN public.bons_de_commande bc ON abc.bon_commande_id = bc.id 
    AND bc.statut IN ('approuve', 'livre', 'receptionne')
  WHERE public.check_user_permission_strict('Rapports', 'Marges', 'read')
  GROUP BY vma.id, vma.nom, vma.frais_bon_commande, vma.cout_total_unitaire
  ORDER BY vma.nom;
$function$;

-- Add comment explaining the security change
COMMENT ON FUNCTION public.get_margin_debug_data() IS 'Secure replacement for debug_vue_marges_frais - Respects RLS and requires Rapports.Marges.read permission';

-- Remove other potentially dangerous debug functions
DROP FUNCTION IF EXISTS public.debug_auth_context();
DROP FUNCTION IF EXISTS public.debug_auth_info();
DROP FUNCTION IF EXISTS public.debug_current_user();

-- Keep only essential SECURITY DEFINER functions with proper authorization
-- Functions like check_user_permission_strict, is_internal_user, etc. are needed for the permission system