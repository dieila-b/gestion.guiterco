
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ApprovalData {
  destinationType: 'entrepot' | 'point_vente';
  destinationId: string;
  articles: Array<{
    id: string;
    quantite_recue: number;
  }>;
}

export const useBonLivraisonApproval = () => {
  const queryClient = useQueryClient();

  const approveBonLivraison = useMutation({
    mutationFn: async ({ bonLivraisonId, approvalData }: { bonLivraisonId: string; approvalData: ApprovalData }) => {
      console.log('🔄 Début de l\'approbation du bon de livraison:', bonLivraisonId, approvalData);

      // 1. Mettre à jour les quantités reçues pour chaque article
      for (const article of approvalData.articles) {
        const { error: updateError } = await supabase
          .from('articles_bon_livraison')
          .update({ quantite_recue: article.quantite_recue })
          .eq('id', article.id);

        if (updateError) {
          console.error('❌ Erreur lors de la mise à jour de l\'article:', updateError);
          throw new Error(`Erreur de mise à jour de l'article: ${updateError.message}`);
        }
      }

      // 2. Mettre à jour le bon de livraison avec la destination et le statut
      const updateData: any = {
        statut: 'receptionne',
        date_reception: new Date().toISOString()
      };

      if (approvalData.destinationType === 'entrepot') {
        updateData.entrepot_destination_id = approvalData.destinationId;
        updateData.point_vente_destination_id = null;
      } else {
        updateData.point_vente_destination_id = approvalData.destinationId;
        updateData.entrepot_destination_id = null;
      }

      const { error: bonError } = await supabase
        .from('bons_de_livraison')
        .update(updateData)
        .eq('id', bonLivraisonId);

      if (bonError) {
        console.error('❌ Erreur lors de la mise à jour du bon:', bonError);
        throw new Error(`Erreur de mise à jour du bon: ${bonError.message}`);
      }

      console.log('✅ Approbation terminée avec succès');
      return bonLivraisonId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bons-livraison'] });
      queryClient.invalidateQueries({ queryKey: ['bon-livraison-articles'] });
      queryClient.invalidateQueries({ queryKey: ['factures-achat'] });
      queryClient.invalidateQueries({ queryKey: ['stock_principal'] });
      queryClient.invalidateQueries({ queryKey: ['stock_pdv'] });
      
      toast({
        title: "✅ Bon de livraison approuvé",
        description: "Le bon de livraison a été approuvé et le stock mis à jour. Une facture d'achat a été générée automatiquement.",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error('❌ Erreur lors de l\'approbation:', error);
      toast({
        title: "❌ Erreur d'approbation",
        description: error instanceof Error ? error.message : "Erreur lors de l'approbation du bon de livraison.",
        variant: "destructive",
      });
    }
  });

  return { 
    approveBonLivraison, 
    isApproving: approveBonLivraison.isPending 
  };
};
