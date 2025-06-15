
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, X } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import StepperInput from './StepperInput';

interface CartItem {
  id: string;
  nom: string;
  prix_vente?: number; // Rendu optionnel pour correspondre au type du hook
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

  const handleStepperChange = (productId: string, newQuantity: number) => {
    handleQuantityChange(productId, newQuantity.toString());
  };

  return (
    <div className="border border-gray-300 rounded overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-300">
            <th className="text-gray-800 text-xs font-bold px-2 py-1 text-left border-r border-gray-300 w-[25%]">Nom d'article</th>
            <th className="text-gray-800 text-xs font-bold px-2 py-1 text-center border-r border-gray-300 w-[20%]">Qté</th>
            <th className="text-gray-800 text-xs font-bold px-2 py-1 text-center border-r border-gray-300 w-[18%]">Remise</th>
            <th className="text-gray-800 text-xs font-bold px-2 py-1 text-right border-r border-gray-300 w-[15%]">PU TTC</th>
            <th className="text-gray-800 text-xs font-bold px-2 py-1 text-right border-r border-gray-300 w-[18%]">Total</th>
            <th className="text-gray-800 text-xs font-bold px-2 py-1 text-center w-[4%]"></th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item) => {
            const prixVente = item.prix_vente || 0; // Valeur par défaut si undefined
            const prixApresRemise = Math.max(0, prixVente - item.remise);
            const totalLigne = prixApresRemise * item.quantite;
            
            return (
              <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-2 py-1 text-xs text-gray-800 border-r border-gray-200">
                  <div className="truncate pr-1">{item.nom}</div>
                </td>
                
                <td className="px-2 py-1 text-center border-r border-gray-200">
                  <div className="flex justify-center">
                    <StepperInput
                      value={item.quantite}
                      onChange={(newQuantity) => handleStepperChange(item.id, newQuantity)}
                      min={1}
                      max={9999}
                    />
                  </div>
                </td>

                <td className="px-2 py-1 text-center border-r border-gray-200">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={item.remise}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        handleRemiseChange(item.id, value);
                      }
                    }}
                    placeholder="0"
                    className="h-7 w-20 text-center text-xs border border-gray-300 rounded px-1 text-red-600 appearance-none"
                    style={{ 
                      MozAppearance: 'textfield',
                      WebkitAppearance: 'none'
                    }}
                    min="0"
                  />
                </td>
                
                <td className="px-2 py-1 text-right text-xs text-gray-700 border-r border-gray-200">
                  {formatCurrency(prixApresRemise)}
                </td>

                <td className="px-2 py-1 text-right text-xs font-bold text-black border-r border-gray-200">
                  {formatCurrency(totalLigne)}
                </td>

                <td className="px-2 py-1 text-center">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFromCart(item.id)}
                    className="h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CartItems;
