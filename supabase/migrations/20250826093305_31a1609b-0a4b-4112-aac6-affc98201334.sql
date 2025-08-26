-- Création d'index manquants pour optimiser les performances

-- Index sur les requêtes fréquentes de catalogue
CREATE INDEX IF NOT EXISTS idx_catalogue_statut_nom ON public.catalogue(statut, nom) WHERE statut = 'actif';
CREATE INDEX IF NOT EXISTS idx_catalogue_reference ON public.catalogue(reference);

-- Index sur les requêtes de stock
CREATE INDEX IF NOT EXISTS idx_stock_principal_article_id ON public.stock_principal(article_id);
CREATE INDEX IF NOT EXISTS idx_stock_principal_entrepot_id ON public.stock_principal(entrepot_id);
CREATE INDEX IF NOT EXISTS idx_stock_principal_quantite ON public.stock_principal(quantite_disponible) WHERE quantite_disponible > 0;
CREATE INDEX IF NOT EXISTS idx_stock_principal_derniere_entree ON public.stock_principal(derniere_entree DESC);

CREATE INDEX IF NOT EXISTS idx_stock_pdv_article_id ON public.stock_pdv(article_id);
CREATE INDEX IF NOT EXISTS idx_stock_pdv_point_vente_id ON public.stock_pdv(point_vente_id);
CREATE INDEX IF NOT EXISTS idx_stock_pdv_quantite ON public.stock_pdv(quantite_disponible) WHERE quantite_disponible > 0;
CREATE INDEX IF NOT EXISTS idx_stock_pdv_derniere_livraison ON public.stock_pdv(derniere_livraison DESC);

-- Index sur les entrepôts et PDV
CREATE INDEX IF NOT EXISTS idx_entrepots_statut_nom ON public.entrepots(statut, nom) WHERE statut = 'actif';
CREATE INDEX IF NOT EXISTS idx_points_de_vente_statut_nom ON public.points_de_vente(statut, nom) WHERE statut = 'actif';

-- Index sur les clients
CREATE INDEX IF NOT EXISTS idx_clients_statut_nom ON public.clients(statut_client, nom) WHERE statut_client IN ('actif', 'particulier');

-- Index sur les utilisateurs internes
CREATE INDEX IF NOT EXISTS idx_utilisateurs_internes_statut ON public.utilisateurs_internes(statut) WHERE statut = 'actif';
CREATE INDEX IF NOT EXISTS idx_utilisateurs_internes_user_id ON public.utilisateurs_internes(user_id);

-- Index sur les permissions et rôles
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON public.role_permissions(permission_id);

-- Optimisation des requêtes de factures
CREATE INDEX IF NOT EXISTS idx_factures_vente_client_id ON public.factures_vente(client_id);
CREATE INDEX IF NOT EXISTS idx_factures_vente_date ON public.factures_vente(date_facture DESC);
CREATE INDEX IF NOT EXISTS idx_lignes_facture_vente_facture_id ON public.lignes_facture_vente(facture_vente_id);
CREATE INDEX IF NOT EXISTS idx_lignes_facture_vente_article_id ON public.lignes_facture_vente(article_id);

-- Analyse des tables pour mettre à jour les statistiques
ANALYZE public.catalogue;
ANALYZE public.stock_principal;
ANALYZE public.stock_pdv;
ANALYZE public.entrepots;
ANALYZE public.points_de_vente;
ANALYZE public.clients;
ANALYZE public.utilisateurs_internes;
ANALYZE public.factures_vente;
ANALYZE public.lignes_facture_vente;