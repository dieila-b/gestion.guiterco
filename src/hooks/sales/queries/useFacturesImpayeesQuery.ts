
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FactureImpayee {
  facture_id: string;
  numero_facture: string;
  date_iso: string;
  client: string;
  total: number;
  paye: number;
  restant: number;
  statut_paiement: string;
  statut_livraison: string;
  articles: number;
}

export const useFacturesImpayeesQuery = () => {
  return useQuery({
    queryKey: ['factures_impayees_summary'],
    queryFn: async () => {
      console.log('🔍 Fetching factures impayées from vue_factures_impayees_summary...');
      
      const { data, error } = await supabase
        .from('vue_factures_impayees_summary')
        .select('*')
        .order('date_iso', { ascending: false });
      
      console.log('📊 Résultat requête factures impayées:', { data, error });
      
      if (error) {
        console.error('❌ Erreur requête factures impayées:', error);
        throw error;
      }
      
      console.log('✅ Factures impayées trouvées:', data?.length || 0);
      return data as FactureImpayee[];
    }
  });
};
