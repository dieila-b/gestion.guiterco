
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { validateFactureData } from './services/validationService';
import { mapDeliveryStatus } from './services/statusMappingService';
import { createFactureVente } from './services/factureService';
import { createLignesFacture } from './services/lignesFactureService';
import { processPayment } from './services/paymentService';
import { verifyFactureStatus } from './services/verificationService';
import { updateStockPDV } from './services/stockUpdateService';

export const useCreateFactureVente = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      console.log('🚀 Début création facture vente avec données:', data);
      console.log('🚀 Données de paiement reçues:', data.payment_data);

      // Validation des données
      validateFactureData(data);

      // Déterminer le statut de livraison ID (CORRECTION: retourne maintenant un ID)
      const statutLivraisonId = await mapDeliveryStatus(data.payment_data);

      // Créer la facture principale avec l'ID de statut
      const facture = await createFactureVente(data, statutLivraisonId);

      // Créer les lignes de facture avec l'ID de statut
      const lignesCreees = await createLignesFacture(data, facture.id, statutLivraisonId);

      // Mettre à jour le stock PDV si nécessaire
      if (data.point_vente_id) {
        console.log('📦 DÉBUT MISE À JOUR STOCK PDV RÉEL pour:', data.point_vente_id);
        try {
          await updateStockPDV(data, facture);
          console.log('✅ Stock PDV mis à jour avec succès dans la base de données');
        } catch (stockError) {
          console.error('❌ ERREUR CRITIQUE lors de la mise à jour du stock PDV:', stockError);
          toast.error('Attention: La vente est créée mais le stock n\'a pas pu être mis à jour automatiquement');
        }
      }

      // Traiter le paiement si nécessaire
      await processPayment(data, facture);

      // Vérification finale du statut (maintenant avec l'ID)
      const statutFinal = await verifyFactureStatus(facture.id, statutLivraisonId);

      console.log('🎉 Facture vente créée avec succès - Statut final ID:', {
        paiement: facture.statut_paiement,
        livraison_id: statutFinal
      });

      return { 
        facture: { 
          ...facture, 
          statut_livraison_id: statutFinal 
        }, 
        lignes: lignesCreees 
      };
    },
    onSuccess: () => {
      // Invalider toutes les queries liées aux factures et au stock pour forcer le rafraîchissement
      queryClient.invalidateQueries({ queryKey: ['factures_vente'] });
      queryClient.invalidateQueries({ queryKey: ['factures-vente-details'] });
      queryClient.invalidateQueries({ queryKey: ['stock_pdv'] });
      queryClient.invalidateQueries({ queryKey: ['stock-pdv'] });
      
      // Force le refetch immédiat
      queryClient.refetchQueries({ queryKey: ['factures_vente'] });
      queryClient.refetchQueries({ queryKey: ['stock_pdv'] });
      
      console.log('✅ Queries invalidées et données rafraîchies (factures + stock)');
      
      toast.success('Vente finalisée avec succès - Stock mis à jour');
    },
    onError: (error: Error) => {
      console.error('❌ Erreur création facture vente:', error);
      toast.error('Erreur lors de la création de la facture');
    }
  });
};
