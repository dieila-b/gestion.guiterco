
-- Supprimer les politiques RLS existantes qui causent la récursion
DROP POLICY IF EXISTS "Seuls les utilisateurs internes peuvent voir les utilisateurs" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Seuls les administrateurs peuvent créer des utilisateurs" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Seuls les administrateurs peuvent modifier des utilisateurs" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Seuls les administrateurs peuvent supprimer des utilisateurs" ON public.utilisateurs_internes;

-- Créer une fonction de sécurité pour éviter la récursion
CREATE OR REPLACE FUNCTION public.get_user_role_for_rls()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT ru.nom INTO user_role
  FROM public.utilisateurs_internes ui
  JOIN public.roles_utilisateurs ru ON ui.role_id = ru.id
  WHERE ui.user_id = auth.uid() 
  AND ui.statut = 'actif'
  AND ui.type_compte = 'interne';
  
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Créer de nouvelles politiques sans récursion
CREATE POLICY "Les utilisateurs internes peuvent voir tous les utilisateurs" ON public.utilisateurs_internes
  FOR SELECT USING (
    public.get_user_role_for_rls() IN ('administrateur', 'employe', 'manager')
  );

CREATE POLICY "Les administrateurs peuvent créer des utilisateurs" ON public.utilisateurs_internes
  FOR INSERT WITH CHECK (
    public.get_user_role_for_rls() = 'administrateur'
  );

CREATE POLICY "Les administrateurs peuvent modifier des utilisateurs" ON public.utilisateurs_internes
  FOR UPDATE USING (
    public.get_user_role_for_rls() = 'administrateur'
  );

CREATE POLICY "Les administrateurs peuvent supprimer des utilisateurs" ON public.utilisateurs_internes
  FOR DELETE USING (
    public.get_user_role_for_rls() = 'administrateur'
  );
