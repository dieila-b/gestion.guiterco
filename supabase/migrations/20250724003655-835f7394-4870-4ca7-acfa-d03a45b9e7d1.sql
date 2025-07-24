-- 1. Correction de la génération automatique du matricule selon les nouvelles spécifications
-- Format: 3 premières lettres du nom complet + suffixe numérique de 2 chiffres auto-incrémenté

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
BEGIN
    -- Nettoyer et formater les noms (supprimer espaces, accents, etc.)
    prenom_val := UPPER(REGEXP_REPLACE(UNACCENT(COALESCE(prenom_val, '')), '[^A-Z]', '', 'g'));
    nom_val := UPPER(REGEXP_REPLACE(UNACCENT(COALESCE(nom_val, '')), '[^A-Z]', '', 'g'));
    
    -- Créer la base du matricule : 3 premières lettres du nom complet
    -- Si nom + prénom < 3 lettres, compléter avec des X
    base_matricule := COALESCE(
        SUBSTRING(nom_val || prenom_val FROM 1 FOR 3),
        'XXX'
    );
    
    -- Compléter avec des X si nécessaire pour avoir exactement 3 caractères
    WHILE LENGTH(base_matricule) < 3 LOOP
        base_matricule := base_matricule || 'X';
    END LOOP;
    
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

-- 2. Créer une edge function pour gérer les mots de passe avec validation renforcée
-- et permettre la modification des mots de passe via l'interface d'édition

-- Table pour stocker les demandes de changement de mot de passe temporaires
CREATE TABLE IF NOT EXISTS public.password_reset_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    new_password_hash TEXT NOT NULL,
    require_change BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '1 hour'),
    used BOOLEAN DEFAULT false
);

-- Politiques RLS pour password_reset_requests
ALTER TABLE public.password_reset_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilisateurs authentifiés peuvent gérer password_reset_requests"
ON public.password_reset_requests
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);