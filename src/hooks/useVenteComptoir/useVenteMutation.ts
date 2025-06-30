
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { CartItem, VenteComptoirData } from './types';
import { useCreateFactureVente } from '../sales/mutations';

export const useVenteMutation = (
  pointsDeVente: any[],
  selectedPDV: string | undefined,
  setCart: (cart: CartItem[]) => void,
  restoreLocalStock?: () => void
) => {
  const createFactureVente = useCreateFactureVente();

  const mutation = useMutation({
    mutationFn: async (venteData: VenteComptoirData) => {
      console.log('🚀 Début création vente comptoir optimisée:', venteData);

      // Validation rapide des données essentielles
      if (!venteData.client_id || !venteData.cart?.length || !selectedPDV) {
        throw new Error('Données de vente incomplètes');
      }

      // Récupérer l'ID du point de vente de manière optimisée
      const pdvSelected = pointsDeVente?.find(pdv => pdv.nom === selectedPDV);
      const pointVenteId = pdvSelected?.id || selectedPDV;

      console.log('📍 Point de vente sélectionné:', pointVenteId);

      // Préparer les données optimisées pour la création
      const factureData = {
        client_id: venteData.client_id,
        cart: venteData.cart,
        montant_ht: venteData.montant_ht,
        tva: venteData.tva,
        montant_ttc: venteData.montant_ttc,
        mode_paiement: venteData.mode_paiement,
        point_vente_id: pointVenteId,
        payment_data: venteData.payment_data
      };

      // Exécution optimisée de la création
      const result = await createFactureVente.mutateAsync(factureData);
      console.log('✅ Vente créée avec succès:', result);
      
      return result;
    },
    onSuccess: (result) => {
      console.log('🎉 Vente comptoir terminée avec succès');
      
      // Nettoyage rapide et efficace
      setCart([]);
      
      // ⚠️ IMPORTANT: NE PAS RESTAURER LE STOCK LOCAL après une vente réussie
      // Le stock a été définitivement mis à jour dans la base de données
      // La restauration ne doit se faire QUE en cas d'erreur
      
      // Message de succès concis
      toast.success('Vente enregistrée avec succès', {
        description: `Facture ${result.facture.numero_facture} créée - Stock mis à jour`,
        duration: 3000
      });
    },
    onError: (error: Error) => {
      console.error('❌ Erreur lors de la vente:', error);
      
      // Restaurer le stock local SEULEMENT en cas d'erreur
      if (restoreLocalStock) {
        console.log('🔄 Restauration du stock local suite à l\'erreur');
        restoreLocalStock();
      }
      
      toast.error('Erreur lors de la vente', {
        description: error.message,
        duration: 5000
      });
    }
  });

  return {
    createVente: mutation.mutateAsync,
    isLoading: mutation.isPending || createFactureVente.isPending
  };
};
