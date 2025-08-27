-- Corriger les politiques RLS pour les factures d'achat (version corrigée)

-- 1. Supprimer TOUTES les politiques existantes sur factures_achat
DO $$ 
DECLARE
    pol_name TEXT;
BEGIN
    FOR pol_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'factures_achat' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol_name || '" ON public.factures_achat';
    END LOOP;
END $$;

-- 2. Supprimer TOUTES les politiques existantes sur articles_facture_achat
DO $$ 
DECLARE
    pol_name TEXT;
BEGIN
    FOR pol_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'articles_facture_achat' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol_name || '" ON public.articles_facture_achat';
    END LOOP;
END $$;

-- 3. Supprimer TOUTES les politiques existantes sur reglements_achat si elle existe
DO $$ 
DECLARE
    pol_name TEXT;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reglements_achat') THEN
        FOR pol_name IN 
            SELECT policyname 
            FROM pg_policies 
            WHERE tablename = 'reglements_achat' AND schemaname = 'public'
        LOOP
            EXECUTE 'DROP POLICY IF EXISTS "' || pol_name || '" ON public.reglements_achat';
        END LOOP;
    END IF;
END $$;

-- 4. Créer la table reglements_achat si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.reglements_achat (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    facture_achat_id UUID REFERENCES public.factures_achat(id) ON DELETE CASCADE,
    montant NUMERIC NOT NULL DEFAULT 0,
    mode_paiement VARCHAR(50),
    date_reglement TIMESTAMP WITH TIME ZONE DEFAULT now(),
    reference_paiement VARCHAR(100),
    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.factures_achat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles_facture_achat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reglements_achat ENABLE ROW LEVEL SECURITY;

-- 5. Créer les nouvelles politiques permissives
CREATE POLICY "Dev_factures_achat_all" ON public.factures_achat FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Dev_articles_facture_achat_all" ON public.articles_facture_achat FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Dev_reglements_achat_all" ON public.reglements_achat FOR ALL USING (true) WITH CHECK (true);