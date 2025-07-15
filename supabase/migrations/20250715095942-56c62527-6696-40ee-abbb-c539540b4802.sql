-- Ajouter la colonne surstaries à la table bons_de_commande
ALTER TABLE public.bons_de_commande 
ADD COLUMN surstaries NUMERIC DEFAULT 0;