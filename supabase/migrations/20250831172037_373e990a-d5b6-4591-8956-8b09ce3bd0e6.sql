
-- 1. Nettoyer et recréer la structure complète des utilisateurs internes
DELETE FROM public.utilisateurs_internes WHERE email = 'danta93@gmail.com';

-- 2. S'assurer que le rôle admin existe
INSERT INTO public.roles (id, name, nom, description, is_system) 
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'admin', 
  'Administrateur', 
  'Accès complet au système', 
  true
) ON CONFLICT (name) DO UPDATE SET 
  id = '550e8400-e29b-41d4-a716-446655440000',
  nom = 'Administrateur',
  description = 'Accès complet au système';

-- 3. Créer l'utilisateur interne avec le bon UUID et la bonne liaison
INSERT INTO public.utilisateurs_internes (
  id,
  user_id, 
  email, 
  prenom, 
  nom, 
  statut, 
  type_compte, 
  role_id,
  created_at,
  updated_at
) VALUES (
  'ab696bdf-289f-41f6-8e85-10f09f565e4b',  -- Même ID que l'auth user
  'ab696bdf-289f-41f6-8e85-10f09f565e4b',  -- user_id pointe vers auth.users
  'danta93@gmail.com',
  'Admin',
  'User',
  'actif',
  'interne',
  '550e8400-e29b-41d4-a716-446655440000',   -- role_id pointe vers le rôle admin
  now(),
  now()
);

-- 4. Vérifier que toutes les permissions existent pour admin
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

-- 5. Recréer la vue des permissions utilisateurs de manière plus robuste
DROP VIEW IF EXISTS public.vue_permissions_utilisateurs;
CREATE VIEW public.vue_permissions_utilisateurs AS
SELECT DISTINCT
  ui.user_id,
  ui.id as utilisateur_interne_id,
  ui.email,
  ui.prenom,
  ui.nom,
  r.id as role_id,
  r.name as role_name,
  p.id as permission_id,
  p.menu,
  p.submenu,
  p.action,
  p.description,
  COALESCE(rp.can_access, false) as can_access
FROM public.utilisateurs_internes ui
LEFT JOIN public.roles r ON ui.role_id = r.id
LEFT JOIN public.role_permissions rp ON r.id = rp.role_id
LEFT JOIN public.permissions p ON rp.permission_id = p.id
WHERE ui.statut = 'actif'
  AND ui.user_id IS NOT NULL;

-- 6. Créer une fonction pour diagnostiquer les problèmes d'utilisateurs
CREATE OR REPLACE FUNCTION public.debug_user_permissions(user_email text)
RETURNS TABLE(
  step text,
  result text,
  details text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  -- Étape 1: Vérifier l'utilisateur dans auth
  SELECT 
    'auth_user'::text as step,
    CASE WHEN EXISTS(SELECT 1 FROM auth.users WHERE email = user_email) 
         THEN 'EXISTS' ELSE 'NOT_FOUND' END as result,
    COALESCE((SELECT id::text FROM auth.users WHERE email = user_email LIMIT 1), 'N/A') as details
  
  UNION ALL
  
  -- Étape 2: Vérifier l'utilisateur interne
  SELECT 
    'internal_user'::text as step,
    CASE WHEN EXISTS(SELECT 1 FROM public.utilisateurs_internes WHERE email = user_email AND statut = 'actif') 
         THEN 'EXISTS' ELSE 'NOT_FOUND' END as result,
    COALESCE((SELECT role_id::text FROM public.utilisateurs_internes WHERE email = user_email LIMIT 1), 'N/A') as details
  
  UNION ALL
  
  -- Étape 3: Vérifier les permissions
  SELECT 
    'permissions_count'::text as step,
    COUNT(*)::text as result,
    'Total permissions for user' as details
  FROM public.vue_permissions_utilisateurs 
  WHERE email = user_email AND can_access = true;
END;
$$;

-- 7. Lancer le diagnostic pour l'utilisateur
SELECT * FROM public.debug_user_permissions('danta93@gmail.com');
