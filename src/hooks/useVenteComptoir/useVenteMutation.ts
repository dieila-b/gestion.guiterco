
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { VenteComptoirData } from './types';
import { validateVenteData } from './utils/validationUtils';
import { createVenteEntries } from './services/venteService';
import { createCashTransaction } from './services/transactionService';
import { updateStockPDV } from './services/stockService';

export const useVenteMutation = (pointsDeVente?: any[], selectedPDV?: string, setCart?: (cart: any[]) => void) => {
  const queryClient = useQueryClient();

  // Mutation pour créer une vente avec gestion des paiements et livraisons
  const createVente = useMutation({
    mutationFn: async (venteData: VenteComptoirData) => {
      console.log('Données de vente reçues:', venteData);

      // Validation des données critiques
      validateVenteData(venteData);

      const pdvSelected = pointsDeVente?.find(pdv => pdv.nom === selectedPDV);
      if (!pdvSelected) throw new Error('Point de vente non trouvé');

      // Créer toutes les entrées de vente (commande, facture, versements)
      const result = await createVenteEntries(venteData, pdvSelected);

      // Créer une transaction de caisse uniquement si il y a un paiement effectif
      await createCashTransaction(venteData, result.numeroFacture);

      // Mettre à jour le stock PDV
      await updateStockPDV(venteData, pdvSelected);

      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['commandes_clients'] });
      queryClient.invalidateQueries({ queryKey: ['factures_vente'] });
      queryClient.invalidateQueries({ queryKey: ['stock_pdv'] });
      // Invalider aussi les données de caisse - CRUCIAL pour voir les ventes
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['today-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['cash-registers'] });
      queryClient.invalidateQueries({ queryKey: ['vue_solde_caisse'] });
      queryClient.invalidateQueries({ queryKey: ['all-financial-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['cash-register-balance'] });
      
      setCart?.([]);
      
      if (result.statutPaiement === 'paye') {
        toast.success('Vente enregistrée avec succès - Paiement complet');
      } else if (result.statutPaiement === 'partiel') {
        toast.success(`Vente enregistrée avec succès - Paiement partiel (Reste: ${result.montantRestant.toLocaleString()} GNF)`);
      } else {
        toast.success('Vente enregistrée avec succès - En attente de paiement');
      }
    },
    onError: (error) => {
      console.error('Erreur lors de la vente:', error);
      toast.error(`Erreur lors de l'enregistrement de la vente: ${error.message}`);
    }
  });

  return {
    createVente,
    isLoading: createVente.isPending
  };
};
