
-- Corriger la relation manquante entre utilisateurs_internes et user_roles
-- La table user_roles doit être liée à utilisateurs_internes via user_id

-- Vérifier les relations existantes
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND (tc.table_name = 'user_roles' OR tc.table_name = 'utilisateurs_internes');

-- Supprimer les contraintes existantes si nécessaire
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;
ALTER TABLE public.utilisateurs_internes DROP CONSTRAINT IF EXISTS utilisateurs_internes_user_id_fkey;

-- Créer la relation correcte : user_roles.user_id -> auth.users.id
ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Créer la relation correcte : utilisateurs_internes.user_id -> auth.users.id
ALTER TABLE public.utilisateurs_internes 
ADD CONSTRAINT utilisateurs_internes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Forcer le rechargement du cache PostgREST pour reconnaître les nouvelles relations
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- Vérifier les relations après création
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND (tc.table_name = 'user_roles' OR tc.table_name = 'utilisateurs_internes');
