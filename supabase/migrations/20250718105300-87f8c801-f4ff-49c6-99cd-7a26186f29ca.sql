
-- Ajouter les nouvelles permissions pour compléter la matrice
INSERT INTO public.permissions (menu, submenu, action, description) VALUES
  -- Stock - Entrées
  ('Stock', 'Entrées', 'read', 'Consultation des entrées de stock'),
  ('Stock', 'Entrées', 'write', 'Gestion des entrées de stock'),
  
  -- Stock - Sorties  
  ('Stock', 'Sorties', 'read', 'Consultation des sorties de stock'),
  ('Stock', 'Sorties', 'write', 'Gestion des sorties de stock'),
  
  -- Ventes - Vente au Comptoir
  ('Ventes', 'Vente au Comptoir', 'read', 'Consultation des ventes au comptoir'),
  ('Ventes', 'Vente au Comptoir', 'write', 'Gestion des ventes au comptoir'),
  
  -- Ventes - Factures impayées
  ('Ventes', 'Factures impayées', 'read', 'Consultation des factures impayées'),
  ('Ventes', 'Factures impayées', 'write', 'Gestion des factures impayées'),
  
  -- Ventes - Retours Clients
  ('Ventes', 'Retours Clients', 'read', 'Consultation des retours clients'),
  ('Ventes', 'Retours Clients', 'write', 'Gestion des retours clients'),
  
  -- Clients - Clients (mise à jour pour être plus spécifique)
  ('Clients', 'Clients', 'read', 'Consultation détaillée des clients'),
  ('Clients', 'Clients', 'write', 'Gestion détaillée des clients'),
  
  -- Caisses - Dépenses
  ('Caisse', 'Dépenses', 'read', 'Consultation des dépenses de caisse'),
  ('Caisse', 'Dépenses', 'write', 'Gestion des dépenses de caisse'),
  
  -- Caisses - Aperçu du jour
  ('Caisse', 'Aperçu du jour', 'read', 'Consultation de l''aperçu journalier'),
  
  -- Paramètres - Fournisseurs (menu principal)
  ('Paramètres', 'Fournisseurs', 'read', 'Consultation des fournisseurs'),
  ('Paramètres', 'Fournisseurs', 'write', 'Gestion des fournisseurs'),
  
  -- Paramètres comme menu principal
  ('Paramètres', NULL, 'read', 'Accès aux paramètres généraux'),
  ('Paramètres', NULL, 'write', 'Modification des paramètres généraux')

ON CONFLICT (menu, COALESCE(submenu, ''), action) DO NOTHING;

-- Attribuer automatiquement toutes les nouvelles permissions au rôle Administrateur
INSERT INTO public.role_permissions (role_id, permission_id, can_access)
SELECT r.id, p.id, true
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'Administrateur'
AND NOT EXISTS (
  SELECT 1 FROM public.role_permissions rp 
  WHERE rp.role_id = r.id AND rp.permission_id = p.id
);
