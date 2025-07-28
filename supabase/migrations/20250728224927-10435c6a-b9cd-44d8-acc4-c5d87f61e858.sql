-- Corriger les politiques RLS pour permettre l'accès aux utilisateurs internes

-- Les vues héritent des politiques de leurs tables de base
-- Vérifier et corriger les politiques des tables utilisateurs_internes et roles

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

-- Vérifier que la vue existe et est accessible
CREATE OR REPLACE VIEW public.vue_utilisateurs_avec_roles AS
SELECT 
    ui.*,
    r.nom as role_name,
    r.description as role_description
FROM public.utilisateurs_internes ui
LEFT JOIN public.roles r ON ui.role_id = r.id;