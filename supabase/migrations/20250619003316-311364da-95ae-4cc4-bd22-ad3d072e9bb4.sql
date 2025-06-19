
-- Politique temporaire pour le développement - Autoriser dev@test.local directement
DROP POLICY IF EXISTS "Internal users can insert factures_vente" ON public.factures_vente;

CREATE POLICY "Dev mode can insert factures_vente" 
  ON public.factures_vente 
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    -- Autoriser les utilisateurs internes actifs
    public.is_internal_user_active(auth.uid()) 
    OR 
    -- OU autoriser directement les comptes de développement
    auth.jwt() ->> 'email' = 'dev@test.local'
    OR
    auth.jwt() ->> 'email' LIKE '%@test.local'
  );

-- Vérifier que l'utilisateur dev@test.local existe dans auth.users
-- et l'ajouter dans utilisateurs_internes si nécessaire
DO $$
DECLARE
    dev_user_id UUID;
    admin_role_id UUID;
BEGIN
    -- Récupérer l'ID de l'utilisateur dev@test.local
    SELECT id INTO dev_user_id 
    FROM auth.users 
    WHERE email = 'dev@test.local';
    
    -- Récupérer l'ID du rôle administrateur
    SELECT id INTO admin_role_id 
    FROM public.roles_utilisateurs 
    WHERE nom = 'administrateur';
    
    -- Si l'utilisateur existe et qu'on a un rôle admin, l'ajouter/mettre à jour
    IF dev_user_id IS NOT NULL AND admin_role_id IS NOT NULL THEN
        INSERT INTO public.utilisateurs_internes (
            user_id,
            prenom,
            nom,
            email,
            role_id,
            statut,
            type_compte
        ) VALUES (
            dev_user_id,
            'Dev',
            'User',
            'dev@test.local',
            admin_role_id,
            'actif',
            'interne'
        )
        ON CONFLICT (email) 
        DO UPDATE SET
            user_id = EXCLUDED.user_id,
            role_id = EXCLUDED.role_id,
            statut = 'actif',
            type_compte = 'interne';
    END IF;
END $$;

-- Politique de diagnostic pour vérifier l'authentification
CREATE OR REPLACE FUNCTION public.debug_auth_info()
RETURNS TABLE(
    current_user_id UUID,
    current_email TEXT,
    is_authenticated BOOLEAN,
    is_internal_active BOOLEAN
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT 
        auth.uid() as current_user_id,
        auth.jwt() ->> 'email' as current_email,
        auth.uid() IS NOT NULL as is_authenticated,
        public.is_internal_user_active(auth.uid()) as is_internal_active;
$$;
