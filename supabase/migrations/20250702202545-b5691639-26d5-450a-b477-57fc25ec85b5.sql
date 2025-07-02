
-- Ajouter la colonne statut_livraison à la table precommandes
ALTER TABLE public.precommandes 
ADD COLUMN statut_livraison VARCHAR(50) DEFAULT 'en_attente';

-- Ajouter un commentaire pour documenter les valeurs possibles
COMMENT ON COLUMN public.precommandes.statut_livraison IS 'Statut de livraison: en_attente, partiellement_livree, livree';

-- Mettre à jour les précommandes existantes selon leur statut actuel
UPDATE public.precommandes 
SET statut_livraison = CASE 
    WHEN statut = 'livree' THEN 'livree'
    WHEN statut = 'partiellement_livree' THEN 'partiellement_livree'
    ELSE 'en_attente'
END;
