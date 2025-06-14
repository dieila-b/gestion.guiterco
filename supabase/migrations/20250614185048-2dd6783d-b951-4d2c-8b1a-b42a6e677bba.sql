
-- Table des opérations de caisse (retrait/dépôt)
CREATE TABLE IF NOT EXISTS public.cash_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  type TEXT NOT NULL CHECK (type IN ('retrait','depot')),
  montant INTEGER NOT NULL,
  commentaire TEXT,
  utilisateur_id UUID, -- à relier plus tard à profiles/auth.users
  point_vente_id UUID REFERENCES public.points_de_vente(id) ON DELETE SET NULL
);

-- Accélérer les filtres par temps
CREATE INDEX IF NOT EXISTS idx_cash_operations_by_created_at ON public.cash_operations(created_at);

-- RLS ouverte à la lecture (à restreindre quand l'auth sera en place)
ALTER TABLE public.cash_operations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut voir les opérations de caisse" ON public.cash_operations
  FOR SELECT USING (true);

