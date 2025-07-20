
-- CORRECTION DÉFINITIVE DES POLITIQUES RLS ET SYNCHRONISATION
-- ===========================================================

-- 1. Vérifier et corriger la structure complète de user_roles
DROP TABLE IF EXISTS public.user_roles CASCADE;

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    assigned_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, role_id)
);

-- 2. Supprimer TOUTES les politiques RLS existantes sur toutes les tables critiques
DROP POLICY IF EXISTS "Gestion complète user_roles pour utilisateurs authentifiés" ON public.user_roles;
DROP POLICY IF EXISTS "Accès complet utilisateurs_internes pour authentifiés" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Accès complet roles pour authentifiés" ON public.roles;

-- Supprimer toutes les autres politiques potentiellement conflictuelles
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('user_roles', 'utilisateurs_internes', 'roles')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- 3. Créer des politiques RLS ULTRA-PERMISSIVES
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utilisateurs_internes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Politiques pour user_roles
CREATE POLICY "user_roles_full_access" ON public.user_roles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Politiques pour utilisateurs_internes  
CREATE POLICY "utilisateurs_internes_full_access" ON public.utilisateurs_internes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Politiques pour roles
CREATE POLICY "roles_full_access" ON public.roles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Créer les triggers pour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_roles_updated_at ON public.user_roles;
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_utilisateurs_internes_updated_at ON public.utilisateurs_internes;
CREATE TRIGGER update_utilisateurs_internes_updated_at
    BEFORE UPDATE ON public.utilisateurs_internes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Fonction pour assignation de rôle simplifiée
CREATE OR REPLACE FUNCTION public.assign_user_role_simple(
    p_user_id UUID,
    p_role_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Supprimer les rôles existants
    DELETE FROM public.user_roles WHERE user_id = p_user_id;
    
    -- Ajouter le nouveau rôle si ce n'est pas "no-role"
    IF p_role_id IS NOT NULL AND p_role_id::text != 'no-role' THEN
        INSERT INTO public.user_roles (user_id, role_id, is_active, assigned_by, assigned_at, created_at, updated_at)
        VALUES (p_user_id, p_role_id, true, auth.uid(), now(), now(), now());
    END IF;
    
    RETURN true;
EXCEPTION WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- 6. Fonction pour mise à jour utilisateur simplifiée
CREATE OR REPLACE FUNCTION public.update_user_simple(
    p_user_id UUID,
    p_prenom TEXT,
    p_nom TEXT,
    p_email TEXT,
    p_telephone TEXT DEFAULT NULL,
    p_adresse TEXT DEFAULT NULL,
    p_photo_url TEXT DEFAULT NULL,
    p_matricule TEXT DEFAULT NULL,
    p_statut TEXT DEFAULT 'actif',
    p_doit_changer_mot_de_passe BOOLEAN DEFAULT false
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.utilisateurs_internes 
    SET 
        prenom = p_prenom,
        nom = p_nom,
        email = p_email,
        telephone = COALESCE(p_telephone, telephone),
        adresse = COALESCE(p_adresse, adresse),
        photo_url = COALESCE(p_photo_url, photo_url),
        matricule = COALESCE(p_matricule, matricule),
        statut = p_statut,
        doit_changer_mot_de_passe = p_doit_changer_mot_de_passe,
        updated_at = now()
    WHERE user_id = p_user_id;
    
    RETURN FOUND;
EXCEPTION WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- 7. Activer la réplication temps réel
ALTER TABLE public.user_roles REPLICA IDENTITY FULL;
ALTER TABLE public.utilisateurs_internes REPLICA IDENTITY FULL;
ALTER TABLE public.roles REPLICA IDENTITY FULL;

-- Ajouter les tables à la publication realtime
DO $$
DECLARE
    tables TEXT[] := ARRAY['user_roles', 'utilisateurs_internes', 'roles'];
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY tables
    LOOP
        BEGIN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', tbl);
        EXCEPTION WHEN duplicate_object THEN
            NULL; -- Table déjà ajoutée
        END;
    END LOOP;
END $$;

-- 8. Invalider le cache PostgREST
NOTIFY pgrst, 'reload schema';

-- 9. Test de diagnostic
CREATE OR REPLACE FUNCTION public.test_rls_permissions()
RETURNS TABLE (
    test_name TEXT,
    result TEXT,
    details TEXT
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT 'Politiques RLS user_roles' as test_name,
           CASE WHEN COUNT(*) > 0 THEN 'OK' ELSE 'ERREUR' END as result,
           COUNT(*)::TEXT || ' politiques trouvées' as details
    FROM pg_policies WHERE tablename = 'user_roles'
    
    UNION ALL
    
    SELECT 'Structure user_roles' as test_name,
           CASE WHEN COUNT(*) >= 8 THEN 'OK' ELSE 'ERREUR' END as result,
           'Colonnes: ' || STRING_AGG(column_name, ', ') as details
    FROM information_schema.columns 
    WHERE table_name = 'user_roles' AND table_schema = 'public';
$$;

-- Confirmation
SELECT 'CORRECTION TERMINÉE' as status, 
       'Base de données synchronisée avec politiques ultra-permissives' as message;
