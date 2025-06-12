
-- Corriger la fonction generate_product_reference pour éviter l'ambiguïté
CREATE OR REPLACE FUNCTION public.generate_product_reference()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    next_number INTEGER;
    ref_result TEXT;
BEGIN
    -- Obtenir le prochain numéro en séquence en précisant explicitement le nom de la table
    SELECT COALESCE(
        MAX(
            CASE 
                WHEN catalogue.reference ~ '^REF[0-9]+$' 
                THEN CAST(SUBSTRING(catalogue.reference FROM 4) AS INTEGER)
                ELSE 0
            END
        ), 0
    ) + 1 
    INTO next_number
    FROM public.catalogue;
    
    -- Formater la référence avec padding de zéros
    ref_result := 'REF' || LPAD(next_number::TEXT, 6, '0');
    
    RETURN ref_result;
END;
$$;
