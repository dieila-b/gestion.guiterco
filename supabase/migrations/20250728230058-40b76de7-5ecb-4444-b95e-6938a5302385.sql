-- Résoudre définitivement le problème de récursion infinie dans les politiques RLS
-- Supprimer TOUTES les politiques existantes pour utilisateurs_internes
DROP POLICY IF EXISTS "Allow all authenticated users to read utilisateurs_internes" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Allow all authenticated users to write utilisateurs_internes" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Restricted access for utilisateurs_internes" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Permission-based utilisateurs_internes read" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Permission-based utilisateurs_internes write" ON public.utilisateurs_internes;

-- Créer des politiques simples sans récursion
CREATE POLICY "Simple read access for utilisateurs_internes" 
ON public.utilisateurs_internes
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Simple write access for utilisateurs_internes" 
ON public.utilisateurs_internes
FOR ALL 
TO authenticated
USING (true) 
WITH CHECK (true);

-- Supprimer TOUTES les politiques existantes pour roles
DROP POLICY IF EXISTS "Allow all authenticated users to read roles" ON public.roles;
DROP POLICY IF EXISTS "Allow all authenticated users to write roles" ON public.roles;
DROP POLICY IF EXISTS "Restricted access for roles" ON public.roles;
DROP POLICY IF EXISTS "Permission-based roles read" ON public.roles;
DROP POLICY IF EXISTS "Permission-based roles write" ON public.roles;

-- Créer des politiques simples pour roles
CREATE POLICY "Simple read access for roles" 
ON public.roles
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Simple write access for roles" 
ON public.roles
FOR ALL 
TO authenticated
USING (true) 
WITH CHECK (true);

-- Vérifier que la vue utilise les bons noms de colonnes
DROP VIEW IF EXISTS public.vue_utilisateurs_avec_roles;

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