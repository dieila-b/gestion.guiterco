
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FactureImpayee {
  facture_id: string;
  numero_facture: string;
  date_facture: string;
  client: string;
  total: number;
  paye: number;
  restant: number;
  statut_paiement: string;
  statut_livraison: string;
}

export const useFacturesImpayeesQuery = () => {
  return useQuery({
    queryKey: ['factures_impayees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vue_factures_impayees')
        .select('*')
        .order('date_facture', { ascending: false });
      
      if (error) throw error;
      return data as FactureImpayee[];
    }
  });
};
