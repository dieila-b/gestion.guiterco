
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

    // Safety check for cart
    const safeCart = Array.isArray(cart) ? cart : [];
    if (safeCart.length === 0) {
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
    console.log('👤 Client sélectionné:', selectedClient);

    try {
      // Ensure we have a valid client_id
      let clientId;
      if (typeof selectedClient === 'string') {
        // If selectedClient is just an ID string
        clientId = selectedClient;
      } else if (selectedClient && selectedClient.id) {
        // If selectedClient is an object with id property
        clientId = selectedClient.id;
      } else {
        throw new Error('Client ID invalide');
      }

      console.log('🔑 Client ID utilisé:', clientId);

      // Safety check for cart and cartTotals
      const safeCart = Array.isArray(cart) ? cart : [];
      const safeTotals = cartTotals || { sousTotal: 0, total: 0, tva: 0 };

      const venteData = {
        client_id: clientId,
        cart: safeCart,
        montant_ht: safeTotals.sousTotal || 0,
        tva: safeTotals.tva || 0,
        montant_ttc: safeTotals.total || 0,
        mode_paiement: paymentData.mode_paiement,
        point_vente_id: selectedPDV,
        payment_data: paymentData
      };

      console.log('📋 Données de vente finales:', venteData);

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
