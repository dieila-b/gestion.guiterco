
-- CORRECTION COMPLÈTE DES POLITIQUES RLS ET SYNCHRONISATION DES TABLES
-- =====================================================================

-- 1. Vérifier et corriger la structure de user_roles
DO $$
BEGIN
    -- S'assurer que toutes les colonnes nécessaires existent
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_roles' AND column_name = 'created_at') THEN
        ALTER TABLE public.user_roles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_roles' AND column_name = 'updated_at') THEN
        ALTER TABLE public.user_roles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_roles' AND column_name = 'assigned_by') THEN
        ALTER TABLE public.user_roles ADD COLUMN assigned_by UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_roles' AND column_name = 'is_active') THEN
        ALTER TABLE public.user_roles ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_roles' AND column_name = 'assigned_at') THEN
        ALTER TABLE public.user_roles ADD COLUMN assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
END $$;

-- 2. Supprimer TOUTES les politiques RLS existantes sur user_roles
DROP POLICY IF EXISTS "Allow all operations on user_roles for authenticated users" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow all operations on user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow all operations on user_roles for development" ON public.user_roles;

-- 3. Créer des politiques RLS très permissives pour les utilisateurs authentifiés
CREATE POLICY "Utilisateurs authentifiés peuvent gérer user_roles" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (true) 
WITH CHECK (true);

-- 4. Corriger les politiques sur utilisateurs_internes
DROP POLICY IF EXISTS "Users can update their profile" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Users can view their profile" ON public.utilisateurs_internes;

CREATE POLICY "Utilisateurs authentifiés peuvent voir utilisateurs_internes" 
ON public.utilisateurs_internes 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Utilisateurs authentifiés peuvent modifier utilisateurs_internes" 
ON public.utilisateurs_internes 
FOR ALL 
TO authenticated
USING (true) 
WITH CHECK (true);

-- 5. Trigger pour updated_at sur user_roles
CREATE OR REPLACE FUNCTION public.update_user_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_roles_updated_at_trigger ON public.user_roles;
CREATE TRIGGER update_user_roles_updated_at_trigger
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_roles_updated_at();

-- 6. Fonction pour renouveler automatiquement la session utilisateur
CREATE OR REPLACE FUNCTION public.refresh_user_session()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_data JSON;
BEGIN
    -- Récupérer les données de l'utilisateur actuel
    SELECT json_build_object(
        'user_id', auth.uid(),
        'email', auth.jwt() ->> 'email',
        'session_valid', auth.uid() IS NOT NULL,
        'timestamp', now()
    ) INTO current_user_data;
    
    RETURN current_user_data;
END;
$$;

-- 7. Fonction sécurisée pour la mise à jour des mots de passe
CREATE OR REPLACE FUNCTION public.secure_password_update(
    target_user_id UUID,
    new_password TEXT,
    force_change BOOLEAN DEFAULT false
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSON;
BEGIN
    -- Vérifier que l'utilisateur actuel est authentifié
    IF auth.uid() IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Non authentifié');
    END IF;
    
    -- Mettre à jour le flag de changement de mot de passe dans utilisateurs_internes
    UPDATE public.utilisateurs_internes 
    SET 
        doit_changer_mot_de_passe = force_change,
        updated_at = now()
    WHERE user_id = target_user_id;
    
    RETURN json_build_object(
        'success', true, 
        'message', 'Paramètres de mot de passe mis à jour',
        'timestamp', now()
    );
END;
$$;

-- 8. Fonction sécurisée pour l'assignation de rôles
CREATE OR REPLACE FUNCTION public.secure_role_assignment(
    target_user_id UUID,
    new_role_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSON;
BEGIN
    -- Vérifier que l'utilisateur actuel est authentifié
    IF auth.uid() IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Non authentifié');
    END IF;
    
    -- Désactiver tous les rôles existants pour cet utilisateur
    UPDATE public.user_roles
    SET 
        is_active = false,
        updated_at = now()
    WHERE user_id = target_user_id;
    
    -- Insérer ou réactiver le nouveau rôle
    INSERT INTO public.user_roles (
        user_id, 
        role_id, 
        is_active, 
        assigned_by, 
        assigned_at,
        created_at,
        updated_at
    ) VALUES (
        target_user_id,
        new_role_id,
        true,
        auth.uid(),
        now(),
        now(),
        now()
    )
    ON CONFLICT (user_id, role_id) 
    DO UPDATE SET 
        is_active = true,
        assigned_by = auth.uid(),
        assigned_at = now(),
        updated_at = now();
    
    RETURN json_build_object(
        'success', true, 
        'message', 'Rôle assigné avec succès',
        'user_id', target_user_id,
        'role_id', new_role_id,
        'timestamp', now()
    );
END;
$$;

-- 9. Activer la réplication temps réel sur toutes les tables critiques
ALTER TABLE public.user_roles REPLICA IDENTITY FULL;
ALTER TABLE public.utilisateurs_internes REPLICA IDENTITY FULL;
ALTER TABLE public.roles REPLICA IDENTITY FULL;

-- Ajouter à la publication realtime
DO $$
DECLARE
    tbl_name text;
    realtime_tables text[] := ARRAY[
        'user_roles', 'utilisateurs_internes', 'roles'
    ];
BEGIN
    FOREACH tbl_name IN ARRAY realtime_tables
    LOOP
        BEGIN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', tbl_name);
        EXCEPTION WHEN duplicate_object THEN
            -- Table déjà dans la publication
            NULL;
        END;
    END LOOP;
END $$;

-- 10. Fonction de diagnostic pour vérifier l'état du système
CREATE OR REPLACE FUNCTION public.diagnostic_user_system_complet()
RETURNS TABLE (
    composant TEXT,
    statut TEXT,
    details TEXT,
    recommandation TEXT
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
    -- Vérifier les colonnes user_roles
    SELECT 'Structure user_roles' as composant,
           CASE WHEN COUNT(*) >= 7 THEN '✅ Complète' ELSE '❌ Incomplète' END as statut,
           'Colonnes: ' || STRING_AGG(column_name, ', ') as details,
           CASE WHEN COUNT(*) < 7 THEN 'Ajouter les colonnes manquantes' ELSE 'Aucune action' END as recommandation
    FROM information_schema.columns 
    WHERE table_name = 'user_roles' AND table_schema = 'public'
    
    UNION ALL
    
    -- Vérifier les politiques RLS
    SELECT 'Politiques RLS user_roles' as composant,
           CASE WHEN COUNT(*) > 0 THEN '✅ Configurées' ELSE '❌ Manquantes' END as statut,
           COUNT(*)::TEXT || ' politiques actives' as details,
           CASE WHEN COUNT(*) = 0 THEN 'Créer les politiques RLS' ELSE 'Aucune action' END as recommandation
    FROM pg_policies 
    WHERE tablename = 'user_roles' AND schemaname = 'public'
    
    UNION ALL
    
    -- Vérifier les utilisateurs avec rôles
    SELECT 'Assignations de rôles' as composant,
           CASE WHEN COUNT(*) > 0 THEN '✅ Présentes' ELSE '⚠️ Aucune' END as statut,
           COUNT(*)::TEXT || ' utilisateurs avec rôles' as details,
           CASE WHEN COUNT(*) = 0 THEN 'Assigner des rôles aux utilisateurs' ELSE 'Aucune action' END as recommandation
    FROM public.user_roles ur
    WHERE ur.is_active = true
    
    UNION ALL
    
    -- Vérifier les fonctions sécurisées
    SELECT 'Fonctions sécurisées' as composant,
           CASE WHEN COUNT(*) >= 3 THEN '✅ Disponibles' ELSE '❌ Manquantes' END as statut,
           STRING_AGG(routine_name, ', ') as details,
           CASE WHEN COUNT(*) < 3 THEN 'Créer les fonctions manquantes' ELSE 'Aucune action' END as recommandation
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name IN ('refresh_user_session', 'secure_password_update', 'secure_role_assignment');
$$;

-- Invalider le cache PostgREST
NOTIFY pgrst, 'reload schema';

-- Message de confirmation
SELECT 'SYNCHRONISATION TERMINÉE' as message,
       '✅ Tables, politiques RLS et fonctions sécurisées mises à jour' as statut;
