
import React from 'react';
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getTransactionTypeDetails } from '../utils/transactionTypeUtils';
import { useSorting } from './CompleteHistoryTable/hooks/useSorting';
import { usePagination } from './CompleteHistoryTable/hooks/usePagination';
import { TableHeader } from './CompleteHistoryTable/components/TableHeader';
import { PaginationControls } from './CompleteHistoryTable/components/PaginationControls';
import type { CompleteHistoryTableProps } from './CompleteHistoryTable/types';

const CompleteHistoryTable: React.FC<CompleteHistoryTableProps> = ({
  transactions,
  isLoading,
  formatCurrency
}) => {
  const { sortField, sortDirection, sortedTransactions, handleSort } = useSorting(transactions);
  const { 
    itemsPerPage, 
    currentPage, 
    totalPages, 
    paginatedTransactions,
    handlePageChange,
    handleItemsPerPageChange 
  } = usePagination(sortedTransactions);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Chargement des transactions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PaginationControls
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        totalPages={totalPages}
        totalTransactions={transactions.length}
        onItemsPerPageChange={handleItemsPerPageChange}
        onPageChange={handlePageChange}
      />

      {/* Tableau */}
      <div className="overflow-x-auto rounded-lg border bg-background">
        <table className="min-w-full text-sm">
          <TableHeader
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
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
    </div>
  );
};

export default CompleteHistoryTable;
