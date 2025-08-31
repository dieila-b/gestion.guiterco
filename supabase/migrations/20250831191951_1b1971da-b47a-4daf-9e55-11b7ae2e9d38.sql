
-- 1. Mettre à jour l'orthographe de "Stock" en "Stocks" dans toutes les permissions
UPDATE public.permissions 
SET menu = 'Stocks' 
WHERE menu = 'Stock';

-- 2. Vérifier qu'il n'y a pas de doublons dans role_permissions
-- Supprimer les doublons potentiels qui causent l'erreur de contrainte unique
DELETE FROM public.role_permissions 
WHERE id IN (
  SELECT id FROM (
    SELECT id, 
           ROW_NUMBER() OVER (PARTITION BY role_id, permission_id ORDER BY id) as rn
    FROM public.role_permissions
  ) t
  WHERE t.rn > 1
);

-- 3. Vérifier la structure après correction
SELECT 
  menu,
  submenu, 
  COUNT(*) as nombre_permissions
FROM public.permissions 
WHERE menu = 'Stocks'
GROUP BY menu, submenu
ORDER BY submenu;

-- 4. Vérifier qu'il n'y a plus de doublons dans role_permissions
SELECT 
  role_id, 
  permission_id, 
  COUNT(*) as count
FROM public.role_permissions
GROUP BY role_id, permission_id
HAVING COUNT(*) > 1;
