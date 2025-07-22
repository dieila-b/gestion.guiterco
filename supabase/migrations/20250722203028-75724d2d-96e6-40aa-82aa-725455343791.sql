-- Ajouter la colonne matricule si elle n'existe pas déjà
ALTER TABLE public.utilisateurs_internes 
ADD COLUMN IF NOT EXISTS matricule VARCHAR(10) UNIQUE;

-- Créer un index sur la colonne matricule pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_utilisateurs_internes_matricule 
ON public.utilisateurs_internes(matricule);

-- Fonction pour générer un matricule unique basé sur le prénom et nom
CREATE OR REPLACE FUNCTION public.generate_matricule(prenom_val TEXT, nom_val TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    initiales TEXT;
    numero_seq INTEGER;
    nouveau_matricule TEXT;
BEGIN
    -- Générer les initiales (2 premières lettres du prénom + première lettre du nom)
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

-- Trigger pour générer automatiquement le matricule si non fourni
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

-- Générer des matricules pour les utilisateurs existants qui n'en ont pas
UPDATE public.utilisateurs_internes 
SET matricule = generate_matricule(prenom, nom)
WHERE matricule IS NULL OR matricule = '';

-- Vérifier que tous les utilisateurs ont maintenant un matricule
DO $$
DECLARE
    users_without_matricule INTEGER;
BEGIN
    SELECT COUNT(*) INTO users_without_matricule
    FROM public.utilisateurs_internes
    WHERE matricule IS NULL OR matricule = '';
    
    IF users_without_matricule > 0 THEN
        RAISE NOTICE 'ATTENTION: % utilisateurs sans matricule trouvés', users_without_matricule;
    ELSE
        RAISE NOTICE 'SUCCESS: Tous les utilisateurs ont maintenant un matricule';
    END IF;
END $$;