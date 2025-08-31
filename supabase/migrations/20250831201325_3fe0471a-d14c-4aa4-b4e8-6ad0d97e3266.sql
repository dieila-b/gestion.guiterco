-- Vérifier et corriger la table role_permissions
-- D'abord, créer la contrainte unique si elle n'existe pas
ALTER TABLE public.role_permissions 
DROP CONSTRAINT IF EXISTS role_permissions_role_id_permission_id_key;

ALTER TABLE public.role_permissions 
ADD CONSTRAINT role_permissions_role_id_permission_id_key 
UNIQUE (role_id, permission_id);

-- Nettoyer les doublons potentiels d'abord
DELETE FROM public.role_permissions 
WHERE id NOT IN (
    SELECT DISTINCT ON (role_id, permission_id) id 
    FROM public.role_permissions 
    ORDER BY role_id, permission_id, created_at DESC
);

-- S'assurer que la table a les bonnes colonnes
ALTER TABLE public.role_permissions 
ALTER COLUMN role_id SET NOT NULL,
ALTER COLUMN permission_id SET NOT NULL,
ALTER COLUMN can_access SET NOT NULL;