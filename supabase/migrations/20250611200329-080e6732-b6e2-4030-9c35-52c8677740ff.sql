
-- Corriger le déclencheur pour éviter l'ambiguïté de nom de colonne
CREATE OR REPLACE FUNCTION public.auto_generate_reference()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
    new_reference TEXT;
BEGIN
    -- Si la référence n'est pas fournie ou est vide, la générer automatiquement
    IF NEW.reference IS NULL OR NEW.reference = '' THEN
        NEW.reference := generate_product_reference();
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Supprimer l'ancien déclencheur s'il existe et le recréer
DROP TRIGGER IF EXISTS trigger_auto_generate_reference ON public.catalogue;

CREATE TRIGGER trigger_auto_generate_reference
    BEFORE INSERT ON public.catalogue
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_reference();
