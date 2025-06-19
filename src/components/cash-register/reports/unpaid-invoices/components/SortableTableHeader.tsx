
import React from 'react';
import { TableHead } from '@/components/ui/table';
import { ChevronDown, ChevronUp } from 'lucide-react';

type SortField = 'date_facture' | 'client' | 'montant_restant' | 'numero_facture';
type SortDirection = 'asc' | 'desc';

interface SortableTableHeaderProps {
  field: SortField;
  children: React.ReactNode;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

const SortableTableHeader: React.FC<SortableTableHeaderProps> = ({
  field,
  children,
  sortField,
  sortDirection,
  onSort,
}) => (
  <TableHead 
    className="cursor-pointer hover:bg-muted/50 select-none"
    onClick={() => onSort(field)}
  >
    <div className="flex items-center gap-1">
      {children}
      {sortField === field && (
        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
      )}
    </div>
  </TableHead>
);

export default SortableTableHeader;
