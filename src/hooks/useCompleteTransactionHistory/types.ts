
export type CompleteTransactionFilters = {
  year: number;
  month: number;
  day?: number;
  startDate?: Date;
  endDate?: Date;
  type: string;
  searchTerm: string;
  source?: string;
};

export type CompleteTransaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  source: string | null;
  origin_table?: string;
};

export type TransactionStats = {
  soldeActif: number;
  totalEntrees: number;
  totalSorties: number;
  balance: number;
};
