
-- Créer une fonction pour traiter automatiquement les précommandes lorsque du stock arrive
CREATE OR REPLACE FUNCTION public.process_precommandes_on_stock_arrival()
RETURNS TRIGGER AS $$
DECLARE
    precommande_record RECORD;
    stock_disponible INTEGER := 0;
    quantite_a_allouer INTEGER := 0;
    message_notification TEXT;
BEGIN
    -- Calculer le stock total disponible pour cet article
    SELECT 
        COALESCE(
            (SELECT SUM(quantite_disponible) FROM stock_principal WHERE article_id = NEW.article_id), 0
        ) + 
        COALESCE(
            (SELECT SUM(quantite_disponible) FROM stock_pdv WHERE article_id = NEW.article_id), 0
        )
    INTO stock_disponible;
    
    -- Parcourir les précommandes en attente pour cet article
    FOR precommande_record IN
        SELECT 
            p.id,
            p.numero_precommande,
            p.client_id,
            lp.quantite,
            COALESCE(lp.quantite_livree, 0) as quantite_livree,
            lp.id as ligne_id,
            c.nom as client_nom,
            cat.nom as article_nom
        FROM precommandes p
        JOIN lignes_precommande lp ON p.id = lp.precommande_id
        JOIN clients c ON p.client_id = c.id
        JOIN catalogue cat ON lp.article_id = cat.id
        WHERE lp.article_id = NEW.article_id 
        AND p.statut IN ('confirmee', 'en_preparation')
        AND (lp.quantite - COALESCE(lp.quantite_livree, 0)) > 0
        ORDER BY p.date_precommande ASC
    LOOP
        -- Calculer la quantité restante à livrer pour cette précommande
        quantite_a_allouer := precommande_record.quantite - precommande_record.quantite_livree;
        
        -- Si on a du stock disponible
        IF stock_disponible > 0 AND quantite_a_allouer > 0 THEN
            -- Créer une notification de disponibilité
            message_notification := format(
                'Article "%s" disponible en stock (%s unités). Précommande %s prête pour livraison (quantité: %s/%s)',
                precommande_record.article_nom,
                stock_disponible,
                precommande_record.numero_precommande,
                LEAST(quantite_a_allouer, stock_disponible),
                quantite_a_allouer
            );
            
            INSERT INTO notifications_precommandes (
                precommande_id,
                type_notification,
                message,
                statut,
                date_creation
            ) VALUES (
                precommande_record.id,
                'stock_disponible',
                message_notification,
                'en_attente',
                now()
            );
            
            -- Mettre à jour le statut de la précommande si elle peut être entièrement satisfaite
            IF stock_disponible >= quantite_a_allouer THEN
                UPDATE precommandes 
                SET statut = 'prete', 
                    updated_at = now()
                WHERE id = precommande_record.id;
            END IF;
            
            -- Réduire le stock virtuel pour les calculs suivants
            stock_disponible := GREATEST(0, stock_disponible - quantite_a_allouer);
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer les triggers pour déclencher les notifications automatiquement
DROP TRIGGER IF EXISTS trigger_process_precommandes_on_stock_entree ON entrees_stock;
CREATE TRIGGER trigger_process_precommandes_on_stock_entree
    AFTER INSERT ON entrees_stock
    FOR EACH ROW
    EXECUTE FUNCTION process_precommandes_on_stock_arrival();

-- Créer une fonction pour afficher les alertes lors de la validation des bons de livraison
CREATE OR REPLACE FUNCTION public.get_precommandes_info_for_article(p_article_id uuid)
RETURNS TABLE(
    article_nom text,
    total_en_precommande integer,
    total_deja_livre integer,
    reste_a_livrer integer,
    nb_precommandes integer
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cat.nom as article_nom,
        COALESCE(SUM(lp.quantite), 0)::integer as total_en_precommande,
        COALESCE(SUM(COALESCE(lp.quantite_livree, 0)), 0)::integer as total_deja_livre,
        COALESCE(SUM(lp.quantite - COALESCE(lp.quantite_livree, 0)), 0)::integer as reste_a_livrer,
        COUNT(DISTINCT p.id)::integer as nb_precommandes
    FROM catalogue cat
    LEFT JOIN lignes_precommande lp ON cat.id = lp.article_id
    LEFT JOIN precommandes p ON lp.precommande_id = p.id
        AND p.statut IN ('confirmee', 'en_preparation', 'prete')
    WHERE cat.id = p_article_id
    GROUP BY cat.id, cat.nom;
END;
$$ LANGUAGE plpgsql;
