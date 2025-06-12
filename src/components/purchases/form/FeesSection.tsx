
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FeesSectionProps {
  form: UseFormReturn<any>;
}

export const FeesSection = ({ form }: FeesSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Frais et paramètres</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="remise">Remise (GNF)</Label>
          <Input
            id="remise"
            type="number"
            step="1"
            {...form.register('remise', { valueAsNumber: true })}
            placeholder="0"
          />
        </div>

        <div>
          <Label htmlFor="frais_livraison">Frais de livraison (GNF)</Label>
          <Input
            id="frais_livraison"
            type="number"
            step="1"
            {...form.register('frais_livraison', { valueAsNumber: true })}
            placeholder="0"
          />
        </div>

        <div>
          <Label htmlFor="frais_logistique">Frais de logistique (GNF)</Label>
          <Input
            id="frais_logistique"
            type="number"
            step="1"
            {...form.register('frais_logistique', { valueAsNumber: true })}
            placeholder="0"
          />
        </div>

        <div>
          <Label htmlFor="transit_douane">Transit & Douane (GNF)</Label>
          <Input
            id="transit_douane"
            type="number"
            step="1"
            {...form.register('transit_douane', { valueAsNumber: true })}
            placeholder="0"
          />
        </div>

        <div>
          <Label htmlFor="taux_tva">Taux de TVA (%)</Label>
          <Input
            id="taux_tva"
            type="number"
            step="0.01"
            min="0"
            max="100"
            {...form.register('taux_tva', { valueAsNumber: true })}
            placeholder="20.00"
          />
        </div>
      </CardContent>
    </Card>
  );
};
