
-- Créer la table des lignes de facture de vente si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.lignes_facture_vente (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  facture_vente_id UUID REFERENCES public.factures_vente(id) ON DELETE CASCADE,
  article_id UUID REFERENCES public.catalogue(id),
  quantite INTEGER NOT NULL DEFAULT 1,
  prix_unitaire NUMERIC NOT NULL DEFAULT 0,
  montant_ligne NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ajouter les index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_lignes_facture_vente_facture_id ON public.lignes_facture_vente(facture_vente_id);
CREATE INDEX IF NOT EXISTS idx_lignes_facture_vente_article_id ON public.lignes_facture_vente(article_id);

-- Fonction pour générer automatiquement les numéros de facture au format FA-YY-MM-JJ-0000
CREATE OR REPLACE FUNCTION public.generate_facture_vente_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $function$
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
    current_date_part := 'FA-' || year_part || '-' || month_part || '-' || day_part || '-';
    
    -- Trouver le prochain compteur pour aujourd'hui
    SELECT COALESCE(
        MAX(
            CASE 
                WHEN numero_facture ~ ('^' || current_date_part || '[0-9]{4}$')
                THEN CAST(SUBSTRING(numero_facture FROM LENGTH(current_date_part) + 1) AS INTEGER)
                ELSE 0
            END
        ), 0
    ) + 1
    INTO next_counter
    FROM factures_vente
    WHERE DATE(date_facture) = CURRENT_DATE;
    
    -- Formater le résultat avec padding de zéros
    result := current_date_part || LPAD(next_counter::TEXT, 4, '0');
    
    RETURN result;
END;
$function$;

-- Trigger pour générer automatiquement le numéro de facture
CREATE OR REPLACE FUNCTION public.auto_generate_facture_vente_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
BEGIN
    -- Si le numéro n'est pas fourni ou ne suit pas le bon format, le générer
    IF NEW.numero_facture IS NULL OR NEW.numero_facture = '' OR NOT (NEW.numero_facture ~ '^FA-[0-9]{2}-[0-9]{2}-[0-9]{2}-[0-9]{4}$') THEN
        NEW.numero_facture := generate_facture_vente_number();
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_auto_generate_facture_vente_number ON public.factures_vente;
CREATE TRIGGER trigger_auto_generate_facture_vente_number
    BEFORE INSERT ON public.factures_vente
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_facture_vente_number();
