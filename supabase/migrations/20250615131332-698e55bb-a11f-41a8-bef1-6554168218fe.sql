
-- Corriger les données existantes dans la table transactions
-- Étape 1: Mettre à jour les ventes encaissées
UPDATE transactions 
SET source = 'Vente encaissée' 
WHERE type = 'income' 
  AND (description ILIKE '%vente%' OR description ILIKE '%facture%' OR description ILIKE '%client%')
  AND (source IS NULL OR source = '' OR source = 'transactions');

-- Étape 2: Mettre à jour les paiements d'impayés
UPDATE transactions 
SET source = 'Paiement d''un impayé' 
WHERE type = 'income' 
  AND (description ILIKE '%impayé%' OR description ILIKE '%règlement%' OR description ILIKE '%retard%')
  AND (source IS NULL OR source = '');

-- Étape 3: Mettre à jour les entrées manuelles restantes
UPDATE transactions 
SET source = 'Entrée manuelle' 
WHERE type = 'income' 
  AND (source IS NULL OR source = '' OR source = 'transactions')
  AND description NOT ILIKE '%vente%' 
  AND description NOT ILIKE '%facture%' 
  AND description NOT ILIKE '%client%'
  AND description NOT ILIKE '%impayé%'
  AND description NOT ILIKE '%règlement%';

-- Étape 4: Mettre à jour les sorties manuelles
UPDATE transactions 
SET source = 'Sortie manuelle' 
WHERE type = 'expense' 
  AND (source IS NULL OR source = '');

-- Étape 5: Vérifier les résultats
SELECT source, type, COUNT(*) as count 
FROM transactions 
GROUP BY source, type 
ORDER BY type, source;
