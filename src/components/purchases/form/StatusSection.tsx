
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StatusSectionProps {
  form: UseFormReturn<any>;
  montantPaye: number;
  setMontantPaye: (value: number) => void;
}

export const StatusSection = ({ form, montantPaye, setMontantPaye }: StatusSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Statuts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="statut_paiement">Statut de paiement</Label>
          <Select onValueChange={(value) => form.setValue('statut_paiement', value)} value={form.watch('statut_paiement')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en_attente">En attente</SelectItem>
              <SelectItem value="partiel">Partiel</SelectItem>
              <SelectItem value="paye">Payé</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="statut">Statut de la commande</Label>
          <Select onValueChange={(value) => form.setValue('statut', value)} defaultValue="en_cours">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en_cours">En cours</SelectItem>
              <SelectItem value="valide">Validé</SelectItem>
              <SelectItem value="livre">Livré</SelectItem>
              <SelectItem value="annule">Annulé</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="montant_paye">Montant payé (GNF)</Label>
          <Input
            id="montant_paye"
            type="number"
            step="1"
            value={montantPaye}
            onChange={(e) => setMontantPaye(parseFloat(e.target.value) || 0)}
            placeholder="0"
          />
        </div>
      </CardContent>
    </Card>
  );
};
