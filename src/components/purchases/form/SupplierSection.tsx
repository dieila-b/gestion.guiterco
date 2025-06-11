
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw } from 'lucide-react';
import { Fournisseur } from '@/types/fournisseurs';

interface SupplierSectionProps {
  form: UseFormReturn<any>;
  fournisseurs: Fournisseur[] | undefined;
  loadingFournisseurs: boolean;
  refreshingFournisseurs: boolean;
  onRefreshFournisseurs: () => void;
}

export const SupplierSection = ({
  form,
  fournisseurs,
  loadingFournisseurs,
  refreshingFournisseurs,
  onRefreshFournisseurs
}: SupplierSectionProps) => {
  const getFournisseurDisplayName = (fournisseur: Fournisseur) => {
    return fournisseur.nom_entreprise || fournisseur.nom || 'Fournisseur sans nom';
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <Label htmlFor="fournisseur_id">Fournisseur</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRefreshFournisseurs}
          disabled={refreshingFournisseurs}
          className="h-6 w-6 p-0"
        >
          <RefreshCw className={`h-3 w-3 ${refreshingFournisseurs ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      <Select 
        onValueChange={(value) => form.setValue('fournisseur_id', value)}
        disabled={loadingFournisseurs}
      >
        <SelectTrigger>
          <SelectValue 
            placeholder={
              loadingFournisseurs 
                ? "Chargement des fournisseurs..." 
                : "Sélectionnez un fournisseur"
            } 
          />
        </SelectTrigger>
        <SelectContent>
          {fournisseurs?.length === 0 ? (
            <SelectItem value="" disabled>
              Aucun fournisseur disponible
            </SelectItem>
          ) : (
            fournisseurs?.map((fournisseur) => (
              <SelectItem key={fournisseur.id} value={fournisseur.id}>
                {getFournisseurDisplayName(fournisseur)}
                {fournisseur.pays?.nom && (
                  <span className="text-xs text-muted-foreground ml-2">
                    ({fournisseur.pays.nom})
                  </span>
                )}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {fournisseurs?.length === 0 && !loadingFournisseurs && (
        <p className="text-xs text-muted-foreground mt-1">
          Aucun fournisseur trouvé. Créez-en un depuis les paramètres.
        </p>
      )}
    </div>
  );
};
