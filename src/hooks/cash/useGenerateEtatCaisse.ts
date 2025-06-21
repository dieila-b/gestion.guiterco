
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useGenerateEtatCaisse = () => {
  return useMutation({
    mutationFn: async ({ cashRegisterId, type }: { cashRegisterId: string; type: 'quotidien' | 'fermeture' | 'comptage' }) => {
      console.log('📋 Génération état de caisse:', { cashRegisterId, type });
      
      // Récupérer les données nécessaires
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('cash_register_id', cashRegisterId)
        .gte('date_operation', today.toISOString())
        .lt('date_operation', tomorrow.toISOString())
        .order('date_operation', { ascending: false });

      const { data: cashRegister } = await supabase
        .from('cash_registers')
        .select('*')
        .eq('id', cashRegisterId)
        .single();

      // Calculer les totaux
      const totalEntrees = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      const totalSorties = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      const donneesEtat = {
        caisse: cashRegister,
        transactions: transactions || [],
        totaux: {
          entrees: totalEntrees,
          sorties: totalSorties,
          balance: totalEntrees - totalSorties,
          solde_actuel: cashRegister?.balance || 0
        },
        periode: {
          debut: today.toISOString(),
          fin: new Date().toISOString()
        }
      };

      // Enregistrer l'état
      const { data, error } = await supabase
        .from('etats_caisse')
        .insert({
          cash_register_id: cashRegisterId,
          type_etat: type,
          donnees_etat: JSON.parse(JSON.stringify(donneesEtat)),
          utilisateur_generation: 'Utilisateur actuel'
        })
        .select()
        .single();

      if (error) throw error;
      return { etat: data, donnees: donneesEtat };
    },
    onSuccess: () => {
      toast.success('État de caisse généré avec succès');
    },
    onError: (error) => {
      console.error('Erreur génération état:', error);
      toast.error('Erreur lors de la génération de l\'état');
    }
  });
};
