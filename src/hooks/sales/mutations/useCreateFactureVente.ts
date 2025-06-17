
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { CreateFactureVenteData } from './types';
import { createFactureAndLines } from './services/factureCreationService';
import { processPayment } from './services/paymentProcessingService';
import { processDelivery } from './services/deliveryProcessingService';
import { updateStockPDV } from './services/stockUpdateService';

export const useCreateFactureVente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFactureVenteData & { payment_data?: any }) => {
      // 1. Créer la facture et ses lignes
      const { facture, lignes: lignesCreees } = await createFactureAndLines(data);

      // 2. Traiter le paiement SEULEMENT s'il y en a un
      await processPayment(data.payment_data, facture);

      // 3. Traiter la livraison SEULEMENT si confirmée
      await processDelivery(data.payment_data, facture, lignesCreees);

      // 4. Mettre à jour le stock PDV seulement si spécifié
      if (data.point_vente_id) {
        await updateStockPDV(data, facture);
      }

      return { facture, lignes: lignesCreees };
    },
    onSuccess: () => {
      console.log('✅ Facture de vente créée avec statuts corrects');
      queryClient.invalidateQueries({ queryKey: ['factures_vente'] });
      queryClient.invalidateQueries({ queryKey: ['stock-pdv'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['cash_registers'] });
      queryClient.invalidateQueries({ queryKey: ['all-financial-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['cash-register-balance'] });
      toast.success('Facture créée avec succès');
    },
    onError: (error: Error) => {
      console.error('❌ Erreur lors de la création de la facture:', error);
      toast.error('Erreur lors de la création de la facture');
    }
  });
};
