
import React from 'react';
import PaymentModal from './PaymentModal';
import PostPaymentActions from './PostPaymentActions';

interface VenteModalsProps {
  showPaymentModal: boolean;
  setShowPaymentModal: (show: boolean) => void;
  showPostPaymentActions: boolean;
  handlePaymentConfirm: (paymentData: any) => Promise<void>;
  handlePostPaymentClose: () => void;
  totalAmount: number;
  cartItems: any[];
  isLoading: boolean;
  lastFacture: any;
  selectedClient?: any;
}

const VenteModals: React.FC<VenteModalsProps> = ({
  showPaymentModal,
  setShowPaymentModal,
  showPostPaymentActions,
  handlePaymentConfirm,
  handlePostPaymentClose,
  totalAmount,
  cartItems,
  isLoading,
  lastFacture,
  selectedClient
}) => {
  // Calculate totals for PaymentModal
  const totals = {
    montant_ht: totalAmount / 1.18, // Assuming 18% VAT
    tva: totalAmount - (totalAmount / 1.18),
    montant_ttc: totalAmount
  };

  return (
    <>
      {/* Modal de paiement optimisée */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        cart={cartItems}
        client={selectedClient}
        totals={totals}
        onConfirm={handlePaymentConfirm}
        isLoading={isLoading}
      />

      {/* Actions post-paiement améliorées */}
      <PostPaymentActions
        isOpen={showPostPaymentActions}
        onClose={handlePostPaymentClose}
        factureData={lastFacture || {}}
      />
    </>
  );
};

export default VenteModals;
