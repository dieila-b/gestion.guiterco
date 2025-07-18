
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify the requesting user is authorized
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is an internal user with proper role
    const { data: internalUser, error: internalError } = await supabaseAdmin
      .from('utilisateurs_internes')
      .select('*, role:roles_utilisateurs!role_id(nom)')
      .eq('user_id', user.id)
      .eq('statut', 'actif')
      .single()

    if (internalError || !internalUser || !internalUser.role || internalUser.role.nom !== 'administrateur') {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions. Admin role required.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { 
      prenom, 
      nom, 
      email, 
      password, 
      telephone, 
      adresse, 
      photo_url, 
      role_id, 
      doit_changer_mot_de_passe, 
      statut 
    } = await req.json()

    console.log('Creating user with admin privileges:', { email, prenom, nom })

    // Create user with admin client
    const { data: authData, error: authError2 } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        prenom,
        nom
      }
    })

    if (authError2) {
      console.error('Auth error:', authError2)
      return new Response(
        JSON.stringify({ error: authError2.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: 'Failed to create user' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Auth user created successfully:', authData.user.id)

    // Create entry in utilisateurs_internes
    const { data: userInterne, error: userInterneError } = await supabaseAdmin
      .from('utilisateurs_internes')
      .insert({
        user_id: authData.user.id,
        prenom,
        nom,
        email,
        telephone,
        adresse,
        photo_url,
        role_id,
        doit_changer_mot_de_passe,
        statut: statut || 'actif',
        type_compte: 'interne'
      })
      .select()
      .single()

    if (userInterneError) {
      console.error('Internal user creation error:', userInterneError)
      // Cleanup: delete the auth user if internal user creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return new Response(
        JSON.stringify({ error: userInterneError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Internal user created successfully:', userInterne.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: authData.user, 
        internalUser: userInterne 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
