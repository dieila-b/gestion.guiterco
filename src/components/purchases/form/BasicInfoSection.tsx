
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SupplierSection } from './SupplierSection';
import { Fournisseur } from '@/types/fournisseurs';

interface BasicInfoSectionProps {
  form: UseFormReturn<any>;
  fournisseurs: Fournisseur[] | undefined;
  loadingFournisseurs: boolean;
  refreshingFournisseurs: boolean;
  onRefreshFournisseurs: () => void;
}

export const BasicInfoSection = ({
  form,
  fournisseurs,
  loadingFournisseurs,
  refreshingFournisseurs,
  onRefreshFournisseurs
}: BasicInfoSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations générales</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="numero_bon">Numéro du bon</Label>
          <Input
            id="numero_bon"
            {...form.register('numero_bon')}
            placeholder="BC-XXXX"
          />
        </div>

        <SupplierSection
          form={form}
          fournisseurs={fournisseurs}
          loadingFournisseurs={loadingFournisseurs}
          refreshingFournisseurs={refreshingFournisseurs}
          onRefreshFournisseurs={onRefreshFournisseurs}
        />

        <div>
          <Label htmlFor="date_commande">Date de commande</Label>
          <Input
            id="date_commande"
            type="date"
            {...form.register('date_commande')}
          />
        </div>

        <div>
          <Label htmlFor="date_livraison_prevue">Date de livraison prévue</Label>
          <Input
            id="date_livraison_prevue"
            type="date"
            {...form.register('date_livraison_prevue')}
          />
        </div>
      </CardContent>
    </Card>
  );
};
