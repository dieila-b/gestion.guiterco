
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { CartItem, VenteComptoirData } from './types';
import { useCreateFactureVente } from '../sales/mutations/useFactureVenteMutations';

export const useVenteMutation = (
  pointsDeVente: any[],
  selectedPDV: string | undefined,
  setCart: (cart: CartItem[]) => void
) => {
  const createFactureVente = useCreateFactureVente();

  const mutation = useMutation({
    mutationFn: async (venteData: VenteComptoirData) => {
      console.log('🔄 Début création vente comptoir:', venteData);

      // Validation des données
      if (!venteData.client_id) {
        throw new Error('Client non sélectionné');
      }

      if (!venteData.cart || venteData.cart.length === 0) {
        throw new Error('Panier vide');
      }

      // Utiliser la mutation de création de facture
      const result = await createFactureVente.mutateAsync({
        client_id: venteData.client_id,
        cart: venteData.cart,
        montant_ht: venteData.montant_ht,
        tva: venteData.tva,
        montant_ttc: venteData.montant_ttc,
        mode_paiement: venteData.mode_paiement,
        point_vente_id: selectedPDV
      });

      console.log('✅ Vente comptoir créée avec succès:', result);
      return result;
    },
    onSuccess: () => {
      console.log('✅ Vente comptoir terminée avec succès');
      setCart([]);
      toast.success('Vente enregistrée avec succès');
    },
    onError: (error: Error) => {
      console.error('❌ Erreur lors de la vente:', error);
      toast.error(error.message || 'Erreur lors de la vente');
    }
  });

  return {
    createVente: mutation.mutateAsync,
    isLoading: mutation.isPending || createFactureVente.isPending
  };
};
