
-- Ajouter une colonne pour l'image produit
ALTER TABLE public.catalogue 
ADD COLUMN image_url TEXT;

-- Créer un bucket de stockage pour les images produits
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true);

-- Créer des politiques pour le bucket des images produits
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update their uploads" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images');
CREATE POLICY "Users can delete their uploads" ON storage.objects FOR DELETE USING (bucket_id = 'product-images');

-- Créer une fonction pour générer automatiquement les références produits
CREATE OR REPLACE FUNCTION generate_product_reference()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    reference TEXT;
BEGIN
    -- Obtenir le prochain numéro en séquence
    SELECT COALESCE(
        MAX(
            CASE 
                WHEN reference ~ '^REF[0-9]+$' 
                THEN CAST(SUBSTRING(reference FROM 4) AS INTEGER)
                ELSE 0
            END
        ), 0
    ) + 1 
    INTO next_number
    FROM public.catalogue;
    
    -- Formater la référence avec padding de zéros
    reference := 'REF' || LPAD(next_number::TEXT, 6, '0');
    
    RETURN reference;
END;
$$ LANGUAGE plpgsql;

-- Créer un trigger pour générer automatiquement la référence si elle n'est pas fournie
CREATE OR REPLACE FUNCTION auto_generate_reference()
RETURNS TRIGGER AS $$
BEGIN
    -- Si la référence n'est pas fournie ou est vide, la générer automatiquement
    IF NEW.reference IS NULL OR NEW.reference = '' THEN
        NEW.reference := generate_product_reference();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attacher le trigger à la table catalogue
DROP TRIGGER IF EXISTS trigger_auto_generate_reference ON public.catalogue;
CREATE TRIGGER trigger_auto_generate_reference
    BEFORE INSERT ON public.catalogue
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_reference();
