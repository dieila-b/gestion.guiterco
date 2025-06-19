
import React from 'react';
import { TableHeader, TableRow, TableHead } from '@/components/ui/table';
import SortableTableHeader from './SortableTableHeader';

type SortField = 'date_facture' | 'client' | 'montant_restant' | 'numero_facture';
type SortDirection = 'asc' | 'desc';

interface TableHeaderProps {
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

const UnpaidInvoicesTableHeader: React.FC<TableHeaderProps> = ({
  sortField,
  sortDirection,
  onSort,
}) => {
  return (
    <TableHeader className="bg-muted/50">
      <TableRow>
        <SortableTableHeader field="numero_facture" sortField={sortField} sortDirection={sortDirection} onSort={onSort}>
          N° Facture
        </SortableTableHeader>
        <SortableTableHeader field="date_facture" sortField={sortField} sortDirection={sortDirection} onSort={onSort}>
          Date
        </SortableTableHeader>
        <SortableTableHeader field="client" sortField={sortField} sortDirection={sortDirection} onSort={onSort}>
          Client
        </SortableTableHeader>
        <TableHead>Articles</TableHead>
        <TableHead className="text-right">Total</TableHead>
        <TableHead className="text-right">Payé</TableHead>
        <SortableTableHeader field="montant_restant" sortField={sortField} sortDirection={sortDirection} onSort={onSort}>
          <span className="text-right block">Restant</span>
        </SortableTableHeader>
        <TableHead>Paiement</TableHead>
        <TableHead>Livraison</TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default UnpaidInvoicesTableHeader;
