
import React from 'react';
import CartHeader from './cart/CartHeader';
import CartItems from './cart/CartItems';
import CartFooter from './cart/CartFooter';
import ClientSection from './cart/ClientSection';
import { X } from 'lucide-react';

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
  onClose?: () => void;
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
  onNewClient,
  onClose
}) => {
  return (
    <div className="h-full bg-white border-l border-gray-200 flex flex-col relative">
      {/* Bouton fermer pour mobile */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 lg:hidden z-10 p-2 text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
      )}

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
