-- CRITICAL SECURITY FIX: Remove overly permissive public access to clients table
-- This addresses the critical vulnerability where customer PII was exposed to public

-- Drop all overly permissive policies that allow unrestricted public access
DROP POLICY IF EXISTS "Clients are publicly deletable" ON public.clients;
DROP POLICY IF EXISTS "Clients are publicly readable" ON public.clients;
DROP POLICY IF EXISTS "Clients are publicly updatable" ON public.clients;
DROP POLICY IF EXISTS "Clients are publicly writable" ON public.clients;
DROP POLICY IF EXISTS "select_all_clients" ON public.clients;

-- Keep only the strict permission-based policies that require proper authentication and authorization
-- These policies use the check_user_permission_strict function to verify user has proper permissions

-- The remaining policies will be:
-- STRICT_clients_read: Only users with 'Clients' read permission can view client data
-- STRICT_clients_insert: Only users with 'Clients' write permission can create clients
-- STRICT_clients_update: Only users with 'Clients' write permission can update clients  
-- STRICT_clients_delete: Only users with 'Clients' delete permission can delete clients

-- Verify RLS is enabled on clients table
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Add audit logging for client data access (future enhancement)
COMMENT ON TABLE public.clients IS 'Customer personal information - STRICTLY CONTROLLED ACCESS - Contains PII including names, emails, phone numbers, addresses';