
-- Vérifier et ajuster la structure des tables pour les précommandes

-- Mise à jour de la table precommandes pour inclure tous les champs nécessaires
ALTER TABLE public.precommandes 
ADD COLUMN IF NOT EXISTS reste_a_payer NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_commande NUMERIC DEFAULT 0;

-- Mise à jour de la table lignes_precommande pour la gestion des livraisons partielles
ALTER TABLE public.lignes_precommande 
ADD COLUMN IF NOT EXISTS quantite_livree INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS statut_ligne TEXT DEFAULT 'en_attente';

-- Fonction pour calculer automatiquement le reste à payer
CREATE OR REPLACE FUNCTION calculate_precommande_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculer le total de la précommande
    UPDATE public.precommandes 
    SET 
        total_commande = (
            SELECT COALESCE(SUM(quantite * prix_unitaire), 0)
            FROM public.lignes_precommande 
            WHERE precommande_id = NEW.precommande_id
        ),
        reste_a_payer = (
            SELECT COALESCE(SUM(quantite * prix_unitaire), 0) - COALESCE(acompte_verse, 0)
            FROM public.lignes_precommande 
            WHERE precommande_id = NEW.precommande_id
        )
    WHERE id = NEW.precommande_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour recalculer automatiquement les totaux
DROP TRIGGER IF EXISTS trigger_calculate_precommande_totals ON public.lignes_precommande;
CREATE TRIGGER trigger_calculate_precommande_totals
    AFTER INSERT OR UPDATE OR DELETE ON public.lignes_precommande
    FOR EACH ROW
    EXECUTE FUNCTION calculate_precommande_totals();

-- Fonction pour gérer la conversion d'une précommande en vente
CREATE OR REPLACE FUNCTION convert_precommande_to_sale(precommande_uuid UUID)
RETURNS UUID AS $$
DECLARE
    precommande_data RECORD;
    new_facture_id UUID;
    ligne_record RECORD;
BEGIN
    -- Récupérer les données de la précommande
    SELECT * INTO precommande_data
    FROM public.precommandes 
    WHERE id = precommande_uuid AND statut IN ('prete', 'confirmee');
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Précommande non trouvée ou non convertible';
    END IF;
    
    -- Créer une nouvelle facture de vente
    INSERT INTO public.factures_vente (
        client_id,
        montant_ht,
        tva,
        montant_ttc,
        statut_paiement,
        statut_livraison,
        observations
    ) VALUES (
        precommande_data.client_id,
        precommande_data.montant_ht,
        precommande_data.tva,
        precommande_data.montant_ttc,
        CASE WHEN precommande_data.acompte_verse > 0 THEN 'partiellement_payee' ELSE 'en_attente' END,
        'en_attente',
        'Facture générée depuis la précommande ' || precommande_data.numero_precommande
    ) RETURNING id INTO new_facture_id;
    
    -- Copier les lignes de précommande vers la facture
    FOR ligne_record IN
        SELECT * FROM public.lignes_precommande 
        WHERE precommande_id = precommande_uuid
    LOOP
        INSERT INTO public.lignes_facture_vente (
            facture_vente_id,
            article_id,
            quantite,
            prix_unitaire,
            montant_ligne
        ) VALUES (
            new_facture_id,
            ligne_record.article_id,
            ligne_record.quantite,
            ligne_record.prix_unitaire,
            ligne_record.montant_ligne
        );
    END LOOP;
    
    -- Si il y a un acompte, créer un versement
    IF precommande_data.acompte_verse > 0 THEN
        INSERT INTO public.versements_clients (
            client_id,
            facture_id,
            montant,
            mode_paiement,
            numero_versement,
            observations
        ) VALUES (
            precommande_data.client_id,
            new_facture_id,
            precommande_data.acompte_verse,
            'acompte_precommande',
            'ACOMPTE-' || precommande_data.numero_precommande,
            'Acompte transféré depuis la précommande ' || precommande_data.numero_precommande
        );
    END IF;
    
    -- Mettre à jour le statut de la précommande
    UPDATE public.precommandes 
    SET statut = 'convertie_en_vente',
        updated_at = now()
    WHERE id = precommande_uuid;
    
    RETURN new_facture_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour mettre à jour le statut des précommandes selon les livraisons
CREATE OR REPLACE FUNCTION update_precommande_status()
RETURNS TRIGGER AS $$
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
    FROM public.lignes_precommande
    WHERE precommande_id = precommande_id_val;
    
    -- Mettre à jour le statut selon les livraisons
    UPDATE public.precommandes
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
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement le statut des précommandes
DROP TRIGGER IF EXISTS trigger_update_precommande_status ON public.lignes_precommande;
CREATE TRIGGER trigger_update_precommande_status
    AFTER UPDATE OF quantite_livree ON public.lignes_precommande
    FOR EACH ROW
    EXECUTE FUNCTION update_precommande_status();
