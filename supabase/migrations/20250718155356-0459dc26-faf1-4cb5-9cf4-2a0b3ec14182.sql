
-- Vérifier et corriger les politiques RLS pour la table utilisateurs_internes
DROP POLICY IF EXISTS "Les administrateurs peuvent modifier des utilisateurs" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Internal users can update their own profile" ON public.utilisateurs_internes;

-- Créer une politique plus permissive pour la modification des utilisateurs internes
CREATE POLICY "Utilisateurs internes peuvent modifier les utilisateurs" ON public.utilisateurs_internes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.utilisateurs_internes ui 
      JOIN public.roles_utilisateurs ru ON ui.role_id = ru.id
      WHERE ui.user_id = auth.uid() 
      AND ui.statut = 'actif'
      AND ru.nom IN ('administrateur', 'manager')
    )
  );

-- Politique pour permettre la lecture des utilisateurs internes
DROP POLICY IF EXISTS "Seuls les utilisateurs internes peuvent voir les utilisateurs" ON public.utilisateurs_internes;
CREATE POLICY "Utilisateurs internes peuvent voir tous les utilisateurs" ON public.utilisateurs_internes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.utilisateurs_internes ui 
      WHERE ui.user_id = auth.uid() 
      AND ui.statut = 'actif'
    )
  );

-- Mettre à jour les politiques pour les rôles utilisateurs
DROP POLICY IF EXISTS "Accès restreint aux utilisateurs internes actifs" ON public.roles_utilisateurs;
CREATE POLICY "Utilisateurs internes peuvent voir les rôles" ON public.roles_utilisateurs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.utilisateurs_internes ui 
      WHERE ui.user_id = auth.uid() 
      AND ui.statut = 'actif'
    )
  );

-- Politique pour les rôles unifiés (table roles)
DROP POLICY IF EXISTS "Authenticated users can view roles" ON public.roles;
CREATE POLICY "Utilisateurs internes peuvent voir les rôles unifiés" ON public.roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.utilisateurs_internes ui 
      WHERE ui.user_id = auth.uid() 
      AND ui.statut = 'actif'
    )
  );

-- Politique pour les assignations de rôles (table user_roles)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Administrateurs peuvent gérer les rôles utilisateurs" ON public.user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.utilisateurs_internes ui 
      JOIN public.roles_utilisateurs ru ON ui.role_id = ru.id
      WHERE ui.user_id = auth.uid() 
      AND ui.statut = 'actif'
      AND ru.nom = 'administrateur'
    )
  );

-- Fonction pour mettre à jour les informations utilisateur en toute sécurité
CREATE OR REPLACE FUNCTION public.update_user_profile(
  p_user_id UUID,
  p_prenom TEXT,
  p_nom TEXT,
  p_email TEXT,
  p_telephone TEXT DEFAULT NULL,
  p_adresse TEXT DEFAULT NULL,
  p_photo_url TEXT DEFAULT NULL,
  p_matricule TEXT DEFAULT NULL,
  p_statut TEXT DEFAULT 'actif',
  p_doit_changer_mot_de_passe BOOLEAN DEFAULT FALSE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role TEXT;
BEGIN
  -- Vérifier que l'utilisateur actuel est autorisé
  SELECT ru.nom INTO current_user_role
  FROM public.utilisateurs_internes ui
  JOIN public.roles_utilisateurs ru ON ui.role_id = ru.id
  WHERE ui.user_id = auth.uid() 
  AND ui.statut = 'actif';
  
  -- Seuls les administrateurs et managers peuvent modifier
  IF current_user_role NOT IN ('administrateur', 'manager') THEN
    RAISE EXCEPTION 'Permission denied: insufficient privileges';
  END IF;
  
  -- Mettre à jour l'utilisateur interne
  UPDATE public.utilisateurs_internes 
  SET 
    prenom = p_prenom,
    nom = p_nom,
    email = p_email,
    telephone = p_telephone,
    adresse = p_adresse,
    photo_url = p_photo_url,
    matricule = p_matricule,
    statut = p_statut,
    doit_changer_mot_de_passe = p_doit_changer_mot_de_passe,
    updated_at = now()
  WHERE id = p_user_id;
  
  RETURN TRUE;
END;
$$;
