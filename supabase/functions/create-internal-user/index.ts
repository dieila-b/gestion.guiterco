
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

    console.log('🚀 Début création utilisateur:', { email, prenom, nom, role_id })

    // Vérifier si l'utilisateur existe déjà dans auth.users
    const { data: existingAuthUser, error: authCheckError } = await supabaseClient.auth.admin.listUsers()
    
    if (authCheckError) {
      console.error('❌ Erreur lors de la vérification auth:', authCheckError)
      throw new Error(`Erreur de vérification auth: ${authCheckError.message}`)
    }

    const userExists = existingAuthUser.users.find(u => u.email === email)
    if (userExists) {
      console.log('⚠️ Utilisateur auth existant trouvé:', userExists.id)
      throw new Error('Un utilisateur avec cette adresse email existe déjà dans le système d\'authentification')
    }

    // Vérifier si l'utilisateur existe déjà dans utilisateurs_internes
    const { data: existingInternalUser, error: internalCheckError } = await supabaseClient
      .from('utilisateurs_internes')
      .select('id, email')
      .eq('email', email)
      .maybeSingle()

    if (internalCheckError) {
      console.error('❌ Erreur lors de la vérification interne:', internalCheckError)
      throw new Error(`Erreur de vérification utilisateur interne: ${internalCheckError.message}`)
    }

    if (existingInternalUser) {
      console.log('⚠️ Utilisateur interne existant trouvé:', existingInternalUser.id)
      throw new Error('Un utilisateur avec cette adresse email existe déjà dans les utilisateurs internes')
    }

    // Vérifier que le rôle existe
    const { data: roleData, error: roleError } = await supabaseClient
      .from('roles')
      .select('id, name')
      .eq('id', role_id)
      .single()

    if (roleError) {
      console.error('❌ Erreur lors de la vérification du rôle:', roleError)
      throw new Error(`Rôle introuvable: ${roleError.message}`)
    }

    console.log('✅ Rôle validé:', roleData.name)

    // Créer l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: prenom,
        last_name: nom,
        full_name: `${prenom} ${nom}`,
        role: roleData.name
      }
    })

    if (authError) {
      console.error('❌ Erreur création Auth:', authError)
      throw new Error(`Erreur lors de la création du compte: ${authError.message}`)
    }

    if (!authData.user) {
      throw new Error('Erreur lors de la création de l\'utilisateur - aucune donnée retournée')
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
        doit_changer_mot_de_passe: doit_changer_mot_de_passe || false,
        type_compte: 'interne',
        statut: statut || 'actif'
      })
      .select()
      .single()

    if (userError) {
      console.error('❌ Erreur utilisateur interne:', userError)
      console.log('🔄 Tentative de suppression de l\'utilisateur Auth créé...')
      
      // Supprimer l'utilisateur Auth créé en cas d'erreur
      try {
        await supabaseClient.auth.admin.deleteUser(authData.user.id)
        console.log('✅ Utilisateur Auth supprimé après erreur')
      } catch (cleanupError) {
        console.error('❌ Erreur lors du nettoyage:', cleanupError)
      }
      
      throw new Error(`Erreur lors de la création du profil utilisateur: ${userError.message}`)
    }

    console.log('✅ Utilisateur interne créé:', userData.id)

    // Créer l'entrée dans user_roles
    const { data: roleAssignmentData, error: roleAssignmentError } = await supabaseClient
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role_id,
        is_active: true
      })
      .select()
      .single()

    if (roleAssignmentError) {
      console.error('❌ Erreur assignation rôle:', roleAssignmentError)
      console.log('🔄 Tentative de nettoyage après erreur de rôle...')
      
      // Nettoyer en cas d'erreur
      try {
        await supabaseClient.from('utilisateurs_internes').delete().eq('id', userData.id)
        await supabaseClient.auth.admin.deleteUser(authData.user.id)
        console.log('✅ Nettoyage effectué après erreur de rôle')
      } catch (cleanupError) {
        console.error('❌ Erreur lors du nettoyage complet:', cleanupError)
      }
      
      throw new Error(`Erreur lors de l'assignation du rôle: ${roleAssignmentError.message}`)
    }

    console.log('✅ Rôle assigné avec succès:', roleAssignmentData.id)

    // Retourner la réponse de succès
    const response = {
      success: true,
      user: {
        id: userData.id,
        user_id: authData.user.id,
        prenom: userData.prenom,
        nom: userData.nom,
        email: userData.email,
        role: roleData.name,
        statut: userData.statut
      },
      message: 'Utilisateur interne créé avec succès'
    }

    console.log('✅ Création terminée avec succès:', response.user.id)

    return new Response(
      JSON.stringify(response),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Erreur globale lors de la création:', error)
    
    const errorResponse = {
      success: false,
      error: error.message || 'Erreur inconnue lors de la création de l\'utilisateur',
      details: error.stack || 'Aucun détail disponible'
    }
    
    return new Response(
      JSON.stringify(errorResponse),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
