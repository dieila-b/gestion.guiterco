
-- Ajouter une colonne statut_ligne pour le suivi détaillé des lignes de précommande
ALTER TABLE public.lignes_precommande 
ADD COLUMN IF NOT EXISTS statut_ligne TEXT DEFAULT 'en_attente';

-- Ajouter une colonne quantite_livree pour suivre les livraisons partielles
ALTER TABLE public.lignes_precommande 
ADD COLUMN IF NOT EXISTS quantite_livree INTEGER DEFAULT 0;

-- Ajouter une colonne updated_at pour les lignes de précommande
ALTER TABLE public.lignes_precommande 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Créer un trigger pour mettre à jour automatiquement le statut des précommandes
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

-- Créer le trigger sur les lignes de précommande
DROP TRIGGER IF EXISTS trigger_update_precommande_status ON public.lignes_precommande;
CREATE TRIGGER trigger_update_precommande_status
    AFTER INSERT OR UPDATE OR DELETE ON public.lignes_precommande
    FOR EACH ROW
    EXECUTE FUNCTION update_precommande_status();

-- Fonction pour calculer automatiquement les totaux de précommande
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

-- Créer le trigger pour calculer les totaux
DROP TRIGGER IF EXISTS trigger_calculate_precommande_totals ON public.lignes_precommande;
CREATE TRIGGER trigger_calculate_precommande_totals
    AFTER INSERT OR UPDATE OR DELETE ON public.lignes_precommande
    FOR EACH ROW
    EXECUTE FUNCTION calculate_precommande_totals();
