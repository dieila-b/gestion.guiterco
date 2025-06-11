
-- Créer le bucket product-images s'il n'existe pas
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Ajouter une politique pour permettre la lecture publique des images
CREATE POLICY "Allow public read access to product-images" ON storage.objects 
FOR SELECT USING (bucket_id = 'product-images');
