
-- Créer une vue pour calculer le solde actif de la caisse
CREATE OR REPLACE VIEW public.vue_solde_caisse AS
WITH all_operations AS (
  -- Transactions de vente et autres (entrées/sorties)
  SELECT 
    cash_register_id,
    CASE 
      WHEN type = 'income' THEN COALESCE(amount, montant, 0)
      WHEN type = 'expense' THEN -COALESCE(amount, montant, 0)
      ELSE 0 
    END as montant_operation,
    date_operation as date_op,
    'transaction' as source
  FROM public.transactions
  WHERE cash_register_id IS NOT NULL

  UNION ALL

  -- Opérations manuelles de caisse (dépôts/retraits)
  SELECT 
    NULL as cash_register_id, -- Les cash_operations ne sont pas liées à une caisse spécifique
    CASE 
      WHEN type = 'depot' THEN montant
      WHEN type = 'retrait' THEN -montant
      ELSE 0 
    END as montant_operation,
    created_at as date_op,
    'cash_operation' as source
  FROM public.cash_operations

  UNION ALL

  -- Sorties financières (toujours des dépenses)
  SELECT 
    NULL as cash_register_id,
    -montant as montant_operation,
    date_sortie as date_op,
    'sortie_financiere' as source
  FROM public.sorties_financieres
)
SELECT 
  COALESCE(cash_register_id, (SELECT id FROM public.cash_registers LIMIT 1)) as cash_register_id,
  SUM(montant_operation) as solde_actif,
  COUNT(*) as nombre_operations,
  MAX(date_op) as derniere_operation
FROM all_operations
GROUP BY COALESCE(cash_register_id, (SELECT id FROM public.cash_registers LIMIT 1));

-- Accorder les permissions de lecture sur la vue
GRANT SELECT ON public.vue_solde_caisse TO anon, authenticated;
