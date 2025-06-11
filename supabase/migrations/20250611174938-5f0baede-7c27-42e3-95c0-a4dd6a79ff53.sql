
-- Ajouter les nouvelles colonnes pour les prix d'achat et de vente
ALTER TABLE public.catalogue 
ADD COLUMN prix_achat NUMERIC,
ADD COLUMN prix_vente NUMERIC;

-- Migrer les données existantes du prix_unitaire vers prix_achat
UPDATE public.catalogue 
SET prix_achat = prix_unitaire 
WHERE prix_unitaire IS NOT NULL;

-- Optionnel: supprimer l'ancienne colonne prix_unitaire si elle n'est plus nécessaire
-- ALTER TABLE public.catalogue DROP COLUMN prix_unitaire;
