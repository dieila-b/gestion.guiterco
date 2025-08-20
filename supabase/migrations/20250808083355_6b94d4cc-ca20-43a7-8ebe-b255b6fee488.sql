
-- Nettoyer et synchroniser les permissions manquantes
-- 1. Supprimer les doublons éventuels dans permissions
DELETE FROM public.permissions a USING public.permissions b
WHERE a.id > b.id 
AND a.menu = b.menu 
AND COALESCE(a.submenu, '') = COALESCE(b.submenu, '') 
AND a.action = b.action;

-- 2. Insérer les permissions manquantes pour tous les sous-menus
INSERT INTO public.permissions (menu, submenu, action, description) VALUES
-- Paramètres - Zone Géographique
('Paramètres', 'Zone Géographique', 'read', 'Zone Géographique - Consultation des zones géographiques'),
('Paramètres', 'Zone Géographique', 'write', 'Zone Géographique - Création/modification des zones géographiques'),
('Paramètres', 'Zone Géographique', 'delete', 'Zone Géographique - Suppression des zones géographiques'),

-- Paramètres - Fournisseurs
('Paramètres', 'Fournisseurs', 'read', 'Fournisseurs - Consultation des fournisseurs'),
('Paramètres', 'Fournisseurs', 'write', 'Fournisseurs - Création/modification des fournisseurs'),
('Paramètres', 'Fournisseurs', 'delete', 'Fournisseurs - Suppression des fournisseurs'),

-- Paramètres - Entrepôts
('Paramètres', 'Entrepôts', 'read', 'Entrepôts - Consultation des entrepôts'),
('Paramètres', 'Entrepôts', 'write', 'Entrepôts - Création/modification des entrepôts'),
('Paramètres', 'Entrepôts', 'delete', 'Entrepôts - Suppression des entrepôts'),

-- Paramètres - Points de vente
('Paramètres', 'Points de vente', 'read', 'Points de vente - Consultation des points de vente'),
('Paramètres', 'Points de vente', 'write', 'Points de vente - Création/modification des points de vente'),
('Paramètres', 'Points de vente', 'delete', 'Points de vente - Suppression des points de vente'),

-- Paramètres - Utilisateurs
('Paramètres', 'Utilisateurs', 'read', 'Utilisateurs - Consultation des utilisateurs internes'),
('Paramètres', 'Utilisateurs', 'write', 'Utilisateurs - Création/modification des utilisateurs internes'),
('Paramètres', 'Utilisateurs', 'delete', 'Utilisateurs - Suppression des utilisateurs internes'),

-- Paramètres - Permissions
('Paramètres', 'Permissions', 'read', 'Permissions - Consultation des permissions'),
('Paramètres', 'Permissions', 'write', 'Permissions - Configuration des permissions'),

-- Ventes - Précommandes
('Ventes', 'Précommandes', 'read', 'Précommandes - Consultation des précommandes'),
('Ventes', 'Précommandes', 'write', 'Précommandes - Création/modification des précommandes'),
('Ventes', 'Précommandes', 'delete', 'Précommandes - Suppression des précommandes'),
('Ventes', 'Précommandes', 'validate', 'Précommandes - Validation des précommandes'),

-- Stock - Mouvements
('Stock', 'Mouvements', 'read', 'Mouvements - Consultation des mouvements de stock'),
('Stock', 'Mouvements', 'write', 'Mouvements - Création/modification des mouvements'),

-- Stock - Entrepôts
('Stock', 'Entrepôts', 'read', 'Stock Entrepôts - Consultation du stock en entrepôt'),
('Stock', 'Entrepôts', 'write', 'Stock Entrepôts - Modification du stock en entrepôt'),

-- Stock - PDV
('Stock', 'PDV', 'read', 'Stock PDV - Consultation du stock en point de vente'),
('Stock', 'PDV', 'write', 'Stock PDV - Modification du stock en point de vente'),

-- Rapports - Ventes
('Rapports', 'Ventes', 'read', 'Rapports Ventes - Consultation des rapports de vente'),

-- Rapports - Marges
('Rapports', 'Marges', 'read', 'Rapports Marges - Consultation des rapports de marge'),

-- Achats - Bons de commande
('Achats', 'Bons de commande', 'read', 'Bons de commande - Consultation des bons de commande'),
('Achats', 'Bons de commande', 'write', 'Bons de commande - Création/modification des bons de commande')

ON CONFLICT (menu, COALESCE(submenu, ''), action) DO NOTHING;

-- 3. Attribuer automatiquement toutes les permissions au rôle Administrateur
DO $$
DECLARE
    admin_role_id UUID;
    perm RECORD;
BEGIN
    -- Récupérer l'ID du rôle Administrateur
    SELECT id INTO admin_role_id FROM public.roles WHERE name = 'Administrateur';
    
    IF admin_role_id IS NOT NULL THEN
        -- Attribuer toutes les permissions au rôle Administrateur
        FOR perm IN SELECT id FROM public.permissions LOOP
            INSERT INTO public.role_permissions (role_id, permission_id, can_access)
            VALUES (admin_role_id, perm.id, true)
            ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;
        END LOOP;
    END IF;
END $$;

-- 4. Nettoyer les entrées orphelines dans role_permissions
DELETE FROM public.role_permissions 
WHERE permission_id NOT IN (SELECT id FROM public.permissions);

DELETE FROM public.role_permissions 
WHERE role_id NOT IN (SELECT id FROM public.roles);

-- 5. Créer une fonction pour synchroniser automatiquement les permissions admin
CREATE OR REPLACE FUNCTION sync_admin_permissions()
RETURNS TRIGGER AS $$
DECLARE
    admin_role_id UUID;
BEGIN
    -- Récupérer l'ID du rôle Administrateur
    SELECT id INTO admin_role_id FROM public.roles WHERE name = 'Administrateur';
    
    IF admin_role_id IS NOT NULL THEN
        -- Attribuer la nouvelle permission au rôle Administrateur
        INSERT INTO public.role_permissions (role_id, permission_id, can_access)
        VALUES (admin_role_id, NEW.id, true)
        ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Créer le trigger pour synchroniser automatiquement
DROP TRIGGER IF EXISTS trigger_sync_admin_permissions ON public.permissions;
CREATE TRIGGER trigger_sync_admin_permissions
    AFTER INSERT ON public.permissions
    FOR EACH ROW
    EXECUTE FUNCTION sync_admin_permissions();
