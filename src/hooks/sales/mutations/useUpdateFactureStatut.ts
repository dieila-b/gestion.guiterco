
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useUpdateFactureStatut = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ factureId, statut_livraison }: { factureId: string, statut_livraison: string }) => {
      console.log('🚚 Mise à jour statut livraison pour facture:', factureId, 'vers:', statut_livraison);

      // Récupérer les lignes de facture pour mise à jour cohérente
      const { data: lignesFacture, error: lignesError } = await supabase
        .from('lignes_facture_vente')
        .select('*')
        .eq('facture_vente_id', factureId);

      if (lignesError) {
        console.error('❌ Erreur récupération lignes facture:', lignesError);
        throw lignesError;
      }

      // Déterminer les nouvelles valeurs selon le statut choisi
      let nouveauStatutLigne;
      let statutLivraisonId;

      switch (statut_livraison) {
        case 'livree':
        case 'Livrée':
          nouveauStatutLigne = 'Livrée';
          statutLivraisonId = 3;
          // Mettre quantite_livree = quantite pour toutes les lignes
          for (const ligne of lignesFacture || []) {
            await supabase
              .from('lignes_facture_vente')
              .update({ 
                statut_livraison: 'Livrée',
                quantite_livree: ligne.quantite
              })
              .eq('id', ligne.id);
          }
          break;
          
        case 'en_attente':
        case 'En attente':
          nouveauStatutLigne = 'En attente';
          statutLivraisonId = 1;
          // Remettre quantite_livree à 0 pour toutes les lignes
          for (const ligne of lignesFacture || []) {
            await supabase
              .from('lignes_facture_vente')
              .update({ 
                statut_livraison: 'En attente',
                quantite_livree: 0
              })
              .eq('id', ligne.id);
          }
          break;
          
        case 'partiellement_livree':
        case 'Partiellement livrée':
          nouveauStatutLigne = 'Partiellement livrée';
          statutLivraisonId = 2;
          await supabase
            .from('lignes_facture_vente')
            .update({ statut_livraison: nouveauStatutLigne })
            .eq('facture_vente_id', factureId);
          break;
          
        default:
          nouveauStatutLigne = 'En attente';
          statutLivraisonId = 1;
          await supabase
            .from('lignes_facture_vente')
            .update({ 
              statut_livraison: nouveauStatutLigne,
              quantite_livree: 0 
            })
            .eq('facture_vente_id', factureId);
          break;
      }

      console.log('📦 Mise à jour des lignes de facture vers statut:', nouveauStatutLigne);

      // Mettre à jour le statut de la facture principale
      const { data: facture, error: factureError } = await supabase
        .from('factures_vente')
        .update({ 
          statut_livraison: nouveauStatutLigne as 'En attente' | 'Partiellement livrée' | 'Livrée',
          statut_livraison_id: statutLivraisonId
        })
        .eq('id', factureId)
        .select()
        .single();

      if (factureError) {
        console.error('❌ Erreur mise à jour facture:', factureError);
        throw factureError;
      }

      console.log('✅ Statut livraison mis à jour avec succès pour facture et lignes');
      return facture;
    },
    onSuccess: (facture) => {
      // Invalider TOUTES les queries liées aux factures avec rechargement IMMÉDIAT
      queryClient.invalidateQueries({ queryKey: ['factures_vente'] });
      queryClient.invalidateQueries({ queryKey: ['facture', facture.id] });
      
      // Forcer le refetch IMMÉDIAT de toutes les queries actives
      queryClient.refetchQueries({ queryKey: ['factures_vente'] });
      
      // Forcer la mise à jour du cache avec les nouvelles données
      queryClient.setQueryData(['facture', facture.id], facture);
      
      toast.success('Statut de livraison mis à jour');
      
      console.log('✅ Queries invalidées et rechargées IMMÉDIATEMENT après mise à jour statut');
    },
    onError: (error: Error) => {
      console.error('❌ Erreur lors de la mise à jour du statut:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  });
};
