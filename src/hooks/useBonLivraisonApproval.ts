
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
      console.log('🔄 Début de l\'approbation du bon de livraison:', bonLivraisonId);
      
      // 1. Mettre à jour le statut du bon de livraison
      const { error: updateError } = await supabase
        .from('bons_de_livraison')
        .update({
          statut: 'receptionne',
          date_reception: new Date().toISOString(),
          [`${approvalData.destinationType}_destination_id`]: approvalData.destinationId
        })
        .eq('id', bonLivraisonId);

      if (updateError) {
        console.error('❌ Erreur lors de la mise à jour du bon de livraison:', updateError);
        throw new Error(`Erreur de mise à jour: ${updateError.message}`);
      }

      // 2. Mettre à jour les quantités reçues pour chaque article
      for (const article of approvalData.articles) {
        const { error: articleError } = await supabase
          .from('articles_bon_livraison')
          .update({
            quantite_recue: article.quantite_recue
          })
          .eq('id', article.id);

        if (articleError) {
          console.error('❌ Erreur lors de la mise à jour de l\'article:', articleError);
          throw new Error(`Erreur de mise à jour de l'article: ${articleError.message}`);
        }
      }

      console.log('✅ Approbation du bon de livraison terminée avec succès');
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bons-livraison'] });
      queryClient.invalidateQueries({ queryKey: ['bon-livraison-articles'] });
      queryClient.invalidateQueries({ queryKey: ['stock-principal'] });
      queryClient.invalidateQueries({ queryKey: ['stock-pdv'] });
      
      toast({
        title: "✅ Bon de livraison approuvé avec succès",
        description: "Le stock a été mis à jour automatiquement.",
        variant: "default",
      });
    },
    onError: (error: any) => {
      console.error('❌ Erreur lors de l\'approbation:', error);
      toast({
        title: "❌ Erreur d'approbation",
        description: error.message || "Erreur lors de l'approbation du bon de livraison",
        variant: "destructive",
      });
    }
  });

  return { approveBonLivraison, isApproving: approveBonLivraison.isPending };
};
