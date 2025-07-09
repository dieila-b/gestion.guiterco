
import { useState } from 'react';
import type { CartItem } from '@/hooks/useVenteComptoir/types';

interface UseVenteComptoirHandlersProps {
  selectedClient: any;
  cart: CartItem[];
  selectedPDV?: string;
  cartTotals: any;
  createVente: any;
  setShowPaymentModal: (show: boolean) => void;
  setShowPostPaymentActions: (show: boolean) => void;
  setSelectedClient: (client: any) => void;
  setLastFacture: (facture: any) => void;
  updateQuantity: (id: string, newQuantity: number) => void;
  updateRemise: (id: string, newRemise: number) => void;
}

export const useVenteComptoirHandlers = ({
  selectedClient,
  cart,
  selectedPDV,
  cartTotals,
  createVente,
  setShowPaymentModal,
  setShowPostPaymentActions,
  setSelectedClient,
  setLastFacture,
  updateQuantity,
  updateRemise
}: UseVenteComptoirHandlersProps) => {
  const [paymentPromiseResolve, setPaymentPromiseResolve] = useState<((paymentData: any) => void) | null>(null);

  const handleQuantityChange = (id: string, newQuantity: string) => {
    const numericQuantity = parseInt(newQuantity, 10) || 0;
    updateQuantity(id, numericQuantity);
  };

  const handleRemiseChange = (id: string, newRemise: string) => {
    const numericRemise = parseFloat(newRemise) || 0;
    updateRemise(id, numericRemise);
  };

  const handlePayment = () => {
    if (!selectedClient) {
      alert('Veuillez sélectionner un client');
      return;
    }

    if (cart.length === 0) {
      alert('Le panier est vide');
      return;
    }

    if (!selectedPDV) {
      alert('Veuillez sélectionner un point de vente');
      return;
    }

    setShowPaymentModal(true);
  };

  const handlePaymentConfirm = async (paymentData: {
    montant_paye: number;
    mode_paiement: string;
    statut_livraison: string;
    statut_paiement: string;
    quantite_livree: Record<string, number>;
    notes?: string;
  }) => {
    console.log('📦 Données vente préparées avec statut:', paymentData.statut_livraison);

    try {
      const venteData = {
        client_id: selectedClient.id,
        cart,
        montant_ht: cartTotals.sousTotal,
        tva: cartTotals.tva,
        montant_ttc: cartTotals.total,
        mode_paiement: paymentData.mode_paiement,
        point_vente_id: selectedPDV,
        payment_data: paymentData
      };

      const result = await createVente(venteData);
      
      setShowPaymentModal(false);
      setLastFacture(result.facture);
      setShowPostPaymentActions(true);
      
      // Réinitialiser le client après vente réussie
      setSelectedClient(null);
      
    } catch (error) {
      console.error('Erreur lors de la vente:', error);
      throw error;
    }
  };

  const handlePostPaymentClose = () => {
    setShowPostPaymentActions(false);
    setLastFacture(null);
  };

  return {
    handleQuantityChange,
    handleRemiseChange,
    handlePayment,
    handlePaymentConfirm,
    handlePostPaymentClose
  };
};
