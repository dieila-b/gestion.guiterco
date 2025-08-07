
CREATE OR REPLACE FUNCTION public.get_users_by_role(role_uuid uuid)
RETURNS TABLE(
  user_id uuid,
  email text,
  prenom text,
  nom text,
  statut text,
  matricule text
)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    ui.user_id,
    ui.email,
    ui.prenom,
    ui.nom,
    ui.statut,
    ui.matricule
  FROM public.utilisateurs_internes ui
  WHERE ui.role_id = role_uuid
  AND ui.statut = 'actif'
  ORDER BY ui.nom, ui.prenom;
$$;
