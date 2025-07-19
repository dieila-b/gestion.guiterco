
import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'react-router-dom';
import OptimizedCashRegisterOverview from '@/components/cash-register/OptimizedCashRegisterOverview';
import CompleteTransactionHistory from '@/components/cash-register/CompleteTransactionHistory';
import AddCashRegisterDialog from '@/components/cash-register/AddCashRegisterDialog';
import ExpensesTab from '@/components/cash-register/ExpensesTab';
import { OptimizedLoading } from '@/components/ui/optimized-loading';
import { DataProvider } from '@/providers/DataProvider';

const CashRegisters: React.FC = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  
  // Récupérer les paramètres d'URL
  const tabParam = searchParams.get('tab');
  const subtabParam = searchParams.get('subtab');
  
  // État pour l'onglet actif
  const [activeTab, setActiveTab] = useState(tabParam || 'overview');
  const [activeSubTab, setActiveSubTab] = useState(subtabParam || 'daily');

  // Mettre à jour l'onglet actif depuis l'URL
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (value: string) => {
    setLoading(true);
    setActiveTab(value);
    // Délai minimal pour éviter les flashs
    setTimeout(() => setLoading(false), 100);
  };

  const handleRegisterCreated = () => {
    toast({
      title: "Caisse créée",
      description: "La nouvelle caisse a été créée avec succès",
    });
  };

  return (
    <DataProvider>
      <AppLayout title="Gestion des finances">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
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
            {loading ? (
              <OptimizedLoading type="spinner" text="Chargement de l'aperçu..." />
            ) : (
              <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="space-y-4">
                <TabsList>
                  <TabsTrigger value="daily">Aperçu du jour</TabsTrigger>
                  <TabsTrigger value="complete">Historique complet</TabsTrigger>
                </TabsList>

                <TabsContent value="daily" className="space-y-4">
                  <OptimizedCashRegisterOverview />
                </TabsContent>

                <TabsContent value="complete" className="space-y-4">
                  <CompleteTransactionHistory />
                </TabsContent>
              </Tabs>
            )}
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            {loading ? (
              <OptimizedLoading type="spinner" text="Chargement des dépenses..." />
            ) : (
              <ExpensesTab initialSubTab={subtabParam} />
            )}
          </TabsContent>
        </Tabs>
      </AppLayout>
    </DataProvider>
  );
};

export default CashRegisters;
