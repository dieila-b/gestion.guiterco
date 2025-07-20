
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
    console.log('🔐 Admin password update function called')
    
    // Vérifier l'authentification
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Créer un client Supabase avec la clé de service
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

    // Vérifier que l'utilisateur actuel est authentifié
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      console.error('❌ Authentication failed:', authError)
      throw new Error('Invalid authentication')
    }

    console.log('✅ User authenticated:', user.email)

    // Vérifier que l'utilisateur a les droits d'administration
    const { data: internalUser, error: internalUserError } = await supabaseAdmin
      .from('utilisateurs_internes')
      .select(`
        *,
        user_roles!inner (
          roles!inner (
            name
          )
        )
      `)
      .eq('user_id', user.id)
      .single()

    if (internalUserError) {
      console.error('❌ Error finding internal user:', internalUserError)
      // Si l'utilisateur n'est pas trouvé dans la table des rôles, essayer avec une requête plus simple
      const { data: simpleUser, error: simpleError } = await supabaseAdmin
        .from('utilisateurs_internes')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (simpleError || !simpleUser) {
        console.error('❌ User not found in utilisateurs_internes:', simpleError)
        throw new Error('User not found in internal users')
      }
      
      // Pour l'instant, permettre à tous les utilisateurs internes de changer les mots de passe
      // (à restreindre plus tard si nécessaire)
      console.log('⚠️ User found but no role information, allowing operation')
    } else {
      console.log('✅ Internal user found with roles:', internalUser.user_roles.map((ur: any) => ur.roles.name))
      
      // Vérifier si l'utilisateur a un rôle administrateur
      const hasAdminRole = internalUser.user_roles.some((ur: any) => 
        ['Administrateur', 'administrateur', 'admin', 'Admin'].includes(ur.roles.name)
      )

      if (!hasAdminRole) {
        console.error('❌ User does not have admin role')
        throw new Error('Insufficient permissions - Admin role required')
      }
    }

    // Récupérer les données de la requête
    const { userId, newPassword, requireChange = false } = await req.json()

    if (!userId || !newPassword) {
      throw new Error('Missing userId or newPassword')
    }

    console.log('🔐 Updating password for user:', userId)

    // Mettre à jour le mot de passe via l'API Admin
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    )

    if (updateError) {
      console.error('❌ Error updating password:', updateError)
      throw new Error(`Failed to update password: ${updateError.message}`)
    }

    console.log('✅ Password updated successfully via Admin API')

    // Mettre à jour le flag doit_changer_mot_de_passe si demandé
    if (requireChange !== undefined) {
      const { error: userUpdateError } = await supabaseAdmin
        .from('utilisateurs_internes')
        .update({ 
          doit_changer_mot_de_passe: requireChange,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (userUpdateError) {
        console.error('⚠️ Error updating user flag (non-critical):', userUpdateError)
        // Ne pas faire échouer la requête pour ça
      } else {
        console.log('✅ User flag updated successfully')
      }
    }

    console.log('✅ Password update completed successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Password updated successfully',
        requiresManualReset: requireChange 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('❌ Error in admin-update-password:', error)
    
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
