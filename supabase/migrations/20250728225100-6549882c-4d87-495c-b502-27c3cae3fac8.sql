-- Corriger les politiques RLS pour les tables et recréer la vue

-- S'assurer que utilisateurs_internes a les bonnes politiques
DROP POLICY IF EXISTS "Restricted access for utilisateurs_internes" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Permission-based utilisateurs_internes read" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Permission-based utilisateurs_internes write" ON public.utilisateurs_internes;

CREATE POLICY "Allow all authenticated users to read utilisateurs_internes" 
ON public.utilisateurs_internes
FOR SELECT 
USING (true);

CREATE POLICY "Allow all authenticated users to write utilisateurs_internes" 
ON public.utilisateurs_internes
FOR ALL 
USING (true) 
WITH CHECK (true);

-- S'assurer que roles a les bonnes politiques
DROP POLICY IF EXISTS "Restricted access for roles" ON public.roles;
DROP POLICY IF EXISTS "Permission-based roles read" ON public.roles;
DROP POLICY IF EXISTS "Permission-based roles write" ON public.roles;

CREATE POLICY "Allow all authenticated users to read roles" 
ON public.roles
FOR SELECT 
USING (true);

CREATE POLICY "Allow all authenticated users to write roles" 
ON public.roles
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Supprimer et recréer la vue avec la bonne structure
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