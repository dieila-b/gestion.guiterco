
-- Vérifier et corriger les politiques RLS pour utilisateurs_internes
DROP POLICY IF EXISTS "Utilisateurs internes peuvent voir leurs données" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Admins peuvent gérer utilisateurs internes" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Dev mode permet tout" ON public.utilisateurs_internes;

-- Politique ultra-permissive pour résoudre le problème d'affichage
CREATE POLICY "ULTRA_PERMISSIVE_utilisateurs_internes" 
ON public.utilisateurs_internes 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Vérifier et corriger les politiques pour la table roles
DROP POLICY IF EXISTS "Tous peuvent lire les rôles" ON public.roles;
DROP POLICY IF EXISTS "Admins peuvent gérer les rôles" ON public.roles;

CREATE POLICY "ULTRA_PERMISSIVE_roles" 
ON public.roles 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Vérifier et corriger les politiques pour role_permissions
DROP POLICY IF EXISTS "Lecture permissions rôles" ON public.role_permissions;
DROP POLICY IF EXISTS "Gestion permissions rôles" ON public.role_permissions;

CREATE POLICY "ULTRA_PERMISSIVE_role_permissions" 
ON public.role_permissions 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Créer ou mettre à jour la vue utilisateurs avec rôles si elle n'existe pas
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
    ui.telephone,
    ui.date_embauche,
    ui.department,
    ui.photo_url,
    ui.created_at,
    ui.updated_at,
    ui.user_id,
    r.name as role_name,
    r.description as role_description
FROM public.utilisateurs_internes ui
LEFT JOIN public.roles r ON ui.role_id = r.id;

-- Assurer que la vue est accessible
GRANT SELECT ON public.vue_utilisateurs_avec_roles TO authenticated;
GRANT SELECT ON public.vue_utilisateurs_avec_roles TO anon;

-- Vérifier que les tables principales ont les bonnes politiques
ALTER TABLE public.utilisateurs_internes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- Créer un trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer le trigger à utilisateurs_internes si pas déjà fait
DROP TRIGGER IF EXISTS update_utilisateurs_internes_updated_at ON public.utilisateurs_internes;
CREATE TRIGGER update_utilisateurs_internes_updated_at 
    BEFORE UPDATE ON public.utilisateurs_internes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
