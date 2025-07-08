
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UpdateFactureVenteData {
  id: string;
  statut_paiement?: string;
  statut_livraison?: 'en_attente' | 'partiellement_livree' | 'livree';
  montant_ttc?: number;
  observations?: string;
}

export const useUpdateFactureVente = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateFactureVenteData) => {
      console.log('🔄 Mise à jour facture vente:', data);

      const { data: result, error } = await supabase
        .from('factures_vente')
        .update({
          statut_paiement: data.statut_paiement,
          statut_livraison: data.statut_livraison,
          montant_ttc: data.montant_ttc,
          observations: data.observations,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur mise à jour facture:', error);
        throw error;
      }

      console.log('✅ Facture mise à jour avec succès:', result);
      return result;
    },
    onSuccess: () => {
      // Invalider les caches
      queryClient.invalidateQueries({ queryKey: ['factures_vente'] });
      queryClient.invalidateQueries({ queryKey: ['factures_impayees_complete'] });
      queryClient.invalidateQueries({ queryKey: ['factures-vente-details'] });
      
      toast.success('Facture mise à jour avec succès');
    },
    onError: (error: Error) => {
      console.error('❌ Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour de la facture');
    }
  });
};
