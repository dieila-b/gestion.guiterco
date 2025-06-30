
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
  lastFacture
}) => {
  return (
    <>
      {/* Modal de paiement optimisée */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handlePaymentConfirm}
        totalAmount={totalAmount}
        cartItems={cartItems}
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
