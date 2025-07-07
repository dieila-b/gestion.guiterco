
-- Modifier la table factures_vente pour changer le statut de paiement par défaut
ALTER TABLE public.factures_vente 
ALTER COLUMN statut_paiement SET DEFAULT 'payee';

-- Créer une fonction trigger pour créer automatiquement un versement complet
-- quand une facture est créée avec le statut "payee" par défaut
CREATE OR REPLACE FUNCTION public.create_automatic_versement()
RETURNS TRIGGER AS $$
BEGIN
    -- Si la facture est créée avec statut "payee" et qu'aucun versement n'existe
    IF NEW.statut_paiement = 'payee' AND NEW.montant_ttc > 0 THEN
        -- Vérifier qu'il n'y a pas déjà de versement pour cette facture
        IF NOT EXISTS (
            SELECT 1 FROM public.versements_clients 
            WHERE facture_id = NEW.id
        ) THEN
            -- Créer un versement automatique pour le montant total
            INSERT INTO public.versements_clients (
                client_id,
                facture_id,
                montant,
                mode_paiement,
                numero_versement,
                date_versement,
                observations
            ) VALUES (
                NEW.client_id,
                NEW.id,
                NEW.montant_ttc,
                COALESCE(NEW.mode_paiement, 'especes'),
                'AUTO-' || NEW.numero_facture,
                NEW.date_facture,
                'Versement automatique - Facture payée intégralement'
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger sur les factures de vente
DROP TRIGGER IF EXISTS trigger_create_automatic_versement ON public.factures_vente;
CREATE TRIGGER trigger_create_automatic_versement
    AFTER INSERT ON public.factures_vente
    FOR EACH ROW
    EXECUTE FUNCTION public.create_automatic_versement();

-- Mettre à jour la fonction existante pour gérer les mises à jour de statut
CREATE OR REPLACE FUNCTION public.handle_facture_payment_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Si le statut passe de non-payé à payé et qu'il n'y a pas de versement complet
    IF OLD.statut_paiement != 'payee' AND NEW.statut_paiement = 'payee' THEN
        -- Calculer le montant déjà payé
        DECLARE
            montant_deja_paye NUMERIC := 0;
            montant_restant NUMERIC;
        BEGIN
            SELECT COALESCE(SUM(montant), 0) INTO montant_deja_paye
            FROM public.versements_clients
            WHERE facture_id = NEW.id;
            
            montant_restant := NEW.montant_ttc - montant_deja_paye;
            
            -- Si il reste un montant à payer, créer un versement de complément
            IF montant_restant > 0 THEN
                INSERT INTO public.versements_clients (
                    client_id,
                    facture_id,
                    montant,
                    mode_paiement,
                    numero_versement,
                    date_versement,
                    observations
                ) VALUES (
                    NEW.client_id,
                    NEW.id,
                    montant_restant,
                    COALESCE(NEW.mode_paiement, 'especes'),
                    'COMP-' || NEW.numero_facture,
                    CURRENT_TIMESTAMP,
                    'Versement de complément - Solde facture'
                );
            END IF;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour les mises à jour
DROP TRIGGER IF EXISTS trigger_handle_payment_status_change ON public.factures_vente;
CREATE TRIGGER trigger_handle_payment_status_change
    AFTER UPDATE ON public.factures_vente
    FOR EACH ROW
    WHEN (OLD.statut_paiement IS DISTINCT FROM NEW.statut_paiement)
    EXECUTE FUNCTION public.handle_facture_payment_status_change();
