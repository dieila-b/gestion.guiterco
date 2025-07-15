-- Supprimer complètement le système de permissions
-- Supprimer d'abord les tables qui dépendent de la table permissions

-- Supprimer la table roles_permissions (table de liaison)
DROP TABLE IF EXISTS public.roles_permissions CASCADE;

-- Supprimer la table permissions
DROP TABLE IF EXISTS public.permissions CASCADE;

-- Supprimer la table types_permissions si elle existe
DROP TABLE IF EXISTS public.types_permissions CASCADE;

-- Supprimer la table modules_application
DROP TABLE IF EXISTS public.modules_application CASCADE;

-- Supprimer toutes les fonctions liées aux permissions
DROP FUNCTION IF EXISTS public.get_user_permissions(uuid);
DROP FUNCTION IF EXISTS public.has_permission(uuid, text, text);
DROP FUNCTION IF EXISTS public.check_permission(text, text);

-- Nettoyer les policies RLS qui pourraient référencer ces tables
-- Les policies existantes qui référencent des tables supprimées seront automatiquement nettoyées