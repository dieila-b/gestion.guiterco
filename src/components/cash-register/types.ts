
export type CashRegister = {
  id: number;
  name: string;
  balance: number;
  status: string;
  lastUpdated: Date;
};

export type Transaction = {
  id: number;
  type: string;
  description: string;
  amount: number;
  date: Date;
  category: string;
  paymentMethod: string;
};
