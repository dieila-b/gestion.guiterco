-- Vérifier les policies RLS existantes sur utilisateurs_internes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'utilisateurs_internes';

-- S'assurer que RLS est activé sur la table
ALTER TABLE public.utilisateurs_internes ENABLE ROW LEVEL SECURITY;

-- Créer une policy pour permettre l'insertion via Edge Function (service role)
DROP POLICY IF EXISTS "Service role can insert users" ON public.utilisateurs_internes;
CREATE POLICY "Service role can insert users" 
ON public.utilisateurs_internes 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Créer une policy pour permettre la lecture via Edge Function
DROP POLICY IF EXISTS "Service role can read users" ON public.utilisateurs_internes;
CREATE POLICY "Service role can read users" 
ON public.utilisateurs_internes 
FOR SELECT 
TO service_role
USING (true);

-- Policy pour les utilisateurs internes actifs de lire tous les utilisateurs
DROP POLICY IF EXISTS "Internal users can read all users" ON public.utilisateurs_internes;
CREATE POLICY "Internal users can read all users" 
ON public.utilisateurs_internes 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.utilisateurs_internes ui 
    WHERE ui.id = auth.uid() 
    AND ui.statut = 'actif'
  )
);

-- Policy pour les administrateurs de gérer les utilisateurs
DROP POLICY IF EXISTS "Admins can manage users" ON public.utilisateurs_internes;
CREATE POLICY "Admins can manage users" 
ON public.utilisateurs_internes 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.utilisateurs_internes ui 
    WHERE ui.id = auth.uid() 
    AND ui.statut = 'actif' 
    AND ui.type_compte = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.utilisateurs_internes ui 
    WHERE ui.id = auth.uid() 
    AND ui.statut = 'actif' 
    AND ui.type_compte = 'admin'
  )
);