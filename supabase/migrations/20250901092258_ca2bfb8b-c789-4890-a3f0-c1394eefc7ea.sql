
-- Corriger la structure des permissions pour rendre les sous-menus indépendants
-- Supprimer les permissions en doublon et créer une structure claire

-- 1. D'abord, nettoyer les permissions existantes pour éviter les conflits
DELETE FROM role_permissions WHERE permission_id IN (
    SELECT id FROM permissions WHERE menu = 'Stocks' AND submenu IS NULL
);

DELETE FROM permissions WHERE menu = 'Stocks' AND submenu IS NULL;

-- 2. Créer une structure de permissions claire et indépendante pour chaque sous-menu
INSERT INTO permissions (menu, submenu, action, description) VALUES
-- Sous-menu Stock Entrepôt
('Stocks', 'Stock Entrepôt', 'read', 'Consultation du stock entrepôt'),
('Stocks', 'Stock Entrepôt', 'write', 'Modification du stock entrepôt'),

-- Sous-menu Stock PDV  
('Stocks', 'Stock PDV', 'read', 'Consultation du stock points de vente'),
('Stocks', 'Stock PDV', 'write', 'Modification du stock points de vente'),

-- Sous-menu Entrées
('Stocks', 'Entrées', 'read', 'Consultation des entrées de stock'),
('Stocks', 'Entrées', 'write', 'Saisie des entrées de stock'),

-- Sous-menu Sorties
('Stocks', 'Sorties', 'read', 'Consultation des sorties de stock'), 
('Stocks', 'Sorties', 'write', 'Saisie des sorties de stock'),

-- Sous-menu Entrepôts
('Stocks', 'Entrepôts', 'read', 'Consultation des entrepôts'),
('Stocks', 'Entrepôts', 'write', 'Gestion des entrepôts'),

-- Sous-menu Points de Vente
('Stocks', 'Points de Vente', 'read', 'Consultation des points de vente'),
('Stocks', 'Points de Vente', 'write', 'Gestion des points de vente'),

-- Sous-menu Transferts
('Stocks', 'Transferts', 'read', 'Consultation des transferts de stock'),
('Stocks', 'Transferts', 'write', 'Création des transferts de stock'),

-- Sous-menu Catalogue (dans Stocks)
('Stocks', 'Catalogue', 'read', 'Consultation du catalogue dans stocks'),
('Stocks', 'Catalogue', 'write', 'Modification du catalogue dans stocks')

ON CONFLICT (menu, COALESCE(submenu, ''), action) DO UPDATE SET
    description = EXCLUDED.description;

-- 3. Supprimer les anciennes permissions en doublon qui pourraient causer des conflits
DELETE FROM permissions WHERE menu = 'Stocks' AND submenu IS NULL;

-- 4. Nettoyer les permissions obsolètes avec des noms incorrects
DELETE FROM permissions WHERE menu = 'Stocks' AND submenu IN ('Mouvements', 'PDV');

-- 5. S'assurer que les contraintes d'unicité sont respectées
DELETE FROM permissions p1 USING permissions p2 
WHERE p1.id > p2.id 
AND p1.menu = p2.menu 
AND COALESCE(p1.submenu, '') = COALESCE(p2.submenu, '') 
AND p1.action = p2.action;

-- 6. Recréer les permissions pour le rôle Vendeur avec la nouvelle structure
DO $$
DECLARE
    vendeur_role_id UUID;
    permission_record RECORD;
BEGIN
    -- Récupérer l'ID du rôle Vendeur
    SELECT id INTO vendeur_role_id FROM roles WHERE LOWER(name) = 'vendeur' OR LOWER(nom) = 'vendeur';
    
    IF vendeur_role_id IS NOT NULL THEN
        -- Supprimer les anciennes permissions pour ce rôle sur Stocks
        DELETE FROM role_permissions WHERE role_id = vendeur_role_id AND permission_id IN (
            SELECT id FROM permissions WHERE menu = 'Stocks'
        );
        
        -- Accorder toutes les nouvelles permissions Stocks au rôle Vendeur
        INSERT INTO role_permissions (role_id, permission_id, can_access)
        SELECT vendeur_role_id, p.id, true
        FROM permissions p 
        WHERE p.menu = 'Stocks'
        ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;
        
        RAISE NOTICE 'Permissions Stocks mises à jour pour le rôle Vendeur';
    END IF;
END $$;

-- 7. Faire de même pour le rôle Administrateur
DO $$
DECLARE
    admin_role_id UUID;
BEGIN
    -- Récupérer l'ID du rôle Administrateur
    SELECT id INTO admin_role_id FROM roles WHERE LOWER(name) IN ('administrateur', 'admin');
    
    IF admin_role_id IS NOT NULL THEN
        -- Accorder toutes les permissions Stocks au rôle Administrateur
        INSERT INTO role_permissions (role_id, permission_id, can_access)
        SELECT admin_role_id, p.id, true
        FROM permissions p 
        WHERE p.menu = 'Stocks'
        ON CONFLICT (role_id, permission_id) DO UPDATE SET can_access = true;
        
        RAISE NOTICE 'Permissions Stocks accordées au rôle Administrateur';
    END IF;
END $$;

-- 8. Vérification finale - afficher la structure des permissions
SELECT 
    p.menu,
    p.submenu,
    p.action,
    p.description,
    COUNT(rp.id) as nb_roles_avec_permission
FROM permissions p
LEFT JOIN role_permissions rp ON p.id = rp.permission_id AND rp.can_access = true
WHERE p.menu = 'Stocks'
GROUP BY p.id, p.menu, p.submenu, p.action, p.description
ORDER BY p.submenu NULLS FIRST, p.action;

-- 9. Afficher les permissions par rôle pour vérification
SELECT 
    r.name as role_name,
    p.submenu,
    p.action,
    rp.can_access
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
JOIN permissions p ON rp.permission_id = p.id
WHERE p.menu = 'Stocks'
ORDER BY r.name, p.submenu, p.action;
