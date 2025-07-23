-- Recréer la table utilisateurs_internes avec tous les champs requis
CREATE TABLE IF NOT EXISTS public.utilisateurs_internes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  prenom text NOT NULL,
  nom text NOT NULL,
  email text NOT NULL UNIQUE,
  telephone text,
  matricule text UNIQUE,
  role_id uuid REFERENCES public.roles(id),
  adresse_complete text,
  photo_url text,
  statut text DEFAULT 'actif' CHECK (statut IN ('actif', 'inactif')),
  doit_changer_mot_de_passe boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Fonction pour générer le matricule automatiquement
CREATE OR REPLACE FUNCTION public.generate_matricule()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    next_number INTEGER;
    new_matricule TEXT;
BEGIN
    -- Trouver le prochain numéro disponible
    SELECT COALESCE(
        MAX(
            CASE 
                WHEN matricule ~ '^ISB-[0-9]+$'
                THEN CAST(SUBSTRING(matricule FROM 5) AS INTEGER)
                ELSE 0
            END
        ), 0
    ) + 1
    INTO next_number
    FROM public.utilisateurs_internes
    WHERE matricule IS NOT NULL;
    
    -- Formater le matricule avec padding
    new_matricule := 'ISB-' || LPAD(next_number::TEXT, 2, '0');
    
    RETURN new_matricule;
END;
$$;

-- Trigger pour générer automatiquement le matricule
CREATE OR REPLACE FUNCTION public.auto_generate_matricule()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.matricule IS NULL OR NEW.matricule = '' THEN
        NEW.matricule := public.generate_matricule();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger
DROP TRIGGER IF EXISTS trigger_auto_matricule ON public.utilisateurs_internes;
CREATE TRIGGER trigger_auto_matricule
    BEFORE INSERT ON public.utilisateurs_internes
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_generate_matricule();

-- Trigger pour mettre à jour updated_at
DROP TRIGGER IF EXISTS trigger_updated_at_utilisateurs_internes ON public.utilisateurs_internes;
CREATE TRIGGER trigger_updated_at_utilisateurs_internes
    BEFORE UPDATE ON public.utilisateurs_internes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Activer RLS avec politiques simples pour l'instant
ALTER TABLE public.utilisateurs_internes ENABLE ROW LEVEL SECURITY;

-- Politiques RLS simples - accès pour les utilisateurs authentifiés
CREATE POLICY "Utilisateurs authentifiés peuvent voir utilisateurs_internes" 
ON public.utilisateurs_internes 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Utilisateurs authentifiés peuvent créer utilisateurs_internes" 
ON public.utilisateurs_internes 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Utilisateurs authentifiés peuvent modifier utilisateurs_internes" 
ON public.utilisateurs_internes 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Utilisateurs authentifiés peuvent supprimer utilisateurs_internes" 
ON public.utilisateurs_internes 
FOR DELETE 
USING (auth.uid() IS NOT NULL);