
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type StatutType = 'confirmee' | 'en_preparation' | 'prete' | 'partiellement_livree' | 'livree' | 'annulee' | 'convertie_en_vente';

interface StatusSectionProps {
  statut: string;
  deliveryStatus: string;
  onStatutChange: (value: StatutType) => void;
}

const getValidStatutValue = (statut: string): StatutType => {
  const validStatuts = ['confirmee', 'en_preparation', 'prete', 'partiellement_livree', 'livree', 'annulee', 'convertie_en_vente'] as const;
  return validStatuts.includes(statut as any) ? statut as StatutType : 'confirmee';
};

export const StatusSection = ({
  statut,
  deliveryStatus,
  onStatutChange
}: StatusSectionProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="statut">Statut de la précommande</Label>
        <Select 
          value={getValidStatutValue(statut)} 
          onValueChange={(value) => onStatutChange(getValidStatutValue(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="confirmee">🟡 Confirmée</SelectItem>
            <SelectItem value="en_preparation">🔄 En préparation</SelectItem>
            <SelectItem value="prete">🔵 Prête</SelectItem>
            <SelectItem value="partiellement_livree">🟠 Partiellement livrée</SelectItem>
            <SelectItem value="livree">🟢 Livrée</SelectItem>
            <SelectItem value="annulee">❌ Annulée</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="statut_livraison">Statut de livraison (calculé)</Label>
        <div className="h-10 flex items-center px-3 py-2 border border-input bg-gray-50 rounded-md text-sm">
          {deliveryStatus === 'livree' && '🟢 Livrée'}
          {deliveryStatus === 'partiellement_livree' && '🟠 Partiellement livrée'}
          {deliveryStatus === 'en_attente' && '🟡 En attente'}
        </div>
      </div>
    </div>
  );
};
