
-- Politiques RLS pour lignes_facture_vente
CREATE POLICY "Internal users can view lignes_facture_vente" 
  ON public.lignes_facture_vente 
  FOR SELECT 
  TO authenticated
  USING (public.is_internal_user_active(auth.uid()));

CREATE POLICY "Internal users can insert lignes_facture_vente" 
  ON public.lignes_facture_vente 
  FOR INSERT 
  TO authenticated
  WITH CHECK (public.is_internal_user_active(auth.uid()));

CREATE POLICY "Internal users can update lignes_facture_vente" 
  ON public.lignes_facture_vente 
  FOR UPDATE 
  TO authenticated
  USING (public.is_internal_user_active(auth.uid()));

CREATE POLICY "Internal users can delete lignes_facture_vente" 
  ON public.lignes_facture_vente 
  FOR DELETE 
  TO authenticated
  USING (public.is_internal_user_active(auth.uid()));

-- Vérifier et corriger l'utilisateur dans utilisateurs_internes
-- Insérer ou mettre à jour votre utilisateur avec le bon email
INSERT INTO public.utilisateurs_internes (
  user_id,
  prenom,
  nom,
  email,
  role_id,
  statut,
  type_compte
)
SELECT 
  au.id,
  'Admin',
  'User',
  'wosyrab@yahoo.fr',
  ru.id,
  'actif',
  'interne'
FROM auth.users au
CROSS JOIN public.roles_utilisateurs ru
WHERE au.email = 'wosyrab@yahoo.fr'
  AND ru.nom = 'administrateur'
ON CONFLICT (email) 
DO UPDATE SET
  user_id = EXCLUDED.user_id,
  role_id = EXCLUDED.role_id,
  statut = 'actif',
  type_compte = 'interne';
