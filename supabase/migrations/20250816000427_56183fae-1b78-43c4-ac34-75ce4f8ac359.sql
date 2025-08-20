-- CRITICAL SECURITY FIX: Inventory and Pricing Information Protection
-- Address security vulnerability where catalogue, stock_principal, and stock_pdv tables
-- are publicly accessible, potentially exposing business-critical pricing and inventory data

-- =============================================================================
-- FIX 1: CATALOGUE TABLE - Remove public access, implement proper restrictions
-- =============================================================================

-- Drop all existing permissive policies on catalogue table
DROP POLICY IF EXISTS "Debug: Allow all access to catalogue" ON public.catalogue;
DROP POLICY IF EXISTS "Debug: Allow public read access to catalogue" ON public.catalogue;
DROP POLICY IF EXISTS "Ultra permissive catalogue access" ON public.catalogue;
DROP POLICY IF EXISTS "STRICT_catalogue_read" ON public.catalogue;
DROP POLICY IF EXISTS "STRICT_catalogue_insert" ON public.catalogue;
DROP POLICY IF EXISTS "STRICT_catalogue_update" ON public.catalogue;
DROP POLICY IF EXISTS "STRICT_catalogue_delete" ON public.catalogue;

-- Create secure RLS policies for catalogue table
CREATE POLICY "SECURE_catalogue_read" 
ON public.catalogue 
FOR SELECT 
TO authenticated
USING (
  -- Only authenticated internal users with proper permissions can read catalogue
  auth.uid() IS NOT NULL 
  AND is_internal_user() 
  AND check_user_permission_strict('Catalogue'::text, NULL::text, 'read'::text)
);

CREATE POLICY "SECURE_catalogue_insert" 
ON public.catalogue 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Only authenticated internal users with write permissions can add products
  auth.uid() IS NOT NULL 
  AND is_internal_user() 
  AND check_user_permission_strict('Catalogue'::text, NULL::text, 'write'::text)
);

CREATE POLICY "SECURE_catalogue_update" 
ON public.catalogue 
FOR UPDATE 
TO authenticated
USING (
  -- Only authenticated internal users with write permissions can update products
  auth.uid() IS NOT NULL 
  AND is_internal_user() 
  AND check_user_permission_strict('Catalogue'::text, NULL::text, 'write'::text)
)
WITH CHECK (
  -- Double protection for updates
  auth.uid() IS NOT NULL 
  AND is_internal_user() 
  AND check_user_permission_strict('Catalogue'::text, NULL::text, 'write'::text)
);

CREATE POLICY "SECURE_catalogue_delete" 
ON public.catalogue 
FOR DELETE 
TO authenticated
USING (
  -- Only authenticated internal users with delete permissions can remove products
  auth.uid() IS NOT NULL 
  AND is_internal_user() 
  AND check_user_permission_strict('Catalogue'::text, NULL::text, 'delete'::text)
);

-- =============================================================================
-- FIX 2: STOCK_PRINCIPAL TABLE - Implement RLS policies
-- =============================================================================

-- Enable RLS on stock_principal table
ALTER TABLE public.stock_principal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_principal FORCE ROW LEVEL SECURITY;

-- Create secure RLS policies for stock_principal table
CREATE POLICY "SECURE_stock_principal_read" 
ON public.stock_principal 
FOR SELECT 
TO authenticated
USING (
  -- Only authenticated internal users with stock permissions can read inventory
  auth.uid() IS NOT NULL 
  AND is_internal_user() 
  AND (
    check_user_permission_strict('Stock'::text, 'Entrepôts'::text, 'read'::text)
    OR check_user_permission_strict('Stock'::text, 'Mouvements'::text, 'read'::text)
    OR check_user_permission_strict('Dashboard'::text, NULL::text, 'read'::text)
  )
);

CREATE POLICY "SECURE_stock_principal_write" 
ON public.stock_principal 
FOR ALL 
TO authenticated
USING (
  -- Only authenticated internal users with stock write permissions can modify inventory
  auth.uid() IS NOT NULL 
  AND is_internal_user() 
  AND check_user_permission_strict('Stock'::text, 'Entrepôts'::text, 'write'::text)
)
WITH CHECK (
  -- Double protection for modifications
  auth.uid() IS NOT NULL 
  AND is_internal_user() 
  AND check_user_permission_strict('Stock'::text, 'Entrepôts'::text, 'write'::text)
);

-- =============================================================================
-- FIX 3: STOCK_PDV TABLE - Implement RLS policies
-- =============================================================================

-- Enable RLS on stock_pdv table
ALTER TABLE public.stock_pdv ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_pdv FORCE ROW LEVEL SECURITY;

-- Create secure RLS policies for stock_pdv table
CREATE POLICY "SECURE_stock_pdv_read" 
ON public.stock_pdv 
FOR SELECT 
TO authenticated
USING (
  -- Only authenticated internal users with stock permissions can read PDV inventory
  auth.uid() IS NOT NULL 
  AND is_internal_user() 
  AND (
    check_user_permission_strict('Stock'::text, 'PDV'::text, 'read'::text)
    OR check_user_permission_strict('Stock'::text, 'Mouvements'::text, 'read'::text)
    OR check_user_permission_strict('Dashboard'::text, NULL::text, 'read'::text)
  )
);

CREATE POLICY "SECURE_stock_pdv_write" 
ON public.stock_pdv 
FOR ALL 
TO authenticated
USING (
  -- Only authenticated internal users with PDV write permissions can modify inventory
  auth.uid() IS NOT NULL 
  AND is_internal_user() 
  AND check_user_permission_strict('Stock'::text, 'PDV'::text, 'write'::text)
)
WITH CHECK (
  -- Double protection for modifications
  auth.uid() IS NOT NULL 
  AND is_internal_user() 
  AND check_user_permission_strict('Stock'::text, 'PDV'::text, 'write'::text)
);

-- =============================================================================
-- SECURITY DOCUMENTATION AND COMMENTS
-- =============================================================================

-- Add security comments to protect business-critical data
COMMENT ON TABLE public.catalogue IS 'PROTECTED: Contains sensitive business data including product pricing, costs, profit margins, and supplier information. Access strictly controlled via RLS policies requiring authentication + internal user status + specific permissions. Public access PROHIBITED.';

COMMENT ON TABLE public.stock_principal IS 'PROTECTED: Contains sensitive inventory levels and stock information for warehouses. Access strictly controlled via RLS policies requiring authentication + internal user status + stock permissions. Public access PROHIBITED.';

COMMENT ON TABLE public.stock_pdv IS 'PROTECTED: Contains sensitive inventory levels and stock information for points of sale. Access strictly controlled via RLS policies requiring authentication + internal user status + stock permissions. Public access PROHIBITED.';

-- =============================================================================
-- ADDITIONAL SECURITY MEASURES
-- =============================================================================

-- Create audit function for critical business data access
CREATE OR REPLACE FUNCTION public.log_business_data_access(table_name text, operation text)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  -- This function can be extended to log access to sensitive business data
  -- For compliance and security auditing purposes
  NULL;
END;
$$;