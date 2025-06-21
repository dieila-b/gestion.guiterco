
export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  source: string | null;
  origin_table?: string;
}

export interface CompleteHistoryTableProps {
  transactions: Transaction[];
  isLoading: boolean;
  formatCurrency: (amount: number) => string;
}

export type SortField = 'date' | 'type' | 'amount' | 'description' | 'source';
export type SortDirection = 'asc' | 'desc';
