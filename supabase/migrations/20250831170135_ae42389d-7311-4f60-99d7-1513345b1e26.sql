
-- 1. S'assurer que la table roles existe avec la bonne structure
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL UNIQUE,
  nom VARCHAR, -- Compatibilité avec l'ancien format
  description TEXT,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. S'assurer que utilisateurs_internes a la bonne liaison avec roles
ALTER TABLE public.utilisateurs_internes 
ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES public.roles(id);

-- 3. Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_utilisateurs_internes_role_id ON public.utilisateurs_internes(role_id);
CREATE INDEX IF NOT EXISTS idx_utilisateurs_internes_user_id ON public.utilisateurs_internes(user_id);
CREATE INDEX IF NOT EXISTS idx_utilisateurs_internes_email ON public.utilisateurs_internes(email);

-- 4. S'assurer que les permissions ont la bonne structure
ALTER TABLE public.permissions 
ADD COLUMN IF NOT EXISTS menu VARCHAR NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS submenu VARCHAR,
ADD COLUMN IF NOT EXISTS action VARCHAR NOT NULL DEFAULT 'read';

-- 5. S'assurer que role_permissions lie correctement roles et permissions
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  can_access BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role_id, permission_id)
);

-- 6. Créer des rôles par défaut si ils n'existent pas
INSERT INTO public.roles (name, nom, description, is_system) 
VALUES 
  ('admin', 'Administrateur', 'Accès complet au système', true),
  ('manager', 'Gestionnaire', 'Accès de gestion', false),
  ('employee', 'Employé', 'Accès employé standard', false)
ON CONFLICT (name) DO NOTHING;

-- 7. Créer les permissions de base si elles n'existent pas
INSERT INTO public.permissions (menu, submenu, action, description) VALUES
  ('Dashboard', NULL, 'read', 'Accès au tableau de bord'),
  ('Catalogue', NULL, 'read', 'Lecture du catalogue'),
  ('Catalogue', NULL, 'write', 'Écriture dans le catalogue'),
  ('Stock', 'Entrepôts', 'read', 'Lecture des entrepôts'),
  ('Stock', 'Entrepôts', 'write', 'Écriture dans les entrepôts'),
  ('Stock', 'PDV', 'read', 'Lecture des points de vente'),
  ('Stock', 'PDV', 'write', 'Écriture dans les points de vente'),
  ('Ventes', 'Factures', 'read', 'Lecture des factures'),
  ('Ventes', 'Factures', 'write', 'Écriture des factures'),
  ('Ventes', 'Précommandes', 'read', 'Lecture des précommandes'),
  ('Ventes', 'Précommandes', 'write', 'Écriture des précommandes'),
  ('Achats', 'Bons de commande', 'read', 'Lecture des bons de commande'),
  ('Achats', 'Bons de commande', 'write', 'Écriture des bons de commande'),
  ('Clients', NULL, 'read', 'Lecture des clients'),
  ('Clients', NULL, 'write', 'Écriture des clients'),
  ('Caisse', NULL, 'read', 'Accès à la caisse en lecture'),
  ('Caisse', NULL, 'write', 'Accès à la caisse en écriture'),
  ('Rapports', NULL, 'read', 'Accès aux rapports'),
  ('Paramètres', 'Rôles et permissions', 'read', 'Lecture des rôles et permissions'),
  ('Paramètres', 'Rôles et permissions', 'write', 'Écriture des rôles et permissions'),
  ('Paramètres', 'Utilisateurs', 'read', 'Lecture des utilisateurs'),
  ('Paramètres', 'Utilisateurs', 'write', 'Écriture des utilisateurs'),
  ('Paramètres', 'Zone Géographique', 'read', 'Lecture des zones géographiques'),
  ('Paramètres', 'Fournisseurs', 'read', 'Lecture des fournisseurs'),
  ('Paramètres', 'Points de vente', 'read', 'Lecture des points de vente'),
  ('Paramètres', 'Permissions', 'read', 'Lecture des permissions')
ON CONFLICT (menu, COALESCE(submenu, ''), action) DO NOTHING;

-- 8. Donner toutes les permissions au rôle admin
INSERT INTO public.role_permissions (role_id, permission_id, can_access)
SELECT 
  r.id as role_id,
  p.id as permission_id,
  true as can_access
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'admin'
ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;

-- 9. Créer ou recréer la vue pour les permissions utilisateurs
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
  rp.can_access
FROM public.utilisateurs_internes ui
JOIN public.roles r ON ui.role_id = r.id
JOIN public.role_permissions rp ON r.id = rp.role_id
JOIN public.permissions p ON rp.permission_id = p.id
WHERE ui.statut = 'actif'
  AND rp.can_access = true;

-- 10. Mettre à jour les utilisateurs existants pour avoir un rôle (admin par défaut)
UPDATE public.utilisateurs_internes 
SET role_id = (SELECT id FROM public.roles WHERE name = 'admin' LIMIT 1)
WHERE role_id IS NULL AND statut = 'actif';

-- 11. S'assurer que l'utilisateur danta93@gmail.com existe et a le bon rôle
INSERT INTO public.utilisateurs_internes (
  id, user_id, email, prenom, nom, statut, type_compte, role_id
) VALUES (
  'ab696bdf-289f-41f6-8e85-10f09f565e4b',
  'ab696bdf-289f-41f6-8e85-10f09f565e4b',
  'danta93@gmail.com',
  'Admin',
  'User',
  'actif',
  'interne',
  (SELECT id FROM public.roles WHERE name = 'admin' LIMIT 1)
) ON CONFLICT (email) DO UPDATE SET
  role_id = (SELECT id FROM public.roles WHERE name = 'admin' LIMIT 1),
  statut = 'actif',
  user_id = 'ab696bdf-289f-41f6-8e85-10f09f565e4b';
