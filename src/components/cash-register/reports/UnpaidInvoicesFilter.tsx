
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UnpaidInvoicesFilterProps {
  filterType: string;
  onFilterTypeChange: (value: string) => void;
}

const UnpaidInvoicesFilter: React.FC<UnpaidInvoicesFilterProps> = ({ filterType, onFilterTypeChange }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="filterType">Filtrer par statut</Label>
      <Select value={filterType} onValueChange={onFilterTypeChange}>
        <SelectTrigger id="filterType">
          <SelectValue placeholder="Sélectionner un filtre" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes les impayées</SelectItem>
          <SelectItem value="overdue">En retard uniquement</SelectItem>
          <SelectItem value="partial">Partiellement payées</SelectItem>
          <SelectItem value="pending">En attente</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default UnpaidInvoicesFilter;
