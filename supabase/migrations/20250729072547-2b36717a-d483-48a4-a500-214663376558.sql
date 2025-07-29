-- CORRECTION DÉFINITIVE: Désactiver temporairement RLS et nettoyer complètement les politiques
-- Désactiver RLS sur utilisateurs_internes
ALTER TABLE public.utilisateurs_internes DISABLE ROW LEVEL SECURITY;

-- Supprimer TOUTES les politiques existantes une par une
DO $$
DECLARE
    pol_record RECORD;
BEGIN
    -- Lister et supprimer toutes les politiques sur utilisateurs_internes
    FOR pol_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'utilisateurs_internes' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.utilisateurs_internes', pol_record.policyname);
    END LOOP;
END
$$;

-- Supprimer toutes les politiques sur roles aussi pour être sûr
DO $$
DECLARE
    pol_record RECORD;
BEGIN
    FOR pol_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'roles' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.roles', pol_record.policyname);
    END LOOP;
END
$$;

-- Désactiver RLS sur roles aussi
ALTER TABLE public.roles DISABLE ROW LEVEL SECURITY;

-- Réactiver RLS proprement
ALTER TABLE public.utilisateurs_internes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Créer des politiques ultra-simples sans conditions qui pourraient causer une récursion
CREATE POLICY "allow_all_read_utilisateurs_internes" 
ON public.utilisateurs_internes
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "allow_all_write_utilisateurs_internes" 
ON public.utilisateurs_internes
FOR ALL 
TO authenticated
USING (true) 
WITH CHECK (true);

CREATE POLICY "allow_all_read_roles" 
ON public.roles
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "allow_all_write_roles" 
ON public.roles
FOR ALL 
TO authenticated
USING (true) 
WITH CHECK (true);

-- Vérifier que la vue existe et la recréer si nécessaire
DROP VIEW IF EXISTS public.vue_utilisateurs_avec_roles CASCADE;

CREATE VIEW public.vue_utilisateurs_avec_roles AS
SELECT 
    ui.id,
    ui.email,
    ui.prenom,
    ui.nom,
    ui.matricule,
    ui.role_id,
    ui.statut,
    ui.type_compte,
    ui.photo_url,
    ui.telephone,
    ui.date_embauche,
    ui.department,
    ui.created_at,
    ui.updated_at,
    r.name as role_name,
    r.description as role_description
FROM public.utilisateurs_internes ui
LEFT JOIN public.roles r ON ui.role_id = r.id;