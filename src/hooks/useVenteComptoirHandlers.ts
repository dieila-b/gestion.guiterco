
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface VenteComptoirHandlersProps {
  selectedClient: string;
  cart: any[];
  selectedPDV: string;
  cartTotals: { sousTotal: number; total: number };
  createVente: any;
  setShowPaymentModal: (show: boolean) => void;
  setShowPostPaymentActions: (show: boolean) => void;
  setSelectedClient: (client: string) => void;
  setLastFacture: (facture: any) => void;
  updateQuantity: any;
  updateRemise: any;
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
}: VenteComptoirHandlersProps) => {
  const { toast } = useToast();

  const handlePayment = useCallback(() => {
    if (!selectedClient) {
      toast({
        title: "Client requis",
        description: "Veuillez sélectionner un client avant de procéder au paiement",
        variant: "destructive"
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "Panier vide",
        description: "Ajoutez des articles avant de procéder au paiement",
        variant: "destructive"
      });
      return;
    }

    setShowPaymentModal(true);
  }, [selectedClient, cart, setShowPaymentModal, toast]);

  const handlePaymentConfirm = useCallback(async (paymentData: any) => {
    try {
      const result = await createVente.mutateAsync({
        clientId: selectedClient,
        articles: cart,
        pointDeVente: selectedPDV,
        modesPaiement: paymentData.modesPaiement,
        totalAmount: cartTotals.total
      });

      setLastFacture(result);
      setShowPaymentModal(false);
      setShowPostPaymentActions(true);
      
      toast({
        title: "Vente enregistrée",
        description: `Facture ${result.numero_facture} créée avec succès`
      });
    } catch (error) {
      console.error('Erreur lors de la création de la vente:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la vente",
        variant: "destructive"
      });
    }
  }, [createVente, selectedClient, cart, selectedPDV, cartTotals.total, setLastFacture, setShowPaymentModal, setShowPostPaymentActions, toast]);

  const handlePostPaymentClose = useCallback(() => {
    setShowPostPaymentActions(false);
    setSelectedClient('');
    setLastFacture(null);
  }, [setShowPostPaymentActions, setSelectedClient, setLastFacture]);

  const handleQuantityChange = useCallback((productId: string, newQuantity: string) => {
    const quantity = parseInt(newQuantity) || 1;
    if (quantity > 0 && quantity <= 1000) {
      updateQuantity(productId, quantity);
    }
  }, [updateQuantity]);

  const handleRemiseChange = useCallback((productId: string, newRemise: string) => {
    const remise = parseFloat(newRemise) || 0;
    if (remise >= 0 && remise <= 100) {
      updateRemise(productId, remise);
    }
  }, [updateRemise]);

  return {
    handlePayment,
    handlePaymentConfirm,
    handlePostPaymentClose,
    handleQuantityChange,
    handleRemiseChange
  };
};
