
import { useState } from 'react';
import { useCreateFactureVente } from '@/hooks/sales/mutations/useCreateFactureVente';
import type { CartItem } from './types';

export const useVenteMutation = (
  pointsDeVente: any[],
  selectedPDV?: string,
  setCart?: (cart: CartItem[]) => void,
  restoreLocalStock?: () => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const createFactureVenteMutation = useCreateFactureVente();

  const createVente = async (venteData: {
    client_id: string;
    cart: CartItem[];
    montant_ht: number;
    tva: number;
    montant_ttc: number;
    mode_paiement: string;
    point_vente_id: string;
    payment_data?: {
      montant_paye: number;
      mode_paiement: string;
      statut_livraison: string;
      statut_paiement: string;
      quantite_livree: Record<string, number>;
      notes?: string;
    };
  }) => {
    console.log('🚀 Début création vente comptoir optimisée:', venteData);
    
    setIsLoading(true);
    
    try {
      // Trouver l'ID réel du point de vente
      const pdvSelected = pointsDeVente.find(pdv => 
        pdv.id === selectedPDV || pdv.nom === selectedPDV
      );
      
      const pointVenteId = pdvSelected?.id || selectedPDV;
      console.log('📍 Point de vente sélectionné:', pointVenteId);

      // Préparer les données avec le statut de livraison correct
      const statutLivraison = venteData.payment_data?.statut_livraison || 'en_attente';
      console.log('📦 Statut livraison reçu depuis payment_data:', statutLivraison);

      const venteDataComplete = {
        ...venteData,
        point_vente_id: pointVenteId,
        payment_data: {
          ...venteData.payment_data,
          statut_livraison: statutLivraison
        }
      };

      console.log('📦 Statut livraison final envoyé:', venteDataComplete.payment_data?.statut_livraison);

      // Créer la facture avec le statut de paiement correct
      const result = await createFactureVenteMutation.mutateAsync(venteDataComplete);

      console.log('✅ Vente créée avec succès:', result);
      
      // Vider le panier après succès
      if (setCart) {
        setCart([]);
      }
      
      // Restaurer le stock local
      if (restoreLocalStock) {
        restoreLocalStock();
      }
      
      console.log('🎉 Vente comptoir terminée avec succès');
      
      return result;
      
    } catch (error) {
      console.error('❌ Erreur lors de la vente:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createVente,
    isLoading: isLoading || createFactureVenteMutation.isPending
  };
};
