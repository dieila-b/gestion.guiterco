
-- Ajouter les champs Transit & Douane et Taux de TVA aux bons de commande
ALTER TABLE public.bons_de_commande 
ADD COLUMN transit_douane NUMERIC(10,2) DEFAULT 0,
ADD COLUMN taux_tva NUMERIC(5,2) DEFAULT 20.00;

-- Ajouter les champs Transit & Douane et Taux de TVA aux bons de livraison
ALTER TABLE public.bons_de_livraison 
ADD COLUMN transit_douane NUMERIC(10,2) DEFAULT 0,
ADD COLUMN taux_tva NUMERIC(5,2) DEFAULT 20.00;

-- Ajouter les champs Transit & Douane et Taux de TVA aux factures d'achat
ALTER TABLE public.factures_achat 
ADD COLUMN transit_douane NUMERIC(10,2) DEFAULT 0,
ADD COLUMN taux_tva NUMERIC(5,2) DEFAULT 20.00;

-- Ajouter le champ Taux de TVA aux factures de vente
ALTER TABLE public.factures_vente 
ADD COLUMN taux_tva NUMERIC(5,2) DEFAULT 20.00;

-- Ajouter le champ Taux de TVA aux commandes clients
ALTER TABLE public.commandes_clients 
ADD COLUMN taux_tva NUMERIC(5,2) DEFAULT 20.00;

-- Ajouter le champ Taux de TVA aux devis
ALTER TABLE public.devis_vente 
ADD COLUMN taux_tva NUMERIC(5,2) DEFAULT 20.00;

-- Ajouter le champ Taux de TVA aux précommandes
ALTER TABLE public.precommandes 
ADD COLUMN taux_tva NUMERIC(5,2) DEFAULT 20.00;
