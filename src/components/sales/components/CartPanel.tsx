
import React, { useState } from 'react';
import CartHeader from './cart/CartHeader';
import ClientSection from './cart/ClientSection';
import CartItems from './cart/CartItems';
import CartFooter from './cart/CartFooter';
import NewClientDialog from './cart/NewClientDialog';
import type { CartItem } from '@/hooks/useVenteComptoir/types';

interface CartTotals {
  sousTotal: number;
  total: number;
}

interface CartPanelProps {
  cart: CartItem[];
  cartTotals: CartTotals;
  selectedClient: string;
  setSelectedClient: (value: string) => void;
  handleQuantityChange: (productId: string, newQuantity: string) => void;
  handleRemiseChange: (productId: string, newRemise: string) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  handlePayment: () => void;
  isLoading: boolean;
}

const CartPanel: React.FC<CartPanelProps> = ({
  cart,
  cartTotals,
  selectedClient,
  setSelectedClient,
  handleQuantityChange,
  handleRemiseChange,
  removeFromCart,
  clearCart,
  handlePayment,
  isLoading
}) => {
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);

  const handleNewClientSuccess = (clientId: string) => {
    console.log('Nouveau client créé avec ID:', clientId);
    setSelectedClient(clientId); // Utiliser l'ID du client créé
    setShowNewClientDialog(false);
  };

  return (
    <div className="w-1/2 p-4 flex flex-col">
      {/* Panier élevé et aligné avec le haut de la zone produit */}
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col h-full mt-0">
        {/* En-tête panier */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-200 rounded-t-lg">
          <CartHeader 
            cartLength={cart.length}
            onClearCart={clearCart}
          />

          {/* Section client */}
          <ClientSection
            selectedClient={selectedClient}
            setSelectedClient={setSelectedClient}
            onNewClient={() => setShowNewClientDialog(true)}
          />
        </div>

        {/* Articles du panier */}
        <div className="flex-1 overflow-auto p-4">
          <CartItems
            cart={cart}
            handleQuantityChange={handleQuantityChange}
            handleRemiseChange={handleRemiseChange}
            removeFromCart={removeFromCart}
          />
        </div>

        {/* Totaux et actions */}
        {cart.length > 0 && (
          <CartFooter
            cartTotals={cartTotals}
            cartLength={cart.length}
            selectedClient={selectedClient}
            isLoading={isLoading}
            clearCart={clearCart}
            handlePayment={handlePayment}
          />
        )}
      </div>

      {/* Dialog pour nouveau client */}
      <NewClientDialog
        open={showNewClientDialog}
        onOpenChange={setShowNewClientDialog}
        onSuccess={handleNewClientSuccess}
      />
    </div>
  );
};

export default CartPanel;
