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
    // Create Supabase client with service role key
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

    const { id, password, password_hash, ...userData } = await req.json()

    console.log('Updating internal user:', { id, userData })

    if (!id) {
      throw new Error('User ID is required')
    }

    // First, get the user_id from the utilisateurs_internes table
    const { data: internalUser, error: fetchError } = await supabaseAdmin
      .from('utilisateurs_internes')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError || !internalUser) {
      console.error('Error fetching internal user:', fetchError);
      throw new Error('Utilisateur interne non trouvé');
    }

    const authUserId = internalUser.user_id;

    // If password is provided, update it in auth
    if (password || password_hash) {
      console.log('Updating auth user password...');
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(authUserId, {
        password: password || password_hash
      });

      if (authError) {
        console.error('Error updating auth user:', authError);
        throw new Error(`Erreur lors de la mise à jour du mot de passe: ${authError.message}`);
      }
    }

    // Update email in auth if provided
    if (userData.email) {
      console.log('Updating auth user email...');
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(authUserId, {
        email: userData.email
      });

      if (authError) {
        console.error('Error updating auth user email:', authError);
        throw new Error(`Erreur lors de la mise à jour de l'email: ${authError.message}`);
      }
    }

    // Update user data in the utilisateurs_internes table
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('utilisateurs_internes')
      .update(userData)
      .eq('id', id)
      .select('*')
      .maybeSingle()

    if (updateError) {
      console.error('Error updating user in database:', updateError)
      throw updateError
    }

    if (!updatedUser) {
      throw new Error('User not found or update failed')
    }

    console.log('User updated successfully:', updatedUser)

    return new Response(
      JSON.stringify({ success: true, data: updatedUser }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in update-internal-user function:', error)
    
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