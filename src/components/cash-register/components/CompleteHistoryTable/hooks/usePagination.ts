
import { useState, useMemo } from 'react';
import type { Transaction } from '../types';

export const usePagination = (transactions: Transaction[]) => {
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = transactions.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  return {
    itemsPerPage,
    currentPage,
    totalPages,
    paginatedTransactions,
    handlePageChange,
    handleItemsPerPageChange
  };
};
