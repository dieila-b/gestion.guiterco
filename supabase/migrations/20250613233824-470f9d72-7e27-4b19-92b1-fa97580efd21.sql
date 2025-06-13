
-- Ajouter les colonnes manquantes à la table clients si elles n'existent pas déjà
DO $$ 
BEGIN
    -- Ajouter statut_client si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' 
        AND column_name = 'statut_client' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.clients 
        ADD COLUMN statut_client TEXT CHECK (statut_client IN ('particulier', 'entreprise')) DEFAULT 'particulier';
    END IF;

    -- Ajouter whatsapp si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' 
        AND column_name = 'whatsapp' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.clients 
        ADD COLUMN whatsapp TEXT;
    END IF;

    -- Vérifier si nom_entreprise existe, sinon l'ajouter
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' 
        AND column_name = 'nom_entreprise' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.clients 
        ADD COLUMN nom_entreprise TEXT;
    END IF;

    -- Vérifier si limite_credit existe, sinon l'ajouter
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' 
        AND column_name = 'limite_credit' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.clients 
        ADD COLUMN limite_credit DECIMAL(15,2) DEFAULT 0;
    END IF;
END $$;

-- Rafraîchir le schéma cache en faisant une requête de structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'clients' AND table_schema = 'public'
ORDER BY ordinal_position;
