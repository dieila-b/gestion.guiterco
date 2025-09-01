
-- Vérifier la structure actuelle des permissions pour les stocks
SELECT DISTINCT menu, submenu, action 
FROM permissions 
WHERE menu ILIKE '%stock%' OR menu ILIKE '%catalogue%'
ORDER BY menu, submenu, action;

-- Vérifier les permissions existantes des rôles pour les stocks
SELECT p.menu, p.submenu, p.action, r.name as role_name, rp.can_access
FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
JOIN roles r ON rp.role_id = r.id
WHERE p.menu ILIKE '%stock%' OR p.menu ILIKE '%catalogue%'
ORDER BY p.menu, p.submenu, r.name;

-- Corriger les noms des menus/sous-menus pour correspondre au code
UPDATE permissions SET menu = 'Stocks' WHERE menu = 'Stock';
UPDATE permissions SET submenu = 'Stock Entrepot' WHERE menu = 'Stocks' AND submenu = 'Entrepôts';
UPDATE permissions SET submenu = 'Stock PDV' WHERE menu = 'Stocks' AND submenu = 'PDV';
UPDATE permissions SET submenu = 'Entrées' WHERE menu = 'Stocks' AND submenu = 'Mouvements' AND action = 'read';
UPDATE permissions SET submenu = 'Sorties' WHERE menu = 'Stocks' AND submenu = 'Mouvements' AND action = 'write';
UPDATE permissions SET submenu = 'Entrepôts' WHERE menu = 'Stocks' AND submenu = 'Entrepôts';
UPDATE permissions SET submenu = 'Points de Vente' WHERE menu = 'Stocks' AND submenu = 'PDV';
UPDATE permissions SET submenu = 'Transferts' WHERE menu = 'Stocks' AND submenu = 'Mouvements' AND EXISTS (
  SELECT 1 FROM permissions p2 WHERE p2.menu = 'Stocks' AND p2.submenu = 'Transferts'
);

-- Ajouter les permissions manquantes pour les stocks
INSERT INTO permissions (menu, submenu, action, description) VALUES
('Stocks', 'Stock Entrepot', 'read', 'Consulter le stock des entrepôts'),
('Stocks', 'Stock Entrepot', 'write', 'Modifier le stock des entrepôts'),
('Stocks', 'Stock PDV', 'read', 'Consulter le stock des points de vente'),
('Stocks', 'Stock PDV', 'write', 'Modifier le stock des points de vente'),
('Stocks', 'Entrées', 'read', 'Consulter les entrées de stock'),
('Stocks', 'Entrées', 'write', 'Créer/modifier les entrées de stock'),
('Stocks', 'Sorties', 'read', 'Consulter les sorties de stock'),
('Stocks', 'Sorties', 'write', 'Créer/modifier les sorties de stock'),
('Stocks', 'Entrepôts', 'read', 'Consulter les entrepôts'),
('Stocks', 'Entrepôts', 'write', 'Gérer les entrepôts'),
('Stocks', 'Points de Vente', 'read', 'Consulter les points de vente'),
('Stocks', 'Points de Vente', 'write', 'Gérer les points de vente'),
('Stocks', 'Transferts', 'read', 'Consulter les transferts de stock'),
('Stocks', 'Transferts', 'write', 'Créer/modifier les transferts de stock'),
('Catalogue', NULL, 'read', 'Consulter le catalogue'),
('Catalogue', NULL, 'write', 'Modifier le catalogue')
ON CONFLICT (menu, COALESCE(submenu, ''), action) DO NOTHING;

-- S'assurer que tous les rôles ont les bonnes permissions (exemple pour administrateur)
DO $$
DECLARE
    admin_role_id uuid;
    perm_id uuid;
BEGIN
    -- Récupérer l'ID du rôle administrateur
    SELECT id INTO admin_role_id FROM roles WHERE name = 'administrateur' LIMIT 1;
    
    IF admin_role_id IS NOT NULL THEN
        -- Accorder toutes les permissions de stocks à l'administrateur
        FOR perm_id IN 
            SELECT id FROM permissions WHERE menu IN ('Stocks', 'Catalogue')
        LOOP
            INSERT INTO role_permissions (role_id, permission_id, can_access)
            VALUES (admin_role_id, perm_id, true)
            ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = EXCLUDED.can_access;
        END LOOP;
    END IF;
END $$;
