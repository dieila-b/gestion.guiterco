
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

interface CartHeaderProps {
  cartLength: number;
  onClearCart: () => void;
}

const CartHeader: React.FC<CartHeaderProps> = ({ cartLength, onClearCart }) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-200 rounded-t-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <ShoppingCart className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-lg text-gray-800">Panier ({cartLength})</span>
        </div>
        {cartLength > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearCart} className="text-red-600 hover:text-red-700">
            Vider
          </Button>
        )}
      </div>
    </div>
  );
};

export default CartHeader;
