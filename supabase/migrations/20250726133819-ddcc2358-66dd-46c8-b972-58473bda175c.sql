-- Ajouter la colonne user_id manquante qui fait le lien avec auth.users
ALTER TABLE public.utilisateurs_internes 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Remplir la colonne user_id avec les valeurs de la colonne id existante
UPDATE public.utilisateurs_internes 
SET user_id = id;

-- Ajouter une contrainte d'unicité sur user_id
ALTER TABLE public.utilisateurs_internes 
ADD CONSTRAINT utilisateurs_internes_user_id_unique UNIQUE (user_id);