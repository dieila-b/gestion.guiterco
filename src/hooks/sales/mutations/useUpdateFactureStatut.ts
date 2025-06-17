
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
      let nouvelleQuantiteLivree = null; // null = ne pas modifier

      switch (statut_livraison) {
        case 'livree':
          nouveauStatutLigne = 'livree';
          // Mettre quantite_livree = quantite pour toutes les lignes
          for (const ligne of lignesFacture || []) {
            await supabase
              .from('lignes_facture_vente')
              .update({ 
                statut_livraison: 'livree',
                quantite_livree: ligne.quantite // Livraison complète
              })
              .eq('id', ligne.id);
          }
          break;
          
        case 'en_attente':
          nouveauStatutLigne = 'en_attente';
          // Remettre quantite_livree à 0 pour toutes les lignes
          for (const ligne of lignesFacture || []) {
            await supabase
              .from('lignes_facture_vente')
              .update({ 
                statut_livraison: 'en_attente',
                quantite_livree: 0 // Remise à zéro
              })
              .eq('id', ligne.id);
          }
          break;
          
        case 'partiellement_livree':
          // Pour ce statut, on ouvre le modal de saisie détaillée
          // Ne pas modifier les quantités ici
          nouveauStatutLigne = 'partiellement_livree';
          await supabase
            .from('lignes_facture_vente')
            .update({ statut_livraison: nouveauStatutLigne })
            .eq('facture_vente_id', factureId);
          break;
          
        default:
          nouveauStatutLigne = 'en_attente';
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
        .update({ statut_livraison })
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
