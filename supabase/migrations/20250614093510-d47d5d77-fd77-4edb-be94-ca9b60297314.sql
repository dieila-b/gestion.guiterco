
-- Créer la table pour les règlements des factures d'achat
CREATE TABLE public.reglements_achat (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  facture_achat_id UUID NOT NULL,
  montant NUMERIC NOT NULL DEFAULT 0,
  date_reglement TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  mode_paiement VARCHAR NOT NULL,
  reference_paiement VARCHAR,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by VARCHAR
);

-- Ajouter les contraintes de clé étrangère
ALTER TABLE public.reglements_achat 
ADD CONSTRAINT fk_reglements_achat_facture 
FOREIGN KEY (facture_achat_id) REFERENCES public.factures_achat(id) ON DELETE CASCADE;

-- Créer un index pour optimiser les requêtes
CREATE INDEX idx_reglements_achat_facture_id ON public.reglements_achat(facture_achat_id);

-- Ajouter le trigger pour mettre à jour updated_at
CREATE TRIGGER update_reglements_achat_updated_at
  BEFORE UPDATE ON public.reglements_achat
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Mettre à jour la table factures_achat pour ajouter le champ fournisseur_id si nécessaire
ALTER TABLE public.factures_achat 
ADD COLUMN IF NOT EXISTS fournisseur_id UUID,
ADD CONSTRAINT fk_factures_achat_fournisseur 
FOREIGN KEY (fournisseur_id) REFERENCES public.fournisseurs(id);

-- Créer un index pour optimiser les requêtes avec les fournisseurs
CREATE INDEX IF NOT EXISTS idx_factures_achat_fournisseur_id ON public.factures_achat(fournisseur_id);
