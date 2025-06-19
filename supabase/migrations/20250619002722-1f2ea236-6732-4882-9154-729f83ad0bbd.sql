
-- Ajouter l'utilisateur de développement dans utilisateurs_internes
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
  'Dev',
  'User',
  'dev@test.local',
  ru.id,
  'actif',
  'interne'
FROM auth.users au
CROSS JOIN public.roles_utilisateurs ru
WHERE au.email = 'dev@test.local'
  AND ru.nom = 'administrateur'
ON CONFLICT (email) 
DO UPDATE SET
  user_id = EXCLUDED.user_id,
  role_id = EXCLUDED.role_id,
  statut = 'actif',
  type_compte = 'interne';

-- Alternative : Politique temporaire plus permissive pour le développement
-- (Décommentez cette section si vous préférez une approche plus ouverte)
/*
DROP POLICY IF EXISTS "Internal users can insert factures_vente" ON public.factures_vente;
CREATE POLICY "Dev mode can insert factures_vente" 
  ON public.factures_vente 
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    public.is_internal_user_active(auth.uid()) 
    OR auth.jwt() ->> 'email' LIKE '%@test.local'
    OR auth.jwt() ->> 'email' = 'dev@test.local'
  );
*/
