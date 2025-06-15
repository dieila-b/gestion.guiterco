
-- Créer la table categories_financieres pour gérer les catégories d'entrées et sorties
CREATE TABLE IF NOT EXISTS public.categories_financieres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('entree', 'sortie')),
  couleur TEXT DEFAULT '#6366f1',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ajouter les champs manquants à la table transactions
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS date_operation TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS categorie_id UUID REFERENCES public.categories_financieres(id),
ADD COLUMN IF NOT EXISTS montant NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS commentaire TEXT;

-- Créer un index pour optimiser les requêtes par date et type
CREATE INDEX IF NOT EXISTS idx_transactions_date_type ON public.transactions(date_operation, type);
CREATE INDEX IF NOT EXISTS idx_transactions_categorie ON public.transactions(categorie_id);
CREATE INDEX IF NOT EXISTS idx_categories_financieres_type ON public.categories_financieres(type);

-- Trigger pour mettre à jour updated_at sur categories_financieres
CREATE TRIGGER update_categories_financieres_updated_at
  BEFORE UPDATE ON public.categories_financieres
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS pour categories_financieres (lecture publique pour l'instant)
ALTER TABLE public.categories_financieres ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut voir les catégories financières" ON public.categories_financieres
  FOR SELECT USING (true);

CREATE POLICY "Tout le monde peut créer des catégories financières" ON public.categories_financieres
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Tout le monde peut modifier des catégories financières" ON public.categories_financieres
  FOR UPDATE USING (true);

-- Insérer quelques catégories par défaut
INSERT INTO public.categories_financieres (nom, type, couleur, description) VALUES
('Ventes', 'entree', '#10b981', 'Revenus des ventes'),
('Remboursements', 'entree', '#06b6d4', 'Remboursements reçus'),
('Autres recettes', 'entree', '#8b5cf6', 'Autres entrées diverses'),
('Fournitures bureau', 'sortie', '#ef4444', 'Achats de fournitures'),
('Transport', 'sortie', '#f59e0b', 'Frais de transport'),
('Maintenance', 'sortie', '#6b7280', 'Frais de maintenance'),
('Autres dépenses', 'sortie', '#64748b', 'Autres sorties diverses')
ON CONFLICT DO NOTHING;
