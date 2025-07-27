import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CleanupRequest {
  email: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🧹 Starting force cleanup user function');

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

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { email }: CleanupRequest = await req.json();
    console.log('🎯 Force cleanup for email:', email);

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let deletedAuthUsers = 0;
    let deletedInternalUsers = 0;

    // ÉTAPE 1: Force delete ALL auth users with this email
    console.log('🔥 Step 1: Force delete auth users...');
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    if (authUsers?.users) {
      const existingAuthUsers = authUsers.users.filter(user => user.email === email);
      
      for (const authUser of existingAuthUsers) {
        console.log(`🗑️ Deleting auth user: ${authUser.id}`);
        const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(authUser.id);
        if (deleteAuthError) {
          console.error('❌ Error deleting auth user:', deleteAuthError);
        } else {
          deletedAuthUsers++;
          console.log(`✅ Auth user ${authUser.id} deleted successfully`);
        }
      }
    }

    // ÉTAPE 2: Force delete ALL internal users with this email
    console.log('🔥 Step 2: Force delete internal users...');
    const { data: existingInternal, error: selectError } = await supabase
      .from('utilisateurs_internes')
      .select('id, user_id')
      .eq('email', email);

    if (selectError) {
      console.error('❌ Error selecting internal users:', selectError);
    } else if (existingInternal && existingInternal.length > 0) {
      for (const user of existingInternal) {
        console.log(`🗑️ Force deleting internal user: ${user.id}`);
        
        // Try multiple deletion strategies
        const { error: deleteError1 } = await supabase
          .from('utilisateurs_internes')
          .delete()
          .eq('id', user.id);
        
        if (deleteError1) {
          console.error('❌ Error deleting by ID, trying by email:', deleteError1);
          
          const { error: deleteError2 } = await supabase
            .from('utilisateurs_internes')
            .delete()
            .eq('email', email);
          
          if (deleteError2) {
            console.error('❌ Error deleting by email:', deleteError2);
          } else {
            deletedInternalUsers++;
            console.log(`✅ Internal user deleted by email`);
          }
        } else {
          deletedInternalUsers++;
          console.log(`✅ Internal user ${user.id} deleted successfully`);
        }
      }
    }

    // ÉTAPE 3: Wait and verify cleanup
    console.log('⏳ Waiting for propagation...');
    await new Promise(resolve => setTimeout(resolve, 500)); // Longer delay

    // Final verification
    const { data: finalCheck, error: finalError } = await supabase
      .from('utilisateurs_internes')
      .select('id, email')
      .eq('email', email);

    if (finalError) {
      console.error('❌ Final verification error:', finalError);
    }

    const stillExists = finalCheck && finalCheck.length > 0;

    console.log('🏁 Cleanup completed:');
    console.log(`- Auth users deleted: ${deletedAuthUsers}`);
    console.log(`- Internal users deleted: ${deletedInternalUsers}`);
    console.log(`- Still exists: ${stillExists ? 'YES' : 'NO'}`);

    return new Response(
      JSON.stringify({ 
        success: !stillExists,
        deletedAuthUsers,
        deletedInternalUsers,
        stillExists,
        message: stillExists 
          ? `Cleanup incomplete - ${finalCheck?.length} user(s) still exist`
          : 'Complete cleanup successful'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});