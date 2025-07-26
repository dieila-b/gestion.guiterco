-- Fonction pour réinitialiser le mot de passe d'un utilisateur interne
CREATE OR REPLACE FUNCTION reset_internal_user_password(user_email TEXT, new_password TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    -- Vérifier que l'utilisateur existe dans utilisateurs_internes
    IF NOT EXISTS (
        SELECT 1 FROM public.utilisateurs_internes 
        WHERE email = user_email AND statut = 'actif' AND type_compte = 'interne'
    ) THEN
        RETURN json_build_object('success', false, 'error', 'Utilisateur interne non trouvé ou inactif');
    END IF;
    
    -- Log de l'opération
    RAISE NOTICE 'Réinitialisation du mot de passe pour: %', user_email;
    
    RETURN json_build_object('success', true, 'message', 'Utilisateur vérifié, procéder à la mise à jour du mot de passe');
END;
$$;