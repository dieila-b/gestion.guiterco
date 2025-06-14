
import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import CashRegisterOverview from '@/components/cash-register/CashRegisterOverview';
import TransactionDialog from '@/components/cash-register/TransactionDialog';
import TransactionsHistory from '@/components/cash-register/TransactionsHistory';
import AddCashRegisterDialog from '@/components/cash-register/AddCashRegisterDialog';
import { useCashRegisters } from '@/hooks/useCashRegisters';
import { useTransactions, useTodayTransactions } from '@/hooks/useTransactions';

const CashRegisters: React.FC = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [newTransactionOpen, setNewTransactionOpen] = useState(false);
  const [transactionType, setTransactionType] = useState('income');
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

  const handleOpenRegister = () => {
    toast({
      title: "Caisse ouverte",
      description: "La caisse a été ouverte avec un solde initial de 0.00€",
    });
  };

  const handleCloseRegister = () => {
    toast({
      title: "Caisse fermée",
      description: "La caisse a été fermée avec un solde final de 1250.00€",
    });
  };

  const handleAddTransaction = () => {
    setNewTransactionOpen(false);
    toast({
      title: "Transaction ajoutée",
      description: `Nouvelle ${transactionType === 'income' ? 'entrée' : 'dépense'} ajoutée à la caisse`,
    });
  };

  const handlePrint = () => {
    toast({
      title: "Impression",
      description: "Le rapport de caisse a été envoyé à l'impression",
    });
  };

  const handleRegisterCreated = () => {
    toast({
      title: "Caisse créée",
      description: "La nouvelle caisse a été créée avec succès",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
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
    <AppLayout title="Gestion des caisses">
      <Tabs defaultValue="overview" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
          <div className="space-x-2">
            <AddCashRegisterDialog onRegisterCreated={handleRegisterCreated} />
            <TransactionDialog
              open={newTransactionOpen}
              onOpenChange={setNewTransactionOpen}
              transactionType={transactionType}
              setTransactionType={setTransactionType}
              date={date}
              setDate={setDate}
              handleAddTransaction={handleAddTransaction}
            />
          </div>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <CashRegisterOverview 
            activeRegister={activeRegister}
            mockTransactions={transactions || []}
            handleOpenRegister={handleOpenRegister}
            handleCloseRegister={handleCloseRegister}
            handlePrint={handlePrint}
            formatCurrency={formatCurrency}
          />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <TransactionsHistory 
            transactions={transactions || []}
            date={date}
            setDate={setDate}
            formatCurrency={formatCurrency}
          />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default CashRegisters;
