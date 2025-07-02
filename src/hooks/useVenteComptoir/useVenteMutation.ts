
import { useMutation } from '@tanstack/react-query';
import { createVenteComptoir } from './services/venteService';
import { updateStockAfterVente } from './services/stockService';

export const useVenteMutation = (
  pointsDeVente: any[],
  selectedPDV: string | undefined,
  setCart: (cart: any[]) => void,
  restoreLocalStock: () => void
) => {
  const mutation = useMutation({
    mutationFn: async ({ venteData, cart }: { venteData: any, cart: any[] }) => {
      console.log('🔄 Début mutation vente comptoir avec transaction caisse automatique');
      
      // 1. Créer la vente (avec transaction caisse automatique intégrée)
      const result = await createVenteComptoir(venteData, cart);
      
      // 2. Mettre à jour le stock
      if (selectedPDV) {
        const pdv = pointsDeVente.find(p => p.id === selectedPDV);
        if (pdv) {
          await updateStockAfterVente(cart, selectedPDV, pdv.nom);
        }
      }
      
      console.log('✅ Mutation vente comptoir terminée avec succès');
      return result;
    },
    onSuccess: () => {
      console.log('🎉 Vente créée avec succès - caisse automatiquement mise à jour');
      setCart([]);
      restoreLocalStock();
    },
    onError: (error) => {
      console.error('❌ Erreur mutation vente:', error);
      restoreLocalStock();
    }
  });

  return {
    createVente: mutation.mutateAsync,
    isLoading: mutation.isPending
  };
};
