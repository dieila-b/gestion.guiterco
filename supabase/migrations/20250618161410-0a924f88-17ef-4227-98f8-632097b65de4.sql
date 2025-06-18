
-- Politique pour permettre la mise à jour de factures de vente
CREATE POLICY "Internal users can update factures_vente" 
  ON public.factures_vente 
  FOR UPDATE 
  TO authenticated
  USING (public.is_internal_user_active(auth.uid()));

-- Politique pour permettre la suppression de factures de vente
CREATE POLICY "Internal users can delete factures_vente" 
  ON public.factures_vente 
  FOR DELETE 
  TO authenticated
  USING (public.is_internal_user_active(auth.uid()));

-- Politiques pour versements_clients
CREATE POLICY "Internal users can insert versements_clients" 
  ON public.versements_clients 
  FOR INSERT 
  TO authenticated
  WITH CHECK (public.is_internal_user_active(auth.uid()));

CREATE POLICY "Internal users can update versements_clients" 
  ON public.versements_clients 
  FOR UPDATE 
  TO authenticated
  USING (public.is_internal_user_active(auth.uid()));

CREATE POLICY "Internal users can delete versements_clients" 
  ON public.versements_clients 
  FOR DELETE 
  TO authenticated
  USING (public.is_internal_user_active(auth.uid()));
