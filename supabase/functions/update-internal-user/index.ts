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

    const { id, ...userData } = await req.json()

    console.log('Updating internal user:', { id, userData })

    if (!id) {
      throw new Error('User ID is required')
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