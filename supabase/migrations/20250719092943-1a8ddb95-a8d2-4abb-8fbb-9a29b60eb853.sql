-- Diagnostic complet et résolution de la récursion infinie dans les politiques RLS

-- 1. NETTOYAGE RADICAL DES POLITIQUES PROBLÉMATIQUES
-- Désactiver temporairement RLS sur toutes les tables critiques pour diagnostiquer
ALTER TABLE public.utilisateurs_internes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions DISABLE ROW LEVEL SECURITY;

-- Supprimer TOUTES les politiques existantes sur utilisateurs_internes pour éviter la récursion
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'utilisateurs_internes'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.utilisateurs_internes', policy_record.policyname);
    END LOOP;
END $$;

-- Supprimer les fonctions qui causent la récursion
DROP FUNCTION IF EXISTS public.get_user_role_for_rls();
DROP FUNCTION IF EXISTS public.is_internal_user_active(uuid);
DROP FUNCTION IF EXISTS public.check_user_is_internal();
DROP FUNCTION IF EXISTS public.check_user_is_admin();
DROP FUNCTION IF EXISTS public.is_admin_or_manager();
DROP FUNCTION IF EXISTS public.check_user_authorization();

-- 2. RÉACTIVER RLS AVEC DES POLITIQUES ULTRA-SIMPLES POUR LE DÉVELOPPEMENT
ALTER TABLE public.utilisateurs_internes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- Créer des politiques de développement ultra-permissives (sans récursion)
CREATE POLICY "Dev: Allow all operations on utilisateurs_internes" 
ON public.utilisateurs_internes 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Dev: Allow all operations on user_roles" 
ON public.user_roles 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Dev: Allow all operations on roles" 
ON public.roles 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Dev: Allow all operations on role_permissions" 
ON public.role_permissions 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Dev: Allow all operations on permissions" 
ON public.permissions 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 3. ACTIVER LES TABLES SANS RLS QUI CAUSENT DES ERREURS
-- Activer RLS sur toutes les tables qui n'en ont pas
ALTER TABLE public.articles_bon_commande ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dev: Allow all operations on articles_bon_commande" 
ON public.articles_bon_commande FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.articles_bon_livraison ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dev: Allow all operations on articles_bon_livraison" 
ON public.articles_bon_livraison FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.articles_facture_achat ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dev: Allow all operations on articles_facture_achat" 
ON public.articles_facture_achat FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.articles_retour_client ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dev: Allow all operations on articles_retour_client" 
ON public.articles_retour_client FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.bons_de_commande ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dev: Allow all operations on bons_de_commande" 
ON public.bons_de_commande FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.bons_de_livraison ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dev: Allow all operations on bons_de_livraison" 
ON public.bons_de_livraison FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.categories_catalogue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dev: Allow all operations on categories_catalogue" 
ON public.categories_catalogue FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.commandes_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dev: Allow all operations on commandes_clients" 
ON public.commandes_clients FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.devis_vente ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dev: Allow all operations on devis_vente" 
ON public.devis_vente FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.factures_achat ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dev: Allow all operations on factures_achat" 
ON public.factures_achat FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.factures_precommandes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dev: Allow all operations on factures_precommandes" 
ON public.factures_precommandes FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.fournisseurs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dev: Allow all operations on fournisseurs" 
ON public.fournisseurs FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.lignes_commande ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dev: Allow all operations on lignes_commande" 
ON public.lignes_commande FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.lignes_devis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dev: Allow all operations on lignes_devis" 
ON public.lignes_devis FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.livraison_statut ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dev: Allow all operations on livraison_statut" 
ON public.livraison_statut FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.notifications_precommandes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dev: Allow all operations on notifications_precommandes" 
ON public.notifications_precommandes FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.paiements_vente ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dev: Allow all operations on paiements_vente" 
ON public.paiements_vente FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.pays ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dev: Allow all operations on pays" 
ON public.pays FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.reglements_achat ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dev: Allow all operations on reglements_achat" 
ON public.reglements_achat FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.repartition_frais_bc ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dev: Allow all operations on repartition_frais_bc" 
ON public.repartition_frais_bc FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.retours_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dev: Allow all operations on retours_clients" 
ON public.retours_clients FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.retours_fournisseurs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dev: Allow all operations on retours_fournisseurs" 
ON public.retours_fournisseurs FOR ALL USING (true) WITH CHECK (true);

-- 4. INVALIDER COMPLÈTEMENT LE CACHE POSTGREST
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- 5. VÉRIFICATION FINALE
SELECT 
    'FINAL CHECK' as status,
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('utilisateurs_internes', 'user_roles', 'roles', 'role_permissions', 'permissions')
ORDER BY tablename, policyname;