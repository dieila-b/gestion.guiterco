
-- Vérifier les valeurs autorisées pour l'enum statut_livraison_enum
SELECT unnest(enum_range(NULL::statut_livraison_enum)) AS valeurs_autorisees;

-- Si l'enum n'existe pas ou a des valeurs différentes, nous devons le corriger
-- Les valeurs standard attendues sont généralement:
DO $$
BEGIN
    -- Vérifier si l'enum existe
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'statut_livraison_enum') THEN
        -- Créer l'enum avec les bonnes valeurs
        CREATE TYPE statut_livraison_enum AS ENUM ('en_attente', 'partiellement_livree', 'livree');
    ELSE
        -- Ajouter les valeurs manquantes si nécessaire
        BEGIN
            ALTER TYPE statut_livraison_enum ADD VALUE IF NOT EXISTS 'en_attente';
        EXCEPTION WHEN duplicate_object THEN
            NULL; -- Ignorer si la valeur existe déjà
        END;
        
        BEGIN
            ALTER TYPE statut_livraison_enum ADD VALUE IF NOT EXISTS 'partiellement_livree';
        EXCEPTION WHEN duplicate_object THEN
            NULL;
        END;
        
        BEGIN
            ALTER TYPE statut_livraison_enum ADD VALUE IF NOT EXISTS 'livree';
        EXCEPTION WHEN duplicate_object THEN
            NULL;
        END;
    END IF;
END $$;

-- Mettre à jour la colonne statut_livraison pour utiliser l'enum
ALTER TABLE factures_vente 
ALTER COLUMN statut_livraison TYPE statut_livraison_enum 
USING statut_livraison::statut_livraison_enum;

-- Mettre à jour aussi les lignes de facture si nécessaire
ALTER TABLE lignes_facture_vente 
ALTER COLUMN statut_livraison TYPE statut_livraison_enum 
USING statut_livraison::statut_livraison_enum;
