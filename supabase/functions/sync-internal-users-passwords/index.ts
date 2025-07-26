import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { email, password } = await req.json()

    console.log('Synchronizing password for internal user:', { email })

    if (!email || !password) {
      throw new Error('Email and password are required')
    }

    // Vérifier que l'utilisateur existe dans utilisateurs_internes et est actif
    const { data: internalUser, error: internalUserError } = await supabaseAdmin
      .from('utilisateurs_internes')
      .select('*')
      .eq('email', email)
      .eq('statut', 'actif')
      .eq('type_compte', 'interne')
      .single()

    if (internalUserError || !internalUser) {
      console.error('Internal user not found or inactive:', internalUserError);
      throw new Error('Utilisateur interne non trouvé ou inactif');
    }

    console.log('Found internal user:', { id: internalUser.id, email: internalUser.email });

    // Vérifier si l'utilisateur existe déjà dans auth.users
    const { data: existingUser, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(internalUser.user_id);

    if (getUserError && getUserError.message !== 'User not found') {
      console.error('Error checking existing user:', getUserError);
      throw new Error(`Erreur lors de la vérification de l'utilisateur: ${getUserError.message}`);
    }

    if (existingUser?.user) {
      // L'utilisateur existe déjà dans auth.users, mettre à jour son mot de passe
      console.log('Updating password for existing auth user:', existingUser.user.id);
      
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingUser.user.id,
        {
          password,
          email_confirm: true, // Confirmer l'email automatiquement
          user_metadata: {
            prenom: internalUser.prenom,
            nom: internalUser.nom
          }
        }
      );

      if (updateError) {
        console.error('Error updating user password:', updateError);
        throw new Error(`Erreur lors de la mise à jour du mot de passe: ${updateError.message}`);
      }

      console.log('Password updated successfully for user:', existingUser.user.id);
    } else {
      // L'utilisateur n'existe pas dans auth.users, le créer
      console.log('Creating new auth user for internal user');
      
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Confirmer l'email automatiquement
        user_metadata: {
          prenom: internalUser.prenom,
          nom: internalUser.nom
        }
      });

      if (createError) {
        console.error('Error creating auth user:', createError);
        throw new Error(`Erreur lors de la création de l'utilisateur: ${createError.message}`);
      }

      // Mettre à jour la référence user_id dans utilisateurs_internes
      const { error: updateInternalError } = await supabaseAdmin
        .from('utilisateurs_internes')
        .update({ user_id: newUser.user.id })
        .eq('id', internalUser.id);

      if (updateInternalError) {
        console.error('Error updating internal user reference:', updateInternalError);
        // Ne pas faire échouer la création pour cette erreur
      }

      console.log('Auth user created successfully:', newUser.user.id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Mot de passe synchronisé avec succès',
        user_email: email
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in sync-internal-users-passwords function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})