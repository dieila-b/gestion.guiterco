
-- Créer la table des pays
CREATE TABLE IF NOT EXISTS public.pays (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom VARCHAR(255) NOT NULL UNIQUE,
  code_iso VARCHAR(3) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table des villes
CREATE TABLE IF NOT EXISTS public.villes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  pays_id UUID REFERENCES public.pays(id) ON DELETE CASCADE,
  code_postal VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ajouter les nouveaux champs à la table fournisseurs
ALTER TABLE public.fournisseurs 
ADD COLUMN IF NOT EXISTS nom_entreprise VARCHAR(255),
ADD COLUMN IF NOT EXISTS contact_principal VARCHAR(255),
ADD COLUMN IF NOT EXISTS telephone_mobile VARCHAR(50),
ADD COLUMN IF NOT EXISTS telephone_fixe VARCHAR(50),
ADD COLUMN IF NOT EXISTS pays_id UUID REFERENCES public.pays(id),
ADD COLUMN IF NOT EXISTS ville_id UUID REFERENCES public.villes(id),
ADD COLUMN IF NOT EXISTS ville_personnalisee VARCHAR(255),
ADD COLUMN IF NOT EXISTS adresse_complete TEXT,
ADD COLUMN IF NOT EXISTS boite_postale VARCHAR(100),
ADD COLUMN IF NOT EXISTS site_web VARCHAR(255),
ADD COLUMN IF NOT EXISTS statut VARCHAR(50) DEFAULT 'en_attente';

-- Mettre à jour la contrainte pour permettre nom OU nom_entreprise
ALTER TABLE public.fournisseurs ALTER COLUMN nom DROP NOT NULL;

-- Insérer quelques pays de base
INSERT INTO public.pays (nom, code_iso) VALUES
('France', 'FR'),
('Belgique', 'BE'),
('Suisse', 'CH'),
('Canada', 'CA'),
('Maroc', 'MA'),
('Allemagne', 'DE'),
('Espagne', 'ES'),
('Italie', 'IT')
ON CONFLICT (code_iso) DO NOTHING;

-- Insérer quelques villes françaises de base
INSERT INTO public.villes (nom, pays_id, code_postal) 
SELECT 'Paris', p.id, '75000' FROM public.pays p WHERE p.code_iso = 'FR'
UNION ALL
SELECT 'Lyon', p.id, '69000' FROM public.pays p WHERE p.code_iso = 'FR'
UNION ALL
SELECT 'Marseille', p.id, '13000' FROM public.pays p WHERE p.code_iso = 'FR'
UNION ALL
SELECT 'Toulouse', p.id, '31000' FROM public.pays p WHERE p.code_iso = 'FR'
UNION ALL
SELECT 'Nice', p.id, '06000' FROM public.pays p WHERE p.code_iso = 'FR'
ON CONFLICT DO NOTHING;

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_villes_pays_id ON public.villes(pays_id);
CREATE INDEX IF NOT EXISTS idx_fournisseurs_pays_id ON public.fournisseurs(pays_id);
CREATE INDEX IF NOT EXISTS idx_fournisseurs_ville_id ON public.fournisseurs(ville_id);

-- Trigger pour mettre à jour updated_at sur pays et villes
CREATE TRIGGER update_pays_updated_at 
  BEFORE UPDATE ON public.pays 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_villes_updated_at 
  BEFORE UPDATE ON public.villes 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
