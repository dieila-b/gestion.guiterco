
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Client } from '@/types/sales';

interface ClientReportFilterProps {
  selectedClient: string;
  onSelectedClientChange: (value: string) => void;
  clients: Client[] | undefined;
}

const ClientReportFilter: React.FC<ClientReportFilterProps> = ({
  selectedClient,
  onSelectedClientChange,
  clients,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="clientSelect">Sélectionner un client (optionnel)</Label>
      <Select value={selectedClient} onValueChange={onSelectedClientChange}>
        <SelectTrigger id="clientSelect">
          <SelectValue placeholder="Tous les clients" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les clients</SelectItem>
          {clients?.map((client) => (
            <SelectItem key={client.id} value={client.id}>
              {client.nom}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ClientReportFilter;
