
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  nom: string;
  prix_vente: number;
  quantite: number;
  prix_total: number;
  stock_disponible: number;
}

interface SaleData {
  client_id?: string;
  montant_total: number;
  montant_paye: number;
  mode_paiement: string;
  statut_livraison: string;
  notes?: string;
  quantite_livree?: { [key: string]: number };
}

export const useVenteMutation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fonction pour mettre à jour le stock PDV après une vente
  const updateStockPDV = async (productId: string, quantitySold: number) => {
    try {
      // Récupérer le stock actuel du produit depuis stock_pdv
      const { data: currentStockData, error: currentStockError } = await supabase
        .from('stock_pdv')
        .select('quantite_disponible')
        .eq('article_id', productId)
        .single();

      if (currentStockError && currentStockError.code !== 'PGRST116') {
        throw currentStockError;
      }

      const currentStock = currentStockData?.quantite_disponible || 0;
      const newStock = Math.max(0, currentStock - quantitySold);

      // Mettre à jour le stock avec la nouvelle quantité
      const { error: updateError } = await supabase
        .from('stock_pdv')
        .update({ quantite_disponible: newStock })
        .eq('article_id', productId);

      if (updateError) throw updateError;

      console.log(`Stock PDV mis à jour pour le produit ${productId}. Nouvelle quantité: ${newStock}`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du stock PDV:', error);
      throw error;
    }
  };

  const createSaleTransaction = async (saleData: SaleData, factureId: string) => {
    try {
      // Récupérer la caisse principale
      const { data: cashRegisters } = await supabase
        .from('cash_registers')
        .select('id')
        .limit(1);

      if (!cashRegisters?.length) {
        console.warn('Aucune caisse trouvée pour enregistrer la transaction');
        return;
      }

      // Mapper les modes de paiement pour correspondre aux types de la base
      const paymentMethodMap: { [key: string]: 'cash' | 'card' | 'transfer' | 'check' } = {
        'especes': 'cash',
        'carte': 'card',
        'virement': 'transfer',
        'mobile_money': 'transfer',
        'cash': 'cash',
        'card': 'card',
        'transfer': 'transfer',
        'check': 'check'
      };

      const mappedPaymentMethod = paymentMethodMap[saleData.mode_paiement] || 'cash';

      // Créer une transaction d'entrée pour la vente
      await supabase
        .from('transactions')
        .insert({
          amount: saleData.montant_paye,
          type: 'income',
          category: 'sales',
          cash_register_id: cashRegisters[0].id,
          payment_method: mappedPaymentMethod,
          description: `Vente #${factureId}`,
          commentaire: `Vente #${factureId} - ${saleData.notes || 'Vente au comptoir'}`,
          date_operation: new Date().toISOString()
        });

      console.log('Transaction créée pour la vente', factureId);
    } catch (error) {
      console.error('Erreur lors de la création de la transaction:', error);
    }
  };

  const mutation = useMutation({
    mutationFn: async ({ cartItems, saleData }: { cartItems: CartItem[], saleData: SaleData }) => {
      console.log('Début de la création de vente...', { cartItems, saleData });

      try {
        // Créer la facture de vente - le numero_facture sera généré automatiquement par le trigger
        const { data: facture, error: factureError } = await supabase
          .from('factures_vente')
          .insert({
            numero_facture: '', // Sera remplacé par le trigger
            client_id: saleData.client_id!,
            montant_ttc: saleData.montant_total,
            montant_ht: saleData.montant_total / 1.2, // Supposons 20% de TVA
            tva: saleData.montant_total - (saleData.montant_total / 1.2),
            statut_paiement: saleData.montant_paye >= saleData.montant_total ? 'paye' : 'partiel',
            mode_paiement: saleData.mode_paiement,
            statut_livraison: saleData.statut_livraison,
            observations: saleData.notes
          })
          .select()
          .single();

        if (factureError) throw factureError;

        console.log('Facture créée:', facture);

        // Créer les lignes de facture et gérer le stock
        for (const item of cartItems) {
          // Créer ligne de facture
          const { error: ligneError } = await supabase
            .from('lignes_facture_vente')
            .insert({
              facture_vente_id: facture.id,
              article_id: item.id,
              quantite: item.quantite,
              prix_unitaire: item.prix_vente,
              montant_ligne: item.prix_total
            });

          if (ligneError) throw ligneError;

          // Gérer les stocks selon le statut de livraison
          if (saleData.statut_livraison === 'livree') {
            await updateStockPDV(item.id, item.quantite);
          } else if (saleData.statut_livraison === 'partiel' && saleData.quantite_livree) {
            const quantitePartielle = saleData.quantite_livree[item.id] || 0;
            if (quantitePartielle > 0) {
              await updateStockPDV(item.id, quantitePartielle);
            }
          }
        }

        // Créer la transaction financière
        await createSaleTransaction(saleData, facture.id);

        console.log('Vente créée avec succès:', facture.id);
        return facture;

      } catch (error) {
        console.error('Erreur lors de la création de vente:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['factures_vente'] });
      queryClient.invalidateQueries({ queryKey: ['stock_pdv'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['cash-register-balance'] });
      queryClient.invalidateQueries({ queryKey: ['transactions-financieres-aujourdhui'] });
      
      toast({
        title: "Vente enregistrée",
        description: "La vente a été enregistrée avec succès.",
      });
    },
    onError: (error) => {
      console.error('Erreur mutation vente:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la vente. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  return mutation;
};
