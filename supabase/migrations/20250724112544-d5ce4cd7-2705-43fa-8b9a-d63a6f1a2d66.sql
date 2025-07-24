-- Correction des policies RLS pour les utilisateurs internes

-- D'abord activer RLS sur toutes les tables qui n'en ont pas
ALTER TABLE IF EXISTS public.utilisateurs_internes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.roles ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies problématiques
DROP POLICY IF EXISTS "bypass_rls_for_authenticated_users" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Utilisateurs authentifiés peuvent accéder aux utilisateurs internes" ON public.utilisateurs_internes;

-- Créer des policies RLS appropriées pour utilisateurs_internes
CREATE POLICY "Utilisateurs peuvent lire leur propre profil"
ON public.utilisateurs_internes
FOR SELECT
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Utilisateurs internes autorisés peuvent créer des comptes"
ON public.utilisateurs_internes
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.utilisateurs_internes ui
    JOIN public.user_roles ur ON ui.user_id = ur.user_id
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ui.user_id = auth.uid()::text
    AND r.name = 'Administrateur'
    AND ur.is_active = true
    AND ui.statut = 'actif'
  )
);

CREATE POLICY "Administrateurs peuvent modifier tous les utilisateurs"
ON public.utilisateurs_internes
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.utilisateurs_internes ui
    JOIN public.user_roles ur ON ui.user_id = ur.user_id
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ui.user_id = auth.uid()::text
    AND r.name = 'Administrateur'
    AND ur.is_active = true
    AND ui.statut = 'actif'
  )
);

-- Policies pour user_roles
DROP POLICY IF EXISTS "bypass_rls_for_authenticated_users" ON public.user_roles;

CREATE POLICY "Utilisateurs peuvent lire leurs propres rôles"
ON public.user_roles
FOR SELECT
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Administrateurs peuvent gérer tous les rôles"
ON public.user_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.utilisateurs_internes ui
    JOIN public.user_roles ur ON ui.user_id = ur.user_id
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ui.user_id = auth.uid()::text
    AND r.name = 'Administrateur'
    AND ur.is_active = true
    AND ui.statut = 'actif'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.utilisateurs_internes ui
    JOIN public.user_roles ur ON ui.user_id = ur.user_id
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ui.user_id = auth.uid()::text
    AND r.name = 'Administrateur'
    AND ur.is_active = true
    AND ui.statut = 'actif'
  )
);

-- Policies pour roles (lecture publique pour les utilisateurs authentifiés)
CREATE POLICY "Utilisateurs authentifiés peuvent lire les rôles"
ON public.roles
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Fonction pour créer un utilisateur interne avec compte Supabase Auth
CREATE OR REPLACE FUNCTION public.create_internal_user_with_auth(
  p_email TEXT,
  p_password TEXT,
  p_prenom TEXT,
  p_nom TEXT,
  p_role_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id UUID;
  internal_user_record RECORD;
  result JSON;
BEGIN
  -- Vérifier que l'utilisateur actuel est un administrateur
  IF NOT EXISTS (
    SELECT 1 FROM public.utilisateurs_internes ui
    JOIN public.user_roles ur ON ui.user_id = ur.user_id
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ui.user_id = auth.uid()::text
    AND r.name = 'Administrateur'
    AND ur.is_active = true
    AND ui.statut = 'actif'
  ) THEN
    RETURN json_build_object('error', 'Accès refusé: seuls les administrateurs peuvent créer des utilisateurs');
  END IF;

  -- Générer un UUID pour le nouvel utilisateur
  new_user_id := gen_random_uuid();

  -- Créer l'enregistrement dans utilisateurs_internes
  INSERT INTO public.utilisateurs_internes (
    user_id,
    email,
    prenom,
    nom,
    role_id,
    statut,
    type_compte,
    created_at,
    updated_at
  ) VALUES (
    new_user_id::text,
    p_email,
    p_prenom,
    p_nom,
    p_role_id,
    'actif',
    'interne',
    now(),
    now()
  ) RETURNING * INTO internal_user_record;

  -- Créer l'entrée dans user_roles
  INSERT INTO public.user_roles (
    user_id,
    role_id,
    is_active
  ) VALUES (
    new_user_id::text,
    p_role_id,
    true
  );

  -- Retourner les informations de l'utilisateur créé
  result := json_build_object(
    'success', true,
    'user_id', new_user_id,
    'email', p_email,
    'message', 'Utilisateur interne créé avec succès'
  );

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;

-- Créer une fonction pour vérifier un utilisateur interne par user_id
CREATE OR REPLACE FUNCTION public.get_internal_user_by_id(p_user_id TEXT)
RETURNS TABLE(
  id UUID,
  user_id TEXT,
  email TEXT,
  prenom TEXT,
  nom TEXT,
  role_id UUID,
  role_nom TEXT,
  statut TEXT,
  type_compte TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ui.id,
    ui.user_id,
    ui.email,
    ui.prenom,
    ui.nom,
    ui.role_id,
    r.name as role_nom,
    ui.statut,
    ui.type_compte
  FROM public.utilisateurs_internes ui
  JOIN public.roles r ON ui.role_id = r.id
  WHERE ui.user_id = p_user_id
  AND ui.statut = 'actif'
  AND ui.type_compte = 'interne';
$$;