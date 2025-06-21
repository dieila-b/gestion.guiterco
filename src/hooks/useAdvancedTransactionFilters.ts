
import { useState, useMemo } from 'react';
import { Transaction } from '@/components/cash-register/types';
import { getTransactionTypeDetails } from '@/components/cash-register/utils/transactionTypeUtils';
import { SortField, SortDirection } from '@/components/cash-register/components/SortableTransactionsTable';

interface UseAdvancedTransactionFiltersProps {
  transactions: (Transaction & { source?: string | null })[];
}

export const useAdvancedTransactionFilters = ({ transactions }: UseAdvancedTransactionFiltersProps) => {
  const currentDate = new Date();
  
  // États des filtres
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [day, setDay] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // États de pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  
  // États de tri
  const [sortField, setSortField] = useState<SortField | null>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Fonction de tri
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  // Filtrage et tri
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.created_at);
      
      // Filtre par année et mois
      if (transactionDate.getFullYear() !== year || transactionDate.getMonth() + 1 !== month) {
        return false;
      }
      
      // Filtre par jour si spécifié
      if (day !== null && transactionDate.getDate() !== day) {
        return false;
      }
      
      // Filtre par recherche textuelle
      if (searchTerm && !transaction.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filtre par type
      if (typeFilter !== "all") {
        const { label } = getTransactionTypeDetails(transaction.source, transaction.type, transaction.description);
        
        switch (typeFilter) {
          case "ventes":
            return label === "Vente";
          case "reglements":
            return label === "Règlement Facture" || label === "Règlement Preco";
          case "entrees":
            return transaction.type === "income" && (transaction.source === "Entrée manuelle" || !transaction.source);
          case "sorties":
            return transaction.type === "expense" && (transaction.source === "Sortie manuelle" || transaction.source === "Sortie");
          case "precommandes":
            return transaction.source === "Précommande";
          default:
            return true;
        }
      }
      
      return true;
    });

    // Tri
    if (sortField) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;
        
        switch (sortField) {
          case 'date':
            aValue = new Date(a.created_at).getTime();
            bValue = new Date(b.created_at).getTime();
            break;
          case 'amount':
            aValue = a.amount;
            bValue = b.amount;
            break;
          case 'description':
            aValue = a.description.toLowerCase();
            bValue = b.description.toLowerCase();
            break;
          case 'source':
            aValue = a.source?.toLowerCase() || '';
            bValue = b.source?.toLowerCase() || '';
            break;
          case 'type':
            const { label: aLabel } = getTransactionTypeDetails(a.source, a.type, a.description);
            const { label: bLabel } = getTransactionTypeDetails(b.source, b.type, b.description);
            aValue = aLabel.toLowerCase();
            bValue = bLabel.toLowerCase();
            break;
          default:
            return 0;
        }
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [transactions, year, month, day, typeFilter, searchTerm, sortField, sortDirection]);

  // Pagination
  const totalItems = filteredAndSortedTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredAndSortedTransactions.slice(startIndex, startIndex + itemsPerPage);

  // Réinitialisation des filtres
  const resetFilters = () => {
    setYear(currentDate.getFullYear());
    setMonth(currentDate.getMonth() + 1);
    setDay(null);
    setTypeFilter("all");
    setSearchTerm("");
    setCurrentPage(1);
    setSortField('date');
    setSortDirection('desc');
  };

  // Gestion de la pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  return {
    // États des filtres
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
    
    // Pagination
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    handlePageChange,
    handleItemsPerPageChange,
    
    // Tri
    sortField,
    sortDirection,
    handleSort,
    
    // Données
    paginatedTransactions,
    resetFilters
  };
};
