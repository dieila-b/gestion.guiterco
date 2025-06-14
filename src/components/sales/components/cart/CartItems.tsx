
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
    <div className="space-y-0">
      {/* En-tête tableau */}
      <div className="grid grid-cols-12 gap-1 text-xs font-semibold text-gray-700 border-b pb-1 mb-1 px-1">
        <div className="col-span-4 text-left">Nom d'article</div>
        <div className="col-span-2 text-center">Qté</div>
        <div className="col-span-2 text-center">T remise</div>
        <div className="col-span-2 text-center">PU TTC</div>
        <div className="col-span-1 text-center">Total</div>
        <div className="col-span-1"></div>
      </div>

      {cart.map((item) => {
        const prixApresRemise = Math.max(0, item.prix_vente - item.remise);
        const totalLigne = prixApresRemise * item.quantite;
        
        return (
          <div key={item.id} className="grid grid-cols-12 gap-1 items-center py-1 border-b border-gray-100 text-sm hover:bg-gray-50 px-1">
            <div className="col-span-4 text-left">
              <div className="font-medium text-gray-800 text-xs leading-tight">{item.nom}</div>
            </div>
            
            <div className="col-span-2 flex justify-center">
              <input
                type="number"
                value={item.quantite}
                onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                className="h-7 w-12 text-center text-xs font-medium border border-gray-300 rounded px-1"
                min="1"
              />
            </div>

            <div className="col-span-2 flex justify-center">
              <input
                type="number"
                value={item.remise}
                onChange={(e) => handleRemiseChange(item.id, e.target.value)}
                placeholder="0"
                className="h-7 w-12 text-center text-xs border border-red-300 rounded px-1 text-red-600"
                min="0"
              />
            </div>
            
            <div className="col-span-2 text-center font-medium text-gray-700 text-xs">
              {formatCurrency(prixApresRemise)}
            </div>

            <div className="col-span-1 text-center font-bold text-black text-sm">
              {formatCurrency(totalLigne)}
            </div>

            <div className="col-span-1 flex justify-center">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeFromCart(item.id)}
                className="text-white bg-red-500 hover:bg-red-600 h-5 w-5 p-0 rounded"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CartItems;
