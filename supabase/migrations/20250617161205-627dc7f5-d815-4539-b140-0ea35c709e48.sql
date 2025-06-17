
-- Vérifier la structure de la table lignes_facture_vente pour s'assurer que le statut_livraison est bien présent
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'lignes_facture_vente' 
AND column_name = 'statut_livraison';

-- Vérifier quelques exemples de données pour diagnostiquer
SELECT 
  fv.numero_facture,
  fv.statut_livraison as statut_facture,
  lfv.article_id,
  lfv.quantite,
  lfv.statut_livraison as statut_ligne
FROM factures_vente fv
LEFT JOIN lignes_facture_vente lfv ON fv.id = lfv.facture_vente_id
ORDER BY fv.created_at DESC
LIMIT 10;

-- Vérifier la fonction get_factures_vente_with_details pour voir comment le statut est calculé
SELECT routine_definition 
FROM information_schema.routines 
WHERE routine_name = 'get_factures_vente_with_details';
