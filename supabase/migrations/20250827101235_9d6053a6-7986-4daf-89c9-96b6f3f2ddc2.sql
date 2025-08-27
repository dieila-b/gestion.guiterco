-- Synchronisation des données pour la vente au comptoir
-- Corriger les données manquantes dans le catalogue

-- 1. Mettre à jour les champs categorie manquants à partir des relations
UPDATE catalogue 
SET categorie = cc.nom
FROM categories_catalogue cc
WHERE catalogue.categorie_id = cc.id 
AND (catalogue.categorie IS NULL OR catalogue.categorie = '');

-- 2. Mettre à jour les champs unite_mesure manquants à partir des relations
UPDATE catalogue 
SET unite_mesure = u.nom
FROM unites u
WHERE catalogue.unite_id = u.id 
AND (catalogue.unite_mesure IS NULL OR catalogue.unite_mesure = '');

-- 3. Créer une unité par défaut si elle n'existe pas
INSERT INTO unites (nom, symbole, type_unite, statut) 
SELECT 'Unité', 'U', 'quantite', 'actif'
WHERE NOT EXISTS (SELECT 1 FROM unites WHERE nom = 'Unité');

-- 4. Attribuer l'unité par défaut aux articles sans unite_id
UPDATE catalogue 
SET unite_id = (SELECT id FROM unites WHERE nom = 'Unité' LIMIT 1),
    unite_mesure = 'Unité'
WHERE unite_id IS NULL;

-- 5. Créer une catégorie par défaut si elle n'existe pas
INSERT INTO categories_catalogue (nom, description, couleur) 
SELECT 'Divers', 'Catégorie par défaut', '#6366f1'
WHERE NOT EXISTS (SELECT 1 FROM categories_catalogue WHERE nom = 'Divers');

-- 6. Attribuer la catégorie par défaut aux articles sans categorie_id
UPDATE catalogue 
SET categorie_id = (SELECT id FROM categories_catalogue WHERE nom = 'Divers' LIMIT 1),
    categorie = 'Divers'
WHERE categorie_id IS NULL;

-- 7. S'assurer que tous les articles en stock ont des données complètes
UPDATE catalogue
SET 
  categorie = COALESCE(categorie, 'Divers'),
  unite_mesure = COALESCE(unite_mesure, 'Unité'),
  prix_vente = COALESCE(prix_vente, prix_unitaire, 0)
WHERE id IN (
  SELECT DISTINCT sp.article_id 
  FROM stock_pdv sp 
  WHERE sp.quantite_disponible > 0
);

-- 8. Vérifier l'intégrité des relations pour le stock PDV
UPDATE stock_pdv 
SET quantite_minimum = COALESCE(quantite_minimum, 5)
WHERE quantite_minimum IS NULL;