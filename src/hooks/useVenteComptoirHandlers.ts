
import { toast } from 'sonner';

interface UseVenteComptoirHandlersProps {
  selectedClient: string;
  cart: any[];
  selectedPDV: string;
  cartTotals: { total: number };
  createVente: (data: any) => Promise<any>;
  setShowPaymentModal: (show: boolean) => void;
  setShowPostPaymentActions: (show: boolean) => void;
  setSelectedClient: (client: string) => void;
  setLastFacture: (facture: any) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateRemise: (productId: string, remise: number) => void;
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
  
  const handlePayment = async () => {
    if (!selectedClient) {
      toast.error('Veuillez sélectionner un client');
      return;
    }

    if (cart.length === 0) {
      toast.error('Le panier est vide');
      return;
    }

    if (!selectedPDV) {
      toast.error('Veuillez sélectionner un point de vente');
      return;
    }

    setShowPaymentModal(true);
  };

  const handlePaymentConfirm = async (paymentData: any) => {
    try {
      console.log('🔄 Données paiement reçues:', paymentData);
      
      const result = await createVente({
        client_id: selectedClient,
        cart: cart,
        montant_ht: cartTotals.total / 1.2,
        tva: cartTotals.total * 0.2 / 1.2,
        montant_ttc: cartTotals.total,
        mode_paiement: paymentData.mode_paiement,
        point_vente_id: selectedPDV,
        payment_data: {
          montant_paye: paymentData.montant_paye || 0,
          mode_paiement: paymentData.mode_paiement,
          notes: paymentData.notes
        }
      });
      
      setLastFacture(result.facture);
      setShowPaymentModal(false);
      setShowPostPaymentActions(true);
      
      // Réinitialisation automatique après validation
      setSelectedClient('');
      
      // Message de succès adaptatif selon le montant payé
      const montantPaye = paymentData.montant_paye || 0;
      if (montantPaye === 0) {
        toast.success('Facture créée - Aucun paiement enregistré');
      } else if (montantPaye < cartTotals.total) {
        toast.success(`Facture créée - Paiement partiel de ${montantPaye}€ enregistré`);
      } else {
        toast.success('Facture créée - Paiement complet reçu');
      }
    } catch (error) {
      console.error('Erreur lors de la vente:', error);
    }
  };

  const handleQuantityChange = (productId: string, newQuantity: string) => {
    const quantity = parseInt(newQuantity) || 0;
    if (quantity > 0) {
      updateQuantity(productId, quantity);
    }
  };

  const handleRemiseChange = (productId: string, newRemise: string) => {
    const remise = parseFloat(newRemise) || 0;
    updateRemise(productId, remise);
  };

  const handlePostPaymentClose = () => {
    setShowPostPaymentActions(false);
    setLastFacture(null);
    // Réinitialisation complète après fermeture des actions post-paiement
    setSelectedClient('');
  };

  return {
    handlePayment,
    handlePaymentConfirm,
    handleQuantityChange,
    handleRemiseChange,
    handlePostPaymentClose
  };
};
