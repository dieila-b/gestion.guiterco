
-- Vérifier et corriger la fonction de génération des numéros de bon de commande
CREATE OR REPLACE FUNCTION generate_bon_commande_number()
RETURNS TEXT
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
    current_date_part := 'BC-' || year_part || '-' || month_part || '-' || day_part || '-';
    
    -- Trouver le prochain compteur pour aujourd'hui
    SELECT COALESCE(
        MAX(
            CASE 
                WHEN numero_bon ~ ('^' || current_date_part || '[0-9]{3}$')
                THEN CAST(SUBSTRING(numero_bon FROM LENGTH(current_date_part) + 1) AS INTEGER)
                ELSE 0
            END
        ), 0
    ) + 1
    INTO next_counter
    FROM bons_de_commande
    WHERE DATE(date_commande) = CURRENT_DATE;
    
    -- Formater le résultat avec padding de zéros
    result := current_date_part || LPAD(next_counter::TEXT, 3, '0');
    
    RETURN result;
END;
$$;

-- Vérifier et corriger la fonction de génération des numéros de bon de livraison
CREATE OR REPLACE FUNCTION generate_bon_livraison_number(bon_commande_numero TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    -- Remplacer BC- par BL- en gardant le même identifiant
    RETURN REPLACE(bon_commande_numero, 'BC-', 'BL-');
END;
$$;

-- S'assurer que le trigger fonctionne correctement
CREATE OR REPLACE FUNCTION auto_generate_bon_commande_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Si le numéro n'est pas fourni ou ne suit pas le bon format, le générer
    IF NEW.numero_bon IS NULL OR NEW.numero_bon = '' OR NOT (NEW.numero_bon ~ '^BC-[0-9]{2}-[0-9]{2}-[0-9]{2}-[0-9]{3}$') THEN
        NEW.numero_bon := generate_bon_commande_number();
    END IF;
    
    RETURN NEW;
END;
$$;

-- Recréer le trigger si nécessaire
DROP TRIGGER IF EXISTS trigger_auto_generate_bon_commande_number ON bons_de_commande;
CREATE TRIGGER trigger_auto_generate_bon_commande_number
    BEFORE INSERT ON bons_de_commande
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_bon_commande_number();

-- Vérifier et ajouter les contraintes de clés étrangères manquantes
DO $$
BEGIN
    -- Contrainte FK pour bons_de_livraison -> bons_de_commande
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_bons_livraison_bon_commande_id'
        AND table_name = 'bons_de_livraison'
    ) THEN
        ALTER TABLE bons_de_livraison 
        ADD CONSTRAINT fk_bons_livraison_bon_commande_id 
        FOREIGN KEY (bon_commande_id) REFERENCES bons_de_commande(id) ON DELETE CASCADE;
    END IF;

    -- Contrainte FK pour articles_bon_commande -> bons_de_commande
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_articles_bon_commande_bon_id'
        AND table_name = 'articles_bon_commande'
    ) THEN
        ALTER TABLE articles_bon_commande 
        ADD CONSTRAINT fk_articles_bon_commande_bon_id 
        FOREIGN KEY (bon_commande_id) REFERENCES bons_de_commande(id) ON DELETE CASCADE;
    END IF;

    -- Contrainte FK pour articles_bon_commande -> catalogue
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_articles_bon_commande_article_id'
        AND table_name = 'articles_bon_commande'
    ) THEN
        ALTER TABLE articles_bon_commande 
        ADD CONSTRAINT fk_articles_bon_commande_article_id 
        FOREIGN KEY (article_id) REFERENCES catalogue(id) ON DELETE CASCADE;
    END IF;

    -- Contrainte FK pour articles_bon_livraison -> bons_de_livraison
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_articles_bon_livraison_bon_id'
        AND table_name = 'articles_bon_livraison'
    ) THEN
        ALTER TABLE articles_bon_livraison 
        ADD CONSTRAINT fk_articles_bon_livraison_bon_id 
        FOREIGN KEY (bon_livraison_id) REFERENCES bons_de_livraison(id) ON DELETE CASCADE;
    END IF;

    -- Contrainte FK pour articles_bon_livraison -> catalogue
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_articles_bon_livraison_article_id'
        AND table_name = 'articles_bon_livraison'
    ) THEN
        ALTER TABLE articles_bon_livraison 
        ADD CONSTRAINT fk_articles_bon_livraison_article_id 
        FOREIGN KEY (article_id) REFERENCES catalogue(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Créer un index pour améliorer les performances des requêtes de numérotation
CREATE INDEX IF NOT EXISTS idx_bons_de_commande_numero_date ON bons_de_commande(numero_bon, date_commande);
CREATE INDEX IF NOT EXISTS idx_bons_de_livraison_bon_commande ON bons_de_livraison(bon_commande_id);
