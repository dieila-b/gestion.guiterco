-- Modifier la contrainte foreign key pour permettre la suppression en cascade
ALTER TABLE public.utilisateurs_internes 
DROP CONSTRAINT IF EXISTS utilisateurs_internes_user_id_fkey;

ALTER TABLE public.utilisateurs_internes
ADD CONSTRAINT utilisateurs_internes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;