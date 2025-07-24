import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Validation du mot de passe selon les nouvelles règles
function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Au moins 10 caractères
  if (password.length < 10) {
    errors.push('Le mot de passe doit contenir au moins 10 caractères');
  }
  
  // Au moins une majuscule
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }
  
  // Au moins une minuscule
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  }
  
  // Au moins un chiffre
  if (!/[0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }
  
  // Au moins un caractère spécial
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*()_+-=[]{};\':"\\|,.<>/?)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { userId, newPassword, requireChange } = await req.json()

    if (!userId || !newPassword) {
      return new Response(
        JSON.stringify({ error: 'userId et newPassword sont requis' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Valider le nouveau mot de passe
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ 
          error: 'Mot de passe invalide',
          details: validation.errors 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Tentative de mise à jour du mot de passe pour l'utilisateur: ${userId}`)

    // Mettre à jour le mot de passe dans auth.users via l'API Admin
    const { data: updateData, error: updateError } = await supabaseClient.auth.admin.updateUserById(
      userId,
      { 
        password: newPassword,
        user_metadata: {
          password_changed_at: new Date().toISOString()
        }
      }
    )

    if (updateError) {
      console.error('Erreur lors de la mise à jour du mot de passe:', updateError)
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Mot de passe mis à jour avec succès pour l\'utilisateur:', userId)

    // Mettre à jour le champ doit_changer_mot_de_passe dans utilisateurs_internes si spécifié
    if (typeof requireChange === 'boolean') {
      const { error: updateUtilisateurError } = await supabaseClient
        .from('utilisateurs_internes')
        .update({ 
          doit_changer_mot_de_passe: requireChange,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (updateUtilisateurError) {
        console.error('Erreur lors de la mise à jour du profil utilisateur:', updateUtilisateurError)
        // Ne pas faire échouer la requête pour cette erreur non-critique
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Mot de passe mis à jour avec succès',
        user: updateData.user 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Erreur dans update-user-password:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})