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

    const { id } = await req.json()

    console.log('Deleting internal user:', { id })

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

    console.log('Found auth user ID:', authUserId);

    // Delete the user from auth.users - this will cascade delete the internal user
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(authUserId);

    if (authError) {
      console.error('Error deleting auth user:', authError);
      throw new Error(`Erreur lors de la suppression de l'utilisateur: ${authError.message}`);
    }

    console.log('User deleted successfully:', { id, authUserId });

    return new Response(
      JSON.stringify({ success: true, message: 'Utilisateur supprimé avec succès' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in delete-internal-user function:', error)
    
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