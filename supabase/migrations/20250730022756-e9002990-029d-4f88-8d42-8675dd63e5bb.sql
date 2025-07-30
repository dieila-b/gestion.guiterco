-- Vérifier et créer les clés étrangères manquantes pour permettre les relations Supabase

-- Vérifier si les clés étrangères existent déjà
DO $$
BEGIN
    -- Ajouter la clé étrangère pour stock_principal -> catalogue si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'stock_principal_article_id_fkey' 
        AND table_name = 'stock_principal'
    ) THEN
        ALTER TABLE public.stock_principal 
        ADD CONSTRAINT stock_principal_article_id_fkey 
        FOREIGN KEY (article_id) REFERENCES public.catalogue(id);
    END IF;

    -- Ajouter la clé étrangère pour stock_principal -> entrepots si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'stock_principal_entrepot_id_fkey' 
        AND table_name = 'stock_principal'
    ) THEN
        ALTER TABLE public.stock_principal 
        ADD CONSTRAINT stock_principal_entrepot_id_fkey 
        FOREIGN KEY (entrepot_id) REFERENCES public.entrepots(id);
    END IF;

    -- Ajouter la clé étrangère pour stock_pdv -> catalogue si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'stock_pdv_article_id_fkey' 
        AND table_name = 'stock_pdv'
    ) THEN
        ALTER TABLE public.stock_pdv 
        ADD CONSTRAINT stock_pdv_article_id_fkey 
        FOREIGN KEY (article_id) REFERENCES public.catalogue(id);
    END IF;

    -- Ajouter la clé étrangère pour stock_pdv -> points_de_vente si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'stock_pdv_point_vente_id_fkey' 
        AND table_name = 'stock_pdv'
    ) THEN
        ALTER TABLE public.stock_pdv 
        ADD CONSTRAINT stock_pdv_point_vente_id_fkey 
        FOREIGN KEY (point_vente_id) REFERENCES public.points_de_vente(id);
    END IF;
END $$;