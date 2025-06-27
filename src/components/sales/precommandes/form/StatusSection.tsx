
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type StatutType = 'confirmee' | 'en_preparation' | 'prete' | 'partiellement_livree' | 'livree' | 'annulee' | 'convertie_en_vente';
type StatutLivraisonType = 'en_attente' | 'partiellement_livree' | 'livree';

interface StatusSectionProps {
  statut: string;
  statutLivraison: string;
  onStatutChange: (value: StatutType) => void;
  onStatutLivraisonChange: (value: StatutLivraisonType) => void;
}

const getValidStatutValue = (statut: string): StatutType => {
  const validStatuts = ['confirmee', 'en_preparation', 'prete', 'partiellement_livree', 'livree', 'annulee', 'convertie_en_vente'] as const;
  return validStatuts.includes(statut as any) ? statut as StatutType : 'confirmee';
};

const getValidStatutLivraisonValue = (statutLivraison: string): StatutLivraisonType => {
  const validStatuts = ['en_attente', 'partiellement_livree', 'livree'] as const;
  return validStatuts.includes(statutLivraison as any) ? statutLivraison as StatutLivraisonType : 'en_attente';
};

export const StatusSection = ({
  statut,
  statutLivraison,
  onStatutChange,
  onStatutLivraisonChange
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
        <Label htmlFor="statut_livraison">Statut de livraison</Label>
        <Select 
          value={getValidStatutLivraisonValue(statutLivraison)} 
          onValueChange={(value) => onStatutLivraisonChange(getValidStatutLivraisonValue(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner le statut de livraison" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en_attente">🟡 En attente</SelectItem>
            <SelectItem value="partiellement_livree">🟠 Partiellement livrée</SelectItem>
            <SelectItem value="livree">🟢 Livrée</SelectItem>
          </SelectContent>
        </Select>
        <div className="mt-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
          💡 Vous pouvez compléter ou modifier les quantités dans la section Articles
        </div>
      </div>
    </div>
  );
};
