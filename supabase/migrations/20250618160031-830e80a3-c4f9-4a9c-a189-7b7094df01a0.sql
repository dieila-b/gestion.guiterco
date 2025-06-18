
-- Créer d'abord la politique d'insertion pour factures_vente
CREATE POLICY "Internal users can insert factures_vente" 
  ON public.factures_vente 
  FOR INSERT 
  TO authenticated
  WITH CHECK (public.is_internal_user_active(auth.uid()));
