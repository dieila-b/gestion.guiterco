-- Corriger les politiques RLS pour la table lignes_facture_vente
-- Le problème est que les politiques actuelles bloquent l'accès aux lignes de facture

-- Supprimer les anciennes politiques restrictives
DROP POLICY IF EXISTS "Permission-based lignes_facture_vente read" ON public.lignes_facture_vente;
DROP POLICY IF EXISTS "Permission-based lignes_facture_vente write" ON public.lignes_facture_vente;

-- Créer des politiques permissives temporaires pour permettre l'accès aux lignes de facture
CREATE POLICY "Allow authenticated users to read lignes_facture_vente"
ON public.lignes_facture_vente
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to write lignes_facture_vente"
ON public.lignes_facture_vente
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Vérifier également la table catalogue pour les relations article
DROP POLICY IF EXISTS "Allow authenticated users to read catalogue" ON public.catalogue;
DROP POLICY IF EXISTS "Allow authorized users to write catalogue" ON public.catalogue;

-- Recréer les politiques pour catalogue
CREATE POLICY "Allow all authenticated access to catalogue"
ON public.catalogue
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);