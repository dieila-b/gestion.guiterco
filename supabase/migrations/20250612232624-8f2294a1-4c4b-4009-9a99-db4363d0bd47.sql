
-- Supprimer les contraintes de clés étrangères existantes redondantes
ALTER TABLE public.bons_de_livraison 
DROP CONSTRAINT IF EXISTS bons_de_livraison_entrepot_destination_id_fkey;

ALTER TABLE public.bons_de_livraison 
DROP CONSTRAINT IF EXISTS fk_bons_livraison_entrepot_destination;

-- Recréer une seule contrainte de clé étrangère claire
ALTER TABLE public.bons_de_livraison 
ADD CONSTRAINT bons_de_livraison_entrepot_destination_id_fkey 
FOREIGN KEY (entrepot_destination_id) REFERENCES public.entrepots(id) ON DELETE SET NULL;

-- Faire de même pour les points de vente
ALTER TABLE public.bons_de_livraison 
DROP CONSTRAINT IF EXISTS bons_de_livraison_point_vente_destination_id_fkey;

ALTER TABLE public.bons_de_livraison 
DROP CONSTRAINT IF EXISTS fk_bons_livraison_point_vente_destination;

-- Recréer une seule contrainte de clé étrangère claire
ALTER TABLE public.bons_de_livraison 
ADD CONSTRAINT bons_de_livraison_point_vente_destination_id_fkey 
FOREIGN KEY (point_vente_destination_id) REFERENCES public.points_de_vente(id) ON DELETE SET NULL;
