
import { useState, useMemo } from 'react';
import { getTransactionTypeDetails } from '../../../utils/transactionTypeUtils';
import type { Transaction, SortField, SortDirection } from '../types';

export const useSorting = (transactions: Transaction[]) => {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return {
    sortField,
    sortDirection,
    sortedTransactions,
    handleSort
  };
};
