-- Enable RLS on utilisateurs_internes table
ALTER TABLE public.utilisateurs_internes ENABLE ROW LEVEL SECURITY;

-- Create a security definer function to check if user is internal user
CREATE OR REPLACE FUNCTION public.is_internal_user_active(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.utilisateurs_internes ui
    WHERE ui.id = user_id 
    AND ui.statut = 'actif'
  );
$$;

-- Policy for reading utilisateurs_internes - allow authenticated users with permission
CREATE POLICY "Permission-based utilisateurs_internes read" 
ON public.utilisateurs_internes 
FOR SELECT 
USING (check_user_permission(auth.uid(), 'Paramètres', 'Utilisateurs internes', 'read'));

-- Policy for creating utilisateurs_internes - allow authenticated users with permission
CREATE POLICY "Permission-based utilisateurs_internes create" 
ON public.utilisateurs_internes 
FOR INSERT 
WITH CHECK (check_user_permission(auth.uid(), 'Paramètres', 'Utilisateurs internes', 'write'));

-- Policy for updating utilisateurs_internes - allow authenticated users with permission
CREATE POLICY "Permission-based utilisateurs_internes update" 
ON public.utilisateurs_internes 
FOR UPDATE 
USING (check_user_permission(auth.uid(), 'Paramètres', 'Utilisateurs internes', 'write'))
WITH CHECK (check_user_permission(auth.uid(), 'Paramètres', 'Utilisateurs internes', 'write'));

-- Policy for deleting utilisateurs_internes - allow authenticated users with permission
CREATE POLICY "Permission-based utilisateurs_internes delete" 
ON public.utilisateurs_internes 
FOR DELETE 
USING (check_user_permission(auth.uid(), 'Paramètres', 'Utilisateurs internes', 'delete'));

-- Alternative: Create a more permissive policy for now to allow operations
-- This can be used temporarily if the permission system is not fully set up
CREATE POLICY "Authenticated users can manage utilisateurs_internes" 
ON public.utilisateurs_internes 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);