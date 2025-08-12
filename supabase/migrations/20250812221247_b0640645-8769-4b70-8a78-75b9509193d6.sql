
-- Créer la vue pour les utilisateurs internes avec LEFT JOIN
CREATE OR REPLACE VIEW public.vue_utilisateurs_avec_roles AS
SELECT
    ui.id,
    ui.user_id,
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
LEFT JOIN public.roles r ON r.id = ui.role_id;

-- Accorder les permissions sur la vue
GRANT SELECT ON public.vue_utilisateurs_avec_roles TO authenticated;

-- Créer une fonction RPC pour récupérer les utilisateurs internes
CREATE OR REPLACE FUNCTION public.get_internal_users_with_roles()
RETURNS SETOF public.vue_utilisateurs_avec_roles
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
    SELECT * FROM public.vue_utilisateurs_avec_roles
    ORDER BY created_at DESC;
$$;

-- Accorder les permissions sur la fonction
GRANT EXECUTE ON FUNCTION public.get_internal_users_with_roles() TO authenticated;

-- Vérifier et corriger les politiques RLS sur utilisateurs_internes
ALTER TABLE public.utilisateurs_internes ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques restrictives si elles existent
DROP POLICY IF EXISTS "STRICT_utilisateurs_internes_read" ON public.utilisateurs_internes;

-- Créer une politique permissive pour la lecture des utilisateurs internes
CREATE POLICY "Authenticated users can read internal users"
ON public.utilisateurs_internes
FOR SELECT
TO authenticated
USING (true);

-- Politique pour l'insertion (pour les utilisateurs ayant la permission)
CREATE POLICY "Users with permission can insert internal users"
ON public.utilisateurs_internes
FOR INSERT
TO authenticated
WITH CHECK (
    check_user_permission_strict('Paramètres'::text, 'Utilisateurs'::text, 'write'::text)
);

-- Politique pour la mise à jour
CREATE POLICY "Users with permission can update internal users"
ON public.utilisateurs_internes
FOR UPDATE
TO authenticated
USING (
    check_user_permission_strict('Paramètres'::text, 'Utilisateurs'::text, 'write'::text)
);

-- Politique pour la suppression
CREATE POLICY "Users with permission can delete internal users"
ON public.utilisateurs_internes
FOR DELETE
TO authenticated
USING (
    check_user_permission_strict('Paramètres'::text, 'Utilisateurs'::text, 'delete'::text)
);
