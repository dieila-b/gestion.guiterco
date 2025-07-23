-- Créer un bucket pour les avatars des utilisateurs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('user-avatars', 'user-avatars', true);

-- Politique pour permettre de voir les avatars
CREATE POLICY "Avatars are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'user-avatars');

-- Politique pour permettre d'uploader des avatars (utilisateurs authentifiés)
CREATE POLICY "Users can upload avatars" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'user-avatars');

-- Politique pour permettre de mettre à jour des avatars
CREATE POLICY "Users can update avatars" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'user-avatars');

-- Politique pour permettre de supprimer des avatars
CREATE POLICY "Users can delete avatars" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'user-avatars');