import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateUserRequest {
  email: string;
  prenom: string;
  nom: string;
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

    console.log('Inserting user data...');
    
    // Insert the user using service role (bypasses RLS)
    const { data, error } = await supabase
      .from('utilisateurs_internes')
      .insert([finalUserData])
      .select('*')
      .single();

    if (error) {
      console.error('Database error:', error);
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