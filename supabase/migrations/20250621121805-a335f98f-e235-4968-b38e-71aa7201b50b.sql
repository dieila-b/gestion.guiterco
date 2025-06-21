
-- Table pour les clôtures de caisse
CREATE TABLE IF NOT EXISTS public.clotures_caisse (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cash_register_id UUID NOT NULL REFERENCES public.cash_registers(id) ON DELETE CASCADE,
  date_cloture DATE NOT NULL DEFAULT CURRENT_DATE,
  heure_cloture TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  solde_debut NUMERIC NOT NULL DEFAULT 0,
  solde_fin NUMERIC NOT NULL DEFAULT 0,
  total_entrees NUMERIC NOT NULL DEFAULT 0,
  total_sorties NUMERIC NOT NULL DEFAULT 0,
  balance_jour NUMERIC NOT NULL DEFAULT 0,
  nb_transactions INTEGER NOT NULL DEFAULT 0,
  utilisateur_cloture TEXT,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les comptages de caisse
CREATE TABLE IF NOT EXISTS public.comptages_caisse (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cash_register_id UUID NOT NULL REFERENCES public.cash_registers(id) ON DELETE CASCADE,
  date_comptage TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  montant_theorique NUMERIC NOT NULL DEFAULT 0,
  montant_reel NUMERIC NOT NULL DEFAULT 0,
  ecart NUMERIC GENERATED ALWAYS AS (montant_reel - montant_theorique) STORED,
  details_coupures JSONB, -- Stockage des détails par coupures
  utilisateur_comptage TEXT,
  observations TEXT,
  type_comptage TEXT DEFAULT 'manuel' CHECK (type_comptage IN ('manuel', 'automatique')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour l'historique des états de caisse
CREATE TABLE IF NOT EXISTS public.etats_caisse (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cash_register_id UUID NOT NULL REFERENCES public.cash_registers(id) ON DELETE CASCADE,
  date_etat DATE NOT NULL DEFAULT CURRENT_DATE,
  heure_generation TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  type_etat TEXT NOT NULL CHECK (type_etat IN ('quotidien', 'fermeture', 'comptage')),
  donnees_etat JSONB NOT NULL, -- Stockage des données du rapport
  utilisateur_generation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_clotures_caisse_date ON public.clotures_caisse(date_cloture);
CREATE INDEX IF NOT EXISTS idx_clotures_caisse_register ON public.clotures_caisse(cash_register_id);
CREATE INDEX IF NOT EXISTS idx_comptages_caisse_date ON public.comptages_caisse(date_comptage);
CREATE INDEX IF NOT EXISTS idx_comptages_caisse_register ON public.comptages_caisse(cash_register_id);
CREATE INDEX IF NOT EXISTS idx_etats_caisse_date ON public.etats_caisse(date_etat);
CREATE INDEX IF NOT EXISTS idx_etats_caisse_register ON public.etats_caisse(cash_register_id);

-- Trigger pour mettre à jour updated_at sur clotures_caisse
CREATE OR REPLACE TRIGGER update_clotures_caisse_updated_at
  BEFORE UPDATE ON public.clotures_caisse
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS policies (permissives pour le développement)
ALTER TABLE public.clotures_caisse ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comptages_caisse ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etats_caisse ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permettre toutes opérations sur clotures_caisse" ON public.clotures_caisse FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permettre toutes opérations sur comptages_caisse" ON public.comptages_caisse FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permettre toutes opérations sur etats_caisse" ON public.etats_caisse FOR ALL USING (true) WITH CHECK (true);
