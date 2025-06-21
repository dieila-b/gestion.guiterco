
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Transaction } from './types';
import TransactionFilters from './components/TransactionFilters';
import TransactionsTable from './components/TransactionsTable';
import { useTransactionFilters } from './hooks/useTransactionFilters';

interface TransactionsHistoryProps {
  transactions: (Transaction & { source?: string | null })[];
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  formatCurrency: (amount: number) => string;
}

const TransactionsHistory: React.FC<TransactionsHistoryProps> = ({
  transactions,
  date,
  setDate,
  formatCurrency
}) => {
  const {
    typeFilter,
    setTypeFilter,
    searchTerm,
    setSearchTerm,
    filteredTransactions
  } = useTransactionFilters(transactions);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des transactions</CardTitle>
        <CardDescription>Toutes les entrées et sorties de caisse</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <TransactionFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            date={date}
            setDate={setDate}
          />
          
          <TransactionsTable
            transactions={filteredTransactions}
            formatCurrency={formatCurrency}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionsHistory;
