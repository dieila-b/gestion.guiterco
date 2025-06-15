
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface DeliveryTabProps {
  statutLivraison: string;
  setStatutLivraison: (value: string) => void;
  cartItems: any[];
  quantitesLivrees: { [key: string]: number };
  handleQuantiteLivreeChange: (itemId: string, quantite: number) => void;
}

const DeliveryTab: React.FC<DeliveryTabProps> = ({
  statutLivraison,
  setStatutLivraison,
  cartItems,
  quantitesLivrees,
  handleQuantiteLivreeChange
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Statut de livraison:</Label>
        <RadioGroup value={statutLivraison} onValueChange={setStatutLivraison} className="mt-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="en_attente" id="en_attente" />
            <Label htmlFor="en_attente">En attente</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="partiel" id="partiel" />
            <Label htmlFor="partiel">Partiel</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="livre" id="livre" />
            <Label htmlFor="livre">Livré</Label>
          </div>
        </RadioGroup>
      </div>

      {statutLivraison === 'partiel' && (
        <div className="space-y-3">
          <Label>Quantités livrées:</Label>
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-2 border rounded">
              <span className="font-medium">{item.nom}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">/ {item.quantite}</span>
                <Input
                  type="number"
                  value={quantitesLivrees[item.id] || 0}
                  onChange={(e) => handleQuantiteLivreeChange(item.id, Number(e.target.value))}
                  className="w-20"
                  min="0"
                  max={item.quantite}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryTab;
