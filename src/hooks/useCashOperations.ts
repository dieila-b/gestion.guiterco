
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type CashOperation = {
  id: string;
  type: 'depot' | 'retrait';
  montant: number;
  commentaire?: string;
  created_at: string;
};

type CashOperationInsert = {
  type: 'depot' | 'retrait';
  montant: number;
  commentaire?: string;
};

export const useCashOperations = (year: number, month: number) => {
  return useQuery({
    queryKey: ['cash-operations', year, month],
    queryFn: async () => {
      console.log('🔄 Chargement des opérations de caisse...');
      
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      
      const { data, error } = await supabase
        .from('cash_operations')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Erreur cash operations:', error);
        throw error;
      }
      
      console.log('✅ Opérations chargées:', data?.length || 0);
      return data as CashOperation[];
    },
    staleTime: 30000, // Cache pendant 30 secondes
    retry: 1
  });
};

export const useAddCashOperation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (operation: CashOperationInsert) => {
      console.log('💾 Ajout opération:', operation);
      
      const { data, error } = await supabase
        .from('cash_operations')
        .insert(operation)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Erreur ajout:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-operations'] });
      console.log('✅ Opération ajoutée avec succès');
    }
  });
};
