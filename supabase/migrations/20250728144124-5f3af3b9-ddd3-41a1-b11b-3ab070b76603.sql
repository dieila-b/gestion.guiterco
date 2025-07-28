-- Add unique constraint for roles name
ALTER TABLE public.roles ADD CONSTRAINT roles_name_unique UNIQUE (name);

-- Add unique constraint for permissions combination
ALTER TABLE public.permissions ADD CONSTRAINT permissions_unique UNIQUE (menu, COALESCE(submenu, ''), action);