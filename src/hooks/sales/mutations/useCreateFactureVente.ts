
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
      console.log('🔄 Création facture de vente - début du processus');
      
      // PROTECTION: Vérifier qu'on ne crée pas de doublons
      const timestamp = Date.now();
      const uniqueRef = `creation-${timestamp}`;
      console.log('🆔 Référence unique pour cette création:', uniqueRef);

      // 1. Créer la facture et ses lignes
      const { facture, lignes: lignesCreees } = await createFactureAndLines(data);
      console.log('✅ Facture créée:', facture.id);

      // 2. Traiter le paiement SEULEMENT s'il y en a un
      if (data.payment_data) {
        console.log('💰 Traitement du paiement...');
        await processPayment(data.payment_data, facture);
      }

      // 3. Traiter la livraison SEULEMENT si confirmée
      if (data.payment_data?.confirm_delivery) {
        console.log('📦 Traitement de la livraison...');
        await processDelivery(data.payment_data, facture, lignesCreees);
      }

      // 4. Mettre à jour le stock PDV seulement si spécifié
      if (data.point_vente_id) {
        console.log('📦 Mise à jour stock PDV...');
        await updateStockPDV(data, facture);
      }

      console.log('🎉 Processus de création terminé avec succès');
      return { facture, lignes: lignesCreees };
    },
    onSuccess: () => {
      console.log('✅ Facture de vente créée avec statuts corrects');
      
      // Invalider toutes les queries liées
      queryClient.invalidateQueries({ queryKey: ['factures_vente'] });
      queryClient.invalidateQueries({ queryKey: ['stock-pdv'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['cash_registers'] });
      queryClient.invalidateQueries({ queryKey: ['all-financial-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['cash-register-balance'] });
      queryClient.invalidateQueries({ queryKey: ['complete-transaction-history'] });
      
      // Forcer le refetch immédiat des données critiques
      queryClient.refetchQueries({ queryKey: ['complete-transaction-history'] });
      
      toast.success('Facture créée avec succès');
    },
    onError: (error: Error) => {
      console.error('❌ Erreur lors de la création de la facture:', error);
      toast.error('Erreur lors de la création de la facture');
    }
  });
};
