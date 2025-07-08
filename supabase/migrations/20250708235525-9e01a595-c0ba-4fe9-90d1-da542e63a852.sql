
-- Corriger les politiques RLS pour la table lignes_facture_vente
-- Supprimer les anciennes politiques restrictives
DROP POLICY IF EXISTS "select_all_lignes" ON public.lignes_facture_vente;
DROP POLICY IF EXISTS "update_all_lignes" ON public.lignes_facture_vente;

-- Créer des politiques permissives pour toutes les opérations sur lignes_facture_vente
CREATE POLICY "Dev: Allow all operations on lignes_facture_vente" 
ON public.lignes_facture_vente 
FOR ALL 
TO public
USING (true) 
WITH CHECK (true);

-- Vérifier que les autres tables liées ont des politiques permissives
-- (Ces politiques existent déjà mais on les recrée pour être sûr)
DROP POLICY IF EXISTS "Dev: Allow all operations on factures_vente" ON public.factures_vente;
CREATE POLICY "Dev: Allow all operations on factures_vente" 
ON public.factures_vente 
FOR ALL 
TO public
USING (true) 
WITH CHECK (true);

-- Invalider le cache PostgREST
NOTIFY pgrst, 'reload schema';
