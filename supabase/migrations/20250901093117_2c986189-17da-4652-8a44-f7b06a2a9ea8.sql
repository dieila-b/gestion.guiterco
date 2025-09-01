
-- D'abord, vérifions et corrigeons les permissions pour le rôle Vendeur
-- Nous devons nous assurer que le rôle Vendeur a les bonnes permissions pour tous les sous-menus de Stocks

-- 1. Vérifier l'ID du rôle Vendeur
DO $$
DECLARE
    vendeur_role_id UUID;
    permission_record RECORD;
BEGIN
    -- Récupérer l'ID du rôle Vendeur
    SELECT id INTO vendeur_role_id FROM roles WHERE LOWER(name) = 'vendeur' OR LOWER(nom) = 'vendeur';
    
    IF vendeur_role_id IS NULL THEN
        RAISE NOTICE 'Rôle Vendeur non trouvé, création du rôle...';
        INSERT INTO roles (name, description) VALUES ('Vendeur', 'Rôle pour les employés vendeurs') RETURNING id INTO vendeur_role_id;
    END IF;
    
    RAISE NOTICE 'ID du rôle Vendeur: %', vendeur_role_id;
    
    -- Accorder toutes les permissions Stocks au rôle Vendeur
    -- Menu principal Stocks
    INSERT INTO role_permissions (role_id, permission_id, can_access)
    SELECT vendeur_role_id, p.id, true
    FROM permissions p 
    WHERE p.menu = 'Stocks' AND p.submenu IS NULL
    ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;
    
    -- Sous-menus Stocks
    FOR permission_record IN (
        SELECT id, menu, submenu, action 
        FROM permissions 
        WHERE menu = 'Stocks' AND submenu IS NOT NULL
    ) LOOP
        INSERT INTO role_permissions (role_id, permission_id, can_access)
        VALUES (vendeur_role_id, permission_record.id, true)
        ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;
        
        RAISE NOTICE 'Permission accordée: % > % (%)', permission_record.menu, permission_record.submenu, permission_record.action;
    END LOOP;
    
    -- Vérifier les permissions accordées
    RAISE NOTICE 'Permissions Stocks accordées au rôle Vendeur:';
    FOR permission_record IN (
        SELECT p.menu, p.submenu, p.action, rp.can_access
        FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.id
        WHERE rp.role_id = vendeur_role_id AND p.menu = 'Stocks'
        ORDER BY p.menu, p.submenu, p.action
    ) LOOP
        RAISE NOTICE '- % > % (%) : %', permission_record.menu, COALESCE(permission_record.submenu, 'N/A'), permission_record.action, permission_record.can_access;
    END LOOP;
    
END $$;

-- 2. S'assurer que toutes les permissions Stocks nécessaires existent
INSERT INTO permissions (menu, submenu, action, description) VALUES
('Stocks', 'Stock Entrepot', 'read', 'Lecture du stock entrepôt'),
('Stocks', 'Stock Entrepot', 'write', 'Écriture du stock entrepôt'),
('Stocks', 'Stock PDV', 'read', 'Lecture du stock PDV'),
('Stocks', 'Stock PDV', 'write', 'Écriture du stock PDV'),
('Stocks', 'Entrées', 'read', 'Lecture des entrées de stock'),
('Stocks', 'Entrées', 'write', 'Écriture des entrées de stock'),
('Stocks', 'Sorties', 'read', 'Lecture des sorties de stock'),
('Stocks', 'Sorties', 'write', 'Écriture des sorties de stock'),
('Stocks', 'Entrepôts', 'read', 'Lecture des entrepôts'),
('Stocks', 'Entrepôts', 'write', 'Écriture des entrepôts'),
('Stocks', 'Points de Vente', 'read', 'Lecture des points de vente'),
('Stocks', 'Points de Vente', 'write', 'Écriture des points de vente'),
('Stocks', 'Transferts', 'read', 'Lecture des transferts'),
('Stocks', 'Transferts', 'write', 'Écriture des transferts'),
('Stocks', 'Catalogue', 'read', 'Lecture du catalogue'),
('Stocks', 'Catalogue', 'write', 'Écriture du catalogue')
ON CONFLICT (menu, COALESCE(submenu, ''), action) DO NOTHING;

-- 3. Mettre à jour les permissions pour que les sous-menus correspondent aux PermissionGuard
UPDATE permissions SET submenu = 'Stock Entrepot' WHERE menu = 'Stocks' AND submenu = 'Entrepôts' AND action = 'read';
UPDATE permissions SET submenu = 'Stock Entrepot' WHERE menu = 'Stocks' AND submenu = 'Entrepôts' AND action = 'write';
UPDATE permissions SET submenu = 'Stock PDV' WHERE menu = 'Stocks' AND submenu = 'PDV' AND action = 'read';
UPDATE permissions SET submenu = 'Stock PDV' WHERE menu = 'Stocks' AND submenu = 'PDV' AND action = 'write';
UPDATE permissions SET submenu = 'Entrées' WHERE menu = 'Stocks' AND submenu = 'Mouvements' AND action = 'read';
UPDATE permissions SET submenu = 'Entrées' WHERE menu = 'Stocks' AND submenu = 'Mouvements' AND action = 'write';
UPDATE permissions SET submenu = 'Sorties' WHERE menu = 'Stocks' AND submenu = 'Mouvements' AND action = 'read';
UPDATE permissions SET submenu = 'Sorties' WHERE menu = 'Stocks' AND submenu = 'Mouvements' AND action = 'write';

-- 4. Accordé les permissions au rôle Vendeur après la mise à jour
DO $$
DECLARE
    vendeur_role_id UUID;
BEGIN
    SELECT id INTO vendeur_role_id FROM roles WHERE LOWER(name) = 'vendeur' OR LOWER(nom) = 'vendeur';
    
    -- Accorder toutes les nouvelles permissions Stocks
    INSERT INTO role_permissions (role_id, permission_id, can_access)
    SELECT vendeur_role_id, p.id, true
    FROM permissions p 
    WHERE p.menu = 'Stocks'
    ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;
    
END $$;

-- 5. Vérification finale
SELECT 
    r.name as role_name,
    p.menu,
    p.submenu,
    p.action,
    rp.can_access
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name ILIKE '%vendeur%' AND p.menu = 'Stocks'
ORDER BY p.menu, p.submenu, p.action;
