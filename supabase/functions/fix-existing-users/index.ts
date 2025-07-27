import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

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

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create Supabase client with service role key (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('Supabase client created with service role');

    // List all auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error listing auth users:', authError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la récupération des utilisateurs auth' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get all internal users
    const { data: internalUsers, error: internalError } = await supabase
      .from('utilisateurs_internes')
      .select('user_id, email');
    
    if (internalError) {
      console.error('Error listing internal users:', internalError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la récupération des utilisateurs internes' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const internalUserIds = new Set(internalUsers?.map(u => u.user_id) || []);
    const orphanedAuthUsers = authUsers.users.filter(user => !internalUserIds.has(user.id));

    console.log(`Found ${orphanedAuthUsers.length} orphaned auth users`);

    // Clean up orphaned auth users
    const deletedUsers = [];
    for (const orphanedUser of orphanedAuthUsers) {
      console.log(`Deleting orphaned auth user: ${orphanedUser.email}`);
      const { error: deleteError } = await supabase.auth.admin.deleteUser(orphanedUser.id);
      
      if (deleteError) {
        console.error(`Error deleting user ${orphanedUser.email}:`, deleteError);
      } else {
        deletedUsers.push(orphanedUser.email);
      }
    }

    console.log('Cleanup completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Nettoyage des utilisateurs orphelins terminé',
        deletedUsers,
        deletedCount: deletedUsers.length
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});