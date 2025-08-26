-- Permettre au mock user de dev de créer son profil
CREATE POLICY "Allow dev user to create profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (user_id = '00000000-0000-4000-8000-000000000001');