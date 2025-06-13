
import React from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface CartTotals {
  sousTotal: number;
  total: number;
}

interface CartFooterProps {
  cartTotals: CartTotals;
  cartLength: number;
  selectedClient: string;
  isLoading: boolean;
  clearCart: () => void;
  handlePayment: () => void;
}

const CartFooter: React.FC<CartFooterProps> = ({
  cartTotals,
  cartLength,
  selectedClient,
  isLoading,
  clearCart,
  handlePayment
}) => {
  return (
    <div className="border-t p-6 bg-gray-50 rounded-b-lg">
      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Sous-total</span>
          <span className="font-medium">{formatCurrency(cartTotals.sousTotal)}</span>
        </div>
        <div className="flex justify-between font-bold text-xl border-t pt-3">
          <span className="text-gray-800">Total</span>
          <span className="text-blue-600">{formatCurrency(cartTotals.total)}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" size="sm" onClick={clearCart}>
            Annuler
          </Button>
          <Button variant="outline" size="sm">
            Restaurer
          </Button>
          <Button variant="outline" size="sm">
            En attente
          </Button>
        </div>
        <Button 
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3" 
          size="lg"
          disabled={cartLength === 0 || !selectedClient || isLoading}
          onClick={handlePayment}
        >
          <CreditCard className="h-5 w-5 mr-2" />
          {isLoading ? 'Traitement...' : 'PAIEMENT'}
        </Button>
      </div>
    </div>
  );
};

export default CartFooter;
