
-- Nettoyer et recréer toutes les permissions pour tous les menus et sous-menus
DELETE FROM public.permissions;

-- Insérer toutes les permissions nécessaires pour chaque menu et sous-menu
INSERT INTO public.permissions (menu, submenu, action, description) VALUES
-- Dashboard (menu principal uniquement)
('Dashboard', NULL, 'read', 'Consulter le tableau de bord principal'),
('Dashboard', NULL, 'write', 'Modifier les widgets du tableau de bord'),

-- Catalogue (menu principal uniquement)
('Catalogue', NULL, 'read', 'Consulter le catalogue des articles'),
('Catalogue', NULL, 'write', 'Créer et modifier les articles du catalogue'),
('Catalogue', NULL, 'delete', 'Supprimer des articles du catalogue'),
('Catalogue', NULL, 'export', 'Exporter le catalogue'),
('Catalogue', NULL, 'import', 'Importer des articles en masse'),

-- Stock - Entrepôts
('Stock', 'Entrepôts', 'read', 'Consulter les stocks en entrepôt'),
('Stock', 'Entrepôts', 'write', 'Gérer les entrées et sorties d''entrepôt'),
('Stock', 'Entrepôts', 'delete', 'Supprimer des mouvements de stock'),
('Stock', 'Entrepôts', 'export', 'Exporter les données de stock entrepôt'),

-- Stock - PDV
('Stock', 'PDV', 'read', 'Consulter les stocks en point de vente'),
('Stock', 'PDV', 'write', 'Gérer les stocks des points de vente'),
('Stock', 'PDV', 'transfer', 'Effectuer des transferts vers PDV'),
('Stock', 'PDV', 'export', 'Exporter les stocks PDV'),

-- Stock - Mouvements
('Stock', 'Mouvements', 'read', 'Consulter l''historique des mouvements'),
('Stock', 'Mouvements', 'write', 'Enregistrer des corrections de stock'),
('Stock', 'Mouvements', 'delete', 'Annuler des mouvements de stock'),
('Stock', 'Mouvements', 'export', 'Exporter l''historique des mouvements'),

-- Ventes - Factures
('Ventes', 'Factures', 'read', 'Consulter les factures de vente'),
('Ventes', 'Factures', 'write', 'Créer et modifier les factures'),
('Ventes', 'Factures', 'delete', 'Supprimer les factures'),
('Ventes', 'Factures', 'validate', 'Valider les factures'),
('Ventes', 'Factures', 'cancel', 'Annuler les factures'),
('Ventes', 'Factures', 'export', 'Exporter les factures'),
('Ventes', 'Factures', 'print', 'Imprimer les factures'),

-- Ventes - Précommandes
('Ventes', 'Précommandes', 'read', 'Consulter les précommandes'),
('Ventes', 'Précommandes', 'write', 'Créer et modifier les précommandes'),
('Ventes', 'Précommandes', 'delete', 'Supprimer les précommandes'),
('Ventes', 'Précommandes', 'validate', 'Valider les précommandes'),
('Ventes', 'Précommandes', 'deliver', 'Marquer comme livrées'),
('Ventes', 'Précommandes', 'export', 'Exporter les précommandes'),

-- Ventes - Devis (si existant)
('Ventes', 'Devis', 'read', 'Consulter les devis'),
('Ventes', 'Devis', 'write', 'Créer et modifier les devis'),
('Ventes', 'Devis', 'delete', 'Supprimer les devis'),
('Ventes', 'Devis', 'convert', 'Convertir devis en facture'),
('Ventes', 'Devis', 'export', 'Exporter les devis'),

-- Ventes - Vente au Comptoir (si existant)
('Ventes', 'Vente au Comptoir', 'read', 'Consulter les ventes comptoir'),
('Ventes', 'Vente au Comptoir', 'write', 'Effectuer des ventes au comptoir'),
('Ventes', 'Vente au Comptoir', 'payment', 'Encaisser les paiements'),

-- Achats - Bons de commande
('Achats', 'Bons de commande', 'read', 'Consulter les bons de commande'),
('Achats', 'Bons de commande', 'write', 'Créer et modifier les bons de commande'),
('Achats', 'Bons de commande', 'delete', 'Supprimer les bons de commande'),
('Achats', 'Bons de commande', 'validate', 'Valider les bons de commande'),
('Achats', 'Bons de commande', 'export', 'Exporter les bons de commande'),

-- Achats - Bons de livraison
('Achats', 'Bons de livraison', 'read', 'Consulter les bons de livraison'),
('Achats', 'Bons de livraison', 'write', 'Créer et gérer les bons de livraison'),
('Achats', 'Bons de livraison', 'receive', 'Réceptionner les marchandises'),
('Achats', 'Bons de livraison', 'validate', 'Valider les réceptions'),
('Achats', 'Bons de livraison', 'export', 'Exporter les bons de livraison'),

-- Achats - Factures
('Achats', 'Factures', 'read', 'Consulter les factures d''achat'),
('Achats', 'Factures', 'write', 'Créer et modifier les factures d''achat'),
('Achats', 'Factures', 'delete', 'Supprimer les factures d''achat'),
('Achats', 'Factures', 'payment', 'Enregistrer les paiements'),
('Achats', 'Factures', 'export', 'Exporter les factures d''achat'),

-- Clients (menu principal)
('Clients', NULL, 'read', 'Consulter la liste des clients'),
('Clients', NULL, 'write', 'Créer et modifier les clients'),
('Clients', NULL, 'delete', 'Supprimer des clients'),
('Clients', NULL, 'export', 'Exporter la base clients'),
('Clients', NULL, 'import', 'Importer des clients en masse'),

-- Caisse - Opérations (si existant)
('Caisse', 'Opérations', 'read', 'Consulter les opérations de caisse'),
('Caisse', 'Opérations', 'write', 'Effectuer des opérations de caisse'),
('Caisse', 'Opérations', 'close', 'Clôturer la caisse'),

-- Caisse - Clôtures (si existant)
('Caisse', 'Clôtures', 'read', 'Consulter les clôtures de caisse'),
('Caisse', 'Clôtures', 'write', 'Modifier les clôtures'),
('Caisse', 'Clôtures', 'export', 'Exporter les clôtures'),

-- Rapports - Ventes
('Rapports', 'Ventes', 'read', 'Consulter les rapports de vente'),
('Rapports', 'Ventes', 'export', 'Exporter les rapports de vente'),

-- Rapports - Stock
('Rapports', 'Stock', 'read', 'Consulter les rapports de stock'),
('Rapports', 'Stock', 'export', 'Exporter les rapports de stock'),

-- Rapports - Marges
('Rapports', 'Marges', 'read', 'Consulter les rapports de marges'),
('Rapports', 'Marges', 'export', 'Exporter les rapports de marges'),

-- Rapports - Clients (si existant)
('Rapports', 'Clients', 'read', 'Consulter les rapports clients'),
('Rapports', 'Clients', 'export', 'Exporter les rapports clients'),

-- Paramètres - Utilisateurs
('Paramètres', 'Utilisateurs', 'read', 'Consulter la liste des utilisateurs'),
('Paramètres', 'Utilisateurs', 'write', 'Créer et modifier les utilisateurs'),
('Paramètres', 'Utilisateurs', 'delete', 'Supprimer des utilisateurs'),

-- Paramètres - Rôles et permissions
('Paramètres', 'Rôles et permissions', 'read', 'Consulter les rôles et permissions'),
('Paramètres', 'Rôles et permissions', 'write', 'Gérer les rôles et permissions'),

-- Paramètres - Fournisseurs (si existant)
('Paramètres', 'Fournisseurs', 'read', 'Consulter les fournisseurs'),
('Paramètres', 'Fournisseurs', 'write', 'Gérer les fournisseurs'),
('Paramètres', 'Fournisseurs', 'delete', 'Supprimer des fournisseurs'),

-- Paramètres - Système
('Paramètres', 'Système', 'read', 'Consulter les paramètres système'),
('Paramètres', 'Système', 'write', 'Modifier les paramètres système');

-- Créer ou mettre à jour les rôles de base
INSERT INTO public.roles (name, description, is_system) VALUES
('Administrateur', 'Accès complet à toutes les fonctionnalités', true),
('Manager', 'Accès étendu avec gestion d''équipe', false),
('Vendeur', 'Accès aux ventes et gestion clients', false),
('Caissier', 'Accès limité aux ventes et caisse', false)
ON CONFLICT (name) DO UPDATE SET
description = EXCLUDED.description,
is_system = EXCLUDED.is_system;

-- Fonction pour attribuer toutes les permissions au rôle Administrateur
CREATE OR REPLACE FUNCTION public.assign_all_permissions_to_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_role_id UUID;
    perm RECORD;
BEGIN
    -- Récupérer l'ID du rôle Administrateur
    SELECT id INTO admin_role_id FROM public.roles WHERE name = 'Administrateur';
    
    IF admin_role_id IS NOT NULL THEN
        -- Supprimer les anciennes permissions pour éviter les doublons
        DELETE FROM public.role_permissions WHERE role_id = admin_role_id;
        
        -- Attribuer toutes les permissions au rôle Administrateur
        FOR perm IN SELECT id FROM public.permissions LOOP
            INSERT INTO public.role_permissions (role_id, permission_id, can_access)
            VALUES (admin_role_id, perm.id, true);
        END LOOP;
        
        RAISE NOTICE 'Toutes les permissions ont été attribuées au rôle Administrateur';
    ELSE
        RAISE NOTICE 'Rôle Administrateur introuvable';
    END IF;
END;
$$;

-- Exécuter la fonction pour attribuer les permissions
SELECT public.assign_all_permissions_to_admin();

-- Créer un trigger pour attribuer automatiquement les nouvelles permissions à l'Administrateur
CREATE OR REPLACE FUNCTION public.auto_assign_permission_to_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_role_id UUID;
BEGIN
    -- Récupérer l'ID du rôle Administrateur
    SELECT id INTO admin_role_id FROM public.roles WHERE name = 'Administrateur';
    
    IF admin_role_id IS NOT NULL THEN
        -- Attribuer automatiquement la nouvelle permission à l'Administrateur
        INSERT INTO public.role_permissions (role_id, permission_id, can_access)
        VALUES (admin_role_id, NEW.id, true);
    END IF;
    
    RETURN NEW;
END;
$$;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_auto_assign_permission_to_admin ON public.permissions;
CREATE TRIGGER trigger_auto_assign_permission_to_admin
    AFTER INSERT ON public.permissions
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_assign_permission_to_admin();

-- Vérifier que toutes les permissions sont bien créées
SELECT 
    menu,
    submenu,
    COUNT(*) as nb_permissions,
    STRING_AGG(action, ', ' ORDER BY action) as actions
FROM public.permissions 
GROUP BY menu, submenu 
ORDER BY menu, submenu;
