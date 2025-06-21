
-- Activer RLS sur la table factures_vente si ce n'est pas déjà fait
ALTER TABLE public.factures_vente ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs authentifiés de voir toutes les factures
CREATE POLICY "Users can view all factures_vente" 
ON public.factures_vente 
FOR SELECT 
TO authenticated 
USING (true);

-- Politique pour permettre aux utilisateurs authentifiés de créer des factures
CREATE POLICY "Users can create factures_vente" 
ON public.factures_vente 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Politique pour permettre aux utilisateurs authentifiés de modifier les factures
CREATE POLICY "Users can update factures_vente" 
ON public.factures_vente 
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Politique pour permettre aux utilisateurs authentifiés de supprimer les factures
CREATE POLICY "Users can delete factures_vente" 
ON public.factures_vente 
FOR DELETE 
TO authenticated 
USING (true);

-- Activer RLS et créer des politiques pour les tables liées
ALTER TABLE public.lignes_facture_vente ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all lignes_facture_vente" 
ON public.lignes_facture_vente 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Users can create lignes_facture_vente" 
ON public.lignes_facture_vente 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Users can update lignes_facture_vente" 
ON public.lignes_facture_vente 
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Users can delete lignes_facture_vente" 
ON public.lignes_facture_vente 
FOR DELETE 
TO authenticated 
USING (true);

-- Politiques pour la table versements_clients
ALTER TABLE public.versements_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all versements_clients" 
ON public.versements_clients 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Users can create versements_clients" 
ON public.versements_clients 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Users can update versements_clients" 
ON public.versements_clients 
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Users can delete versements_clients" 
ON public.versements_clients 
FOR DELETE 
TO authenticated 
USING (true);

-- Politiques pour la table commandes_clients
ALTER TABLE public.commandes_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all commandes_clients" 
ON public.commandes_clients 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Users can create commandes_clients" 
ON public.commandes_clients 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Users can update commandes_clients" 
ON public.commandes_clients 
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Users can delete commandes_clients" 
ON public.commandes_clients 
FOR DELETE 
TO authenticated 
USING (true);

-- Politiques pour la table lignes_commande
ALTER TABLE public.lignes_commande ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all lignes_commande" 
ON public.lignes_commande 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Users can create lignes_commande" 
ON public.lignes_commande 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Users can update lignes_commande" 
ON public.lignes_commande 
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Users can delete lignes_commande" 
ON public.lignes_commande 
FOR DELETE 
TO authenticated 
USING (true);

-- Politiques pour la table transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all transactions" 
ON public.transactions 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Users can create transactions" 
ON public.transactions 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Users can update transactions" 
ON public.transactions 
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Users can delete transactions" 
ON public.transactions 
FOR DELETE 
TO authenticated 
USING (true);
