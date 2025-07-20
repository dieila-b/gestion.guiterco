
-- CORRECTION COMPLÈTE DES COLONNES MANQUANTES ET STRUCTURE user_roles
-- ===================================================================

-- 1. Ajouter les colonnes manquantes à user_roles
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES auth.users(id);

-- 2. Mettre à jour les enregistrements existants qui n'ont pas de created_at
UPDATE public.user_roles 
SET created_at = now() 
WHERE created_at IS NULL;

-- 3. S'assurer que les colonnes ne sont pas nulles
ALTER TABLE public.user_roles ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE public.user_roles ALTER COLUMN updated_at SET NOT NULL;

-- 4. Corriger la structure complète de user_roles pour éviter les erreurs de cache
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

-- 5. Réactiver RLS sur user_roles avec politiques simplifiées
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on user_roles for authenticated users" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (true) 
WITH CHECK (true);

-- 6. Trigger pour updated_at sur user_roles
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

-- 7. Réinsérer un utilisateur admin de test pour le développement
INSERT INTO public.user_roles (user_id, role_id, is_active, assigned_by)
SELECT 
    'dev-user-123'::uuid,
    r.id,
    true,
    'dev-user-123'::uuid
FROM public.roles r 
WHERE r.name = 'Administrateur'
ON CONFLICT (user_id, role_id) DO UPDATE SET 
    is_active = true,
    updated_at = now();

-- 8. Recréer la vue des permissions utilisateurs avec la nouvelle structure
DROP VIEW IF EXISTS public.vue_permissions_utilisateurs;

CREATE OR REPLACE VIEW public.vue_permissions_utilisateurs AS
SELECT DISTINCT
    ui.user_id,
    p.id as permission_id,
    p.menu,
    p.submenu,
    p.action,
    p.description,
    rp.can_access
FROM public.utilisateurs_internes ui
JOIN public.user_roles ur ON ui.user_id = ur.user_id AND ur.is_active = true
JOIN public.roles r ON ur.role_id = r.id
JOIN public.role_permissions rp ON r.id = rp.role_id AND rp.can_access = true
JOIN public.permissions p ON rp.permission_id = p.id
WHERE ui.statut = 'actif';

-- 9. Fonction de diagnostic améliorée
CREATE OR REPLACE FUNCTION public.diagnostic_user_roles_system()
RETURNS TABLE (
    diagnostic_type TEXT,
    status TEXT,
    count_result INTEGER,
    message TEXT
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
    -- Vérifier la structure user_roles
    SELECT 'Structure user_roles' as diagnostic_type,
           '✅ OK' as status,
           COUNT(column_name)::INTEGER as count_result,
           'Colonnes présentes: ' || STRING_AGG(column_name, ', ') as message
    FROM information_schema.columns 
    WHERE table_name = 'user_roles' AND table_schema = 'public'
    
    UNION ALL
    
    -- Vérifier les utilisateurs avec rôles actifs
    SELECT 'Utilisateurs avec rôles' as diagnostic_type,
           CASE WHEN COUNT(*) > 0 THEN '✅ OK' ELSE '⚠️ AUCUN' END as status,
           COUNT(*)::INTEGER as count_result,
           'Utilisateurs ayant un rôle actif' as message
    FROM public.user_roles ur
    WHERE ur.is_active = true
    
    UNION ALL
    
    -- Vérifier les permissions dans la vue
    SELECT 'Permissions vue utilisateurs' as diagnostic_type,
           CASE WHEN COUNT(*) > 0 THEN '✅ OK' ELSE '❌ VIDE' END as status,
           COUNT(*)::INTEGER as count_result,
           'Entrées dans vue_permissions_utilisateurs' as message
    FROM public.vue_permissions_utilisateurs
    
    UNION ALL
    
    -- Vérifier les utilisateurs internes actifs
    SELECT 'Utilisateurs internes actifs' as diagnostic_type,
           CASE WHEN COUNT(*) > 0 THEN '✅ OK' ELSE '⚠️ AUCUN' END as status,
           COUNT(*)::INTEGER as count_result,
           'Utilisateurs internes avec statut actif' as message
    FROM public.utilisateurs_internes ui
    WHERE ui.statut = 'actif';
$$;

-- 10. Activer la réplication temps réel
ALTER TABLE public.user_roles REPLICA IDENTITY FULL;

-- Ajouter à la publication realtime
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;
    EXCEPTION WHEN duplicate_object THEN
        -- Table déjà dans la publication
        NULL;
    END;
END $$;

-- Invalider le cache PostgREST
NOTIFY pgrst, 'reload schema';
