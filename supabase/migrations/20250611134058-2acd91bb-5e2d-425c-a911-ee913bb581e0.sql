
-- Créer la table pour les articles des bons de commande
CREATE TABLE public.articles_bon_commande (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bon_commande_id UUID REFERENCES public.bons_de_commande(id) ON DELETE CASCADE,
  article_id UUID REFERENCES public.catalogue(id),
  quantite INTEGER NOT NULL DEFAULT 1,
  prix_unitaire NUMERIC(10,2) NOT NULL DEFAULT 0,
  montant_ligne NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table fournisseurs si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.fournisseurs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telephone VARCHAR(50),
  adresse TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insérer quelques fournisseurs d'exemple
INSERT INTO public.fournisseurs (nom, email, telephone, adresse) VALUES
('Fournisseur A', 'contact@fournisseura.com', '01 23 45 67 89', '123 Rue du Commerce'),
('Fournisseur B', 'info@fournisseurb.com', '01 98 76 54 32', '456 Avenue des Affaires')
ON CONFLICT DO NOTHING;

-- Ajouter des colonnes manquantes à la table bons_de_commande
ALTER TABLE public.bons_de_commande 
ADD COLUMN IF NOT EXISTS fournisseur_id UUID REFERENCES public.fournisseurs(id),
ADD COLUMN IF NOT EXISTS statut_paiement VARCHAR(50) DEFAULT 'en_attente',
ADD COLUMN IF NOT EXISTS remise NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS frais_livraison NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS frais_logistique NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS montant_paye NUMERIC(10,2) DEFAULT 0;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_articles_bon_commande_bon_id ON public.articles_bon_commande(bon_commande_id);
CREATE INDEX IF NOT EXISTS idx_articles_bon_commande_article_id ON public.articles_bon_commande(article_id);

-- Trigger pour mettre à jour updated_at sur fournisseurs
CREATE TRIGGER update_fournisseurs_updated_at 
  BEFORE UPDATE ON public.fournisseurs 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
