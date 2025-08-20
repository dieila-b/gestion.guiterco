
-- Update the get_permissions_structure function to include menu description
CREATE OR REPLACE FUNCTION get_permissions_structure()
RETURNS TABLE (
  menu_id uuid,
  menu_nom text,
  menu_icone text,
  menu_ordre integer,
  menu_description text,
  sous_menu_id uuid,
  sous_menu_nom text,
  sous_menu_description text,
  sous_menu_ordre integer,
  permission_id uuid,
  action text,
  permission_description text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id as menu_id,
    m.nom as menu_nom,
    m.icone as menu_icone,
    m.ordre as menu_ordre,
    m.description as menu_description,
    sm.id as sous_menu_id,
    sm.nom as sous_menu_nom,
    sm.description as sous_menu_description,
    sm.ordre as sous_menu_ordre,
    p.id as permission_id,
    p.action,
    p.description as permission_description
  FROM public.menus m
  LEFT JOIN public.sous_menus sm ON m.id = sm.menu_id
  LEFT JOIN public.permissions p ON (
    (sm.id IS NOT NULL AND p.sous_menu_id = sm.id) OR
    (sm.id IS NULL AND p.menu_id = m.id AND p.sous_menu_id IS NULL)
  )
  ORDER BY m.ordre, sm.ordre NULLS FIRST, p.action;
END;
$$ LANGUAGE plpgsql;
