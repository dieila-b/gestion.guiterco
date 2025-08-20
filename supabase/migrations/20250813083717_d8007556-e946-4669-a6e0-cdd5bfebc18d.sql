
-- Vérifier et créer la table livraison_statut si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.livraison_statut (
    id SERIAL PRIMARY KEY,
    nom TEXT NOT NULL
);

-- Insérer les statuts de livraison par défaut
INSERT INTO public.livraison_statut (id, nom) 
VALUES 
    (1, 'En attente'),
    (2, 'Partiellement livrée'),
    (3, 'Livrée')
ON CONFLICT (id) DO NOTHING;

-- Vérifier et créer la table menus si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom TEXT NOT NULL,
    icone TEXT,
    ordre INTEGER DEFAULT 0,
    statut TEXT DEFAULT 'actif',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Vérifier et créer la table permissions si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_id UUID REFERENCES public.menus(id),
    sous_menu_id UUID,
    menu CHARACTER VARYING NOT NULL,
    submenu CHARACTER VARYING,
    action CHARACTER VARYING NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Vérifier et créer la table password_reset_requests si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.password_reset_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    new_password_hash TEXT NOT NULL,
    require_change BOOLEAN DEFAULT false,
    used BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '1 hour'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Vérifier et créer la table paiements_vente si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.paiements_vente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facture_vente_id UUID NOT NULL REFERENCES public.factures_vente(id),
    montant NUMERIC NOT NULL,
    moyen_paiement TEXT,
    date_paiement TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Mettre à jour les contraintes de clés étrangères manquantes
ALTER TABLE public.articles_bon_commande 
ADD CONSTRAINT IF NOT EXISTS fk_articles_bon_commande_article 
FOREIGN KEY (article_id) REFERENCES public.catalogue(id);

ALTER TABLE public.articles_bon_commande 
ADD CONSTRAINT IF NOT EXISTS fk_articles_bon_commande_bon 
FOREIGN KEY (bon_commande_id) REFERENCES public.bons_de_commande(id);

ALTER TABLE public.articles_bon_livraison 
ADD CONSTRAINT IF NOT EXISTS fk_articles_bon_livraison_article 
FOREIGN KEY (article_id) REFERENCES public.catalogue(id);

ALTER TABLE public.articles_bon_livraison 
ADD CONSTRAINT IF NOT EXISTS fk_articles_bon_livraison_bon 
FOREIGN KEY (bon_livraison_id) REFERENCES public.bons_de_livraison(id);

ALTER TABLE public.bons_de_livraison 
ADD CONSTRAINT IF NOT EXISTS fk_bons_livraison_bon_commande 
FOREIGN KEY (bon_commande_id) REFERENCES public.bons_de_commande(id);

ALTER TABLE public.bons_de_livraison 
ADD CONSTRAINT IF NOT EXISTS fk_bons_livraison_entrepot 
FOREIGN KEY (entrepot_destination_id) REFERENCES public.entrepots(id);

ALTER TABLE public.factures_vente 
ADD CONSTRAINT IF NOT EXISTS fk_factures_vente_client 
FOREIGN KEY (client_id) REFERENCES public.clients(id);

ALTER TABLE public.factures_vente 
ADD CONSTRAINT IF NOT EXISTS fk_factures_vente_livraison_statut 
FOREIGN KEY (statut_livraison_id) REFERENCES public.livraison_statut(id);

ALTER TABLE public.lignes_facture_vente 
ADD CONSTRAINT IF NOT EXISTS fk_lignes_facture_vente_facture 
FOREIGN KEY (facture_vente_id) REFERENCES public.factures_vente(id);

ALTER TABLE public.lignes_facture_vente 
ADD CONSTRAINT IF NOT EXISTS fk_lignes_facture_vente_article 
FOREIGN KEY (article_id) REFERENCES public.catalogue(id);

-- Créer les politiques RLS pour les nouvelles tables
ALTER TABLE public.livraison_statut ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paiements_vente ENABLE ROW LEVEL SECURITY;

-- Politiques RLS permissives pour le développement
CREATE POLICY "Allow all access to livraison_statut" ON public.livraison_statut FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to menus" ON public.menus FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to permissions" ON public.permissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to password_reset_requests" ON public.password_reset_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to paiements_vente" ON public.paiements_vente FOR ALL USING (true) WITH CHECK (true);

-- Créer ou mettre à jour les triggers de mise à jour automatique
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer les triggers aux tables qui en ont besoin
DROP TRIGGER IF EXISTS update_menus_updated_at ON public.menus;
CREATE TRIGGER update_menus_updated_at 
    BEFORE UPDATE ON public.menus 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
