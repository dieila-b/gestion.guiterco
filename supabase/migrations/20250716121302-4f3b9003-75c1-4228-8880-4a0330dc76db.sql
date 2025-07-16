-- 1. Créer une fonction pour calculer le stock total disponible par article
CREATE OR REPLACE FUNCTION public.get_total_stock_available(p_article_id uuid)
RETURNS INTEGER AS $$
DECLARE
    total_stock INTEGER := 0;
BEGIN
    SELECT 
        COALESCE(SUM(sp.quantite_disponible), 0) + COALESCE(SUM(spv.quantite_disponible), 0)
    INTO total_stock
    FROM public.stock_principal sp
    FULL OUTER JOIN public.stock_pdv spv ON sp.article_id = spv.article_id
    WHERE COALESCE(sp.article_id, spv.article_id) = p_article_id;
    
    RETURN COALESCE(total_stock, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Créer une fonction pour calculer les quantités en précommande par article
CREATE OR REPLACE FUNCTION public.get_precommande_quantities(p_article_id uuid)
RETURNS TABLE(
    total_precommande INTEGER,
    total_livre INTEGER,
    en_attente INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(lp.quantite), 0)::INTEGER as total_precommande,
        COALESCE(SUM(COALESCE(lp.quantite_livree, 0)), 0)::INTEGER as total_livre,
        COALESCE(SUM(lp.quantite - COALESCE(lp.quantite_livree, 0)), 0)::INTEGER as en_attente
    FROM public.lignes_precommande lp
    JOIN public.precommandes p ON lp.precommande_id = p.id
    WHERE lp.article_id = p_article_id
    AND p.statut IN ('confirmee', 'en_preparation', 'prete', 'partiellement_livree');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Fonction pour traiter automatiquement les précommandes lors des entrées de stock
CREATE OR REPLACE FUNCTION public.process_precommandes_on_stock_entry()
RETURNS TRIGGER AS $$
DECLARE
    precommande_record RECORD;
    stock_disponible INTEGER;
    quantite_allouee INTEGER;
    remaining_stock INTEGER;
BEGIN
    -- Calculer le stock total disponible pour cet article
    SELECT public.get_total_stock_available(NEW.article_id) INTO stock_disponible;
    remaining_stock := NEW.quantite;
    
    -- Traiter les précommandes en ordre chronologique (FIFO)
    FOR precommande_record IN
        SELECT 
            p.id as precommande_id,
            p.numero_precommande,
            lp.id as ligne_id,
            lp.quantite,
            COALESCE(lp.quantite_livree, 0) as quantite_livree,
            lp.quantite - COALESCE(lp.quantite_livree, 0) as quantite_restante
        FROM public.precommandes p
        JOIN public.lignes_precommande lp ON p.id = lp.precommande_id
        WHERE lp.article_id = NEW.article_id
        AND p.statut IN ('confirmee', 'en_preparation', 'prete')
        AND (lp.quantite - COALESCE(lp.quantite_livree, 0)) > 0
        ORDER BY p.date_precommande ASC
    LOOP
        -- Calculer la quantité à allouer
        quantite_allouee := LEAST(remaining_stock, precommande_record.quantite_restante);
        
        IF quantite_allouee > 0 THEN
            -- Mettre à jour la ligne de précommande
            UPDATE public.lignes_precommande 
            SET 
                quantite_livree = COALESCE(quantite_livree, 0) + quantite_allouee,
                statut_ligne = CASE 
                    WHEN COALESCE(quantite_livree, 0) + quantite_allouee >= quantite 
                    THEN 'livree'
                    ELSE 'partiellement_livree'
                END,
                updated_at = now()
            WHERE id = precommande_record.ligne_id;
            
            -- Réduire le stock restant
            remaining_stock := remaining_stock - quantite_allouee;
            
            -- Vérifier si la précommande entière est satisfaite
            UPDATE public.precommandes 
            SET 
                statut = CASE
                    WHEN (SELECT COUNT(*) FROM public.lignes_precommande lp2 
                          WHERE lp2.precommande_id = precommande_record.precommande_id 
                          AND COALESCE(lp2.quantite_livree, 0) < lp2.quantite) = 0 
                    THEN 'prete'
                    ELSE 'partiellement_livree'
                END,
                stock_status = 'disponible',
                updated_at = now()
            WHERE id = precommande_record.precommande_id;
            
            -- Créer une notification
            INSERT INTO public.notifications_precommandes (
                precommande_id,
                type_notification,
                message,
                statut
            ) VALUES (
                precommande_record.precommande_id,
                'stock_disponible',
                format('Stock alloué automatiquement: %s unités pour la précommande %s', 
                       quantite_allouee, precommande_record.numero_precommande),
                'en_attente'
            );
            
            -- Arrêter si plus de stock disponible
            IF remaining_stock <= 0 THEN
                EXIT;
            END IF;
        END IF;
    END LOOP;
    
    -- Ajuster la quantité d'entrée pour ne refléter que le surplus
    NEW.quantite := remaining_stock;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Créer le trigger pour les entrées de stock
DROP TRIGGER IF EXISTS trigger_process_precommandes_on_stock_entry ON public.entrees_stock;
CREATE TRIGGER trigger_process_precommandes_on_stock_entry
    BEFORE INSERT ON public.entrees_stock
    FOR EACH ROW
    EXECUTE FUNCTION public.process_precommandes_on_stock_entry();

-- 5. Fonction pour mettre à jour automatiquement le stock_status des précommandes
CREATE OR REPLACE FUNCTION public.update_precommande_stock_status()
RETURNS TRIGGER AS $$
DECLARE
    precommande_id_val UUID;
    stock_total INTEGER;
    quantite_totale INTEGER;
    quantite_livree_totale INTEGER;
BEGIN
    precommande_id_val := COALESCE(NEW.precommande_id, OLD.precommande_id);
    
    -- Calculer les totaux pour cette précommande
    SELECT 
        SUM(lp.quantite),
        SUM(COALESCE(lp.quantite_livree, 0))
    INTO quantite_totale, quantite_livree_totale
    FROM public.lignes_precommande lp
    WHERE lp.precommande_id = precommande_id_val;
    
    -- Calculer le stock disponible total pour tous les articles de cette précommande
    SELECT 
        MIN(public.get_total_stock_available(lp.article_id))
    INTO stock_total
    FROM public.lignes_precommande lp
    WHERE lp.precommande_id = precommande_id_val;
    
    -- Mettre à jour le stock_status
    UPDATE public.precommandes
    SET stock_status = CASE
        WHEN quantite_livree_totale = quantite_totale THEN 'disponible'
        WHEN stock_total >= quantite_totale THEN 'disponible'
        WHEN stock_total > 0 THEN 'partiellement_disponible'
        ELSE 'en_attente'
    END,
    updated_at = now()
    WHERE id = precommande_id_val;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 6. Créer les triggers pour mettre à jour le stock_status
DROP TRIGGER IF EXISTS trigger_update_stock_status_on_ligne_change ON public.lignes_precommande;
CREATE TRIGGER trigger_update_stock_status_on_ligne_change
    AFTER INSERT OR UPDATE OR DELETE ON public.lignes_precommande
    FOR EACH ROW
    EXECUTE FUNCTION public.update_precommande_stock_status();

DROP TRIGGER IF EXISTS trigger_update_stock_status_on_stock_change ON public.stock_principal;
CREATE TRIGGER trigger_update_stock_status_on_stock_change
    AFTER INSERT OR UPDATE ON public.stock_principal
    FOR EACH ROW
    EXECUTE FUNCTION public.check_precommande_stock_availability();

DROP TRIGGER IF EXISTS trigger_update_stock_status_on_stock_pdv_change ON public.stock_pdv;
CREATE TRIGGER trigger_update_stock_status_on_stock_pdv_change
    AFTER INSERT OR UPDATE ON public.stock_pdv
    FOR EACH ROW
    EXECUTE FUNCTION public.check_precommande_stock_availability();