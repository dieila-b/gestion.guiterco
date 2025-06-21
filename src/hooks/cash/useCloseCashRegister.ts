
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useCloseCashRegister = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (cashRegisterId: string) => {
      console.log('🔒 Fermeture de la caisse:', cashRegisterId);
      
      // Récupérer le solde actuel et les transactions du jour
      const { data: balanceData } = await supabase
        .from('cash_registers')
        .select('balance')
        .eq('id', cashRegisterId)
        .single();

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Récupérer les transactions du jour
      const { data: transactions } = await supabase
        .from('transactions')
        .select('type, amount')
        .eq('cash_register_id', cashRegisterId)
        .gte('date_operation', today.toISOString())
        .lt('date_operation', tomorrow.toISOString());

      // Calculer les totaux
      const totalEntrees = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      const totalSorties = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      const balanceJour = totalEntrees - totalSorties;
      const nbTransactions = transactions?.length || 0;

      // Créer la clôture
      const { data: cloture, error } = await supabase
        .from('clotures_caisse')
        .insert({
          cash_register_id: cashRegisterId,
          solde_debut: (balanceData?.balance || 0) - balanceJour,
          solde_fin: balanceData?.balance || 0,
          total_entrees: totalEntrees,
          total_sorties: totalSorties,
          balance_jour: balanceJour,
          nb_transactions: nbTransactions,
          utilisateur_cloture: 'Utilisateur actuel'
        })
        .select()
        .single();

      if (error) throw error;

      // Marquer la caisse comme fermée
      await supabase
        .from('cash_registers')
        .update({ status: 'closed' })
        .eq('id', cashRegisterId);

      return cloture;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-registers'] });
      queryClient.invalidateQueries({ queryKey: ['clotures-caisse'] });
      toast.success('Caisse fermée avec succès');
    },
    onError: (error) => {
      console.error('Erreur fermeture caisse:', error);
      toast.error('Erreur lors de la fermeture de la caisse');
    }
  });
};
