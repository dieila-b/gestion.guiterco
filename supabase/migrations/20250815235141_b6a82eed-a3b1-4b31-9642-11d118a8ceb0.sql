-- CRITICAL SECURITY FIX: Customer Personal Information Protection
-- Address security vulnerability in clients table RLS policies

-- Drop existing vulnerable policies
DROP POLICY IF EXISTS "STRICT_clients_read" ON public.clients;
DROP POLICY IF EXISTS "STRICT_clients_insert" ON public.clients;
DROP POLICY IF EXISTS "STRICT_clients_update" ON public.clients;
DROP POLICY IF EXISTS "STRICT_clients_delete" ON public.clients;

-- Create new secure policies with explicit authentication checks
-- These policies ensure that:
-- 1. Only authenticated users can access client data
-- 2. Only internal users with proper permissions can access client data
-- 3. No access is granted if authentication fails or permissions are misconfigured

CREATE POLICY "SECURE_clients_read" 
ON public.clients 
FOR SELECT 
TO authenticated
USING (
  -- Explicit authentication check AND permission check
  auth.uid() IS NOT NULL 
  AND is_internal_user() 
  AND check_user_permission_strict('Clients'::text, NULL::text, 'read'::text)
);

CREATE POLICY "SECURE_clients_insert" 
ON public.clients 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Explicit authentication check AND permission check
  auth.uid() IS NOT NULL 
  AND is_internal_user() 
  AND check_user_permission_strict('Clients'::text, NULL::text, 'write'::text)
);

CREATE POLICY "SECURE_clients_update" 
ON public.clients 
FOR UPDATE 
TO authenticated
USING (
  -- Explicit authentication check AND permission check
  auth.uid() IS NOT NULL 
  AND is_internal_user() 
  AND check_user_permission_strict('Clients'::text, NULL::text, 'write'::text)
)
WITH CHECK (
  -- Double protection for updates
  auth.uid() IS NOT NULL 
  AND is_internal_user() 
  AND check_user_permission_strict('Clients'::text, NULL::text, 'write'::text)
);

CREATE POLICY "SECURE_clients_delete" 
ON public.clients 
FOR DELETE 
TO authenticated
USING (
  -- Explicit authentication check AND permission check
  auth.uid() IS NOT NULL 
  AND is_internal_user() 
  AND check_user_permission_strict('Clients'::text, NULL::text, 'delete'::text)
);

-- Ensure the table has RLS enabled (should already be enabled)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owner (additional security layer)
ALTER TABLE public.clients FORCE ROW LEVEL SECURITY;

-- Add security comment
COMMENT ON TABLE public.clients IS 'PROTECTED: Contains sensitive customer personal information (PII) including names, emails, phone numbers, and addresses. Access strictly controlled via multi-layer RLS policies requiring authentication + internal user status + specific permissions.';

-- Additional security: Create a function to log client data access attempts
CREATE OR REPLACE FUNCTION public.log_client_access_attempt()
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  -- This function can be extended to log access attempts
  -- For now, it serves as a placeholder for audit functionality
  NULL;
END;
$$;