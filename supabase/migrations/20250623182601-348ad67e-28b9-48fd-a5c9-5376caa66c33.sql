
-- Fonction pour générer le numéro de précommande au format PRECO-YY-MM-DD-XXX
CREATE OR REPLACE FUNCTION generate_precommande_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    current_date_part TEXT;
    year_part TEXT;
    month_part TEXT;
    day_part TEXT;
    next_counter INTEGER;
    result TEXT;
BEGIN
    -- Obtenir les parties de la date actuelle
    year_part := TO_CHAR(CURRENT_DATE, 'YY');
    month_part := TO_CHAR(CURRENT_DATE, 'MM');
    day_part := TO_CHAR(CURRENT_DATE, 'DD');
    current_date_part := 'PRECO-' || year_part || '-' || month_part || '-' || day_part || '-';
    
    -- Trouver le prochain compteur pour aujourd'hui
    SELECT COALESCE(
        MAX(
            CASE 
                WHEN numero_precommande ~ ('^' || current_date_part || '[0-9]{3}$')
                THEN CAST(SUBSTRING(numero_precommande FROM LENGTH(current_date_part) + 1) AS INTEGER)
                ELSE 0
            END
        ), 0
    ) + 1
    INTO next_counter
    FROM precommandes
    WHERE DATE(date_precommande) = CURRENT_DATE;
    
    -- Formater le résultat avec padding de zéros
    result := current_date_part || LPAD(next_counter::TEXT, 3, '0');
    
    RETURN result;
END;
$$;

-- Trigger pour générer automatiquement le numéro de précommande
CREATE OR REPLACE FUNCTION auto_generate_precommande_number()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Si le numéro n'est pas fourni ou ne suit pas le bon format, le générer
    IF NEW.numero_precommande IS NULL OR NEW.numero_precommande = '' OR NOT (NEW.numero_precommande ~ '^PRECO-[0-9]{2}-[0-9]{2}-[0-9]{2}-[0-9]{3}$') THEN
        NEW.numero_precommande := generate_precommande_number();
    END IF;
    
    RETURN NEW;
END;
$$;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_auto_generate_precommande_number ON precommandes;
CREATE TRIGGER trigger_auto_generate_precommande_number
    BEFORE INSERT ON precommandes
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_precommande_number();
