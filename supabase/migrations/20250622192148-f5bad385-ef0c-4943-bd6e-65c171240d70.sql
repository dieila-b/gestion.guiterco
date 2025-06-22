
-- Créer une fonction pour traiter automatiquement les précommandes quand un produit est en stock
CREATE OR REPLACE FUNCTION process_precommandes_on_stock_availability()
RETURNS TRIGGER AS $$
DECLARE
    precommande_record RECORD;
    stock_total INTEGER;
    quantite_a_livrer INTEGER;
BEGIN
    -- Calculer le stock total disponible pour cet article
    SELECT 
        COALESCE(SUM(sp.quantite_disponible), 0) + COALESCE(SUM(spv.quantite_disponible), 0)
    INTO stock_total
    FROM public.stock_principal sp
    FULL OUTER JOIN public.stock_pdv spv ON sp.article_id = spv.article_id
    WHERE COALESCE(sp.article_id, spv.article_id) = NEW.article_id;
    
    -- Traiter les précommandes en attente pour cet article
    FOR precommande_record IN
        SELECT 
            p.id,
            p.numero_precommande,
            p.client_id,
            lp.quantite,
            lp.quantite_livree,
            lp.prix_unitaire,
            lp.id as ligne_id
        FROM public.precommandes p
        JOIN public.lignes_precommande lp ON p.id = lp.precommande_id
        WHERE lp.article_id = NEW.article_id 
        AND p.statut IN ('confirmee', 'en_preparation')
        AND (lp.quantite - COALESCE(lp.quantite_livree, 0)) > 0
        ORDER BY p.date_precommande ASC -- FIFO
    LOOP
        -- Calculer la quantité à livrer
        quantite_a_livrer := LEAST(
            stock_total, 
            precommande_record.quantite - COALESCE(precommande_record.quantite_livree, 0)
        );
        
        IF quantite_a_livrer > 0 THEN
            -- Mettre à jour la ligne de précommande
            UPDATE public.lignes_precommande 
            SET 
                quantite_livree = COALESCE(quantite_livree, 0) + quantite_a_livrer,
                statut_ligne = CASE 
                    WHEN COALESCE(quantite_livree, 0) + quantite_a_livrer >= quantite THEN 'livree'
                    ELSE 'partiellement_livree'
                END,
                updated_at = now()
            WHERE id = precommande_record.ligne_id;
            
            -- Mettre à jour le statut de la précommande
            UPDATE public.precommandes 
            SET 
                statut = CASE
                    WHEN (SELECT COUNT(*) FROM public.lignes_precommande lp2 
                          WHERE lp2.precommande_id = precommande_record.id 
                          AND COALESCE(lp2.quantite_livree, 0) < lp2.quantite) = 0 
                    THEN 'prete'
                    ELSE 'partiellement_livree'
                END,
                updated_at = now()
            WHERE id = precommande_record.id;
            
            -- Créer une notification
            INSERT INTO public.notifications_precommandes (
                precommande_id,
                type_notification,
                message,
                statut
            ) VALUES (
                precommande_record.id,
                'stock_disponible',
                format('Stock disponible: %s unités allouées pour la précommande %s', 
                       quantite_a_livrer, precommande_record.numero_precommande),
                'en_attente'
            );
            
            -- Réduire le stock disponible
            stock_total := stock_total - quantite_a_livrer;
            
            -- Arrêter si plus de stock disponible
            IF stock_total <= 0 THEN
                EXIT;
            END IF;
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger sur les entrées de stock
DROP TRIGGER IF EXISTS trigger_process_precommandes_on_stock ON public.entrees_stock;
CREATE TRIGGER trigger_process_precommandes_on_stock
    AFTER INSERT ON public.entrees_stock
    FOR EACH ROW
    EXECUTE FUNCTION process_precommandes_on_stock_availability();

-- Créer le trigger sur les mises à jour de stock principal
DROP TRIGGER IF EXISTS trigger_process_precommandes_on_stock_update ON public.stock_principal;
CREATE TRIGGER trigger_process_precommandes_on_stock_update
    AFTER UPDATE OF quantite_disponible ON public.stock_principal
    FOR EACH ROW
    WHEN (NEW.quantite_disponible > OLD.quantite_disponible)
    EXECUTE FUNCTION process_precommandes_on_stock_availability();

-- Ajouter une colonne pour suivre les précommandes prêtes à être converties
ALTER TABLE public.precommandes 
ADD COLUMN IF NOT EXISTS prete_pour_conversion BOOLEAN DEFAULT FALSE;

-- Vue pour les précommandes prêtes à être traitées
CREATE OR REPLACE VIEW public.vue_precommandes_pretes AS
SELECT 
    p.*,
    c.nom as client_nom,
    c.email as client_email,
    COUNT(lp.id) as nb_lignes,
    COUNT(CASE WHEN lp.statut_ligne = 'livree' THEN 1 END) as nb_lignes_livrees,
    SUM(lp.quantite * lp.prix_unitaire) as montant_total
FROM public.precommandes p
JOIN public.clients c ON p.client_id = c.id
JOIN public.lignes_precommande lp ON p.id = lp.precommande_id
WHERE p.statut IN ('prete', 'partiellement_livree')
    AND (
        -- Toutes les lignes sont livrées
        NOT EXISTS (
            SELECT 1 FROM public.lignes_precommande lp2 
            WHERE lp2.precommande_id = p.id 
            AND COALESCE(lp2.quantite_livree, 0) < lp2.quantite
        )
        -- Ou au moins une ligne est partiellement livrée
        OR EXISTS (
            SELECT 1 FROM public.lignes_precommande lp3 
            WHERE lp3.precommande_id = p.id 
            AND COALESCE(lp3.quantite_livree, 0) > 0
        )
    )
GROUP BY p.id, c.nom, c.email
ORDER BY p.date_precommande ASC;
