
import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import CashRegisterOverview from '@/components/cash-register/CashRegisterOverview';
import TransactionDialog from '@/components/cash-register/TransactionDialog';
import TransactionsHistory from '@/components/cash-register/TransactionsHistory';
import ReportsTab from '@/components/cash-register/ReportsTab';
import AddCashRegisterDialog from '@/components/cash-register/AddCashRegisterDialog';
import { CashRegister, Transaction } from '@/components/cash-register/types';
import { fr } from 'date-fns/locale';

// Mock data
const mockCashRegisters: CashRegister[] = [
  { id: 1, name: 'Caisse principale', balance: 1250.0, status: 'open', lastUpdated: new Date() },
  { id: 2, name: 'Caisse secondaire', balance: 435.75, status: 'closed', lastUpdated: new Date(Date.now() - 86400000) },
];

const mockTransactions: Transaction[] = [
  { id: 1, type: 'income', description: 'Vente #F2023-089', amount: 125.50, date: new Date(), category: 'sales', paymentMethod: 'cash' },
  { id: 2, type: 'expense', description: 'Fournitures bureau', amount: 45.00, date: new Date(), category: 'supplies', paymentMethod: 'cash' },
  { id: 3, type: 'income', description: 'Vente #F2023-090', amount: 78.25, date: new Date(), category: 'sales', paymentMethod: 'card' },
  { id: 4, type: 'expense', description: 'Repas client', amount: 35.50, date: new Date(Date.now() - 86400000), category: 'entertainment', paymentMethod: 'cash' },
];

const CashRegisters: React.FC = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [newTransactionOpen, setNewTransactionOpen] = useState(false);
  const [transactionType, setTransactionType] = useState('income');
  const [selectedRegister, setSelectedRegister] = useState<number | null>(1);
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>(mockCashRegisters);

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

  const handleRegisterCreated = (data: { name: string; initialBalance: number }) => {
    // In a real app, you would call an API to create the register
    // For now, we'll just add it to our local state
    const newRegister: CashRegister = {
      id: cashRegisters.length + 1,
      name: data.name,
      balance: data.initialBalance,
      status: 'open',
      lastUpdated: new Date(),
    };
    
    setCashRegisters([...cashRegisters, newRegister]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const activeRegister = cashRegisters.find(register => register.id === selectedRegister);

  return (
    <AppLayout title="Gestion des caisses">
      <Tabs defaultValue="overview" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="reports">Rapports</TabsTrigger>
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
            mockTransactions={mockTransactions}
            handleOpenRegister={handleOpenRegister}
            handleCloseRegister={handleCloseRegister}
            handlePrint={handlePrint}
            formatCurrency={formatCurrency}
          />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <TransactionsHistory 
            transactions={mockTransactions}
            date={date}
            setDate={setDate}
            formatCurrency={formatCurrency}
          />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <ReportsTab />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default CashRegisters;
