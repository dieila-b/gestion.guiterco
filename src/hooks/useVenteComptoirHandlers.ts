
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
      console.log('🔄 *** CONFIRMATION PAIEMENT *** Données reçues:', paymentData);
      
      // *** CONSTRUCTION VENTEDATA AVEC STATUT LIVRAISON OBLIGATOIRE ***
      const venteData = {
        client_id: selectedClient,
        montant_ht: cartTotals.total / 1.2,
        tva: cartTotals.total * 0.2 / 1.2,
        montant_ttc: cartTotals.total,
        mode_paiement: paymentData.mode_paiement,
        point_vente_id: selectedPDV, // *** UUID ou nom - sera résolu automatiquement ***
        montant_paye: paymentData.montant_paye || 0,
        notes: paymentData.notes,
        // *** TRANSMISSION STATUT LIVRAISON OBLIGATOIRE ***
        statut_livraison: paymentData.statut_livraison || 'livree', // Par défaut livraison complète
        delivery_status: paymentData.delivery_status || paymentData.statut_livraison || 'livree'
      };
      
      console.log('📋 *** VENTEDATA CONSTRUIT *** avec statut livraison:', venteData);
      console.log('🛒 *** CART À ENVOYER *** :', cart.length, 'articles');
      console.log('📦 *** POINT DE VENTE *** :', selectedPDV);
      
      // *** APPEL CRÉATION VENTE AVEC GESTION STOCK OBLIGATOIRE ***
      const result = await createVente({
        venteData,
        cart
      });
      
      setLastFacture(result.facture);
      setShowPaymentModal(false);
      setShowPostPaymentActions(true);
      
      // Réinitialisation automatique après validation
      setSelectedClient('');
      
      // *** MESSAGES DE SUCCÈS ADAPTATIFS ***
      const montantPaye = paymentData.montant_paye || 0;
      if (montantPaye === 0) {
        toast.success('✅ Facture créée - Stock décrémenté - Aucun paiement enregistré');
      } else if (montantPaye < cartTotals.total) {
        toast.success(`✅ Facture créée - Stock décrémenté - Paiement partiel de ${montantPaye}€ enregistré`);
      } else {
        toast.success('✅ Facture créée - Stock décrémenté - Paiement complet reçu');
      }
    } catch (error) {
      console.error('❌ *** ERREUR VENTE *** :', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création de la vente';
      toast.error(`❌ ${errorMessage}`);
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
