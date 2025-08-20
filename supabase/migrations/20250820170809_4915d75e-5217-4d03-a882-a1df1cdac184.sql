-- Drop the existing function and recreate it correctly
DROP FUNCTION IF EXISTS public.get_user_permissions(uuid);

CREATE OR REPLACE FUNCTION public.get_user_permissions(user_uuid uuid)
RETURNS TABLE(
  menu text,
  submenu text,
  action text,
  can_access boolean
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    p.menu,
    p.submenu,
    p.action,
    COALESCE(rp.can_access, false) as can_access
  FROM public.permissions p
  LEFT JOIN public.role_permissions rp ON p.id = rp.permission_id
  LEFT JOIN public.roles r ON rp.role_id = r.id
  LEFT JOIN public.utilisateurs_internes ui ON r.id = ui.role_id
  WHERE ui.user_id = user_uuid
    AND ui.statut = 'actif'
    AND rp.can_access = true;
$$;