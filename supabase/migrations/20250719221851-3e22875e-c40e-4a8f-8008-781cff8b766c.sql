-- SYNCHRONISATION GLOBALE DE LA BASE DE DONNÉES
-- ==============================================

-- 1. VÉRIFICATION ET CRÉATION DES TABLES MANQUANTES
-- ===================================================

-- Créer la table utilisateurs_internes si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.utilisateurs_internes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    matricule VARCHAR(10) UNIQUE,
    prenom VARCHAR(100) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telephone VARCHAR(20),
    poste VARCHAR(100),
    departement VARCHAR(100),
    statut VARCHAR(20) DEFAULT 'actif' CHECK (statut IN ('actif', 'inactif', 'suspendu')),
    date_embauche DATE,
    salaire NUMERIC(10,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Assurer l'existence des tables critiques avec les bonnes relations
DO $$
BEGIN
    -- Vérifier user_roles
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_roles' AND table_schema = 'public') THEN
        CREATE TABLE public.user_roles (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
            is_active BOOLEAN DEFAULT true,
            assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            assigned_by VARCHAR(255),
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            UNIQUE(user_id, role_id)
        );
    END IF;
    
    -- Assurer les colonnes manquantes dans user_roles
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user_roles' AND column_name = 'assigned_by') THEN
        ALTER TABLE public.user_roles ADD COLUMN assigned_by VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user_roles' AND column_name = 'assigned_at') THEN
        ALTER TABLE public.user_roles ADD COLUMN assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
END $$;

-- 2. AJOUT DES FOREIGN KEYS MANQUANTES
-- ====================================

-- Ajouter les foreign keys manquantes pour les articles
DO $$
BEGIN
    -- articles_bon_commande
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'fk_articles_bon_commande_article') THEN
        ALTER TABLE public.articles_bon_commande ADD CONSTRAINT fk_articles_bon_commande_article 
        FOREIGN KEY (article_id) REFERENCES public.catalogue(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'fk_articles_bon_commande_bon') THEN
        ALTER TABLE public.articles_bon_commande ADD CONSTRAINT fk_articles_bon_commande_bon 
        FOREIGN KEY (bon_commande_id) REFERENCES public.bons_de_commande(id) ON DELETE CASCADE;
    END IF;
    
    -- articles_bon_livraison
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'fk_articles_bon_livraison_article') THEN
        ALTER TABLE public.articles_bon_livraison ADD CONSTRAINT fk_articles_bon_livraison_article 
        FOREIGN KEY (article_id) REFERENCES public.catalogue(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'fk_articles_bon_livraison_bon') THEN
        ALTER TABLE public.articles_bon_livraison ADD CONSTRAINT fk_articles_bon_livraison_bon 
        FOREIGN KEY (bon_livraison_id) REFERENCES public.bons_de_livraison(id) ON DELETE CASCADE;
    END IF;
    
    -- entrees_stock
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'fk_entrees_stock_article') THEN
        ALTER TABLE public.entrees_stock ADD CONSTRAINT fk_entrees_stock_article 
        FOREIGN KEY (article_id) REFERENCES public.catalogue(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'fk_entrees_stock_entrepot') THEN
        ALTER TABLE public.entrees_stock ADD CONSTRAINT fk_entrees_stock_entrepot 
        FOREIGN KEY (entrepot_id) REFERENCES public.entrepots(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'fk_entrees_stock_pdv') THEN
        ALTER TABLE public.entrees_stock ADD CONSTRAINT fk_entrees_stock_pdv 
        FOREIGN KEY (point_vente_id) REFERENCES public.points_de_vente(id) ON DELETE SET NULL;
    END IF;
    
    -- catalogue foreign keys
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'fk_catalogue_categorie') THEN
        ALTER TABLE public.catalogue ADD CONSTRAINT fk_catalogue_categorie 
        FOREIGN KEY (categorie_id) REFERENCES public.categories_catalogue(id) ON DELETE SET NULL;
    END IF;
    
    -- bons_de_commande
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'fk_bons_commande_fournisseur') THEN
        ALTER TABLE public.bons_de_commande ADD CONSTRAINT fk_bons_commande_fournisseur 
        FOREIGN KEY (fournisseur_id) REFERENCES public.fournisseurs(id) ON DELETE SET NULL;
    END IF;
    
    -- bons_de_livraison
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'fk_bons_livraison_bon_commande') THEN
        ALTER TABLE public.bons_de_livraison ADD CONSTRAINT fk_bons_livraison_bon_commande 
        FOREIGN KEY (bon_commande_id) REFERENCES public.bons_de_commande(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'fk_bons_livraison_entrepot') THEN
        ALTER TABLE public.bons_de_livraison ADD CONSTRAINT fk_bons_livraison_entrepot 
        FOREIGN KEY (entrepot_destination_id) REFERENCES public.entrepots(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'fk_bons_livraison_pdv') THEN
        ALTER TABLE public.bons_de_livraison ADD CONSTRAINT fk_bons_livraison_pdv 
        FOREIGN KEY (point_vente_destination_id) REFERENCES public.points_de_vente(id) ON DELETE SET NULL;
    END IF;
    
    -- factures_vente
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'fk_factures_vente_client') THEN
        ALTER TABLE public.factures_vente ADD CONSTRAINT fk_factures_vente_client 
        FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'fk_factures_vente_commande') THEN
        ALTER TABLE public.factures_vente ADD CONSTRAINT fk_factures_vente_commande 
        FOREIGN KEY (commande_id) REFERENCES public.commandes_clients(id) ON DELETE SET NULL;
    END IF;
    
    -- lignes_facture_vente
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'fk_lignes_facture_vente_article') THEN
        ALTER TABLE public.lignes_facture_vente ADD CONSTRAINT fk_lignes_facture_vente_article 
        FOREIGN KEY (article_id) REFERENCES public.catalogue(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'fk_lignes_facture_vente_facture') THEN
        ALTER TABLE public.lignes_facture_vente ADD CONSTRAINT fk_lignes_facture_vente_facture 
        FOREIGN KEY (facture_vente_id) REFERENCES public.factures_vente(id) ON DELETE CASCADE;
    END IF;
    
    -- precommandes
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'fk_precommandes_client') THEN
        ALTER TABLE public.precommandes ADD CONSTRAINT fk_precommandes_client 
        FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'fk_precommandes_bon_livraison') THEN
        ALTER TABLE public.precommandes ADD CONSTRAINT fk_precommandes_bon_livraison 
        FOREIGN KEY (bon_livraison_id) REFERENCES public.bons_de_livraison(id) ON DELETE SET NULL;
    END IF;
    
    -- lignes_precommande
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'fk_lignes_precommande_article') THEN
        ALTER TABLE public.lignes_precommande ADD CONSTRAINT fk_lignes_precommande_article 
        FOREIGN KEY (article_id) REFERENCES public.catalogue(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'fk_lignes_precommande_precommande') THEN
        ALTER TABLE public.lignes_precommande ADD CONSTRAINT fk_lignes_precommande_precommande 
        FOREIGN KEY (precommande_id) REFERENCES public.precommandes(id) ON DELETE CASCADE;
    END IF;
    
    -- cash_operations
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'fk_cash_operations_utilisateur') THEN
        ALTER TABLE public.cash_operations ADD CONSTRAINT fk_cash_operations_utilisateur 
        FOREIGN KEY (utilisateur_id) REFERENCES public.utilisateurs_internes(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'fk_cash_operations_pdv') THEN
        ALTER TABLE public.cash_operations ADD CONSTRAINT fk_cash_operations_pdv 
        FOREIGN KEY (point_vente_id) REFERENCES public.points_de_vente(id) ON DELETE CASCADE;
    END IF;
    
    -- clotures_caisse
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'fk_clotures_caisse_register') THEN
        ALTER TABLE public.clotures_caisse ADD CONSTRAINT fk_clotures_caisse_register 
        FOREIGN KEY (cash_register_id) REFERENCES public.cash_registers(id) ON DELETE CASCADE;
    END IF;
    
    -- comptages_caisse
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'fk_comptages_caisse_register') THEN
        ALTER TABLE public.comptages_caisse ADD CONSTRAINT fk_comptages_caisse_register 
        FOREIGN KEY (cash_register_id) REFERENCES public.cash_registers(id) ON DELETE CASCADE;
    END IF;
    
    -- etats_caisse
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'fk_etats_caisse_register') THEN
        ALTER TABLE public.etats_caisse ADD CONSTRAINT fk_etats_caisse_register 
        FOREIGN KEY (cash_register_id) REFERENCES public.cash_registers(id) ON DELETE CASCADE;
    END IF;
    
END $$;

-- 3. ACTIVATION DU RLS SUR TOUTES LES TABLES
-- ==========================================

-- Activer RLS sur toutes les tables principales
ALTER TABLE public.articles_bon_commande ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles_bon_livraison ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles_facture_achat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles_retour_client ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bons_de_commande ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bons_de_livraison ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories_catalogue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories_depenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories_financieres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commandes_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devis_vente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.factures_achat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.factures_precommandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fournisseurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lignes_commande ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lignes_devis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livraison_statut ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications_precommandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paiements_vente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reglements_achat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repartition_frais_bc ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retours_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retours_fournisseurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utilisateurs_internes ENABLE ROW LEVEL SECURITY;

-- 4. CRÉATION DES POLITIQUES RLS GLOBALES
-- =======================================

-- Politique globale pour les utilisateurs internes authentifiés
DO $$
DECLARE
    table_name text;
    tables_to_secure text[] := ARRAY[
        'articles_bon_commande', 'articles_bon_livraison', 'articles_facture_achat', 
        'articles_retour_client', 'bons_de_commande', 'bons_de_livraison', 
        'categories_catalogue', 'commandes_clients', 'devis_vente', 
        'factures_achat', 'factures_precommandes', 'fournisseurs', 
        'lignes_commande', 'lignes_devis', 'livraison_statut', 
        'notifications_precommandes', 'paiements_vente', 'pays', 
        'reglements_achat', 'repartition_frais_bc', 'retours_clients', 
        'retours_fournisseurs'
    ];
BEGIN
    FOREACH table_name IN ARRAY tables_to_secure
    LOOP
        -- Supprimer les anciennes politiques
        EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can access %s" ON public.%I', table_name, table_name);
        
        -- Créer les nouvelles politiques permissives
        EXECUTE format('CREATE POLICY "Authenticated users can access %s" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', table_name, table_name);
    END LOOP;
END $$;

-- Politiques spéciales pour utilisateurs_internes
DROP POLICY IF EXISTS "Users can view their own profile" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.utilisateurs_internes;
DROP POLICY IF EXISTS "Authenticated users can view all internal users" ON public.utilisateurs_internes;

CREATE POLICY "Authenticated users can view all internal users" 
ON public.utilisateurs_internes 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.utilisateurs_internes 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create internal users" 
ON public.utilisateurs_internes 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete internal users" 
ON public.utilisateurs_internes 
FOR DELETE 
TO authenticated 
USING (true);

-- 5. VUES MATÉRIALISÉES POUR LES PERMISSIONS
-- ==========================================

-- Créer ou recréer la vue des permissions utilisateurs
DROP VIEW IF EXISTS public.vue_permissions_utilisateurs CASCADE;
CREATE VIEW public.vue_permissions_utilisateurs AS
SELECT 
    ur.user_id,
    p.menu,
    p.submenu,
    p.action,
    rp.can_access,
    ui.prenom,
    ui.nom,
    ui.email,
    r.name as role_name
FROM public.user_roles ur
JOIN public.roles r ON ur.role_id = r.id
JOIN public.role_permissions rp ON r.id = rp.role_id
JOIN public.permissions p ON rp.permission_id = p.id
LEFT JOIN public.utilisateurs_internes ui ON ur.user_id = ui.user_id
WHERE ur.is_active = true
AND rp.can_access = true;

-- Vue pour les marges globales de stock
DROP VIEW IF EXISTS public.vue_marges_globales_stock CASCADE;
CREATE VIEW public.vue_marges_globales_stock AS
SELECT 
    c.id,
    c.nom as article_nom,
    c.prix_achat,
    c.prix_vente,
    COALESCE(sp.quantite_disponible, 0) + COALESCE(spv.quantite_disponible, 0) as stock_total,
    CASE 
        WHEN c.prix_achat > 0 AND c.prix_vente > 0 
        THEN (COALESCE(sp.quantite_disponible, 0) + COALESCE(spv.quantite_disponible, 0)) * c.prix_achat
        ELSE 0
    END as valeur_stock_cout,
    CASE 
        WHEN c.prix_vente > 0 
        THEN (COALESCE(sp.quantite_disponible, 0) + COALESCE(spv.quantite_disponible, 0)) * c.prix_vente
        ELSE 0
    END as valeur_stock_vente,
    CASE 
        WHEN c.prix_achat > 0 AND c.prix_vente > 0 
        THEN (COALESCE(sp.quantite_disponible, 0) + COALESCE(spv.quantite_disponible, 0)) * (c.prix_vente - c.prix_achat)
        ELSE 0
    END as marge_totale_article
FROM public.catalogue c
LEFT JOIN public.stock_principal sp ON c.id = sp.article_id
LEFT JOIN public.stock_pdv spv ON c.id = spv.article_id
WHERE c.statut = 'actif';

-- Vue pour les marges des articles
DROP VIEW IF EXISTS public.vue_marges_articles CASCADE;
CREATE VIEW public.vue_marges_articles AS
SELECT 
    c.id,
    c.nom,
    c.prix_achat,
    c.prix_vente,
    COALESCE(c.frais_logistique, 0) + COALESCE(c.frais_douane, 0) + COALESCE(c.frais_transport, 0) + COALESCE(c.autres_frais, 0) as frais_totaux,
    c.prix_achat + COALESCE(c.frais_logistique, 0) + COALESCE(c.frais_douane, 0) + COALESCE(c.frais_transport, 0) + COALESCE(c.autres_frais, 0) as cout_total_unitaire,
    CASE 
        WHEN c.prix_vente > 0 AND c.prix_achat > 0 
        THEN c.prix_vente - (c.prix_achat + COALESCE(c.frais_logistique, 0) + COALESCE(c.frais_douane, 0) + COALESCE(c.frais_transport, 0) + COALESCE(c.autres_frais, 0))
        ELSE 0
    END as marge_unitaire,
    CASE 
        WHEN c.prix_achat > 0 
        THEN ROUND(((c.prix_vente - (c.prix_achat + COALESCE(c.frais_logistique, 0) + COALESCE(c.frais_douane, 0) + COALESCE(c.frais_transport, 0) + COALESCE(c.autres_frais, 0))) / (c.prix_achat + COALESCE(c.frais_logistique, 0) + COALESCE(c.frais_douane, 0) + COALESCE(c.frais_transport, 0) + COALESCE(c.autres_frais, 0))) * 100, 2)
        ELSE 0
    END as taux_marge
FROM public.catalogue c
WHERE c.statut = 'actif';

-- 6. CRÉER LES TABLES DE STOCK SI ELLES N'EXISTENT PAS
-- ====================================================

CREATE TABLE IF NOT EXISTS public.stock_principal (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID NOT NULL REFERENCES public.catalogue(id) ON DELETE CASCADE,
    entrepot_id UUID NOT NULL REFERENCES public.entrepots(id) ON DELETE CASCADE,
    quantite_disponible INTEGER NOT NULL DEFAULT 0,
    quantite_reservee INTEGER DEFAULT 0,
    seuil_alerte INTEGER DEFAULT 10,
    derniere_entree TIMESTAMP WITH TIME ZONE,
    derniere_sortie TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(article_id, entrepot_id)
);

CREATE TABLE IF NOT EXISTS public.stock_pdv (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID NOT NULL REFERENCES public.catalogue(id) ON DELETE CASCADE,
    point_vente_id UUID NOT NULL REFERENCES public.points_de_vente(id) ON DELETE CASCADE,
    quantite_disponible INTEGER NOT NULL DEFAULT 0,
    quantite_reservee INTEGER DEFAULT 0,
    seuil_alerte INTEGER DEFAULT 5,
    derniere_livraison TIMESTAMP WITH TIME ZONE,
    derniere_vente TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(article_id, point_vente_id)
);

-- Activer RLS sur les tables de stock
ALTER TABLE public.stock_principal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_pdv ENABLE ROW LEVEL SECURITY;

-- Politiques pour les tables de stock
CREATE POLICY "Authenticated users can access stock_principal" ON public.stock_principal FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can access stock_pdv" ON public.stock_pdv FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. FONCTION POUR VÉRIFIER LES PERMISSIONS UTILISATEURS
-- ======================================================

-- Fonction sécurisée pour vérifier si un utilisateur interne est actif
CREATE OR REPLACE FUNCTION public.is_internal_user_active(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.utilisateurs_internes 
        WHERE user_id = check_user_id 
        AND statut = 'actif'
    );
$$;

-- 8. TRIGGERS POUR LA SYNCHRONISATION
-- ===================================

-- Trigger pour la mise à jour automatique des timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger sur toutes les tables avec updated_at
DO $$
DECLARE
    table_name text;
    tables_with_updated_at text[] := ARRAY[
        'utilisateurs_internes', 'user_roles', 'catalogue', 'stock_principal', 'stock_pdv',
        'bons_de_commande', 'bons_de_livraison', 'factures_vente', 'precommandes',
        'lignes_precommande', 'categories_catalogue', 'entrepots', 'points_de_vente'
    ];
BEGIN
    FOREACH table_name IN ARRAY tables_with_updated_at
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%s_updated_at ON public.%I', table_name, table_name);
        EXECUTE format('CREATE TRIGGER update_%s_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', table_name, table_name);
    END LOOP;
END $$;

-- 9. INDICES POUR OPTIMISER LES PERFORMANCES
-- ==========================================

-- Indices sur les foreign keys
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON public.role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_utilisateurs_internes_user_id ON public.utilisateurs_internes(user_id);
CREATE INDEX IF NOT EXISTS idx_utilisateurs_internes_email ON public.utilisateurs_internes(email);
CREATE INDEX IF NOT EXISTS idx_utilisateurs_internes_statut ON public.utilisateurs_internes(statut);

-- Indices sur les tables de stock
CREATE INDEX IF NOT EXISTS idx_stock_principal_article_id ON public.stock_principal(article_id);
CREATE INDEX IF NOT EXISTS idx_stock_principal_entrepot_id ON public.stock_principal(entrepot_id);
CREATE INDEX IF NOT EXISTS idx_stock_pdv_article_id ON public.stock_pdv(article_id);
CREATE INDEX IF NOT EXISTS idx_stock_pdv_point_vente_id ON public.stock_pdv(point_vente_id);

-- Indices sur les tables de vente et factures
CREATE INDEX IF NOT EXISTS idx_factures_vente_client_id ON public.factures_vente(client_id);
CREATE INDEX IF NOT EXISTS idx_factures_vente_date_facture ON public.factures_vente(date_facture);
CREATE INDEX IF NOT EXISTS idx_lignes_facture_vente_facture_id ON public.lignes_facture_vente(facture_vente_id);
CREATE INDEX IF NOT EXISTS idx_lignes_facture_vente_article_id ON public.lignes_facture_vente(article_id);

-- Indices sur les précommandes
CREATE INDEX IF NOT EXISTS idx_precommandes_client_id ON public.precommandes(client_id);
CREATE INDEX IF NOT EXISTS idx_precommandes_statut ON public.precommandes(statut);
CREATE INDEX IF NOT EXISTS idx_lignes_precommande_precommande_id ON public.lignes_precommande(precommande_id);
CREATE INDEX IF NOT EXISTS idx_lignes_precommande_article_id ON public.lignes_precommande(article_id);

-- 10. NETTOYAGE ET FINALISATION
-- =============================

-- Invalider le cache PostgREST pour forcer la mise à jour
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- Message de confirmation
SELECT 'SYNCHRONISATION GLOBALE TERMINÉE - Base de données maintenant alignée avec l''interface' as status;