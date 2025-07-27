import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateUserRequest {
  email: string;
  prenom: string;
  nom: string;
  password?: string;
  password_hash?: string;
  matricule?: string;
  role_id?: string;
  statut?: 'actif' | 'inactif' | 'suspendu';
  type_compte?: 'employe' | 'gestionnaire' | 'admin';
  telephone?: string;
  date_embauche?: string;
  department?: string;
  photo_url?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting create-internal-user function');

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create Supabase client with service role key (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('Supabase client created with service role');

    // Parse request body
    const userData: CreateUserRequest = await req.json();
    console.log('User data received:', { email: userData.email, prenom: userData.prenom, nom: userData.nom });

    // Validate required fields
    if (!userData.email || !userData.prenom || !userData.nom) {
      return new Response(
        JSON.stringify({ error: 'Email, prénom et nom sont requis' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate matricule if not provided
    if (!userData.matricule) {
      console.log('Generating matricule...');
      const { data: matriculeData, error: matriculeError } = await supabase
        .rpc('generate_matricule', {
          p_prenom: userData.prenom,
          p_nom: userData.nom
        });

      if (matriculeError) {
        console.error('Error generating matricule:', matriculeError);
        return new Response(
          JSON.stringify({ error: 'Erreur lors de la génération du matricule' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      userData.matricule = matriculeData;
      console.log('Generated matricule:', userData.matricule);
    }

    // Set default values
    const finalUserData = {
      ...userData,
      statut: userData.statut || 'actif',
      type_compte: userData.type_compte || 'employe'
    };

    console.log('Creating auth user...');
    
    // Get all users to check for conflicts
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const existingAuthUser = authUsers.users.find(user => user.email === userData.email);
    
    // Check if user exists in utilisateurs_internes
    const { data: existingInternalUser } = await supabase
      .from('utilisateurs_internes')
      .select('id, user_id')
      .eq('email', userData.email)
      .maybeSingle();
    
    console.log('Existing auth user:', existingAuthUser?.id);
    console.log('Existing internal user:', existingInternalUser?.id);
    
    // If user exists in both tables, return error
    if (existingInternalUser && existingAuthUser) {
      console.error('User already exists in both tables:', userData.email);
      return new Response(
        JSON.stringify({ 
          error: `Un utilisateur avec l'email ${userData.email} existe déjà dans le système`,
          suggestion: 'Utilisez un email différent ou supprimez l\'utilisateur existant'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Clean up orphaned data automatically
    if (existingInternalUser && !existingAuthUser) {
      console.log('Cleaning up orphaned internal user:', userData.email);
      await supabase
        .from('utilisateurs_internes')
        .delete()
        .eq('id', existingInternalUser.id);
    }
    
    if (existingAuthUser && !existingInternalUser) {
      console.log('Cleaning up orphaned auth user:', userData.email);
      await supabase.auth.admin.deleteUser(existingAuthUser.id);
    }

    // Generate a strong temporary password if none provided
    const tempPassword = userData.password || userData.password_hash || `TempPass${Math.random().toString(36).slice(-8)}!`;
    
    // First create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        prenom: userData.prenom,
        nom: userData.nom,
        matricule: finalUserData.matricule
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: `Erreur lors de la création de l'utilisateur: ${authError.message}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Auth user created:', authData.user?.id);

    // Then insert the user in utilisateurs_internes with the same ID
    const finalUserDataWithId = {
      ...finalUserData,
      id: authData.user!.id,    // Primary key ID
      user_id: authData.user!.id // Foreign key to auth.users
    };

    console.log('Inserting user data...');
    console.log('Final user data with ID:', finalUserDataWithId);
    
    const { data, error } = await supabase
      .from('utilisateurs_internes')
      .insert([finalUserDataWithId])
      .select('*')
      .single();

    if (error) {
      console.error('Database error:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      // If database insert fails, clean up the auth user
      await supabase.auth.admin.deleteUser(authData.user!.id);
      return new Response(
        JSON.stringify({ error: `Erreur lors de la création: ${error.message}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('User created successfully:', data.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data,
        message: 'Utilisateur interne créé avec succès' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});