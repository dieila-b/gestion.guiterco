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

-- Activer RLS
ALTER TABLE public.utilisateurs_internes ENABLE ROW LEVEL SECURITY;

-- Politiques RLS - seuls les admins peuvent tout faire
CREATE POLICY "Admins peuvent tout voir sur utilisateurs_internes" 
ON public.utilisateurs_internes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name = 'Administrateur'
    AND ur.is_active = true
  )
);

CREATE POLICY "Admins peuvent créer des utilisateurs_internes" 
ON public.utilisateurs_internes 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name = 'Administrateur'
    AND ur.is_active = true
  )
);

CREATE POLICY "Admins peuvent modifier des utilisateurs_internes" 
ON public.utilisateurs_internes 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name = 'Administrateur'
    AND ur.is_active = true
  )
);

CREATE POLICY "Admins peuvent supprimer des utilisateurs_internes" 
ON public.utilisateurs_internes 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name = 'Administrateur'
    AND ur.is_active = true
  )
);

-- Fonction pour créer un utilisateur interne avec synchronisation Auth
CREATE OR REPLACE FUNCTION public.create_internal_user(
  p_prenom text,
  p_nom text,
  p_email text,
  p_password text,
  p_telephone text DEFAULT NULL,
  p_role_id uuid DEFAULT NULL,
  p_adresse_complete text DEFAULT NULL,
  p_photo_url text DEFAULT NULL,
  p_doit_changer_mot_de_passe boolean DEFAULT true
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
  new_internal_user_id uuid;
BEGIN
  -- Créer l'utilisateur dans Auth (via admin API)
  -- Note: Cette fonction devra être complétée avec un appel à l'API admin Supabase
  -- Pour l'instant, on crée juste l'enregistrement interne
  
  -- Insérer dans utilisateurs_internes
  INSERT INTO public.utilisateurs_internes (
    prenom,
    nom,
    email,
    telephone,
    role_id,
    adresse_complete,
    photo_url,
    statut,
    doit_changer_mot_de_passe
  ) VALUES (
    p_prenom,
    p_nom,
    p_email,
    p_telephone,
    p_role_id,
    p_adresse_complete,
    p_photo_url,
    'actif',
    p_doit_changer_mot_de_passe
  ) RETURNING id INTO new_internal_user_id;
  
  RETURN new_internal_user_id;
END;
$$;