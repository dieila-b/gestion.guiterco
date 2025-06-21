
-- Supprimer les politiques existantes et créer des politiques de développement plus permissives
DROP POLICY IF EXISTS "Users can view all factures_vente" ON public.factures_vente;
DROP POLICY IF EXISTS "Users can create factures_vente" ON public.factures_vente;
DROP POLICY IF EXISTS "Users can update factures_vente" ON public.factures_vente;
DROP POLICY IF EXISTS "Users can delete factures_vente" ON public.factures_vente;

-- Politiques de développement pour factures_vente (très permissives)
CREATE POLICY "Dev: Allow all operations on factures_vente" 
ON public.factures_vente 
FOR ALL 
TO public
USING (true) 
WITH CHECK (true);

-- Politiques permissives pour lignes_facture_vente
DROP POLICY IF EXISTS "Users can view all lignes_facture_vente" ON public.lignes_facture_vente;
DROP POLICY IF EXISTS "Users can create lignes_facture_vente" ON public.lignes_facture_vente;
DROP POLICY IF EXISTS "Users can update lignes_facture_vente" ON public.lignes_facture_vente;
DROP POLICY IF EXISTS "Users can delete lignes_facture_vente" ON public.lignes_facture_vente;

CREATE POLICY "Dev: Allow all operations on lignes_facture_vente" 
ON public.lignes_facture_vente 
FOR ALL 
TO public
USING (true) 
WITH CHECK (true);

-- Politiques permissives pour versements_clients
DROP POLICY IF EXISTS "Users can view all versements_clients" ON public.versements_clients;
DROP POLICY IF EXISTS "Users can create versements_clients" ON public.versements_clients;
DROP POLICY IF EXISTS "Users can update versements_clients" ON public.versements_clients;
DROP POLICY IF EXISTS "Users can delete versements_clients" ON public.versements_clients;

CREATE POLICY "Dev: Allow all operations on versements_clients" 
ON public.versements_clients 
FOR ALL 
TO public
USING (true) 
WITH CHECK (true);

-- Politiques permissives pour commandes_clients
DROP POLICY IF EXISTS "Users can view all commandes_clients" ON public.commandes_clients;
DROP POLICY IF EXISTS "Users can create commandes_clients" ON public.commandes_clients;
DROP POLICY IF EXISTS "Users can update commandes_clients" ON public.commandes_clients;
DROP POLICY IF EXISTS "Users can delete commandes_clients" ON public.commandes_clients;

CREATE POLICY "Dev: Allow all operations on commandes_clients" 
ON public.commandes_clients 
FOR ALL 
TO public
USING (true) 
WITH CHECK (true);

-- Politiques permissives pour lignes_commande
DROP POLICY IF EXISTS "Users can view all lignes_commande" ON public.lignes_commande;
DROP POLICY IF EXISTS "Users can create lignes_commande" ON public.lignes_commande;
DROP POLICY IF EXISTS "Users can update lignes_commande" ON public.lignes_commande;
DROP POLICY IF EXISTS "Users can delete lignes_commande" ON public.lignes_commande;

CREATE POLICY "Dev: Allow all operations on lignes_commande" 
ON public.lignes_commande 
FOR ALL 
TO public
USING (true) 
WITH CHECK (true);

-- Politiques permissives pour transactions
DROP POLICY IF EXISTS "Users can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete transactions" ON public.transactions;

CREATE POLICY "Dev: Allow all operations on transactions" 
ON public.transactions 
FOR ALL 
TO public
USING (true) 
WITH CHECK (true);

-- Ajouter des politiques permissives pour d'autres tables importantes
-- Clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dev: Allow all operations on clients" 
ON public.clients 
FOR ALL 
TO public
USING (true) 
WITH CHECK (true);

-- Catalogue
ALTER TABLE public.catalogue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dev: Allow all operations on catalogue" 
ON public.catalogue 
FOR ALL 
TO public
USING (true) 
WITH CHECK (true);

-- Stock PDV
ALTER TABLE public.stock_pdv ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dev: Allow all operations on stock_pdv" 
ON public.stock_pdv 
FOR ALL 
TO public
USING (true) 
WITH CHECK (true);

-- Points de vente
ALTER TABLE public.points_de_vente ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dev: Allow all operations on points_de_vente" 
ON public.points_de_vente 
FOR ALL 
TO public
USING (true) 
WITH CHECK (true);

-- Précommandes
ALTER TABLE public.precommandes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dev: Allow all operations on precommandes" 
ON public.precommandes 
FOR ALL 
TO public
USING (true) 
WITH CHECK (true);

-- Lignes précommande
ALTER TABLE public.lignes_precommande ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dev: Allow all operations on lignes_precommande" 
ON public.lignes_precommande 
FOR ALL 
TO public
USING (true) 
WITH CHECK (true);

-- Cash registers
ALTER TABLE public.cash_registers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dev: Allow all operations on cash_registers" 
ON public.cash_registers 
FOR ALL 
TO public
USING (true) 
WITH CHECK (true);
