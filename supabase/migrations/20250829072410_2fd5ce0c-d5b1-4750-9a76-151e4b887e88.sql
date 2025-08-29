-- Corriger la vue vue_solde_caisse pour retourner un seul résultat agrégé
DROP VIEW IF EXISTS vue_solde_caisse;

CREATE VIEW vue_solde_caisse AS
SELECT 
  SUM(solde_actif) as solde_actif,
  SUM(nombre_operations) as nombre_operations,
  MAX(derniere_operation) as derniere_operation
FROM (
  -- Transactions principales
  SELECT 
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
  
  UNION ALL
  
  -- Opérations de caisse (uniquement point_vente_id existe)
  SELECT 
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
  WHERE point_vente_id IS NOT NULL
  
  UNION ALL
  
  -- Versements clients (revenus)
  SELECT 
    COALESCE(SUM(vc.montant), 0) as solde_actif,
    COUNT(*) as nombre_operations,
    MAX(vc.date_versement) as derniere_operation
  FROM versements_clients vc
  INNER JOIN factures_vente fv ON vc.facture_id = fv.id
  WHERE fv.statut_paiement IN ('payee', 'partiellement_payee')
  
  UNION ALL
  
  -- Sorties financières (dépenses)
  SELECT 
    -COALESCE(SUM(montant), 0) as solde_actif,
    COUNT(*) as nombre_operations,
    MAX(date_sortie) as derniere_operation
  FROM sorties_financieres
) as consolidated_data;