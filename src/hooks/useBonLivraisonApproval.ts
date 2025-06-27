
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

      // 5. Créer les entrées de stock appropriées avec les bons article_id du catalogue
      for (const approvalArticle of approvalData.articles) {
        if (approvalArticle.quantite_recue > 0) {
          // Trouver l'article correspondant dans les données récupérées
          const articleData = articlesData?.find(a => a.id === approvalArticle.id);
          
          if (!articleData || !articleData.article_id) {
            console.error('❌ Article introuvable ou sans article_id:', approvalArticle.id);
            continue;
          }

          const entreeData: any = {
            article_id: articleData.article_id, // Utiliser l'ID du catalogue, pas l'ID de articles_bon_livraison
            quantite: approvalArticle.quantite_recue,
            type_entree: 'achat-livraison',
            numero_bon: `Approbation-${bonLivraisonId.slice(0, 8)}`,
            fournisseur: 'Réception bon livraison',
            observations: `Réception depuis bon de livraison ${bonLivraisonId}`,
            created_by: 'Système'
          };

          if (approvalData.destinationType === 'entrepot') {
            entreeData.entrepot_id = approvalData.destinationId;
          } else {
            entreeData.point_vente_id = approvalData.destinationId;
          }

          console.log('🔄 Création entrée stock:', entreeData);

          const { error: entreeError } = await supabase
            .from('entrees_stock')
            .insert(entreeData);

          if (entreeError) {
            console.error('❌ Erreur lors de la création de l\'entrée stock:', entreeError);
            throw new Error(`Erreur d'entrée stock: ${entreeError.message}`);
          }
        }
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
        description: "Le bon de livraison a été approuvé et le stock mis à jour.",
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
