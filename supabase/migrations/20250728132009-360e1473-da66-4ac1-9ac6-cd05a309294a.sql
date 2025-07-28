-- Créer d'abord la contrainte unique nécessaire pour permissions
ALTER TABLE public.permissions 
ADD CONSTRAINT permissions_menu_submenu_action_unique 
UNIQUE (menu, submenu, action);

-- Ensuite insérer les permissions de base
INSERT INTO public.permissions (menu, submenu, action, description) VALUES
('Paramètres', 'Rôles et permissions', 'read', 'Voir les rôles et permissions'),
('Paramètres', 'Rôles et permissions', 'write', 'Modifier les rôles et permissions'),
('Paramètres', 'Rôles et permissions', 'delete', 'Supprimer les rôles et permissions')
ON CONFLICT (menu, submenu, action) DO NOTHING;