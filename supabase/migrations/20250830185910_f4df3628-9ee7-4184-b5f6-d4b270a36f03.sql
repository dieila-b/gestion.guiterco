
-- Créer une vue consolidée pour le stock entrepôt avec toutes les informations nécessaires
CREATE OR REPLACE VIEW vue_stock_entrepot AS
SELECT 
    sp.id,
    sp.article_id,
    sp.entrepot_id,
    sp.quantite_disponible,
    sp.quantite_reservee,
    sp.derniere_entree,
    sp.created_at,
    sp.updated_at,
    -- Informations article
    c.nom as article_nom,
    c.reference,
    c.prix_vente,
    c.prix_achat,
    c.prix_unitaire,
    c.categorie,
    c.unite_mesure,
    -- Informations entrepôt
    e.nom as entrepot_nom,
    e.adresse as entrepot_adresse,
    -- Calculs
    (sp.quantite_disponible * COALESCE(c.prix_vente, c.prix_unitaire, 0)) as valeur_totale,
    -- Informations catégorie
    cat.nom as categorie_nom,
    cat.couleur as categorie_couleur,
    -- Informations unité
    u.nom as unite_nom,
    u.symbole as unite_symbole
FROM stock_principal sp
LEFT JOIN catalogue c ON sp.article_id = c.id
LEFT JOIN entrepots e ON sp.entrepot_id = e.id
LEFT JOIN categories_catalogue cat ON c.categorie_id = cat.id
LEFT JOIN unites u ON c.unite_id = u.id
WHERE sp.quantite_disponible > 0
ORDER BY e.nom, c.nom;

-- Créer une vue consolidée pour le stock PDV avec toutes les informations nécessaires
CREATE OR REPLACE VIEW vue_stock_pdv AS
SELECT 
    spv.id,
    spv.article_id,
    spv.point_vente_id,
    spv.quantite_disponible,
    spv.quantite_minimum,
    spv.derniere_livraison,
    spv.created_at,
    spv.updated_at,
    -- Informations article
    c.nom as article_nom,
    c.reference,
    c.prix_vente,
    c.prix_achat,
    c.prix_unitaire,
    c.categorie,
    c.unite_mesure,
    -- Informations point de vente
    pdv.nom as pdv_nom,
    pdv.type_pdv,
    pdv.adresse as pdv_adresse,
    -- Calculs
    (spv.quantite_disponible * COALESCE(c.prix_vente, c.prix_unitaire, 0)) as valeur_totale,
    -- Informations catégorie
    cat.nom as categorie_nom,
    cat.couleur as categorie_couleur,
    -- Informations unité
    u.nom as unite_nom,
    u.symbole as unite_symbole
FROM stock_pdv spv
LEFT JOIN catalogue c ON spv.article_id = c.id
LEFT JOIN points_de_vente pdv ON spv.point_vente_id = pdv.id
LEFT JOIN categories_catalogue cat ON c.categorie_id = cat.id
LEFT JOIN unites u ON c.unite_id = u.id
WHERE spv.quantite_disponible > 0
ORDER BY pdv.nom, c.nom;

-- Fonction pour obtenir les statistiques du stock entrepôt
CREATE OR REPLACE FUNCTION get_stock_entrepot_stats()
RETURNS TABLE(
    total_articles INTEGER,
    valeur_totale NUMERIC,
    entrepots_actifs INTEGER
) 
LANGUAGE SQL
STABLE
AS $$
    SELECT 
        COUNT(*)::INTEGER as total_articles,
        COALESCE(SUM(valeur_totale), 0) as valeur_totale,
        COUNT(DISTINCT entrepot_id)::INTEGER as entrepots_actifs
    FROM vue_stock_entrepot;
$$;

-- Fonction pour obtenir les statistiques du stock PDV
CREATE OR REPLACE FUNCTION get_stock_pdv_stats()
RETURNS TABLE(
    total_articles INTEGER,
    valeur_totale NUMERIC,
    pdv_actifs INTEGER
) 
LANGUAGE SQL
STABLE
AS $$
    SELECT 
        COUNT(*)::INTEGER as total_articles,
        COALESCE(SUM(valeur_totale), 0) as valeur_totale,
        COUNT(DISTINCT point_vente_id)::INTEGER as pdv_actifs
    FROM vue_stock_pdv;
$$;

-- Mise à jour des politiques RLS pour les vues
ALTER TABLE vue_stock_entrepot ENABLE ROW LEVEL SECURITY;
ALTER TABLE vue_stock_pdv ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour vue_stock_entrepot
CREATE POLICY "Utilisateurs authentifiés peuvent voir stock entrepôt"
ON vue_stock_entrepot FOR SELECT
TO authenticated
USING (true);

-- Politiques RLS pour vue_stock_pdv  
CREATE POLICY "Utilisateurs authentifiés peuvent voir stock PDV"
ON vue_stock_pdv FOR SELECT
TO authenticated
USING (true);

-- Ajouter des index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_stock_principal_article_entrepot ON stock_principal(article_id, entrepot_id);
CREATE INDEX IF NOT EXISTS idx_stock_pdv_article_point_vente ON stock_pdv(article_id, point_vente_id);
CREATE INDEX IF NOT EXISTS idx_catalogue_reference ON catalogue(reference);
CREATE INDEX IF NOT EXISTS idx_catalogue_categorie ON catalogue(categorie_id);
