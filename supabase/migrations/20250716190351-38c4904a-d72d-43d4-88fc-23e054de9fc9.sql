-- Ajouter la colonne reference à la table transferts
ALTER TABLE public.transferts 
ADD COLUMN reference VARCHAR(50) UNIQUE;

-- Fonction pour générer un numéro de référence de transfert automatique
CREATE OR REPLACE FUNCTION public.generate_transfert_reference()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    next_counter INTEGER;
    result TEXT;
BEGIN
    -- Trouver le prochain compteur
    SELECT COALESCE(
        MAX(
            CASE 
                WHEN reference ~ '^TRF[0-9]{6}$'
                THEN CAST(SUBSTRING(reference FROM 4) AS INTEGER)
                ELSE 0
            END
        ), 0
    ) + 1
    INTO next_counter
    FROM public.transferts
    WHERE reference IS NOT NULL;
    
    -- Formater le résultat avec padding de zéros (TRF000001, TRF000002, etc.)
    result := 'TRF' || LPAD(next_counter::TEXT, 6, '0');
    
    RETURN result;
END;
$$;

-- Trigger pour auto-générer la référence lors de la création
CREATE OR REPLACE FUNCTION public.auto_generate_transfert_reference()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Si la référence n'est pas fournie, la générer automatiquement
    IF NEW.reference IS NULL OR NEW.reference = '' THEN
        NEW.reference := public.generate_transfert_reference();
    END IF;
    
    RETURN NEW;
END;
$$;

-- Créer le trigger
CREATE TRIGGER trigger_auto_generate_transfert_reference
    BEFORE INSERT ON public.transferts
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_generate_transfert_reference();

-- Mettre à jour les transferts existants sans référence
UPDATE public.transferts 
SET reference = public.generate_transfert_reference()
WHERE reference IS NULL;