
-- Créer une table pour les rôles utilisateurs
CREATE TABLE IF NOT EXISTS public.roles_utilisateurs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nom text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Insérer les rôles de base
INSERT INTO public.roles_utilisateurs (nom, description) VALUES 
  ('employe', 'Employé standard'),
  ('administrateur', 'Administrateur système'),
  ('manager', 'Manager')
ON CONFLICT (nom) DO NOTHING;

-- Créer une table pour les utilisateurs internes avec toutes les informations nécessaires
CREATE TABLE IF NOT EXISTS public.utilisateurs_internes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  prenom text NOT NULL,
  nom text NOT NULL,
  email text NOT NULL UNIQUE,
  telephone text,
  adresse text,
  photo_url text,
  role_id uuid REFERENCES public.roles_utilisateurs(id),
  doit_changer_mot_de_passe boolean DEFAULT true,
  statut text DEFAULT 'actif',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Créer un bucket pour les photos de profil
INSERT INTO storage.buckets (id, name, public) 
VALUES ('user-photos', 'user-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Politiques RLS pour les utilisateurs internes
ALTER TABLE public.utilisateurs_internes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tous peuvent voir les utilisateurs internes" ON public.utilisateurs_internes
  FOR SELECT USING (true);

CREATE POLICY "Seuls les admins peuvent créer des utilisateurs" ON public.utilisateurs_internes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Seuls les admins peuvent modifier des utilisateurs" ON public.utilisateurs_internes
  FOR UPDATE USING (true);

CREATE POLICY "Seuls les admins peuvent supprimer des utilisateurs" ON public.utilisateurs_internes
  FOR DELETE USING (true);

-- Politiques RLS pour les rôles
ALTER TABLE public.roles_utilisateurs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tous peuvent voir les rôles" ON public.roles_utilisateurs
  FOR SELECT USING (true);

-- Politiques pour le storage des photos utilisateurs
CREATE POLICY "Tout le monde peut voir les photos utilisateurs" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-photos');

CREATE POLICY "Utilisateurs authentifiés peuvent uploader des photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'user-photos');

CREATE POLICY "Utilisateurs authentifiés peuvent mettre à jour des photos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'user-photos');

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_utilisateurs_internes_updated_at 
  BEFORE UPDATE ON public.utilisateurs_internes 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_roles_utilisateurs_updated_at 
  BEFORE UPDATE ON public.roles_utilisateurs 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
