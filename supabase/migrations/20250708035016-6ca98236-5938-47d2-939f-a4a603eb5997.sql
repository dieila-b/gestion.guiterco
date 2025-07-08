
-- Ajouter la clé étrangère manquante entre versements_clients et factures_vente
ALTER TABLE public.versements_clients 
ADD CONSTRAINT versements_clients_facture_id_fkey 
FOREIGN KEY (facture_id) REFERENCES public.factures_vente(id) 
ON DELETE CASCADE;

-- Vérifier que la relation est bien créée
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM 
  information_schema.table_constraints AS tc 
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'versements_clients'
  AND kcu.column_name = 'facture_id';
