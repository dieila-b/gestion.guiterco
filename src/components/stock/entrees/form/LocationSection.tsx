
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Importer depuis stock/types.ts pour les entrepôts et points de vente
interface Entrepot {
  id: string;
  nom: string;
  adresse: string | null;
  capacite_max: number | null;
  gestionnaire: string | null;
  statut: string | null;
  created_at: string;
  updated_at: string;
}

interface PointDeVente {
  id: string;
  nom: string;
  adresse: string | null;
  type_pdv: string | null;
  responsable: string | null;
  statut: string | null;
  created_at: string;
  updated_at: string;
}

interface LocationSectionProps {
  emplacementType: string;
  entrepotId: string;
  pointVenteId: string;
  entrepots?: Entrepot[];
  pointsDeVente?: PointDeVente[];
  onEmplacementTypeChange: (value: string) => void;
  onEmplacementChange: (value: string) => void;
}

export const LocationSection = ({
  emplacementType,
  entrepotId,
  pointVenteId,
  entrepots,
  pointsDeVente,
  onEmplacementTypeChange,
  onEmplacementChange
}: LocationSectionProps) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="emplacement_type">Type d'emplacement *</Label>
          <Select value={emplacementType} onValueChange={onEmplacementTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entrepot">Entrepôt</SelectItem>
              <SelectItem value="point_vente">Point de vente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="emplacement">Emplacement *</Label>
        <Select 
          value={emplacementType === 'entrepot' ? entrepotId : pointVenteId}
          onValueChange={onEmplacementChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un emplacement..." />
          </SelectTrigger>
          <SelectContent>
            {emplacementType === 'entrepot' ? (
              entrepots?.map(entrepot => (
                <SelectItem key={entrepot.id} value={entrepot.id}>
                  {entrepot.nom}
                </SelectItem>
              ))
            ) : (
              pointsDeVente?.map(pdv => (
                <SelectItem key={pdv.id} value={pdv.id}>
                  {pdv.nom}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};
