
-- Corriger la fonction calculate_facture_remise_totale pour utiliser le bon nom de champ
CREATE OR REPLACE FUNCTION calculate_facture_remise_totale()
RETURNS TRIGGER AS $$
DECLARE
    facture_id_val UUID;
    nouvelle_remise_totale NUMERIC;
BEGIN
    -- Récupérer l'ID de la facture selon l'opération
    IF TG_OP = 'DELETE' THEN
        facture_id_val := OLD.facture_vente_id;
    ELSE
        facture_id_val := NEW.facture_vente_id;
    END IF;
    
    -- Calculer la remise totale pour cette facture
    SELECT COALESCE(SUM(remise_unitaire * quantite), 0)
    INTO nouvelle_remise_totale
    FROM lignes_facture_vente
    WHERE facture_vente_id = facture_id_val;
    
    -- Mettre à jour la remise totale dans la table factures_vente
    UPDATE factures_vente
    SET remise_totale = nouvelle_remise_totale,
        updated_at = now()
    WHERE id = facture_id_val;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Vérifier qu'aucun autre trigger problématique n'existe
-- et supprimer les triggers potentiellement problématiques sur d'autres tables
DROP TRIGGER IF EXISTS trigger_calculate_remise_totale ON articles_facture_achat;
DROP TRIGGER IF EXISTS trigger_calculate_remise_totale ON commandes_clients;
DROP TRIGGER IF EXISTS trigger_calculate_remise_totale ON lignes_commande;

-- S'assurer que le trigger n'existe que sur lignes_facture_vente
DROP TRIGGER IF EXISTS trigger_calculate_remise_totale ON lignes_facture_vente;
CREATE TRIGGER trigger_calculate_remise_totale
    AFTER INSERT OR UPDATE OR DELETE ON lignes_facture_vente
    FOR EACH ROW
    EXECUTE FUNCTION calculate_facture_remise_totale();
