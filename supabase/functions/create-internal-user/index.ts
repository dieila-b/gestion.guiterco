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
    
    // NETTOYAGE COMPLET ET ROBUSTE
    console.log('🧹 Nettoyage complet pour:', userData.email);
    
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`🔄 Tentative de nettoyage ${attempts}/${maxAttempts}`);
      
      // 1. Supprimer TOUS les utilisateurs auth avec cet email
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
            console.log(`✅ Auth user ${authUser.id} supprimé`);
          }
        }
      }

      // 2. Supprimer FORCEMENT de utilisateurs_internes - TOUTES les stratégies
      console.log('🔥 Suppression utilisateurs internes - Force brute...');
      
      // Stratégie A: Suppression directe par email
      await supabase.from('utilisateurs_internes').delete().eq('email', userData.email);
      
      // Stratégie B: Récupérer et supprimer par ID  
      const { data: usersToDelete } = await supabase
        .from('utilisateurs_internes')
        .select('id, email, user_id')
        .eq('email', userData.email);
      
      if (usersToDelete && usersToDelete.length > 0) {
        console.log(`🎯 ${usersToDelete.length} utilisateur(s) trouvé(s), suppression forcée...`);
        for (const user of usersToDelete) {
          // Supprimer par ID
          await supabase.from('utilisateurs_internes').delete().eq('id', user.id);
          // Supprimer par user_id au cas où
          if (user.user_id) {
            await supabase.from('utilisateurs_internes').delete().eq('user_id', user.user_id);
          }
          console.log(`🗑️ Suppression forcée: ${user.id}`);
        }
      }
      
      // 3. Vérification finale
      const { data: verification } = await supabase
        .from('utilisateurs_internes')
        .select('id')
        .eq('email', userData.email)
        .limit(1);
      
      if (!verification || verification.length === 0) {
        console.log('✅ Nettoyage réussi - aucun utilisateur restant');
        break;
      } else {
        console.log(`⚠️ ${verification.length} utilisateur(s) encore présent(s), nouvelle tentative...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('🏁 Nettoyage terminé après', attempts, 'tentative(s)');
    
    // Attendre la propagation finale
    console.log('⏳ Attente propagation finale...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate a strong temporary password if none provided
    const tempPassword = userData.password || userData.password_hash || `TempPass${Math.random().toString(36).slice(-8)}!`;
    
    console.log('🚀 Creating auth user first...');
    
    // ÉTAPE 1: Créer d'abord l'utilisateur dans Supabase Auth
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
      console.error('❌ Auth error:', authError);
      return new Response(
        JSON.stringify({ error: `Erreur lors de la création auth: ${authError.message}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ Auth user created successfully:', authData.user?.id);

    // ÉTAPE 2: Insérer dans utilisateurs_internes avec l'ID de l'utilisateur auth
    const finalUserDataWithId = {
      ...finalUserData,
      id: authData.user!.id,     // Utiliser l'ID de l'utilisateur auth
      user_id: authData.user!.id // FK vers auth.users
    };

    console.log('📝 Upserting user data in utilisateurs_internes...');
    console.log('Final user data:', finalUserDataWithId);
    
    const { data, error } = await supabase
      .from('utilisateurs_internes')
      .upsert([finalUserDataWithId], { 
        onConflict: 'email',
        ignoreDuplicates: false 
      })
      .select('*')
      .single();

    if (error) {
      console.error('❌ Database error:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      // ROLLBACK: Supprimer l'utilisateur auth créé
      console.log('🔄 Rolling back auth user...');
      await supabase.auth.admin.deleteUser(authData.user!.id);
      
      return new Response(
        JSON.stringify({ error: `Erreur lors de l'insertion en base: ${error.message}` }),
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