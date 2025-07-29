-- Créer les politiques RLS pour la vue des marges articles
CREATE POLICY "Authenticated users can read vue_marges_articles" ON public.vue_marges_articles
  FOR SELECT USING (true);

-- Créer les politiques RLS pour vue_marges_globales_stock si elle existe
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vue_marges_globales_stock') THEN
    EXECUTE 'CREATE POLICY IF NOT EXISTS "Authenticated users can read vue_marges_globales_stock" ON public.vue_marges_globales_stock FOR SELECT USING (true)';
  END IF;
END $$;

-- Activer RLS sur ces vues si pas déjà fait
ALTER TABLE public.vue_marges_articles ENABLE ROW LEVEL SECURITY;

-- Vérifier si vue_marges_globales_stock existe et activer RLS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vue_marges_globales_stock') THEN
    EXECUTE 'ALTER TABLE public.vue_marges_globales_stock ENABLE ROW LEVEL SECURITY';
  END IF;
END $$;