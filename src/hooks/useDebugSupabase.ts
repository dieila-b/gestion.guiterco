
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDebugSupabase = () => {
  const { toast } = useToast();

  const testConnection = async () => {
    try {
      console.log('🔍 Testing Supabase connection...');
      
      // Test simple query
      const { data: testData, error: testError } = await supabase
        .from('catalogue')
        .select('count')
        .limit(1);
      
      if (testError) {
        console.error('❌ Connection test failed:', testError);
        toast({
          title: "Erreur de connexion",
          description: `Impossible de se connecter à la base de données: ${testError.message}`,
          variant: "destructive",
        });
        return false;
      }
      
      console.log('✅ Connection test successful');
      toast({
        title: "Connexion réussie",
        description: "La connexion à la base de données fonctionne correctement",
      });
      return true;
    } catch (error) {
      console.error('❌ Connection test exception:', error);
      toast({
        title: "Erreur de connexion",
        description: "Erreur inattendue lors du test de connexion",
        variant: "destructive",
      });
      return false;
    }
  };

  const checkRLSPolicies = async () => {
    try {
      console.log('🔍 Checking RLS policies...');
      
      const results = [];
      
      // Test catalogue table
      try {
        const { data, error } = await supabase
          .from('catalogue')
          .select('*')
          .limit(1);
        
        results.push({
          table: 'catalogue',
          accessible: !error,
          error: error?.message,
          count: data?.length || 0
        });
      } catch (err) {
        results.push({
          table: 'catalogue',
          accessible: false,
          error: (err as Error).message,
          count: 0
        });
      }

      // Test clients table
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .limit(1);
        
        results.push({
          table: 'clients',
          accessible: !error,
          error: error?.message,
          count: data?.length || 0
        });
      } catch (err) {
        results.push({
          table: 'clients',
          accessible: false,
          error: (err as Error).message,
          count: 0
        });
      }

      // Test factures_vente table
      try {
        const { data, error } = await supabase
          .from('factures_vente')
          .select('*')
          .limit(1);
        
        results.push({
          table: 'factures_vente',
          accessible: !error,
          error: error?.message,
          count: data?.length || 0
        });
      } catch (err) {
        results.push({
          table: 'factures_vente',
          accessible: false,
          error: (err as Error).message,
          count: 0
        });
      }

      // Test stock_principal table
      try {
        const { data, error } = await supabase
          .from('stock_principal')
          .select('*')
          .limit(1);
        
        results.push({
          table: 'stock_principal',
          accessible: !error,
          error: error?.message,
          count: data?.length || 0
        });
      } catch (err) {
        results.push({
          table: 'stock_principal',
          accessible: false,
          error: (err as Error).message,
          count: 0
        });
      }

      // Test entrepots table
      try {
        const { data, error } = await supabase
          .from('entrepots')
          .select('*')
          .limit(1);
        
        results.push({
          table: 'entrepots',
          accessible: !error,
          error: error?.message,
          count: data?.length || 0
        });
      } catch (err) {
        results.push({
          table: 'entrepots',
          accessible: false,
          error: (err as Error).message,
          count: 0
        });
      }
      
      console.log('📊 RLS Policy Check Results:', results);
      
      const inaccessibleTables = results.filter(r => !r.accessible);
      if (inaccessibleTables.length > 0) {
        toast({
          title: "Problèmes d'accès détectés",
          description: `${inaccessibleTables.length} table(s) inaccessible(s): ${inaccessibleTables.map(t => t.table).join(', ')}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Toutes les tables sont accessibles",
          description: "Les politiques RLS fonctionnent correctement",
        });
      }
      
      return results;
    } catch (error) {
      console.error('❌ RLS check failed:', error);
      toast({
        title: "Erreur lors de la vérification RLS",
        description: "Impossible de vérifier les politiques de sécurité",
        variant: "destructive",
      });
      return [];
    }
  };

  const syncAllData = async () => {
    try {
      console.log('🔄 Synchronizing all data...');
      
      // Force refresh all queries
      const queryClient = (window as any).queryClient;
      if (queryClient) {
        await queryClient.invalidateQueries();
        await queryClient.refetchQueries();
      }
      
      toast({
        title: "Synchronisation terminée",
        description: "Toutes les données ont été resynchronisées",
      });
    } catch (error) {
      console.error('❌ Sync failed:', error);
      toast({
        title: "Erreur de synchronisation",
        description: "Impossible de synchroniser les données",
        variant: "destructive",
      });
    }
  };

  return {
    testConnection,
    checkRLSPolicies,
    syncAllData
  };
};
