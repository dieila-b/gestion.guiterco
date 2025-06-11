
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { usePays } from '@/hooks/usePays';
import { Ville } from '@/types/fournisseurs';

interface LocationSectionProps {
  formData: {
    pays_id: string;
    ville_id: string;
    ville_personnalisee: string;
  };
  villes?: Ville[];
  useCustomVille: boolean;
  onPaysChange: (paysId: string) => void;
  onVilleChange: (villeId: string) => void;
  onVillePersonnaliseeChange: (ville: string) => void;
  onCustomVilleToggle: (checked: boolean) => void;
}

const LocationSection: React.FC<LocationSectionProps> = ({
  formData,
  villes,
  useCustomVille,
  onPaysChange,
  onVilleChange,
  onVillePersonnaliseeChange,
  onCustomVilleToggle
}) => {
  const { pays } = usePays();

  const handleCustomVilleChange = (checked: boolean | "indeterminate") => {
    const isChecked = checked === true;
    onCustomVilleToggle(isChecked);
  };

  return (
    <>
      {/* Pays */}
      <div>
        <Label htmlFor="pays">Pays</Label>
        <Select value={formData.pays_id} onValueChange={onPaysChange}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Sélectionner un pays" />
          </SelectTrigger>
          <SelectContent>
            {pays?.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.nom} ({p.indicatif_tel})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Ville */}
      <div>
        <Label htmlFor="ville">Ville</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2 mt-1">
            <Checkbox 
              id="ville_personnalisee" 
              checked={useCustomVille}
              onCheckedChange={handleCustomVilleChange}
            />
            <Label htmlFor="ville_personnalisee" className="text-sm">
              Saisie personnalisée
            </Label>
          </div>
          
          {useCustomVille ? (
            <Input
              value={formData.ville_personnalisee}
              onChange={(e) => onVillePersonnaliseeChange(e.target.value)}
              placeholder="Saisir le nom de la ville"
            />
          ) : (
            <Select 
              value={formData.ville_id} 
              onValueChange={onVilleChange}
              disabled={!formData.pays_id}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une ville" />
              </SelectTrigger>
              <SelectContent>
                {villes?.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.nom} {v.code_postal ? `(${v.code_postal})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </>
  );
};

export default LocationSection;
