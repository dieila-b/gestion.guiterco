import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Vente {
  id: string;
  created_at?: string;
  client_id?: string | null;
  montant_ht?: number | null;
  tva?: number | null;
  montant_ttc?: number | null;
  statut_paiement?: string | null;
  mode_paiement?: string | null;
  date_echeance?: string | null;
  observations?: string | null;
}

interface DetailVente {
  id: string;
  vente_id: string;
  produit_id: string;
  quantite: number;
  prix_unitaire: number;
  prix_total: number;
}

interface Stock {
  id: string;
  produit_id: string;
  quantite_en_stock: number;
  // Ajoutez d'autres propriétés si nécessaire
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

interface CartItem {
  id: string;
  nom: string;
  prix_vente: number;
  quantite: number;
  prix_total: number;
  stock_disponible: number;
}

export const useVenteMutation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fonction pour mettre à jour le stock après une vente
  const updateStockForDeliveredItem = async (productId: string, quantitySold: number) => {
    try {
      // Récupérer le stock actuel du produit
      const { data: currentStockData, error: currentStockError } = await supabase
        .from('stock')
        .select('quantite_en_stock')
        .eq('produit_id', productId)
        .single();

      if (currentStockError) throw currentStockError;

      const currentStock = currentStockData?.quantite_en_stock || 0;
      const newStock = Math.max(0, currentStock - quantitySold);

      // Mettre à jour le stock avec la nouvelle quantité
      const { error: updateError } = await supabase
        .from('stock')
        .update({ quantite_en_stock: newStock })
        .eq('produit_id', productId);

      if (updateError) throw updateError;

      console.log(`Stock mis à jour pour le produit ${productId}. Nouvelle quantité: ${newStock}`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du stock:', error);
      throw error;
    }
  };

  const createSaleTransaction = async (saleData: SaleData, saleId: string) => {
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
      const paymentMethodMap: { [key: string]: string } = {
        'especes': 'cash',
        'carte': 'card',
        'virement': 'transfer',
        'mobile_money': 'transfer', // Mobile money mappé vers transfer
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
          commentaire: `Vente #${saleId} - ${saleData.notes || 'Vente au comptoir'}`,
          date_operation: new Date().toISOString()
        });

      console.log('Transaction créée pour la vente', saleId);
    } catch (error) {
      console.error('Erreur lors de la création de la transaction:', error);
    }
  };

  const mutation = useMutation({
    mutationFn: async ({ cartItems, saleData }: { cartItems: CartItem[], saleData: SaleData }) => {
      console.log('Début de la création de vente...', { cartItems, saleData });

      try {
        // Créer la vente
        const { data: sale, error: saleError } = await supabase
          .from('ventes')
          .insert({
            client_id: saleData.client_id,
            montant_total: saleData.montant_total,
            montant_paye: saleData.montant_paye,
            mode_paiement: saleData.mode_paiement,
            statut_livraison: saleData.statut_livraison,
            notes: saleData.notes
          })
          .select()
          .single();

        if (saleError) throw saleError;

        console.log('Vente créée:', sale);

        // Créer les détails de vente et gérer le stock
        for (const item of cartItems) {
          // Créer détail de vente
          const { error: detailError } = await supabase
            .from('details_vente')
            .insert({
              vente_id: sale.id,
              produit_id: item.id,
              quantite: item.quantite,
              prix_unitaire: item.prix_vente,
              prix_total: item.prix_total
            });

          if (detailError) throw detailError;

          // Gérer les stocks selon le statut de livraison
          if (saleData.statut_livraison === 'livre') {
            await updateStockForDeliveredItem(item.id, item.quantite);
          } else if (saleData.statut_livraison === 'partiel' && saleData.quantite_livree) {
            const quantitePartielle = saleData.quantite_livree[item.id] || 0;
            if (quantitePartielle > 0) {
              await updateStockForDeliveredItem(item.id, quantitePartielle);
            }
          }
        }

        // Créer la transaction financière
        await createSaleTransaction(saleData, sale.id);

        console.log('Vente créée avec succès:', sale.id);
        return sale;

      } catch (error) {
        console.error('Erreur lors de la création de vente:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventes'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
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
