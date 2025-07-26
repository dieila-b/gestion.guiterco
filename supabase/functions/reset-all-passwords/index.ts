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

    console.log('Starting password reset for all internal users')

    // Récupérer tous les utilisateurs internes actifs
    const { data: internalUsers, error: fetchError } = await supabaseAdmin
      .from('utilisateurs_internes')
      .select('*')
      .eq('statut', 'actif')

    if (fetchError) {
      console.error('Error fetching internal users:', fetchError);
      throw new Error(`Erreur lors de la récupération des utilisateurs: ${fetchError.message}`);
    }

    console.log(`Found ${internalUsers?.length || 0} internal users`);

    const results = [];

    for (const internalUser of internalUsers || []) {
      try {
        console.log(`Processing user: ${internalUser.email}`);

        // Vérifier si l'utilisateur existe dans auth.users avec son user_id
        let authUser = null;
        if (internalUser.user_id) {
          const { data: existingUser, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(internalUser.user_id);
          if (!getUserError && existingUser?.user) {
            authUser = existingUser.user;
          }
        }

        // Si pas trouvé par user_id, chercher par email
        if (!authUser) {
          const { data: usersByEmail, error: getUserByEmailError } = await supabaseAdmin.auth.admin.listUsers();
          if (!getUserByEmailError && usersByEmail?.users) {
            authUser = usersByEmail.users.find(u => u.email === internalUser.email);
          }
        }

        if (authUser) {
          // L'utilisateur existe, mettre à jour son mot de passe
          console.log(`Updating password for existing user: ${authUser.id}`);
          
          // Utiliser un mot de passe temporaire basé sur l'email
          const tempPassword = `Temp123!${internalUser.email.split('@')[0]}`;
          
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            authUser.id,
            {
              password: tempPassword,
              email_confirm: true,
              user_metadata: {
                prenom: internalUser.prenom,
                nom: internalUser.nom
              }
            }
          );

          if (updateError) {
            console.error(`Error updating user ${internalUser.email}:`, updateError);
            results.push({
              email: internalUser.email,
              status: 'error',
              error: updateError.message
            });
          } else {
            // Mettre à jour la référence user_id si nécessaire
            if (internalUser.user_id !== authUser.id) {
              await supabaseAdmin
                .from('utilisateurs_internes')
                .update({ user_id: authUser.id })
                .eq('id', internalUser.id);
            }

            console.log(`Password updated successfully for: ${internalUser.email}`);
            results.push({
              email: internalUser.email,
              status: 'password_updated',
              tempPassword: tempPassword,
              user_id: authUser.id
            });
          }
        } else {
          // L'utilisateur n'existe pas, le créer
          console.log(`Creating new user: ${internalUser.email}`);
          
          const tempPassword = `Temp123!${internalUser.email.split('@')[0]}`;
          
          const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: internalUser.email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
              prenom: internalUser.prenom,
              nom: internalUser.nom
            }
          });

          if (createError) {
            console.error(`Error creating user ${internalUser.email}:`, createError);
            results.push({
              email: internalUser.email,
              status: 'error',
              error: createError.message
            });
          } else {
            // Mettre à jour la référence user_id
            await supabaseAdmin
              .from('utilisateurs_internes')
              .update({ user_id: newUser.user.id })
              .eq('id', internalUser.id);

            console.log(`User created successfully: ${internalUser.email}`);
            results.push({
              email: internalUser.email,
              status: 'created',
              tempPassword: tempPassword,
              user_id: newUser.user.id
            });
          }
        }
      } catch (userError) {
        console.error(`Error processing user ${internalUser.email}:`, userError);
        results.push({
          email: internalUser.email,
          status: 'error',
          error: userError.message
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Password reset completed for all internal users',
        results: results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in reset-all-passwords function:', error)
    
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