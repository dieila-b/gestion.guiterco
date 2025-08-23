
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDiagnosticUtilisateurs = () => {
  return useQuery({
    queryKey: ['diagnostic-utilisateurs'],
    queryFn: async () => {
      console.log('🔍 Diagnostic des utilisateurs internes...');
      
      // Tester l'accès direct à la table
      const { data: directCount, error: directError } = await supabase
        .from('utilisateurs_internes')
        .select('id')
        .limit(1);

      // Tester l'accès à la vue
      const { data: viewCount, error: viewError } = await supabase
        .from('vue_utilisateurs_avec_roles')
        .select('id')
        .limit(1);

      // Tester l'accès aux rôles
      const { data: rolesCount, error: rolesError } = await supabase
        .from('roles')
        .select('id')
        .limit(1);

      const diagnostic = {
        direct_table_accessible: !directError,
        direct_table_error: directError?.message,
        direct_table_count: directCount?.length || 0,
        
        view_accessible: !viewError,
        view_error: viewError?.message,
        view_count: viewCount?.length || 0,
        
        roles_accessible: !rolesError,
        roles_error: rolesError?.message,
        roles_count: rolesCount?.length || 0,
        
        timestamp: new Date().toISOString()
      };

      console.log('📊 Diagnostic complet:', diagnostic);
      return diagnostic;
    },
    enabled: false, // Seulement quand appelé manuellement
  });
};
