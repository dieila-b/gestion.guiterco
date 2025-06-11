
-- Création de la table bons_de_commande
CREATE TABLE public.bons_de_commande (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_bon VARCHAR(50) NOT NULL UNIQUE,
  fournisseur VARCHAR(255) NOT NULL,
  date_commande TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  date_livraison_prevue TIMESTAMP WITH TIME ZONE,
  statut VARCHAR(50) NOT NULL DEFAULT 'en_cours',
  montant_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  tva NUMERIC(10,2) DEFAULT 0,
  montant_ht NUMERIC(10,2) NOT NULL DEFAULT 0,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by VARCHAR(255)
);

-- Création de la table bons_de_livraison
CREATE TABLE public.bons_de_livraison (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_bon VARCHAR(50) NOT NULL UNIQUE,
  bon_commande_id UUID REFERENCES public.bons_de_commande(id),
  fournisseur VARCHAR(255) NOT NULL,
  date_livraison TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  date_reception TIMESTAMP WITH TIME ZONE,
  statut VARCHAR(50) NOT NULL DEFAULT 'en_transit',
  transporteur VARCHAR(255),
  numero_suivi VARCHAR(255),
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by VARCHAR(255)
);

-- Création de la table factures_achat
CREATE TABLE public.factures_achat (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_facture VARCHAR(50) NOT NULL UNIQUE,
  bon_commande_id UUID REFERENCES public.bons_de_commande(id),
  bon_livraison_id UUID REFERENCES public.bons_de_livraison(id),
  fournisseur VARCHAR(255) NOT NULL,
  date_facture TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  date_echeance TIMESTAMP WITH TIME ZONE,
  montant_ht NUMERIC(10,2) NOT NULL DEFAULT 0,
  tva NUMERIC(10,2) NOT NULL DEFAULT 0,
  montant_ttc NUMERIC(10,2) NOT NULL DEFAULT 0,
  statut_paiement VARCHAR(50) NOT NULL DEFAULT 'en_attente',
  mode_paiement VARCHAR(50),
  date_paiement TIMESTAMP WITH TIME ZONE,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by VARCHAR(255)
);

-- Création de la table retours_fournisseurs
CREATE TABLE public.retours_fournisseurs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_retour VARCHAR(50) NOT NULL UNIQUE,
  facture_achat_id UUID REFERENCES public.factures_achat(id),
  fournisseur VARCHAR(255) NOT NULL,
  date_retour TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  motif_retour VARCHAR(255) NOT NULL,
  statut VARCHAR(50) NOT NULL DEFAULT 'en_cours',
  montant_retour NUMERIC(10,2) NOT NULL DEFAULT 0,
  date_remboursement TIMESTAMP WITH TIME ZONE,
  mode_remboursement VARCHAR(50),
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by VARCHAR(255)
);

-- Ajout des triggers pour mettre à jour updated_at
CREATE TRIGGER update_bons_de_commande_updated_at 
  BEFORE UPDATE ON public.bons_de_commande 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bons_de_livraison_updated_at 
  BEFORE UPDATE ON public.bons_de_livraison 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_factures_achat_updated_at 
  BEFORE UPDATE ON public.factures_achat 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_retours_fournisseurs_updated_at 
  BEFORE UPDATE ON public.retours_fournisseurs 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index pour améliorer les performances
CREATE INDEX idx_bons_de_commande_numero ON public.bons_de_commande(numero_bon);
CREATE INDEX idx_bons_de_commande_fournisseur ON public.bons_de_commande(fournisseur);
CREATE INDEX idx_bons_de_livraison_numero ON public.bons_de_livraison(numero_bon);
CREATE INDEX idx_factures_achat_numero ON public.factures_achat(numero_facture);
CREATE INDEX idx_retours_fournisseurs_numero ON public.retours_fournisseurs(numero_retour);
