
import React from 'react';
import { useVenteComptoirState } from '@/hooks/useVenteComptoirState';
import { useVenteComptoirHandlers } from '@/hooks/useVenteComptoirHandlers';
import VenteMainContent from './components/VenteMainContent';
import VenteModals from './components/VenteModals';

const VenteComptoirResponsive = () => {
  const state = useVenteComptoirState();
  
  const handlers = useVenteComptoirHandlers({
    selectedClient: state.selectedClient,
    cart: state.venteComptoir.cart,
    selectedPDV: state.selectedPDV,
    cartTotals: state.cartTotals,
    createVente: state.venteComptoir.createVente,
    setShowPaymentModal: state.setShowPaymentModal,
    setShowPostPaymentActions: state.setShowPostPaymentActions,
    setSelectedClient: state.setSelectedClient,
    setLastFacture: state.setLastFacture,
    updateQuantity: state.venteComptoir.updateQuantity,
    updateRemise: state.venteComptoir.updateRemise
  });

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      <VenteMainContent
        selectedPDV={state.selectedPDV}
        setSelectedPDV={state.setSelectedPDV}
        searchProduct={state.searchProduct}
        setSearchProduct={state.setSearchProduct}
        selectedCategory={state.selectedCategory}
        setSelectedCategory={state.setSelectedCategory}
        uniqueCategories={state.uniqueCategories}
        pointsDeVente={state.venteComptoir.pointsDeVente || []}
        stockPDV={state.venteComptoir.stockPDV || []}
        loadingArticles={state.catalogue.isLoading}
        addToCart={state.venteComptoir.addToCart}
        currentPage={state.currentPage}
        totalPages={state.totalPages}
        goToPage={state.goToPage}
        getStockColor={state.venteComptoir.getStockColor}
        getLocalStock={state.venteComptoir.getLocalStock}
        cart={state.venteComptoir.cart}
        cartTotals={state.cartTotals}
        selectedClient={state.selectedClient}
        setSelectedClient={state.setSelectedClient}
        handleQuantityChange={handlers.handleQuantityChange}
        handleRemiseChange={handlers.handleRemiseChange}
        removeFromCart={state.venteComptoir.removeFromCart}
        clearCart={state.venteComptoir.clearCart}
        handlePayment={handlers.handlePayment}
        isLoading={state.venteComptoir.isLoading}
      />

      <VenteModals
        showPaymentModal={state.showPaymentModal}
        setShowPaymentModal={state.setShowPaymentModal}
        showPostPaymentActions={state.showPostPaymentActions}
        handlePaymentConfirm={handlers.handlePaymentConfirm}
        handlePostPaymentClose={handlers.handlePostPaymentClose}
        totalAmount={state.cartTotals.total}
        cartItems={state.venteComptoir.cart}
        isLoading={state.venteComptoir.isLoading}
        lastFacture={state.lastFacture}
      />
    </div>
  );
};

export default VenteComptoirResponsive;
