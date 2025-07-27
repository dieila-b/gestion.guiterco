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
    
    // ÉTAPE 1: Nettoyage direct avec la même connexion Supabase
    console.log('🧹 Nettoyage forcé direct pour:', userData.email);
    
    let deletedAuthUsers = 0;
    let deletedInternalUsers = 0;

    // Supprimer les utilisateurs auth avec cet email
    console.log('🔥 Suppression utilisateurs auth...');
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    if (authUsers?.users) {
      const existingAuthUsers = authUsers.users.filter(user => user.email === userData.email);
      
      for (const authUser of existingAuthUsers) {
        console.log(`🗑️ Suppression auth user: ${authUser.id}`);
        const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(authUser.id);
        if (deleteAuthError) {
          console.error('❌ Erreur suppression auth user:', deleteAuthError);
        } else {
          deletedAuthUsers++;
          console.log(`✅ Auth user ${authUser.id} supprimé`);
        }
      }
    }

    // Suppression directe des utilisateurs internes avec PLUSIEURS stratégies
    console.log('🔥 Suppression utilisateurs internes...');
    
    // Stratégie 1: Suppression par email (la plus directe)
    const { error: deleteByEmailError } = await supabase
      .from('utilisateurs_internes')
      .delete()
      .eq('email', userData.email);
    
    if (deleteByEmailError) {
      console.error('❌ Erreur suppression par email:', deleteByEmailError);
    } else {
      console.log('✅ Suppression par email réussie');
    }

    // Stratégie 2: Vérification et suppression par ID si des entrées persistent
    const { data: remainingUsers } = await supabase
      .from('utilisateurs_internes')
      .select('id')
      .eq('email', userData.email);
    
    if (remainingUsers && remainingUsers.length > 0) {
      console.log(`🎯 ${remainingUsers.length} utilisateur(s) restant(s), suppression par ID...`);
      for (const user of remainingUsers) {
        const { error: deleteByIdError } = await supabase
          .from('utilisateurs_internes')
          .delete()
          .eq('id', user.id);
        
        if (deleteByIdError) {
          console.error(`❌ Erreur suppression ID ${user.id}:`, deleteByIdError);
        } else {
          deletedInternalUsers++;
          console.log(`✅ Utilisateur ${user.id} supprimé`);
        }
      }
    }

    console.log(`🏁 Nettoyage terminé: ${deletedAuthUsers} auth + ${deletedInternalUsers} internes supprimés`);
    
    // ÉTAPE 2: Attendre la propagation
    console.log('⏳ Attente propagation...');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate a strong temporary password if none provided
    const tempPassword = userData.password || userData.password_hash || `TempPass${Math.random().toString(36).slice(-8)}!`;
    
    // NOUVELLE STRATÉGIE: Créer d'abord dans utilisateurs_internes avec un ID généré
    const userUuid = crypto.randomUUID();
    
    const finalUserDataWithId = {
      ...finalUserData,
      id: userUuid,    // Primary key ID
      user_id: userUuid // Foreign key to auth.users (sera créé ensuite)
    };

    console.log('Inserting user data first...');
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
      return new Response(
        JSON.stringify({ error: `Erreur lors de la création en base: ${error.message}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('User data inserted, now creating auth user...');

    // Then create the user in Supabase Auth with the same ID
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
      // Si la création auth échoue, supprimer l'entrée utilisateurs_internes
      await supabase.from('utilisateurs_internes').delete().eq('id', userUuid);
      return new Response(
        JSON.stringify({ error: `Erreur lors de la création de l'utilisateur auth: ${authError.message}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Auth user created:', authData.user?.id);

    // Mettre à jour l'ID user dans utilisateurs_internes pour correspondre à l'auth user
    if (authData.user?.id !== userUuid) {
      await supabase
        .from('utilisateurs_internes')
        .update({ 
          id: authData.user!.id,
          user_id: authData.user!.id 
        })
        .eq('id', userUuid);
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