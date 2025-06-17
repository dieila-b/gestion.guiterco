
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useUpdateFactureStatut = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ factureId, statut_livraison }: { factureId: string, statut_livraison: string }) => {
      console.log('🚚 Mise à jour statut livraison pour facture:', factureId, 'vers:', statut_livraison);

      // Mettre à jour le statut de la facture principale
      const { data: facture, error: factureError } = await supabase
        .from('factures_vente')
        .update({ statut_livraison })
        .eq('id', factureId)
        .select()
        .single();

      if (factureError) {
        console.error('❌ Erreur mise à jour facture:', factureError);
        throw factureError;
      }

      // CRUCIAL: Mettre à jour toutes les lignes de facture avec le nouveau statut
      let nouveauStatutLigne;
      switch (statut_livraison) {
        case 'livree':
          nouveauStatutLigne = 'livree';
          break;
        case 'partiellement_livree':
          nouveauStatutLigne = 'partiellement_livree';
          break;
        case 'en_attente':
        default:
          nouveauStatutLigne = 'en_attente';
          break;
      }

      console.log('📦 Mise à jour des lignes de facture vers statut:', nouveauStatutLigne);

      // Mettre à jour toutes les lignes de facture associées
      const { error: lignesError } = await supabase
        .from('lignes_facture_vente')
        .update({ statut_livraison: nouveauStatutLigne })
        .eq('facture_vente_id', factureId);

      if (lignesError) {
        console.error('❌ Erreur mise à jour lignes facture:', lignesError);
        throw lignesError;
      }

      console.log('✅ Statut livraison mis à jour avec succès pour facture et lignes');
      return facture;
    },
    onSuccess: (facture) => {
      // Invalider toutes les queries liées aux factures pour forcer le rechargement
      queryClient.invalidateQueries({ queryKey: ['factures_vente'] });
      
      // Invalider aussi les queries spécifiques si elles existent
      queryClient.invalidateQueries({ queryKey: ['facture', facture.id] });
      
      // Forcer le refetch immédiat
      queryClient.refetchQueries({ queryKey: ['factures_vente'] });
      
      toast.success('Statut de livraison mis à jour');
      
      console.log('✅ Queries invalidées et rafraîchies après mise à jour statut');
    },
    onError: (error: Error) => {
      console.error('❌ Erreur lors de la mise à jour du statut:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  });
};
