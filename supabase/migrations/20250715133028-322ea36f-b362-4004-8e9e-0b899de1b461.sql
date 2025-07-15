-- Modification de l'architecture existante pour le système de permissions

-- Ajouter la colonne is_system à la table roles existante si elle n'existe pas
ALTER TABLE public.roles ADD COLUMN IF NOT EXISTS is_system BOOLEAN NOT NULL DEFAULT false;

-- Vérifier que les colonnes nécessaires existent dans la table permissions
ALTER TABLE public.permissions ADD COLUMN IF NOT EXISTS menu VARCHAR(100);
ALTER TABLE public.permissions ADD COLUMN IF NOT EXISTS submenu VARCHAR(100);

-- Mettre à jour la table permissions pour utiliser le bon format
UPDATE public.permissions SET 
  menu = COALESCE(menu, 'Menu'),
  action = COALESCE(action, 'read')
WHERE menu IS NULL;

-- Insertion des rôles par défaut s'ils n'existent pas
INSERT INTO public.roles (name, description, is_system) VALUES
  ('Administrateur', 'Accès complet à toutes les fonctionnalités', true),
  ('Manager', 'Gestion des équipes et accès aux rapports', false),
  ('Vendeur', 'Accès aux ventes et gestion clients', false),
  ('Caissier', 'Accès aux transactions et encaissements', false)
ON CONFLICT (name) DO UPDATE SET 
  description = EXCLUDED.description,
  is_system = EXCLUDED.is_system;

-- Vider et réinsérer les permissions de base
DELETE FROM public.permissions WHERE menu IN ('Dashboard', 'Catalogue', 'Stock', 'Achats', 'Ventes', 'Clients', 'Paramètres');

INSERT INTO public.permissions (menu, submenu, action, description) VALUES
  ('Dashboard', NULL, 'read', 'Consultation du tableau de bord'),
  ('Catalogue', NULL, 'read', 'Consultation du catalogue'),
  ('Catalogue', NULL, 'write', 'Modification du catalogue'),
  ('Catalogue', NULL, 'delete', 'Suppression d''articles'),
  ('Stock', 'Entrepôts', 'read', 'Consultation des stocks entrepôts'),
  ('Stock', 'Entrepôts', 'write', 'Modification des stocks entrepôts'),
  ('Stock', 'PDV', 'read', 'Consultation des stocks PDV'),
  ('Stock', 'PDV', 'write', 'Modification des stocks PDV'),
  ('Achats', 'Bons de commande', 'read', 'Consultation des bons de commande'),
  ('Achats', 'Bons de commande', 'write', 'Création/modification des bons de commande'),
  ('Achats', 'Bons de livraison', 'read', 'Consultation des bons de livraison'),
  ('Achats', 'Bons de livraison', 'write', 'Réception des livraisons'),
  ('Ventes', 'Factures', 'read', 'Consultation des factures'),
  ('Ventes', 'Factures', 'write', 'Création/modification des factures'),
  ('Ventes', 'Précommandes', 'read', 'Consultation des précommandes'),
  ('Ventes', 'Précommandes', 'write', 'Gestion des précommandes'),
  ('Clients', NULL, 'read', 'Consultation des clients'),
  ('Clients', NULL, 'write', 'Gestion des clients'),
  ('Paramètres', 'Utilisateurs', 'read', 'Consultation des utilisateurs'),
  ('Paramètres', 'Utilisateurs', 'write', 'Gestion des utilisateurs'),
  ('Paramètres', 'Permissions', 'read', 'Consultation des permissions'),
  ('Paramètres', 'Permissions', 'write', 'Gestion des permissions');

-- Attribution de toutes les permissions au rôle Administrateur
INSERT INTO public.role_permissions (role_id, permission_id, can_access)
SELECT r.id, p.id, true
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'Administrateur'
ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;