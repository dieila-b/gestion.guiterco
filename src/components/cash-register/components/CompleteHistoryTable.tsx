
import React, { useState, useMemo } from 'react';
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { getTransactionTypeDetails } from '../utils/transactionTypeUtils';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  source: string | null;
  origin_table?: string;
}

interface CompleteHistoryTableProps {
  transactions: Transaction[];
  isLoading: boolean;
  formatCurrency: (amount: number) => string;
}

type SortField = 'date' | 'type' | 'amount' | 'description' | 'source';
type SortDirection = 'asc' | 'desc';

const CompleteHistoryTable: React.FC<CompleteHistoryTableProps> = ({
  transactions,
  isLoading,
  formatCurrency
}) => {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // Tri des transactions
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'date') {
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
      } else if (sortField === 'amount') {
        aValue = a.amount;
        bValue = b.amount;
      } else if (sortField === 'type') {
        const aDetails = getTransactionTypeDetails(a.source, a.type, a.description);
        const bDetails = getTransactionTypeDetails(b.source, b.type, b.description);
        aValue = aDetails.label;
        bValue = bDetails.label;
      } else if (sortField === 'source') {
        aValue = String(a.source || '').toLowerCase();
        bValue = String(b.source || '').toLowerCase();
      } else {
        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [transactions, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = sortedTransactions.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Chargement des transactions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Contrôles de pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Afficher</span>
          <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-gray-600">transactions par page</span>
        </div>

        <div className="text-sm text-gray-600">
          {transactions.length} transaction{transactions.length > 1 ? 's' : ''} au total
        </div>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto rounded-lg border bg-background">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="py-3 px-4 text-left">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('date')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Date
                  <SortIcon field="date" />
                </Button>
              </th>
              <th className="py-3 px-4 text-left">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('type')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Type
                  <SortIcon field="type" />
                </Button>
              </th>
              <th className="py-3 px-4 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('amount')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Montant
                  <SortIcon field="amount" />
                </Button>
              </th>
              <th className="py-3 px-4 text-left">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('description')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Description
                  <SortIcon field="description" />
                </Button>
              </th>
              <th className="py-3 px-4 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('source')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Source
                  <SortIcon field="source" />
                </Button>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedTransactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-zinc-400">
                  Aucune transaction trouvée pour les critères sélectionnés.
                </td>
              </tr>
            ) : (
              paginatedTransactions.map((transaction, index) => {
                const { label, className, textColor, sourceDisplay } = getTransactionTypeDetails(
                  transaction.source, 
                  transaction.type, 
                  transaction.description
                );
                
                return (
                  <tr key={transaction.id} className="border-b last:border-b-0 hover:bg-muted/50">
                    <td className="py-3 px-4">
                      {format(new Date(transaction.date), "dd/MM/yyyy HH:mm", { locale: fr })}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${className}`}>
                        {label}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-right font-bold ${textColor}`}>
                      {transaction.type === "expense" ? "-" : "+"}
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="py-3 px-4">
                      {transaction.description}
                      {transaction.origin_table && (
                        <span className="ml-2 text-xs text-gray-400 italic">
                          ({transaction.origin_table})
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center text-xs text-gray-500">
                      {sourceDisplay || transaction.source}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Navigation pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </Button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNumber)}
                  className="w-10"
                >
                  {pageNumber}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Suivant
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="text-center text-sm text-gray-600">
        Page {currentPage} sur {totalPages}
      </div>
    </div>
  );
};

export default CompleteHistoryTable;
