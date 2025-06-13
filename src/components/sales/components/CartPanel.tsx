
import React from 'react';
import CartHeader from './cart/CartHeader';
import CartItems from './cart/CartItems';
import CartFooter from './cart/CartFooter';
import ClientSection from './cart/ClientSection';

interface CartPanelProps {
  cart: any[];
  cartTotals: { sousTotal: number; total: number };
  selectedClient: string;
  setSelectedClient: (value: string) => void;
  handleQuantityChange: (productId: string, newQuantity: string) => void;
  handleRemiseChange: (productId: string, newRemise: string) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  handlePayment: () => void;
  isLoading: boolean;
  onNewClient: () => void;
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
  isLoading,
  onNewClient
}) => {
  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      <CartHeader cartLength={cart.length} onClearCart={clearCart} />
      
      <div className="flex-1 p-4 overflow-y-auto">
        <ClientSection
          selectedClient={selectedClient}
          setSelectedClient={setSelectedClient}
          onNewClient={onNewClient}
        />

        <CartItems
          cart={cart}
          handleQuantityChange={handleQuantityChange}
          handleRemiseChange={handleRemiseChange}
          removeFromCart={removeFromCart}
        />
      </div>

      <CartFooter
        cartTotals={cartTotals}
        cartLength={cart.length}
        selectedClient={selectedClient}
        isLoading={isLoading}
        clearCart={clearCart}
        handlePayment={handlePayment}
      />
    </div>
  );
};

export default CartPanel;
