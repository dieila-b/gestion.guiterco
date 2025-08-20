
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
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🔄 Début de la synchronisation des utilisateurs...')

    // Récupérer tous les utilisateurs auth
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Erreur récupération auth users:', authError)
      throw new Error(`Erreur auth: ${authError.message}`)
    }

    // Récupérer les utilisateurs internes existants
    const { data: existingUsers, error: existingError } = await supabaseAdmin
      .from('utilisateurs_internes')
      .select('user_id')

    if (existingError) {
      console.error('❌ Erreur récupération utilisateurs internes:', existingError)
      throw new Error(`Erreur utilisateurs internes: ${existingError.message}`)
    }

    const existingUserIds = new Set(existingUsers?.map(u => u.user_id) || [])
    
    let syncCount = 0

    // Synchroniser chaque utilisateur auth qui n'est pas encore dans utilisateurs_internes
    for (const authUser of authUsers.users) {
      if (!existingUserIds.has(authUser.id) && authUser.email) {
        const metadata = authUser.user_metadata || {}
        
        const { error: insertError } = await supabaseAdmin
          .from('utilisateurs_internes')
          .insert({
            user_id: authUser.id,
            email: authUser.email,
            prenom: metadata.prenom || metadata.first_name || authUser.email.split('@')[0],
            nom: metadata.nom || metadata.last_name || 'Utilisateur',
            statut: 'actif',
            type_compte: 'employe'
          })

        if (insertError) {
          console.error(`❌ Erreur insertion utilisateur ${authUser.email}:`, insertError)
        } else {
          console.log(`✅ Utilisateur synchronisé: ${authUser.email}`)
          syncCount++
        }
      }
    }

    console.log(`✅ Synchronisation terminée. ${syncCount} utilisateurs ajoutés.`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Synchronisation réussie. ${syncCount} utilisateurs ajoutés.`,
        syncCount 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('❌ Erreur synchronisation:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
