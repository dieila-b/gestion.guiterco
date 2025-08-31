
-- Création des vues manquantes pour le stock entrepôt
CREATE OR REPLACE VIEW vue_stock_entrepot AS
SELECT 
    sp.id,
    sp.article_id,
    sp.entrepot_id,
    sp.quantite_disponible,
    sp.quantite_reservee,
    sp.derniere_entree,
    c.nom as article_nom,
    c.reference,
    c.prix_vente,
    c.prix_achat,
    c.prix_unitaire,
    e.nom as entrepot_nom,
    e.adresse as entrepot_adresse,
    (sp.quantite_disponible * COALESCE(c.prix_vente, c.prix_unitaire, 0)) as valeur_totale,
    cat.nom as categorie_nom,
    cat.couleur as categorie_couleur,
    u.nom as unite_nom,
    u.symbole as unite_symbole
FROM stock_principal sp
LEFT JOIN catalogue c ON sp.article_id = c.id
LEFT JOIN entrepots e ON sp.entrepot_id = e.id
LEFT JOIN categories_catalogue cat ON c.categorie_id = cat.id
LEFT JOIN unites u ON c.unite_id = u.id
WHERE sp.quantite_disponible > 0;

-- Création des vues manquantes pour le stock PDV
CREATE OR REPLACE VIEW vue_stock_pdv AS
SELECT 
    spv.id,
    spv.article_id,
    spv.point_vente_id,
    spv.quantite_disponible,
    spv.quantite_minimum,
    spv.derniere_livraison,
    c.nom as article_nom,
    c.reference,
    c.prix_vente,
    c.prix_achat,
    c.prix_unitaire,
    pdv.nom as pdv_nom,
    pdv.type_pdv,
    pdv.adresse as pdv_adresse,
    (spv.quantite_disponible * COALESCE(c.prix_vente, c.prix_unitaire, 0)) as valeur_totale,
    cat.nom as categorie_nom,
    cat.couleur as categorie_couleur,
    u.nom as unite_nom,
    u.symbole as unite_symbole
FROM stock_pdv spv
LEFT JOIN catalogue c ON spv.article_id = c.id
LEFT JOIN points_de_vente pdv ON spv.point_vente_id = pdv.id
LEFT JOIN categories_catalogue cat ON c.categorie_id = cat.id
LEFT JOIN unites u ON c.unite_id = u.id
WHERE spv.quantite_disponible > 0;

-- Création des fonctions pour les statistiques
CREATE OR REPLACE FUNCTION get_stock_entrepot_stats()
RETURNS TABLE(
    total_articles bigint,
    valeur_totale numeric,
    entrepots_actifs bigint
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        COUNT(*) as total_articles,
        COALESCE(SUM(sp.quantite_disponible * COALESCE(c.prix_vente, c.prix_unitaire, 0)), 0) as valeur_totale,
        COUNT(DISTINCT sp.entrepot_id) as entrepots_actifs
    FROM stock_principal sp
    JOIN catalogue c ON sp.article_id = c.id
    WHERE sp.quantite_disponible > 0;
$$;

CREATE OR REPLACE FUNCTION get_stock_pdv_stats()
RETURNS TABLE(
    total_articles bigint,
    valeur_totale numeric,
    pdv_actifs bigint
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        COUNT(*) as total_articles,
        COALESCE(SUM(spv.quantite_disponible * COALESCE(c.prix_vente, c.prix_unitaire, 0)), 0) as valeur_totale,
        COUNT(DISTINCT spv.point_vente_id) as pdv_actifs
    FROM stock_pdv spv
    JOIN catalogue c ON spv.article_id = c.id
    WHERE spv.quantite_disponible > 0;
$$;

-- Ajout des politiques RLS manquantes pour les vues
ALTER TABLE IF EXISTS vue_stock_entrepot ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS vue_stock_pdv ENABLE ROW LEVEL SECURITY;

-- Politiques pour vue_stock_entrepot
DROP POLICY IF EXISTS "Allow all operations on vue_stock_entrepot" ON vue_stock_entrepot;
CREATE POLICY "Allow all operations on vue_stock_entrepot" ON vue_stock_entrepot FOR ALL USING (true);

-- Politiques pour vue_stock_pdv  
DROP POLICY IF EXISTS "Allow all operations on vue_stock_pdv" ON vue_stock_pdv;
CREATE POLICY "Allow all operations on vue_stock_pdv" ON vue_stock_pdv FOR ALL USING (true);

-- Vérification et correction des clés étrangères manquantes
DO $$
BEGIN
    -- Vérifier et ajouter la clé étrangère stock_principal -> catalogue
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'stock_principal_article_id_fkey'
    ) THEN
        ALTER TABLE stock_principal 
        ADD CONSTRAINT stock_principal_article_id_fkey 
        FOREIGN KEY (article_id) REFERENCES catalogue(id);
    END IF;

    -- Vérifier et ajouter la clé étrangère stock_principal -> entrepots
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'stock_principal_entrepot_id_fkey'
    ) THEN
        ALTER TABLE stock_principal 
        ADD CONSTRAINT stock_principal_entrepot_id_fkey 
        FOREIGN KEY (entrepot_id) REFERENCES entrepots(id);
    END IF;

    -- Vérifier et ajouter la clé étrangère stock_pdv -> catalogue
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'stock_pdv_article_id_fkey'
    ) THEN
        ALTER TABLE stock_pdv 
        ADD CONSTRAINT stock_pdv_article_id_fkey 
        FOREIGN KEY (article_id) REFERENCES catalogue(id);
    END IF;

    -- Vérifier et ajouter la clé étrangère stock_pdv -> points_de_vente
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'stock_pdv_point_vente_id_fkey'
    ) THEN
        ALTER TABLE stock_pdv 
        ADD CONSTRAINT stock_pdv_point_vente_id_fkey 
        FOREIGN KEY (point_vente_id) REFERENCES points_de_vente(id);
    END IF;

    -- Vérifier et ajouter la clé étrangère catalogue -> categories_catalogue
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'catalogue_categorie_id_fkey'
    ) THEN
        ALTER TABLE catalogue 
        ADD CONSTRAINT catalogue_categorie_id_fkey 
        FOREIGN KEY (categorie_id) REFERENCES categories_catalogue(id);
    END IF;

    -- Vérifier et ajouter la clé étrangère catalogue -> unites
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'catalogue_unite_id_fkey'
    ) THEN
        ALTER TABLE catalogue 
        ADD CONSTRAINT catalogue_unite_id_fkey 
        FOREIGN KEY (unite_id) REFERENCES unites(id);
    END IF;
END $$;

-- Mise à jour des politiques RLS pour garantir l'accès aux données
DROP POLICY IF EXISTS "ULTRA_PERMISSIVE_stock_principal" ON stock_principal;
CREATE POLICY "ULTRA_PERMISSIVE_stock_principal" ON stock_principal FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "ULTRA_PERMISSIVE_stock_pdv" ON stock_pdv;  
CREATE POLICY "ULTRA_PERMISSIVE_stock_pdv" ON stock_pdv FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "ULTRA_PERMISSIVE_entrepots" ON entrepots;
CREATE POLICY "ULTRA_PERMISSIVE_entrepots" ON entrepots FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "ULTRA_PERMISSIVE_points_de_vente" ON points_de_vente;
CREATE POLICY "ULTRA_PERMISSIVE_points_de_vente" ON points_de_vente FOR ALL USING (true) WITH CHECK (true);
