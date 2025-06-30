
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
    mutationFn: async ({ 
      bonLivraisonId, 
      approvalData, 
      skipPrecommandesCheck = false 
    }: { 
      bonLivraisonId: string; 
      approvalData: ApprovalData;
      skipPrecommandesCheck?: boolean;
    }) => {
      console.log('🔄 Début de l\'approbation du bon de livraison:', bonLivraisonId, approvalData);

      // 1. Récupérer les articles du bon de livraison avec leurs IDs du catalogue
      const { data: articlesData, error: articlesError } = await supabase
        .from('articles_bon_livraison')
        .select(`
          id,
          article_id,
          quantite_commandee,
          prix_unitaire,
          catalogue:article_id (
            id,
            nom,
            reference
          )
        `)
        .eq('bon_livraison_id', bonLivraisonId);

      if (articlesError) {
        console.error('❌ Erreur lors de la récupération des articles:', articlesError);
        throw new Error(`Erreur de récupération des articles: ${articlesError.message}`);
      }

      // 2. Vérifier les précommandes en attente si demandé
      if (!skipPrecommandesCheck) {
        console.log('🔍 Vérification des précommandes en attente...');
        
        const articlesWithQuantities = approvalData.articles
          .map(approvalArticle => {
            const articleData = articlesData?.find(a => a.id === approvalArticle.id);
            return articleData ? {
              article_id: articleData.article_id,
              quantite_recue: approvalArticle.quantite_recue
            } : null;
          })
          .filter(Boolean);

        // Cette vérification sera gérée par le composant parent
        // Nous continuons avec l'approbation normale
      }

      // 3. Mettre à jour les quantités reçues pour chaque article
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

      // 4. Mettre à jour le bon de livraison avec la destination et le statut
      const updateData: any = {
        statut: 'receptionne',
        date_reception: new Date().toISOString()
      };

      if (approvalData.destinationType === 'entrepot') {
        updateData.entrepot_destination_id = approvalData.destinationId;
      } else {
        updateData.point_vente_destination_id = approvalData.destinationId;
      }

      const { error: bonError } = await supabase
        .from('bons_de_livraison')
        .update(updateData)
        .eq('id', bonLivraisonId);

      if (bonError) {
        console.error('❌ Erreur lors de la mise à jour du bon:', bonError);
        throw new Error(`Erreur de mise à jour du bon: ${bonError.message}`);
      }

      // 5. Le trigger handle_bon_livraison_approval() se chargera automatiquement de créer
      // les entrées de stock de type "achat" UNIQUEMENT (plus de doublons "correction")
      
      console.log('✅ Approbation terminée avec succès - Les entrées de stock seront créées automatiquement par le trigger');
      return bonLivraisonId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bons-livraison'] });
      queryClient.invalidateQueries({ queryKey: ['bon-livraison-articles'] });
      queryClient.invalidateQueries({ queryKey: ['factures-achat'] });
      queryClient.invalidateQueries({ queryKey: ['stock-principal'] });
      queryClient.invalidateQueries({ queryKey: ['stock-pdv'] });
      queryClient.invalidateQueries({ queryKey: ['entrees-stock'] });
      
      toast({
        title: "✅ Bon de livraison approuvé",
        description: "Le bon de livraison a été approuvé et le stock mis à jour correctement.",
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
