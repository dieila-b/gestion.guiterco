
-- Créer une fonction pour synchroniser les utilisateurs auth avec utilisateurs_internes
CREATE OR REPLACE FUNCTION public.sync_auth_users_to_internal()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    auth_user RECORD;
BEGIN
    -- Parcourir tous les utilisateurs auth qui ne sont pas dans utilisateurs_internes
    FOR auth_user IN 
        SELECT 
            au.id,
            au.email,
            au.raw_user_meta_data,
            au.created_at
        FROM auth.users au
        LEFT JOIN public.utilisateurs_internes ui ON au.id = ui.user_id
        WHERE ui.user_id IS NULL
        AND au.email IS NOT NULL
    LOOP
        -- Insérer l'utilisateur dans utilisateurs_internes
        INSERT INTO public.utilisateurs_internes (
            user_id,
            email,
            prenom,
            nom,
            statut,
            type_compte,
            matricule
        ) VALUES (
            auth_user.id,
            auth_user.email,
            COALESCE(auth_user.raw_user_meta_data->>'prenom', auth_user.raw_user_meta_data->>'first_name', SPLIT_PART(auth_user.email, '@', 1)),
            COALESCE(auth_user.raw_user_meta_data->>'nom', auth_user.raw_user_meta_data->>'last_name', 'Utilisateur'),
            'actif',
            'employe',
            public.generate_matricule(
                COALESCE(auth_user.raw_user_meta_data->>'prenom', auth_user.raw_user_meta_data->>'first_name', SPLIT_PART(auth_user.email, '@', 1)),
                COALESCE(auth_user.raw_user_meta_data->>'nom', auth_user.raw_user_meta_data->>'last_name', 'Utilisateur')
            )
        );
    END LOOP;
END;
$$;

-- Créer un trigger pour synchroniser automatiquement les nouveaux utilisateurs
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insérer automatiquement dans utilisateurs_internes quand un utilisateur s'inscrit
    INSERT INTO public.utilisateurs_internes (
        user_id,
        email,
        prenom,
        nom,
        statut,
        type_compte,
        matricule
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'prenom', NEW.raw_user_meta_data->>'first_name', SPLIT_PART(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'nom', NEW.raw_user_meta_data->>'last_name', 'Utilisateur'),
        'actif',
        'employe',
        public.generate_matricule(
            COALESCE(NEW.raw_user_meta_data->>'prenom', NEW.raw_user_meta_data->>'first_name', SPLIT_PART(NEW.email, '@', 1)),
            COALESCE(NEW.raw_user_meta_data->>'nom', NEW.raw_user_meta_data->>'last_name', 'Utilisateur')
        )
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- En cas d'erreur, continuer sans bloquer l'inscription
        RETURN NEW;
END;
$$;

-- Créer le trigger sur auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_auth_user();

-- Synchroniser les utilisateurs existants
SELECT public.sync_auth_users_to_internal();

-- Créer une vue pour faciliter la récupération des utilisateurs avec leurs rôles
CREATE OR REPLACE VIEW public.vue_utilisateurs_avec_roles AS
SELECT 
    ui.*,
    r.name as role_name,
    r.description as role_description
FROM public.utilisateurs_internes ui
LEFT JOIN public.roles r ON ui.role_id = r.id
ORDER BY ui.created_at DESC;

-- Assurer que les politiques RLS permettent l'accès à cette vue
CREATE POLICY "Allow access to vue_utilisateurs_avec_roles" ON public.utilisateurs_internes
FOR SELECT USING (true);

-- Mettre à jour les politiques RLS pour permettre la synchronisation
CREATE POLICY "Allow system sync for utilisateurs_internes" ON public.utilisateurs_internes
FOR INSERT WITH CHECK (true);
