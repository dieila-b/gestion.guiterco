-- Renommer la colonne surstaries en surestaries dans la table bons_de_commande
ALTER TABLE public.bons_de_commande 
RENAME COLUMN surstaries TO surestaries;