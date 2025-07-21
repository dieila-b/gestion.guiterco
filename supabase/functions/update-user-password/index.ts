
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

    const { userId, newPassword, requireChange } = await req.json()

    // Mettre à jour le mot de passe dans Supabase Auth
    const { data, error } = await supabaseClient.auth.admin.updateUserById(userId, {
      password: newPassword
    })

    if (error) {
      throw error
    }

    // Mettre à jour le flag dans utilisateurs_internes
    const { error: updateError } = await supabaseClient
      .from('utilisateurs_internes')
      .update({ doit_changer_mot_de_passe: requireChange })
      .eq('user_id', userId)

    if (updateError) {
      console.error('Erreur lors de la mise à jour du flag:', updateError)
      // Ne pas faire échouer la mise à jour du mot de passe
    }

    return new Response(
      JSON.stringify({ success: true }),
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
