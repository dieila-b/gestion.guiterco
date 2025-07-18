
-- Ajouter les nouveaux champs à la table utilisateurs_internes
ALTER TABLE public.utilisateurs_internes 
ADD COLUMN IF NOT EXISTS matricule VARCHAR(10) UNIQUE,
ADD COLUMN IF NOT EXISTS statut VARCHAR(20) DEFAULT 'actif' CHECK (statut IN ('actif', 'inactif', 'suspendu'));

-- Créer une fonction pour générer automatiquement le matricule
CREATE OR REPLACE FUNCTION generate_matricule(prenom_val TEXT, nom_val TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    initiales TEXT;
    numero_seq INTEGER;
    nouveau_matricule TEXT;
BEGIN
    -- Générer les initiales (3 premières lettres du prénom + première lettre du nom, ou ajuster selon besoin)
    initiales := UPPER(
        COALESCE(SUBSTRING(prenom_val FROM 1 FOR 2), '') || 
        COALESCE(SUBSTRING(nom_val FROM 1 FOR 1), '')
    );
    
    -- Si moins de 3 caractères, compléter avec des X
    WHILE LENGTH(initiales) < 3 LOOP
        initiales := initiales || 'X';
    END LOOP;
    
    -- Trouver le prochain numéro séquentiel pour ces initiales
    SELECT COALESCE(
        MAX(
            CASE 
                WHEN matricule ~ ('^' || initiales || '-[0-9]{2}$')
                THEN CAST(SUBSTRING(matricule FROM LENGTH(initiales) + 2) AS INTEGER)
                ELSE 0
            END
        ), 0
    ) + 1
    INTO numero_seq
    FROM public.utilisateurs_internes
    WHERE matricule LIKE initiales || '-%';
    
    -- Formater le matricule final
    nouveau_matricule := initiales || '-' || LPAD(numero_seq::TEXT, 2, '0');
    
    RETURN nouveau_matricule;
END;
$$;

-- Créer un trigger pour générer automatiquement le matricule lors de l'insertion
CREATE OR REPLACE FUNCTION auto_generate_matricule()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Si le matricule n'est pas fourni ou est vide, le générer automatiquement
    IF NEW.matricule IS NULL OR NEW.matricule = '' THEN
        NEW.matricule := generate_matricule(NEW.prenom, NEW.nom);
    END IF;
    
    RETURN NEW;
END;
$$;

-- Attacher le trigger à la table utilisateurs_internes
DROP TRIGGER IF EXISTS trigger_auto_generate_matricule ON public.utilisateurs_internes;
CREATE TRIGGER trigger_auto_generate_matricule
    BEFORE INSERT ON public.utilisateurs_internes
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_matricule();

-- Générer des matricules pour les utilisateurs existants qui n'en ont pas
UPDATE public.utilisateurs_internes 
SET matricule = generate_matricule(prenom, nom)
WHERE matricule IS NULL;

-- Corriger le bucket de stockage pour les avatars utilisateurs
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Politique pour permettre l'upload des photos de profil
CREATE POLICY "Allow authenticated users to upload avatars" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update avatars" ON storage.objects
FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete avatars" ON storage.objects
FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Allow public read access to avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');
