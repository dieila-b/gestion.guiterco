-- Supprimer les anciennes permissions du menu Stocks
DELETE FROM public.permissions WHERE menu = 'Stocks';

-- Ajouter les nouvelles permissions pour le menu Stocks selon la capture d'écran
INSERT INTO public.permissions (menu, submenu, action, description) VALUES
-- Stock Entrepot
('Stocks', 'Stock Entrepot', 'read', 'Voir le stock des entrepôts'),
('Stocks', 'Stock Entrepot', 'write', 'Modifier le stock des entrepôts'),

-- Stock PDV
('Stocks', 'Stock PDV', 'read', 'Voir le stock des points de vente'),
('Stocks', 'Stock PDV', 'write', 'Modifier le stock des points de vente'),

-- Entrées
('Stocks', 'Entrées', 'read', 'Voir les entrées de stock'),
('Stocks', 'Entrées', 'write', 'Créer et modifier les entrées de stock'),

-- Sorties
('Stocks', 'Sorties', 'read', 'Voir les sorties de stock'),
('Stocks', 'Sorties', 'write', 'Créer et modifier les sorties de stock'),

-- Entrepôts
('Stocks', 'Entrepôts', 'read', 'Voir la liste des entrepôts'),
('Stocks', 'Entrepôts', 'write', 'Créer et modifier les entrepôts'),

-- Points de Vente
('Stocks', 'Points de Vente', 'read', 'Voir la liste des points de vente'),
('Stocks', 'Points de Vente', 'write', 'Créer et modifier les points de vente'),

-- Transferts
('Stocks', 'Transferts', 'read', 'Voir les transferts de stock'),
('Stocks', 'Transferts', 'write', 'Créer et modifier les transferts de stock'),

-- Catalogue
('Stocks', 'Catalogue', 'read', 'Voir le catalogue depuis les stocks'),
('Stocks', 'Catalogue', 'write', 'Modifier le catalogue depuis les stocks');