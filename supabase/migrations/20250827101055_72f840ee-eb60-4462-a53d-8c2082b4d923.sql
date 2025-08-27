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

-- 3. Créer une unité par défaut pour les articles sans unite_id
INSERT INTO unites (nom, symbole, description) 
VALUES ('Unité', 'U', 'Unité par défaut')
ON CONFLICT (nom) DO NOTHING;

-- 4. Attribuer l'unité par défaut aux articles sans unite_id
UPDATE catalogue 
SET unite_id = (SELECT id FROM unites WHERE nom = 'Unité' LIMIT 1),
    unite_mesure = 'Unité'
WHERE unite_id IS NULL;

-- 5. Attribuer une catégorie par défaut aux articles sans categorie_id
INSERT INTO categories_catalogue (nom, description, couleur) 
VALUES ('Divers', 'Catégorie par défaut', '#6366f1')
ON CONFLICT (nom) DO NOTHING;

UPDATE catalogue 
SET categorie_id = (SELECT id FROM categories_catalogue WHERE nom = 'Divers' LIMIT 1),
    categorie = 'Divers'
WHERE categorie_id IS NULL;

-- 6. S'assurer que tous les articles en stock ont des données complètes
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

-- 7. Vérifier l'intégrité des relations pour le stock PDV
UPDATE stock_pdv 
SET quantite_minimum = COALESCE(quantite_minimum, 5)
WHERE quantite_minimum IS NULL;

-- 8. Créer une vue pour faciliter les requêtes de vente au comptoir
CREATE OR REPLACE VIEW vue_stock_pdv_complet AS
SELECT 
  sp.id,
  sp.article_id,
  sp.point_vente_id,
  sp.quantite_disponible,
  sp.quantite_minimum,
  sp.derniere_livraison,
  sp.created_at,
  sp.updated_at,
  -- Données article avec fallbacks
  c.nom as article_nom,
  c.reference,
  c.description,
  COALESCE(c.prix_vente, c.prix_unitaire, 0) as prix_vente,
  c.image_url,
  COALESCE(c.categorie, cc.nom, 'Divers') as categorie,
  c.categorie_id,
  COALESCE(c.unite_mesure, u.nom, 'Unité') as unite_mesure,
  c.unite_id,
  c.statut as article_statut,
  -- Données catégorie
  cc.nom as categorie_nom,
  cc.couleur as categorie_couleur,
  -- Données unité
  u.nom as unite_nom,
  u.symbole as unite_symbole,
  -- Données point de vente
  pdv.nom as point_vente_nom,
  pdv.adresse as point_vente_adresse,
  pdv.statut as point_vente_statut
FROM stock_pdv sp
JOIN catalogue c ON sp.article_id = c.id
LEFT JOIN categories_catalogue cc ON c.categorie_id = cc.id
LEFT JOIN unites u ON c.unite_id = u.id
JOIN points_de_vente pdv ON sp.point_vente_id = pdv.id
WHERE c.statut = 'actif' AND pdv.statut = 'actif';

-- 9. Grant permissions sur la vue
GRANT SELECT ON vue_stock_pdv_complet TO authenticated;
GRANT SELECT ON vue_stock_pdv_complet TO anon;