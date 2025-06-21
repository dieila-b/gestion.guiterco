
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Transaction } from './types';
import AdvancedTransactionFilters from './components/AdvancedTransactionFilters';
import SortableTransactionsTable from './components/SortableTransactionsTable';
import TransactionsPagination from './components/TransactionsPagination';
import { useAdvancedTransactionFilters } from '@/hooks/useAdvancedTransactionFilters';

interface TransactionsHistoryProps {
  transactions: (Transaction & { source?: string | null })[];
  formatCurrency: (amount: number) => string;
}

const TransactionsHistory: React.FC<TransactionsHistoryProps> = ({
  transactions,
  formatCurrency
}) => {
  const {
    year,
    month,
    day,
    typeFilter,
    searchTerm,
    setYear,
    setMonth,
    setDay,
    setTypeFilter,
    setSearchTerm,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    handlePageChange,
    handleItemsPerPageChange,
    sortField,
    sortDirection,
    handleSort,
    paginatedTransactions,
    resetFilters
  } = useAdvancedTransactionFilters({ transactions });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des transactions</CardTitle>
        <CardDescription>
          Toutes les entrées et sorties de caisse avec filtres avancés et pagination
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <AdvancedTransactionFilters
            year={year}
            month={month}
            day={day}
            typeFilter={typeFilter}
            searchTerm={searchTerm}
            onYearChange={setYear}
            onMonthChange={setMonth}
            onDayChange={setDay}
            onTypeFilterChange={setTypeFilter}
            onSearchTermChange={setSearchTerm}
            onResetFilters={resetFilters}
          />
          
          <SortableTransactionsTable
            transactions={paginatedTransactions}
            formatCurrency={formatCurrency}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
          
          {totalItems > 0 && (
            <TransactionsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionsHistory;
