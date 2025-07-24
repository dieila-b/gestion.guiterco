-- Correction de la génération automatique du matricule selon les nouvelles spécifications
-- Format: Prénom à un seul mot -> 2 premières lettres du prénom + 1ère lettre du nom + suffixe -XX
-- Format: Prénom à plusieurs mots -> 1ère lettre de chaque mot du prénom + 1ère lettre du nom + suffixe -XX

-- Supprimer l'ancienne fonction generate_matricule
DROP FUNCTION IF EXISTS public.generate_matricule();
DROP FUNCTION IF EXISTS public.generate_matricule(text, text);

-- Créer la nouvelle fonction generate_matricule avec les spécifications requises
CREATE OR REPLACE FUNCTION public.generate_matricule(prenom_val TEXT, nom_val TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    base_matricule TEXT;
    counter INTEGER;
    result TEXT;
    prenom_parts TEXT[];
BEGIN
    -- Nettoyer et formater les noms (supprimer espaces, accents, etc.)
    prenom_val := UPPER(REGEXP_REPLACE(UNACCENT(COALESCE(prenom_val, '')), '[^A-Z ]', '', 'g'));
    nom_val := UPPER(REGEXP_REPLACE(UNACCENT(COALESCE(nom_val, '')), '[^A-Z]', '', 'g'));
    
    -- Séparer les mots du prénom
    prenom_parts := STRING_TO_ARRAY(TRIM(prenom_val), ' ');
    
    -- Créer la base du matricule selon les règles
    IF ARRAY_LENGTH(prenom_parts, 1) = 1 THEN
        -- Prénom à un seul mot : 2 premières lettres du prénom + 1ère lettre du nom
        base_matricule := SUBSTRING(prenom_parts[1] FROM 1 FOR 2) || SUBSTRING(nom_val FROM 1 FOR 1);
    ELSE
        -- Prénom à plusieurs mots : 1ère lettre de chaque mot du prénom + 1ère lettre du nom
        base_matricule := '';
        FOR i IN 1..LEAST(ARRAY_LENGTH(prenom_parts, 1), 2) LOOP
            base_matricule := base_matricule || SUBSTRING(prenom_parts[i] FROM 1 FOR 1);
        END LOOP;
        base_matricule := base_matricule || SUBSTRING(nom_val FROM 1 FOR 1);
    END IF;
    
    -- S'assurer qu'on a exactement 3 caractères, compléter avec X si nécessaire
    WHILE LENGTH(base_matricule) < 3 LOOP
        base_matricule := base_matricule || 'X';
    END LOOP;
    
    -- Tronquer à 3 caractères au maximum
    base_matricule := SUBSTRING(base_matricule FROM 1 FOR 3);
    
    -- Trouver le prochain numéro disponible (format XX avec 2 chiffres)
    counter := 1;
    WHILE EXISTS (
        SELECT 1 FROM public.utilisateurs_internes 
        WHERE matricule = base_matricule || '-' || LPAD(counter::TEXT, 2, '0')
    ) LOOP
        counter := counter + 1;
    END LOOP;
    
    -- Construire le matricule final
    result := base_matricule || '-' || LPAD(counter::TEXT, 2, '0');
    
    RETURN result;
END;
$$;

-- Mettre à jour la fonction trigger pour utiliser la nouvelle logique
CREATE OR REPLACE FUNCTION public.auto_generate_matricule()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.matricule IS NULL OR NEW.matricule = '' THEN
        NEW.matricule := public.generate_matricule(NEW.prenom, NEW.nom);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recréer le trigger
DROP TRIGGER IF EXISTS trigger_auto_generate_matricule ON public.utilisateurs_internes;
CREATE TRIGGER trigger_auto_generate_matricule
    BEFORE INSERT ON public.utilisateurs_internes
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_generate_matricule();

-- Mettre à jour les matricules existants qui ne suivent pas le nouveau format
UPDATE public.utilisateurs_internes 
SET matricule = public.generate_matricule(prenom, nom)
WHERE matricule IS NULL 
   OR matricule = '' 
   OR NOT (matricule ~ '^[A-Z]{3}-[0-9]{2}$');