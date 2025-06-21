
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCashRegisters } from '@/hooks/useCashRegisters';
import { useAllTransactionsHistory } from '@/hooks/useTransactions';
import { formatCurrency } from '@/lib/currency';
import TransactionsHistory from './TransactionsHistory';
import TransactionsOverviewTable from './TransactionsOverviewTable';

const CashRegisterOverview: React.FC = () => {
  const { data: cashRegisters, isLoading: registersLoading } = useCashRegisters();
  const { data: allTransactions = [], isLoading: transactionsLoading } = useAllTransactionsHistory();

  if (registersLoading || transactionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Chargement des données...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Aperçu du jour</TabsTrigger>
          <TabsTrigger value="history">Historique complet</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <TransactionsOverviewTable />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <TransactionsHistory
            transactions={allTransactions}
            formatCurrency={formatCurrency}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CashRegisterOverview;
