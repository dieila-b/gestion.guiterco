
-- Supprimer les anciennes politiques restrictives pour les avatars
DROP POLICY IF EXISTS "Allow authenticated users to upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete avatars" ON storage.objects;

-- Créer des politiques plus permissives pour le bucket avatars
CREATE POLICY "Allow public uploads to avatars" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Allow public updates to avatars" ON storage.objects 
FOR UPDATE USING (bucket_id = 'avatars');

CREATE POLICY "Allow public deletes to avatars" ON storage.objects 
FOR DELETE USING (bucket_id = 'avatars');

-- La politique de lecture publique existe déjà, mais on la recrée pour être sûr
DROP POLICY IF EXISTS "Allow public read access to avatars" ON storage.objects;
CREATE POLICY "Allow public read access to avatars" ON storage.objects 
FOR SELECT USING (bucket_id = 'avatars');
