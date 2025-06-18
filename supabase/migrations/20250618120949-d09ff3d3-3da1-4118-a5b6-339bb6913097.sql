
-- Renforcer les politiques RLS pour les utilisateurs internes
DROP POLICY IF EXISTS "Seuls les admins peuvent créer des utilisateurs" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Seuls les admins peuvent modifier des utilisateurs" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Seuls les admins peuvent supprimer des utilisateurs" ON public.utilisateurs_internes;

-- Nouvelles politiques plus strictes
CREATE POLICY "Seuls les utilisateurs internes peuvent voir les utilisateurs" ON public.utilisateurs_internes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.utilisateurs_internes ui 
      WHERE ui.user_id = auth.uid() AND ui.statut = 'actif'
    )
  );

CREATE POLICY "Seuls les administrateurs peuvent créer des utilisateurs" ON public.utilisateurs_internes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.utilisateurs_internes ui 
      JOIN public.roles_utilisateurs ru ON ui.role_id = ru.id
      WHERE ui.user_id = auth.uid() 
      AND ui.statut = 'actif' 
      AND ru.nom = 'administrateur'
    )
  );

CREATE POLICY "Seuls les administrateurs peuvent modifier des utilisateurs" ON public.utilisateurs_internes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.utilisateurs_internes ui 
      JOIN public.roles_utilisateurs ru ON ui.role_id = ru.id
      WHERE ui.user_id = auth.uid() 
      AND ui.statut = 'actif' 
      AND ru.nom = 'administrateur'
    )
  );

CREATE POLICY "Seuls les administrateurs peuvent supprimer des utilisateurs" ON public.utilisateurs_internes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.utilisateurs_internes ui 
      JOIN public.roles_utilisateurs ru ON ui.role_id = ru.id
      WHERE ui.user_id = auth.uid() 
      AND ui.statut = 'actif' 
      AND ru.nom = 'administrateur'
    )
  );

-- Fonction pour vérifier si un utilisateur est autorisé à accéder à l'application
CREATE OR REPLACE FUNCTION public.is_internal_user_active(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.utilisateurs_internes ui
    JOIN public.roles_utilisateurs ru ON ui.role_id = ru.id
    WHERE ui.user_id = user_id 
    AND ui.statut = 'actif'
    AND ru.nom IN ('administrateur', 'employe', 'manager')
  );
$$;

-- Trigger pour désactiver automatiquement les comptes non autorisés
CREATE OR REPLACE FUNCTION public.check_user_authorization()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Vérifier si l'utilisateur qui vient de se connecter est autorisé
  IF NOT public.is_internal_user_active(NEW.id) THEN
    -- Si l'utilisateur n'est pas dans la table utilisateurs_internes ou n'est pas actif,
    -- on peut le marquer comme non confirmé pour bloquer l'accès
    UPDATE auth.users 
    SET email_confirmed_at = NULL 
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger qui s'exécute après chaque mise à jour d'un utilisateur dans auth.users
DROP TRIGGER IF EXISTS check_user_authorization_trigger ON auth.users;
CREATE TRIGGER check_user_authorization_trigger
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.check_user_authorization();

-- Politique pour empêcher l'accès aux données si l'utilisateur n'est pas interne
CREATE POLICY "Accès restreint aux utilisateurs internes actifs" ON public.roles_utilisateurs
  FOR SELECT USING (
    public.is_internal_user_active(auth.uid())
  );

-- Ajouter une colonne pour marquer les comptes comme "système" vs "externe"
ALTER TABLE public.utilisateurs_internes 
ADD COLUMN IF NOT EXISTS type_compte text DEFAULT 'interne' CHECK (type_compte IN ('interne', 'externe'));

-- Mettre à jour tous les utilisateurs existants comme "interne"
UPDATE public.utilisateurs_internes SET type_compte = 'interne' WHERE type_compte IS NULL;
