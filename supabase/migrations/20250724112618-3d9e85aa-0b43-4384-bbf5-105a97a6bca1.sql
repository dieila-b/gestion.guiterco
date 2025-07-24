-- Correction des policies RLS pour les utilisateurs internes (avec correction des types)

-- D'abord activer RLS sur toutes les tables qui n'en ont pas
ALTER TABLE IF EXISTS public.utilisateurs_internes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.roles ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies problématiques
DROP POLICY IF EXISTS "bypass_rls_for_authenticated_users" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Utilisateurs authentifiés peuvent accéder aux utilisateurs internes" ON public.utilisateurs_internes;

-- Créer des policies RLS appropriées pour utilisateurs_internes
CREATE POLICY "Utilisateurs peuvent lire leur propre profil"
ON public.utilisateurs_internes
FOR SELECT
USING (auth.uid()::text = user_id);

CREATE POLICY "Utilisateurs internes autorisés peuvent créer des comptes"
ON public.utilisateurs_internes
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.utilisateurs_internes ui
    JOIN public.user_roles ur ON ui.user_id = ur.user_id
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ui.user_id = auth.uid()::text
    AND r.name = 'Administrateur'
    AND ur.is_active = true
    AND ui.statut = 'actif'
  )
);

CREATE POLICY "Administrateurs peuvent modifier tous les utilisateurs"
ON public.utilisateurs_internes
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.utilisateurs_internes ui
    JOIN public.user_roles ur ON ui.user_id = ur.user_id
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ui.user_id = auth.uid()::text
    AND r.name = 'Administrateur'
    AND ur.is_active = true
    AND ui.statut = 'actif'
  )
);

-- Policies pour user_roles
DROP POLICY IF EXISTS "bypass_rls_for_authenticated_users" ON public.user_roles;

CREATE POLICY "Utilisateurs peuvent lire leurs propres rôles"
ON public.user_roles
FOR SELECT
USING (auth.uid()::text = user_id);

CREATE POLICY "Administrateurs peuvent gérer tous les rôles"
ON public.user_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.utilisateurs_internes ui
    JOIN public.user_roles ur ON ui.user_id = ur.user_id
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ui.user_id = auth.uid()::text
    AND r.name = 'Administrateur'
    AND ur.is_active = true
    AND ui.statut = 'actif'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.utilisateurs_internes ui
    JOIN public.user_roles ur ON ui.user_id = ur.user_id
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ui.user_id = auth.uid()::text
    AND r.name = 'Administrateur'
    AND ur.is_active = true
    AND ui.statut = 'actif'
  )
);

-- Policies pour roles (lecture publique pour les utilisateurs authentifiés)
CREATE POLICY "Utilisateurs authentifiés peuvent lire les rôles"
ON public.roles
FOR SELECT
USING (auth.uid() IS NOT NULL);