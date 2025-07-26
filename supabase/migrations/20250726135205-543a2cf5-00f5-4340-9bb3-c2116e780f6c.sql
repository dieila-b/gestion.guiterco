-- Supprimer les utilisateurs internes qui n'ont pas d'utilisateur auth correspondant
DELETE FROM public.utilisateurs_internes 
WHERE id NOT IN (SELECT id FROM auth.users);

-- Ajouter la colonne user_id avec contrainte foreign key vers auth.users
ALTER TABLE public.utilisateurs_internes 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Remplir la colonne user_id avec les valeurs de la colonne id
UPDATE public.utilisateurs_internes 
SET user_id = id;

-- Rendre user_id non nullable et unique
ALTER TABLE public.utilisateurs_internes 
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.utilisateurs_internes 
ADD CONSTRAINT utilisateurs_internes_user_id_unique UNIQUE (user_id);