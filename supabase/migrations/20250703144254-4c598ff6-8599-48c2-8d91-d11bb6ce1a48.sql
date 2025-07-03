
-- Lister tous les triggers existants pour identifier ceux qui posent problème
SELECT 
    schemaname,
    tablename,
    triggername,
    actiontiming,
    actionevent,
    actionorientation
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
AND NOT t.tgisinternal
ORDER BY tablename, triggername;

-- Supprimer complètement le trigger problématique s'il existe encore
DROP TRIGGER IF EXISTS trigger_calculate_remise_totale ON articles_facture_achat;
DROP TRIGGER IF EXISTS trigger_calculate_remise_totale ON commandes_clients;
DROP TRIGGER IF EXISTS trigger_calculate_remise_totale ON lignes_commande;
DROP TRIGGER IF EXISTS trigger_calculate_remise_totale ON versements_clients;

-- Vérifier et corriger la fonction calculate_facture_remise_totale
DROP FUNCTION IF EXISTS calculate_facture_remise_totale() CASCADE;

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

-- Recréer le trigger UNIQUEMENT sur la table lignes_facture_vente
DROP TRIGGER IF EXISTS trigger_calculate_remise_totale ON lignes_facture_vente;
CREATE TRIGGER trigger_calculate_remise_totale
    AFTER INSERT OR UPDATE OR DELETE ON lignes_facture_vente
    FOR EACH ROW
    EXECUTE FUNCTION calculate_facture_remise_totale();

-- Vérifier s'il y a d'autres fonctions qui pourraient causer le problème
-- et les corriger si nécessaire
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT proname, prosrc 
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' 
        AND prosrc LIKE '%facture_id%'
        AND proname != 'calculate_facture_remise_totale'
    LOOP
        RAISE NOTICE 'Fonction trouvée avec facture_id: %', func_record.proname;
    END LOOP;
END $$;
