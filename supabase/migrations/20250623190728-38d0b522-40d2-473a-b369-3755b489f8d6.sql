
-- Ajouter les colonnes nécessaires pour le suivi des livraisons
ALTER TABLE lignes_precommande 
ADD COLUMN IF NOT EXISTS quantite_livree INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS statut_ligne TEXT DEFAULT 'en_attente';

-- Fonction pour calculer automatiquement le statut de livraison d'une précommande
CREATE OR REPLACE FUNCTION update_precommande_status()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    total_quantite INTEGER;
    total_livree INTEGER;
    precommande_id_val UUID;
BEGIN
    precommande_id_val := COALESCE(NEW.precommande_id, OLD.precommande_id);
    
    -- Calculer les totaux
    SELECT 
        COALESCE(SUM(quantite), 0),
        COALESCE(SUM(quantite_livree), 0)
    INTO total_quantite, total_livree
    FROM lignes_precommande
    WHERE precommande_id = precommande_id_val;
    
    -- Mettre à jour le statut selon les livraisons
    UPDATE precommandes
    SET statut = CASE
        WHEN total_livree = 0 THEN 'confirmee'
        WHEN total_livree < total_quantite THEN 'partiellement_livree'
        WHEN total_livree = total_quantite THEN 'livree'
        ELSE statut
    END,
    updated_at = now()
    WHERE id = precommande_id_val;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Créer le trigger pour la mise à jour automatique du statut
DROP TRIGGER IF EXISTS trigger_update_precommande_status ON lignes_precommande;
CREATE TRIGGER trigger_update_precommande_status
    AFTER INSERT OR UPDATE OR DELETE ON lignes_precommande
    FOR EACH ROW
    EXECUTE FUNCTION update_precommande_status();

-- Fonction pour vérifier la disponibilité en stock et mettre à jour les précommandes
CREATE OR REPLACE FUNCTION check_precommande_stock_availability()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    precommande_record RECORD;
    article_disponible BOOLEAN;
    stock_entrepot INTEGER;
    stock_pdv INTEGER;
BEGIN
    -- Vérifier si c'est une entrée de stock qui pourrait satisfaire des précommandes
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Chercher les précommandes en attente pour cet article
        FOR precommande_record IN
            SELECT p.id, p.numero_precommande, p.client_id, p.statut,
                   lp.article_id, lp.quantite
            FROM precommandes p
            JOIN lignes_precommande lp ON p.id = lp.precommande_id
            WHERE lp.article_id = NEW.article_id 
            AND p.statut IN ('confirmee', 'en_preparation')
            AND p.notification_envoyee = FALSE
        LOOP
            -- Vérifier la disponibilité totale (entrepôt + PDV)
            SELECT COALESCE(SUM(sp.quantite_disponible), 0) INTO stock_entrepot
            FROM stock_principal sp
            WHERE sp.article_id = precommande_record.article_id;
            
            SELECT COALESCE(SUM(spv.quantite_disponible), 0) INTO stock_pdv
            FROM stock_pdv spv
            WHERE spv.article_id = precommande_record.article_id;
            
            -- Si le stock total est suffisant pour cette précommande
            IF (stock_entrepot + stock_pdv) >= precommande_record.quantite THEN
                -- Mettre à jour le statut de la précommande
                UPDATE precommandes 
                SET statut = 'prete', 
                    notification_envoyee = TRUE,
                    date_notification = now(),
                    updated_at = now()
                WHERE id = precommande_record.id;
                
                -- Créer une notification
                INSERT INTO notifications_precommandes (
                    precommande_id, 
                    type_notification, 
                    message
                ) VALUES (
                    precommande_record.id,
                    'stock_disponible',
                    'Stock disponible pour la précommande ' || precommande_record.numero_precommande
                );
            END IF;
        END LOOP;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Créer les triggers pour vérifier la disponibilité du stock
DROP TRIGGER IF EXISTS trigger_check_stock_entrepot ON stock_principal;
CREATE TRIGGER trigger_check_stock_entrepot
    AFTER INSERT OR UPDATE ON stock_principal
    FOR EACH ROW
    EXECUTE FUNCTION check_precommande_stock_availability();

DROP TRIGGER IF EXISTS trigger_check_stock_pdv ON stock_pdv;
CREATE TRIGGER trigger_check_stock_pdv
    AFTER INSERT OR UPDATE ON stock_pdv
    FOR EACH ROW
    EXECUTE FUNCTION check_precommande_stock_availability();
