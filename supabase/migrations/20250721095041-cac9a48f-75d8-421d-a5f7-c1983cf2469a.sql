
-- Ajouter les colonnes manquantes à la table utilisateurs_internes si elles n'existent pas déjà
ALTER TABLE public.utilisateurs_internes 
ADD COLUMN IF NOT EXISTS matricule text,
ADD COLUMN IF NOT EXISTS poste text,
ADD COLUMN IF NOT EXISTS date_embauche timestamp with time zone;

-- Créer un trigger pour générer automatiquement un matricule si nécessaire
CREATE OR REPLACE FUNCTION public.generate_matricule_if_needed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.matricule IS NULL OR NEW.matricule = '' THEN
    NEW.matricule := generate_matricule(NEW.prenom, NEW.nom);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger sur la table utilisateurs_internes
DROP TRIGGER IF EXISTS trigger_generate_matricule ON public.utilisateurs_internes;
CREATE TRIGGER trigger_generate_matricule
  BEFORE INSERT ON public.utilisateurs_internes
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_matricule_if_needed();

-- Mettre à jour la fonction pour la synchronisation en temps réel
CREATE OR REPLACE FUNCTION public.sync_user_roles_on_user_creation()
RETURNS TRIGGER AS $$
BEGIN
  -- Insérer dans user_roles seulement si un role_id est fourni
  IF NEW.role_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role_id, is_active)
    VALUES (NEW.user_id, NEW.role_id, true)
    ON CONFLICT (user_id, role_id) DO UPDATE SET is_active = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger de synchronisation
DROP TRIGGER IF EXISTS trigger_sync_user_roles ON public.utilisateurs_internes;
CREATE TRIGGER trigger_sync_user_roles
  AFTER INSERT OR UPDATE ON public.utilisateurs_internes
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_roles_on_user_creation();

-- Activer la réplication en temps réel pour toutes les tables liées
ALTER TABLE public.utilisateurs_internes REPLICA IDENTITY FULL;
ALTER TABLE public.user_roles REPLICA IDENTITY FULL;
ALTER TABLE public.roles REPLICA IDENTITY FULL;

-- Ajouter les tables à la publication realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.utilisateurs_internes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.roles;
