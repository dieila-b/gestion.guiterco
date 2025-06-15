
import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import CashRegisterOverview from '@/components/cash-register/CashRegisterOverview';
import AddCashRegisterDialog from '@/components/cash-register/AddCashRegisterDialog';
import { useCashRegisters } from '@/hooks/useCashRegisters';
import { useTransactions, useTodayTransactions } from '@/hooks/useTransactions';
import ExpensesTab from '@/components/cash-register/ExpensesTab';

const CashRegisters: React.FC = () => {
  const { toast } = useToast();
  const [selectedRegister, setSelectedRegister] = useState<string | null>(null);

  // Fetch data from Supabase
  const { data: cashRegisters, isLoading: registersLoading } = useCashRegisters();
  const { data: transactions, isLoading: transactionsLoading } = useTransactions();
  const { data: todayTransactions } = useTodayTransactions();

  // Set default selected register when data loads
  React.useEffect(() => {
    if (cashRegisters && cashRegisters.length > 0 && !selectedRegister) {
      setSelectedRegister(cashRegisters[0].id);
    }
  }, [cashRegisters, selectedRegister]);

  const handleRegisterCreated = () => {
    toast({
      title: "Caisse créée",
      description: "La nouvelle caisse a été créée avec succès",
    });
  };

  const activeRegister = cashRegisters?.find(register => register.id === selectedRegister);

  if (registersLoading) {
    return (
      <AppLayout title="Gestion des caisses">
        <div className="flex items-center justify-center h-64">
          <p>Chargement des caisses...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Gestion des finances">
      <Tabs defaultValue="caisses" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="caisses">Caisses</TabsTrigger>
            <TabsTrigger value="expenses">Dépenses</TabsTrigger>
          </TabsList>
          <div className="space-x-2">
            <AddCashRegisterDialog onRegisterCreated={handleRegisterCreated} />
          </div>
        </div>

        <TabsContent value="caisses" className="space-y-4">
          <CashRegisterOverview />
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <ExpensesTab />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default CashRegisters;
