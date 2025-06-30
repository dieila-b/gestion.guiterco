
import React from 'react';
import PaymentModal from './PaymentModal';
import PostPaymentActions from './PostPaymentActions';

interface VenteModalsProps {
  showPaymentModal: boolean;
  setShowPaymentModal: (show: boolean) => void;
  showPostPaymentActions: boolean;
  handlePaymentConfirm: (paymentData: any) => Promise<void>;
  handlePostPaymentClose: () => void;
  totals: {
    subtotal: number;
    tva: number;
    total: number;
  };
  cartItems: any[];
  isLoading: boolean;
  lastFacture: any;
  selectedClient: any;
}

const VenteModals: React.FC<VenteModalsProps> = ({
  showPaymentModal,
  setShowPaymentModal,
  showPostPaymentActions,
  handlePaymentConfirm,
  handlePostPaymentClose,
  totals,
  cartItems,
  isLoading,
  lastFacture,
  selectedClient
}) => {
  return (
    <>
      {/* Modal de paiement optimisée */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handlePaymentConfirm}
        totals={totals}
        cartItems={cartItems}
        isLoading={isLoading}
        selectedClient={selectedClient}
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
