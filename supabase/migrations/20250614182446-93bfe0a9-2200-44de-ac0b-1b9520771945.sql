
-- Table pour les catégories de dépenses
CREATE TABLE IF NOT EXISTS public.categories_depenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  couleur TEXT DEFAULT '#8b5cf6', -- violet par défaut
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les sorties financières (=dépenses)
CREATE TABLE IF NOT EXISTS public.sorties_financieres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_sortie TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  description TEXT NOT NULL,
  montant INTEGER NOT NULL, -- En GNF, entier uniquement
  categorie_id UUID REFERENCES public.categories_depenses(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- (Option) Index pour améliorer les recherches par catégorie
CREATE INDEX IF NOT EXISTS idx_sorties_by_categorie ON public.sorties_financieres(categorie_id);

-- RLS: consultation ouverte pour le moment, à restreindre après ajout d’authentification
ALTER TABLE public.categories_depenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sorties_financieres ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut lire les catégories" ON public.categories_depenses
  FOR SELECT USING (true);

CREATE POLICY "Tout le monde peut lire les sorties" ON public.sorties_financieres
  FOR SELECT USING (true);

-- Vous pourrez restreindre (ajouter policies INSERT/UPDATE/DELETE sur l’utilisateur connecté) une fois l’auth mis en place
