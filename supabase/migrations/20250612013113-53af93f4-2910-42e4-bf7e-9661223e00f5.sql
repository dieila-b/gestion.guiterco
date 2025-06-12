
-- Étendre les champs numériques de la table bons_de_commande
ALTER TABLE public.bons_de_commande 
ALTER COLUMN montant_total TYPE NUMERIC(20,2),
ALTER COLUMN tva TYPE NUMERIC(20,2),
ALTER COLUMN montant_ht TYPE NUMERIC(20,2),
ALTER COLUMN remise TYPE NUMERIC(20,2),
ALTER COLUMN frais_livraison TYPE NUMERIC(20,2),
ALTER COLUMN frais_logistique TYPE NUMERIC(20,2),
ALTER COLUMN montant_paye TYPE NUMERIC(20,2),
ALTER COLUMN transit_douane TYPE NUMERIC(20,2),
ALTER COLUMN taux_tva TYPE NUMERIC(5,2);

-- Étendre les champs numériques de la table articles_bon_commande
ALTER TABLE public.articles_bon_commande 
ALTER COLUMN prix_unitaire TYPE NUMERIC(20,2),
ALTER COLUMN montant_ligne TYPE NUMERIC(20,2);

-- Étendre les champs numériques de la table catalogue (articles)
ALTER TABLE public.catalogue 
ALTER COLUMN prix_unitaire TYPE NUMERIC(20,2),
ALTER COLUMN prix_achat TYPE NUMERIC(20,2),
ALTER COLUMN prix_vente TYPE NUMERIC(20,2);

-- Étendre les champs numériques des autres tables liées
ALTER TABLE public.factures_achat 
ALTER COLUMN montant_ht TYPE NUMERIC(20,2),
ALTER COLUMN tva TYPE NUMERIC(20,2),
ALTER COLUMN montant_ttc TYPE NUMERIC(20,2),
ALTER COLUMN transit_douane TYPE NUMERIC(20,2),
ALTER COLUMN taux_tva TYPE NUMERIC(5,2);

ALTER TABLE public.bons_de_livraison 
ALTER COLUMN taux_tva TYPE NUMERIC(5,2),
ALTER COLUMN transit_douane TYPE NUMERIC(20,2);

ALTER TABLE public.retours_fournisseurs 
ALTER COLUMN montant_retour TYPE NUMERIC(20,2);

-- Étendre les champs numériques des tables de vente pour cohérence
ALTER TABLE public.factures_vente 
ALTER COLUMN montant_ht TYPE NUMERIC(20,2),
ALTER COLUMN tva TYPE NUMERIC(20,2),
ALTER COLUMN montant_ttc TYPE NUMERIC(20,2),
ALTER COLUMN taux_tva TYPE NUMERIC(5,2);

ALTER TABLE public.devis_vente 
ALTER COLUMN montant_ht TYPE NUMERIC(20,2),
ALTER COLUMN montant_ttc TYPE NUMERIC(20,2),
ALTER COLUMN tva TYPE NUMERIC(20,2),
ALTER COLUMN taux_tva TYPE NUMERIC(5,2);

ALTER TABLE public.precommandes 
ALTER COLUMN montant_ht TYPE NUMERIC(20,2),
ALTER COLUMN tva TYPE NUMERIC(20,2),
ALTER COLUMN montant_ttc TYPE NUMERIC(20,2),
ALTER COLUMN acompte_verse TYPE NUMERIC(20,2),
ALTER COLUMN taux_tva TYPE NUMERIC(5,2);

ALTER TABLE public.commandes_clients 
ALTER COLUMN montant_ht TYPE NUMERIC(20,2),
ALTER COLUMN montant_ttc TYPE NUMERIC(20,2),
ALTER COLUMN tva TYPE NUMERIC(20,2),
ALTER COLUMN taux_tva TYPE NUMERIC(5,2);

-- Étendre les champs des lignes de commande/devis/précommandes
ALTER TABLE public.lignes_commande 
ALTER COLUMN prix_unitaire TYPE NUMERIC(20,2),
ALTER COLUMN montant_ligne TYPE NUMERIC(20,2);

ALTER TABLE public.lignes_devis 
ALTER COLUMN prix_unitaire TYPE NUMERIC(20,2),
ALTER COLUMN montant_ligne TYPE NUMERIC(20,2);

ALTER TABLE public.lignes_precommande 
ALTER COLUMN prix_unitaire TYPE NUMERIC(20,2),
ALTER COLUMN montant_ligne TYPE NUMERIC(20,2);

ALTER TABLE public.factures_precommandes 
ALTER COLUMN montant_ht TYPE NUMERIC(20,2),
ALTER COLUMN montant_ttc TYPE NUMERIC(20,2),
ALTER COLUMN tva TYPE NUMERIC(20,2);

-- Étendre les champs des retours clients et versements
ALTER TABLE public.retours_clients 
ALTER COLUMN montant_retour TYPE NUMERIC(20,2);

ALTER TABLE public.articles_retour_client 
ALTER COLUMN prix_unitaire TYPE NUMERIC(20,2),
ALTER COLUMN montant_ligne TYPE NUMERIC(20,2);

ALTER TABLE public.versements_clients 
ALTER COLUMN montant TYPE NUMERIC(20,2);

-- Étendre les champs des entrées de stock
ALTER TABLE public.entrees_stock 
ALTER COLUMN prix_unitaire TYPE NUMERIC(20,2);

-- Étendre les champs des transactions de caisse
ALTER TABLE public.transactions 
ALTER COLUMN amount TYPE NUMERIC(20,2);

ALTER TABLE public.cash_registers 
ALTER COLUMN balance TYPE NUMERIC(20,2);
