
import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'react-router-dom';
import CashRegisterOverview from '@/components/cash-register/CashRegisterOverview';
import CompleteTransactionHistory from '@/components/cash-register/CompleteTransactionHistory';
import AddCashRegisterDialog from '@/components/cash-register/AddCashRegisterDialog';
import { useCashRegisters } from '@/hooks/useCashRegisters';
import { useTransactions, useTodayTransactions } from '@/hooks/useTransactions';
import ExpensesTab from '@/components/cash-register/ExpensesTab';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

const CashRegisters: React.FC = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [selectedRegister, setSelectedRegister] = useState<string | null>(null);
  
  // Récupérer les paramètres d'URL
  const tabParam = searchParams.get('tab');
  const subtabParam = searchParams.get('subtab');
  
  // État pour l'onglet actif
  const [activeTab, setActiveTab] = useState(tabParam || 'overview');
  const [activeSubTab, setActiveSubTab] = useState(subtabParam || 'daily');

  // Fetch data from Supabase
  const { data: cashRegisters, isLoading: registersLoading } = useCashRegisters();
  const { data: transactions, isLoading: transactionsLoading } = useTransactions();
  const { data: todayTransactions } = useTodayTransactions();

  // Set default selected register when data loads
  useEffect(() => {
    if (cashRegisters && cashRegisters.length > 0 && !selectedRegister) {
      setSelectedRegister(cashRegisters[0].id);
    }
  }, [cashRegisters, selectedRegister]);

  // Mettre à jour l'onglet actif depuis l'URL
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="expenses">Dépenses</TabsTrigger>
          </TabsList>
          <div className="space-x-2">
            <AddCashRegisterDialog onRegisterCreated={handleRegisterCreated} />
          </div>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="space-y-4">
            <TabsList>
              <PermissionGuard menu="Caisse" submenu="Aperçu du jour" action="read" fallback={null}>
                <TabsTrigger value="daily">Aperçu du jour</TabsTrigger>
              </PermissionGuard>
              <PermissionGuard menu="Caisse" submenu="Historique complet" action="read" fallback={null}>
                <TabsTrigger value="complete">Historique complet</TabsTrigger>
              </PermissionGuard>
            </TabsList>

            <TabsContent value="daily" className="space-y-4">
              <PermissionGuard menu="Caisse" submenu="Aperçu du jour" action="read">
                <CashRegisterOverview />
              </PermissionGuard>
            </TabsContent>

            <TabsContent value="complete" className="space-y-4">
              <PermissionGuard menu="Caisse" submenu="Historique complet" action="read">
                <CompleteTransactionHistory />
              </PermissionGuard>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <ExpensesTab initialSubTab={subtabParam} />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default CashRegisters;
