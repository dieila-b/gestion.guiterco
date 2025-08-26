
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDiagnosticUtilisateurs = () => {
  return useQuery({
    queryKey: ['diagnostic-utilisateurs'],
    queryFn: async () => {
      console.log('🔍 Diagnostic des utilisateurs internes...');
      
      const results = {
        direct_table_accessible: false,
        direct_table_error: null as string | null,
        direct_table_count: 0,
        
        view_accessible: false,
        view_error: null as string | null,
        view_count: 0,
        
        roles_accessible: false,
        roles_error: null as string | null,
        roles_count: 0,
        
        timestamp: new Date().toISOString()
      };

      // Test 1: Accès direct à la table utilisateurs_internes
      try {
        const { data: directData, error: directError } = await supabase
          .from('utilisateurs_internes')
          .select('id')
          .limit(5);

        if (directError) {
          results.direct_table_error = directError.message;
        } else {
          results.direct_table_accessible = true;
          results.direct_table_count = directData?.length || 0;
        }
      } catch (error) {
        results.direct_table_error = `Exception: ${error}`;
      }

      // Test 2: Accès à la vue
      try {
        const { data: viewData, error: viewError } = await supabase
          .from('vue_utilisateurs_avec_roles')
          .select('id')
          .limit(5);

        if (viewError) {
          results.view_error = viewError.message;
        } else {
          results.view_accessible = true;
          results.view_count = viewData?.length || 0;
        }
      } catch (error) {
        results.view_error = `Exception: ${error}`;
      }

      // Test 3: Accès aux rôles
      try {
        const { data: rolesData, error: rolesError } = await supabase
          .from('roles')
          .select('id')
          .limit(5);

        if (rolesError) {
          results.roles_error = rolesError.message;
        } else {
          results.roles_accessible = true;
          results.roles_count = rolesData?.length || 0;
        }
      } catch (error) {
        results.roles_error = `Exception: ${error}`;
      }

      console.log('📊 Diagnostic complet:', results);
      return results;
    },
    enabled: false, // Seulement quand appelé manuellement
    retry: false,
  });
};
