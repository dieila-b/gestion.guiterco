
-- Table des clients
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  prenom VARCHAR(255),
  email VARCHAR(255),
  telephone VARCHAR(20),
  adresse TEXT,
  code_postal VARCHAR(10),
  ville VARCHAR(100),
  pays VARCHAR(100) DEFAULT 'France',
  type_client VARCHAR(50) DEFAULT 'particulier',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des commandes clients (vente au comptoir)
CREATE TABLE public.commandes_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_commande VARCHAR(50) NOT NULL UNIQUE,
  client_id UUID REFERENCES public.clients(id),
  date_commande TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  statut VARCHAR(50) NOT NULL DEFAULT 'en_cours',
  montant_ht NUMERIC(10,2) NOT NULL DEFAULT 0,
  tva NUMERIC(10,2) NOT NULL DEFAULT 0,
  montant_ttc NUMERIC(10,2) NOT NULL DEFAULT 0,
  mode_paiement VARCHAR(50),
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des lignes de commande
CREATE TABLE public.lignes_commande (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  commande_id UUID REFERENCES public.commandes_clients(id) ON DELETE CASCADE,
  article_id UUID REFERENCES public.catalogue(id),
  quantite INTEGER NOT NULL,
  prix_unitaire NUMERIC(10,2) NOT NULL,
  montant_ligne NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des factures de vente
CREATE TABLE public.factures_vente (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_facture VARCHAR(50) NOT NULL UNIQUE,
  commande_id UUID REFERENCES public.commandes_clients(id),
  client_id UUID REFERENCES public.clients(id) NOT NULL,
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
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des précommandes
CREATE TABLE public.precommandes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_precommande VARCHAR(50) NOT NULL UNIQUE,
  client_id UUID REFERENCES public.clients(id) NOT NULL,
  date_precommande TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  date_livraison_prevue TIMESTAMP WITH TIME ZONE,
  statut VARCHAR(50) NOT NULL DEFAULT 'confirmee',
  montant_ht NUMERIC(10,2) NOT NULL DEFAULT 0,
  tva NUMERIC(10,2) NOT NULL DEFAULT 0,
  montant_ttc NUMERIC(10,2) NOT NULL DEFAULT 0,
  acompte_verse NUMERIC(10,2) DEFAULT 0,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des lignes de précommande
CREATE TABLE public.lignes_precommande (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  precommande_id UUID REFERENCES public.precommandes(id) ON DELETE CASCADE,
  article_id UUID REFERENCES public.catalogue(id),
  quantite INTEGER NOT NULL,
  prix_unitaire NUMERIC(10,2) NOT NULL,
  montant_ligne NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des factures de précommandes
CREATE TABLE public.factures_precommandes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_facture VARCHAR(50) NOT NULL UNIQUE,
  precommande_id UUID REFERENCES public.precommandes(id) NOT NULL,
  client_id UUID REFERENCES public.clients(id) NOT NULL,
  date_facture TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  montant_ht NUMERIC(10,2) NOT NULL DEFAULT 0,
  tva NUMERIC(10,2) NOT NULL DEFAULT 0,
  montant_ttc NUMERIC(10,2) NOT NULL DEFAULT 0,
  type_facture VARCHAR(50) NOT NULL DEFAULT 'acompte',
  statut_paiement VARCHAR(50) NOT NULL DEFAULT 'en_attente',
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des versements clients
CREATE TABLE public.versements_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_versement VARCHAR(50) NOT NULL UNIQUE,
  client_id UUID REFERENCES public.clients(id) NOT NULL,
  facture_id UUID,
  date_versement TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  montant NUMERIC(10,2) NOT NULL,
  mode_paiement VARCHAR(50) NOT NULL,
  reference_paiement VARCHAR(255),
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des devis
CREATE TABLE public.devis_vente (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_devis VARCHAR(50) NOT NULL UNIQUE,
  client_id UUID REFERENCES public.clients(id) NOT NULL,
  date_devis TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  date_validite TIMESTAMP WITH TIME ZONE,
  statut VARCHAR(50) NOT NULL DEFAULT 'brouillon',
  montant_ht NUMERIC(10,2) NOT NULL DEFAULT 0,
  tva NUMERIC(10,2) NOT NULL DEFAULT 0,
  montant_ttc NUMERIC(10,2) NOT NULL DEFAULT 0,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des lignes de devis
CREATE TABLE public.lignes_devis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  devis_id UUID REFERENCES public.devis_vente(id) ON DELETE CASCADE,
  article_id UUID REFERENCES public.catalogue(id),
  quantite INTEGER NOT NULL,
  prix_unitaire NUMERIC(10,2) NOT NULL,
  montant_ligne NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des retours clients
CREATE TABLE public.retours_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_retour VARCHAR(50) NOT NULL UNIQUE,
  client_id UUID REFERENCES public.clients(id) NOT NULL,
  facture_id UUID REFERENCES public.factures_vente(id),
  date_retour TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  motif_retour VARCHAR(255) NOT NULL,
  statut VARCHAR(50) NOT NULL DEFAULT 'en_cours',
  montant_retour NUMERIC(10,2) NOT NULL DEFAULT 0,
  date_remboursement TIMESTAMP WITH TIME ZONE,
  mode_remboursement VARCHAR(50),
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des articles retournés
CREATE TABLE public.articles_retour_client (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  retour_id UUID REFERENCES public.retours_clients(id) ON DELETE CASCADE,
  article_id UUID REFERENCES public.catalogue(id),
  quantite INTEGER NOT NULL,
  prix_unitaire NUMERIC(10,2) NOT NULL,
  montant_ligne NUMERIC(10,2) NOT NULL,
  etat_article VARCHAR(50) DEFAULT 'bon_etat',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ajout des triggers pour mettre à jour updated_at
CREATE TRIGGER update_clients_updated_at 
  BEFORE UPDATE ON public.clients 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_commandes_clients_updated_at 
  BEFORE UPDATE ON public.commandes_clients 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_factures_vente_updated_at 
  BEFORE UPDATE ON public.factures_vente 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_precommandes_updated_at 
  BEFORE UPDATE ON public.precommandes 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_factures_precommandes_updated_at 
  BEFORE UPDATE ON public.factures_precommandes 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_versements_clients_updated_at 
  BEFORE UPDATE ON public.versements_clients 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_devis_vente_updated_at 
  BEFORE UPDATE ON public.devis_vente 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_retours_clients_updated_at 
  BEFORE UPDATE ON public.retours_clients 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index pour améliorer les performances
CREATE INDEX idx_commandes_clients_numero ON public.commandes_clients(numero_commande);
CREATE INDEX idx_factures_vente_numero ON public.factures_vente(numero_facture);
CREATE INDEX idx_precommandes_numero ON public.precommandes(numero_precommande);
CREATE INDEX idx_devis_vente_numero ON public.devis_vente(numero_devis);
CREATE INDEX idx_retours_clients_numero ON public.retours_clients(numero_retour);
CREATE INDEX idx_versements_clients_numero ON public.versements_clients(numero_versement);
