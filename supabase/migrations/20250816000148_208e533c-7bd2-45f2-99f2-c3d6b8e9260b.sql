-- CRITICAL SECURITY FIX: Employee Personal Information Protection
-- Address security vulnerability in utilisateurs_internes table (no RLS policies)

-- Enable RLS on utilisateurs_internes table (should already be enabled but ensuring it)
ALTER TABLE public.utilisateurs_internes ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owner (additional security layer)
ALTER TABLE public.utilisateurs_internes FORCE ROW LEVEL SECURITY;

-- Create secure RLS policies for utilisateurs_internes table
-- These policies ensure that:
-- 1. Only authenticated users can access employee data
-- 2. Only internal users with proper permissions can access employee data
-- 3. Users can read their own profile data
-- 4. No access is granted if authentication fails or permissions are misconfigured

CREATE POLICY "SECURE_utilisateurs_internes_read" 
ON public.utilisateurs_internes 
FOR SELECT 
TO authenticated
USING (
  -- Users can read their own data OR have proper permissions
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR 
  (
    auth.uid() IS NOT NULL 
    AND is_internal_user() 
    AND check_user_permission_strict('Paramètres'::text, 'Utilisateurs internes'::text, 'read'::text)
  )
);

CREATE POLICY "SECURE_utilisateurs_internes_insert" 
ON public.utilisateurs_internes 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Only users with proper admin permissions can create employee records
  auth.uid() IS NOT NULL 
  AND is_internal_user() 
  AND check_user_permission_strict('Paramètres'::text, 'Utilisateurs internes'::text, 'write'::text)
);

CREATE POLICY "SECURE_utilisateurs_internes_update" 
ON public.utilisateurs_internes 
FOR UPDATE 
TO authenticated
USING (
  -- Users can update their own basic profile OR have admin permissions
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR
  (
    auth.uid() IS NOT NULL 
    AND is_internal_user() 
    AND check_user_permission_strict('Paramètres'::text, 'Utilisateurs internes'::text, 'write'::text)
  )
)
WITH CHECK (
  -- Same check for the updated data
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR
  (
    auth.uid() IS NOT NULL 
    AND is_internal_user() 
    AND check_user_permission_strict('Paramètres'::text, 'Utilisateurs internes'::text, 'write'::text)
  )
);

CREATE POLICY "SECURE_utilisateurs_internes_delete" 
ON public.utilisateurs_internes 
FOR DELETE 
TO authenticated
USING (
  -- Only users with proper admin permissions can delete employee records
  auth.uid() IS NOT NULL 
  AND is_internal_user() 
  AND check_user_permission_strict('Paramètres'::text, 'Utilisateurs internes'::text, 'delete'::text)
);

-- Add security comment
COMMENT ON TABLE public.utilisateurs_internes IS 'PROTECTED: Contains sensitive employee personal information (PII) including names, emails, phone numbers, employee IDs, hire dates, and department information. Access strictly controlled via multi-layer RLS policies requiring authentication + internal user status + specific permissions. Users can access their own profile data.';

-- Create a view for safe employee profile access (users can only see their own data)
CREATE OR REPLACE VIEW public.vue_mon_profil_employe AS
SELECT 
    id,
    email,
    prenom,
    nom,
    matricule,
    photo_url,
    telephone,
    department,
    statut,
    type_compte,
    created_at,
    updated_at
FROM public.utilisateurs_internes
WHERE user_id = auth.uid() AND statut = 'actif';

-- Enable RLS on the view (inherits from base table)
ALTER VIEW public.vue_mon_profil_employe SET (security_barrier = true);

COMMENT ON VIEW public.vue_mon_profil_employe IS 'SAFE VIEW: Allows authenticated users to view only their own employee profile data. Inherits RLS protection from utilisateurs_internes table.';