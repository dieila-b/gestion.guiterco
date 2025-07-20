
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
      throw new Error('Invalid authentication')
    }

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

    if (internalUserError || !internalUser) {
      throw new Error('User not found in internal users')
    }

    // Vérifier si l'utilisateur a un rôle administrateur
    const hasAdminRole = internalUser.user_roles.some((ur: any) => 
      ur.roles.name === 'Administrateur'
    )

    if (!hasAdminRole) {
      throw new Error('Insufficient permissions')
    }

    // Récupérer les données de la requête
    const { userId, newPassword, requireChange = false } = await req.json()

    if (!userId || !newPassword) {
      throw new Error('Missing userId or newPassword')
    }

    console.log('🔐 Admin updating password for user:', userId)

    // Mettre à jour le mot de passe via l'API Admin
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    )

    if (updateError) {
      console.error('❌ Error updating password:', updateError)
      throw new Error(`Failed to update password: ${updateError.message}`)
    }

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
        console.error('❌ Error updating user flag:', userUpdateError)
        // Ne pas faire échouer la requête pour ça
      }
    }

    console.log('✅ Password updated successfully for user:', userId)

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
