-- Supprimer la fonction existante si elle existe
DROP FUNCTION IF EXISTS public.generate_matricule(text, text);

-- Ajouter la colonne password_hash si elle n'existe pas
ALTER TABLE public.utilisateurs_internes 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Créer une fonction pour générer automatiquement le matricule
CREATE OR REPLACE FUNCTION public.generate_matricule(p_prenom TEXT, p_nom TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    abbreviation TEXT;
    counter INTEGER;
    new_matricule TEXT;
BEGIN
    -- Construire l'abréviation : première lettre du prénom + 3 premières lettres du nom
    abbreviation := UPPER(LEFT(p_prenom, 1) || LEFT(p_nom, 3));
    
    -- Trouver le prochain numéro disponible pour cette abréviation
    SELECT COALESCE(
        MAX(
            CASE 
                WHEN matricule ~ ('^' || abbreviation || '-[0-9]{2}$')
                THEN CAST(SUBSTRING(matricule FROM LENGTH(abbreviation) + 2) AS INTEGER)
                ELSE 0
            END
        ), 0
    ) + 1
    INTO counter
    FROM public.utilisateurs_internes
    WHERE matricule LIKE abbreviation || '-%';
    
    -- Formater le matricule final avec padding de zéros
    new_matricule := abbreviation || '-' || LPAD(counter::TEXT, 2, '0');
    
    RETURN new_matricule;
END;
$$;

-- Créer un trigger pour générer automatiquement le matricule à l'insertion
CREATE OR REPLACE FUNCTION public.auto_generate_matricule()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Si le matricule n'est pas fourni, le générer automatiquement
    IF NEW.matricule IS NULL OR NEW.matricule = '' THEN
        NEW.matricule := public.generate_matricule(NEW.prenom, NEW.nom);
    END IF;
    
    RETURN NEW;
END;
$$;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_auto_generate_matricule ON public.utilisateurs_internes;
CREATE TRIGGER trigger_auto_generate_matricule
    BEFORE INSERT ON public.utilisateurs_internes
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_generate_matricule();

-- Créer un bucket pour les photos de profil si il n'existe pas déjà
INSERT INTO storage.buckets (id, name, public) 
VALUES ('user-avatars', 'user-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Politiques pour le bucket des photos de profil
DO $$
BEGIN
    -- Politique pour voir les photos (publique)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'User avatars are publicly accessible'
    ) THEN
        CREATE POLICY "User avatars are publicly accessible"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'user-avatars');
    END IF;

    -- Politique pour uploader ses propres photos
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Users can upload their own avatar'
    ) THEN
        CREATE POLICY "Users can upload their own avatar"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'user-avatars');
    END IF;

    -- Politique pour mettre à jour ses propres photos
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Users can update their own avatar'
    ) THEN
        CREATE POLICY "Users can update their own avatar"
        ON storage.objects FOR UPDATE
        USING (bucket_id = 'user-avatars');
    END IF;

    -- Politique pour supprimer ses propres photos
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Users can delete their own avatar'
    ) THEN
        CREATE POLICY "Users can delete their own avatar"
        ON storage.objects FOR DELETE
        USING (bucket_id = 'user-avatars');
    END IF;
END $$;