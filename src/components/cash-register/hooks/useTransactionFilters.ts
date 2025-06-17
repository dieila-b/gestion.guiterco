
import { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { getTransactionTypeDetails } from '../utils/transactionTypeUtils';

export const useTransactionFilters = (transactions: (Transaction & { source?: string | null })[]) => {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesSearch = searchTerm === "" || 
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category?.toLowerCase().includes(searchTerm.toLowerCase());

      if (typeFilter === "all") {
        return matchesSearch;
      }

      const { label } = getTransactionTypeDetails(transaction.source, transaction.type, transaction.description);
      
      if (typeFilter === "ventes") {
        return matchesSearch && label === "Vente";
      }
      
      if (typeFilter === "reglements") {
        return matchesSearch && label === "Règlement";
      }
      
      if (typeFilter === "income") {
        return matchesSearch && transaction.type === "income";
      }
      
      if (typeFilter === "expense") {
        return matchesSearch && transaction.type === "expense";
      }

      return matchesSearch;
    });
  }, [transactions, typeFilter, searchTerm]);

  return {
    typeFilter,
    setTypeFilter,
    searchTerm,
    setSearchTerm,
    filteredTransactions
  };
};
