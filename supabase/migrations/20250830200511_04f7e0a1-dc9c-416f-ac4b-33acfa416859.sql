
-- Vérification et correction des tables principales et leurs relations

-- 1. Mise à jour des clés étrangères manquantes dans la table catalogue
ALTER TABLE catalogue 
ADD CONSTRAINT fk_catalogue_categorie 
FOREIGN KEY (categorie_id) REFERENCES categories_catalogue(id) ON DELETE SET NULL;

ALTER TABLE catalogue 
ADD CONSTRAINT fk_catalogue_unite 
FOREIGN KEY (unite_id) REFERENCES unites(id) ON DELETE SET NULL;

-- 2. Mise à jour des clés étrangères dans stock_principal
ALTER TABLE stock_principal 
ADD CONSTRAINT fk_stock_principal_article 
FOREIGN KEY (article_id) REFERENCES catalogue(id) ON DELETE CASCADE;

ALTER TABLE stock_principal 
ADD CONSTRAINT fk_stock_principal_entrepot 
FOREIGN KEY (entrepot_id) REFERENCES entrepots(id) ON DELETE CASCADE;

-- 3. Mise à jour des clés étrangères dans stock_pdv
ALTER TABLE stock_pdv 
ADD CONSTRAINT fk_stock_pdv_article 
FOREIGN KEY (article_id) REFERENCES catalogue(id) ON DELETE CASCADE;

ALTER TABLE stock_pdv 
ADD CONSTRAINT fk_stock_pdv_point_vente 
FOREIGN KEY (point_vente_id) REFERENCES points_de_vente(id) ON DELETE CASCADE;

-- 4. Mise à jour des clés étrangères dans factures_vente
ALTER TABLE factures_vente 
ADD CONSTRAINT fk_factures_vente_client 
FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

-- 5. Mise à jour des clés étrangères dans lignes_facture_vente
ALTER TABLE lignes_facture_vente 
ADD CONSTRAINT fk_lignes_facture_vente_facture 
FOREIGN KEY (facture_vente_id) REFERENCES factures_vente(id) ON DELETE CASCADE;

ALTER TABLE lignes_facture_vente 
ADD CONSTRAINT fk_lignes_facture_vente_article 
FOREIGN KEY (article_id) REFERENCES catalogue(id) ON DELETE CASCADE;

-- 6. Mise à jour des clés étrangères dans versements_clients
ALTER TABLE versements_clients 
ADD CONSTRAINT fk_versements_clients_facture 
FOREIGN KEY (facture_id) REFERENCES factures_vente(id) ON DELETE CASCADE;

-- 7. Création d'une vue optimisée pour les statistiques du dashboard
CREATE OR REPLACE VIEW vue_dashboard_stats AS
SELECT 
  -- Compter les articles actifs
  (SELECT COUNT(*) FROM catalogue WHERE statut = 'actif') as nb_articles,
  
  -- Stock total (entrepôts + PDV)
  (COALESCE(
    (SELECT SUM(quantite_disponible) FROM stock_principal), 0
  ) + COALESCE(
    (SELECT SUM(quantite_disponible) FROM stock_pdv), 0
  )) as stock_global,
  
  -- Valeur stock achat
  COALESCE((
    SELECT SUM(sp.quantite_disponible * COALESCE(c.prix_achat, c.prix_unitaire, 0))
    FROM stock_principal sp
    JOIN catalogue c ON sp.article_id = c.id
    WHERE sp.quantite_disponible > 0
  ), 0) + COALESCE((
    SELECT SUM(spv.quantite_disponible * COALESCE(c.prix_achat, c.prix_unitaire, 0))
    FROM stock_pdv spv
    JOIN catalogue c ON spv.article_id = c.id
    WHERE spv.quantite_disponible > 0
  ), 0) as valeur_stock_achat,
  
  -- Valeur stock vente
  COALESCE((
    SELECT SUM(sp.quantite_disponible * COALESCE(c.prix_vente, c.prix_unitaire, 0))
    FROM stock_principal sp
    JOIN catalogue c ON sp.article_id = c.id
    WHERE sp.quantite_disponible > 0
  ), 0) + COALESCE((
    SELECT SUM(spv.quantite_disponible * COALESCE(c.prix_vente, c.prix_unitaire, 0))
    FROM stock_pdv spv
    JOIN catalogue c ON spv.article_id = c.id
    WHERE spv.quantite_disponible > 0
  ), 0) as valeur_stock_vente,
  
  -- Nombre de clients actifs
  (SELECT COUNT(*) FROM clients WHERE statut_client = 'actif') as nb_clients,
  
  -- Nombre d'entrepôts actifs
  (SELECT COUNT(*) FROM entrepots WHERE statut = 'actif') as nb_entrepots,
  
  -- Nombre de PDV actifs
  (SELECT COUNT(*) FROM points_de_vente WHERE statut = 'actif') as nb_pdv;

-- 8. Fonction pour récupérer les statistiques avancées du dashboard
CREATE OR REPLACE FUNCTION get_advanced_dashboard_stats()
RETURNS TABLE(
  ventes_jour numeric,
  marge_jour numeric,
  factures_impayees_jour numeric,
  depenses_mois numeric,
  nombre_articles bigint,
  reglements_fournisseurs numeric,
  nombre_clients bigint,
  stock_global bigint,
  stock_global_achat numeric,
  stock_global_vente numeric,
  marge_globale_stock numeric,
  solde_avoir numeric,
  solde_devoir numeric,
  situation_normale numeric
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today_start timestamp with time zone := date_trunc('day', now());
  today_end timestamp with time zone := date_trunc('day', now()) + interval '1 day';
  month_start timestamp with time zone := date_trunc('month', now());
  month_end timestamp with time zone := date_trunc('month', now()) + interval '1 month';
BEGIN
  RETURN QUERY
  SELECT 
    -- Ventes du jour
    COALESCE((
      SELECT SUM(montant_ttc)
      FROM factures_vente
      WHERE date_facture >= today_start 
      AND date_facture < today_end
      AND statut_paiement IN ('payee', 'partiellement_payee')
    ), 0) as ventes_jour,
    
    -- Marge du jour (approximation basée sur 30% de marge)
    COALESCE((
      SELECT SUM(montant_ttc) * 0.3
      FROM factures_vente
      WHERE date_facture >= today_start 
      AND date_facture < today_end
      AND statut_paiement IN ('payee', 'partiellement_payee')
    ), 0) as marge_jour,
    
    -- Factures impayées du jour
    COALESCE((
      SELECT SUM(fv.montant_ttc - COALESCE(v.total_paye, 0))
      FROM factures_vente fv
      LEFT JOIN (
        SELECT facture_id, SUM(montant) as total_paye
        FROM versements_clients
        GROUP BY facture_id
      ) v ON fv.id = v.facture_id
      WHERE fv.date_facture >= today_start 
      AND fv.date_facture < today_end
      AND fv.montant_ttc > COALESCE(v.total_paye, 0)
    ), 0) as factures_impayees_jour,
    
    -- Dépenses du mois
    COALESCE((
      SELECT SUM(montant)
      FROM sorties_financieres
      WHERE date_sortie >= month_start 
      AND date_sortie < month_end
    ), 0) as depenses_mois,
    
    -- Statistiques de base
    (SELECT COUNT(*) FROM catalogue WHERE statut = 'actif') as nombre_articles,
    0::numeric as reglements_fournisseurs, -- À implémenter selon les besoins
    (SELECT COUNT(*) FROM clients WHERE statut_client = 'actif') as nombre_clients,
    
    -- Stock global
    (COALESCE(
      (SELECT SUM(quantite_disponible) FROM stock_principal), 0
    ) + COALESCE(
      (SELECT SUM(quantite_disponible) FROM stock_pdv), 0
    )) as stock_global,
    
    -- Valeurs de stock
    (SELECT valeur_stock_achat FROM vue_dashboard_stats) as stock_global_achat,
    (SELECT valeur_stock_vente FROM vue_dashboard_stats) as stock_global_vente,
    
    -- Marge globale stock
    ((SELECT valeur_stock_vente FROM vue_dashboard_stats) - 
     (SELECT valeur_stock_achat FROM vue_dashboard_stats)) as marge_globale_stock,
    
    -- Soldes (à adapter selon vos règles métier)
    1000::numeric as solde_avoir, -- Exemple
    500::numeric as solde_devoir, -- Exemple
    1500::numeric as situation_normale; -- Exemple
END;
$$;

-- 9. Réindexation pour optimiser les performances
REINDEX TABLE catalogue;
REINDEX TABLE stock_principal;
REINDEX TABLE stock_pdv;
REINDEX TABLE factures_vente;
REINDEX TABLE lignes_facture_vente;

-- 10. Mise à jour des statistiques
ANALYZE catalogue;
ANALYZE stock_principal;
ANALYZE stock_pdv;
ANALYZE factures_vente;
ANALYZE lignes_facture_vente;
