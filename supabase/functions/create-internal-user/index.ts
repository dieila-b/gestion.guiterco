import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateUserRequest {
  email: string;
  password: string;
  prenom: string;
  nom: string;
  role_id: string;
  telephone?: string;
  matricule?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Initialize client with anon key for user operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { email, password, prenom, nom, role_id, telephone, matricule } = await req.json() as CreateUserRequest;

    console.log('🔧 Création utilisateur interne pour:', email);

    // Valider les données requises
    if (!email || !password || !prenom || !nom || !role_id) {
      return new Response(
        JSON.stringify({ error: 'Tous les champs obligatoires doivent être remplis' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Vérifier que le rôle existe
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('roles')
      .select('id, name')
      .eq('id', role_id)
      .single();

    if (roleError || !roleData) {
      console.error('❌ Rôle non trouvé:', roleError);
      return new Response(
        JSON.stringify({ error: 'Rôle spécifié introuvable' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ Rôle validé:', roleData);

    // Créer l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirmer automatiquement l'email
      user_metadata: {
        prenom,
        nom,
        role: roleData.name
      }
    });

    if (authError || !authData.user) {
      console.error('❌ Erreur création Auth:', authError);
      return new Response(
        JSON.stringify({ 
          error: 'Erreur lors de la création du compte utilisateur', 
          details: authError?.message 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ Utilisateur Auth créé:', authData.user.id);

    // Créer l'enregistrement dans utilisateurs_internes
    const { data: internalUserData, error: internalUserError } = await supabaseAdmin
      .from('utilisateurs_internes')
      .insert({
        user_id: authData.user.id,
        email,
        prenom,
        nom,
        role_id,
        telephone: telephone || null,
        matricule: matricule || null,
        statut: 'actif'
      })
      .select()
      .single();

    if (internalUserError) {
      console.error('❌ Erreur création utilisateur interne:', internalUserError);
      
      // Supprimer l'utilisateur Auth en cas d'erreur
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      
      return new Response(
        JSON.stringify({ 
          error: 'Erreur lors de la création du profil utilisateur', 
          details: internalUserError.message 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ Utilisateur interne créé:', internalUserData);

    // Créer l'entrée dans user_roles
    const { error: userRoleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role_id,
        is_active: true
      });

    if (userRoleError) {
      console.error('❌ Erreur assignation rôle:', userRoleError);
      
      // Supprimer l'utilisateur en cas d'erreur
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      await supabaseAdmin
        .from('utilisateurs_internes')
        .delete()
        .eq('user_id', authData.user.id);
      
      return new Response(
        JSON.stringify({ 
          error: 'Erreur lors de l\'assignation du rôle', 
          details: userRoleError.message 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ Rôle assigné avec succès');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Utilisateur interne créé avec succès',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          prenom,
          nom,
          role: roleData.name
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erreur interne du serveur', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});