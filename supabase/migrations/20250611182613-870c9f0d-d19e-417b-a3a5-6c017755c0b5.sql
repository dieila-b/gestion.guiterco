
-- Supprimer les anciennes politiques qui nécessitent l'authentification
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their uploads" ON storage.objects;

-- Créer de nouvelles politiques plus permissives pour le bucket product-images
CREATE POLICY "Allow public uploads to product-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Allow public updates to product-images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images');
CREATE POLICY "Allow public deletes to product-images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images');
