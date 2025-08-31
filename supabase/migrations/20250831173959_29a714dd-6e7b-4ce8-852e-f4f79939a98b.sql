
-- 1. Diagnostiquer l'état actuel de l'utilisateur
SELECT 'Diagnostic utilisateur auth' as etape, 
       au.id as auth_user_id, 
       au.email as auth_email,
       au.created_at as auth_created
FROM auth.users au 
WHERE au.email = 'danta93@gmail.com';

-- 2. Vérifier l'utilisateur interne existant
SELECT 'Diagnostic utilisateur interne' as etape,
       ui.id,
       ui.user_id,
       ui.email,
       ui.statut,
       ui.role_id,
       r.name as role_name
FROM public.utilisateurs_internes ui
LEFT JOIN public.roles r ON ui.role_id = r.id
WHERE ui.email = 'danta93@gmail.com';

-- 3. Nettoyer complètement et recréer l'utilisateur interne
DELETE FROM public.utilisateurs_internes WHERE email = 'danta93@gmail.com';

-- 4. Recréer l'utilisateur interne avec les bonnes liaisons
INSERT INTO public.utilisateurs_internes (
  id,
  user_id,
  email,
  prenom,
  nom,
  matricule,
  statut,
  type_compte,
  role_id,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid() as id,
  au.id as user_id,
  au.email,
  'Alhassane' as prenom,
  'Diallo' as nom,
  'ADIA-01' as matricule,
  'actif' as statut,
  'interne' as type_compte,
  '550e8400-e29b-41d4-a716-446655440000' as role_id,
  now() as created_at,
  now() as updated_at
FROM auth.users au
WHERE au.email = 'danta93@gmail.com';

-- 5. Vérifier que toutes les permissions de base existent
INSERT INTO public.permissions (menu, submenu, action, description) VALUES
('Dashboard', NULL, 'read', 'Accès au tableau de bord'),
('Catalogue', NULL, 'read', 'Consultation du catalogue'),
('Catalogue', NULL, 'write', 'Modification du catalogue'),
('Stock', 'Entrepôts', 'read', 'Consultation stock entrepôts'),
('Stock', 'Entrepôts', 'write', 'Modification stock entrepôts'),
('Stock', 'PDV', 'read', 'Consultation stock PDV'),
('Stock', 'PDV', 'write', 'Modification stock PDV'),
('Ventes', 'Factures', 'read', 'Consultation factures'),
('Ventes', 'Factures', 'write', 'Création/modification factures'),
('Ventes', 'Précommandes', 'read', 'Consultation précommandes'),
('Ventes', 'Précommandes', 'write', 'Création/modification précommandes'),
('Achats', 'Bons de commande', 'read', 'Consultation bons de commande'),
('Achats', 'Bons de commande', 'write', 'Création/modification bons de commande'),
('Clients', NULL, 'read', 'Consultation clients'),
('Clients', NULL, 'write', 'Modification clients'),
('Caisse', NULL, 'read', 'Accès caisse'),
('Caisse', NULL, 'write', 'Utilisation caisse'),
('Rapports', NULL, 'read', 'Consultation rapports'),
('Paramètres', 'Rôles et permissions', 'read', 'Consultation rôles et permissions'),
('Paramètres', 'Rôles et permissions', 'write', 'Modification rôles et permissions')
ON CONFLICT (menu, COALESCE(submenu, ''), action) DO NOTHING;

-- 6. Assigner TOUTES les permissions au rôle admin
INSERT INTO public.role_permissions (role_id, permission_id, can_access)
SELECT 
  '550e8400-e29b-41d4-a716-446655440000' as role_id,
  p.id as permission_id,
  true as can_access
FROM public.permissions p
WHERE NOT EXISTS (
  SELECT 1 FROM public.role_permissions rp 
  WHERE rp.role_id = '550e8400-e29b-41d4-a716-446655440000' 
  AND rp.permission_id = p.id
);

-- 7. Recréer la vue des utilisateurs avec rôles de manière plus robuste
DROP VIEW IF EXISTS public.vue_utilisateurs_avec_roles;
CREATE VIEW public.vue_utilisateurs_avec_roles AS
SELECT 
  ui.id,
  ui.user_id,
  ui.email,
  ui.prenom,
  ui.nom,
  ui.matricule,
  ui.statut,
  ui.type_compte,
  ui.photo_url,
  ui.telephone,
  ui.date_embauche,
  ui.department,
  ui.created_at,
  ui.updated_at,
  ui.role_id,
  r.name as role_name,
  r.description as role_description
FROM public.utilisateurs_internes ui
LEFT JOIN public.roles r ON ui.role_id = r.id;

-- 8. Recréer la vue des permissions utilisateurs
DROP VIEW IF EXISTS public.vue_permissions_utilisateurs;
CREATE VIEW public.vue_permissions_utilisateurs AS
SELECT DISTINCT
  ui.user_id,
  ui.id as utilisateur_interne_id,
  ui.email,
  ui.prenom,
  ui.nom,
  ui.statut,
  r.id as role_id,
  r.name as role_name,
  p.id as permission_id,
  p.menu,
  p.submenu,
  p.action,
  p.description as permission_description,
  COALESCE(rp.can_access, false) as can_access
FROM public.utilisateurs_internes ui
JOIN public.roles r ON ui.role_id = r.id
JOIN public.role_permissions rp ON r.id = rp.role_id AND rp.can_access = true
JOIN public.permissions p ON rp.permission_id = p.id
WHERE ui.statut = 'actif'
  AND ui.user_id IS NOT NULL;

-- 9. Fonction pour vérifier la liaison utilisateur
CREATE OR REPLACE FUNCTION public.check_user_internal_link(user_email text)
RETURNS TABLE(
  auth_user_exists boolean,
  auth_user_id uuid,
  internal_user_exists boolean,
  internal_user_id uuid,
  internal_user_active boolean,
  role_assigned boolean,
  role_name text,
  permissions_count bigint
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  auth_id uuid;
  internal_id uuid;
  role_nm text;
BEGIN
  -- Récupérer l'ID auth
  SELECT au.id INTO auth_id FROM auth.users au WHERE au.email = user_email;
  
  -- Récupérer les infos utilisateur interne
  SELECT ui.id, r.name INTO internal_id, role_nm 
  FROM public.utilisateurs_internes ui
  LEFT JOIN public.roles r ON ui.role_id = r.id
  WHERE ui.email = user_email AND ui.statut = 'actif';
  
  RETURN QUERY
  SELECT 
    (auth_id IS NOT NULL) as auth_user_exists,
    auth_id as auth_user_id,
    (internal_id IS NOT NULL) as internal_user_exists,
    internal_id as internal_user_id,
    (internal_id IS NOT NULL) as internal_user_active,
    (role_nm IS NOT NULL) as role_assigned,
    COALESCE(role_nm, 'NONE') as role_name,
    COALESCE((
      SELECT COUNT(*) 
      FROM public.vue_permissions_utilisateurs vpu 
      WHERE vpu.email = user_email AND vpu.can_access = true
    ), 0) as permissions_count;
END;
$$;

-- 10. Vérification finale
SELECT * FROM public.check_user_internal_link('danta93@gmail.com');
