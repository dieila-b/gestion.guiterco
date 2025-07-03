
-- Créer une fonction pour calculer automatiquement la remise totale d'une facture
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

-- Créer le trigger qui se déclenche sur INSERT, UPDATE ou DELETE des lignes de facture
DROP TRIGGER IF EXISTS trigger_calculate_remise_totale ON lignes_facture_vente;
CREATE TRIGGER trigger_calculate_remise_totale
    AFTER INSERT OR UPDATE OR DELETE ON lignes_facture_vente
    FOR EACH ROW
    EXECUTE FUNCTION calculate_facture_remise_totale();

-- Mettre à jour toutes les factures existantes pour calculer leur remise totale
UPDATE factures_vente
SET remise_totale = COALESCE(remise_calc.total_remise, 0)
FROM (
    SELECT 
        fv.id,
        SUM(lfv.remise_unitaire * lfv.quantite) as total_remise
    FROM factures_vente fv
    LEFT JOIN lignes_facture_vente lfv ON fv.id = lfv.facture_vente_id
    GROUP BY fv.id
) remise_calc
WHERE factures_vente.id = remise_calc.id;
