
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { prenom, nom, email, password, telephone, adresse, photo_url, role_id, doit_changer_mot_de_passe, statut } = await req.json()

    // Créer l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: prenom,
        last_name: nom,
      }
    })

    if (authError) {
      throw authError
    }

    if (!authData.user) {
      throw new Error('Erreur lors de la création de l\'utilisateur')
    }

    // Créer l'entrée dans la table utilisateurs_internes
    const { data: userData, error: userError } = await supabaseClient
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
        type_compte: 'interne',
        statut: statut || 'actif'
      })
      .select()
      .single()

    if (userError) {
      throw userError
    }

    // Créer l'entrée dans user_roles
    const { error: roleError } = await supabaseClient
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role_id,
        is_active: true
      })

    if (roleError) {
      console.error('Erreur lors de l\'assignation du rôle:', roleError)
      // Ne pas faire échouer la création si seul le rôle pose problème
    }

    return new Response(
      JSON.stringify({ success: true, user: userData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erreur:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
