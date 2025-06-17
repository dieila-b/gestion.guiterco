
import React from 'react';
import { format } from 'date-fns';
import { Transaction } from '../types';
import { getTransactionTypeDetails } from '../utils/transactionTypeUtils';

interface TransactionsTableProps {
  transactions: (Transaction & { source?: string | null })[];
  formatCurrency: (amount: number) => string;
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  formatCurrency
}) => {
  return (
    <div className="rounded-md border">
      <div className="grid grid-cols-4 gap-4 p-4 font-medium border-b bg-muted/50">
        <div>Description</div>
        <div>Type</div>
        <div>Date</div>
        <div className="text-right">Montant</div>
      </div>
      <div className="divide-y">
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Aucune transaction trouvée pour les critères sélectionnés
          </div>
        ) : (
          transactions.map((transaction) => {
            const { label, className, textColor } = getTransactionTypeDetails(transaction.source, transaction.type);
            return (
              <div key={transaction.id} className="grid grid-cols-4 gap-4 p-4 items-center">
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-xs text-muted-foreground">{transaction.category}</p>
                </div>
                <div>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${className}`}>
                    {label}
                  </span>
                </div>
                <div>
                  {format(new Date(transaction.created_at), 'dd/MM/yyyy HH:mm')}
                </div>
                <div className={`text-right font-medium ${textColor}`}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TransactionsTable;
