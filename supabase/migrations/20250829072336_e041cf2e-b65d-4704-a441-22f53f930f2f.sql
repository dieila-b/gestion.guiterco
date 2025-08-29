-- Corriger la vue vue_solde_caisse pour retourner un seul résultat agrégé
DROP VIEW IF EXISTS vue_solde_caisse;

CREATE VIEW vue_solde_caisse AS
SELECT 
  SUM(solde_actif) as solde_actif,
  SUM(nombre_operations) as nombre_operations,
  MAX(derniere_operation) as derniere_operation,
  'TOTAL' as cash_register_id
FROM (
  SELECT 
    cash_register_id,
    COALESCE(SUM(
      CASE 
        WHEN type = 'income' THEN COALESCE(amount, montant, 0)
        WHEN type = 'expense' THEN -COALESCE(amount, montant, 0)
        ELSE 0
      END
    ), 0) as solde_actif,
    COUNT(*) as nombre_operations,
    MAX(COALESCE(date_operation, created_at)) as derniere_operation
  FROM transactions
  GROUP BY cash_register_id
  
  UNION ALL
  
  -- Ajouter les opérations de caisse
  SELECT 
    COALESCE(cash_register_id, point_vente_id::text::uuid) as cash_register_id,
    COALESCE(SUM(
      CASE 
        WHEN type = 'depot' THEN montant
        WHEN type = 'retrait' THEN -montant
        ELSE 0
      END
    ), 0) as solde_actif,
    COUNT(*) as nombre_operations,
    MAX(created_at) as derniere_operation
  FROM cash_operations
  WHERE cash_register_id IS NOT NULL OR point_vente_id IS NOT NULL
  GROUP BY COALESCE(cash_register_id, point_vente_id::text::uuid)
  
  UNION ALL
  
  -- Ajouter les versements clients
  SELECT 
    gen_random_uuid() as cash_register_id, -- UUID temporaire car on n'a pas de cash_register_id dans versements_clients
    COALESCE(SUM(montant), 0) as solde_actif,
    COUNT(*) as nombre_operations,
    MAX(date_versement) as derniere_operation
  FROM versements_clients vc
  INNER JOIN factures_vente fv ON vc.facture_id = fv.id
  WHERE fv.statut_paiement IN ('payee', 'partiellement_payee')
  
  UNION ALL
  
  -- Soustraire les sorties financières
  SELECT 
    gen_random_uuid() as cash_register_id,
    -COALESCE(SUM(montant), 0) as solde_actif,
    COUNT(*) as nombre_operations,
    MAX(date_sortie) as derniere_operation
  FROM sorties_financieres
) as consolidated_data;