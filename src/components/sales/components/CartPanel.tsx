import React from 'react';
import CartHeader from './cart/CartHeader';
import CartItem from './cart/CartItem';
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
      <CartHeader cart={cart} clearCart={clearCart} />
      
      <div className="flex-1 p-4 overflow-y-auto">
        <ClientSection
          selectedClient={selectedClient}
          setSelectedClient={setSelectedClient}
          onNewClient={onNewClient}
        />

        {cart.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            Votre panier est vide.
          </div>
        ) : (
          <ul className="space-y-3">
            {cart.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                handleQuantityChange={handleQuantityChange}
                handleRemiseChange={handleRemiseChange}
                removeFromCart={removeFromCart}
              />
            ))}
          </ul>
        )}
      </div>

      <CartFooter
        cartTotals={cartTotals}
        handlePayment={handlePayment}
        isLoading={isLoading}
        hasItems={cart.length > 0}
        hasClient={!!selectedClient}
      />
    </div>
  );
};

export default CartPanel;
