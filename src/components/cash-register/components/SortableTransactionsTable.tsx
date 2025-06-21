
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Transaction } from '../types';
import { getTransactionTypeDetails } from '../utils/transactionTypeUtils';

export type SortField = 'date' | 'type' | 'amount' | 'description' | 'source';
export type SortDirection = 'asc' | 'desc';

interface SortableTransactionsTableProps {
  transactions: (Transaction & { source?: string | null })[];
  formatCurrency: (amount: number) => string;
  sortField: SortField | null;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

const SortableTransactionsTable: React.FC<SortableTransactionsTableProps> = ({
  transactions,
  formatCurrency,
  sortField,
  sortDirection,
  onSort
}) => {
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const SortableHeader: React.FC<{ field: SortField; children: React.ReactNode }> = ({ field, children }) => (
    <TableHead>
      <Button
        variant="ghost"
        className="h-auto p-0 font-medium hover:bg-transparent"
        onClick={() => onSort(field)}
      >
        <div className="flex items-center gap-1">
          {children}
          {getSortIcon(field)}
        </div>
      </Button>
    </TableHead>
  );

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader field="description">Description</SortableHeader>
            <SortableHeader field="type">Type</SortableHeader>
            <SortableHeader field="date">Date</SortableHeader>
            <SortableHeader field="amount">Montant</SortableHeader>
            <SortableHeader field="source">Source</SortableHeader>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Aucune transaction trouvée pour les critères sélectionnés
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => {
              const { label, className, textColor } = getTransactionTypeDetails(
                transaction.source,
                transaction.type,
                transaction.description
              );

              return (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">{transaction.category}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${className}`}>
                      {label}
                    </span>
                  </TableCell>
                  <TableCell>
                    {format(new Date(transaction.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </TableCell>
                  <TableCell className={`font-medium ${textColor}`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {transaction.source || 'N/A'}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SortableTransactionsTable;
