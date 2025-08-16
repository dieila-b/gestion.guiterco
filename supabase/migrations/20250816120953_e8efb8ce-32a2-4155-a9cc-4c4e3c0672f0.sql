
-- Créer la table unites_catalogue qui manque
CREATE TABLE IF NOT EXISTS public.unites_catalogue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom VARCHAR NOT NULL,
  symbole VARCHAR,
  type_unite VARCHAR DEFAULT 'volume',
  statut VARCHAR DEFAULT 'actif',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ajouter une contrainte foreign key entre catalogue.unite_id et unites_catalogue.id
ALTER TABLE public.catalogue 
ADD CONSTRAINT fk_catalogue_unite_id 
FOREIGN KEY (unite_id) REFERENCES public.unites_catalogue(id);

-- Migrer les données existantes de la table unites vers unites_catalogue si elle existe
INSERT INTO public.unites_catalogue (id, nom, symbole, type_unite, statut, created_at, updated_at)
SELECT id, nom, symbole, type_unite, statut, created_at, updated_at
FROM public.unites
ON CONFLICT (id) DO NOTHING;

-- Activer RLS sur unites_catalogue
ALTER TABLE public.unites_catalogue ENABLE ROW LEVEL SECURITY;

-- Créer les policies RLS pour unites_catalogue
CREATE POLICY "Authenticated users can access unites_catalogue" 
  ON public.unites_catalogue 
  FOR ALL 
  USING (true)
  WITH CHECK (true);
