
-- Corriger les politiques RLS pour la table profiles
DROP POLICY IF EXISTS "Users can view own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;

-- Créer la table profiles si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  prenom text,
  nom text,
  avatar_url text,
  bio text,
  telephone text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Créer des politiques RLS permissives pour la table profiles
CREATE POLICY "Allow authenticated users to view profiles" ON public.profiles
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to insert profiles" ON public.profiles  
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to update profiles" ON public.profiles
FOR UPDATE USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to delete profiles" ON public.profiles
FOR DELETE USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Accorder les permissions nécessaires
GRANT ALL ON public.profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON public.profiles(user_id);
