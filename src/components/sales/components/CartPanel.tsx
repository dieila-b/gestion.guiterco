
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, User, CreditCard, X } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface CartItem {
  id: string;
  nom: string;
  prix_vente: number;
  quantite: number;
  remise: number;
}

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
  return (
    <div className="w-1/2 p-4 flex flex-col">
      {/* Panier élevé avec ombre forte */}
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col h-full">
        {/* En-tête panier avec style élevé */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-200 rounded-t-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-lg text-gray-800">Panier ({cart.length})</span>
            </div>
            {cart.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCart} className="text-red-600 hover:text-red-700">
                Vider
              </Button>
            )}
          </div>

          {/* Section client avec indicateur requis */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium text-red-600">Client requis</span>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Rechercher un client..."
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="flex-1"
              />
              <Button size="sm" variant="outline">
                <User className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline">
                Nouveau
              </Button>
            </div>
          </div>
        </div>

        {/* Articles du panier */}
        <div className="flex-1 overflow-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-1">Panier vide</p>
              <p className="text-sm">Cliquez sur un produit pour l'ajouter</p>
            </div>
          ) : (
            <div className="space-y-1">
              {/* En-tête tableau */}
              <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-700 border-b pb-2 mb-3">
                <div className="col-span-4">Nom d'article</div>
                <div className="col-span-1 text-center">Qté</div>
                <div className="col-span-2 text-center">Remise</div>
                <div className="col-span-2 text-center">P.U TTC</div>
                <div className="col-span-2 text-center">Total</div>
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
                    
                    <div className="col-span-1">
                      <Input
                        type="number"
                        value={item.quantite}
                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                        className="h-8 text-center text-xs font-medium"
                        min="1"
                      />
                    </div>

                    <div className="col-span-2">
                      <Input
                        type="number"
                        value={item.remise}
                        onChange={(e) => handleRemiseChange(item.id, e.target.value)}
                        placeholder="0"
                        className="h-8 text-center text-xs"
                        min="0"
                      />
                    </div>
                    
                    <div className="col-span-2 text-center font-medium text-gray-700">
                      {formatCurrency(prixApresRemise)}
                    </div>

                    <div className="col-span-2 text-center font-bold text-blue-600">
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
          )}
        </div>

        {/* Totaux et actions */}
        {cart.length > 0 && (
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
                disabled={cart.length === 0 || !selectedClient || isLoading}
                onClick={handlePayment}
              >
                <CreditCard className="h-5 w-5 mr-2" />
                {isLoading ? 'Traitement...' : 'PAIEMENT'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPanel;
