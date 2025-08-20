
-- Mise à jour complète des menus et sous-menus avec toutes les permissions nécessaires
DO $$
DECLARE
  menu_id_var uuid;
  sous_menu_id_var uuid;
BEGIN
  -- Dashboard (pas de sous-menu, permissions directes)
  SELECT id INTO menu_id_var FROM public.menus WHERE nom = 'Dashboard';
  
  -- Permissions pour Dashboard
  INSERT INTO public.permissions (menu, submenu, action, description, menu_id, sous_menu_id) VALUES
  ('Dashboard', NULL, 'read', 'Consulter le tableau de bord', menu_id_var, NULL)
  ON CONFLICT (menu, COALESCE(submenu, ''), action) DO NOTHING;

  -- Catalogue (pas de sous-menu, permissions directes)
  SELECT id INTO menu_id_var FROM public.menus WHERE nom = 'Catalogue';
  
  -- Permissions pour Catalogue
  INSERT INTO public.permissions (menu, submenu, action, description, menu_id, sous_menu_id) VALUES
  ('Catalogue', NULL, 'read', 'Consulter le catalogue', menu_id_var, NULL),
  ('Catalogue', NULL, 'write', 'Gérer le catalogue', menu_id_var, NULL),
  ('Catalogue', NULL, 'delete', 'Supprimer des articles', menu_id_var, NULL),
  ('Catalogue', NULL, 'export', 'Exporter le catalogue', menu_id_var, NULL),
  ('Catalogue', NULL, 'import', 'Importer des articles', menu_id_var, NULL)
  ON CONFLICT (menu, COALESCE(submenu, ''), action) DO NOTHING;

  -- Stock - Entrepôts
  SELECT id INTO menu_id_var FROM public.menus WHERE nom = 'Stock';
  SELECT id INTO sous_menu_id_var FROM public.sous_menus WHERE menu_id = menu_id_var AND nom = 'Entrepôts';
  
  INSERT INTO public.permissions (menu, submenu, action, description, menu_id, sous_menu_id) VALUES
  ('Stock', 'Entrepôts', 'read', 'Consulter les stocks entrepôts', menu_id_var, sous_menu_id_var),
  ('Stock', 'Entrepôts', 'write', 'Gérer les stocks entrepôts', menu_id_var, sous_menu_id_var),
  ('Stock', 'Entrepôts', 'export', 'Exporter les données de stock', menu_id_var, sous_menu_id_var)
  ON CONFLICT (menu, COALESCE(submenu, ''), action) DO NOTHING;

  -- Stock - PDV
  SELECT id INTO sous_menu_id_var FROM public.sous_menus WHERE menu_id = menu_id_var AND nom = 'PDV';
  
  INSERT INTO public.permissions (menu, submenu, action, description, menu_id, sous_menu_id) VALUES
  ('Stock', 'PDV', 'read', 'Consulter les stocks PDV', menu_id_var, sous_menu_id_var),
  ('Stock', 'PDV', 'write', 'Gérer les stocks PDV', menu_id_var, sous_menu_id_var),
  ('Stock', 'PDV', 'export', 'Exporter les données PDV', menu_id_var, sous_menu_id_var)
  ON CONFLICT (menu, COALESCE(submenu, ''), action) DO NOTHING;

  -- Stock - Transferts
  SELECT id INTO sous_menu_id_var FROM public.sous_menus WHERE menu_id = menu_id_var AND nom = 'Transferts';
  
  INSERT INTO public.permissions (menu, submenu, action, description, menu_id, sous_menu_id) VALUES
  ('Stock', 'Transferts', 'read', 'Consulter les transferts', menu_id_var, sous_menu_id_var),
  ('Stock', 'Transferts', 'write', 'Créer et gérer les transferts', menu_id_var, sous_menu_id_var),
  ('Stock', 'Transferts', 'delete', 'Annuler des transferts', menu_id_var, sous_menu_id_var)
  ON CONFLICT (menu, COALESCE(submenu, ''), action) DO NOTHING;

  -- Stock - Mouvements
  SELECT id INTO sous_menu_id_var FROM public.sous_menus WHERE menu_id = menu_id_var AND nom = 'Mouvements';
  
  INSERT INTO public.permissions (menu, submenu, action, description, menu_id, sous_menu_id) VALUES
  ('Stock', 'Mouvements', 'read', 'Consulter les mouvements de stock', menu_id_var, sous_menu_id_var),
  ('Stock', 'Mouvements', 'export', 'Exporter l''historique des mouvements', menu_id_var, sous_menu_id_var)
  ON CONFLICT (menu, COALESCE(submenu, ''), action) DO NOTHING;

  -- Achats - Bons de commande
  SELECT id INTO menu_id_var FROM public.menus WHERE nom = 'Achats';
  SELECT id INTO sous_menu_id_var FROM public.sous_menus WHERE menu_id = menu_id_var AND nom = 'Bons de commande';
  
  INSERT INTO public.permissions (menu, submenu, action, description, menu_id, sous_menu_id) VALUES
  ('Achats', 'Bons de commande', 'read', 'Consulter les bons de commande', menu_id_var, sous_menu_id_var),
  ('Achats', 'Bons de commande', 'write', 'Créer et modifier les bons de commande', menu_id_var, sous_menu_id_var),
  ('Achats', 'Bons de commande', 'delete', 'Supprimer les bons de commande', menu_id_var, sous_menu_id_var),
  ('Achats', 'Bons de commande', 'validate', 'Valider les bons de commande', menu_id_var, sous_menu_id_var),
  ('Achats', 'Bons de commande', 'export', 'Exporter les bons de commande', menu_id_var, sous_menu_id_var)
  ON CONFLICT (menu, COALESCE(submenu, ''), action) DO NOTHING;

  -- Achats - Bons de livraison
  SELECT id INTO sous_menu_id_var FROM public.sous_menus WHERE menu_id = menu_id_var AND nom = 'Bons de livraison';
  
  INSERT INTO public.permissions (menu, submenu, action, description, menu_id, sous_menu_id) VALUES
  ('Achats', 'Bons de livraison', 'read', 'Consulter les bons de livraison', menu_id_var, sous_menu_id_var),
  ('Achats', 'Bons de livraison', 'write', 'Créer et modifier les bons de livraison', menu_id_var, sous_menu_id_var),
  ('Achats', 'Bons de livraison', 'validate', 'Valider les réceptions', menu_id_var, sous_menu_id_var),
  ('Achats', 'Bons de livraison', 'export', 'Exporter les bons de livraison', menu_id_var, sous_menu_id_var)
  ON CONFLICT (menu, COALESCE(submenu, ''), action) DO NOTHING;

  -- Achats - Factures d'Achats
  SELECT id INTO sous_menu_id_var FROM public.sous_menus WHERE menu_id = menu_id_var AND nom = 'Factures d''Achats';
  
  INSERT INTO public.permissions (menu, submenu, action, description, menu_id, sous_menu_id) VALUES
  ('Achats', 'Factures d''Achats', 'read', 'Consulter les factures d''achat', menu_id_var, sous_menu_id_var),
  ('Achats', 'Factures d''Achats', 'write', 'Créer et modifier les factures d''achat', menu_id_var, sous_menu_id_var),
  ('Achats', 'Factures d''Achats', 'validate', 'Valider les paiements', menu_id_var, sous_menu_id_var),
  ('Achats', 'Factures d''Achats', 'export', 'Exporter les factures d''achat', menu_id_var, sous_menu_id_var)
  ON CONFLICT (menu, COALESCE(submenu, ''), action) DO NOTHING;

  -- Achats - Retours Fournisseurs
  SELECT id INTO sous_menu_id_var FROM public.sous_menus WHERE menu_id = menu_id_var AND nom = 'Retours Fournisseurs';
  
  INSERT INTO public.permissions (menu, submenu, action, description, menu_id, sous_menu_id) VALUES
  ('Achats', 'Retours Fournisseurs', 'read', 'Consulter les retours fournisseurs', menu_id_var, sous_menu_id_var),
  ('Achats', 'Retours Fournisseurs', 'write', 'Créer et gérer les retours', menu_id_var, sous_menu_id_var),
  ('Achats', 'Retours Fournisseurs', 'validate', 'Valider les retours', menu_id_var, sous_menu_id_var)
  ON CONFLICT (menu, COALESCE(submenu, ''), action) DO NOTHING;

  -- Ventes - Factures
  SELECT id INTO menu_id_var FROM public.menus WHERE nom = 'Ventes';
  SELECT id INTO sous_menu_id_var FROM public.sous_menus WHERE menu_id = menu_id_var AND nom = 'Factures';
  
  INSERT INTO public.permissions (menu, submenu, action, description, menu_id, sous_menu_id) VALUES
  ('Ventes', 'Factures', 'read', 'Consulter les factures de vente', menu_id_var, sous_menu_id_var),
  ('Ventes', 'Factures', 'write', 'Créer et modifier les factures', menu_id_var, sous_menu_id_var),
  ('Ventes', 'Factures', 'delete', 'Supprimer les factures', menu_id_var, sous_menu_id_var),
  ('Ventes', 'Factures', 'validate', 'Valider les factures', menu_id_var, sous_menu_id_var),
  ('Ventes', 'Factures', 'cancel', 'Annuler les factures', menu_id_var, sous_menu_id_var),
  ('Ventes', 'Factures', 'export', 'Exporter les factures', menu_id_var, sous_menu_id_var)
  ON CONFLICT (menu, COALESCE(submenu, ''), action) DO NOTHING;

  -- Ventes - Précommandes
  SELECT id INTO sous_menu_id_var FROM public.sous_menus WHERE menu_id = menu_id_var AND nom = 'Précommandes';
  
  INSERT INTO public.permissions (menu, submenu, action, description, menu_id, sous_menu_id) VALUES
  ('Ventes', 'Précommandes', 'read', 'Consulter les précommandes', menu_id_var, sous_menu_id_var),
  ('Ventes', 'Précommandes', 'write', 'Créer et modifier les précommandes', menu_id_var, sous_menu_id_var),
  ('Ventes', 'Précommandes', 'delete', 'Supprimer les précommandes', menu_id_var, sous_menu_id_var),
  ('Ventes', 'Précommandes', 'validate', 'Valider les précommandes', menu_id_var, sous_menu_id_var),
  ('Ventes', 'Précommandes', 'cancel', 'Annuler les précommandes', menu_id_var, sous_menu_id_var)
  ON CONFLICT (menu, COALESCE(submenu, ''), action) DO NOTHING;

  -- Ventes - Devis
  SELECT id INTO sous_menu_id_var FROM public.sous_menus WHERE menu_id = menu_id_var AND nom = 'Devis';
  
  INSERT INTO public.permissions (menu, submenu, action, description, menu_id, sous_menu_id) VALUES
  ('Ventes', 'Devis', 'read', 'Consulter les devis', menu_id_var, sous_menu_id_var),
  ('Ventes', 'Devis', 'write', 'Créer et modifier les devis', menu_id_var, sous_menu_id_var),
  ('Ventes', 'Devis', 'delete', 'Supprimer les devis', menu_id_var, sous_menu_id_var),
  ('Ventes', 'Devis', 'validate', 'Valider les devis', menu_id_var, sous_menu_id_var),
  ('Ventes', 'Devis', 'convert', 'Convertir en facture', menu_id_var, sous_menu_id_var)
  ON CONFLICT (menu, COALESCE(submenu, ''), action) DO NOTHING;

  -- Ventes - Vente au Comptoir
  SELECT id INTO sous_menu_id_var FROM public.sous_menus WHERE menu_id = menu_id_var AND nom = 'Vente au Comptoir';
  
  INSERT INTO public.permissions (menu, submenu, action, description, menu_id, sous_menu_id) VALUES
  ('Ventes', 'Vente au Comptoir', 'read', 'Consulter les ventes comptoir', menu_id_var, sous_menu_id_var),
  ('Ventes', 'Vente au Comptoir', 'write', 'Effectuer des ventes comptoir', menu_id_var, sous_menu_id_var),
  ('Ventes', 'Vente au Comptoir', 'cancel', 'Annuler des ventes', menu_id_var, sous_menu_id_var)
  ON CONFLICT (menu, COALESCE(submenu, ''), action) DO NOTHING;

  -- Ventes - Retours
  SELECT id INTO sous_menu_id_var FROM public.sous_menus WHERE menu_id = menu_id_var AND nom = 'Retours';
  
  INSERT INTO public.permissions (menu, submenu, action, description, menu_id, sous_menu_id) VALUES
  ('Ventes', 'Retours', 'read', 'Consulter les retours clients', menu_id_var, sous_menu_id_var),
  ('Ventes', 'Retours', 'write', 'Créer et gérer les retours', menu_id_var, sous_menu_id_var),
  ('Ventes', 'Retours', 'validate', 'Valider les retours', menu_id_var, sous_menu_id_var)
  ON CONFLICT (menu, COALESCE(submenu, ''), action) DO NOTHING;

  -- Clients (pas de sous-menu, permissions directes)
  SELECT id INTO menu_id_var FROM public.menus WHERE nom = 'Clients';
  
  INSERT INTO public.permissions (menu, submenu, action, description, menu_id, sous_menu_id) VALUES
  ('Clients', NULL, 'read', 'Consulter les clients', menu_id_var, NULL),
  ('Clients', NULL, 'write', 'Créer et modifier les clients', menu_id_var, NULL),
  ('Clients', NULL, 'delete', 'Supprimer les clients', menu_id_var, NULL),
  ('Clients', NULL, 'export', 'Exporter la liste des clients', menu_id_var, NULL)
  ON CONFLICT (menu, COALESCE(submenu, ''), action) DO NOTHING;

  -- Caisse - Opérations
  SELECT id INTO menu_id_var FROM public.menus WHERE nom = 'Caisse';
  SELECT id INTO sous_menu_id_var FROM public.sous_menus WHERE menu_id = menu_id_var AND nom = 'Opérations';
  
  INSERT INTO public.permissions (menu, submenu, action, description, menu_id, sous_menu_id) VALUES
  ('Caisse', 'Opérations', 'read', 'Consulter les opérations de caisse', menu_id_var, sous_menu_id_var),
  ('Caisse', 'Opérations', 'write', 'Effectuer des opérations de caisse', menu_id_var, sous_menu_id_var),
  ('Caisse', 'Opérations', 'validate', 'Valider les opérations', menu_id_var, sous_menu_id_var)
  ON CONFLICT (menu, COALESCE(submenu, ''), action) DO NOTHING;

  -- Caisse - Clôtures
  SELECT id INTO sous_menu_id_var FROM public.sous_menus WHERE menu_id = menu_id_var AND nom = 'Clôtures';
  
  INSERT INTO public.permissions (menu, submenu, action, description, menu_id, sous_menu_id) VALUES
  ('Caisse', 'Clôtures', 'read', 'Consulter les clôtures de caisse', menu_id_var, sous_menu_id_var),
  ('Caisse', 'Clôtures', 'write', 'Effectuer les clôtures', menu_id_var, sous_menu_id_var),
  ('Caisse', 'Clôtures', 'validate', 'Valider les clôtures', menu_id_var, sous_menu_id_var),
  ('Caisse', 'Clôtures', 'export', 'Exporter les clôtures', menu_id_var, sous_menu_id_var)
  ON CONFLICT (menu, COALESCE(submenu, ''), action) DO NOTHING;

  -- Caisse - Dépenses
  SELECT id INTO sous_menu_id_var FROM public.sous_menus WHERE menu_id = menu_id_var AND nom = 'Dépenses';
  
  INSERT INTO public.permissions (menu, submenu, action, description, menu_id, sous_menu_id) VALUES
  ('Caisse', 'Dépenses', 'read', 'Consulter les dépenses', menu_id_var, sous_menu_id_var),
  ('Caisse', 'Dépenses', 'write', 'Enregistrer des dépenses', menu_id_var, sous_menu_id_var),
  ('Caisse', 'Dépenses', 'validate', 'Valider les dépenses', menu_id_var, sous_menu_id_var)
  ON CONFLICT (menu, COALESCE(submenu, ''), action) DO NOTHING;

  -- Rapports - Ventes
  SELECT id INTO menu_id_var FROM public.menus WHERE nom = 'Rapports';
  SELECT id INTO sous_menu_id_var FROM public.sous_menus WHERE menu_id = menu_id_var AND nom = 'Ventes';
  
  INSERT INTO public.permissions (menu, submenu, action, description, menu_id, sous_menu_id) VALUES
  ('Rapports', 'Ventes', 'read', 'Consulter les rapports de ventes', menu_id_var, sous_menu_id_var),
  ('Rapports', 'Ventes', 'export', 'Exporter les rapports de ventes', menu_id_var, sous_menu_id_var)
  ON CONFLICT (menu, COALESCE(submenu, ''), action) DO NOTHING;

  -- Rapports - Stock
  SELECT id INTO sous_menu_id_var FROM public.sous_menus WHERE menu_id = menu_id_var AND nom = 'Stock';
  
  INSERT INTO public.permissions (menu, submenu, action, description, menu_id, sous_menu_id) VALUES
  ('Rapports', 'Stock', 'read', 'Consulter les rapports de stock', menu_id_var, sous_menu_id_var),
  ('Rapports', 'Stock', 'export', 'Exporter les rapports de stock', menu_id_var, sous_menu_id_var)
  ON CONFLICT (menu, COALESCE(submenu, ''), action) DO NOTHING;

  -- Rapports - Marges
  SELECT id INTO sous_menu_id_var FROM public.sous_menus WHERE menu_id = menu_id_var AND nom = 'Marges';
  
  INSERT INTO public.permissions (menu, submenu, action, description, menu_id, sous_menu_id) VALUES
  ('Rapports', 'Marges', 'read', 'Consulter les analyses de marges', menu_id_var, sous_menu_id_var),
  ('Rapports', 'Marges', 'export', 'Exporter les analyses de marges', menu_id_var, sous_menu_id_var)
  ON CONFLICT (menu, COALESCE(submenu, ''), action) DO NOTHING;

  -- Rapports - Clients
  SELECT id INTO sous_menu_id_var FROM public.sous_menus WHERE menu_id = menu_id_var AND nom = 'Clients';
  
  INSERT INTO public.permissions (menu, submenu, action, description, menu_id, sous_menu_id) VALUES
  ('Rapports', 'Clients', 'read', 'Consulter les analyses clientèle', menu_id_var, sous_menu_id_var),
  ('Rapports', 'Clients', 'export', 'Exporter les analyses clientèle', menu_id_var, sous_menu_id_var)
  ON CONFLICT (menu, COALESCE(submenu, ''), action) DO NOTHING;

  -- Rapports - Achats
  SELECT id INTO sous_menu_id_var FROM public.sous_menus WHERE menu_id = menu_id_var AND nom = 'Achats';
  
  INSERT INTO public.permissions (menu, submenu, action, description, menu_id, sous_menu_id) VALUES
  ('Rapports', 'Achats', 'read', 'Consulter les rapports d''achats', menu_id_var, sous_menu_id_var),
  ('Rapports', 'Achats', 'export', 'Exporter les rapports d''achats', menu_id_var, sous_menu_id_var)
  ON CONFLICT (menu, COALESCE(submenu, ''), action) DO NOTHING;

  -- Paramètres - Utilisateurs
  SELECT id INTO menu_id_var FROM public.menus WHERE nom = 'Paramètres';
  SELECT id INTO sous_menu_id_var FROM public.sous_menus WHERE menu_id = menu_id_var AND nom = 'Utilisateurs';
  
  INSERT INTO public.permissions (menu, submenu, action, description, menu_id, sous_menu_id) VALUES
  ('Paramètres', 'Utilisateurs', 'read', 'Consulter les utilisateurs', menu_id_var, sous_menu_id_var),
  ('Paramètres', 'Utilisateurs', 'write', 'Créer et modifier les utilisateurs', menu_id_var, sous_menu_id_var),
  ('Paramètres', 'Utilisateurs', 'delete', 'Supprimer les utilisateurs', menu_id_var, sous_menu_id_var),
  ('Paramètres', 'Utilisateurs', 'validate', 'Valider les comptes utilisateurs', menu_id_var, sous_menu_id_var)
  ON CONFLICT (menu, COALESCE(submenu, ''), action) DO NOTHING;

  -- Paramètres - Rôles et permissions
  SELECT id INTO sous_menu_id_var FROM public.sous_menus WHERE menu_id = menu_id_var AND nom = 'Rôles et permissions';
  
  INSERT INTO public.permissions (menu, submenu, action, description, menu_id, sous_menu_id) VALUES
  ('Paramètres', 'Rôles et permissions', 'read', 'Consulter les rôles et permissions', menu_id_var, sous_menu_id_var),
  ('Paramètres', 'Rôles et permissions', 'write', 'Gérer les rôles et permissions', menu_id_var, sous_menu_id_var)
  ON CONFLICT (menu, COALESCE(submenu, ''), action) DO NOTHING;

  -- Paramètres - Fournisseurs
  SELECT id INTO sous_menu_id_var FROM public.sous_menus WHERE menu_id = menu_id_var AND nom = 'Fournisseurs';
  
  INSERT INTO public.permissions (menu, submenu, action, description, menu_id, sous_menu_id) VALUES
  ('Paramètres', 'Fournisseurs', 'read', 'Consulter les fournisseurs', menu_id_var, sous_menu_id_var),
  ('Paramètres', 'Fournisseurs', 'write', 'Créer et modifier les fournisseurs', menu_id_var, sous_menu_id_var),
  ('Paramètres', 'Fournisseurs', 'delete', 'Supprimer les fournisseurs', menu_id_var, sous_menu_id_var)
  ON CONFLICT (menu, COALESCE(submenu, ''), action) DO NOTHING;

  -- Paramètres - Système
  SELECT id INTO sous_menu_id_var FROM public.sous_menus WHERE menu_id = menu_id_var AND nom = 'Système';
  
  INSERT INTO public.permissions (menu, submenu, action, description, menu_id, sous_menu_id) VALUES
  ('Paramètres', 'Système', 'read', 'Consulter la configuration système', menu_id_var, sous_menu_id_var),
  ('Paramètres', 'Système', 'write', 'Modifier la configuration système', menu_id_var, sous_menu_id_var)
  ON CONFLICT (menu, COALESCE(submenu, ''), action) DO NOTHING;

END $$;

-- S'assurer que le rôle Administrateur a toutes les permissions
DO $$
DECLARE
    admin_role_id UUID;
    perm RECORD;
BEGIN
    -- Récupérer l'ID du rôle Administrateur
    SELECT id INTO admin_role_id FROM public.roles WHERE name = 'Administrateur' LIMIT 1;
    
    IF admin_role_id IS NOT NULL THEN
        -- Attribuer toutes les permissions au rôle Administrateur
        FOR perm IN SELECT id FROM public.permissions LOOP
            INSERT INTO public.role_permissions (role_id, permission_id, can_access)
            VALUES (admin_role_id, perm.id, true)
            ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;
        END LOOP;
    END IF;
END $$;
