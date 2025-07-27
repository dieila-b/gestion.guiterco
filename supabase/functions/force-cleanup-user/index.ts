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

    // ÉTAPE 2: Force delete ALL internal users with this email (multiple passes)
    console.log('🔥 Step 2: Force delete internal users...');
    
    // Make multiple passes to ensure complete deletion
    for (let pass = 1; pass <= 3; pass++) {
      console.log(`🔁 Cleanup pass ${pass}...`);
      
      const { data: existingInternal, error: selectError } = await supabase
        .from('utilisateurs_internes')
        .select('id, user_id')
        .eq('email', email);

      if (selectError) {
        console.error(`❌ Error selecting internal users on pass ${pass}:`, selectError);
        continue;
      }

      if (!existingInternal || existingInternal.length === 0) {
        console.log(`✅ No more internal users found on pass ${pass}`);
        break;
      }

      console.log(`🎯 Found ${existingInternal.length} internal user(s) on pass ${pass}`);
      
      for (const user of existingInternal) {
        console.log(`🗑️ Force deleting internal user: ${user.id} (pass ${pass})`);
        
        // Strategy 1: Delete by ID
        const { error: deleteError1 } = await supabase
          .from('utilisateurs_internes')
          .delete()
          .eq('id', user.id);
        
        if (deleteError1) {
          console.error(`❌ Error deleting by ID on pass ${pass}:`, deleteError1);
          
          // Strategy 2: Delete by email 
          const { error: deleteError2 } = await supabase
            .from('utilisateurs_internes')
            .delete()
            .eq('email', email);
          
          if (deleteError2) {
            console.error(`❌ Error deleting by email on pass ${pass}:`, deleteError2);
            
            // Strategy 3: Delete by user_id if available
            if (user.user_id) {
              const { error: deleteError3 } = await supabase
                .from('utilisateurs_internes')
                .delete()
                .eq('user_id', user.user_id);
              
              if (deleteError3) {
                console.error(`❌ Error deleting by user_id on pass ${pass}:`, deleteError3);
              } else {
                deletedInternalUsers++;
                console.log(`✅ Internal user deleted by user_id on pass ${pass}`);
              }
            }
          } else {
            deletedInternalUsers++;
            console.log(`✅ Internal user deleted by email on pass ${pass}`);
          }
        } else {
          deletedInternalUsers++;
          console.log(`✅ Internal user ${user.id} deleted successfully on pass ${pass}`);
        }
        
        // Small delay between deletions
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Delay between passes
      if (pass < 3) {
        console.log(`⏳ Waiting between cleanup passes...`);
        await new Promise(resolve => setTimeout(resolve, 500));
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