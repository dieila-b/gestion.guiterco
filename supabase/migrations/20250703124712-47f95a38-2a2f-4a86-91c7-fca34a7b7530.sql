-- Ajouter les champs de remise dans les tables concernées

-- Ajouter le champ remise_totale dans la table factures_vente
ALTER TABLE public.factures_vente 
ADD COLUMN remise_totale numeric DEFAULT 0;

-- Ajouter les champs de remise dans la table lignes_facture_vente
ALTER TABLE public.lignes_facture_vente 
ADD COLUMN remise_unitaire numeric DEFAULT 0,
ADD COLUMN remise_pourcentage numeric DEFAULT 0,
ADD COLUMN prix_unitaire_brut numeric DEFAULT 0;

-- Mettre à jour les commentaires des colonnes pour clarifier leur usage
COMMENT ON COLUMN public.lignes_facture_vente.remise_unitaire IS 'Montant de la remise appliquée par unité (en valeur absolue)';
COMMENT ON COLUMN public.lignes_facture_vente.remise_pourcentage IS 'Pourcentage de remise appliqué (0-100)';
COMMENT ON COLUMN public.lignes_facture_vente.prix_unitaire_brut IS 'Prix unitaire avant remise';
COMMENT ON COLUMN public.factures_vente.remise_totale IS 'Montant total des remises appliquées sur cette facture';