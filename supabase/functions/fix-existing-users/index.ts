import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting fix-existing-users function');

    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get all users from utilisateurs_internes that don't have auth accounts
    const { data: internalUsers, error: fetchError } = await supabase
      .from('utilisateurs_internes')
      .select('*');

    if (fetchError) {
      throw new Error(`Error fetching users: ${fetchError.message}`);
    }

    console.log(`Found ${internalUsers?.length || 0} internal users`);

    const results = [];

    for (const user of internalUsers || []) {
      try {
        // Check if auth user already exists
        const { data: existingAuthUser } = await supabase.auth.admin.getUserById(user.id);
        
        if (existingAuthUser.user) {
          console.log(`Auth user already exists for ${user.email}`);
          results.push({ 
            email: user.email, 
            status: 'already_exists',
            id: user.id 
          });
          continue;
        }

        // Create auth user with the same ID
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: 'TempPassword123!',
          email_confirm: true,
          user_metadata: {
            prenom: user.prenom,
            nom: user.nom,
            matricule: user.matricule
          }
        });

        if (authError) {
          console.error(`Error creating auth user for ${user.email}:`, authError);
          results.push({ 
            email: user.email, 
            status: 'error', 
            error: authError.message 
          });
          continue;
        }

        // Update the internal user with the new auth ID if different
        if (authData.user!.id !== user.id) {
          const { error: updateError } = await supabase
            .from('utilisateurs_internes')
            .update({ id: authData.user!.id })
            .eq('id', user.id);

          if (updateError) {
            console.error(`Error updating internal user ID for ${user.email}:`, updateError);
            // Clean up the auth user
            await supabase.auth.admin.deleteUser(authData.user!.id);
            results.push({ 
              email: user.email, 
              status: 'error', 
              error: updateError.message 
            });
            continue;
          }
        }

        console.log(`Successfully created auth user for ${user.email}`);
        results.push({ 
          email: user.email, 
          status: 'created',
          id: authData.user!.id 
        });

      } catch (error) {
        console.error(`Error processing user ${user.email}:`, error);
        results.push({ 
          email: user.email, 
          status: 'error', 
          error: error.message 
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Existing users processing completed',
        results 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Erreur interne du serveur',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});