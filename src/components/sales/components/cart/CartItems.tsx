
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, X } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface CartItem {
  id: string;
  nom: string;
  prix_vente: number;
  quantite: number;
  remise: number;
}

interface CartItemsProps {
  cart: CartItem[];
  handleQuantityChange: (productId: string, newQuantity: string) => void;
  handleRemiseChange: (productId: string, newRemise: string) => void;
  removeFromCart: (productId: string) => void;
}

const CartItems: React.FC<CartItemsProps> = ({
  cart,
  handleQuantityChange,
  handleRemiseChange,
  removeFromCart
}) => {
  if (cart.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-30" />
        <p className="text-lg font-medium mb-1">Panier vide</p>
        <p className="text-sm">Cliquez sur un produit pour l'ajouter</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded">
      {/* En-tête du tableau */}
      <div className="bg-gray-50 border-b border-gray-300">
        <div className="grid grid-cols-12 gap-2 px-2 py-2 text-xs font-bold text-gray-800">
          <div className="col-span-4">Nom d'article</div>
          <div className="col-span-1 text-center">Qté</div>
          <div className="col-span-2 text-center">T remise</div>
          <div className="col-span-2 text-right">PU TTC</div>
          <div className="col-span-2 text-right font-bold">Total</div>
          <div className="col-span-1"></div>
        </div>
      </div>

      {/* Corps du tableau */}
      <div className="divide-y divide-gray-200">
        {cart.map((item) => {
          const prixApresRemise = Math.max(0, item.prix_vente - item.remise);
          const totalLigne = prixApresRemise * item.quantite;
          
          return (
            <div key={item.id} className="grid grid-cols-12 gap-2 items-center px-2 py-1 hover:bg-gray-50">
              <div className="col-span-4">
                <div className="text-xs text-gray-800 truncate pr-1">{item.nom}</div>
              </div>
              
              <div className="col-span-1 flex justify-center">
                <input
                  type="number"
                  value={item.quantite}
                  onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                  className="h-6 w-10 text-center text-xs border border-gray-300 rounded px-1 bg-blue-50 text-blue-700"
                  min="1"
                />
              </div>

              <div className="col-span-2 flex justify-center">
                <input
                  type="number"
                  value={item.remise}
                  onChange={(e) => handleRemiseChange(item.id, e.target.value)}
                  placeholder="0"
                  className="h-6 w-12 text-center text-xs border border-gray-300 rounded px-1 text-red-600"
                  min="0"
                />
              </div>
              
              <div className="col-span-2 text-right text-xs text-gray-700">
                {formatCurrency(prixApresRemise)}
              </div>

              <div className="col-span-2 text-right text-xs font-bold text-black">
                {formatCurrency(totalLigne)}
              </div>

              <div className="col-span-1 flex justify-center">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeFromCart(item.id)}
                  className="h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CartItems;
