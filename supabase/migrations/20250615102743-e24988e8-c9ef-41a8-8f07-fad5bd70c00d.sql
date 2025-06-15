
-- 1. Ajouter une colonne 'source' à la table transactions (nullable pour rétrocompatibilité)
ALTER TABLE public.transactions
ADD COLUMN source TEXT NULL;

-- 2. (Optionnel) Ajout d'un commentaire sur la colonne pour expliciter l'usage
COMMENT ON COLUMN public.transactions.source IS 'Origine de la transaction : vente, entrée manuelle, sortie, remboursement, etc.';

-- 3. (Optionnel) Index pour analyses futures
CREATE INDEX IF NOT EXISTS idx_transactions_source ON public.transactions(source);
