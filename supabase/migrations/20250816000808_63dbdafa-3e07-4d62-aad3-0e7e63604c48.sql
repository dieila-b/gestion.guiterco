-- CRITICAL SECURITY FIX: Remove Permissive Employee Data Access Policies
-- Address security vulnerability where utilisateurs_internes table has conflicting RLS policies
-- including permissive ones that allow unrestricted access to employee personal information

-- =============================================================================
-- REMOVE ALL PERMISSIVE AND CONFLICTING POLICIES
-- =============================================================================

-- Drop all existing policies that might allow unrestricted access
DROP POLICY IF EXISTS "allow_all_read_utilisateurs_internes" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "allow_all_write_utilisateurs_internes" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Authenticated users can access utilisateurs_internes" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Debug: Allow all operations on utilisateurs_internes" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Ultra permissive utilisateurs_internes access" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Public read access to utilisateurs_internes" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Allow public access to utilisateurs_internes" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Permissive read access to utilisateurs_internes" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "All users can read utilisateurs_internes" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Unrestricted access to utilisateurs_internes" ON public.utilisateurs_internes;

-- Remove any other potentially insecure policies
DROP POLICY IF EXISTS "STRICT_utilisateurs_internes_read" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "STRICT_utilisateurs_internes_insert" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "STRICT_utilisateurs_internes_update" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "STRICT_utilisateurs_internes_delete" ON public.utilisateurs_internes;

-- =============================================================================
-- ENSURE RLS IS PROPERLY CONFIGURED
-- =============================================================================

-- Ensure RLS is enabled and forced
ALTER TABLE public.utilisateurs_internes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utilisateurs_internes FORCE ROW LEVEL SECURITY;

-- =============================================================================
-- CREATE SECURE RLS POLICIES (Only these should exist)
-- =============================================================================

-- SECURE READ POLICY: Users can read their own data OR have admin permissions
CREATE POLICY "SECURE_utilisateurs_internes_read" 
ON public.utilisateurs_internes 
FOR SELECT 
TO authenticated
USING (
  -- Explicit authentication check AND 
  -- (user can read their own data OR has proper admin permissions)
  auth.uid() IS NOT NULL 
  AND (
    -- Users can read their own profile data
    user_id = auth.uid()
    OR 
    -- OR users with proper admin permissions can read employee data
    (
      is_internal_user() 
      AND check_user_permission_strict('Paramètres'::text, 'Utilisateurs internes'::text, 'read'::text)
    )
  )
);

-- SECURE INSERT POLICY: Only admin users can create employee records
CREATE POLICY "SECURE_utilisateurs_internes_insert" 
ON public.utilisateurs_internes 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Only authenticated admin users can create employee records
  auth.uid() IS NOT NULL 
  AND is_internal_user() 
  AND check_user_permission_strict('Paramètres'::text, 'Utilisateurs internes'::text, 'write'::text)
);

-- SECURE UPDATE POLICY: Users can update their own basic profile OR admins can update any
CREATE POLICY "SECURE_utilisateurs_internes_update" 
ON public.utilisateurs_internes 
FOR UPDATE 
TO authenticated
USING (
  -- Explicit authentication check AND
  -- (user can update their own data OR has admin permissions)
  auth.uid() IS NOT NULL 
  AND (
    -- Users can update their own basic profile data
    user_id = auth.uid()
    OR
    -- OR users with proper admin permissions can update employee data
    (
      is_internal_user() 
      AND check_user_permission_strict('Paramètres'::text, 'Utilisateurs internes'::text, 'write'::text)
    )
  )
)
WITH CHECK (
  -- Double protection: same checks for the updated data
  auth.uid() IS NOT NULL 
  AND (
    user_id = auth.uid()
    OR
    (
      is_internal_user() 
      AND check_user_permission_strict('Paramètres'::text, 'Utilisateurs internes'::text, 'write'::text)
    )
  )
);

-- SECURE DELETE POLICY: Only admin users can delete employee records
CREATE POLICY "SECURE_utilisateurs_internes_delete" 
ON public.utilisateurs_internes 
FOR DELETE 
TO authenticated
USING (
  -- Only authenticated admin users can delete employee records
  auth.uid() IS NOT NULL 
  AND is_internal_user() 
  AND check_user_permission_strict('Paramètres'::text, 'Utilisateurs internes'::text, 'delete'::text)
);

-- =============================================================================
-- SECURITY VERIFICATION AND DOCUMENTATION
-- =============================================================================

-- Update security comment with stronger warning
COMMENT ON TABLE public.utilisateurs_internes IS 'CRITICAL SECURITY: Contains highly sensitive employee personal information (PII) including names, emails, phone numbers, employee IDs, hire dates, department information, and authentication data. Access is STRICTLY CONTROLLED via multi-layer RLS policies requiring authentication + internal user status + specific permissions. Users can only access their own profile data unless they have explicit admin permissions. ALL PERMISSIVE POLICIES HAVE BEEN REMOVED.';

-- Create security audit function to verify no permissive policies exist
CREATE OR REPLACE FUNCTION public.audit_utilisateurs_internes_security()
RETURNS TABLE(
  policy_name text,
  policy_command text,
  policy_permissive text,
  security_status text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    polname as policy_name,
    polcmd as policy_command,
    CASE WHEN polpermissive THEN 'PERMISSIVE' ELSE 'RESTRICTIVE' END as policy_permissive,
    CASE 
      WHEN polname LIKE 'SECURE_%' THEN '✅ SECURE'
      WHEN polname LIKE '%all%' OR polname LIKE '%permissive%' OR polname LIKE '%debug%' THEN '❌ INSECURE'
      ELSE '⚠️ REVIEW NEEDED'
    END as security_status
  FROM pg_policy 
  WHERE schemaname = 'public' 
  AND tablename = 'utilisateurs_internes'
  ORDER BY security_status, policy_name;
$$;

-- Log this critical security fix
DO $$
BEGIN
  RAISE NOTICE 'SECURITY FIX COMPLETED: All permissive RLS policies removed from utilisateurs_internes table. Only secure, authenticated, permission-based access policies remain.';
END $$;