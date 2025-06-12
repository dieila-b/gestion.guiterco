
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
    mutationFn: async ({ bonLivraisonId, approvalData }: { bonLivraisonId: string, approvalData: ApprovalData }) => {
      console.log('🚀 Début de l\'approbation du bon de livraison:', bonLivraisonId);
      
      // 1. Mettre à jour le bon de livraison avec la destination
      const updateData: any = {
        statut: 'livre',
        date_reception: new Date().toISOString(),
      };

      if (approvalData.destinationType === 'entrepot') {
        updateData.entrepot_destination_id = approvalData.destinationId;
        updateData.point_vente_destination_id = null;
      } else {
        updateData.point_vente_destination_id = approvalData.destinationId;
        updateData.entrepot_destination_id = null;
      }

      const { error: bonLivraisonError } = await supabase
        .from('bons_de_livraison')
        .update(updateData)
        .eq('id', bonLivraisonId);

      if (bonLivraisonError) {
        console.error('❌ Erreur mise à jour bon de livraison:', bonLivraisonError);
        throw new Error(`Erreur lors de la mise à jour du bon de livraison: ${bonLivraisonError.message}`);
      }

      console.log('✅ Bon de livraison mis à jour');

      // 2. Mettre à jour les quantités reçues pour chaque article
      for (const article of approvalData.articles) {
        console.log(`🔄 Mise à jour article ${article.id} avec quantité reçue: ${article.quantite_recue}`);
        
        const { error: articleError } = await supabase
          .from('articles_bon_livraison')
          .update({ 
            quantite_recue: article.quantite_recue,
            updated_at: new Date().toISOString()
          })
          .eq('id', article.id);

        if (articleError) {
          console.error('❌ Erreur de mise à jour de l\'article:', articleError);
          throw new Error(`Erreur de mise à jour de l'article: ${articleError.message}`);
        }
      }

      console.log('✅ Tous les articles mis à jour');

      // 3. Récupérer les informations du bon de livraison pour générer la facture
      const { data: bonLivraison, error: fetchError } = await supabase
        .from('bons_de_livraison')
        .select(`
          *,
          bon_commande:bons_de_commande!fk_bons_livraison_bon_commande_id(*)
        `)
        .eq('id', bonLivraisonId)
        .single();

      if (fetchError) {
        console.error('❌ Erreur récupération bon de livraison:', fetchError);
        throw new Error(`Erreur lors de la récupération du bon de livraison: ${fetchError.message}`);
      }

      // 4. Générer automatiquement une facture d'achat
      if (bonLivraison.bon_commande) {
        const numeroFacture = `FA-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
        
        const { error: factureError } = await supabase
          .from('factures_achat')
          .insert({
            numero_facture: numeroFacture,
            bon_commande_id: bonLivraison.bon_commande_id,
            bon_livraison_id: bonLivraisonId,
            fournisseur: bonLivraison.fournisseur,
            date_facture: new Date().toISOString(),
            montant_ht: bonLivraison.bon_commande.montant_ht || 0,
            tva: bonLivraison.bon_commande.tva || 0,
            montant_ttc: bonLivraison.bon_commande.montant_total || 0,
            transit_douane: bonLivraison.bon_commande.transit_douane || 0,
            taux_tva: bonLivraison.bon_commande.taux_tva || 20,
            statut_paiement: 'en_attente',
            observations: `Facture générée automatiquement à partir du bon de livraison ${bonLivraison.numero_bon}`,
            created_by: 'System'
          });

        if (factureError) {
          console.error('❌ Erreur génération facture:', factureError);
          // Ne pas faire échouer tout le processus si la facture ne peut pas être créée
          console.warn('La facture n\'a pas pu être générée automatiquement');
        } else {
          console.log('✅ Facture d\'achat générée automatiquement');
        }
      }

      return { success: true };
    },
    onSuccess: () => {
      // Invalider les caches pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['bons-livraison'] });
      queryClient.invalidateQueries({ queryKey: ['all-bon-livraison-articles-counts'] });
      queryClient.invalidateQueries({ queryKey: ['factures-achat'] });
      queryClient.invalidateQueries({ queryKey: ['entrees-stock'] });
      queryClient.invalidateQueries({ queryKey: ['stock-principal'] });
      queryClient.invalidateQueries({ queryKey: ['stock-pdv'] });
      
      toast({
        title: "Bon de livraison approuvé avec succès",
        description: "Le stock a été mis à jour et une facture d'achat a été générée automatiquement.",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error('❌ Erreur lors de l\'approbation:', error);
      toast({
        title: "Erreur lors de l'approbation",
        description: error instanceof Error ? error.message : "Une erreur inattendue s'est produite",
        variant: "destructive",
      });
    }
  });

  return {
    approveBonLivraison,
    isApproving: approveBonLivraison.isPending
  };
};
