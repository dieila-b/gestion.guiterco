
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
    <div className="space-y-1">
      {/* En-tête tableau */}
      <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-700 border-b pb-2 mb-3">
        <div className="col-span-4">Nom d'article</div>
        <div className="col-span-2 text-center">Qté</div>
        <div className="col-span-2 text-center">Remise</div>
        <div className="col-span-2 text-center">P.U TTC</div>
        <div className="col-span-1 text-center">Total</div>
        <div className="col-span-1"></div>
      </div>

      {cart.map((item) => {
        const prixApresRemise = Math.max(0, item.prix_vente - item.remise);
        const totalLigne = prixApresRemise * item.quantite;
        
        return (
          <div key={item.id} className="grid grid-cols-12 gap-2 items-center py-3 border-b border-gray-100 text-sm hover:bg-gray-50 rounded px-2">
            <div className="col-span-4">
              <div className="font-medium truncate text-gray-800">{item.nom}</div>
            </div>
            
            <div className="col-span-2">
              <input
                type="number"
                value={item.quantite}
                onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                className="h-9 w-full text-center text-sm font-medium border border-gray-300 rounded"
                min="1"
              />
            </div>

            <div className="col-span-2">
              <input
                type="number"
                value={item.remise}
                onChange={(e) => handleRemiseChange(item.id, e.target.value)}
                placeholder="0"
                className="h-9 w-full text-center text-sm border border-gray-300 rounded"
                min="0"
              />
            </div>
            
            <div className="col-span-2 text-center font-medium text-gray-700">
              {formatCurrency(prixApresRemise)}
            </div>

            <div className="col-span-1 text-center font-bold text-blue-600">
              {formatCurrency(totalLigne)}
            </div>

            <div className="col-span-1 text-center">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeFromCart(item.id)}
                className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CartItems;
