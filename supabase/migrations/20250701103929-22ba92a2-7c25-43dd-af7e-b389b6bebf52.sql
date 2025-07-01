
-- Supprimer les contraintes de clé étrangère existantes qui pourraient être cassées
ALTER TABLE factures_vente DROP CONSTRAINT IF EXISTS fk_facture_statut_livraison;
ALTER TABLE factures_vente DROP CONSTRAINT IF EXISTS fk_statut_livraison;

-- Recréer la contrainte de clé étrangère avec un nom clair
ALTER TABLE factures_vente 
ADD CONSTRAINT fk_factures_vente_statut_livraison 
FOREIGN KEY (statut_livraison_id) REFERENCES livraison_statut(id);

-- Mettre à jour les factures qui n'ont pas de statut_livraison_id défini
UPDATE factures_vente 
SET statut_livraison_id = 1 
WHERE statut_livraison_id IS NULL;

-- S'assurer que la colonne n'accepte pas les valeurs NULL pour éviter les problèmes futurs
ALTER TABLE factures_vente 
ALTER COLUMN statut_livraison_id SET NOT NULL;

-- Supprimer l'ancienne colonne texte statut_livraison si elle existe encore
ALTER TABLE factures_vente DROP COLUMN IF EXISTS statut_livraison;
