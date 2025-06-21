
-- Fonction pour créer une transaction de caisse lors du paiement d'un acompte de précommande
CREATE OR REPLACE FUNCTION create_precommande_cash_transaction(
    precommande_uuid UUID,
    montant_acompte NUMERIC,
    mode_paiement TEXT DEFAULT 'especes'
)
RETURNS UUID AS $$
DECLARE
    precommande_data RECORD;
    cash_register_id UUID;
    transaction_id UUID;
BEGIN
    -- Récupérer les données de la précommande
    SELECT p.*, c.nom as client_nom 
    INTO precommande_data
    FROM public.precommandes p
    JOIN public.clients c ON p.client_id = c.id
    WHERE p.id = precommande_uuid;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Précommande non trouvée';
    END IF;
    
    -- Récupérer la première caisse disponible
    SELECT id INTO cash_register_id
    FROM public.cash_registers
    LIMIT 1;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Aucune caisse disponible';
    END IF;
    
    -- Créer la transaction de caisse pour l'acompte
    INSERT INTO public.transactions (
        type,
        amount,
        montant,
        description,
        commentaire,
        category,
        payment_method,
        cash_register_id,
        source,
        date_operation
    ) VALUES (
        'income',
        montant_acompte,
        montant_acompte,
        'Acompte précommande ' || precommande_data.numero_precommande,
        'Acompte versé par ' || precommande_data.client_nom || ' pour la précommande ' || precommande_data.numero_precommande,
        'sales',
        CASE 
            WHEN mode_paiement = 'carte' THEN 'card'::payment_method
            WHEN mode_paiement = 'virement' THEN 'transfer'::payment_method
            WHEN mode_paiement = 'cheque' THEN 'check'::payment_method
            ELSE 'cash'::payment_method
        END,
        cash_register_id,
        'Précommande',
        now()
    ) RETURNING id INTO transaction_id;
    
    RETURN transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour gérer le paiement final lors de la livraison
CREATE OR REPLACE FUNCTION complete_precommande_payment(
    precommande_uuid UUID,
    montant_final NUMERIC,
    mode_paiement TEXT DEFAULT 'especes'
)
RETURNS UUID AS $$
DECLARE
    precommande_data RECORD;
    cash_register_id UUID;
    transaction_id UUID;
BEGIN
    -- Récupérer les données de la précommande
    SELECT p.*, c.nom as client_nom 
    INTO precommande_data
    FROM public.precommandes p
    JOIN public.clients c ON p.client_id = c.id
    WHERE p.id = precommande_uuid;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Précommande non trouvée';
    END IF;
    
    -- Récupérer la première caisse disponible
    SELECT id INTO cash_register_id
    FROM public.cash_registers
    LIMIT 1;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Aucune caisse disponible';
    END IF;
    
    -- Créer la transaction de caisse pour le solde
    IF montant_final > 0 THEN
        INSERT INTO public.transactions (
            type,
            amount,
            montant,
            description,
            commentaire,
            category,
            payment_method,
            cash_register_id,
            source,
            date_operation
        ) VALUES (
            'income',
            montant_final,
            montant_final,
            'Solde précommande ' || precommande_data.numero_precommande,
            'Solde final payé par ' || precommande_data.client_nom || ' pour la précommande ' || precommande_data.numero_precommande,
            'sales',
            CASE 
                WHEN mode_paiement = 'carte' THEN 'card'::payment_method
                WHEN mode_paiement = 'virement' THEN 'transfer'::payment_method
                WHEN mode_paiement = 'cheque' THEN 'check'::payment_method
                ELSE 'cash'::payment_method
            END,
            cash_register_id,
            'Précommande',
            now()
        ) RETURNING id INTO transaction_id;
    END IF;
    
    -- Mettre à jour le statut de la précommande
    UPDATE public.precommandes 
    SET statut = 'livree',
        updated_at = now()
    WHERE id = precommande_uuid;
    
    RETURN transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement la transaction d'acompte
CREATE OR REPLACE FUNCTION handle_precommande_acompte()
RETURNS TRIGGER AS $$
BEGIN
    -- Si un acompte est versé lors de la création ou mise à jour
    IF NEW.acompte_verse > 0 AND (OLD IS NULL OR OLD.acompte_verse != NEW.acompte_verse) THEN
        PERFORM create_precommande_cash_transaction(
            NEW.id,
            NEW.acompte_verse - COALESCE(OLD.acompte_verse, 0),
            'especes'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger sur la table precommandes
DROP TRIGGER IF EXISTS trigger_precommande_acompte ON public.precommandes;
CREATE TRIGGER trigger_precommande_acompte
    AFTER INSERT OR UPDATE OF acompte_verse ON public.precommandes
    FOR EACH ROW
    EXECUTE FUNCTION handle_precommande_acompte();
