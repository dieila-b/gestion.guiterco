
-- Vérifier et corriger le trigger de calcul de remise totale
-- Le problème vient du fait que le trigger essaie d'accéder à un champ "facture_id" 
-- qui n'existe pas dans la table articles_facture_achat

-- D'abord, supprimer le trigger existant s'il a été mal appliqué
DROP TRIGGER IF EXISTS trigger_calculate_remise_totale ON articles_facture_achat;

-- Vérifier que le trigger pour les factures de vente utilise bien le bon champ
DROP TRIGGER IF EXISTS trigger_calculate_remise_totale ON lignes_facture_vente;

-- Recréer le trigger UNIQUEMENT pour les lignes_facture_vente (pas pour articles_facture_achat)
CREATE TRIGGER trigger_calculate_remise_totale
    AFTER INSERT OR UPDATE OR DELETE ON lignes_facture_vente
    FOR EACH ROW
    EXECUTE FUNCTION calculate_facture_remise_totale();

-- S'assurer qu'aucun autre trigger problématique n'existe sur articles_facture_achat
-- qui pourrait faire référence à un champ "facture_id" inexistant
