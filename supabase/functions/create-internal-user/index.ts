
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

    console.log('🚀 Début création utilisateur:', { email, prenom, nom })

    // Vérifier d'abord si l'utilisateur existe déjà
    const { data: existingUser, error: checkError } = await supabaseClient.auth.admin.getUserByEmail(email)
    
    if (checkError && checkError.status !== 404) {
      console.error('❌ Erreur lors de la vérification:', checkError)
      throw checkError
    }

    if (existingUser.user) {
      console.log('⚠️ Utilisateur existant trouvé:', existingUser.user.id)
      throw new Error('Un utilisateur avec cette adresse email existe déjà')
    }

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
      console.error('❌ Erreur Auth:', authError)
      throw authError
    }

    if (!authData.user) {
      throw new Error('Erreur lors de la création de l\'utilisateur')
    }

    console.log('✅ Utilisateur Auth créé:', authData.user.id)

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
      console.error('❌ Erreur utilisateur interne:', userError)
      // Supprimer l'utilisateur Auth créé en cas d'erreur
      await supabaseClient.auth.admin.deleteUser(authData.user.id)
      throw userError
    }

    console.log('✅ Utilisateur interne créé:', userData.id)

    // Créer l'entrée dans user_roles
    const { error: roleError } = await supabaseClient
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role_id,
        is_active: true
      })

    if (roleError) {
      console.error('❌ Erreur assignation rôle:', roleError)
      // Ne pas faire échouer la création si seul le rôle pose problème
      console.log('⚠️ Rôle non assigné, mais utilisateur créé')
    } else {
      console.log('✅ Rôle assigné avec succès')
    }

    return new Response(
      JSON.stringify({ success: true, user: userData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Erreur globale:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erreur inconnue lors de la création'
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
