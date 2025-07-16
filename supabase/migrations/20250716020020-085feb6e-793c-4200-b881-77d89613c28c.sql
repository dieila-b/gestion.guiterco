
-- Ajouter les nouveaux champs à la table precommandes
ALTER TABLE public.precommandes 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'en_attente',
ADD COLUMN IF NOT EXISTS amount_paid NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS amount_due NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS stock_status TEXT DEFAULT 'en_attente';

-- Créer des contraintes pour les valeurs autorisées
ALTER TABLE public.precommandes 
ADD CONSTRAINT check_payment_status 
CHECK (payment_status IN ('en_attente', 'partiellement_paye', 'paye'));

ALTER TABLE public.precommandes 
ADD CONSTRAINT check_stock_status 
CHECK (stock_status IN ('disponible', 'en_attente', 'partiellement_disponible'));

-- Mettre à jour les précommandes existantes avec des valeurs calculées
UPDATE public.precommandes 
SET 
  amount_paid = COALESCE(acompte_verse, 0),
  amount_due = montant_ttc - COALESCE(acompte_verse, 0),
  payment_status = CASE 
    WHEN COALESCE(acompte_verse, 0) = 0 THEN 'en_attente'
    WHEN COALESCE(acompte_verse, 0) >= montant_ttc THEN 'paye'
    ELSE 'partiellement_paye'
  END,
  stock_status = CASE 
    WHEN statut = 'prete' THEN 'disponible'
    WHEN statut = 'partiellement_livree' THEN 'partiellement_disponible'
    ELSE 'en_attente'
  END;

-- Ajouter des index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_precommandes_payment_status ON public.precommandes(payment_status);
CREATE INDEX IF NOT EXISTS idx_precommandes_stock_status ON public.precommandes(stock_status);

-- Créer une fonction trigger pour maintenir la cohérence des données
CREATE OR REPLACE FUNCTION update_precommande_payment_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculer amount_paid et amount_due
  NEW.amount_paid = COALESCE(NEW.acompte_verse, 0);
  NEW.amount_due = NEW.montant_ttc - COALESCE(NEW.acompte_verse, 0);
  
  -- Déterminer payment_status
  IF NEW.amount_paid = 0 THEN
    NEW.payment_status = 'en_attente';
  ELSIF NEW.amount_paid >= NEW.montant_ttc THEN
    NEW.payment_status = 'paye';
  ELSE
    NEW.payment_status = 'partiellement_paye';
  END IF;
  
  -- Déterminer stock_status basé sur le statut de livraison
  CASE NEW.statut
    WHEN 'prete' THEN NEW.stock_status = 'disponible';
    WHEN 'partiellement_livree' THEN NEW.stock_status = 'partiellement_disponible';
    WHEN 'livree' THEN NEW.stock_status = 'disponible';
    ELSE NEW.stock_status = 'en_attente';
  END CASE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger
DROP TRIGGER IF EXISTS trigger_update_precommande_payment_fields ON public.precommandes;
CREATE TRIGGER trigger_update_precommande_payment_fields
  BEFORE INSERT OR UPDATE ON public.precommandes
  FOR EACH ROW
  EXECUTE FUNCTION update_precommande_payment_fields();

-- Mettre à jour les politiques RLS pour protéger les précommandes livrées et payées
CREATE POLICY "Protect completed precommandes from modification" 
ON public.precommandes 
FOR UPDATE 
TO authenticated
USING (NOT (statut = 'livree' AND payment_status = 'paye'));

CREATE POLICY "Protect completed precommandes from deletion" 
ON public.precommandes 
FOR DELETE 
TO authenticated
USING (NOT (statut = 'livree' AND payment_status = 'paye'));
